// ============================================
// CONSTANTES ESPECÍFICAS DO MÓDULO DE FUNCIONÁRIOS
// ============================================

// Meses do ano
export const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Anos disponíveis
export const anos = [2025, 2026, 2027, 2028, 2029, 2030];

// Status de ponto
export const statusPonto = {
  TRABALHADO: 'trabalhado',
  FALTA: 'falta',
  FALTA_JUSTIFICADA: 'falta_justificada',
  FERIADO: 'feriado',
  FOLGA: 'folga'
};

// Cores para status (usadas no calendário)
export const statusPontoCores = {
  [statusPonto.TRABALHADO]: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  [statusPonto.FALTA]: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  [statusPonto.FALTA_JUSTIFICADA]: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  [statusPonto.FERIADO]: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  [statusPonto.FOLGA]: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
};

// Ícones para cada status (opcional, para usar no calendário)
export const statusPontoIcones = {
  [statusPonto.TRABALHADO]: '✅',
  [statusPonto.FALTA]: '❌',
  [statusPonto.FALTA_JUSTIFICADA]: '⚠️',
  [statusPonto.FERIADO]: '🎉',
  [statusPonto.FOLGA]: '😴',
};

// Descrições dos status
export const statusPontoDescricao = {
  [statusPonto.TRABALHADO]: 'Dia trabalhado normalmente',
  [statusPonto.FALTA]: 'Falta não justificada (com desconto)',
  [statusPonto.FALTA_JUSTIFICADA]: 'Falta com justificativa (atestado)',
  [statusPonto.FERIADO]: 'Feriado',
  [statusPonto.FOLGA]: 'Folga programada',
};

// Dias da semana (para o calendário)
export const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Dias da semana completos
export const diasSemanaCompleto = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

// Opções de desconto para faltas
export const opcoesDesconto = [
  { valor: 0, label: 'Sem desconto', percentual: '0%' },
  { valor: 0.25, label: '25% do dia', percentual: '25%' },
  { valor: 0.5, label: '50% do dia', percentual: '50%' },
  { valor: 0.75, label: '75% do dia', percentual: '75%' },
  { valor: 1, label: '100% do dia', percentual: '100%' },
  { valor: 1.5, label: '150% do dia (adicional)', percentual: '150%' },
  { valor: 2, label: '200% do dia (dobro)', percentual: '200%' }
];

// Valor padrão de desconto por tipo de falta
export const descontoPadrao = {
  [statusPonto.FALTA]: 1, // 100% de desconto
  [statusPonto.FALTA_JUSTIFICADA]: 0, // 0% de desconto
  [statusPonto.TRABALHADO]: 0,
  [statusPonto.FERIADO]: 0,
  [statusPonto.FOLGA]: 0
};