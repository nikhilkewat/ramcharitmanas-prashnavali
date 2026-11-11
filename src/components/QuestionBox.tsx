'use client';

import { useState } from 'react';
import { PenLine, Sparkles, X } from 'lucide-react';

interface QuestionBoxProps {
  value: string;
  onChange: (value: string) => void;
  onAskForMe: () => void;
  disabled?: boolean;
}

/**
 * Compact bar above the grid. Writing a question is optional, so the input
 * stays collapsed until asked for; the grid stays near the top of the screen.
 */
export default function QuestionBox({ value, onChange, onAskForMe, disabled }: QuestionBoxProps) {
  const [open, setOpen] = useState(value !== '');

  // Enter moves focus to the grid so keyboard users can pick a letter next.
  const focusGrid = () => {
    const first = document.querySelector<HTMLElement>('[data-row="0"][data-col="0"]');
    first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    first?.focus({ preventScroll: true });
  };

  const askButton = (
    <button
      type="button"
      onClick={onAskForMe}
      disabled={disabled}
      title="Ask for me — a letter is picked for you"
      className="h-11 inline-flex items-center justify-center gap-2 px-4 tone-prabhu text-white rounded-lg font-medium text-sm hover:brightness-110 shadow-sm transition-all disabled:opacity-60 whitespace-nowrap"
    >
      <Sparkles size={16} /> मेरे लिए पूछें
    </button>
  );

  return (
    <section className="card-premium rounded-xl px-4 py-3 sm:py-3.5 mb-4 sm:mb-6 animate-fade-in max-w-4xl mx-auto">
      {open ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <label htmlFor="question-input" className="sr-only">अपना प्रश्न</label>
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
                if (e.key === 'Escape' && !value) setOpen(false);
              }}
              autoFocus
              maxLength={200}
              enterKeyHint="next"
              placeholder="जैसे: क्या मेरा कार्य सफल होगा?"
              disabled={disabled}
              className="w-full h-11 pl-4 pr-10 bg-surface-2 border border-line-strong rounded-lg text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-[15px] disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => {
                if (value) onChange('');
                else setOpen(false);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface-3"
              aria-label={value ? 'Clear question' : 'Close'}
            >
              <X size={16} />
            </button>
          </div>
          {askButton}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <p className="flex-1 text-center sm:text-left text-sm text-ink-2">
            <span className="font-display text-base text-ink">मन में प्रश्न स्मरण करें</span>
            <span className="text-ink-3"> · फिर कोई भी अक्षर चुनें</span>
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={disabled}
              title="Write your question (optional)"
              className="h-11 inline-flex items-center justify-center gap-2 px-4 bg-surface border border-line-strong text-ink-2 rounded-lg font-medium text-sm hover:bg-surface-2 hover:text-ink transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <PenLine size={16} /> प्रश्न लिखें
              <span className="text-ink-3 text-xs font-normal">(वैकल्पिक)</span>
            </button>
            {askButton}
          </div>
        </div>
      )}
    </section>
  );
}
