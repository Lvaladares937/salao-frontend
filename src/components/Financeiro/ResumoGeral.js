import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

const ResumoGeral = ({ resumo }) => {
  // Garantir que resumo existe e tem valores padrão
  const dados = {
    totalVendas: resumo?.totalVendas || 0,
    totalDespesas: resumo?.totalDespesas || 0,
    totalPagamentos: resumo?.totalPagamentos || 0,
    lucroLiquido: resumo?.lucroLiquido || 0
  };

  const formatarMoeda = (valor) => {
    // Garantir que valor é número
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const cards = [
    {
      titulo: 'Vendas Totais',
      valor: dados.totalVendas,
      icone: TrendingUp,
      cor: 'bg-gradient-to-br from-green-400 to-green-600',
      corTexto: 'text-green-600'
    },
    {
      titulo: 'Despesas Totais',
      valor: dados.totalDespesas,
      icone: TrendingDown,
      cor: 'bg-gradient-to-br from-red-400 to-red-600',
      corTexto: 'text-red-600'
    },
    {
      titulo: 'Pagamentos Funcionários',
      valor: dados.totalPagamentos,
      icone: DollarSign,
      cor: 'bg-gradient-to-br from-purple-400 to-purple-600',
      corTexto: 'text-purple-600'
    },
    {
      titulo: 'Lucro Líquido',
      valor: dados.lucroLiquido,
      icone: PieChart,
      cor: dados.lucroLiquido >= 0 
        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
        : 'bg-gradient-to-br from-orange-400 to-orange-600',
      corTexto: dados.lucroLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Resumo Financeiro</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icone = card.icone;
          const valorFormatado = formatarMoeda(card.valor);
          const isLucro = card.titulo === 'Lucro Líquido';
          const sinal = card.valor >= 0 ? '' : '-';
          
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.cor.split(' ')[0]} ${card.cor.split(' ')[1]}`}>
                  <Icone className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${card.corTexto}`}>
                  {card.titulo === 'Lucro Líquido' && card.valor >= 0 ? '▲' : '▼'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">{card.titulo}</p>
              <p className={`text-2xl font-bold ${isLucro ? (card.valor >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-900'}`}>
                {sinal}{valorFormatado}
              </p>
              
              {card.titulo === 'Lucro Líquido' && (
                <p className="text-xs text-gray-500 mt-2">
                  {card.valor >= 0 
                    ? 'Resultado positivo no período' 
                    : 'Resultado negativo no período'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Detalhamento adicional */}
      <div className="bg-gray-50 rounded-xl p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Detalhamento do Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Receitas</p>
            <p className="text-xl font-bold text-green-600">{formatarMoeda(dados.totalVendas)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Despesas</p>
            <p className="text-xl font-bold text-red-600">{formatarMoeda(dados.totalDespesas)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total de Pagamentos</p>
            <p className="text-xl font-bold text-purple-600">{formatarMoeda(dados.totalPagamentos)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
            <p className={`text-xl font-bold ${dados.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatarMoeda(dados.lucroLiquido)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoGeral;