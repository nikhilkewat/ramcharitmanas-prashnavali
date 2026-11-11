'use client';

import { useEffect, useState } from 'react';
import { Chaupai } from '@/data/chaupais';
import {
  BookOpen, ChevronRight, CircleCheck, GraduationCap, Landmark, Lightbulb,
  MapPin, ScrollText, Sparkles, TriangleAlert,
} from 'lucide-react';

interface ChaupaiCardProps {
  chaupai: Chaupai;
  selectedLetter: string;
  letterSequence: string[];
}

const LABEL = 'text-[11px] text-ink-3 mb-1.5 tracking-wider uppercase font-semibold';

const RESULT_STYLES = {
  'शुभ': { tone: 'tone-shubh', Icon: CircleCheck },
  'अशुभ': { tone: 'tone-ashubh', Icon: TriangleAlert },
  'प्रभु_इच्छा': { tone: 'tone-prabhu', Icon: Sparkles },
} as const;

export default function ChaupaiCard({
  chaupai,
  selectedLetter,
  letterSequence,
}: ChaupaiCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const styles = RESULT_STYLES[chaupai.result] ?? RESULT_STYLES['प्रभु_इच्छा'];

  return (
    <div
      className={`
        card-result rounded-xl overflow-hidden
        transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
    >
      {/* Header */}
      <div className={`${styles.tone} px-5 py-4 text-white relative overflow-hidden`}>
        <span className="absolute -top-2 right-3 text-6xl text-white/10 font-serif select-none" aria-hidden>ॐ</span>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="shrink-0" title="Selected letter">
            <p className="text-white/75 text-xs mb-0.5 whitespace-nowrap">चयनित अक्षर</p>
            <span className="font-display text-4xl leading-none">{selectedLetter}</span>
          </div>
          <span className="min-w-0 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/15 ring-1 ring-white/35 backdrop-blur-sm">
            <styles.Icon size={18} className="shrink-0" aria-hidden />
            <span className="flex flex-col leading-tight">
              <span className="text-sm sm:text-[15px] font-semibold">{chaupai.resultLabel}</span>
              <span className="text-[11px] text-white/80 tracking-wide">{chaupai.resultLabelEn}</span>
            </span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Letter Sequence */}
        <div>
          <p className={LABEL}>अक्षर माला · Letters</p>
          <div className="flex flex-wrap gap-1">
            {letterSequence.map((letter, index) => (
              <span
                key={index}
                className="animate-reveal-letter inline-flex items-center justify-center min-w-7 h-7 px-1 bg-surface-2 border border-line rounded-md font-display text-sm text-ink-2"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Chaupai */}
        <div className="bg-accent-soft rounded-lg px-5 py-4 border-l-4 border-accent">
          <p className={`${LABEL} flex items-center gap-1.5`}><ScrollText size={13} /> चौपाई · Chaupai</p>
          <p className="font-display text-xl sm:text-2xl text-verse leading-relaxed">{chaupai.hindi}</p>
          <p className="text-xs text-ink-3 mt-1 italic">{chaupai.transliteration}</p>
        </div>

        {/* Meaning */}
        <div>
          <p className={LABEL}>अर्थ · Meaning</p>
          <p className="text-[15px] text-ink leading-relaxed">{chaupai.meaningHi}</p>
          <p className="text-sm text-ink-3 mt-1 italic">{chaupai.meaning}</p>
        </div>

        {/* Kand & Context row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-2 rounded-lg p-3 border border-line">
            <p className={`${LABEL} flex items-center gap-1.5`}><Landmark size={13} /> काण्ड · Chapter</p>
            <p className="text-sm font-semibold text-ink">{chaupai.kandHi}</p>
            <p className="text-xs text-ink-3 mt-0.5">{chaupai.kand} · {chaupai.kandNumber} of 7</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3 border border-line">
            <p className={`${LABEL} flex items-center gap-1.5`}><MapPin size={13} /> प्रसंग · Context</p>
            <p className="text-sm font-semibold text-ink">{chaupai.contextHi}</p>
            <p className="text-xs text-ink-3 mt-0.5">{chaupai.context}</p>
          </div>
        </div>

        {/* Episode (story) */}
        <details className="group">
          <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm font-medium text-ink-2 hover:text-accent flex items-center gap-1.5 transition-colors">
            <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
            <BookOpen size={15} /> कथा · Episode Story
          </summary>
          <div className="mt-2 bg-surface-2 rounded-lg p-3 border border-line">
            <p className="text-sm text-ink leading-relaxed">{chaupai.episodeHi}</p>
            <p className="text-xs text-ink-3 mt-1.5 italic leading-relaxed">{chaupai.episode}</p>
          </div>
        </details>

        {/* Lesson */}
        <details className="group">
          <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm font-medium text-ink-2 hover:text-accent flex items-center gap-1.5 transition-colors">
            <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
            <GraduationCap size={15} /> शिक्षा · Life Lesson
          </summary>
          <div className="mt-2 bg-surface-2 rounded-lg p-3 border border-line">
            <p className="text-sm text-ink">{chaupai.lessonHi}</p>
            <p className="text-xs text-ink-3 mt-1 italic">{chaupai.lesson}</p>
          </div>
        </details>

        {/* Inference */}
        <div className="rounded-lg p-4 bg-surface-3 border border-line-strong">
          <p className={`${LABEL} flex items-center gap-1.5`}><Lightbulb size={13} /> निष्कर्ष · Guidance</p>
          <p className="text-[15px] font-semibold text-ink">{chaupai.inferenceHi}</p>
          <p className="text-sm text-ink-2 mt-0.5">{chaupai.inference}</p>
        </div>
      </div>
    </div>
  );
}
