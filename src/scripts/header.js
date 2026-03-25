import { updateCharacter } from '../utils/characterState';

// Integrar Status inline no Header
function renderInlineStatus() {
  const container = document.getElementById('status-container-inline');
  if (!container) return;
  
  const vidaCurrentInput = document.getElementById('vida-current');
  const vidaMaxInput = document.getElementById('vida-max');
  const sanidadeCurrentInput = document.getElementById('sanidade-current');
  const sanidadeMaxInput = document.getElementById('sanidade-max');
  
  if (!vidaCurrentInput || !vidaMaxInput || !sanidadeCurrentInput || !sanidadeMaxInput) {
    return;
  }
  
  const vc = parseInt(vidaCurrentInput.value, 10);
  const vm = parseInt(vidaMaxInput.value, 10);
  const sc = parseInt(sanidadeCurrentInput.value, 10);
  const sm = parseInt(sanidadeMaxInput.value, 10);
  
  const vidaCurrent = Number.isNaN(vc) ? 0 : vc;
  const vidaMax = Number.isNaN(vm) ? 0 : vm;
  const sanidadeCurrent = Number.isNaN(sc) ? 0 : sc;
  const sanidadeMax = Number.isNaN(sm) ? 0 : sm;
  
  const isMachucado = vidaMax > 0 && vidaCurrent < vidaMax / 2 && vidaCurrent > 0;
  const isMorrendo = vidaCurrent === 0;
  const isInsano = sanidadeMax > 0 && sanidadeCurrent < sanidadeMax / 2;
  const activeConditions = Array.from(document.querySelectorAll('#conditions-list input.condition-check:checked')).map(cb => cb.value);
  
  container.innerHTML = '';
  const hasAuto = isMachucado || isMorrendo || isInsano;
  const hasManual = activeConditions.length > 0;
  
  if (hasAuto || hasManual) {
    container.style.display = 'flex';
    container.innerHTML = '<span class="status-label-inline">Status:</span>';
    
    const condMap = {};
    CONDITIONS_DATA.forEach(c => { condMap[c.id] = c; });
    
    if (isMachucado) {
      const c = condMap['machucado'];
      const span = document.createElement('span');
      span.className = 'status-badge status-machucado';
      span.innerHTML = `${c?.emoji || '⚠️'} <strong>Machucado</strong> — ${c?.desc || 'Movimento reduzido pela metade.'}`;
      container.appendChild(span);
    }
    
    if (isMorrendo) {
      const c = condMap['morrendo'];
      const span = document.createElement('span');
      span.className = 'status-badge status-morrendo';
      span.innerHTML = `${c?.emoji || '○'} <strong>Morrendo</strong> — ${c?.desc || 'Movimento zerado. Faça testes de salvamento.'}`;
      container.appendChild(span);
    }

    if (isInsano) {
      const span = document.createElement('span');
      span.className = 'status-badge status-insano';
      span.innerHTML = '🧠 <strong>Insano</strong> — Sanidade abaixo de 50%.';
      container.appendChild(span);
    }
    
    activeConditions.forEach(id => {
      const c = condMap[id];
      const name = c?.name || id;
      const desc = c?.desc || '';
      const emoji = c?.emoji || '⚡';
      const span = document.createElement('span');
      span.className = 'status-badge status-condition';
      span.innerHTML = `${emoji} <strong>${name}</strong> — ${desc}`;
      container.appendChild(span);
    });
  } else {
    container.style.display = 'none';
  }
  
  // Mostrar/ocultar testes de salvamento quando morrendo
  const deathSavesContainer = document.getElementById('death-saves-container');
  if (deathSavesContainer) {
    if (isMorrendo) {
      deathSavesContainer.style.display = 'block';
    } else {
      deathSavesContainer.style.display = 'none';
      document.querySelectorAll('.death-save-checkbox').forEach(cb => {
        cb.checked = false;
      });
    }
  }
}

// Atualizar status quando valores mudarem
function updateInlineStatus() {
  renderInlineStatus();
}

// Escutar mudanças
// Condições popup - define dados e popula lista ao carregar
const CONDITIONS_DATA = [
  { id: 'machucado', name: 'Machucado', desc: 'Movimento reduzido pela metade.', emoji: '⚠️', auto: true },
  { id: 'morrendo', name: 'Morrendo', desc: 'Movimento zerado. Faça testes de salvamento.', emoji: '○', auto: true },
  { id: 'atordoado', name: 'Atordoado', desc: 'Incapacitado, não pode se mover ou agir.', emoji: '💫', auto: false },
  { id: 'cego', name: 'Cego', desc: 'Desvantagem em testes que dependem da visão.', emoji: '👁️‍🗨️', auto: false },
  { id: 'surdo', name: 'Surdo', desc: 'Desvantagem em testes que dependem da audição.', emoji: '👂', auto: false },
  { id: 'enfeiticado', name: 'Enfeitiçado', desc: 'Não pode atacar o enfeitiçador ou usar ações nocivas contra ele.', emoji: '✨', auto: false },
  { id: 'envenenado', name: 'Envenenado', desc: 'Dano periódico. Desvantagem em testes até ser curado.', emoji: '☠️', auto: false },
  { id: 'queimado', name: 'Queimado', desc: 'Dano contínuo. Desvantagem até extinguir.', emoji: '🔥', auto: false },
  { id: 'assustado', name: 'Assustado', desc: 'Desvantagem enquanto a fonte do medo estiver visível.', emoji: '😱', auto: false },
  { id: 'paralisado', name: 'Paralisado', desc: 'Incapacitado. Não pode se mover ou falar.', emoji: '🧊', auto: false },
  { id: 'inconsciente', name: 'Inconsciente', desc: 'Desmaiado. Incapacitado e vulnerável.', emoji: '💤', auto: false },
  { id: 'agarrado', name: 'Agarrado', desc: 'Movimento zerado. Depende da ação para se libertar.', emoji: '🤲', auto: false },
  { id: 'restrito', name: 'Restrito', desc: 'Movimento zerado. Desvantagem em ataques e testes.', emoji: '⛓️', auto: false },
  { id: 'incapacitado', name: 'Incapacitado', desc: 'Não pode realizar ações.', emoji: '🚫', auto: false },
  { id: 'escondido', name: 'Escondido', desc: 'Difícil de ser detectado. Vantagem em ataques surpresa.', emoji: '🙈', auto: false },
  { id: 'invisivel', name: 'Invisível', desc: 'Não pode ser visto. Vantagem em ataques.', emoji: '👻', auto: false },
  { id: 'sobrecarregado', name: 'Sobrecarregado', desc: 'Peso > máximo. Movimento reduzido pela metade.', emoji: '📦', auto: true },
];

document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('conditions-popup');
  const list = document.getElementById('conditions-list');
  const openBtn = document.getElementById('conditions-btn');
  const closeBtn = document.getElementById('conditions-close');
  const overlay = popup?.querySelector('.conditions-overlay');
  
  if (list) {
    list.innerHTML = CONDITIONS_DATA.filter(c => !c.auto).map(c => `
      <div class="condition-check-item" data-condition-id="${c.id}" data-condition-emoji="${c.emoji || '⚡'}" data-condition-desc="${(c.desc || '').replace(/"/g, '&quot;')}">
        <input type="checkbox" class="condition-check" id="cond-${c.id}" value="${c.id}" aria-label="${c.name}" />
        <label for="cond-${c.id}">
          <strong>${c.name}</strong>
          <span class="cond-desc">${c.desc}</span>
        </label>
      </div>
    `).join('');
  }
  
  function openConditions() {
    if (popup) { popup.style.display = 'flex'; popup.dataset.open = 'true'; document.body.style.overflow = 'hidden'; }
  }
  function closeConditions() {
    if (popup) { popup.style.display = 'none'; popup.dataset.open = ''; document.body.style.overflow = ''; }
  }
  
  openBtn?.addEventListener('click', openConditions);
  closeBtn?.addEventListener('click', closeConditions);
  overlay?.addEventListener('click', closeConditions);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup?.dataset.open === 'true') closeConditions();
  });
  
  window.getConditionsData = () => Array.from(document.querySelectorAll('#conditions-list input.condition-check:checked')).map(cb => cb.value);
  window.loadConditionsData = (ids) => {
    document.querySelectorAll('#conditions-list input.condition-check').forEach(cb => { cb.checked = ids?.includes(cb.value) || false; });
  };
});

document.addEventListener('change', (e) => {
  if (e.target?.classList?.contains('condition-check')) updateInlineStatus();
});

['vida-current', 'vida-max', 'mana-current', 'mana-max', 'sanidade-current', 'sanidade-max'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => { updateInlineStatus(); updateProgressBars(); });
    el.addEventListener('change', () => { updateInlineStatus(); updateProgressBars(); });
  }
});

// Botão Sanidade - abre popup (SanitySystem registra openSanityPopup)
document.getElementById('sanity-popup-btn')?.addEventListener('click', () => {
  if (typeof window.openSanityPopup === 'function') {
    window.openSanityPopup();
  }
});

// Botão Teste de Sanidade - (mod Sobrenatural + mod Mente) / 2
document.getElementById('sanity-test-btn')?.addEventListener('click', () => {
  const sobrenatural = parseInt(document.getElementById('sobrenatural')?.value || '0', 10) || 0;
  const mente = parseInt(document.getElementById('mente')?.value || '0', 10) || 0;
  const modSobrenatural = Math.floor((sobrenatural - 10) / 2);
  const modMente = Math.floor((mente - 10) / 2);
  const bonus = Math.floor((modSobrenatural + modMente) / 2);
  const d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + bonus;
  const label = `Teste de Sanidade (1d20${bonus >= 0 ? '+' : ''}${bonus})`;
  if (typeof window.showDiceRollPopup === 'function') {
    window.showDiceRollPopup({ result: d20, modifier: bonus, total, critical: d20 === 20, fumble: d20 === 1 }, label, 'd20');
  } else {
    alert(`${label}: ${d20} + ${bonus} = ${total}`);
  }
});

// Atualizar inicial
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => { updateInlineStatus(); updateProgressBars(); });
  }, { once: true });
} else {
  requestAnimationFrame(() => { updateInlineStatus(); updateProgressBars(); });
}

function updateProgressBars() {
  ['vida', 'mana', 'sanidade'].forEach(stat => {
    const cur = document.getElementById(`${stat}-current`);
    const max = document.getElementById(`${stat}-max`);
    const fill = document.getElementById(`${stat}-progress-fill`);
    const bar = fill?.closest('.stat-progress-bar');
    if (!cur || !max || !fill || !bar) return;
    const cv = parseInt(cur.value, 10) || 0;
    const mv = parseInt(max.value, 10) || 0;
    const pct = mv > 0 ? Math.min(100, Math.max(0, (cv / mv) * 100)) : 0;
    fill.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  });
}

// Expor função globalmente
window.updateInlineStatus = updateInlineStatus;
window.updateProgressBars = updateProgressBars;
// Função para calcular modificador de atributo (JS puro)
function getAttributeModifier(attributeValue) {
  return Math.floor((attributeValue - 10) / 2);
}

// Função para obter valor de atributo (igual ao usado na rolagem de dados)
function getAttributeValue(attributeId) {
  const input = document.getElementById(attributeId);
  if (!input) {
    console.warn(`Atributo ${attributeId} não encontrado no DOM`);
    return 0;
  }
  const v = parseInt(input.value, 10);
  return Number.isNaN(v) ? 0 : v;
}

// Flag para evitar loops infinitos e debounce
let isUpdating = false;
let updateTimeout = null;

// Função para atualizar todos os valores derivados
function updateHeaderValues(immediate = false) {
  // Prevenir loops infinitos
  if (isUpdating) return;
  
  // Se immediate, atualizar sem debounce (para campos temporários)
  if (immediate) {
    isUpdating = true;
    try {
      _updateHeaderValues();
    } finally {
      isUpdating = false;
    }
    return;
  }
  
  // Debounce: cancelar atualização pendente e agendar nova
  if (updateTimeout !== null) {
    clearTimeout(updateTimeout);
  }
  
  updateTimeout = window.setTimeout(() => {
    isUpdating = true;
    try {
      _updateHeaderValues();
    } finally {
      isUpdating = false;
    }
    updateTimeout = null;
  }, 50);
}

// Função interna que faz a atualização real
function _updateHeaderValues() {

    // Obter valores dos atributos diretamente do DOM (igual à rolagem de dados)
    // Pegar os inputs diretamente e ler os valores, como a rolagem faz
    const forInput = document.getElementById('brutalidade');
    const dexInput = document.getElementById('destreza');
    const conInput = document.getElementById('compleicao');
    const menInput = document.getElementById('mente');
    const podInput = document.getElementById('sobrenatural');
    
    // Ler valores diretamente dos inputs, igual à rolagem
    const forV = forInput ? parseInt(forInput.value, 10) : 0;
    const dexV = dexInput ? parseInt(dexInput.value, 10) : 0;
    const conV = conInput ? parseInt(conInput.value, 10) : 0;
    const menV = menInput ? parseInt(menInput.value, 10) : 0;
    const podV = podInput ? parseInt(podInput.value, 10) : 0;
    
    const forValue = Number.isNaN(forV) ? 0 : forV;
    const dexValue = Number.isNaN(dexV) ? 0 : dexV;
    const conValue = Number.isNaN(conV) ? 0 : conV;
    const menValue = Number.isNaN(menV) ? 0 : menV;
    const podValue = Number.isNaN(podV) ? 0 : podV;
    
    // Calcular modificadores
    const modFor = getAttributeModifier(forValue);
    const modDex = getAttributeModifier(dexValue);
    const modCon = getAttributeModifier(conValue);
    const modConj = getAttributeModifier(podValue); // MODconj = modificador de conjuração (sobrenatural)
    const modEsq = getAttributeModifier(dexValue); // MODesq = modificador de esquiva (destreza)

    // Vida: Brutalidade + Compleição + bônus nível + bônus extra
    const vidaMaxInput = document.getElementById('vida-max');
    const vidaTempInput = document.getElementById('vida-temp');
    const vidaExtraInput = document.getElementById('vida-extra');
    if (vidaMaxInput) {
      const vidaTempV = vidaTempInput ? parseInt(vidaTempInput.value, 10) : 0;
      const vidaExtraV = vidaExtraInput ? parseInt(vidaExtraInput.value, 10) : 0;
      const vidaTempValue = Number.isNaN(vidaTempV) ? 0 : vidaTempV;
      const vidaExtraValue = Number.isNaN(vidaExtraV) ? 0 : vidaExtraV;
      const maxVida = forValue + conValue + vidaTempValue + vidaExtraValue;
      vidaMaxInput.value = String(maxVida);
      
      // Garantir que vida atual não exceda máximo
      const vidaCurrentInput = document.getElementById('vida-current');
      if (vidaCurrentInput) {
        const vc = parseInt(vidaCurrentInput.value, 10);
        const currentValue = Number.isNaN(vc) ? 0 : vc;
        if (currentValue > maxVida && maxVida > 0) {
          vidaCurrentInput.value = String(maxVida);
        }
        vidaCurrentInput.max = String(maxVida);
      }
    }

    // Mana: Sobrenatural * 2 + bônus nível + bônus extra
    const manaMaxInput = document.getElementById('mana-max');
    const manaTempInput = document.getElementById('mana-temp');
    const manaExtraInput = document.getElementById('mana-extra');
    if (manaMaxInput) {
      const manaTempV = manaTempInput ? parseInt(manaTempInput.value, 10) : 0;
      const manaExtraV = manaExtraInput ? parseInt(manaExtraInput.value, 10) : 0;
      const manaTempValue = Number.isNaN(manaTempV) ? 0 : manaTempV;
      const manaExtraValue = Number.isNaN(manaExtraV) ? 0 : manaExtraV;
      const maxMana = podValue * 2 + manaTempValue + manaExtraValue;
      manaMaxInput.value = String(maxMana);
      
      // Garantir que mana atual não exceda máximo
      const manaCurrentInput = document.getElementById('mana-current');
      if (manaCurrentInput) {
        const vc = parseInt(manaCurrentInput.value, 10);
        const currentValue = Number.isNaN(vc) ? 0 : vc;
        if (currentValue > maxMana && maxMana > 0) {
          manaCurrentInput.value = String(maxMana);
          const nm = parseInt(manaCurrentInput.value, 10) || 0;
          updateCharacter({ mana: nm });
        }
        manaCurrentInput.max = String(maxMana);
      }
    }

    // Sanidade: Mente * 2 + bônus nível + bônus extra
    const sanidadeMaxInput = document.getElementById('sanidade-max');
    const sanidadeTempInput = document.getElementById('sanidade-temp');
    const sanidadeExtraInput = document.getElementById('sanidade-extra');
    if (sanidadeMaxInput) {
      const sanidadeTempV = sanidadeTempInput ? parseInt(sanidadeTempInput.value, 10) : 0;
      const sanidadeExtraV = sanidadeExtraInput ? parseInt(sanidadeExtraInput.value, 10) : 0;
      const sanidadeTempValue = Number.isNaN(sanidadeTempV) ? 0 : sanidadeTempV;
      const sanidadeExtraValue = Number.isNaN(sanidadeExtraV) ? 0 : sanidadeExtraV;
      const maxSanidade = menValue * 2 + sanidadeTempValue + sanidadeExtraValue;
      sanidadeMaxInput.value = String(maxSanidade);
      
      // Garantir que sanidade atual não exceda máximo
      const sanidadeCurrentInput = document.getElementById('sanidade-current');
      if (sanidadeCurrentInput) {
        const cs = parseInt(sanidadeCurrentInput.value, 10);
        const currentValue = Number.isNaN(cs) ? 0 : cs;
        if (currentValue > maxSanidade && maxSanidade > 0) {
          sanidadeCurrentInput.value = String(maxSanidade);
        }
        sanidadeCurrentInput.max = String(maxSanidade);
      }
    }

    // Resistências a dano: MODcon + MODfor/2 + extra (igual padrão do movimento-extra)
    const resistenciaInput = document.getElementById('resistencia');
    const resistenciaExtraInput = document.getElementById('resistencia-extra');
    if (resistenciaInput) {
      let resistenciaExtra = 0;
      if (resistenciaExtraInput) {
        const re = parseInt(resistenciaExtraInput.value, 10);
        resistenciaExtra = Number.isNaN(re) ? 0 : re;
      }
      const resistencia = modCon + Math.floor(modFor / 2) + resistenciaExtra;
      resistenciaInput.value = String(resistencia);
    }

    // Movimento: MODdex * 2"m" (ou metade se sobrecarregado ou machucado) + movimento extra
    const movimentoInput = document.getElementById('movimento');
    const movimentoExtraInput = document.getElementById('movimento-extra');
    if (movimentoInput) {
      // Verificar se está sobrecarregado (peso atual > peso máximo)
      let currentWeight = 0;
      let maxWeight = 0;
      
      // Tentar obter peso atual e máximo dos itens
      const weightCurrentEl = document.getElementById('weight-current');
      const weightMaxEl = document.getElementById('weight-max');
      
      if (weightCurrentEl && weightMaxEl) {
        const wc = parseInt(weightCurrentEl.textContent, 10);
        const wm = parseInt(weightMaxEl.textContent, 10);
        currentWeight = Number.isNaN(wc) ? 0 : wc;
        maxWeight = Number.isNaN(wm) ? 0 : wm;
      }
      
      // Verificar se está machucado (vida atual < metade da vida máxima)
      const vidaCurrentInput = document.getElementById('vida-current');
      const vidaMaxInput = document.getElementById('vida-max');
      let isMachucado = false;
      if (vidaCurrentInput && vidaMaxInput) {
        const vc = parseInt(vidaCurrentInput.value, 10);
        const vm = parseInt(vidaMaxInput.value, 10);
        const vidaCurrent = Number.isNaN(vc) ? 0 : vc;
        const vidaMax = Number.isNaN(vm) ? 0 : vm;
        if (vidaMax > 0 && vidaCurrent < vidaMax / 2 && vidaCurrent > 0) {
          isMachucado = true;
        }
      }
      
      // Movimento: Destreza / 2
      let movimento = Math.floor(dexValue / 2);
      
      // Se sobrecarregado (peso atual > peso máximo), movimento é metade
      if (currentWeight > maxWeight && maxWeight > 0) {
        movimento = Math.floor(movimento / 2);
      }
      
      // Verificar se está morrendo (vida atual = 0)
      let isMorrendo = false;
      if (vidaCurrentInput && vidaMaxInput) {
        const vc = parseInt(vidaCurrentInput.value, 10);
        const vidaCurrent = Number.isNaN(vc) ? 0 : vc;
        if (vidaCurrent === 0) {
          isMorrendo = true;
        }
      }
      
      // Se morrendo, movimento é zero
      if (isMorrendo) {
        movimento = 0;
      } else {
        // Se machucado, movimento é metade
        if (isMachucado) {
          movimento = Math.floor(movimento / 2);
        }
        
        // Adicionar movimento extra
        if (movimentoExtraInput) {
          const me = parseInt(movimentoExtraInput.value, 10);
          const movimentoExtra = Number.isNaN(me) ? 0 : me;
          movimento += movimentoExtra;
        }
      }
      
      movimentoInput.value = `${movimento}m`;
    }

    // ND projéteis: 8 + MODesq + cobertura (B+2, M+4, A+8)
    const dtProjeteisInput = document.getElementById('dt-projeteis');
    if (dtProjeteisInput) {
      const coberturaActive = document.querySelector('.cobertura-btn.active');
      const coberturaBonus = coberturaActive ? ({ b: 2, m: 4, a: 8 }[coberturaActive.dataset.cobertura] || 0) : 0;
      const ndProjeteis = 8 + modEsq + coberturaBonus;
      dtProjeteisInput.value = String(ndProjeteis);
    }

    // Sequência baseada no nível
    const nivelInput = document.getElementById('nivel');
    const sequenciaInput = document.getElementById('nivel-caminho');
    if (nivelInput && sequenciaInput) {
      const n = parseInt(nivelInput.value, 10);
      const nivel = Number.isNaN(n) ? 0 : n;
      let sequencia = 0;
      
      if (nivel >= 1 && nivel <= 2) sequencia = 9;
      else if (nivel >= 3 && nivel <= 4) sequencia = 8;
      else if (nivel >= 5 && nivel <= 6) sequencia = 7;
      else if (nivel >= 7 && nivel <= 8) sequencia = 6;
      else if (nivel >= 9 && nivel <= 10) sequencia = 5;
      else if (nivel >= 11 && nivel <= 12) sequencia = 4;
      else if (nivel >= 13 && nivel <= 14) sequencia = 3;
      else if (nivel >= 15 && nivel <= 16) sequencia = 2;
      else if (nivel >= 17 && nivel <= 20) sequencia = 1;
      
      const sequenciaText = sequencia > 0 ? `${sequencia}ª sequência` : '0';
      sequenciaInput.value = sequenciaText;
      
      // Habilitar/desabilitar Caminho baseado no nível
      const caminhoSelect = document.getElementById('caminho');
      if (caminhoSelect) {
        if (nivel >= 1) {
          caminhoSelect.disabled = false;
        } else {
          caminhoSelect.disabled = true;
          caminhoSelect.value = '';
        }
      }
      
      // Habilitar/desabilitar Prestígio baseado no nível
      const prestigioSelect = document.getElementById('prestigio');
      if (prestigioSelect) {
        if (nivel >= 1) {
          prestigioSelect.disabled = false;
          if (!prestigioSelect.value || prestigioSelect.value === '') {
            prestigioSelect.value = 'muito-baixo';
          }
        } else {
          prestigioSelect.disabled = true;
          prestigioSelect.value = '';
        }
      }
    }

    if (typeof window.updateProgressBars === 'function') window.updateProgressBars();
}

// Função para reduzir sanidade quando Caminho for preenchido
function handleCaminhoChange() {
  const caminhoSelect = document.getElementById('caminho');
  const sanidadeMaxInput = document.getElementById('sanidade-max');
  const sanidadeCurrentInput = document.getElementById('sanidade-current');
  
  if (!caminhoSelect || !sanidadeMaxInput) return;
  
  // Verificar se Caminho foi preenchido pela primeira vez
  const caminhoValue = caminhoSelect.value.trim();
  const wasEmpty = caminhoSelect.dataset.wasEmpty === 'true';
  
  if (caminhoValue && wasEmpty && caminhoSelect.dataset.sanidadeReduced !== 'true') {
    // Reduzir 10% da sanidade máxima, arredondando para cima
    const ms = parseInt(sanidadeMaxInput.value, 10);
    const maxSanidade = Number.isNaN(ms) ? 0 : ms;
    if (maxSanidade > 0) {
      const reducao = Math.ceil(maxSanidade * 0.1);
      const novaMaxSanidade = maxSanidade - reducao;
      sanidadeMaxInput.value = String(novaMaxSanidade);
      
      // Ajustar sanidade atual se necessário
      if (sanidadeCurrentInput) {
        const cs = parseInt(sanidadeCurrentInput.value, 10);
        const currentSanidade = Number.isNaN(cs) ? 0 : cs;
        if (currentSanidade > novaMaxSanidade) {
          sanidadeCurrentInput.value = String(novaMaxSanidade);
        }
        sanidadeCurrentInput.max = String(novaMaxSanidade);
      }
      
      // Marcar que já foi reduzido
      caminhoSelect.dataset.sanidadeReduced = 'true';
      
      // Atualizar status
      if (window.updateStatus) {
        window.updateStatus();
      }
    }
  }
  
  // Atualizar flag
  caminhoSelect.dataset.wasEmpty = caminhoValue ? 'false' : 'true';
}

// Escutar mudanças nos atributos usando event delegation única e global
// Usar flag global no window para garantir que seja adicionado apenas uma vez
if (!window.headerListenerInitialized) {
  window.headerListenerInitialized = true;
  const attributeIds = ['brutalidade', 'destreza', 'compleicao', 'mente', 'sobrenatural'];
  
  // Event delegation única - executar apenas uma vez
  // Escutar no document com capture para pegar eventos de qualquer elemento
  document.addEventListener('change', (e) => {
    const target = e.target;
    if (target && target.id && attributeIds.includes(target.id)) {
      updateHeaderValues();
    }
  }, { passive: true, capture: true });

  document.addEventListener('click', (e) => {
    const btn = e.target?.closest('.cobertura-btn');
    if (!btn) return;
    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
    } else {
      document.querySelectorAll('.cobertura-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    updateHeaderValues(true);
  });

  // Escutar eventos de input também para atualização em tempo real
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.id && attributeIds.includes(target.id)) {
      updateHeaderValues();
    }
  }, { passive: true, capture: true });

  // Função para tentar inicializar valores - tentar múltiplas vezes se necessário
  function initializeValues(retries = 0) {
    // Verificar se todos os atributos existem no DOM
    const allAttributesExist = attributeIds.every(id => {
      const element = document.getElementById(id);
      return element !== null;
    });

    if (allAttributesExist) {
      // Todos os atributos existem, atualizar valores
      updateHeaderValues();
    } else if (retries < 10) {
      // Ainda não existem, tentar novamente após 50ms
      setTimeout(() => {
        initializeValues(retries + 1);
      }, 50);
    } else {
      // Após 10 tentativas (500ms), atualizar mesmo assim
      updateHeaderValues();
    }
  }

  // Atualizar valores iniciais após o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeValues();
    }, { once: true });
  } else {
    initializeValues();
  }

  // Escutar mudanças via eventos globais (caso os atributos sejam atualizados de fora)
  document.addEventListener('characterDataChanged', () => {
    updateHeaderValues();
  }, { passive: true });

  // Escutar mudanças de peso para atualizar movimento
  document.addEventListener('weightChanged', () => {
    updateHeaderValues();
  }, { passive: true });

  // Usar event delegation para otimizar performance
  if (!window.headerEventDelegationInitialized) {
    window.headerEventDelegationInitialized = true;
    
    document.addEventListener('input', (e) => {
      const target = e.target;
      if (!target || !target.id) return;
      
      const id = target.id;
      if (id === 'vida-current' || id === 'sanidade-current') {
        updateHeaderValues();
      } else if (id === 'mana-current') {
        updateHeaderValues();
        const el = document.getElementById('mana-current');
        const v = parseInt(el?.value ?? '0', 10);
        updateCharacter({ mana: Number.isNaN(v) ? 0 : v });
      } else if (id === 'movimento-extra' || id === 'resistencia-extra' || id === 'vida-temp' || id === 'mana-temp' || id === 'sanidade-temp' || id === 'vida-extra' || id === 'mana-extra' || id === 'sanidade-extra') {
        updateHeaderValues(true);
        if (id === 'resistencia-extra') {
          const el = document.getElementById('resistencia-extra');
          const v = parseInt(el?.value ?? '0', 10);
          updateCharacter({ resistenciaExtra: Number.isNaN(v) ? 0 : v });
        }
      } else if (id === 'nivel' || id === 'caminho') {
        updateHeaderValues();
      }
    }, { passive: true, capture: true });
    
    document.addEventListener('change', (e) => {
      const target = e.target;
      if (!target || !target.id) return;
      
      const id = target.id;
      if (id === 'vida-current' || id === 'sanidade-current') {
        updateHeaderValues();
      } else if (id === 'mana-current') {
        updateHeaderValues();
        const el = document.getElementById('mana-current');
        const v = parseInt(el?.value ?? '0', 10);
        updateCharacter({ mana: Number.isNaN(v) ? 0 : v });
      } else if (id === 'movimento-extra' || id === 'resistencia-extra' || id === 'vida-temp' || id === 'mana-temp' || id === 'sanidade-temp' || id === 'vida-extra' || id === 'mana-extra' || id === 'sanidade-extra') {
        updateHeaderValues(true);
        if (id === 'resistencia-extra') {
          const el = document.getElementById('resistencia-extra');
          const v = parseInt(el?.value ?? '0', 10);
          updateCharacter({ resistenciaExtra: Number.isNaN(v) ? 0 : v });
        }
      } else if (id === 'nivel' || id === 'caminho') {
        updateHeaderValues();
      }
    }, { passive: true, capture: true });
  }

  // Botões de Descanso
  const REST_VALUES = {
    ruim: { vida: 1/4, mana: 1/4, sanidade: 1/6 },
    mediano: { vida: 1/3, mana: 1/3, sanidade: 1/4 },
    bom: { vida: 1/2, mana: 1/2, sanidade: 1/3 },
    magico: { vida: 1, mana: 1, sanidade: 1 }
  };
  document.addEventListener('click', (e) => {
    const btn = e.target?.closest('.rest-btn');
    if (!btn) return;
    const tipo = btn.dataset.rest;
    const ratios = REST_VALUES[tipo];
    if (!ratios) return;
    const vidaMax = parseInt(document.getElementById('vida-max')?.value || '0', 10);
    const manaMax = parseInt(document.getElementById('mana-max')?.value || '0', 10);
    const sanidadeMax = parseInt(document.getElementById('sanidade-max')?.value || '0', 10);
    const vidaCur = document.getElementById('vida-current');
    const manaCur = document.getElementById('mana-current');
    const sanidadeCur = document.getElementById('sanidade-current');
    if (vidaCur) {
      const v = parseInt(vidaCur.value, 10) || 0;
      vidaCur.value = String(Math.min(vidaMax, Math.floor(v + vidaMax * ratios.vida)));
    }
    if (manaCur) {
      const m = parseInt(manaCur.value, 10) || 0;
      manaCur.value = String(Math.min(manaMax, Math.floor(m + manaMax * ratios.mana)));
      const nm = parseInt(manaCur.value, 10) || 0;
      updateCharacter({ mana: nm });
    }
    if (sanidadeCur) {
      const s = parseInt(sanidadeCur.value, 10) || 0;
      sanidadeCur.value = String(Math.min(sanidadeMax, Math.floor(s + sanidadeMax * ratios.sanidade)));
    }
    if (typeof window.updateInlineStatus === 'function') window.updateInlineStatus();
    if (typeof updateHeaderValues === 'function') updateHeaderValues(true);
    if (typeof window.showToast === 'function') window.showToast(`Descanso ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} aplicado`, 'success');
  });

  // Calculadora de Dano
  document.getElementById('aplicar-dano-btn')?.addEventListener('click', () => {
    const danoVida = parseInt(document.getElementById('dano-vida')?.value || '0', 10) || 0;
    const danoMana = parseInt(document.getElementById('dano-mana')?.value || '0', 10) || 0;
    const danoSanidade = parseInt(document.getElementById('dano-sanidade')?.value || '0', 10) || 0;
    const vidaCur = document.getElementById('vida-current');
    const manaCur = document.getElementById('mana-current');
    const sanidadeCur = document.getElementById('sanidade-current');
    if (vidaCur && danoVida > 0) {
      const v = parseInt(vidaCur.value, 10) || 0;
      vidaCur.value = String(Math.max(0, v - danoVida));
    }
    if (manaCur && danoMana > 0) {
      const m = parseInt(manaCur.value, 10) || 0;
      manaCur.value = String(Math.max(0, m - danoMana));
      updateCharacter({ mana: parseInt(manaCur.value, 10) || 0 });
    }
    if (sanidadeCur && danoSanidade > 0) {
      const s = parseInt(sanidadeCur.value, 10) || 0;
      sanidadeCur.value = String(Math.max(0, s - danoSanidade));
    }
    const danoVidaEl = document.getElementById('dano-vida');
    const danoManaEl = document.getElementById('dano-mana');
    const danoSanidadeEl = document.getElementById('dano-sanidade');
    if (danoVidaEl) danoVidaEl.value = '';
    if (danoManaEl) danoManaEl.value = '';
    if (danoSanidadeEl) danoSanidadeEl.value = '';
    if (typeof window.updateInlineStatus === 'function') window.updateInlineStatus();
    if (typeof updateHeaderValues === 'function') updateHeaderValues(true);
    if (typeof window.showToast === 'function') window.showToast('Dano aplicado', 'damage');
  });

  document.getElementById('aplicar-cura-btn')?.addEventListener('click', () => {
    const curaVida = parseInt(document.getElementById('cura-vida')?.value || '0', 10) || 0;
    const curaMana = parseInt(document.getElementById('cura-mana')?.value || '0', 10) || 0;
    const curaSanidade = parseInt(document.getElementById('cura-sanidade')?.value || '0', 10) || 0;
    const vidaCur = document.getElementById('vida-current');
    const manaCur = document.getElementById('mana-current');
    const sanidadeCur = document.getElementById('sanidade-current');
    const vidaMax = parseInt(document.getElementById('vida-max')?.value || '0', 10);
    const manaMax = parseInt(document.getElementById('mana-max')?.value || '0', 10);
    const sanidadeMax = parseInt(document.getElementById('sanidade-max')?.value || '0', 10);
    if (vidaCur && curaVida > 0) {
      const v = parseInt(vidaCur.value, 10) || 0;
      vidaCur.value = String(Math.min(vidaMax, v + curaVida));
    }
    if (manaCur && curaMana > 0) {
      const m = parseInt(manaCur.value, 10) || 0;
      manaCur.value = String(Math.min(manaMax, m + curaMana));
      updateCharacter({ mana: parseInt(manaCur.value, 10) || 0 });
    }
    if (sanidadeCur && curaSanidade > 0) {
      const s = parseInt(sanidadeCur.value, 10) || 0;
      sanidadeCur.value = String(Math.min(sanidadeMax, s + curaSanidade));
    }
    const curaVidaEl = document.getElementById('cura-vida');
    const curaManaEl = document.getElementById('cura-mana');
    const curaSanidadeEl = document.getElementById('cura-sanidade');
    if (curaVidaEl) curaVidaEl.value = '';
    if (curaManaEl) curaManaEl.value = '';
    if (curaSanidadeEl) curaSanidadeEl.value = '';
    if (typeof window.updateInlineStatus === 'function') window.updateInlineStatus();
    if (typeof updateHeaderValues === 'function') updateHeaderValues(true);
    if (typeof window.updateProgressBars === 'function') window.updateProgressBars();
    if (typeof window.showToast === 'function') window.showToast('Cura aplicada', 'healing');
  });

  // Escutar mudanças no Caminho para reduzir sanidade
  const caminhoSelect = document.getElementById('caminho');
  if (caminhoSelect) {
    caminhoSelect.dataset.wasEmpty = caminhoSelect.value.trim() ? 'false' : 'true';
    caminhoSelect.addEventListener('change', handleCaminhoChange);
  }

  // Escutar mudanças de status
  document.addEventListener('statusChanged', () => {
    updateHeaderValues();
  }, { passive: true });

  // Expor função globalmente para outros componentes
  window.updateHeaderValues = updateHeaderValues;
}
