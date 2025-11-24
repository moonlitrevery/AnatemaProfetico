/**
 * Sistema de rolagem de dados para Anátema Profético
 * Base: d20
 */

export interface DiceRoll {
  result: number;
  modifier: number;
  total: number;
  rolls: number[];
  critical?: boolean;
  fumble?: boolean;
}

export interface RollOptions {
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
  criticalRange?: number;
  fumbleRange?: number;
}

/**
 * Rola um dado de X lados
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Rola múltiplos dados
 */
export function rollDice(count: number, sides: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }
  return rolls;
}

/**
 * Rola um d20 com modificadores e opções
 */
export function rollD20(options: RollOptions = {}): DiceRoll {
  const {
    modifier = 0,
    advantage = false,
    disadvantage = false,
    criticalRange = 20,
    fumbleRange = 1,
  } = options;

  let rolls: number[];
  
  if (advantage && !disadvantage) {
    // Vantagem: rola 2 dados e usa o maior
    rolls = [rollDie(20), rollDie(20)];
    const result = Math.max(...rolls);
    const total = result + modifier;
    
    return {
      result,
      modifier,
      total,
      rolls,
      critical: result >= criticalRange,
      fumble: result <= fumbleRange && rolls[0] === rolls[1] && rolls[0] === 1,
    };
  } else if (disadvantage && !advantage) {
    // Desvantagem: rola 2 dados e usa o menor
    rolls = [rollDie(20), rollDie(20)];
    const result = Math.min(...rolls);
    const total = result + modifier;
    
    return {
      result,
      modifier,
      total,
      rolls,
      critical: result >= criticalRange,
      fumble: result <= fumbleRange,
    };
  } else {
    // Rolagem normal
    const result = rollDie(20);
    const total = result + modifier;
    
    return {
      result,
      modifier,
      total,
      rolls: [result],
      critical: result >= criticalRange,
      fumble: result <= fumbleRange,
    };
  }
}

/**
 * Calcula o modificador de atributo (baseado em D&D 5e: (atributo - 10) / 2, arredondado para baixo)
 */
export function getAttributeModifier(attributeValue: number): number {
  return Math.floor((attributeValue - 10) / 2);
}

/**
 * Rola um teste de atributo
 */
export function rollAttributeTest(
  attributeValue: number,
  options: RollOptions = {}
): DiceRoll {
  const modifier = getAttributeModifier(attributeValue);
  return rollD20({ ...options, modifier });
}

/**
 * Rola um teste de perícia (atributo + bônus de perícia)
 */
export function rollSkillTest(
  attributeValue: number,
  skillBonus: number = 0,
  options: RollOptions = {}
): DiceRoll {
  const attributeMod = getAttributeModifier(attributeValue);
  const modifier = attributeMod + skillBonus;
  return rollD20({ ...options, modifier });
}

/**
 * Formata uma rolagem para exibição
 */
export function formatRoll(roll: DiceRoll): string {
  let output = `d20: ${roll.result}`;
  
  if (roll.rolls.length > 1) {
    output += ` (${roll.rolls.join(', ')})`;
  }
  
  if (roll.modifier !== 0) {
    const modSign = roll.modifier >= 0 ? '+' : '';
    output += ` ${modSign}${roll.modifier}`;
  }
  
  output += ` = ${roll.total}`;
  
  if (roll.critical) {
    output += ' [CRÍTICO!]';
  } else if (roll.fumble) {
    output += ' [FALHA CRÍTICA!]';
  }
  
  return output;
}

