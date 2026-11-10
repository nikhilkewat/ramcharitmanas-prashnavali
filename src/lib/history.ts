import { useSyncExternalStore } from 'react';

export interface HistoryItem {
  cell: number;
  question: string;
  chaupaiHindi: string;
  chaupaiMeaning: string;
  result: string;
  timestamp: number;
}

const HISTORY_KEY = 'ram-prashnavali-history';
const MAX_HISTORY = 20;
const CHANGE_EVENT = 'ram-prashnavali-history-change';
const EMPTY: HistoryItem[] = [];

// Cache keyed on the raw string so getSnapshot returns a stable reference.
let cachedRaw: string | null = null;
let cachedItems: HistoryItem[] = EMPTY;

function readRaw(): string | null {
  try {
    return localStorage.getItem(HISTORY_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): HistoryItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : EMPTY;
      cachedItems = Array.isArray(parsed) ? parsed : EMPTY;
    } catch {
      cachedItems = EMPTY;
    }
  }
  return cachedItems;
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === HISTORY_KEY) onChange();
  };
  window.addEventListener('storage', onStorage); // other tabs
  window.addEventListener(CHANGE_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useHistory(): HistoryItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

const sameReading = (a: HistoryItem, b: HistoryItem) =>
  a.cell === b.cell && (a.question ?? '').trim() === (b.question ?? '').trim();

// The same cell + question (e.g. reopening a shared link or reloading the
// page) moves the existing entry to the top instead of adding a copy.
export function saveHistory(item: HistoryItem) {
  const rest = getSnapshot().filter((h) => !sameReading(h, item));
  const next = [item, ...rest].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    return; // storage unavailable (private mode, quota) — history is best-effort
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
