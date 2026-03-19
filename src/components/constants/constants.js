// Re-exportar constantes globais
export { 
  funcionarios as funcionariosMock,
  meses,
  anos,
  diasSemana
} from '../../constants';

// Status de ponto (específico de Funcionarios)
export const statusPonto = {
  TRABALHADO: 'trabalhado',
  FALTA: 'falta',
  FALTA_JUSTIFICADA: 'falta_justificada',
  FERIADO: 'feriado',
  FOLGA: 'folga'
};

export const statusPontoCores = {
  [statusPonto.TRABALHADO]: 'bg-green-100 text-green-800 border-green-200',
  [statusPonto.FALTA]: 'bg-red-100 text-red-800 border-red-200',
  [statusPonto.FALTA_JUSTIFICADA]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [statusPonto.FERIADO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [statusPonto.FOLGA]: 'bg-gray-100 text-gray-800 border-gray-200',
};