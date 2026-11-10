'use client';

import { useEffect, useState } from 'react';
import { Chaupai } from '@/data/chaupais';

interface ChaupaiCardProps {
  chaupai: Chaupai;
  selectedLetter: string;
  letterSequence: string[];
}

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

  const getResultStyles = () => {
    switch (chaupai.result) {
      case 'शुभ':
        return {
          headerBg: 'from-green-500 to-emerald-600',
          badge: 'badge-shubh',
          icon: '✅',
          accent: 'border-green-200',
        };
      case 'अशुभ':
        return {
          headerBg: 'from-red-500 to-rose-600',
          badge: 'badge-ashubh',
          icon: '⚠️',
          accent: 'border-red-200',
        };
      case 'प्रभु_इच्छा':
        return {
          headerBg: 'from-yellow-500 to-amber-600',
          badge: 'badge-prabhu',
          icon: '🙏',
          accent: 'border-yellow-200',
        };
      default:
        return {
          headerBg: 'from-gray-500 to-gray-600',
          badge: 'bg-gray-500',
          icon: '📜',
          accent: 'border-gray-200',
        };
    }
  };

  const styles = getResultStyles();

  return (
    <div
      className={`
        card-result rounded-md overflow-hidden border-2 ${styles.accent}
        transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
    >
      {/* Compact Header */}
      <div className={`bg-gradient-to-r ${styles.headerBg} px-5 py-4 text-white relative overflow-hidden`}>
        <span className="absolute top-1 right-3 text-4xl text-white/20 font-serif">ॐ</span>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs mb-0.5">चयनित अक्षर · Selected</p>
            <span className="text-3xl font-bold">{selectedLetter}</span>
          </div>
          <span className={`${styles.badge} inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-bold shadow-lg`}>
            <span>{styles.icon}</span>
            {chaupai.resultLabelEn}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Letter Sequence */}
        <div>
          <p className="text-[10px] text-saffron-500 mb-1.5 tracking-wider uppercase font-medium">अक्षर माला</p>
          <div className="flex flex-wrap gap-1">
            {letterSequence.map((letter, index) => (
              <span
                key={index}
                className="animate-reveal-letter inline-flex items-center justify-center w-7 h-7 bg-saffron-50 border border-saffron-200 rounded text-xs font-medium text-saffron-800"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Chaupai */}
        <div className="bg-linear-to-br from-saffron-50 to-amber-50 rounded-md p-4 border border-saffron-100">
          <p className="text-[10px] text-saffron-500 mb-1.5 tracking-wider uppercase font-medium">चौपाई · Chaupai</p>
          <p className="text-base sm:text-lg font-semibold text-saffron-900 leading-relaxed">{chaupai.hindi}</p>
          <p className="text-xs text-saffron-500 mt-1.5 italic">{chaupai.transliteration}</p>
        </div>

        {/* Meaning */}
        <div>
          <p className="text-[10px] text-saffron-500 mb-1.5 tracking-wider uppercase font-medium">अर्थ · Meaning</p>
          <p className="text-sm text-saffron-800 leading-relaxed">{chaupai.meaningHi}</p>
          <p className="text-xs text-saffron-500 mt-1 italic">{chaupai.meaning}</p>
        </div>

        {/* Kand & Context row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-saffron-50/60 rounded-md p-3 border border-saffron-100">
            <p className="text-[10px] text-saffron-500 mb-1 tracking-wider uppercase font-medium">काण्ड · Chapter</p>
            <p className="text-sm font-semibold text-saffron-800">{chaupai.kandHi}</p>
            <p className="text-xs text-saffron-500">{chaupai.kand} · {chaupai.kandNumber} of 7</p>
          </div>
          <div className="bg-saffron-50/60 rounded-md p-3 border border-saffron-100">
            <p className="text-[10px] text-saffron-500 mb-1 tracking-wider uppercase font-medium">प्रसंग · Context</p>
            <p className="text-sm font-semibold text-saffron-800">{chaupai.contextHi}</p>
            <p className="text-xs text-saffron-500">{chaupai.context}</p>
          </div>
        </div>

        {/* Episode (story) */}
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-saffron-600 hover:text-saffron-800 flex items-center gap-1.5 transition-colors">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            कथा · Episode Story
          </summary>
          <div className="mt-2 bg-saffron-50/40 rounded-md p-3 border border-saffron-100/50">
            <p className="text-xs text-saffron-700 leading-relaxed">{chaupai.episodeHi}</p>
            <p className="text-xs text-saffron-500 mt-1.5 italic">{chaupai.episode}</p>
          </div>
        </details>

        {/* Lesson */}
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-saffron-600 hover:text-saffron-800 flex items-center gap-1.5 transition-colors">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            शिक्षा · Life Lesson
          </summary>
          <div className="mt-2 bg-saffron-50/40 rounded-md p-3 border border-saffron-100/50">
            <p className="text-xs text-saffron-700">{chaupai.lessonHi}</p>
            <p className="text-xs text-saffron-500 mt-1 italic">{chaupai.lesson}</p>
          </div>
        </details>

        {/* Inference */}
        <div className="bg-linear-to-r from-saffron-100 via-amber-50 to-saffron-100 rounded-md p-4 border border-saffron-200/50">
          <p className="text-[10px] text-saffron-500 mb-1 tracking-wider uppercase font-medium">निष्कर्ष · Guidance</p>
          <p className="text-sm font-semibold text-saffron-900">{chaupai.inference}</p>
          <p className="text-xs text-saffron-600 mt-0.5">{chaupai.inferenceHi}</p>
        </div>
      </div>
    </div>
  );
}
