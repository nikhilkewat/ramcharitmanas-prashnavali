'use client';

import { useMemo } from 'react';
import Header from '@/components/Header';
import ChaupaiCard from '@/components/ChaupaiCard';
import { CHAUPAIS } from '@/data/chaupais';
import Link from 'next/link';
import { BookOpen, GraduationCap, Landmark, Lightbulb, Link2, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';

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

  const tone = dailyChaupai.result === 'शुभ' ? 'tone-shubh' : dailyChaupai.result === 'अशुभ' ? 'tone-ashubh' : 'tone-prabhu';

  return (
    <div className="min-h-screen pattern-bg">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* Day counter */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-surface border border-line px-4 py-2 rounded-full">
            <span className="text-ink-2 text-sm font-medium">दिन #{dayOfYear}</span>
            <span className="text-gold">·</span>
            <span className="text-ink-2 text-sm">{dateStr}</span>
          </div>
        </div>

        {/* Hero section */}
        <div className="card-premium rounded-xl overflow-hidden mb-6 animate-fade-in">
          <div className={`${tone} text-white text-center px-6 py-6 sm:py-8`}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              आज की प्रश्नावली
            </h1>
            <p className="text-white/80 text-sm">Today&apos;s Prashnavali</p>
            <span className="inline-block mt-4 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/15 ring-1 ring-white/35">
              {dailyChaupai.resultLabel} · {dailyChaupai.resultLabelEn}
            </span>
          </div>

          <div className="p-6 sm:p-8">

          {/* Chaupai */}
          <div className="bg-accent-soft border-l-4 border-accent rounded-lg p-6 mb-6">
            <p className="text-xl sm:text-2xl text-verse font-semibold leading-loose text-center">
              {dailyChaupai.hindi}
            </p>
            <p className="text-sm text-ink-2 text-center mt-4 italic">
              {dailyChaupai.meaning}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-2 border border-line rounded-lg p-4">
              <h3 className="text-[11px] text-ink-3 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><BookOpen size={13} /> Episode</h3>
              <p className="text-sm text-ink">{dailyChaupai.episodeHi}</p>
              <p className="text-xs text-ink-3 mt-1">{dailyChaupai.episode}</p>
            </div>
            <div className="bg-surface-2 border border-line rounded-lg p-4">
              <h3 className="text-[11px] text-ink-3 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><Landmark size={13} /> Kand</h3>
              <p className="text-sm text-ink">{dailyChaupai.kandHi} ({dailyChaupai.kand})</p>
            </div>
            <div className="bg-surface-2 border border-line rounded-lg p-4">
              <h3 className="text-[11px] text-ink-3 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><GraduationCap size={13} /> Lesson</h3>
              <p className="text-sm text-ink">{dailyChaupai.lessonHi}</p>
            </div>
            <div className="bg-surface-2 border border-line rounded-lg p-4">
              <h3 className="text-[11px] text-ink-3 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><Lightbulb size={13} /> Guidance</h3>
              <p className="text-sm text-ink">{dailyChaupai.inferenceHi}</p>
            </div>
          </div>
          </div>
        </div>

        {/* CTA to do personal prashnavali */}
        <div className="card-premium rounded-xl p-6 text-center mb-6 animate-fade-in">
          <h2 className="text-lg font-bold text-ink mb-2">
            अपना प्रश्न पूछें
          </h2>
          <p className="text-sm text-ink-2 mb-4">
            राम शलाका से अपने व्यक्तिगत प्रश्न का उत्तर पाएं
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-on-accent rounded-lg font-medium text-sm hover:bg-accent-hover shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Sparkles size={16} /> राम शलाका खोलें
          </Link>
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-3 animate-fade-in">
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1f7a4d] text-white rounded-lg font-medium text-sm hover:bg-[#19663f] shadow-sm transition-all duration-300"
          >
            <WhatsAppIcon size={16} /> WhatsApp पर शेयर करें
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-line-strong text-ink-2 rounded-lg font-medium text-sm hover:bg-surface-2 hover:text-ink shadow-sm transition-all duration-300"
          >
            <Link2 size={16} /> लिंक कॉपी करें
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-6">
          <div className="divider-traditional text-gold mb-3">◆</div>
          <p className="text-ink-2 text-sm">श्रीरामचरितमानस · गोस्वामी तुलसीदास</p>
          <p className="text-ink-3 text-xs mt-1">Shri Ramcharitmanas · Goswami Tulsidas</p>
        </footer>
      </main>
    </div>
  );
}
