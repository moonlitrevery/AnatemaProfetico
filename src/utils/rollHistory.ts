/**
 * Histórico de rolagens para Anátema Profético
 */

export type RollType = 'atributo' | 'pericia' | 'ataque' | 'salvamento' | 'custom';

export interface RollHistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  type: RollType;
  diceType: string;
  result: number;
  modifier: number;
  total: number;
  critical?: boolean;
  fumble?: boolean;
}

const MAX_ENTRIES = 100;
const STORAGE_KEY = 'anatema-roll-history';

let entries: RollHistoryEntry[] = [];

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      entries = JSON.parse(saved);
    } else {
      entries = [];
    }
  } catch {
    entries = [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // ignore
  }
}

export function addRollEntry(entry: Omit<RollHistoryEntry, 'id' | 'timestamp'>) {
  loadFromStorage();
  const full: RollHistoryEntry = {
    ...entry,
    id: `roll-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  };
  entries.push(full);
  if (entries.length > MAX_ENTRIES) {
    entries = entries.slice(-MAX_ENTRIES);
  }
  saveToStorage();
  return full;
}

export function getRollHistory(filter?: RollType): RollHistoryEntry[] {
  loadFromStorage();
  const list = filter ? entries.filter(e => e.type === filter) : [...entries];
  return list.reverse();
}

export function clearRollHistory() {
  entries = [];
  saveToStorage();
}
