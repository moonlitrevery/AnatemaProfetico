/**
 * Espelho passivo em memória — a ficha real continua no DOM + localStorage "anatema-profetico-character".
 * syncCharacterStateFromDOM é a única ponte DOM → characterState.
 */

export const characterState = {
  mana: 0,
  dinheiro: 0,
  resistenciaExtra: 0,
  skills: [] as unknown[],
};

const SHEET_KEY = 'anatema-profetico-character';

function normalizeMana(v: unknown): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

function normalizeDinheiro(v: unknown): number {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

function normalizeResistenciaExtra(v: unknown): number {
  const n = parseInt(String(v ?? ''), 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

/** Hidrata o espelho a partir do JSON da ficha salva (mesma fonte que o resto do app). */
function readSheetJsonIntoState() {
  try {
    const raw = localStorage.getItem(SHEET_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as {
      header?: { manaCurrent?: string; resistenciaExtra?: string };
      equipment?: { dinheiroReais?: number | string };
    };
    const h = data.header || {};
    const eq = data.equipment || {};
    const m = parseInt(String(h.manaCurrent ?? '0'), 10);
    const r = parseInt(String(h.resistenciaExtra ?? '0'), 10);
    const d = parseInt(String(eq.dinheiroReais ?? '0'), 10);
    characterState.mana = Number.isNaN(m) ? 0 : Math.max(0, m);
    characterState.resistenciaExtra = Number.isNaN(r) ? 0 : Math.max(0, r);
    characterState.dinheiro = Number.isNaN(d) ? 0 : Math.max(0, d);
  } catch {
    /* ignore */
  }
}

/** Única ponte DOM → characterState (read-only em relação ao armazenamento). */
export function syncCharacterStateFromDOM(): void {
  const g = typeof window !== 'undefined' ? window.getAllCharacterData : undefined;
  if (typeof g !== 'function') return;
  const data = g() as {
    header?: Record<string, string>;
    equipment?: { dinheiroReais?: number };
  };
  const h = data.header || {};
  const eq = data.equipment || {};
  const m = normalizeMana(parseInt(String(h.manaCurrent ?? '0'), 10));
  const r = normalizeResistenciaExtra(h.resistenciaExtra ?? '');
  const d = normalizeDinheiro(eq.dinheiroReais ?? 0);

  if (m !== characterState.mana) characterState.mana = m;
  if (r !== characterState.resistenciaExtra) characterState.resistenciaExtra = r;
  if (d !== characterState.dinheiro) characterState.dinheiro = d;
}

/** Apenas atualiza o objeto em memória (sem localStorage, sem DOM, sem side effects). */
export function updateCharacter(patch: Partial<typeof characterState>): void {
  if (patch.mana !== undefined) characterState.mana = normalizeMana(patch.mana);
  if (patch.dinheiro !== undefined) characterState.dinheiro = normalizeDinheiro(patch.dinheiro);
  if (patch.resistenciaExtra !== undefined)
    characterState.resistenciaExtra = normalizeResistenciaExtra(patch.resistenciaExtra);
  if (patch.skills !== undefined) characterState.skills = patch.skills as unknown[];
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('characterStateUpdated'));
  }
}

/** Boot: só lê "anatema-profetico-character" (antes do DOM estar disponível). */
export function initCharacterStateLayer(): void {
  readSheetJsonIntoState();
}

declare global {
  interface Window {
    characterState?: typeof characterState;
    updateCharacter?: typeof updateCharacter;
    syncCharacterStateFromDOM?: typeof syncCharacterStateFromDOM;
    initCharacterStateLayer?: typeof initCharacterStateLayer;
    updateAllCalculatedValues?: () => void;
    saveCharacter?: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.characterState = characterState;
  window.updateCharacter = updateCharacter;
  window.syncCharacterStateFromDOM = syncCharacterStateFromDOM;
  window.initCharacterStateLayer = initCharacterStateLayer;
}
