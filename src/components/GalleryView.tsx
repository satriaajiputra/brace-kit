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
    <div className="gallery-view">
      <div className="gallery-header">
        <button className="gallery-back-btn" onClick={() => store.setView('chat')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali
        </button>
        <div className="gallery-header-center">
          <span className="gallery-title">Gallery</span>
          {!loading && (
            <span className="gallery-count">{images.length + markdownImages.length} gambar</span>
          )}
        </div>
      </div>

      <div className="gallery-content">
        {loading ? (
          <div className="gallery-empty">
            <div className="gallery-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p>Memuat gambar...</p>
          </div>
        ) : images.length === 0 && markdownImages.length === 0 ? (
          <div className="gallery-empty">
            <div className="gallery-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p>Belum ada gambar yang dihasilkan</p>
            <span>Mulai conversation dan generate gambar untuk melihatnya di sini</span>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((img) => (
              <div key={img.key} className="gallery-card" onClick={() => setLightbox(img)}>
                <div className="gallery-card-img-wrap">
                  <img
                    src={`data:${img.mimeType};base64,${img.data}`}
                    alt="Generated image"
                    className="gallery-card-img"
                  />
                  <div className="gallery-card-overlay" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="gallery-action-btn"
                      title="Lihat"
                      onClick={() => setLightbox(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button
                      className="gallery-action-btn"
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
                      className="gallery-action-btn"
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
                <div className="gallery-card-info">
                  <span className="gallery-card-conv">{getConvTitle(img.conversationId)}</span>
                  <span className="gallery-card-date">{formatDate(img.createdAt)}</span>
                </div>
              </div>
            ))}
            {markdownImages.map((img) => (
              <div key={`${img.conversationId}::${img.url}`} className="gallery-card" onClick={() => setLightbox(img)}>
                <div className="gallery-card-img-wrap">
                  <img
                    src={img.url}
                    alt="Image from conversation"
                    className="gallery-card-img"
                    crossOrigin="anonymous"
                  />
                  <div className="gallery-card-overlay" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="gallery-action-btn"
                      title="Lihat"
                      onClick={() => setLightbox(img)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button
                      className="gallery-action-btn"
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
                      className="gallery-action-btn"
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
                <div className="gallery-card-info">
                  <span className="gallery-card-conv">{getConvTitle(img.conversationId)}</span>
                  <span className="gallery-card-date">{formatDate(img.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <div className="gallery-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-lightbox-close" onClick={() => setLightbox(null)}>
              <CloseIcon size={18} />
            </button>
            <img
              src={isMarkdownImage(lightbox) ? lightbox.url : `data:${lightbox.mimeType};base64,${lightbox.data}`}
              alt="Generated image"
              className="gallery-lightbox-img"
            />
            <div className="gallery-lightbox-meta">
              <div className="gallery-lightbox-info">
                <span className="gallery-lightbox-conv">{getConvTitle(lightbox.conversationId)}</span>
                <span className="gallery-lightbox-date">{formatDate(lightbox.createdAt)}</span>
              </div>
              <div className="gallery-lightbox-actions">
                <button
                  className="gallery-lightbox-btn"
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
                  className="gallery-lightbox-btn"
                  onClick={() => handleCopy(lightbox)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Salin
                </button>
                <button
                  className="gallery-lightbox-btn gallery-lightbox-btn-primary"
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
