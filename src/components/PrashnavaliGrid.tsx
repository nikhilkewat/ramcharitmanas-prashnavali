'use client';

import { GRID, GRID_SIZE } from '@/data/grid';

interface PrashnavaliGridProps {
  onLetterSelect: (row: number, col: number) => void;
  revealedCells?: number[];
  selectedCell?: number | null;
  disabled?: boolean;
}

export default function PrashnavaliGrid({
  onLetterSelect,
  revealedCells = [],
  selectedCell = null,
  disabled = false,
}: PrashnavaliGridProps) {
  const handleCellClick = (row: number, col: number) => {
    if (disabled) return;
    onLetterSelect(row, col);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (disabled) return;
    let nextRow = row;
    let nextCol = col;

    switch (e.key) {
      case 'ArrowUp': nextRow = Math.max(0, row - 1); break;
      case 'ArrowDown': nextRow = Math.min(GRID_SIZE - 1, row + 1); break;
      case 'ArrowLeft': nextCol = Math.max(0, col - 1); break;
      case 'ArrowRight': nextCol = Math.min(GRID_SIZE - 1, col + 1); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onLetterSelect(row, col);
        return;
      default: return;
    }

    e.preventDefault();
    const nextCell = document.querySelector(
      `[data-row="${nextRow}"][data-col="${nextCol}"]`
    ) as HTMLElement;
    nextCell?.focus();
  };

  const getFlatIndex = (row: number, col: number) => row * GRID_SIZE + col;

  const isRevealed = (row: number, col: number) => {
    return revealedCells.includes(getFlatIndex(row, col));
  };

  const isSelected = (row: number, col: number) => {
    return selectedCell === getFlatIndex(row, col);
  };

  return (
    <div className="card-premium rounded-xl p-2 sm:p-5 relative overflow-hidden">
      <span className="hidden sm:block absolute top-2 left-2 text-gold/30 text-xl" aria-hidden>❁</span>
      <span className="hidden sm:block absolute top-2 right-2 text-gold/30 text-xl" aria-hidden>❁</span>
      <span className="hidden sm:block absolute bottom-2 left-2 text-gold/30 text-xl" aria-hidden>❁</span>
      <span className="hidden sm:block absolute bottom-2 right-2 text-gold/30 text-xl" aria-hidden>❁</span>

      <div className="text-center mt-1 mb-2 sm:mt-0 sm:mb-4">
        <p className="text-xs text-ink-2 tracking-widest uppercase font-medium">राम शलाका · Ram Shalaka</p>
      </div>

      {/* Fluid board: 15 equal square columns that always fit the available
          width (no horizontal scroll on phones), capped on large screens.
          Letter size follows the board width via container query units. */}
      <div className="@container w-full max-w-[46rem] mx-auto">
          <div
            className="shalaka-board grid gap-[2px] sm:gap-1 p-1.5 sm:p-3 rounded-lg relative"
            role="grid"
            aria-label="Ram Shalaka grid of 225 Hindi letters"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          >
            <div className="hidden sm:block absolute inset-2 border border-gold/20 rounded-lg pointer-events-none" />

            {GRID.map((row, rowIndex) =>
              row.map((letter, colIndex) => {
                const revealed = isRevealed(rowIndex, colIndex);
                const selected = isSelected(rowIndex, colIndex);

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    data-row={rowIndex}
                    data-col={colIndex}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    disabled={disabled}
                    tabIndex={rowIndex === 0 && colIndex === 0 ? 0 : -1}
                    role="gridcell"
                    aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}: ${letter}${selected ? ' (selected)' : ''}${revealed ? ' (revealed)' : ''}`}
                    className={`
                      relative aspect-square min-w-0
                      flex items-center justify-center
                      text-[clamp(0.7rem,3.3cqi,1.15rem)] font-medium
                      rounded-[3px] sm:rounded-md
                      transition-all duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-transparent
                      ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                      ${
                        selected
                          ? 'cell-selected font-bold scale-125 z-10'
                          : revealed
                          ? 'cell-revealed font-semibold animate-cell-glow'
                          : `cell ${disabled ? 'opacity-75' : 'hover:scale-110 hover:z-10'}`
                      }
                    `}
                  >
                    <span className="leading-none select-none">{letter}</span>
                    {selected && (
                      <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gold rounded-full border border-surface shadow animate-cell-pulse" />
                    )}
                  </button>
                );
              })
            )}
          </div>
      </div>

      <div className="text-center mt-2 mb-1 sm:mt-4 sm:mb-0">
        <p className="text-[11px] text-ink-3 tracking-wide">
          <span className="sm:hidden">✦ किसी भी अक्षर को छुएँ · Tap any letter ✦</span>
          <span className="hidden sm:inline">✦ किसी भी अक्षर पर क्लिक करें · Click any letter · Arrow keys to navigate ✦</span>
        </p>
      </div>
    </div>
  );
}
