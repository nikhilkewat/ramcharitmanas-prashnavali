'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, History, Trash2, X } from 'lucide-react';
import {
  clearHistory,
  OPEN_READING_EVENT,
  readingHref,
  useHistory,
  type HistoryItem,
  type OpenReadingDetail,
} from '@/lib/history';

/** Header button that opens past readings in a side drawer. */
export default function HistoryMenu() {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    setConfirmClear(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openReading = (item: HistoryItem) => {
    const detail: OpenReadingDetail = { cell: item.cell, question: item.question ?? '' };
    close();
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent<OpenReadingDetail>(OPEN_READING_EVENT, { detail }));
    } else {
      router.push(readingHref(detail));
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`पिछले प्रश्न · Past readings${history.length ? ` (${history.length})` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/10 text-amber-100 ring-1 ring-white/15 hover:bg-white/20 transition-colors"
      >
        <History size={18} />
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-amber-400 text-[#3a1606] text-[10px] font-bold leading-4.5 text-center">
            {history.length}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="history-title">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] animate-fade-in" onClick={close} />
            <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-line shadow-2xl flex flex-col animate-slide-in-right">
              <div className="flex items-center justify-between px-4 h-14 border-b border-line">
                <h2 id="history-title" className="flex items-center gap-2 text-ink font-semibold">
                  <History size={18} className="text-accent" /> पिछले प्रश्न
                  <span className="text-ink-3 text-sm font-normal">· Past readings</span>
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="बंद करें · Close"
                  className="p-2 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2"
                >
                  <X size={18} />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-ink-3">
                  <History size={36} className="mb-3 opacity-50" />
                  <p className="text-sm text-ink-2">अभी कोई प्रश्न नहीं पूछा गया</p>
                  <p className="text-xs mt-1">Your readings will appear here</p>
                </div>
              ) : (
                <>
                  <ul className="flex-1 overflow-y-auto p-3 space-y-2">
                    {history.map((item) => (
                      <li key={`${item.cell}-${item.timestamp}`}>
                        <button
                          type="button"
                          onClick={() => openReading(item)}
                          className="group w-full text-left bg-surface-2 border border-line rounded-lg p-3 hover:border-line-strong hover:bg-surface-3 transition-colors flex items-center gap-2"
                        >
                          <span className="flex-1 min-w-0">
                            {item.question && (
                              <span className="block text-xs text-ink-3 mb-1 truncate">{item.question}</span>
                            )}
                            <span className="block font-display text-[15px] text-ink truncate">{item.chaupaiHindi}</span>
                            <span className="block text-[11px] text-ink-3 mt-1">
                              {item.result} · {new Date(item.timestamp).toLocaleDateString('hi-IN')}
                            </span>
                          </span>
                          <ChevronRight size={16} className="shrink-0 text-ink-3 group-hover:text-ink" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 border-t border-line">
                    {confirmClear ? (
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-ink-2">सारा इतिहास मिटाएं?</span>
                        <button
                          type="button"
                          onClick={() => setConfirmClear(false)}
                          className="px-3 py-2 rounded-lg text-sm text-ink-2 hover:bg-surface-2"
                        >
                          रद्द करें
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clearHistory();
                            setConfirmClear(false);
                          }}
                          className="px-3 py-2 rounded-lg text-sm font-medium tone-ashubh text-white hover:brightness-110"
                        >
                          हाँ, मिटाएं
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmClear(true)}
                        title="Clear history"
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-3 hover:text-ink hover:bg-surface-2"
                      >
                        <Trash2 size={15} /> इतिहास मिटाएं
                      </button>
                    )}
                  </div>
                </>
              )}
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
