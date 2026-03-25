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

/** Enquanto true: syncCharacterStateFromDOM não roda (evita DOM velho sobrescrever estado recém-atualizado). */
let applyingStateToDom = false;

function persistCentralMirror() {
  try {
    localStorage.setItem(CENTRAL_KEY, JSON.stringify(characterState));
  } catch {
    /* ignore */
  }
}

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
    characterState.mana = Number.isNaN(m) ? 0 : Math.max(0, m);
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
    if (typeof p.mana === 'number' && !Number.isNaN(p.mana)) characterState.mana = Math.max(0, p.mana);
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
  if (applyingStateToDom) return;

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

  let changed = false;
  if (m !== characterState.mana) {
    characterState.mana = m;
    changed = true;
  }
  if (r !== characterState.resistenciaExtra) {
    characterState.resistenciaExtra = r;
    changed = true;
  }
  if (d !== characterState.dinheiro) {
    characterState.dinheiro = d;
    changed = true;
  }
  if (changed) persistCentralMirror();
}

export function updateCharacter(patch: Partial<typeof characterState>): void {
  let stateChanged = false;
  let manaChanged = false;
  let pushMana = false;
  let pushDinheiro = false;
  let pushResistencia = false;

  if (patch.mana !== undefined) {
    const nm = normalizeMana(patch.mana);
    if (nm !== characterState.mana) {
      characterState.mana = nm;
      stateChanged = true;
      manaChanged = true;
      pushMana = true;
    }
  }

  if (patch.dinheiro !== undefined) {
    const nd = normalizeDinheiro(patch.dinheiro);
    if (nd !== characterState.dinheiro) {
      characterState.dinheiro = nd;
      stateChanged = true;
      pushDinheiro = true;
    }
  }

  if (patch.resistenciaExtra !== undefined) {
    const nr = normalizeResistenciaExtra(patch.resistenciaExtra);
    if (nr !== characterState.resistenciaExtra) {
      characterState.resistenciaExtra = nr;
      stateChanged = true;
      pushResistencia = true;
    }
  }

  if (patch.skills !== undefined) {
    const prev = JSON.stringify(characterState.skills);
    const next = JSON.stringify(patch.skills);
    if (prev !== next) {
      characterState.skills = patch.skills as unknown[];
      stateChanged = true;
    }
  }

  if (!stateChanged) return;

  persistCentralMirror();

  if (pushMana || pushDinheiro || pushResistencia) {
    applyingStateToDom = true;
    try {
      if (typeof document !== 'undefined') {
        if (pushMana) {
          const el = document.getElementById('mana-current') as HTMLInputElement | null;
          if (el) {
            const cur = parseInt(el.value, 10);
            const t = characterState.mana;
            if (Number.isNaN(cur) || cur !== t) {
              el.value = String(t);
            }
          }
        }
        if (pushDinheiro) {
          const el = document.getElementById('equipment-dinheiro') as HTMLInputElement | null;
          if (el) {
            const cur = parseInt(el.value, 10);
            const t = characterState.dinheiro;
            if (Number.isNaN(cur) || cur !== t) {
              el.value = String(t);
            }
          }
        }
        if (pushResistencia) {
          const el = document.getElementById('resistencia-extra') as HTMLInputElement | null;
          if (el) {
            const cur = parseInt(el.value, 10);
            const t = characterState.resistenciaExtra;
            if (Number.isNaN(cur) || cur !== t) {
              el.value = String(t);
            }
          }
          if (typeof window !== 'undefined' && typeof window.updateHeaderValues === 'function') {
            window.updateHeaderValues(true);
          }
        }
      }
    } finally {
      applyingStateToDom = false;
    }
  }

  if (
    manaChanged &&
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
