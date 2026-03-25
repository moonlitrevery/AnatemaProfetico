/**
 * Camada opcional de estado central (espelho) — convive com anatema-profetico-character e não o substitui.
 */

export const characterState = {
  mana: 0,
  dinheiro: 0,
  resistenciaExtra: 0,
  skills: [] as unknown[],
};

const CENTRAL_KEY = 'character';
const LEGACY_SHEET_KEY = 'anatema-profetico-character';

function persistCentralMirror() {
  try {
    localStorage.setItem(CENTRAL_KEY, JSON.stringify(characterState));
  } catch {
    /* ignore */
  }
}

function readLegacySheetIntoState() {
  try {
    const raw = localStorage.getItem(LEGACY_SHEET_KEY);
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
    characterState.mana = Number.isNaN(m) ? 0 : m;
    characterState.resistenciaExtra = Number.isNaN(r) ? 0 : Math.max(0, r);
    characterState.dinheiro = Number.isNaN(d) ? 0 : Math.max(0, d);
  } catch {
    /* ignore */
  }
}

/** @returns true se a chave `character` existia e o JSON era um objeto */
function readCentralKeyIntoState(): boolean {
  try {
    const raw = localStorage.getItem(CENTRAL_KEY);
    if (raw === null) return false;
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (!p || typeof p !== 'object' || Array.isArray(p)) return false;
    if (typeof p.mana === 'number' && !Number.isNaN(p.mana)) characterState.mana = p.mana;
    if (typeof p.dinheiro === 'number' && !Number.isNaN(p.dinheiro))
      characterState.dinheiro = Math.max(0, p.dinheiro);
    if (typeof p.resistenciaExtra === 'number' && !Number.isNaN(p.resistenciaExtra))
      characterState.resistenciaExtra = Math.max(0, p.resistenciaExtra);
    if (Array.isArray(p.skills)) characterState.skills = p.skills;
    return true;
  } catch {
    return false;
  }
}

/** Atualiza o espelho a partir do DOM (usa getAllCharacterData). */
export function syncCharacterStateFromDOM(): void {
  const g = typeof window !== 'undefined' ? window.getAllCharacterData : undefined;
  if (typeof g !== 'function') return;
  const data = g() as {
    header?: Record<string, string>;
    equipment?: { dinheiroReais?: number };
  };
  const h = data.header || {};
  const eq = data.equipment || {};
  const m = parseInt(String(h.manaCurrent ?? '0'), 10);
  const r = parseInt(String(h.resistenciaExtra ?? '0'), 10);
  const d = parseInt(String(eq.dinheiroReais ?? '0'), 10);
  characterState.mana = Number.isNaN(m) ? 0 : m;
  characterState.resistenciaExtra = Number.isNaN(r) ? 0 : r;
  characterState.dinheiro = Number.isNaN(d) ? 0 : Math.max(0, d);
  persistCentralMirror();
}

export function updateCharacter(patch: Partial<typeof characterState>): void {
  Object.assign(characterState, patch);
  persistCentralMirror();
  if (
    patch.mana !== undefined &&
    typeof window !== 'undefined' &&
    typeof window.updateProgressBars === 'function'
  ) {
    window.updateProgressBars();
  }
}

/** Chamar uma vez no boot; não depende do DOM. */
export function initCharacterStateLayer(): void {
  const hadCentral = readCentralKeyIntoState();
  if (!hadCentral) {
    readLegacySheetIntoState();
  }
  persistCentralMirror();
}

declare global {
  interface Window {
    characterState?: typeof characterState;
    updateCharacter?: typeof updateCharacter;
    syncCharacterStateFromDOM?: typeof syncCharacterStateFromDOM;
    initCharacterStateLayer?: typeof initCharacterStateLayer;
  }
}

if (typeof window !== 'undefined') {
  window.characterState = characterState;
  window.updateCharacter = updateCharacter;
  window.syncCharacterStateFromDOM = syncCharacterStateFromDOM;
  window.initCharacterStateLayer = initCharacterStateLayer;
}
