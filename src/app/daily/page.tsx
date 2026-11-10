'use client';

import { useMemo } from 'react';
import Header from '@/components/Header';
import ChaupaiCard from '@/components/ChaupaiCard';
import { CHAUPAIS } from '@/data/chaupais';
import Link from 'next/link';

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function DailyPage() {
  const dayOfYear = useMemo(() => getDayOfYear(), []);

  const dailyChaupai = useMemo(() => {
    const index = dayOfYear % CHAUPAIS.length;
    return CHAUPAIS[index];
  }, [dayOfYear]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('hi-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleWhatsAppShare = () => {
    const text = `🙏 श्री राम प्रश्नावली - आज की चौपाई\n\n${dailyChaupai.hindi}\n\n${dailyChaupai.meaning}\n\n📖 ${dailyChaupai.episodeHi}\n💡 ${dailyChaupai.inferenceHi}\n\nhttps://ramcharitmanas.vercel.app/daily`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://ramcharitmanas.vercel.app/daily');
    } catch {}
  };

  const resultType = dailyChaupai.result === 'शुभ' ? 'auspicious' : dailyChaupai.result === 'अशुभ' ? 'caution' : 'neutral';
  const bgClass = resultType === 'auspicious' ? 'from-emerald-50 to-green-50' : resultType === 'caution' ? 'from-amber-50 to-orange-50' : 'from-indigo-50 to-blue-50';
  const borderClass = resultType === 'auspicious' ? 'border-emerald-400' : resultType === 'caution' ? 'border-amber-400' : 'border-indigo-400';
  const badgeClass = resultType === 'auspicious' ? 'bg-emerald-100 text-emerald-800' : resultType === 'caution' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800';

  return (
    <div className="min-h-screen pattern-bg">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* Day counter */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-saffron-100 px-4 py-2 rounded-sm">
            <span className="text-saffron-600 text-sm font-medium">दिन #{dayOfYear}</span>
            <span className="text-saffron-300">·</span>
            <span className="text-saffron-700 text-sm">{dateStr}</span>
          </div>
        </div>

        {/* Hero section */}
        <div className={`card-premium rounded-md p-6 sm:p-8 mb-6 bg-gradient-to-br ${bgClass} border-l-4 ${borderClass} animate-fade-in`}>
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-saffron-800 mb-2">
              🙏 आज की प्रश्नावली
            </h1>
            <p className="text-saffron-600 text-sm">Today&apos;s Prashnavali</p>
          </div>

          {/* Badge */}
          <div className="text-center mb-6">
            <span className={`inline-block px-5 py-2 rounded-sm text-sm font-bold ${badgeClass}`}>
              {dailyChaupai.resultLabel} · {dailyChaupai.resultLabelEn}
            </span>
          </div>

          {/* Chaupai */}
          <div className="bg-white/60 backdrop-blur rounded-md p-6 mb-6">
            <p className="text-xl sm:text-2xl text-saffron-900 leading-relaxed text-center font-serif">
              {dailyChaupai.hindi}
            </p>
            <p className="text-sm text-saffron-600 text-center mt-4 italic">
              {dailyChaupai.meaning}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/40 rounded-md p-4">
              <h3 className="text-xs text-saffron-500 uppercase tracking-wider font-medium mb-1">📖 Episode</h3>
              <p className="text-sm text-saffron-800">{dailyChaupai.episodeHi}</p>
              <p className="text-xs text-saffron-500 mt-1">{dailyChaupai.episode}</p>
            </div>
            <div className="bg-white/40 rounded-md p-4">
              <h3 className="text-xs text-saffron-500 uppercase tracking-wider font-medium mb-1">📚 Kand</h3>
              <p className="text-sm text-saffron-800">{dailyChaupai.kandHi} ({dailyChaupai.kand})</p>
            </div>
            <div className="bg-white/40 rounded-md p-4">
              <h3 className="text-xs text-saffron-500 uppercase tracking-wider font-medium mb-1">🎓 Lesson</h3>
              <p className="text-sm text-saffron-800">{dailyChaupai.lessonHi}</p>
            </div>
            <div className="bg-white/40 rounded-md p-4">
              <h3 className="text-xs text-saffron-500 uppercase tracking-wider font-medium mb-1">💡 Inference</h3>
              <p className="text-sm text-saffron-800">{dailyChaupai.inferenceHi}</p>
            </div>
          </div>
        </div>

        {/* CTA to do personal prashnavali */}
        <div className="card-premium rounded-md p-6 text-center mb-6 animate-fade-in">
          <h2 className="text-lg font-bold text-saffron-800 mb-2">
            अपना प्रश्न पूछें
          </h2>
          <p className="text-sm text-saffron-600 mb-4">
            राम शलाका से अपने व्यक्तिगत प्रश्न का उत्तर पाएं
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white rounded-md font-medium text-sm hover:from-saffron-700 hover:to-saffron-800 shadow-md hover:shadow-lg transition-all duration-300"
          >
            🔮 राम शलाका खोलें
          </Link>
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-3 animate-fade-in">
          <button
            onClick={handleWhatsAppShare}
            className="px-5 py-2.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 shadow-sm transition-all duration-300"
          >
            WhatsApp पर शेयर करें
          </button>
          <button
            onClick={handleCopyLink}
            className="px-5 py-2.5 bg-white border border-saffron-200 text-saffron-700 rounded-md font-medium text-sm hover:bg-saffron-50 shadow-sm transition-all duration-300"
          >
            📋 लिंक कॉपी करें
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-6">
          <div className="divider-traditional text-saffron-300 mb-3">◆</div>
          <p className="text-saffron-600 text-sm">श्रीरामचरितमानस · गोस्वामी तुलसीदास</p>
          <p className="text-saffron-400 text-xs mt-1">Shri Ramcharitmanas · Goswami Tulsidas</p>
        </footer>
      </main>
    </div>
  );
}
