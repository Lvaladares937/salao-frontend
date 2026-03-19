import React from 'react';
import { DollarSign, Users, TrendingUp, Award } from 'lucide-react';

const ComissoesGerais = ({ 
  comissoes = [], 
  meses = [], 
  mesSelecionado = 0 
}) => {
  // Garantir que comissoes é um array
  const listaComissoes = Array.isArray(comissoes) ? comissoes : [];

  const formatarMoeda = (valor) => {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Calcular totais
  const totais = listaComissoes.reduce((acc, item) => {
    return {
      totalVendas: acc.totalVendas + (Number(item.totalVendas) || 0),
      totalComissoes: acc.totalComissoes + (Number(item.comissao) || 0)
    };
  }, { totalVendas: 0, totalComissoes: 0 });

  // Nome do mês atual - CORRIGIDO
  const nomeMes = meses && meses.length > 0 && mesSelecionado !== undefined 
    ? meses[mesSelecionado] 
    : 'este mês';

  if (listaComissoes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma comissão no período
        </h3>
        <p className="text-gray-500">
          Não há vendas registradas para {nomeMes}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Comissões por Funcionário</h2>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Comissões</p>
              <p className="text-3xl font-bold">{formatarMoeda(totais.totalComissoes)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total em Vendas</p>
              <p className="text-3xl font-bold">{formatarMoeda(totais.totalVendas)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Funcionários</p>
              <p className="text-3xl font-bold">{listaComissoes.length}</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabela de comissões */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funcionário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total em Vendas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comissão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Sobre Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listaComissoes.map((func, index) => {
              const totalVendas = Number(func.totalVendas) || 0;
              const comissao = Number(func.comissao) || 0;
              const percentual = totais.totalVendas > 0 
                ? ((totalVendas / totais.totalVendas) * 100).toFixed(1)
                : '0.0';
              
              return (
                <tr key={func.funcionario_id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {func.funcionario_nome || 'Funcionário'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                    {formatarMoeda(totalVendas)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                    {formatarMoeda(comissao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {percentual}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Informação adicional */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Importante:</strong> As comissões são calculadas com base nas vendas realizadas no período selecionado.
        </p>
      </div>
    </div>
  );
};

export default ComissoesGerais;