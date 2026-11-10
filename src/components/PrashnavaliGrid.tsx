'use client';

import { useState } from 'react';
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
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

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
    <div className="card-premium rounded-md p-4 sm:p-5 relative overflow-hidden">
      <span className="absolute top-2 left-2 text-saffron-200/40 text-xl">❁</span>
      <span className="absolute top-2 right-2 text-saffron-200/40 text-xl">❁</span>
      <span className="absolute bottom-2 left-2 text-saffron-200/40 text-xl">❁</span>
      <span className="absolute bottom-2 right-2 text-saffron-200/40 text-xl">❁</span>

      <div className="text-center mb-4">
        <p className="text-xs text-saffron-600 tracking-widest uppercase font-medium">राम शलाका · Ram Shalaka</p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block mx-auto">
          <div
            className="grid gap-0.5 p-3 rounded-md relative"
            role="grid"
            aria-label="Ram Shalaka grid of 225 Hindi letters"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(2.5rem, 3rem))`,
              background: 'linear-gradient(145deg, #78350f 0%, #92400e 30%, #78350f 70%, #451a03 100%)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(146, 64, 14, 0.25)',
            }}
          >
            <div className="absolute inset-2 border border-amber-600/20 rounded-md pointer-events-none" />

            {GRID.map((row, rowIndex) =>
              row.map((letter, colIndex) => {
                const flatIndex = getFlatIndex(rowIndex, colIndex);
                const revealed = isRevealed(rowIndex, colIndex);
                const selected = isSelected(rowIndex, colIndex);
                const hovered = hoveredCell === flatIndex;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    data-row={rowIndex}
                    data-col={colIndex}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    onMouseEnter={() => setHoveredCell(flatIndex)}
                    onMouseLeave={() => setHoveredCell(null)}
                    disabled={disabled}
                    tabIndex={rowIndex === 0 && colIndex === 0 ? 0 : -1}
                    role="gridcell"
                    aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}: ${letter}${selected ? ' (selected)' : ''}${revealed ? ' (revealed)' : ''}`}
                    className={`
                      relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12
                      flex items-center justify-center
                      text-sm sm:text-base md:text-lg font-medium
                      rounded-sm
                      transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
                      ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                      ${
                        selected
                          ? 'bg-linear-to-b from-amber-400 to-amber-500 text-white scale-125 z-10 shadow-lg shadow-amber-500/40'
                          : revealed
                          ? 'bg-linear-to-b from-amber-200 to-amber-300 text-amber-900 shadow-sm animate-cell-glow'
                          : hovered && !disabled
                          ? 'bg-linear-to-b from-amber-100 to-amber-200 text-amber-800 scale-110 z-10'
                          : 'bg-linear-to-b from-amber-50 to-orange-50 text-saffron-800 hover:from-amber-100 hover:to-amber-200'
                      }
                    `}
                  >
                    <span className="leading-none select-none">{letter}</span>
                    {selected && (
                      <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-gold-400 rounded-sm border border-white shadow animate-cell-pulse" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-[10px] text-saffron-500/70 tracking-wide">
          ✦ किसी भी अक्षर पर क्लिक करें · Click any letter · Arrow keys to navigate ✦
        </p>
      </div>
    </div>
  );
}
