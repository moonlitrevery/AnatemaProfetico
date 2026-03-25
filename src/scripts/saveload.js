import { initCharacterStateLayer, syncCharacterStateFromDOM } from '../utils/characterState';

window.getAllCharacterData = function getAllCharacterData() {
  const safeStr = (v) => (v == null || v === undefined ? '' : String(v));
  const safeNumber = (v) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isNaN(n) ? 0 : n;
  };
  const safeInt = (v, fallback = 0) => {
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) ? fallback : n;
  };
  const safeArray = (v) => (Array.isArray(v) ? v : []);
  const safeBool = (v) => !!v;

  const basicInfo = {
    playerName: safeStr(document.getElementById('player-name')?.value),
    characterName: safeStr(document.getElementById('character-name')?.value),
    age: safeStr(document.getElementById('character-age')?.value),
    profession: safeStr(document.getElementById('character-profession')?.value),
    pronouns: safeArray(
      Array.from(document.querySelectorAll('.pronoun-checkbox:checked')).map((cb) => safeStr(cb.value))
    ),
    imageUrl: safeStr(document.getElementById('character-image-url')?.value),
  };

  const prestigioSelect = document.getElementById('prestigio');
  const coberturaActive = document.querySelector('.cobertura-btn.active');
  const vidaMaxEl = document.getElementById('vida-max');
  const manaMaxEl = document.getElementById('mana-max');
  const sanidadeMaxEl = document.getElementById('sanidade-max');

  const header = {
    caminho: safeStr(document.getElementById('caminho')?.value),
    sequencia: safeStr(document.getElementById('nivel-caminho')?.value),
    nivel: safeStr(document.getElementById('nivel')?.value),
    prestigio: safeStr(prestigioSelect?.value) || 'muito-baixo',
    dtCobertura: safeStr(coberturaActive?.dataset.cobertura),
    vidaCurrent: safeStr(document.getElementById('vida-current')?.value),
    vidaTemp: safeStr(document.getElementById('vida-temp')?.value),
    vidaExtra: safeStr(document.getElementById('vida-extra')?.value),
    manaCurrent: safeStr(document.getElementById('mana-current')?.value),
    manaTemp: safeStr(document.getElementById('mana-temp')?.value),
    manaExtra: safeStr(document.getElementById('mana-extra')?.value),
    sanidadeCurrent: safeStr(document.getElementById('sanidade-current')?.value),
    sanidadeTemp: safeStr(document.getElementById('sanidade-temp')?.value),
    sanidadeExtra: safeStr(document.getElementById('sanidade-extra')?.value),
    movimentoExtra: safeStr(document.getElementById('movimento-extra')?.value),
    resistenciaExtra: safeStr(document.getElementById('resistencia-extra')?.value),
    hpMax: safeNumber(vidaMaxEl?.value),
    manaMax: safeNumber(manaMaxEl?.value),
    sanidadeMax: safeNumber(sanidadeMaxEl?.value),
  };

  const sanityRaw =
    typeof window.getSanityData === 'function' ? window.getSanityData() : { insanidades: [], traumas: [] };
  const sanitySystem = {
    insanidades: safeArray(sanityRaw?.insanidades),
    traumas: safeArray(sanityRaw?.traumas),
  };

  const attributeIds = ['brutalidade', 'destreza', 'compleicao', 'mente', 'sobrenatural'];
  const attributes = {
    brutalidade: 0,
    destreza: 0,
    compleicao: 0,
    mente: 0,
    sobrenatural: 0,
  };
  attributeIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      const v = safeInt(input.value, 0);
      attributes[id] = safeNumber(v);
    }
  });

  const skills = [];
  document.querySelectorAll('.skill-row').forEach((row) => {
    const nameInput = row.querySelector('.skill-name');
    const nameStatic = row.querySelector('.skill-name-static');
    const valueInput = row.querySelector('.skill-value');
    const attrSelect = row.querySelector('.skill-attribute');
    const trainingSelect = row.querySelector('.skill-training');
    const skillId = row.getAttribute('data-skill-id');
    if (valueInput && attrSelect && skillId) {
      const name = safeStr(nameInput?.value || nameStatic?.textContent || '');
      const isEditable = !!nameInput;
      const vv = safeInt(valueInput.value, 0);
      skills.push({
        name,
        attribute: safeStr(attrSelect.value),
        value: safeNumber(vv),
        training: safeStr(trainingSelect?.value) || 'none',
        editable: isEditable,
        id: safeStr(skillId),
      });
    }
  });

  const equipment = {
    weapons: [],
    items: [],
    dinheiroReais: 0,
  };

  document.querySelectorAll('#weapons-list .equipment-row').forEach((row) => {
    const nameInput = row.querySelector('.equipment-name-input-field');
    const typeSelect = row.querySelector('.equipment-type');
    const damageInput = row.querySelector('.equipment-damage-input-field');
    const descInput = row.querySelector('.equipment-description-field');
    if (nameInput && typeSelect && damageInput && descInput) {
      equipment.weapons.push({
        name: safeStr(nameInput.value),
        type: safeStr(typeSelect.value) || 'branca',
        damage: safeStr(damageInput.value),
        description: safeStr(descInput.value),
      });
    }
  });

  document.querySelectorAll('#items-list .equipment-row').forEach((row) => {
    const nameInput = row.querySelector('.equipment-name-input-field');
    const descInput = row.querySelector('.equipment-description-field');
    const weightSelect = row.querySelector('.item-weight');
    if (nameInput && descInput && weightSelect) {
      const w = safeInt(weightSelect.value, 1);
      equipment.items.push({
        name: safeStr(nameInput.value),
        description: safeStr(descInput.value),
        weight: safeNumber(w) || 1,
      });
    }
  });

  const dinheiroEl = document.getElementById('equipment-dinheiro');
  if (dinheiroEl) {
    const d = safeInt(dinheiroEl.value, 0);
    equipment.dinheiroReais = Math.max(0, safeNumber(d));
  }

  const abilities = [];
  document.querySelectorAll('.ability-row').forEach((row) => {
    const nameInput = row.querySelector('.ability-name-field');
    const manaInput = row.querySelector('.ability-mana-field');
    const descInput = row.querySelector('.ability-description-field');
    const sequenciaSelect = row.querySelector('.ability-sequencia');
    const passiveCheckbox = row.querySelector('.ability-is-passive');
    const abilityId = row.getAttribute('data-ability-id');
    if (nameInput && manaInput && descInput && abilityId) {
      const passive = passiveCheckbox ? safeBool(passiveCheckbox.checked) : false;
      const rawMana = safeStr(manaInput.value);
      abilities.push({
        name: safeStr(nameInput.value),
        isPassive: passive,
        manaCost: passive ? '-' : (rawMana || '0'),
        sequencia: sequenciaSelect ? safeStr(sequenciaSelect.value) : '',
        description: safeStr(descInput.value),
        id: safeStr(abilityId),
      });
    }
  });

  const notes = {
    sobre: safeStr(document.getElementById('notes-sobre')?.value),
    sessoes: safeStr(document.getElementById('notes-sessoes')?.value),
    aliados: safeStr(document.getElementById('notes-aliados')?.value),
    inimigos: safeStr(document.getElementById('notes-inimigos')?.value),
    extras: safeStr(document.getElementById('notes-extras')?.value),
  };

  const successBoxes = Array.from(
    document.querySelectorAll('.death-save-checkbox[data-type="success"]')
  );
  const failureBoxes = Array.from(
    document.querySelectorAll('.death-save-checkbox[data-type="failure"]')
  );
  const conditionsRaw =
    typeof window.getConditionsData === 'function' ? window.getConditionsData() : [];

  const status = {
    machucado: safeBool(document.getElementById('status-machucado-check')?.checked),
    morrendo: safeBool(document.getElementById('status-morrendo-check')?.checked),
    insano: safeBool(document.getElementById('status-insano-check')?.checked),
    deathSaves: {
      successes: successBoxes.map((cb) => safeBool(cb.checked)),
      failures: failureBoxes.map((cb) => safeBool(cb.checked)),
    },
    conditions: safeArray(conditionsRaw),
  };

  const result = {
    basicInfo,
    header,
    attributes,
    skills,
    equipment,
    abilities,
    notes,
    status,
    sanitySystem,
    habilidades: abilities.slice(),
    pericias: skills.slice(),
    atributos: { ...attributes },
    inventario: {
      weapons: equipment.weapons.slice(),
      items: equipment.items.slice(),
      dinheiroReais: safeNumber(equipment.dinheiroReais),
    },
  };

  try {
    console.log('CHARACTER DATA:', structuredClone(result));
  } catch (e) {
    console.warn('structuredClone failed, logging raw result instead');
    console.log('CHARACTER DATA (raw):', result);
  }

  return result;
};

function getAllCharacterData() {
  return window.getAllCharacterData();
}

window.loadCharacterData = function loadCharacterData(data) {
  const playerNameInput = document.getElementById('player-name');
  const charNameInput = document.getElementById('character-name');
  const ageInput = document.getElementById('character-age');
  const professionInput = document.getElementById('character-profession');
  const imageUrlInput = document.getElementById('character-image-url');

  if (playerNameInput) playerNameInput.value = data.basicInfo?.playerName || '';
  if (charNameInput) charNameInput.value = data.basicInfo?.characterName || '';
  if (ageInput) ageInput.value = data.basicInfo?.age || '';
  if (professionInput) professionInput.value = data.basicInfo?.profession || '';
  if (data.basicInfo?.pronouns) {
    const pronouns = Array.isArray(data.basicInfo.pronouns) ? data.basicInfo.pronouns : (data.basicInfo.pronouns ? [data.basicInfo.pronouns] : []);
    document.querySelectorAll('.pronoun-checkbox').forEach(cb => {
      cb.checked = pronouns.includes(cb.value);
    });
    if (window.updatePronounsDisplay) {
      window.updatePronounsDisplay();
    }
  }
  if (imageUrlInput) {
    imageUrlInput.value = data.basicInfo?.imageUrl || '';
    imageUrlInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (data.header) {
    const caminhoSelect = document.getElementById('caminho');
    const sequenciaInput = document.getElementById('nivel-caminho');
    const nivelSelect = document.getElementById('nivel');
    const prestigioSelect = document.getElementById('prestigio');

    if (caminhoSelect) {
      // Compatibilidade: se o valor não estiver na lista, tentar encontrar o mais próximo
      const caminhoValue = data.header.caminho || '';
      if (caminhoValue) {
        // Verificar se o valor existe nas opções
        const optionExists = Array.from(caminhoSelect.options).some(opt => opt.value === caminhoValue);
        if (optionExists) {
          caminhoSelect.value = caminhoValue;
        } else {
          // Se não existir, tentar adicionar como opção temporária ou usar o primeiro disponível
          caminhoSelect.value = caminhoValue;
        }
      }
    }
    if (sequenciaInput) sequenciaInput.value = data.header.sequencia || data.header.nivelCaminho || '';
    if (nivelSelect) {
      const nivelValue = data.header.nivel || '0';
      nivelSelect.value = nivelValue;
      // Inicializar lastLevel para nivelamento progressivo
      nivelSelect.dataset.lastLevel = nivelValue;
      nivelSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (prestigioSelect) prestigioSelect.value = data.header.prestigio || 'muito-baixo';

    const vidaCurrentInput = document.getElementById('vida-current');
    const vidaTempInput = document.getElementById('vida-temp');
    const vidaExtraInput = document.getElementById('vida-extra');
    const manaCurrentInput = document.getElementById('mana-current');
    const manaTempInput = document.getElementById('mana-temp');
    const manaExtraInput = document.getElementById('mana-extra');
    const sanidadeCurrentInput = document.getElementById('sanidade-current');
    const sanidadeTempInput = document.getElementById('sanidade-temp');
    const sanidadeExtraInput = document.getElementById('sanidade-extra');
    const movimentoExtraInput = document.getElementById('movimento-extra');

    if (vidaCurrentInput) vidaCurrentInput.value = data.header.vidaCurrent || '';
    if (vidaTempInput) vidaTempInput.value = data.header.vidaTemp || '';
    if (vidaExtraInput) vidaExtraInput.value = data.header.vidaExtra || '';
    if (manaCurrentInput) manaCurrentInput.value = data.header.manaCurrent || '';
    if (manaTempInput) manaTempInput.value = data.header.manaTemp || '';
    if (manaExtraInput) manaExtraInput.value = data.header.manaExtra || '';
    if (sanidadeCurrentInput) sanidadeCurrentInput.value = data.header.sanidadeCurrent || '';
    if (sanidadeTempInput) sanidadeTempInput.value = data.header.sanidadeTemp || '';
    if (sanidadeExtraInput) sanidadeExtraInput.value = data.header.sanidadeExtra || '';
    if (movimentoExtraInput) movimentoExtraInput.value = data.header.movimentoExtra || '';
    const resistenciaExtraInput = document.getElementById('resistencia-extra');
    if (resistenciaExtraInput) resistenciaExtraInput.value = data.header.resistenciaExtra ?? '';
    if (data.header.dtCobertura) {
      document.querySelectorAll('.cobertura-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cobertura === data.header.dtCobertura);
      });
    }
  }

  Object.entries(data.attributes || {}).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = String(value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  if (data.skills && data.skills.length > 0) {
    data.skills.forEach((skill) => {
      const row = document.querySelector(`[data-skill-id="${skill.id}"]`);
      if (row) {
        const nameInput = row.querySelector('.skill-name');
        const valueInput = row.querySelector('.skill-value');
        const attrSelect = row.querySelector('.skill-attribute');
        const trainingSelect = row.querySelector('.skill-training');
        if (nameInput && skill.editable) {
          nameInput.value = skill.name;
        }
        if (valueInput) valueInput.value = String(skill.value);
        if (attrSelect) {
          if (!attrSelect.disabled || skill.editable) {
            attrSelect.value = skill.attribute;
            attrSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        if (trainingSelect && skill.training) {
          trainingSelect.value = skill.training;
          trainingSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  }

  const weaponsList = document.getElementById('weapons-list');
  const itemsList = document.getElementById('items-list');

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (weaponsList && data.equipment?.weapons) {
    weaponsList.innerHTML = '';
    data.equipment.weapons.forEach((weapon) => {
      const weaponDiv = document.createElement('div');
      weaponDiv.className = 'equipment-row';
      const weaponTypesList = [
        { value: 'branca', label: 'Arma branca' },
        { value: 'fogo', label: 'Arma de Fogo' },
        { value: 'magica', label: 'Arma mágica' },
      ];
      weaponDiv.innerHTML = `
        <div class="equipment-name-input">
          <input type="text" placeholder="Nome da arma" class="equipment-name-input-field" value="${escapeHtml(weapon.name || '')}" />
        </div>
        <div class="equipment-type-select">
          <select class="equipment-type">
            ${weaponTypesList.map(type => `<option value="${type.value}" ${weapon.type === type.value ? 'selected' : ''}>${escapeHtml(type.label)}</option>`).join('')}
          </select>
        </div>
        <div class="equipment-damage-input">
          <input type="text" placeholder="Dano" class="equipment-damage-input-field" value="${escapeHtml(weapon.damage || '')}" />
        </div>
        <div class="equipment-description-input">
          <textarea placeholder="Descrição" rows="2" class="equipment-description-field">${escapeHtml(weapon.description || '')}</textarea>
        </div>
        <button class="btn-remove" type="button" title="Remover arma">✕</button>
      `;
      const removeBtn = weaponDiv.querySelector('.btn-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => weaponDiv.remove());
      }
      weaponsList.appendChild(weaponDiv);
    });
  }

  if (itemsList && data.equipment?.items) {
    itemsList.innerHTML = '';
    data.equipment.items.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'equipment-row';
      const weightOptions = Array.from({ length: 9 }, (_, i) => i + 1);
      itemDiv.innerHTML = `
        <div class="equipment-name-input">
          <input type="text" placeholder="Nome do item" class="equipment-name-input-field" value="${escapeHtml(item.name || '')}" />
        </div>
        <div class="equipment-description-input">
          <textarea placeholder="Descrição" rows="2" class="equipment-description-field">${escapeHtml(item.description || '')}</textarea>
        </div>
        <div class="equipment-weight-select">
          <select class="item-weight">
            ${weightOptions.map(weight => `<option value="${weight}" ${item.weight === weight ? 'selected' : ''}>${weight}</option>`).join('')}
          </select>
        </div>
        <button class="btn-remove" type="button" title="Remover item">✕</button>
      `;
      const removeBtn = itemDiv.querySelector('.btn-remove');
      const weightSelect = itemDiv.querySelector('.item-weight');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          itemDiv.remove();
          if (window.updateWeightDisplay) window.updateWeightDisplay();
        });
      }
      if (weightSelect) {
        weightSelect.addEventListener('change', () => {
          if (window.updateWeightDisplay) window.updateWeightDisplay();
        });
      }
      itemsList.appendChild(itemDiv);
    });
    setTimeout(() => {
      if (window.updateWeightDisplay) window.updateWeightDisplay();
    }, 200);
  }

  const equipmentDinheiroInput = document.getElementById('equipment-dinheiro');
  if (equipmentDinheiroInput && data.equipment) {
    const raw = data.equipment.dinheiroReais;
    const d =
      raw === undefined || raw === null || raw === ''
        ? 0
        : parseInt(String(raw), 10);
    equipmentDinheiroInput.value = String(Number.isNaN(d) || d < 0 ? 0 : d);
  }

  if (data.abilities && data.abilities.length > 0) {
    const abilitiesContainer = document.getElementById('abilities-container');
    if (abilitiesContainer) {
      abilitiesContainer.innerHTML = '';
      data.abilities.forEach((ability) => {
        const row = window.createAbility ? window.createAbility() : document.createElement('div');
        if (row.className === 'ability-row') {
          const nameInput = row.querySelector('.ability-name-field');
          const manaInput = row.querySelector('.ability-mana-field');
          const descInput = row.querySelector('.ability-description-field');
          const sequenciaSelect = row.querySelector('.ability-sequencia');
          const passiveCheckbox = row.querySelector('.ability-is-passive');
          
          if (nameInput) nameInput.value = ability.name || '';
          if (descInput) descInput.value = ability.description || '';
          if (sequenciaSelect && ability.sequencia) {
            sequenciaSelect.value = ability.sequencia;
          }
          if (passiveCheckbox) {
            passiveCheckbox.checked = !!ability.isPassive;
            passiveCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (manaInput && !ability.isPassive && ability.manaCost !== '-') {
            const m = parseInt(ability.manaCost, 10);
            manaInput.value = Number.isNaN(m) ? '0' : String(m);
          }
          
          abilitiesContainer.appendChild(row);
        }
      });
    }
  }

  if (data.notes) {
    const sobreInput = document.getElementById('notes-sobre');
    const sessoesInput = document.getElementById('notes-sessoes');
    const aliadosInput = document.getElementById('notes-aliados');
    const inimigosInput = document.getElementById('notes-inimigos');
    const extrasInput = document.getElementById('notes-extras');
    
    if (sobreInput) sobreInput.value = data.notes.sobre || '';
    if (sessoesInput) sessoesInput.value = data.notes.sessoes || '';
    if (aliadosInput) aliadosInput.value = data.notes.aliados || '';
    if (inimigosInput) inimigosInput.value = data.notes.inimigos || '';
    if (extrasInput) extrasInput.value = data.notes.extras || '';
  }
  
  // Compatibilidade com formato antigo (notes como string)
  if (typeof data.notes === 'string') {
    const sobreInput = document.getElementById('notes-sobre');
    if (sobreInput) sobreInput.value = data.notes || '';
  }

  if (data.status) {
    if (data.status.deathSaves) {
      const successCheckboxes = document.querySelectorAll('.death-save-checkbox[data-type="success"]');
      const failureCheckboxes = document.querySelectorAll('.death-save-checkbox[data-type="failure"]');

      if (data.status.deathSaves.successes) {
        successCheckboxes.forEach((cb, index) => {
          cb.checked = !!data.status.deathSaves.successes[index];
        });
      }

      if (data.status.deathSaves.failures) {
        failureCheckboxes.forEach((cb, index) => {
          cb.checked = !!data.status.deathSaves.failures[index];
        });
      }
    }
  }

  if (data.sanitySystem && typeof window.loadSanityData === 'function') {
    window.loadSanityData(data.sanitySystem);
  }

  document.dispatchEvent(new Event('characterDataChanged', { bubbles: true }));

  setTimeout(() => {
    if (window.updateHeaderValues) window.updateHeaderValues();
    if (data.status?.conditions && typeof window.loadConditionsData === 'function') {
      window.loadConditionsData(data.status.conditions);
    }
    if (window.updateInlineStatus) window.updateInlineStatus();
    
    // Inicializar lastLevel para nivelamento progressivo após carregar dados
    const nivelSelect = document.getElementById('nivel');
    if (nivelSelect) {
      const currentLevel = parseInt(nivelSelect.value) || 0;
      nivelSelect.dataset.lastLevel = String(currentLevel);
    }
    syncCharacterStateFromDOM();
  }, 300);
};

function loadCharacterData(data) {
  return window.loadCharacterData(data);
}

initCharacterStateLayer();

function updateSaveIndicator() {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  const ts = localStorage.getItem('anatema-save-timestamp');
  if (!ts) {
    el.textContent = '';
    el.style.display = 'none';
    return;
  }
  const ms = parseInt(ts, 10);
  if (Number.isNaN(ms)) return;
  const diffMs = Date.now() - ms;
  const diffMin = Math.floor(diffMs / 60000);
  const diffSec = Math.floor((diffMs % 60000) / 1000);
  let text = '';
  if (diffMin >= 1) {
    text = diffMin === 1 ? 'Salvo há 1 minuto' : `Salvo há ${diffMin} minutos`;
  } else if (diffSec >= 5) {
    text = `Salvo há ${diffSec} segundos`;
  } else {
    text = 'Salvo agora';
  }
  el.textContent = text;
  el.style.display = 'block';
}

function showMessage(message, type = 'success') {
  const messageDiv = document.getElementById('save-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `save-message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.updateAllCalculatedValues = function updateAllCalculatedValues() {
    if (typeof window.updateHeaderValues === 'function') window.updateHeaderValues();
    if (typeof window.updateInlineStatus === 'function') window.updateInlineStatus();
    if (typeof window.updateProgressBars === 'function') window.updateProgressBars();
    if (typeof window.updateWeightDisplay === 'function') window.updateWeightDisplay();
  };

  window.saveCharacter = function saveCharacter() {
    if (!document.querySelector('[data-page="personagem"]')) return;
    try {
      const data = getAllCharacterData();
      localStorage.setItem('anatema-profetico-character', JSON.stringify(data));
      localStorage.setItem('anatema-save-timestamp', String(Date.now()));
      if (typeof updateSaveIndicator === 'function') updateSaveIndicator();
    } catch (error) {
      console.error(error);
    }
  };

  window.addEventListener('characterStateUpdated', () => {
    if (typeof window.updateAllCalculatedValues === 'function') {
      window.updateAllCalculatedValues();
    }
    if (typeof window.saveCharacter === 'function') {
      window.saveCharacter();
    }
  });

  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      try {
        const data = getAllCharacterData();
        
        // Salvar localmente
        localStorage.setItem('anatema-profetico-character', JSON.stringify(data));
        localStorage.setItem('anatema-save-timestamp', String(Date.now()));
        
        showMessage('Ficha salva localmente com sucesso!', 'success');
        updateSaveIndicator();
      } catch (error) {
        console.error(error);
        showMessage('Erro ao salvar a ficha.', 'error');
      }
    });
  }

  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        const data = getAllCharacterData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha-${data.basicInfo.characterName || 'personagem'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('Ficha exportada com sucesso!', 'success');
      } catch (error) {
        console.error(error);
        showMessage('Erro ao exportar a ficha.', 'error');
      }
    });
  }

  const importInput = document.getElementById('import-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target.result;
            const data = JSON.parse(json);
            loadCharacterData(data);
            showMessage('Ficha importada com sucesso!', 'success');
          } catch (error) {
            console.error(error);
            showMessage('Erro ao importar a ficha. Verifique se o arquivo é válido.', 'error');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar toda a ficha? Esta ação não pode ser desfeita.')) {
        // Limpar todos os campos
        document.querySelectorAll('input, textarea').forEach((input) => {
          if (input) {
            if (input.type === 'checkbox' || input.type === 'radio') {
              input.checked = false;
            } else if (input.type !== 'file') {
              input.value = '';
            }
          }
        });

        // Resetar nível
        const nivelSelect = document.getElementById('nivel');
        if (nivelSelect) {
          nivelSelect.value = '0';
          nivelSelect.dataset.lastLevel = '0';
        }

        document.querySelectorAll('.cobertura-btn').forEach(b => b.classList.remove('active'));

        const weaponsList = document.getElementById('weapons-list');
        const itemsList = document.getElementById('items-list');
        if (weaponsList) weaponsList.innerHTML = '';
        if (itemsList) itemsList.innerHTML = '';

        if (typeof window.resetSkillsToDefault === 'function') {
          window.resetSkillsToDefault();
        }

        const abilitiesContainer = document.getElementById('abilities-container');
        if (abilitiesContainer) abilitiesContainer.innerHTML = '';

        const equipmentDinheiroClear = document.getElementById('equipment-dinheiro');
        if (equipmentDinheiroClear) equipmentDinheiroClear.value = '0';

        const resistenciaExtraClear = document.getElementById('resistencia-extra');
        if (resistenciaExtraClear) resistenciaExtraClear.value = '';

        if (typeof window.loadSanityData === 'function') {
          window.loadSanityData({ insanidades: [], traumas: [] });
        }

        // Limpar localStorage
        localStorage.removeItem('anatema-profetico-character');
        localStorage.removeItem('anatema-save-timestamp');
        
        showMessage('Ficha limpa com sucesso!', 'success');
        updateSaveIndicator();
        
        setTimeout(() => {
          if (window.updateHeaderValues) window.updateHeaderValues();
          if (window.updateInlineStatus) window.updateInlineStatus();
          syncCharacterStateFromDOM();
        }, 300);
      }
    });
  }

  updateSaveIndicator();
  setInterval(updateSaveIndicator, 2000);

  function loadSavedData() {
    try {
      const savedData = localStorage.getItem('anatema-profetico-character');
      if (savedData) {
        const data = JSON.parse(savedData);
        setTimeout(() => {
          loadCharacterData(data);
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
  }

  // carregar agora
  loadSavedData();

  requestAnimationFrame(() => {
    if (document.querySelector('[data-page="personagem"]')) {
      setTimeout(() => syncCharacterStateFromDOM(), 450);
    }
  });

  window.addEventListener('focus', () => {
    if (document.querySelector('[data-page="personagem"]')) {
      setTimeout(loadSavedData, 100);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && document.querySelector('[data-page="personagem"]')) {
      setTimeout(loadSavedData, 100);
    }
  });

  let autoSaveInterval = null;
  function setupAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(() => {
      if (document.querySelector('[data-page="personagem"]')) {
        try {
          const data = getAllCharacterData();
          localStorage.setItem('anatema-profetico-character', JSON.stringify(data));
          localStorage.setItem('anatema-save-timestamp', String(Date.now()));
          if (typeof updateSaveIndicator === 'function') updateSaveIndicator();
        } catch (error) {
          console.error('Erro no auto-save:', error);
        }
      }
    }, 1000);
  }

  setupAutoSave();

  let autoSaveTimeout = null;
  function triggerAutoSave() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      if (document.querySelector('[data-page="personagem"]')) {
        try {
          const data = getAllCharacterData();
          localStorage.setItem('anatema-profetico-character', JSON.stringify(data));
          localStorage.setItem('anatema-save-timestamp', String(Date.now()));
          if (typeof updateSaveIndicator === 'function') updateSaveIndicator();
        } catch (error) {
          console.error('Erro no auto-save:', error);
        }
      }
    }, 1000);
  }

  document.addEventListener('input', triggerAutoSave, { passive: true });
  document.addEventListener('change', triggerAutoSave, { passive: true });
});
