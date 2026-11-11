'use client';

import { Sparkles, X } from 'lucide-react';

interface QuestionBoxProps {
  value: string;
  onChange: (value: string) => void;
  onAskForMe: () => void;
  disabled?: boolean;
}

const STEPS = ['प्रश्न स्मरण करें', 'अक्षर चुनें', 'उत्तर पाएं'];
const NUMERALS = ['१', '२', '३'];

/** Inline question input shown above the grid before a reading. */
export default function QuestionBox({ value, onChange, onAskForMe, disabled }: QuestionBoxProps) {
  // Enter moves focus to the grid so keyboard users can pick a letter next.
  const focusGrid = () => {
    const first = document.querySelector<HTMLElement>('[data-row="0"][data-col="0"]');
    first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    first?.focus({ preventScroll: true });
  };

  return (
    <section className="card-premium rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 animate-fade-in" aria-labelledby="question-label">
      <label id="question-label" htmlFor="question-input" className="block font-display text-xl sm:text-2xl text-ink text-center">
        शांत मन से अपना प्रश्न स्मरण करें
      </label>
      <p className="text-center text-xs sm:text-sm text-ink-3 mt-1">
        Hold your question in mind — writing it is optional
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <input
            id="question-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                focusGrid();
              }
            }}
            maxLength={200}
            enterKeyHint="next"
            placeholder="जैसे: क्या मेरा कार्य सफल होगा?"
            disabled={disabled}
            className="w-full h-12 pl-4 pr-10 bg-surface-2 border border-line-strong rounded-lg text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-[15px] disabled:opacity-60"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface-3"
              aria-label="Clear question"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onAskForMe}
          disabled={disabled}
          className="h-12 inline-flex items-center justify-center gap-2 px-5 tone-prabhu text-white rounded-lg font-medium text-sm hover:brightness-110 shadow-md transition-all disabled:opacity-60 whitespace-nowrap"
        >
          <Sparkles size={16} /> मेरे लिए पूछें · Ask for Me
        </button>
      </div>

      <ol className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-ink-2">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-accent text-on-accent rounded-full flex items-center justify-center text-[11px] font-bold">
              {NUMERALS[i]}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
