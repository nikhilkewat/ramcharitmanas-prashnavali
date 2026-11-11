'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { BookOpen, Check, GraduationCap, Landmark, Lightbulb, Link2, Sparkles } from 'lucide-react';
import { CHAUPAIS } from '@/data/chaupais';
import { WhatsAppIcon } from '@/components/icons';

const DAILY_URL = 'https://ramcharitmanas.vercel.app/daily';

// "Today" must come from the visitor's clock (their timezone), not the build
// server's, so the date is read on the client only. The snapshot is a string
// key, so it stays referentially stable until the date actually changes.
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function subscribeToDate(onChange: () => void) {
  const id = setInterval(onChange, 60_000); // roll over at midnight
  return () => clearInterval(id);
}

function dayOfYear(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86_400_000);
}

export default function DailyChaupai() {
  const key = useSyncExternalStore(subscribeToDate, todayKey, () => null);
  const [copied, setCopied] = useState(false);

  if (!key) return <DailySkeleton />;

  const day = dayOfYear(key);
  const dailyChaupai = CHAUPAIS[day % CHAUPAIS.length];
  const [y, m, d] = key.split('-').map(Number);
  const dateStr = new Date(y, m - 1, d).toLocaleDateString('hi-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleWhatsAppShare = () => {
    const text = `🙏 श्री राम प्रश्नावली - आज की चौपाई\n\n${dailyChaupai.hindi}\n\n${dailyChaupai.meaning}\n\n📖 ${dailyChaupai.episodeHi}\n💡 ${dailyChaupai.inferenceHi}\n\n${DAILY_URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(DAILY_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const tone = dailyChaupai.result === 'शुभ' ? 'tone-shubh' : dailyChaupai.result === 'अशुभ' ? 'tone-ashubh' : 'tone-prabhu';

  return (
    <>
      {/* Day counter */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-surface border border-line px-4 py-2 rounded-full">
          <span className="text-ink-2 text-sm font-medium">दिन #{day}</span>
          <span className="text-gold">·</span>
          <span className="text-ink-2 text-sm">{dateStr}</span>
        </div>
      </div>

      {/* Hero section */}
      <div className="card-premium rounded-xl overflow-hidden mb-6 animate-fade-in">
        <div className={`${tone} text-white text-center px-6 py-6 sm:py-8`}>
          <h1 className="font-display text-3xl sm:text-4xl mb-2">आज की चौपाई</h1>
          <p className="text-white/80 text-sm">Today&apos;s Chaupai</p>
          <span className="inline-block mt-4 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/15 ring-1 ring-white/35">
            {dailyChaupai.resultLabel} · {dailyChaupai.resultLabelEn}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {/* Chaupai */}
          <div className="bg-accent-soft border-l-4 border-accent rounded-lg p-6 mb-6">
            <p className="font-display text-2xl sm:text-3xl text-verse leading-relaxed text-center">
              {dailyChaupai.hindi}
            </p>
            <p className="text-sm text-ink-2 text-center mt-4 italic">{dailyChaupai.meaning}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Detail Icon={BookOpen} label="कथा · Episode" value={dailyChaupai.episodeHi} sub={dailyChaupai.episode} />
            <Detail Icon={Landmark} label="काण्ड · Chapter" value={`${dailyChaupai.kandHi} (${dailyChaupai.kand})`} />
            <Detail Icon={GraduationCap} label="शिक्षा · Lesson" value={dailyChaupai.lessonHi} />
            <Detail Icon={Lightbulb} label="निष्कर्ष · Guidance" value={dailyChaupai.inferenceHi} />
          </div>
        </div>
      </div>

      {/* CTA to do personal prashnavali */}
      <div className="card-premium rounded-xl p-6 text-center mb-6 animate-fade-in">
        <h2 className="font-display text-2xl text-ink mb-1">अपना प्रश्न पूछें</h2>
        <p className="text-xs text-ink-3 mb-2">Ask your own question</p>
        <p className="text-sm text-ink-2 mb-4">राम शलाका से अपने व्यक्तिगत प्रश्न का उत्तर पाएं</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-on-accent rounded-lg font-medium text-sm hover:bg-accent-hover shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Sparkles size={16} /> राम शलाका खोलें
        </Link>
      </div>

      {/* Share buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
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
          {copied ? <Check size={16} /> : <Link2 size={16} />}
          {copied ? 'कॉपी हो गया!' : 'लिंक कॉपी करें'}
        </button>
      </div>
    </>
  );
}

function Detail({ Icon, label, value, sub }: { Icon: typeof BookOpen; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface-2 border border-line rounded-lg p-4">
      <h3 className="text-[11px] text-ink-3 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
        <Icon size={13} /> {label}
      </h3>
      <p className="text-sm text-ink">{value}</p>
      {sub && <p className="text-xs text-ink-3 mt-1">{sub}</p>}
    </div>
  );
}

// Same footprint as the real content, shown during prerender / before hydration.
function DailySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading today's chaupai">
      <div className="flex justify-center mb-6">
        <div className="h-9 w-72 rounded-full bg-surface-2 animate-pulse" />
      </div>
      <div className="card-premium rounded-xl overflow-hidden mb-6">
        <div className="h-40 bg-surface-3 animate-pulse" />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="h-32 rounded-lg bg-surface-2 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-surface-2 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
