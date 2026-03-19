import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { useFinanceiro } from './useFinanceiro';
import ResumoGeral from './ResumoGeral';
import FluxoCaixa from './FluxoCaixa';
import ComissoesGerais from './ComissoesGerais';
import Despesas from './Despesas';
import { meses, anos } from './constants';

const Financeiro = () => {
  const {
    mesSelecionado,
    setMesSelecionado,
    anoSelecionado,
    setAnoSelecionado,
    vendas,
    despesas,
    pagamentosFuncionarios,
    calcularComissoesPorFuncionario,
    calcularResumoMensal,
    adicionarDespesa,
    removerDespesa,
    removerPagamentoFuncionario,
    loading
  } = useFinanceiro();

  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    totalDespesas: 0,
    totalPagamentos: 0,
    lucroLiquido: 0
  });
  const [comissoes, setComissoes] = useState([]);

  // Calcular resumo quando vendas/despesas/pagamentos mudarem
  useEffect(() => {
    if (calcularResumoMensal) {
      const novoResumo = calcularResumoMensal();
      setResumo(novoResumo);
    }
  }, [vendas, despesas, pagamentosFuncionarios, calcularResumoMensal]);

  // Calcular comissões quando vendas mudarem
  useEffect(() => {
    if (calcularComissoesPorFuncionario) {
      const novasComissoes = calcularComissoesPorFuncionario();
      setComissoes(novasComissoes);
    }
  }, [vendas, calcularComissoesPorFuncionario]);

  const handleMesAnterior = () => {
    if (mesSelecionado === 0) {
      setMesSelecionado(11);
      setAnoSelecionado(anoSelecionado - 1);
    } else {
      setMesSelecionado(mesSelecionado - 1);
    }
  };

  const handleProximoMes = () => {
    if (mesSelecionado === 11) {
      setMesSelecionado(0);
      setAnoSelecionado(anoSelecionado + 1);
    } else {
      setMesSelecionado(mesSelecionado + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-1">Controle geral das finanças do salão</p>
        </div>
      </div>

      {/* Seletor de Mês/Ano */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleMesAnterior}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
              className="input-field w-40"
            >
              {meses.map((mes, index) => (
                <option key={index} value={index}>{mes}</option>
              ))}
            </select>
            
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
              className="input-field w-24"
            >
              {anos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleProximoMes}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setAbaAtiva('resumo')}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            abaAtiva === 'resumo'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <PieChart className="w-4 h-4 inline mr-2" />
          Resumo Geral
        </button>
        
        <button
          onClick={() => setAbaAtiva('fluxo')}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            abaAtiva === 'fluxo'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Fluxo de Caixa
        </button>
        
        <button
          onClick={() => setAbaAtiva('comissoes')}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            abaAtiva === 'comissoes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Comissões
        </button>
        
        <button
          onClick={() => setAbaAtiva('despesas')}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            abaAtiva === 'despesas'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Despesas
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6">
        {abaAtiva === 'resumo' && (
          <ResumoGeral resumo={resumo} />
        )}

        {abaAtiva === 'fluxo' && (
          <FluxoCaixa 
            vendas={vendas} 
            despesas={despesas}
            pagamentosFuncionarios={pagamentosFuncionarios} 
          />
        )}

        {abaAtiva === 'comissoes' && (
          <ComissoesGerais 
            comissoes={comissoes || []}
            meses={meses}
            mesSelecionado={mesSelecionado}
          />
        )}

        {abaAtiva === 'despesas' && (
          <Despesas
            despesas={despesas}
            pagamentosFuncionarios={pagamentosFuncionarios}
            onAdicionar={adicionarDespesa}
            onRemover={removerDespesa}
            onRemoverPagamentoFuncionario={removerPagamentoFuncionario}
          />
        )}
      </div>
    </div>
  );
};

export default Financeiro;