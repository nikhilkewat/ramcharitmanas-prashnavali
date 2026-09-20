export const GRID_SIZE = 15;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE; // 225
export const STEP = 9;

// Traditional 15x15 Ram Shalaka Grid
// Authentic grid from Ramcharitmanas (Gita Press edition)
// Each row is an array of 15 Hindi akshars (letters/syllables)
export const GRID: string[][] = [
  ['सु', 'प्र', 'उ', 'बि', 'हो', 'मु', 'ग', 'ब', 'सु', 'नु', 'बि', 'घ', 'धि', 'इ', 'द'],
  ['र', 'रु', 'फ', 'सि', 'सि', 'रहिं', 'बस', 'हि', 'मं', 'ल', 'न', 'ल', 'य', 'न', 'अं'],
  ['सुज', 'सो', 'ग', 'सु', 'कु', 'म', 'स', 'ग', 'त', 'न', 'ई', 'ल', 'धा', 'बे', 'नो'],
  ['त्य', 'र', 'न', 'कु', 'जो', 'म', 'रि', 'र', 'र', 'अ', 'की', 'हो', 'सं', 'रा', 'य'],
  ['पु', 'सु', 'थ', 'सी', 'जे', 'इ', 'ग', 'म', 'सं', 'क', 'रे', 'हो', 'स', 'स', 'नि'],
  ['त', 'र', 'त', 'र', 'स', 'हुँ', 'ह', 'ब', 'ब', 'प', 'चि', 'स', 'हिं', 'स', 'तु'],
  ['म', 'का', 'ा', 'र', 'र', 'म', 'मि', 'मी', 'म्हा', 'ा', 'जा', 'हू', 'हीं', 'ा', 'ा'],
  ['ता', 'रा', 'रे', 'री', 'हृ', 'का', 'फ', 'खा', 'जू', 'ई', 'र', 'रा', 'पू', 'द', 'ल'],
  ['नि', 'को', 'जो', 'ो', 'न', 'मु', 'जि', 'यँ', 'ने', 'मनि', 'क', 'ज', 'प', 'स', 'ल'],
  ['हि', 'रा', 'मि', 'स', 'रि', 'ग', 'द', 'न्मु', 'ख', 'म', 'खि', 'जि', 'म', 'त', 'जं'],
  ['सिं', 'ख', 'नु', 'न', 'को', 'मि', 'निज', 'र्क', 'ग', 'धु', 'ध', 'सु', 'का', 'स', 'र'],
  ['गु', 'ब', 'म', 'अ', 'रि', 'नि', 'म', 'ल', 'ा', 'न', 'ढ़', 'ती', 'न', 'क', 'भ'],
  ['ना', 'पु', 'व', 'अ', 'ा', 'र', 'ल', 'ा', 'ए', 'तु', 'र', 'न', 'नु', 'वै', 'थ'],
  ['सि', 'हुँ', 'सु', 'म्ह', 'रा', 'र', 'स', 'स', 'र', 'त', 'न', 'ख', 'ा', 'ज', 'ा'],
  ['र', 'ा', 'ा', 'ला', 'धी', 'ा', 'री', 'ा', 'हू', 'हीं', 'खा', 'जू', 'ई', 'रा', 'रे'],
];

// Get a flat index from row and col
export function getIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

// Get row and col from flat index
export function getRowCol(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE,
  };
}

// Get letter at a flat index
export function getLetterAt(flatIndex: number): string {
  const { row, col } = getRowCol(flatIndex);
  return GRID[row][col];
}
