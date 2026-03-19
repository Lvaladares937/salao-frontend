// ============================================
// CONSTANTES GLOBAIS COMPARTILHADAS
// ============================================

// Funcionários da Vailson Hair
export const funcionarios = [
  { 
    id: 1, 
    nome: 'Erica Brito', 
    especialidade: 'Cabelos', 
    telefone: '(11) 99999-1111', 
    email: 'erica@vailsonhair.com',
    dataContratacao: '2023-01-15',
    salarioBase: 1800.00,
    comissaoPercentual: 40,
    ativo: true,
    avatar: 'EB',
    cor: 'bg-purple-500',
  },
  { 
    id: 2, 
    nome: 'Chica', 
    especialidade: 'Manicure/Pedicure', 
    telefone: '(11) 99999-2222', 
    email: 'chica@vailsonhair.com',
    dataContratacao: '2023-03-10',
    salarioBase: 1800.00,
    comissaoPercentual: 35,
    ativo: true,
    avatar: 'CH',
    cor: 'bg-pink-500',
  },
  { 
    id: 3, 
    nome: 'Biel', 
    especialidade: 'Barbearia', 
    telefone: '(11) 99999-3333', 
    email: 'biel@vailsonhair.com',
    dataContratacao: '2023-06-20',
    salarioBase: 1800.00,
    comissaoPercentual: 40,
    ativo: true,
    avatar: 'BL',
    cor: 'bg-blue-500',
  },
  { 
    id: 4, 
    nome: 'Gabriela Saraiva', 
    especialidade: 'Estética Facial', 
    telefone: '(11) 99999-4444', 
    email: 'gabriela@vailsonhair.com',
    dataContratacao: '2023-09-05',
    salarioBase: 1800.00,
    comissaoPercentual: 35,
    ativo: true,
    avatar: 'GS',
    cor: 'bg-yellow-500',
  },
  { 
    id: 5, 
    nome: 'Jaline Teixeira', 
    especialidade: 'Cabelos/Coloração', 
    telefone: '(11) 99999-5555', 
    email: 'jaline@vailsonhair.com',
    dataContratacao: '2023-11-12',
    salarioBase: 1800.00,
    comissaoPercentual: 40,
    ativo: true,
    avatar: 'JT',
    cor: 'bg-green-500',
  },
  { 
    id: 6, 
    nome: 'Rafael Vicente', 
    especialidade: 'Barbearia/Cortes', 
    telefone: '(11) 99999-6666', 
    email: 'rafael@vailsonhair.com',
    dataContratacao: '2024-02-18',
    salarioBase: 1800.00,
    comissaoPercentual: 40,
    ativo: true,
    avatar: 'RV',
    cor: 'bg-indigo-500',
  },
  { 
    id: 7, 
    nome: 'Vailson', 
    especialidade: 'Proprietário/Master', 
    telefone: '(11) 99999-7777', 
    email: 'vailson@vailsonhair.com',
    dataContratacao: '2023-01-01',
    salarioBase: 5000.00,
    comissaoPercentual: 50,
    ativo: true,
    avatar: 'VH',
    cor: 'bg-red-500',
  },
];

// Profissionais (alias para funcionários - usado nos agendamentos)
export const profissionais = funcionarios;

// Serviços completos
export const servicos = [
  { id: 1, nome: 'Corte Masculino', categoria: 'Barbearia', duracao: 30, preco: 60.00, comissaoPadrao: 35 },
  { id: 2, nome: 'Corte Feminino', categoria: 'Cabelo', duracao: 30, preco: 160.00, comissaoPadrao: 40 },
  { id: 3, nome: 'Barba completa', categoria: 'Barbearia', duracao: 30, preco: 50.00, comissaoPadrao: 35 },
  { id: 4, nome: 'Manicure', categoria: 'Manicure e Pedicure', duracao: 30, preco: 30.00, comissaoPadrao: 30 },
  { id: 5, nome: 'Pedicure', categoria: 'Manicure e Pedicure', duracao: 30, preco: 30.00, comissaoPadrao: 30 },
  { id: 6, nome: 'Coloração', categoria: 'Cabelo', duracao: 30, preco: 130.00, comissaoPadrao: 45 },
  { id: 7, nome: 'Hidratação', categoria: 'Cabelo', duracao: 30, preco: 90.00, comissaoPadrao: 35 },
  { id: 8, nome: 'Escova', categoria: 'Cabelo', duracao: 30, preco: 60.00, comissaoPadrao: 30 },
  { id: 9, nome: 'Design de Sobrancelha', categoria: 'Estética Facial', duracao: 30, preco: 60.00, comissaoPadrao: 40 },
  { id: 10, nome: 'Limpeza de Pele', categoria: 'Estética Facial', duracao: 60, preco: 130.00, comissaoPadrao: 35 },
  { id: 11, nome: 'Depilação Axilas', categoria: 'Depilação', duracao: 30, preco: 20.00, comissaoPadrao: 30 },
  { id: 12, nome: 'Maquiagem', categoria: 'Maquiagem', duracao: 60, preco: 180.00, comissaoPadrao: 35 },
  { id: 13, nome: 'Alongamento de Cílios', categoria: 'Estética Facial', duracao: 120, preco: 250.00, comissaoPadrao: 40 },
  // ... adicione todos os outros serviços aqui
];

// Clientes
export const clientes = [
  { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-9999', email: 'maria@email.com' },
  { id: 2, nome: 'João Santos', telefone: '(11) 98888-8888', email: 'joao@email.com' },
  { id: 3, nome: 'Ana Oliveira', telefone: '(11) 97777-7777', email: 'ana@email.com' },
  { id: 4, nome: 'Carlos Souza', telefone: '(11) 96666-6666', email: 'carlos@email.com' },
  { id: 5, nome: 'Patrícia Lima', telefone: '(11) 95555-5555', email: 'patricia@email.com' },
  { id: 6, nome: 'Roberto Alves', telefone: '(11) 94444-4444', email: 'roberto@email.com' },
  { id: 7, nome: 'Luciano Valadares', telefone: '(61) 98353-3073', email: 'lvaladares866@gmail.com' },
];

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