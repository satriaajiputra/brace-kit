import { useEffect, useState } from 'react';
import { useStore } from '../store/index.ts';
import { getAllImages } from '../utils/imageDB.ts';
import type { StoredImageRecord } from '../types/index.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface MarkdownImage {
  type: 'url';
  url: string;
  conversationId: string;
  createdAt: number;
}

type GalleryItem = StoredImageRecord | MarkdownImage;

function isMarkdownImage(item: GalleryItem): item is MarkdownImage {
  return (item as MarkdownImage).type === 'url';
}

const MD_IMAGE_REGEX = /!\[.*?\]\((https?:\/\/[^)\s]+)\)/g;

async function getMarkdownImages(conversations: { id: string; updatedAt: number }[]): Promise<MarkdownImage[]> {
  const results: MarkdownImage[] = [];
  const seen = new Set<string>();

  for (const conv of conversations) {
    try {
      const data = await chrome.storage.local.get(`conv_${conv.id}`);
      const messages: { role: string; content: string }[] = data[`conv_${conv.id}`] || [];

      for (const msg of messages) {
        if (!msg.content) continue;
        let match: RegExpExecArray | null;
        MD_IMAGE_REGEX.lastIndex = 0;
        while ((match = MD_IMAGE_REGEX.exec(msg.content)) !== null) {
          const url = match[1];
          const key = `${conv.id}::${url}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ type: 'url', url, conversationId: conv.id, createdAt: conv.updatedAt });
          }
        }
      }
    } catch {
      // skip conversation jika gagal dimuat
    }
  }

  return results;
}

export function GalleryView() {
  const store = useStore();
  const [images, setImages] = useState<StoredImageRecord[]>([]);
  const [markdownImages, setMarkdownImages] = useState<MarkdownImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    Promise.all([
      getAllImages(),
      getMarkdownImages(store.conversations),
    ]).then(([imgs, mdImgs]) => {
      setImages(imgs);
      setMarkdownImages(mdImgs);
      setLoading(false);
    });
  }, []);

  function getConvTitle(conversationId: string): string {
    const conv = store.conversations.find((c) => c.id === conversationId);
    return conv?.title || 'Conversation';
  }

  function handleDownload(item: GalleryItem) {
    if (isMarkdownImage(item)) {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.url.split('/').pop() || 'image';
      link.target = '_blank';
      link.click();
      return;
    }
    const ext = item.mimeType.split('/')[1] || 'png';
    const link = document.createElement('a');
    link.href = `data:${item.mimeType};base64,${item.data}`;
    link.download = `generated-${item.key}.${ext}`;
    link.click();
  }

  async function handleCopy(item: GalleryItem) {
    if (isMarkdownImage(item)) {
      await navigator.clipboard.writeText(item.url);
      return;
    }
    try {
      const res = await fetch(`data:${item.mimeType};base64,${item.data}`);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [item.mimeType]: blob })]);
    } catch {
      await navigator.clipboard.writeText(`data:${item.mimeType};base64,${item.data}`);
    }
  }

  async function handleJumpToConversation(conversationId: string) {
    setLightbox(null);
    await store.switchConversation(conversationId);
    store.setView('chat');
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
        <button
          className="flex items-center gap-1.5 bg-transparent border-none text-[var(--text-secondary)] cursor-pointer text-[0.8125rem] px-2 py-1 transition-colors duration-150 hover:text-[var(--text-primary)]"
          onClick={() => store.setView('chat')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">Gallery</span>
          {!loading && (
            <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-active)] px-2 py-0.5">
              {images.length + markdownImages.length} gambar
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[var(--bg-active)] scrollbar-track-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-[var(--text-tertiary)]">
            <div className="opacity-40">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p className="text-[0.9375rem] text-[var(--text-secondary)] font-medium">Memuat gambar...</p>
          </div>
        ) : images.length === 0 && markdownImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-[var(--text-tertiary)]">
            <div className="opacity-40">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p className="text-[0.9375rem] text-[var(--text-secondary)] font-medium">Belum ada gambar yang dihasilkan</p>
            <span className="text-[0.8125rem] text-[var(--text-tertiary)] max-w-[240px]">
              Mulai conversation dan generate gambar untuk melihatnya di sini
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {images.map((img) => (
              <div
                key={img.key}
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden cursor-pointer transition-all duration-150 hover:border-[var(--border-active)]"
                onClick={() => setLightbox(img)}
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--bg-tertiary)]">
                  <img
                    src={`data:${img.mimeType};base64,${img.data}`}
                    alt="Generated image"
                    className="w-full h-full object-cover block"
                  />
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5 opacity-0 transition-opacity duration-150 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center justify-center w-7 h-7 bg-white/12 border border-white/15 text-[var(--text-primary)] cursor-pointer transition-colors duration-150 hover:bg-white/[0.22]"
                      title="Lihat"
                      onClick={() => setLightbox(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button
                      className="flex items-center justify-center w-7 h-7 bg-white/12 border border-white/15 text-[var(--text-primary)] cursor-pointer transition-colors duration-150 hover:bg-white/[0.22]"
                      title="Download"
                      onClick={() => handleDownload(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button
                      className="flex items-center justify-center w-7 h-7 bg-white/12 border border-white/15 text-[var(--text-primary)] cursor-pointer transition-colors duration-150 hover:bg-white/[0.22]"
                      title="Salin"
                      onClick={() => handleCopy(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="px-2 py-1.5 flex flex-col gap-0.5">
                  <span className="text-[0.6875rem] text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                    {getConvTitle(img.conversationId)}
                  </span>
                  <span className="text-[0.625rem] text-[var(--text-tertiary)]">{formatDate(img.createdAt)}</span>
                </div>
              </div>
            ))}
            {markdownImages.map((img) => (
              <div
                key={`${img.conversationId}::${img.url}`}
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden cursor-pointer transition-all duration-150 hover:border-[var(--border-active)]"
                onClick={() => setLightbox(img)}
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--bg-tertiary)]">
                  <img
                    src={img.url}
                    alt="Image from conversation"
                    className="w-full h-full object-cover block"
                    crossOrigin="anonymous"
                  />
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5 opacity-0 transition-opacity duration-150 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center justify-center w-7 h-7 bg-white/12 border border-white/15 text-[var(--text-primary)] cursor-pointer transition-colors duration-150 hover:bg-white/[0.22]"
                      title="Lihat"
                      onClick={() => setLightbox(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button
                      className="flex items-center justify-center w-7 h-7 bg-white/12 border border-white/15 text-[var(--text-primary)] cursor-pointer transition-colors duration-150 hover:bg-white/[0.22]"
                      title="Download"
                      onClick={() => handleDownload(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button
                      className="flex items-center justify-center w-7 h-7 bg-white/12 border border-white/15 text-[var(--text-primary)] cursor-pointer transition-colors duration-150 hover:bg-white/[0.22]"
                      title="Salin URL"
                      onClick={() => handleCopy(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="px-2 py-1.5 flex flex-col gap-0.5">
                  <span className="text-[0.6875rem] text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                    {getConvTitle(img.conversationId)}
                  </span>
                  <span className="text-[0.625rem] text-[var(--text-tertiary)]">{formatDate(img.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/85 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative bg-[var(--bg-secondary)] border border-[var(--border-subtle)] max-w-full max-h-full flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 border border-[var(--border-subtle)] text-[var(--text-secondary)] cursor-pointer z-[1] transition-colors duration-150 hover:text-[var(--text-primary)]"
              onClick={() => setLightbox(null)}
            >
              <CloseIcon size={18} />
            </button>
            <img
              src={isMarkdownImage(lightbox) ? lightbox.url : `data:${lightbox.mimeType};base64,${lightbox.data}`}
              alt="Generated image"
              className="max-w-[min(600px,calc(100vw-32px))] max-h-[calc(100vh-160px)] object-contain block"
            />
            <div className="px-4 py-3 border-t border-[var(--border-subtle)] flex items-center gap-3 flex-wrap">
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="text-[0.8125rem] font-semibold text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                  {getConvTitle(lightbox.conversationId)}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">{formatDate(lightbox.createdAt)}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  className="flex items-center gap-1.25 px-2.5 py-1.25 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs cursor-pointer transition-all duration-150 hover:text-[var(--text-primary)] hover:border-[var(--border-active)]"
                  onClick={() => handleDownload(lightbox)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </button>
                <button
                  className="flex items-center gap-1.25 px-2.5 py-1.25 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs cursor-pointer transition-all duration-150 hover:text-[var(--text-primary)] hover:border-[var(--border-active)]"
                  onClick={() => handleCopy(lightbox)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Salin
                </button>
                <button
                  className="flex items-center gap-1.25 px-2.5 py-1.25 bg-[rgba(129,140,248,0.1)] border border-[rgba(129,140,248,0.3)] text-[var(--accent-primary)] text-xs cursor-pointer transition-all duration-150 hover:bg-[rgba(129,140,248,0.2)] hover:border-[var(--accent-primary)]"
                  onClick={() => handleJumpToConversation(lightbox.conversationId)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Buka Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
