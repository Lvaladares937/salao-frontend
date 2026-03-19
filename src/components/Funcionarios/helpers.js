import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { statusPonto } from './constants';

// Formatar data para exibição
export const formatarData = (data) => {
  return format(new Date(data), 'dd/MM/yyyy');
};

// Formatar valor monetário
export const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Gerar dias do mês para calendário
export const gerarDiasDoMes = (ano, mes) => {
  const inicio = startOfMonth(new Date(ano, mes, 1));
  const fim = endOfMonth(inicio);
  return eachDayOfInterval({ start: inicio, end: fim });
};

// Calcular dias úteis do mês (segunda a sábado)
export const calcularDiasUteis = (ano, mes) => {
  const dias = gerarDiasDoMes(ano, mes);
  return dias.filter(dia => dia.getDay() !== 0).length; // Remove domingos
};

// Calcular salário com comissões
export const calcularSalarioFinal = (salarioBase, totalVendas, percentualComissao) => {
  const comissao = totalVendas * (percentualComissao / 100);
  return salarioBase + comissao;
};

// Calcular valor do dia baseado no salário
export const calcularValorDia = (salarioBase, diasNoMes) => {
  if (!salarioBase || !diasNoMes || diasNoMes === 0) return 0;
  return salarioBase / diasNoMes;
};

// Calcular valor de desconto baseado no salário e percentual
export const calcularValorDesconto = (salarioBase, diasNoMes, multiplicador) => {
  if (!salarioBase || !diasNoMes || !multiplicador) return 0;
  const valorDia = salarioBase / diasNoMes;
  return valorDia * multiplicador;
};

// Calcular dias trabalhados no mês
export const calcularDiasTrabalhados = (ponto, mes, ano) => {
  if (!ponto) return 0;
  
  return Object.entries(ponto)
    .filter(([data, info]) => {
      const dataObj = new Date(data);
      // Verifica se info é objeto com status ou string (para compatibilidade)
      const status = typeof info === 'object' ? info.status : info;
      return dataObj.getMonth() === mes && 
             dataObj.getFullYear() === ano && 
             status === statusPonto.TRABALHADO;
    }).length;
};

// Calcular total de descontos no mês
export const calcularTotalDescontos = (ponto, salarioBase, mes, ano) => {
  if (!ponto || !salarioBase) return 0;
  
  const dias = gerarDiasDoMes(ano, mes);
  const diasNoMes = dias.length;
  
  return Object.entries(ponto).reduce((total, [dataStr, info]) => {
    const data = new Date(dataStr);
    if (data.getMonth() === mes && data.getFullYear() === ano) {
      // Verificar se info é objeto (novo formato) ou string (formato antigo)
      if (typeof info === 'object') {
        // Se for falta com desconto
        if (info.status === statusPonto.FALTA && info.desconto) {
          return total + calcularValorDesconto(salarioBase, diasNoMes, info.desconto);
        }
      }
    }
    return total;
  }, 0);
};

// Gerar ponto inicial para um mês (agora retorna objeto com status)
export const gerarPontoInicial = (ano, mes) => {
  const dias = gerarDiasDoMes(ano, mes);
  const ponto = {};
  
  dias.forEach(dia => {
    const dataStr = format(dia, 'yyyy-MM-dd');
    // Por padrão, considera como trabalhado (segunda a sábado) e folga (domingo)
    if (dia.getDay() === 0) { // Domingo
      ponto[dataStr] = { status: statusPonto.FOLGA, desconto: 0 };
    } else {
      ponto[dataStr] = { status: statusPonto.TRABALHADO, desconto: 0 };
    }
  });
  
  return ponto;
};

// Calcular total de faltas no mês
export const calcularFaltas = (ponto, mes, ano) => {
  if (!ponto) return 0;
  
  return Object.entries(ponto)
    .filter(([data, info]) => {
      const dataObj = new Date(data);
      const status = typeof info === 'object' ? info.status : info;
      return dataObj.getMonth() === mes && 
             dataObj.getFullYear() === ano && 
             status === statusPonto.FALTA;
    }).length;
};

// Calcular total de faltas justificadas
export const calcularFaltasJustificadas = (ponto, mes, ano) => {
  if (!ponto) return 0;
  
  return Object.entries(ponto)
    .filter(([data, info]) => {
      const dataObj = new Date(data);
      const status = typeof info === 'object' ? info.status : info;
      return dataObj.getMonth() === mes && 
             dataObj.getFullYear() === ano && 
             status === statusPonto.FALTA_JUSTIFICADA;
    }).length;
};

// Calcular total de folgas
export const calcularFolgas = (ponto, mes, ano) => {
  if (!ponto) return 0;
  
  return Object.entries(ponto)
    .filter(([data, info]) => {
      const dataObj = new Date(data);
      const status = typeof info === 'object' ? info.status : info;
      return dataObj.getMonth() === mes && 
             dataObj.getFullYear() === ano && 
             status === statusPonto.FOLGA;
    }).length;
};

// Calcular total de feriados
export const calcularFeriados = (ponto, mes, ano) => {
  if (!ponto) return 0;
  
  return Object.entries(ponto)
    .filter(([data, info]) => {
      const dataObj = new Date(data);
      const status = typeof info === 'object' ? info.status : info;
      return dataObj.getMonth() === mes && 
             dataObj.getFullYear() === ano && 
             status === statusPonto.FERIADO;
    }).length;
};

// Migrar ponto antigo (formato string) para novo formato (objeto com desconto)
export const migrarPontoParaNovoFormato = (pontoAntigo) => {
  if (!pontoAntigo) return {};
  
  const pontoNovo = {};
  
  Object.entries(pontoAntigo).forEach(([data, valor]) => {
    if (typeof valor === 'string') {
      // Formato antigo: apenas string com status
      pontoNovo[data] = {
        status: valor,
        desconto: valor === statusPonto.FALTA ? 1 : 0 // 100% de desconto para faltas antigas
      };
    } else if (typeof valor === 'object' && valor !== null) {
      // Já está no novo formato
      pontoNovo[data] = valor;
    } else {
      // Fallback
      pontoNovo[data] = { status: statusPonto.TRABALHADO, desconto: 0 };
    }
  });
  
  return pontoNovo;
};