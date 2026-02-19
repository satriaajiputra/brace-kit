import { build } from 'bun';
import { existsSync, mkdirSync, copyFileSync, renameSync, watch } from 'fs';
import { join } from 'path';
import tailwindPlugin from 'bun-plugin-tailwind';

const outDir = './dist';
const WS_PORT = 35729;

// --- WebSocket server untuk notifikasi hot reload ---
const clients = new Set<ServerWebSocket<unknown>>();

const wsServer = Bun.serve({
  port: WS_PORT,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response('Hot reload server', { status: 200 });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
    },
    close(ws) {
      clients.delete(ws);
    },
    message() {},
  },
});

console.log(`[dev] Hot reload server berjalan di ws://localhost:${WS_PORT}`);

// --- Fungsi build ---
async function runBuild(): Promise<boolean> {
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const result = await build({
    entrypoints: ['./src/index.tsx', './src/content.ts', './background.js'],
    outdir: outDir,
    format: 'esm',
    target: 'browser',
    minify: false,
    sourcemap: 'external',
    splitting: false,
    external: ['chrome', './mcp.js'],
    plugins: [tailwindPlugin],
  });

  if (!result.success) {
    console.error('[dev] Build gagal:');
    for (const log of result.logs) {
      console.error(log);
    }
    return false;
  }

  // Copy static files
  const filesToCopy: { from: string; to: string }[] = [
    { from: './public/sidebar.html', to: `${outDir}/sidebar.html` },
    { from: './manifest.json', to: `${outDir}/manifest.json` },
  ];

  const libDir = join(outDir, 'lib');
  if (!existsSync(libDir)) mkdirSync(libDir, { recursive: true });

  const libFiles = ['highlight.min.js', 'highlight-github-dark.min.css', 'turndown.js'];
  for (const file of libFiles) {
    const from = join('./lib', file);
    if (existsSync(from)) filesToCopy.push({ from, to: join(libDir, file) });
  }

  if (existsSync('./mcp.js')) {
    filesToCopy.push({ from: './mcp.js', to: join(outDir, 'mcp.js') });
  }

  const iconsDir = './icons';
  if (existsSync(iconsDir)) {
    const iconsOutDir = join(outDir, 'icons');
    if (!existsSync(iconsOutDir)) mkdirSync(iconsOutDir, { recursive: true });
    for (const file of ['icon16.png', 'icon48.png', 'icon128.png']) {
      const from = join(iconsDir, file);
      if (existsSync(from)) filesToCopy.push({ from, to: join(iconsOutDir, file) });
    }
  }

  for (const { from, to } of filesToCopy) {
    try {
      copyFileSync(from, to);
    } catch (e: unknown) {
      console.warn(`[dev] Gagal copy ${from}: ${(e as Error).message}`);
    }
  }

  // Flatten dist/src/* ke dist/
  const srcOutDir = join(outDir, 'src');
  if (existsSync(srcOutDir)) {
    for (const file of ['index.js', 'index.js.map', 'content.js', 'content.js.map', 'index.css']) {
      const from = join(srcOutDir, file);
      const to = join(outDir, file);
      if (existsSync(from)) renameSync(from, to);
    }
  }

  return true;
}

// --- Tulis file hot-reload.js ke dist/ ---
async function writeHotReloadClient() {
  const clientJs = `(function() {
  const ws = new WebSocket('ws://localhost:${WS_PORT}');
  ws.onmessage = function(e) {
    if (e.data === 'reload') {
      console.log('[hot-reload] Perubahan terdeteksi, memuat ulang...');
      location.reload();
    }
  };
  ws.onclose = function() {
    setTimeout(function() { location.reload(); }, 2000);
  };
})();
`;
  await Bun.write(join(outDir, 'hot-reload.js'), clientJs);
}

// --- Inject hot reload client ke sidebar.html ---
async function injectHotReloadScript() {
  const htmlPath = join(outDir, 'sidebar.html');
  if (!existsSync(htmlPath)) return;

  const html = await Bun.file(htmlPath).text();

  if (html.includes('hot-reload.js')) return; // sudah ada

  const injected = html.replace('</body>', `  <script src="hot-reload.js"></script>\n</body>`);
  await Bun.write(htmlPath, injected);
}

// --- Notifikasi semua client untuk reload ---
function notifyClients() {
  for (const client of clients) {
    try {
      client.send('reload');
    } catch {}
  }
}

// --- Debounce helper ---
function debounce(fn: () => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

// --- Build pertama ---
console.log('[dev] Membangun...');
const ok = await runBuild();
if (ok) {
  await writeHotReloadClient();
  await injectHotReloadScript();
  console.log('[dev] Build awal selesai. Memantau perubahan...\n');
} else {
  process.exit(1);
}

// --- Watch file changes ---
const debouncedRebuild = debounce(async () => {
  console.log('[dev] Perubahan terdeteksi, membangun ulang...');
  const success = await runBuild();
  if (success) {
    await writeHotReloadClient();
    await injectHotReloadScript();
    notifyClients();
    console.log('[dev] Rebuild selesai, sidebar akan reload otomatis.\n');
  }
}, 300);

const watchDirs = ['./src', './public', './background.js', './manifest.json', './mcp.js'];

for (const dir of watchDirs) {
  if (existsSync(dir)) {
    watch(dir, { recursive: true }, debouncedRebuild);
  }
}

console.log('[dev] Memantau perubahan di: src/, public/, background.js, manifest.json');
console.log('[dev] Muat extension dari folder dist/ dan aktifkan Developer Mode di Chrome.\n');

// Jaga proses tetap hidup
await new Promise(() => {});
