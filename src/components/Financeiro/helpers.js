// Formatar valor monetário
export const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Formatar data
export const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR');
};

// Calcular total de vendas
export const calcularTotalVendas = (vendas) => {
  return vendas.reduce((total, venda) => total + venda.valor, 0);
};

// Calcular total de despesas
export const calcularTotalDespesas = (despesas) => {
  return despesas.reduce((total, despesa) => total + despesa.valor, 0);
};

// Calcular lucro líquido
export const calcularLucroLiquido = (vendas, despesas) => {
  return calcularTotalVendas(vendas) - calcularTotalDespesas(despesas);
};

// Filtrar por período
export const filtrarPorPeriodo = (itens, mes, ano) => {
  return itens.filter(item => {
    const data = new Date(item.data);
    return data.getMonth() === mes && data.getFullYear() === ano;
  });
};