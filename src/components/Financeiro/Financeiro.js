import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { useFinanceiro } from './useFinanceiro';
import { useAuth } from '../../contexts/AuthContext';
import ResumoGeral from './ResumoGeral';
import FluxoCaixa from './FluxoCaixa';
import ComissoesGerais from './ComissoesGerais';
import Despesas from './Despesas';
import { meses, anos } from './constants';
import api from '../../services/api';

const Financeiro = () => {
  const {
    mesSelecionado,
    setMesSelecionado,
    anoSelecionado,
    setAnoSelecionado,
    vendas: vendasGlobais,
    despesas: despesasGlobais,
    pagamentosFuncionarios: pagamentosGlobais,
    calcularComissoesPorFuncionario,
    calcularResumoMensal,
    adicionarDespesa,
    removerDespesa,
    removerPagamentoFuncionario,
    loading
  } = useFinanceiro();

  const { usuario, temPermissao } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [comissoes, setComissoes] = useState([]);
  
  // 🔥 ESTADOS SEPARADOS PARA A ABA DE COMISSÕES
  const [comissoesMes, setComissoesMes] = useState(mesSelecionado);
  const [comissoesAno, setComissoesAno] = useState(anoSelecionado);
  const [comissoesData, setComissoesData] = useState([]);
  const [loadingComissoes, setLoadingComissoes] = useState(false);

  // 🔥 VERIFICAR SE É ADMIN OU GERENTE
  const isAdminOrGerente = usuario?.nivel === 'admin' || usuario?.nivel === 'gerente';
  const isFuncionario = usuario?.nivel === 'funcionario';
  const funcionarioId = usuario?.funcionarioId;

  // 🔥 FILTRAR DADOS PARA FUNCIONÁRIO
  const filtrarDadosPorFuncionario = (dados, campoId = 'funcionario_id') => {
    if (!isFuncionario) return dados;
    return dados.filter(item => item[campoId] === funcionarioId);
  };

  // 🔥 VENDAS FILTRADAS
  const vendas = isFuncionario 
    ? filtrarDadosPorFuncionario(vendasGlobais, 'funcionario_id')
    : vendasGlobais;

  // 🔥 DESPESAS - Funcionário NÃO vê despesas do salão
  const despesas = isFuncionario ? [] : despesasGlobais;

  // 🔥 PAGAMENTOS - Funcionário vê apenas seus próprios pagamentos
  const pagamentosFuncionarios = isFuncionario
    ? filtrarDadosPorFuncionario(pagamentosGlobais, 'funcionario_id')
    : pagamentosGlobais;

  // 🔥 CALCULAR RESUMO FILTRADO
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    totalDespesas: 0,
    totalPagamentos: 0,
    lucroLiquido: 0
  });

  // Calcular resumo com dados filtrados
  useEffect(() => {
    const totalVendas = vendas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
    const totalPagamentos = pagamentosFuncionarios.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    
    let totalDespesasValue = 0;
    if (!isFuncionario) {
      totalDespesasValue = despesas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
    }
    
    const despesasTotais = totalDespesasValue + totalPagamentos;
    
    setResumo({
      totalVendas,
      totalDespesas: despesasTotais,
      totalPagamentos,
      lucroLiquido: totalVendas - despesasTotais
    });
  }, [vendas, despesas, pagamentosFuncionarios, isFuncionario]);

  // Calcular comissões quando vendas mudarem (para a aba de resumo/fluxo)
  useEffect(() => {
    if (calcularComissoesPorFuncionario && isAdminOrGerente) {
      const novasComissoes = calcularComissoesPorFuncionario();
      setComissoes(novasComissoes);
    } else if (isFuncionario && vendas.length > 0) {
      // Para funcionário, calcular apenas suas próprias comissões
      const totalVendas = vendas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
      setComissoes([{
        funcionario_id: funcionarioId,
        funcionario_nome: usuario?.nome,
        totalVendas: totalVendas,
        comissao: totalVendas * 0.1
      }]);
    } else {
      setComissoes([]);
    }
  }, [vendas, calcularComissoesPorFuncionario, isAdminOrGerente, isFuncionario, funcionarioId, usuario]);

  // 🔥 FUNÇÃO PARA CARREGAR COMISSÕES DE UM MÊS/ANO ESPECÍFICO
  const carregarComissoesPorMesAno = useCallback(async (mes, ano) => {
    setLoadingComissoes(true);
    try {
      console.log(`🔍 Buscando comissões para ${meses[mes]}/${ano}`);
      
      const response = await api.get('/financeiro/vendas', {
        params: { mes: mes + 1, ano }
      });
      
      const vendasData = response.data;
      const comissoesCalculadas = {};
      
      vendasData.forEach(venda => {
        // Se for funcionário, filtrar apenas suas vendas
        if (isFuncionario && venda.funcionario_id !== funcionarioId) {
          return;
        }
        
        if (venda?.funcionario_id) {
          if (!comissoesCalculadas[venda.funcionario_id]) {
            comissoesCalculadas[venda.funcionario_id] = {
              funcionario_id: venda.funcionario_id,
              funcionario_nome: venda.funcionario_nome || 'Funcionário',
              totalVendas: 0,
              comissao: 0
            };
          }
          const valorVenda = Number(venda.valor_total) || 0;
          comissoesCalculadas[venda.funcionario_id].totalVendas += valorVenda;
          comissoesCalculadas[venda.funcionario_id].comissao += valorVenda * 0.1;
        }
      });
      
      setComissoesData(Object.values(comissoesCalculadas));
      
    } catch (error) {
      console.error('❌ Erro ao carregar comissões:', error);
      setComissoesData([]);
    } finally {
      setLoadingComissoes(false);
    }
  }, [isFuncionario, funcionarioId]);

  // Carregar comissões quando o mês/ano da aba de comissões mudar
  useEffect(() => {
    carregarComissoesPorMesAno(comissoesMes, comissoesAno);
  }, [comissoesMes, comissoesAno, carregarComissoesPorMesAno]);

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

  // Funções para navegação na aba de comissões
  const handleComissoesMesAnterior = () => {
    if (comissoesMes === 0) {
      setComissoesMes(11);
      setComissoesAno(comissoesAno - 1);
    } else {
      setComissoesMes(comissoesMes - 1);
    }
  };

  const handleComissoesProximoMes = () => {
    if (comissoesMes === 11) {
      setComissoesMes(0);
      setComissoesAno(comissoesAno + 1);
    } else {
      setComissoesMes(comissoesMes + 1);
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
          <p className="text-gray-600 mt-1">
            {isFuncionario 
              ? 'Seu faturamento e comissões' 
              : 'Controle geral das finanças do salão'}
          </p>
        </div>
      </div>

      {/* Seletor de Mês/Ano - Visível apenas para resumo e fluxo (e apenas para admin/gerente) */}
      {(abaAtiva === 'resumo' || abaAtiva === 'fluxo') && !isFuncionario && (
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
      )}

      {/* Abas de Navegação - Funcionário só vê comissões */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {!isFuncionario && (
          <>
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
          </>
        )}
        
        <button
          onClick={() => setAbaAtiva('comissoes')}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            abaAtiva === 'comissoes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          {isFuncionario ? 'Minhas Comissões' : 'Comissões'}
        </button>
        
        {!isFuncionario && (
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
        )}
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6">
        {abaAtiva === 'resumo' && !isFuncionario && (
          <ResumoGeral resumo={resumo} />
        )}

        {abaAtiva === 'fluxo' && !isFuncionario && (
          <FluxoCaixa 
            vendas={vendas} 
            despesas={despesas}
            pagamentosFuncionarios={pagamentosFuncionarios} 
          />
        )}

        {abaAtiva === 'comissoes' && (
          loadingComissoes ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando comissões...</span>
            </div>
          ) : (
            <>
              {/* Seletor de Mês/Ano específico para comissões */}
              <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleComissoesMesAnterior}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <select
                      value={comissoesMes}
                      onChange={(e) => setComissoesMes(parseInt(e.target.value))}
                      className="input-field w-40"
                    >
                      {meses.map((mes, index) => (
                        <option key={index} value={index}>{mes}</option>
                      ))}
                    </select>
                    
                    <select
                      value={comissoesAno}
                      onChange={(e) => setComissoesAno(parseInt(e.target.value))}
                      className="input-field w-24"
                    >
                      {anos.map(ano => (
                        <option key={ano} value={ano}>{ano}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleComissoesProximoMes}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <ComissoesGerais 
                comissoes={comissoesData}
                meses={meses}
                mesSelecionado={comissoesMes}
                anoSelecionado={comissoesAno}
              />
            </>
          )
        )}

        {abaAtiva === 'despesas' && !isFuncionario && (
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
