'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PrashnavaliGrid from '@/components/PrashnavaliGrid';
import ChaupaiCard from '@/components/ChaupaiCard';
import { generatePrashnavaliResult, PrashnavaliResult } from '@/lib/prashnavali';
import { generateResultImage, downloadImage } from '@/lib/generateImage';
import { GRID_SIZE, TOTAL_CELLS } from '@/data/grid';

const REVEAL_DELAY = 120;
const HISTORY_KEY = 'ram-prashnavali-history';
const MAX_HISTORY = 20;

interface HistoryItem {
  cell: number;
  question: string;
  chaupaiHindi: string;
  chaupaiMeaning: string;
  result: string;
  timestamp: number;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(item: HistoryItem) {
  const history = loadHistory();
  history.unshift(item);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
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
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const resultRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const [isRandom, setIsRandom] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const animateReveal = useCallback((cells: number[], prashResult: PrashnavaliResult) => {
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
        const cellParam = new URLSearchParams(window.location.search).get('cell');
        const cellIndex = cellParam ? parseInt(cellParam, 10) : -1;
        saveHistory({
          cell: cellIndex !== -1 ? cellIndex : 0,
          question: question,
          chaupaiHindi: prashResult.chaupai.hindi,
          chaupaiMeaning: prashResult.chaupai.meaning,
          result: prashResult.chaupai.resultLabelEn,
          timestamp: Date.now(),
        });
        setHistory(loadHistory());
      }
    };

    animationRef.current = setTimeout(tick, REVEAL_DELAY);
  }, []);

  const handleLetterSelect = (row: number, col: number) => {
    if (isAnimating) return;
    setQuestion(pendingQuestion);
    const prashResult = generatePrashnavaliResult(row, col);
    animateReveal(prashResult.highlightedCells, prashResult);

    const params = new URLSearchParams(window.location.search);
    params.set('cell', String(prashResult.selectedPosition));
    if (pendingQuestion.trim()) params.set('q', pendingQuestion.trim());
    router.replace('?' + params.toString(), { scroll: false });
  };

  const handleReset = () => {
    if (animationRef.current) clearTimeout(animationRef.current);
    window.speechSynthesis.cancel();
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
    if (isAnimating) return;
    setQuestion('');
    setPendingQuestion('');
    setIsRandom(true);
    setShowPanel(false);
    const randomPos = Math.floor(Math.random() * TOTAL_CELLS);
    const row = Math.floor(randomPos / GRID_SIZE);
    const col = randomPos % GRID_SIZE;
    setTimeout(() => {
      handleLetterSelect(row, col);
    }, 1500);
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
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
    const printWindow = window.open('', '_blank');
    if (!printWindow || !result) return;
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
  <h1>🙏 श्री राम प्रश्नावली</h1>
  <p>Ram Prashnavali — Shri Ram Shalaka</p>
</div>
<div class="result-badge"><span class="${result.chaupai.resultLabelEn.includes('Auspicious') ? 'auspicious' : result.chaupai.resultLabelEn.includes('Caution') ? 'caution' : 'neutral'}">${result.chaupai.resultLabel} · ${result.chaupai.resultLabelEn}</span></div>
${question ? `<p style="text-align:center;font-size:13px;color:#6b4e17;margin:16px 0;">"${question}"</p>` : ''}
<div class="chaupai">
  <div class="hindi">${result.chaupai.hindi}</div>
  <div class="meaning">${result.chaupai.meaning}</div>
</div>
<div class="details">
  <h3>📖 Episode</h3><p>${result.chaupai.episodeHi} — ${result.chaupai.episode}</p>
  <h3>📚 Kand</h3><p>${result.chaupai.kandHi} (${result.chaupai.kand})</p>
  <h3>🎓 Lesson</h3><p>${result.chaupai.lesson}</p>
  <h3>💡 Inference</h3><p>${result.chaupai.inference}</p>
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
    setHistory(loadHistory());
    const params = new URLSearchParams(window.location.search);
    const cellParam = params.get('cell');
    const qParam = params.get('q');
    if (cellParam !== null) {
      const cellIndex = parseInt(cellParam, 10);
      if (!isNaN(cellIndex) && cellIndex >= 0 && cellIndex < 225) {
        const row = Math.floor(cellIndex / 15);
        const col = cellIndex % 15;
        if (qParam) setPendingQuestion(qParam);
        setTimeout(() => handleLetterSelect(row, col), 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }
  }, [showResult]);

  return (
    <div className="min-h-screen pattern-bg">
      <Header />

      <main className=" mx-auto px-4 py-6 sm:py-8">
        {/* Instruction bar - only before first selection */}
        {!result && !isAnimating && !showResult && (
          <div className="card-premium rounded-md p-4 sm:p-5 mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-sm text-saffron-700">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-saffron-500 text-white rounded-sm flex items-center justify-center text-xs font-bold">१</span>
                शांत मन से प्रश्न स्मरण करें
              </span>
              <span className="hidden sm:inline text-saffron-300">·</span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-saffron-500 text-white rounded-sm flex items-center justify-center text-xs font-bold">२</span>
                ग्रिड में अक्षर चुनें
              </span>
              <span className="hidden sm:inline text-saffron-300">·</span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-saffron-500 text-white rounded-sm flex items-center justify-center text-xs font-bold">३</span>
                चौपाई पढ़ें, उत्तर पाएं
              </span>
            </div>
          </div>
        )}


        {/* Main content: Grid + Result side by side */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Grid */}
          <div className={`${showResult ? 'lg:w-[45%]' : 'w-full'} transition-all duration-500 relative`}>
            <PrashnavaliGrid
              onLetterSelect={handleLetterSelect}
              revealedCells={revealedCells}
              selectedCell={result?.selectedPosition}
              disabled={isAnimating || isRandom}
            />

            {/* Random Ask dramatic overlay */}
            {isRandom && !isAnimating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 border-4 border-saffron-300 border-t-saffron-700 rounded-sm animate-spin" />
                  <p className="text-white font-bold text-lg animate-pulse">🙏 भगवान से पूछ रहे हैं...</p>
                  <p className="text-saffron-200 text-xs">Asking the Lord...</p>
                </div>
              </div>
            )}

            {/* Animation status */}
            {isAnimating && (
              <div className="text-center py-4 animate-fade-in">
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-saffron-200 rounded-sm" />
                    <div className="absolute top-0 left-0 w-8 h-8 border-2 border-saffron-600 rounded-sm border-t-transparent animate-spin" />
                  </div>
                  <span className="text-saffron-700 font-medium text-xs">
                    {revealedCells.length} / 25
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Right: Result */}
          {showResult && result && !isAnimating && (
            <div ref={resultRef} className="lg:w-[50%] animate-slide-up">
              {question && (
                <div className="card-premium rounded-md p-4 mb-4 border-l-4 border-saffron-400">
                  <p className="text-[10px] text-saffron-500 tracking-wider uppercase font-medium">Your Question</p>
                  <p className="text-sm font-medium text-saffron-800 mt-1">{question}</p>
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
            <div className="hidden lg:flex flex-col items-start gap-2 lg:w-[8%] pt-4 animate-fade-in">
              <button
                onClick={handleReset}
                className="group flex items-center justify-center w-10 h-10 bg-saffron-600 text-white rounded-sm text-lg hover:w-32 hover:justify-start hover:px-3 hover:gap-2 hover:bg-saffron-700 shadow-md transition-all duration-300 overflow-hidden whitespace-nowrap"
              >
                <span className="shrink-0 text-center leading-none">↻</span>
                <span className="hidden group-hover:inline text-sm font-medium leading-none">पुनः प्रश्न</span>
              </button>
              <button
                onClick={() => handleSpeak(result?.chaupai.hindi || '')}
                className={`group flex items-center justify-center w-10 h-10 rounded-md text-lg shadow-sm transition-all duration-300 overflow-hidden whitespace-nowrap hover:w-32 hover:justify-start hover:px-3 hover:gap-2 ${
                  isSpeaking ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white border border-saffron-200 text-saffron-700 hover:bg-saffron-50'
                }`}
              >
                <span className="shrink-0 text-center leading-none">{isSpeaking ? '🔇' : '🔊'}</span>
                <span className="hidden group-hover:inline text-sm font-medium leading-none">{isSpeaking ? 'बंद करें' : 'सुनें'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="group flex items-center justify-center w-10 h-10 bg-white border border-saffron-200 text-saffron-700 rounded-md text-lg hover:bg-saffron-50 shadow-sm transition-all duration-300 overflow-hidden whitespace-nowrap hover:w-32 hover:justify-start hover:px-3 hover:gap-2"
              >
                <span className="shrink-0 text-center leading-none">🖨️</span>
                <span className="hidden group-hover:inline text-sm font-medium leading-none">प्रिंट</span>
              </button>
              <button
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="group flex items-center justify-center w-10 h-10 bg-white border border-saffron-200 text-saffron-700 rounded-sm text-lg hover:bg-saffron-50 shadow-sm transition-all duration-300 overflow-hidden whitespace-nowrap hover:w-32 hover:justify-start hover:px-3 hover:gap-2 disabled:opacity-50"
              >
                <span className="shrink-0 text-center leading-none">{isDownloading ? '⏳' : '🖼️'}</span>
                <span className="hidden group-hover:inline text-sm font-medium leading-none">डाउनलोड</span>
              </button>
              <button
                onClick={handleShare}
                className="group flex items-center justify-center w-10 h-10 bg-white border border-saffron-200 text-saffron-700 rounded-sm text-lg hover:bg-saffron-50 shadow-sm transition-all duration-300 overflow-hidden whitespace-nowrap hover:w-32 hover:justify-start hover:px-3 hover:gap-2"
              >
                <span className="shrink-0 text-center leading-none">{copied ? '✓' : '📋'}</span>
                <span className="hidden group-hover:inline text-sm font-medium leading-none">{copied ? 'कॉपी हो गया!' : 'कॉपी'}</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="group flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-sm text-lg hover:bg-green-700 shadow-sm transition-all duration-300 overflow-hidden whitespace-nowrap hover:w-32 hover:justify-start hover:px-3 hover:gap-2"
              >
                <span className="shrink-0 text-center leading-none">💬</span>
                <span className="hidden group-hover:inline text-sm font-medium leading-none">WhatsApp</span>
              </button>
            </div>
          )}


        </div>

        {/* Action buttons — mobile fallback (horizontal) */}
        {showResult && !isAnimating && (
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 mt-6 animate-fade-in">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-linear-to-r from-saffron-600 to-saffron-700 text-white rounded-md font-medium text-sm hover:from-saffron-700 hover:to-saffron-800 shadow-md hover:shadow-lg transition-all duration-300"
            >
              पुनः प्रश्न करें
            </button>
            <button
              onClick={() => handleSpeak(result?.chaupai.hindi || '')}
              className={`px-4 py-2.5 border rounded-md font-medium text-sm shadow-sm transition-all duration-300 ${isSpeaking
                  ? 'bg-red-500 border-red-600 text-white'
                  : 'bg-white border-saffron-200 text-saffron-700 hover:bg-saffron-50'
                }`}
            >
              {isSpeaking ? '🔇 बंद करें' : '🔊 सुनें'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white border border-saffron-200 text-saffron-700 rounded-md font-medium text-sm hover:bg-saffron-50 shadow-sm transition-all duration-300"
            >
              🖨️ प्रिंट
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-white border border-saffron-200 text-saffron-700 rounded-md font-medium text-sm hover:bg-saffron-50 shadow-sm transition-all duration-300 disabled:opacity-50"
            >
              {isDownloading ? '⏳ बना रहे हैं...' : '🖼️ फ़ोटो डाउनलोड'}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-white border border-saffron-200 text-saffron-700 rounded-md font-medium text-sm hover:bg-saffron-50 shadow-sm transition-all duration-300"
            >
              {copied ? '✓ कॉपी हो गया!' : '📋 लिंक कॉपी'}
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 shadow-sm transition-all duration-300"
            >
              WhatsApp
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && !result && !isAnimating && (
          <div className="mt-12 animate-fade-in">
            <div className="divider-traditional text-saffron-400 mb-4">।।</div>
            <h3 className="text-lg font-bold text-saffron-800 text-center mb-4">
              पिछले प्रश्न · Past Queries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  className="card-premium rounded-md p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => {
                    const row = Math.floor(item.cell / 15);
                    const col = item.cell % 15;
                    if (item.question) setPendingQuestion(item.question);
                    setTimeout(() => handleLetterSelect(row, col), 100);
                  }}
                >
                  {item.question && (
                    <p className="text-xs text-saffron-500 mb-1 truncate">{item.question}</p>
                  )}
                  <p className="text-sm font-medium text-saffron-800 truncate">{item.chaupaiHindi}</p>
                  <p className="text-[10px] text-saffron-500 mt-1">{item.result} · {new Date(item.timestamp).toLocaleDateString('hi-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 py-6">
          <div className="divider-traditional text-saffron-300 mb-3">◆</div>
          <p className="text-saffron-600 text-sm">
            <a href="/daily" className="underline hover:text-saffron-800 transition-colors">📅 आज की प्रश्नावली देखें</a>
          </p>
          <p className="text-saffron-600 text-sm mt-2">श्रीरामचरितमानस · गोस्वामी तुलसीदास</p>
          <p className="text-saffron-400 text-xs mt-1">Shri Ramcharitmanas · Goswami Tulsidas</p>
        </footer>
      </main>

      {/* FAB — Ask for Me */}
      {!isAnimating && (
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-linear-to-br from-orange-500 to-red-600 text-white rounded-sm shadow-lg hover:shadow-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110"
          aria-label="Ask for Me"
        >
          {showPanel ? '✕' : '🙏'}
        </button>
      )}

      {/* Slide-up panel */}
      {showPanel && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 transition-opacity" />
          {/* Panel */}
          <div
            className="absolute bottom-0 left-0 right-0 card-premium rounded-t-md p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-xl mx-auto">
              <label className="block text-center mb-3">
                <span className="text-sm font-medium text-saffron-700">
                  {result ? 'नया प्रश्न लिखें · Ask a new question' : 'अपना प्रश्न लिखें · Write your question'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pendingQuestion}
                  onChange={(e) => setPendingQuestion(e.target.value)}
                  placeholder="जैसे: क्या मेरा कार्य सफल होगा?"
                  className="w-full px-4 py-3 bg-white/80 border border-saffron-200 rounded-md text-saffron-900 placeholder-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent text-center text-sm"
                />
                {pendingQuestion && (
                  <button
                    onClick={() => setPendingQuestion('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-saffron-400 hover:text-saffron-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-center text-xs text-saffron-500 mt-2 mb-4">
                वैकल्पिक · Optional — you can also skip and just click a letter
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRandomAsk}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-red-600 text-white rounded-md font-medium text-sm hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                >
                  🙏 मेरे लिए पूछें · Ask for Me
                </button>
                <button
                  onClick={() => {
                    if (pendingQuestion.trim()) {
                      setShowPanel(false);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-saffron-600 to-saffron-700 text-white rounded-md font-medium text-sm hover:from-saffron-700 hover:to-saffron-800 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  ✨ प्रश्न दर्ज करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
