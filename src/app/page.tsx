'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import PrashnavaliGrid from '@/components/PrashnavaliGrid';
import ChaupaiCard from '@/components/ChaupaiCard';
import QuestionBox from '@/components/QuestionBox';
import { generatePrashnavaliResult, PrashnavaliResult } from '@/lib/prashnavali';
import { generateResultImage, downloadImage } from '@/lib/generateImage';
import { GRID_SIZE, TOTAL_CELLS } from '@/data/grid';
import { saveHistory, useHistory } from '@/lib/history';
import { isSpeechSupported, speakChaupai } from '@/lib/speech';
import { WhatsAppIcon } from '@/components/icons';
import {
  CalendarDays, Check, ImageDown, Link2, Loader2, Printer,
  RotateCcw, Volume2, VolumeX, type LucideIcon,
} from 'lucide-react';

const REVEAL_DELAY = 120;

const noopSubscribe = () => () => {};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function Home() {
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [result, setResult] = useState<PrashnavaliResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedCells, setRevealedCells] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const history = useHistory();

  const resultRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  // Pending start of a reading ("Ask for Me" delay, shared-link autoplay).
  const startRef = useRef<NodeJS.Timeout | null>(null);
  const [isRandom, setIsRandom] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  // Bumped on every start/stop so a late async voice load can't restart speech.
  const speechRun = useRef(0);
  const canSpeak = useSyncExternalStore(noopSubscribe, isSpeechSupported, () => false);
  const [isDownloading, setIsDownloading] = useState(false);

  // All inputs are passed explicitly so the timer callbacks never read stale state.
  const animateReveal = useCallback((prashResult: PrashnavaliResult, askedQuestion: string) => {
    if (animationRef.current) clearTimeout(animationRef.current);
    const cells = prashResult.highlightedCells;
    setIsAnimating(true);
    setRevealedCells([]);
    setShowResult(false);
    let i = 0;

    const tick = () => {
      if (i < cells.length) {
        const cellIndex = cells[i];
        i++;
        setRevealedCells((prev) => [...prev, cellIndex]);
        animationRef.current = setTimeout(tick, REVEAL_DELAY);
      } else {
        setIsAnimating(false);
        setShowResult(true);
        setResult(prashResult);
        saveHistory({
          cell: prashResult.selectedPosition,
          question: askedQuestion,
          chaupaiHindi: prashResult.chaupai.hindi,
          chaupaiMeaning: prashResult.chaupai.meaning,
          result: prashResult.chaupai.resultLabelEn,
          timestamp: Date.now(),
        });
      }
    };

    animationRef.current = setTimeout(tick, REVEAL_DELAY);
  }, []);

  const runPrashna = useCallback((row: number, col: number, askedQuestion: string) => {
    const q = askedQuestion.trim();
    setIsRandom(false);
    setQuestion(q);
    setPendingQuestion(q);
    const prashResult = generatePrashnavaliResult(row, col);
    animateReveal(prashResult, q);

    const params = new URLSearchParams(window.location.search);
    params.set('cell', String(prashResult.selectedPosition));
    if (q) params.set('q', q);
    else params.delete('q');
    router.replace('?' + params.toString(), { scroll: false });
  }, [animateReveal, router]);

  const handleLetterSelect = (row: number, col: number) => {
    if (isAnimating) return;
    runPrashna(row, col, pendingQuestion);
  };

  const handleReset = () => {
    if (animationRef.current) clearTimeout(animationRef.current);
    if (startRef.current) clearTimeout(startRef.current);
    speechRun.current++;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setResult(null);
    setRevealedCells([]);
    setShowResult(false);
    setIsAnimating(false);
    setIsRandom(false);
    setQuestion('');
    setPendingQuestion('');
    setCopied(false);
    router.replace('/', { scroll: false });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const shareData = { title: 'Ram Prashnavali', text: question || 'My Ram Prashnavali result', url };
      if (navigator.share) {
        navigator.share(shareData);
      }
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = result
      ? `${result.chaupai.hindi}\n\n${result.chaupai.meaning}\n\n${url}`
      : `Ram Prashnavali - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRandomAsk = () => {
    if (isAnimating || isRandom) return;
    const q = pendingQuestion;
    setIsRandom(true);
    const randomPos = Math.floor(Math.random() * TOTAL_CELLS);
    const row = Math.floor(randomPos / GRID_SIZE);
    const col = randomPos % GRID_SIZE;
    if (startRef.current) clearTimeout(startRef.current);
    startRef.current = setTimeout(() => {
      startRef.current = null;
      runPrashna(row, col, q);
    }, 1500);
  };

  const handleSpeak = async () => {
    const run = ++speechRun.current;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!result) return;
    setIsSpeaking(true);
    const ok = await speakChaupai({
      hindi: result.chaupai.hindi,
      transliteration: result.chaupai.transliteration,
      onEnd: () => {
        if (speechRun.current === run) setIsSpeaking(false);
      },
      isCancelled: () => speechRun.current !== run,
    });
    if (!ok && speechRun.current === run) {
      setIsSpeaking(false);
      setNoVoice(true);
      setTimeout(() => setNoVoice(false), 2500);
    }
  };

  const handleDownloadImage = async () => {
    if (!result || isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await generateResultImage(result.chaupai, question);
      downloadImage(blob, 'ram-prashnavali-result.png');
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const c = result.chaupai;
    const e = escapeHtml;
    const badgeClass = c.result === 'शुभ' ? 'auspicious' : c.result === 'अशुभ' ? 'caution' : 'neutral';
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Ram Prashnavali</title>
<style>
  body { font-family: Georgia, serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #4a1a00; }
  .header { text-align: center; border-bottom: 2px solid #e67e22; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 24px; margin: 0; color: #b45309; }
  .header p { font-size: 14px; color: #92400e; margin-top: 4px; }
  .chaupai { background: #fef3c7; border-left: 4px solid #e67e22; padding: 20px; margin: 20px 0; border-radius: 8px; }
  .chaupai .hindi { font-size: 20px; line-height: 1.8; text-align: center; }
  .chaupai .meaning { font-size: 14px; margin-top: 16px; color: #6b4e17; text-align: center; font-style: italic; }
  .details { margin: 20px 0; }
  .details h3 { color: #b45309; font-size: 14px; margin: 12px 0 4px; }
  .details p { font-size: 13px; color: #78350f; margin: 0; }
  .result-badge { text-align: center; margin: 16px 0; }
  .result-badge span { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
  .auspicious { background: #d1fae5; color: #065f46; }
  .caution { background: #fef3c7; color: #92400e; }
  .neutral { background: #e0e7ff; color: #3730a3; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e67e22; font-size: 12px; color: #92400e; }
</style></head><body>
<div class="header">
  <h1>॥ श्री राम प्रश्नावली ॥</h1>
  <p>Ram Prashnavali — Shri Ram Shalaka</p>
</div>
<div class="result-badge"><span class="${badgeClass}">${e(c.resultLabel)} · ${e(c.resultLabelEn)}</span></div>
${question ? `<p style="text-align:center;font-size:13px;color:#6b4e17;margin:16px 0;">"${e(question)}"</p>` : ''}
<div class="chaupai">
  <div class="hindi">${e(c.hindi)}</div>
  <div class="meaning">${e(c.meaning)}</div>
</div>
<div class="details">
  <h3>Episode · कथा</h3><p>${e(c.episodeHi)} — ${e(c.episode)}</p>
  <h3>Kand · काण्ड</h3><p>${e(c.kandHi)} (${e(c.kand)})</p>
  <h3>Lesson · शिक्षा</h3><p>${e(c.lesson)}</p>
  <h3>Guidance · निष्कर्ष</h3><p>${e(c.inference)}</p>
</div>
<div class="footer">
  <p>श्रीरामचरितमानस · गोस्वामी तुलसीदास</p>
  <p>ramcharitmanas.vercel.app</p>
</div>
</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cellParam = params.get('cell');
    const qParam = params.get('q');
    if (cellParam !== null) {
      const cellIndex = parseInt(cellParam, 10);
      if (!isNaN(cellIndex) && cellIndex >= 0 && cellIndex < 225) {
        const row = Math.floor(cellIndex / 15);
        const col = cellIndex % 15;
        startRef.current = setTimeout(() => {
          startRef.current = null;
          runPrashna(row, col, qParam ?? '');
        }, 300);
      }
    }
    // Stop pending timers and speech when leaving the page.
    return () => {
      if (startRef.current) clearTimeout(startRef.current);
      if (animationRef.current) clearTimeout(animationRef.current);
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }
  }, [showResult]);

  type Action = {
    key: string;
    label: string;
    Icon: LucideIcon | typeof WhatsAppIcon;
    variant: 'primary' | 'neutral' | 'active' | 'whatsapp';
    disabled?: boolean;
    spin?: boolean;
  };

  const actions: Action[] = result ? [
    { key: 'reset', label: 'पुनः प्रश्न', Icon: RotateCcw, variant: 'primary' },
    ...(canSpeak ? [{
      key: 'speak',
      label: noVoice ? 'आवाज़ उपलब्ध नहीं' : isSpeaking ? 'बंद करें' : 'सुनें',
      Icon: isSpeaking || noVoice ? VolumeX : Volume2,
      variant: isSpeaking ? 'active' : 'neutral',
      disabled: noVoice,
    } satisfies Action] : []),
    { key: 'print', label: 'प्रिंट', Icon: Printer, variant: 'neutral' },
    {
      key: 'image', label: isDownloading ? 'बना रहे हैं...' : 'फ़ोटो डाउनलोड', Icon: isDownloading ? Loader2 : ImageDown,
      variant: 'neutral', disabled: isDownloading, spin: isDownloading,
    },
    { key: 'copy', label: copied ? 'कॉपी हो गया!' : 'लिंक कॉपी', Icon: copied ? Check : Link2, variant: 'neutral' },
    { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, variant: 'whatsapp' },
  ] : [];

  const handleAction = (key: string) => {
    switch (key) {
      case 'reset': return handleReset();
      case 'speak': return handleSpeak();
      case 'print': return handlePrint();
      case 'image': return handleDownloadImage();
      case 'copy': return handleShare();
      case 'whatsapp': return handleWhatsAppShare();
    }
  };

  const variantClass: Record<Action['variant'], string> = {
    primary: 'bg-accent text-on-accent hover:bg-accent-hover shadow-md',
    active: 'bg-accent text-on-accent hover:bg-accent-hover',
    neutral: 'bg-surface border border-line-strong text-ink-2 hover:bg-surface-2 hover:text-ink shadow-sm',
    whatsapp: 'bg-[#1f7a4d] text-white hover:bg-[#19663f] shadow-sm',
  };

  return (
    <div className="min-h-screen pattern-bg">
      <Header />

      <main className="mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Question — only before a reading */}
        {!result && !isAnimating && !showResult && (
          <QuestionBox
            value={pendingQuestion}
            onChange={setPendingQuestion}
            onAskForMe={handleRandomAsk}
            disabled={isRandom}
          />
        )}

        {/* Main content: Grid + Result side by side */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Grid */}
          <div className={`${showResult ? 'lg:w-[45%] lg:shrink-0' : 'w-full'} transition-all duration-500 relative`}>
            <PrashnavaliGrid
              onLetterSelect={handleLetterSelect}
              revealedCells={revealedCells}
              selectedCell={result?.selectedPosition}
              disabled={isAnimating || isRandom}
            />

            {/* Random Ask dramatic overlay */}
            {isRandom && !isAnimating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={48} className="text-amber-200 animate-spin" />
                  <p className="text-white font-bold text-lg animate-pulse">भगवान से पूछ रहे हैं...</p>
                  <p className="text-amber-100/80 text-xs">Asking the Lord...</p>
                </div>
              </div>
            )}

            {/* Animation status */}
            {isAnimating && (
              <div className="text-center py-4 animate-fade-in">
                <div className="inline-flex flex-col items-center gap-2">
                  <Loader2 size={28} className="text-accent animate-spin" />
                  <span className="text-ink-2 font-medium text-xs">
                    {revealedCells.length} / 25
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Right: Result */}
          {showResult && result && !isAnimating && (
            <div ref={resultRef} className="lg:flex-1 min-w-0 animate-slide-up">
              {question && (
                <div className="card-premium rounded-xl p-4 mb-4 border-l-4 border-accent">
                  <p className="text-[11px] text-ink-3 tracking-wider uppercase font-medium">Your Question</p>
                  <p className="text-sm font-medium text-ink mt-1">{question}</p>
                </div>
              )}
              <ChaupaiCard
                chaupai={result.chaupai}
                selectedLetter={result.selectedLetter}
                letterSequence={result.letterSequence}
              />
            </div>
          )}

          {/* Right sidebar: Action icons (desktop) */}
          {showResult && !isAnimating && (
            // Fixed-size buttons in a fixed-width column; the label floats as a
            // tooltip so hovering or changing a label never reflows the layout.
            <div className="hidden lg:flex flex-col gap-2 w-10 shrink-0 pt-4 animate-fade-in">
              {actions.map(({ key, label, Icon, variant, disabled, spin }) => (
                <button
                  key={key}
                  onClick={() => handleAction(key)}
                  disabled={disabled}
                  aria-label={label}
                  className={`group relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 disabled:opacity-60 ${variantClass[variant]}`}
                >
                  <Icon size={18} className={spin ? 'animate-spin' : ''} />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink text-surface px-2.5 py-1.5 text-xs font-medium shadow-lg opacity-0 translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons — mobile (horizontal) */}
        {showResult && !isAnimating && (
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 mt-6 animate-fade-in">
            {actions.map(({ key, label, Icon, variant, disabled, spin }) => (
              <button
                key={key}
                onClick={() => handleAction(key)}
                disabled={disabled}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-60 ${variantClass[variant]}`}
              >
                <Icon size={16} className={spin ? 'animate-spin' : ''} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* History */}
        {history.length > 0 && !result && !isAnimating && (
          <div className="mt-12 animate-fade-in">
            <div className="divider-traditional text-ink-3 mb-4">।।</div>
            <h3 className="text-lg font-bold text-ink text-center mb-4">
              पिछले प्रश्न · Past Queries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  className="card-premium rounded-xl p-4 cursor-pointer hover:border-line-strong hover:-translate-y-0.5 transition-all"
                  onClick={() => {
                    if (isAnimating) return;
                    const row = Math.floor(item.cell / GRID_SIZE);
                    const col = item.cell % GRID_SIZE;
                    runPrashna(row, col, item.question || '');
                  }}
                >
                  {item.question && (
                    <p className="text-xs text-ink-3 mb-1 truncate">{item.question}</p>
                  )}
                  <p className="text-sm font-medium text-ink truncate">{item.chaupaiHindi}</p>
                  <p className="text-[11px] text-ink-3 mt-1">{item.result} · {new Date(item.timestamp).toLocaleDateString('hi-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 py-6">
          <div className="divider-traditional text-gold mb-3">◆</div>
          <p className="text-ink-2 text-sm">
            <Link href="/daily" className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-accent transition-colors">
              <CalendarDays size={16} /> आज की प्रश्नावली देखें
            </Link>
          </p>
          <p className="text-ink-2 text-sm mt-2">श्रीरामचरितमानस · गोस्वामी तुलसीदास</p>
          <p className="text-ink-3 text-xs mt-1">Shri Ramcharitmanas · Goswami Tulsidas</p>
        </footer>
      </main>

    </div>
  );
}
