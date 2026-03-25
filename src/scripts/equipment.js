import { updateCharacter } from '../utils/characterState';

let equipmentIdCounter = 0;

// Tipos de arma
const weaponTypes = [
  { value: 'branca', label: 'Arma branca' },
  { value: 'fogo', label: 'Arma de Fogo' },
  { value: 'magica', label: 'Arma mágica' },
];

// Opções de peso (1-9)
const weightOptions = Array.from({ length: 9 }, (_, i) => i + 1);

// Função para obter valor de atributo
function getAttributeValue(attributeId) {
  const input = document.getElementById(attributeId);
  if (!input) return 0;
  return parseInt(input.value || '0');
}

// Função para calcular peso máximo (Brutalidade / 2)
function getMaxWeight() {
  const brutalidade = getAttributeValue('brutalidade');
  return Math.floor(brutalidade / 2);
}

// Função para calcular peso atual dos itens
function getCurrentWeight() {
  const items = document.querySelectorAll('.item-weight');
  let total = 0;
  items.forEach((item) => {
    const weight = parseInt(item.value) || 0;
    total += weight;
  });
  return total;
}

// Função para atualizar display de peso
function updateWeightDisplay() {
  const currentWeight = getCurrentWeight();
  const maxWeight = getMaxWeight();
  
  const currentEl = document.getElementById('weight-current');
  const maxEl = document.getElementById('weight-max');
  
  if (currentEl) {
    currentEl.textContent = currentWeight.toString();
    // Mudar cor se sobrecarregado
    if (currentWeight > maxWeight && maxWeight > 0) {
      currentEl.style.color = '#cc7d7d'; // Vermelho claro
    } else {
      currentEl.style.color = ''; // Voltar ao padrão
    }
  }
  if (maxEl) {
    maxEl.textContent = maxWeight.toString();
  }
  
  // Disparar evento para atualizar movimento no Header
  document.dispatchEvent(new CustomEvent('weightChanged', { 
    detail: { current: currentWeight, max: maxWeight } 
  }));
}

function createWeapon() {
  const container = document.getElementById('weapons-list');
  if (!container) return;

  const id = `weapon-${equipmentIdCounter++}`;
  const weaponDiv = document.createElement('div');
  weaponDiv.className = 'equipment-row';
  weaponDiv.id = id;
  
  weaponDiv.innerHTML = `
    <div class="equipment-name-input">
      <input 
        type="text" 
        placeholder="Nome da arma" 
        class="equipment-name-input-field"
      />
    </div>
    <div class="equipment-type-select">
      <select class="equipment-type">
        ${weaponTypes.map(type => 
          `<option value="${type.value}">${type.label}</option>`
        ).join('')}
      </select>
    </div>
    <div class="equipment-damage-input">
      <input 
        type="text" 
        placeholder="Dano" 
        class="equipment-damage-input-field"
      />
    </div>
    <div class="equipment-description-input">
      <textarea 
        placeholder="Descrição" 
        rows="2" 
        class="equipment-description-field"
      ></textarea>
    </div>
    <button class="btn-remove" type="button" title="Remover arma">✕</button>
  `;

  const removeBtn = weaponDiv.querySelector('.btn-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      weaponDiv.remove();
    });
  }

  container.appendChild(weaponDiv);
}

function createItem() {
  const container = document.getElementById('items-list');
  if (!container) return;

  const id = `item-${equipmentIdCounter++}`;
  const itemDiv = document.createElement('div');
  itemDiv.className = 'equipment-row';
  itemDiv.id = id;
  
  itemDiv.innerHTML = `
    <div class="equipment-name-input">
      <input 
        type="text" 
        placeholder="Nome do item" 
        class="equipment-name-input-field"
      />
    </div>
    <div class="equipment-description-input">
      <textarea 
        placeholder="Descrição" 
        rows="2" 
        class="equipment-description-field"
      ></textarea>
    </div>
    <div class="equipment-weight-select">
      <select class="item-weight">
        ${weightOptions.map(weight => 
          `<option value="${weight}">${weight}</option>`
        ).join('')}
      </select>
    </div>
    <button class="btn-remove" type="button" title="Remover item">✕</button>
  `;

  const removeBtn = itemDiv.querySelector('.btn-remove');
  const weightSelect = itemDiv.querySelector('.item-weight');
  
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      itemDiv.remove();
      updateWeightDisplay();
    });
  }

  if (weightSelect) {
    weightSelect.addEventListener('change', () => {
      updateWeightDisplay();
    });
  }

  container.appendChild(itemDiv);
  updateWeightDisplay();
}

// Inicializar event listeners quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const addWeaponBtn = document.getElementById('add-weapon-btn');
  const addItemBtn = document.getElementById('add-item-btn');

  if (addWeaponBtn) {
    addWeaponBtn.addEventListener('click', () => createWeapon());
  }

  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => createItem());
  }

  // Atualizar peso quando atributo mudar
  function initializeWeightListener() {
    if (window.equipmentWeightListenerInitialized) return;
    window.equipmentWeightListenerInitialized = true;

    document.addEventListener('change', (e) => {
      const target = e.target;
      if (target && target.id === 'brutalidade') {
        updateWeightDisplay();
      }
    }, { passive: true, capture: true });

    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target && target.id === 'brutalidade') {
        updateWeightDisplay();
      }
    }, { passive: true, capture: true });
  }

  // Inicializar display de peso
  requestAnimationFrame(() => {
    updateWeightDisplay();
    initializeWeightListener();
  });

  const moneyInput = document.getElementById('equipment-dinheiro');
  if (moneyInput) {
    moneyInput.addEventListener('input', () => {
      const v = parseInt(moneyInput.value, 10);
      if (moneyInput.value !== '' && (Number.isNaN(v) || v < 0)) {
        moneyInput.value = '0';
      }
      const fin = parseInt(moneyInput.value, 10);
      updateCharacter({ dinheiro: moneyInput.value === '' || Number.isNaN(fin) ? 0 : Math.max(0, fin) });
    });
  }
});

// Tornar funções disponíveis globalmente (para compatibilidade com SaveLoad)
window.createWeapon = createWeapon;
window.createItem = createItem;
window.updateWeightDisplay = updateWeightDisplay;
