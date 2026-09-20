import { GRID, GRID_SIZE, TOTAL_CELLS, STEP } from '@/data/grid';
import { CHAUPAIS, Chaupai } from '@/data/chaupais';

export interface PrashnavaliResult {
  selectedLetter: string;
  selectedPosition: number;
  letterSequence: string[];
  chaupai: Chaupai;
  highlightedCells: number[];
}

export function getFlatIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

function getLetterAt(flatIndex: number): string {
  const row = Math.floor(flatIndex / GRID_SIZE);
  const col = flatIndex % GRID_SIZE;
  return GRID[row][col];
}

export function generatePrashnavaliResult(selectedRow: number, selectedCol: number): PrashnavaliResult {
  const startIndex = getFlatIndex(selectedRow, selectedCol);
  const selectedLetter = getLetterAt(startIndex);

  const letterSequence: string[] = [];
  const highlightedCells: number[] = [];
  let currentIndex = startIndex;

  do {
    letterSequence.push(getLetterAt(currentIndex));
    highlightedCells.push(currentIndex);
    currentIndex = (currentIndex + STEP) % TOTAL_CELLS;
  } while (currentIndex !== startIndex);

  const chaupaiIndex = startIndex % 9;
  const chaupai = CHAUPAIS[chaupaiIndex];

  return {
    selectedLetter,
    selectedPosition: startIndex,
    letterSequence,
    chaupai,
    highlightedCells,
  };
}
