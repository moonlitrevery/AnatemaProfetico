// Sistema de validação de regras do Anátema Profético

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validações de atributos
export function validateAttribute(name: string, value: number): ValidationError | null {
  if (value < 0) {
    return {
      field: name,
      message: `${name} não pode ser menor que 0`,
      severity: 'error'
    };
  }
  if (value > 30) {
    return {
      field: name,
      message: `${name} não pode ser maior que 30`,
      severity: 'error'
    };
  }
  return null;
}

// Validação de nível
export function validateLevel(level: number): ValidationError | null {
  if (level < 0) {
    return {
      field: 'nivel',
      message: 'Nível não pode ser menor que 0',
      severity: 'error'
    };
  }
  if (level > 20) {
    return {
      field: 'nivel',
      message: 'Nível não pode ser maior que 20',
      severity: 'error'
    };
  }
  return null;
}

// Validação de perícias
export function validateSkillTraining(training: string): ValidationError | null {
  const validTrainings = ['nenhum', 'basico', 'medio', 'avancado', 'expert', 'aterrorizante'];
  if (!validTrainings.includes(training.toLowerCase())) {
    return {
      field: 'treinamento',
      message: `Treinamento inválido: ${training}. Deve ser um de: ${validTrainings.join(', ')}`,
      severity: 'error'
    };
  }
  return null;
}

// Validação de valor extra de perícia
export function validateSkillExtra(extra: number): ValidationError | null {
  if (extra < 0) {
    return {
      field: 'valor-extra',
      message: 'Valor extra não pode ser negativo',
      severity: 'error'
    };
  }
  if (extra > 20) {
    return {
      field: 'valor-extra',
      message: 'Valor extra não pode ser maior que 20',
      severity: 'warning'
    };
  }
  return null;
}

// Validação de vida/mana/sanidade
export function validateStat(current: number, max: number, statName: string): ValidationError | null {
  if (current < 0) {
    return {
      field: statName,
      message: `${statName} atual não pode ser negativo`,
      severity: 'error'
    };
  }
  if (current > max) {
    return {
      field: statName,
      message: `${statName} atual não pode ser maior que o máximo`,
      severity: 'error'
    };
  }
  return null;
}

// Validação completa da ficha
export function validateCharacterSheet(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validar atributos
  const attributes = ['brutalidade', 'destreza', 'compleicao', 'mente', 'sobrenatural'];
  attributes.forEach(attr => {
    const value = parseInt(data[attr] || '10', 10);
    const error = validateAttribute(attr, value);
    if (error) errors.push(error);
  });
  
  // Validar nível
  const level = parseInt(data.nivel || '0', 10);
  const levelError = validateLevel(level);
  if (levelError) errors.push(levelError);
  
  // Validar stats
  const vidaCurrent = parseInt(data['vida-current'] || '0', 10);
  const vidaMax = parseInt(data['vida-max'] || '0', 10);
  const vidaError = validateStat(vidaCurrent, vidaMax, 'Vida');
  if (vidaError) errors.push(vidaError);
  
  const manaCurrent = parseInt(data['mana-current'] || '0', 10);
  const manaMax = parseInt(data['mana-max'] || '0', 10);
  const manaError = validateStat(manaCurrent, manaMax, 'Mana');
  if (manaError) errors.push(manaError);
  
  const sanidadeCurrent = parseInt(data['sanidade-current'] || '0', 10);
  const sanidadeMax = parseInt(data['sanidade-max'] || '0', 10);
  const sanidadeError = validateStat(sanidadeCurrent, sanidadeMax, 'Sanidade');
  if (sanidadeError) errors.push(sanidadeError);
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
}

// Função para mostrar avisos de validação na UI
export function showValidationWarnings(result: ValidationResult) {
  // Remove avisos anteriores
  document.querySelectorAll('.validation-warning').forEach(el => el.remove());
  
  if (result.errors.length === 0) return;
  
  // Agrupar erros por severidade
  const errors = result.errors.filter(e => e.severity === 'error');
  const warnings = result.errors.filter(e => e.severity === 'warning');
  
  // Mostrar erros críticos
  if (errors.length > 0) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'validation-warning validation-error';
    errorContainer.innerHTML = `
      <div class="validation-header">
        <span class="validation-icon">⚠️</span>
        <strong>Erros encontrados na ficha:</strong>
      </div>
      <ul class="validation-list">
        ${errors.map(e => `<li>${e.message}</li>`).join('')}
      </ul>
    `;
    
    // Inserir no topo da ficha
    const container = document.querySelector('.container[data-page="personagem"]');
    if (container) {
      container.insertBefore(errorContainer, container.firstChild);
    }
  }
  
  // Mostrar avisos (opcional, menos intrusivo)
  if (warnings.length > 0) {
    console.warn('Avisos de validação:', warnings);
  }
}

