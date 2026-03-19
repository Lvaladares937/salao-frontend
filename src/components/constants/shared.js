// Meses do ano
export const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Anos disponíveis
export const anos = [2025, 2026, 2027, 2028, 2029, 2030];

// Dias da semana para o calendário
export const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Horários do dia (8h às 20h)
export const horarios = Array.from({ length: 13 }, (_, i) => {
  const hora = i + 8;
  return `${hora.toString().padStart(2, '0')}:00`;
});