import { updateCharacter } from '../utils/characterState.js';


function getSequenciaOptions() {
  return Array.from({ length: 9 }, (_, i) => {
    const num = 9 - i;
    return { value: num, label: `${num}ª sequência` };
  });
}

function createAbilityRow() {
  const id = `ability-${abilityIdCounter++}`;
  const row = document.createElement('div');
  row.className = 'ability-row';
  row.setAttribute('data-ability-id', id);
  
  const sequenciaOptions = getSequenciaOptions();
  
  row.innerHTML = `
    <div class="ability-type-checkbox">
      <label class="ability-checkbox-label">
        <input type="checkbox" class="ability-is-passive" />
        <span>Passiva</span>
      </label>
    </div>
    <div class="ability-name-input">
      <input type="text" placeholder="Nome da habilidade" class="ability-name-field" />
    </div>
    <div class="ability-sequencia-select">
      <select class="ability-sequencia">
        <option value="">--</option>
        ${sequenciaOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
      </select>
    </div>
    <div class="ability-mana-input">
      <input type="number" placeholder="0" min="0" class="ability-mana-field" value="0" />
    </div>
    <div class="ability-description-input">
      <textarea placeholder="Descrição da habilidade" rows="2" class="ability-description-field"></textarea>
    </div>
    <div class="ability-cast-wrap">
      <button type="button" class="ability-cast-btn" title="Gastar mana da reserva atual">Conjurar</button>
    </div>
    <button class="btn-remove" type="button" title="Remover habilidade">✕</button>
  `;

  const passiveCheckbox = row.querySelector('.ability-is-passive');
  const manaInput = row.querySelector('.ability-mana-field');
  const removeBtn = row.querySelector('.btn-remove');
  const castBtn = row.querySelector('.ability-cast-btn');

  function updateCastState() {
    if (!castBtn || !passiveCheckbox) return;
    castBtn.disabled = passiveCheckbox.checked;
    castBtn.style.opacity = passiveCheckbox.checked ? '0.45' : '1';
  }

  if (passiveCheckbox && manaInput) {
    function updateManaField() {
      if (passiveCheckbox.checked) {
        manaInput.value = '-';
        manaInput.disabled = true;
        manaInput.readOnly = true;
      } else {
        manaInput.value = '0';
        manaInput.disabled = false;
        manaInput.readOnly = false;
      }
      updateCastState();
    }

    passiveCheckbox.addEventListener('change', updateManaField);
    updateManaField();
  }

  if (castBtn && manaInput && passiveCheckbox) {
    updateCastState();
    castBtn.addEventListener('click', () => {
      if (passiveCheckbox.checked) return;
      const mv = String(manaInput.value ?? '').trim();
      if (mv === '-' || mv === '') return;
      const cost = parseInt(mv, 10);
      if (Number.isNaN(cost) || cost < 0) return;
      const manaCurEl = document.getElementById('mana-current');
      if (!manaCurEl) return;
      const cur = parseInt(manaCurEl.value, 10) || 0;
      if (cur < cost) {
        if (typeof window.showToast === 'function') window.showToast('Mana insuficiente', 'warning');
        return;
      }
      manaCurEl.value = String(cur - cost);
      updateCharacter({ mana: cur - cost });
      manaCurEl.dispatchEvent(new Event('input', { bubbles: true }));
      manaCurEl.dispatchEvent(new Event('change', { bubbles: true }));
      if (typeof window.showToast === 'function') window.showToast(`Mana −${cost}`, 'success');
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      row.remove();
    });
  }

  return row;
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('abilities-container');
  const addBtn = document.getElementById('add-ability-btn');

  if (addBtn && container) {
    addBtn.addEventListener('click', () => {
      const row = createAbilityRow();
      container.appendChild(row);
    });
  }
});

window.createAbility = createAbilityRow;
