import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, CheckCircle, CreditCard, DollarSign } from 'lucide-react';
import { formatarMoeda } from './helpers';
import agendamentosService from '../../services/agendamentosService';
import { useAuth } from '../../contexts/AuthContext';

const Comissoes = ({ 
  funcionario, 
  mesSelecionado, 
  anoSelecionado,
  onComissaoCalculada // Nova prop para enviar o total de comissões para o componente pai
}) => {
  const [vendas, setVendas] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [totalComissao, setTotalComissao] = useState(0);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();

  // Determinar qual funcionário mostrar
  const funcionarioId = funcionario?.id || usuario?.funcionarioId;
  const nomeFuncionario = funcionario?.nome || usuario?.nome;

  // Buscar agendamentos concluídos do funcionário no mês selecionado
  useEffect(() => {
    const carregarVendas = async () => {
      if (!funcionarioId) {
        console.log('⚠️ Nenhum funcionário selecionado');
        return;
      }
      
      setLoading(true);
      // Limpar dados anteriores
      setVendas([]);
      setTotalVendas(0);
      setTotalComissao(0);
      
      try {
        console.log('🔍 Buscando agendamentos concluídos para:', {
          funcionarioId,
          mes: mesSelecionado,
          ano: anoSelecionado
        });
        
        const agendamentos = await agendamentosService.buscarPorFuncionarioPeriodo(
          funcionarioId,
          mesSelecionado,
          anoSelecionado,
          'concluido'
        );
        
        console.log('📦 Agendamentos concluídos:', agendamentos);
        
        // Calcular totais com informações de pagamento
        const vendasFormatadas = agendamentos.map(ag => ({
          id: ag.id,
          data: ag.data_hora,
          valor: parseFloat(ag.valor || ag.servico_preco || 0),
          servico: ag.servico_nome,
          cliente: ag.cliente_nome,
          comissao: parseFloat(ag.valor_comissao || 0),
          forma_pagamento: ag.forma_pagamento,
          bandeira_cartao: ag.bandeira_cartao,
          parcelas: ag.parcelas || 1
        }));
        
        setVendas(vendasFormatadas);
        
        const totalVendasValor = vendasFormatadas.reduce((acc, v) => acc + v.valor, 0);
        const totalComissaoValor = vendasFormatadas.reduce((acc, v) => acc + v.comissao, 0);
        
        setTotalVendas(totalVendasValor);
        setTotalComissao(totalComissaoValor);
        
        // Enviar o total de comissões para o componente pai
        if (onComissaoCalculada) {
          onComissaoCalculada(totalComissaoValor);
        }
        
      } catch (error) {
        console.error('❌ Erro ao carregar vendas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarVendas();
  }, [funcionarioId, mesSelecionado, anoSelecionado, onComissaoCalculada]);

  // Função para traduzir forma de pagamento
  const traduzirFormaPagamento = (forma) => {
    const formas = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'debito': 'Cartão de Débito',
      'credito': 'Cartão de Crédito',
      'credito_parcelado': 'Cartão de Crédito Parcelado',
      'transferencia': 'Transferência',
      'fiado': 'Fiado'
    };
    return formas[forma] || forma;
  };

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return 'Data não informada';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2 text-gray-600">Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        Comissões e Vendas - {nomeFuncionario || 'Funcionário'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
          <p className="text-2xl font-bold text-blue-600">{formatarMoeda(totalVendas)}</p>
          <p className="text-xs text-gray-500 mt-1">{vendas.length} serviços concluídos</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Comissão</p>
          <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalComissao)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {vendas.length > 0 ? 'Média: ' + formatarMoeda(totalComissao / vendas.length) : '0%'}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Salário + Comissão</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatarMoeda((parseFloat(funcionario?.salario_base) || 0) + totalComissao)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Salário base: {formatarMoeda(parseFloat(funcionario?.salario_base) || 0)}
          </p>
        </div>
      </div>

      {/* Lista de vendas do mês */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Serviços Concluídos em {mesSelecionado + 1}/{anoSelecionado}
        </h4>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {vendas.length > 0 ? (
            vendas.map(venda => (
              <div key={venda.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">{venda.servico}</p>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    {venda.cliente} • {formatarData(venda.data)}
                  </p>
                  
                  {/* Informações de pagamento */}
                  {venda.forma_pagamento && (
                    <div className="flex items-center gap-1 ml-6 mt-1">
                      <CreditCard className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Pagamento: {traduzirFormaPagamento(venda.forma_pagamento)}
                        {venda.bandeira_cartao && ` - ${venda.bandeira_cartao}`}
                        {venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-green-600 block">
                    {formatarMoeda(venda.valor)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Comissão: {formatarMoeda(venda.comissao)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum serviço concluído neste período</p>
              <p className="text-xs text-gray-400 mt-1">
                {funcionarioId ? 
                  'Os serviços aparecerão aqui quando forem marcados como "concluído"' :
                  'Selecione um funcionário para ver suas comissões'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo rápido */}
      {vendas.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Ticket médio:</p>
              <p className="font-semibold">{formatarMoeda(totalVendas / vendas.length)}</p>
            </div>
            <div>
              <p className="text-gray-600">Comissão média:</p>
              <p className="font-semibold">{formatarMoeda(totalComissao / vendas.length)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comissoes;