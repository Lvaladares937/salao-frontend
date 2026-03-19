import React, { useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Package, Scissors, Tag, Users } from 'lucide-react';

const FluxoCaixa = ({ vendas, despesas, pagamentosFuncionarios = [] }) => {
  // Logs para depuração
  useEffect(() => {
    console.log('📊 FLUXO CAIXA - Props recebidas:');
    console.log('   vendas:', vendas);
    console.log('   despesas:', despesas);
    console.log('   pagamentosFuncionarios:', pagamentosFuncionarios);
    console.log('   vendas é array?', Array.isArray(vendas));
    console.log('   despesas é array?', Array.isArray(despesas));
    console.log('   pagamentosFuncionarios é array?', Array.isArray(pagamentosFuncionarios));
    console.log('   quantidade vendas:', vendas?.length || 0);
    console.log('   quantidade despesas:', despesas?.length || 0);
    console.log('   quantidade pagamentos:', pagamentosFuncionarios?.length || 0);
  }, [vendas, despesas, pagamentosFuncionarios]);

  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero)) return 'R$ 0,00';
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data) => {
    if (!data) return 'Data não informada';
    try {
      if (typeof data === 'string') {
        if (data.includes('T')) {
          const [dataPart] = data.split('T');
          const [ano, mes, dia] = dataPart.split('-');
          return `${dia}/${mes}/${ano}`;
        }
        if (data.includes('-')) {
          const [ano, mes, dia] = data.split('-');
          return `${dia}/${mes}/${ano}`;
        }
      }
      const date = new Date(data);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Garantir que todos são arrays
  const vendasArray = Array.isArray(vendas) ? vendas : [];
  const despesasArray = Array.isArray(despesas) ? despesas : [];
  const pagamentosArray = Array.isArray(pagamentosFuncionarios) ? pagamentosFuncionarios : [];

  // Processar vendas
  const vendasProcessadas = vendasArray.map(v => {
    const valor = parseFloat(v.valor_total || v.valor || 0);
    
    return {
      ...v,
      tipo: 'venda',
      valor: valor,
      data: v.data_venda || v.data || new Date(),
      descricao: v.servico_nome || v.produto_nome || 'Venda',
      detalhes: v.cliente_nome || 'Cliente',
      forma_pagamento: v.forma_pagamento || 'Dinheiro',
      categoria: 'Venda'
    };
  });

  // Processar despesas comuns
  const despesasProcessadas = despesasArray.map(d => {
    return {
      ...d,
      tipo: 'despesa',
      valor: parseFloat(d.valor || 0),
      descricao: d.descricao || 'Despesa',
      categoria: d.categoria || 'Outros',
      data: d.data,
      detalhes: d.categoria,
      isPagamentoFuncionario: false
    };
  });

  // Processar pagamentos de funcionários (como despesas)
  const pagamentosProcessados = pagamentosArray.map(p => {
    return {
      ...p,
      tipo: 'despesa',
      valor: parseFloat(p.valor || 0),
      descricao: `Salário: ${p.funcionario_nome || 'Funcionário'}`,
      categoria: 'Salários',
      data: p.data_pagamento,
      detalhes: `${p.mes + 1}/${p.ano}`,
      isPagamentoFuncionario: true,
      forma_pagamento: p.forma_pagamento || 'Dinheiro'
    };
  });

  // Combinar e ordenar todas as transações
  const todasTransacoes = [
    ...vendasProcessadas,
    ...despesasProcessadas,
    ...pagamentosProcessados
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  console.log('📊 Vendas processadas:', vendasProcessadas);
  console.log('📊 Despesas processadas:', despesasProcessadas);
  console.log('📊 Pagamentos processados:', pagamentosProcessados);
  console.log('📊 Total transações:', todasTransacoes.length);

  // Calcular totais
  const totalVendas = vendasProcessadas.reduce((acc, v) => acc + v.valor, 0);
  const totalDespesasComuns = despesasProcessadas.reduce((acc, d) => acc + d.valor, 0);
  const totalPagamentos = pagamentosProcessados.reduce((acc, p) => acc + p.valor, 0);
  const totalDespesas = totalDespesasComuns + totalPagamentos;
  const saldo = totalVendas - totalDespesas;

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total de Vendas</p>
              <p className="text-3xl font-bold">{formatarMoeda(totalVendas)}</p>
            </div>
            <ArrowUpCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Despesas Comuns</p>
              <p className="text-3xl font-bold">{formatarMoeda(totalDespesasComuns)}</p>
            </div>
            <ArrowDownCircle className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pagamentos Funcionários</p>
              <p className="text-3xl font-bold">{formatarMoeda(totalPagamentos)}</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl shadow-lg p-6 text-white ${
          saldo >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Saldo do Período</p>
              <p className="text-3xl font-bold">{formatarMoeda(saldo)}</p>
            </div>
            <Calendar className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Informação de debug (remova depois) */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="font-bold">Debug Info:</p>
        <p>Vendas: {vendasArray.length} | Despesas: {despesasArray.length} | Pagamentos: {pagamentosArray.length}</p>
        <p>Transações totais: {todasTransacoes.length}</p>
      </div>

      {/* Lista de transações */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Movimentações
        </h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {todasTransacoes.length > 0 ? (
            todasTransacoes.map((transacao, index) => (
              <div 
                key={`${transacao.tipo}-${transacao.id || index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {transacao.tipo === 'venda' ? (
                    <div className="relative">
                      <ArrowUpCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="relative">
                      <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      {transacao.isPagamentoFuncionario && (
                        <Users className="w-3 h-3 text-red-600 absolute -top-1 -right-1" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">
                        {transacao.descricao}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        transacao.tipo === 'venda' 
                          ? 'bg-green-100 text-green-700'
                          : transacao.isPagamentoFuncionario
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transacao.tipo === 'venda' ? 'Venda' : 
                         transacao.isPagamentoFuncionario ? 'Salário' : 'Despesa'}
                      </span>
                      
                      {transacao.forma_pagamento && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {transacao.forma_pagamento}
                        </span>
                      )}
                    </div>
                    
                    {transacao.detalhes && (
                      <p className="text-xs text-gray-600 mt-1">
                        {transacao.detalhes}
                        {transacao.isPagamentoFuncionario && transacao.observacoes && (
                          <span className="ml-2 text-purple-600">• {transacao.observacoes}</span>
                        )}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatarData(transacao.data)}
                      {transacao.categoria && transacao.categoria !== 'Salários' && (
                        <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded">
                          {transacao.categoria}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <span className={`font-semibold whitespace-nowrap ml-4 ${
                  transacao.tipo === 'venda' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transacao.tipo === 'venda' ? '+ ' : '- '}{formatarMoeda(transacao.valor)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma movimentação no período</p>
              <p className="text-sm text-gray-400 mt-2">
                Vendas: {vendasArray.length} | Despesas: {despesasArray.length} | Pagamentos: {pagamentosArray.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FluxoCaixa;