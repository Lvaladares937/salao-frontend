import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle, XCircle, AlertTriangle, 
  Calendar, DollarSign, Plus, Trash2, Percent, TrendingUp 
} from 'lucide-react';
import { formatarMoeda } from './helpers';

const Pagamentos = ({ 
  funcionario, 
  salarioFinal,
  totalDescontos,
  salarioBase,
  diasTrabalhados,
  valorDia,
  totalComissao = 0,
  pagamentoRealizado,
  onRegistrarPagamento,
  onVisualizarDetalhes,
  onRegistrarAdiantamento,
  onRemoverAdiantamento,
  adiantamentos = []
}) => {
  const [mostrarFormAdiantamento, setMostrarFormAdiantamento] = useState(false);
  const [novoAdiantamento, setNovoAdiantamento] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    motivo: '',
    formaPagamento: 'Dinheiro'
  });

  // Função para garantir que valor é número
  const garantirNumero = (valor) => {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      const parsed = parseFloat(valor);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Processar adiantamentos garantindo que são números
  const adiantamentosProcessados = adiantamentos.map(ad => ({
    ...ad,
    valor: garantirNumero(ad.valor)
  }));

  // Calcular total de adiantamentos
  const totalAdiantamentos = adiantamentosProcessados.reduce((acc, ad) => acc + ad.valor, 0);
  
  // Garantir que todos os valores são números
  const salarioBaseNum = garantirNumero(salarioBase);
  const totalDescontosNum = garantirNumero(totalDescontos);
  const totalComissaoNum = garantirNumero(totalComissao);
  const valorDiaNum = garantirNumero(valorDia);
  
  // Cálculos
  const salarioComDescontos = salarioBaseNum - totalDescontosNum;
  const salarioTotal = salarioComDescontos + totalComissaoNum;
  const salarioLiquido = salarioTotal - totalAdiantamentos;

  const handleRegistrarAdiantamento = () => {
    if (!novoAdiantamento.valor || parseFloat(novoAdiantamento.valor) <= 0) {
      alert('Digite um valor válido para o adiantamento');
      return;
    }

    const valorNumerico = parseFloat(novoAdiantamento.valor);
    
    if (valorNumerico > salarioTotal) {
      alert('O valor do adiantamento não pode ser maior que o salário total (incluindo comissões)');
      return;
    }

    // Criar objeto com valor numérico
    const adiantamentoParaEnviar = {
      ...novoAdiantamento,
      valor: valorNumerico,
      id: Date.now()
    };

    onRegistrarAdiantamento(adiantamentoParaEnviar);

    setNovoAdiantamento({
      valor: '',
      data: new Date().toISOString().split('T')[0],
      motivo: '',
      formaPagamento: 'Dinheiro'
    });
    setMostrarFormAdiantamento(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-600" />
        Pagamento - {funcionario?.nome}
      </h3>

      <div className="space-y-4">
        {/* Resumo do salário */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Salário Base</p>
            <p className="text-lg font-semibold">{formatarMoeda(salarioBaseNum)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Valor/Dia</p>
            <p className="text-lg font-semibold">{formatarMoeda(valorDiaNum)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Dias Trabalhados</p>
            <p className="text-lg font-semibold">{diasTrabalhados}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Descontos</p>
            <p className="text-lg font-semibold text-red-600">{formatarMoeda(totalDescontosNum)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-600">Comissões</p>
            <p className="text-lg font-semibold text-green-600">{formatarMoeda(totalComissaoNum)}</p>
          </div>
        </div>

        {/* Cálculo detalhado */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Cálculo do Salário
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Salário Base:</span>
              <span className="font-medium">{formatarMoeda(salarioBaseNum)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>(-) Descontos:</span>
              <span className="font-medium">- {formatarMoeda(totalDescontosNum)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>(+) Comissões:</span>
              <span className="font-medium">+ {formatarMoeda(totalComissaoNum)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200 font-bold">
              <span>Subtotal:</span>
              <span>{formatarMoeda(salarioTotal)}</span>
            </div>
          </div>
        </div>

        {/* Seção de Adiantamentos */}
        <div className="border-t border-b border-gray-200 py-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              Adiantamentos do Mês
              {totalAdiantamentos > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Total: {formatarMoeda(totalAdiantamentos)}
                </span>
              )}
            </h4>
            {!pagamentoRealizado && (
              <button
                onClick={() => setMostrarFormAdiantamento(!mostrarFormAdiantamento)}
                className="text-sm bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Novo Adiantamento
              </button>
            )}
          </div>

          {/* Formulário de adiantamento */}
          {mostrarFormAdiantamento && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h5 className="font-medium text-yellow-800 mb-3">Registrar Adiantamento</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoAdiantamento.valor}
                    onChange={(e) => setNovoAdiantamento({...novoAdiantamento, valor: e.target.value})}
                    className="input-field text-sm"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Data</label>
                  <input
                    type="date"
                    value={novoAdiantamento.data}
                    onChange={(e) => setNovoAdiantamento({...novoAdiantamento, data: e.target.value})}
                    className="input-field text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Motivo</label>
                  <input
                    type="text"
                    value={novoAdiantamento.motivo}
                    onChange={(e) => setNovoAdiantamento({...novoAdiantamento, motivo: e.target.value})}
                    className="input-field text-sm"
                    placeholder="Ex: Adiantamento de salário"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Forma de Pagamento</label>
                  <select
                    value={novoAdiantamento.formaPagamento}
                    onChange={(e) => setNovoAdiantamento({...novoAdiantamento, formaPagamento: e.target.value})}
                    className="input-field text-sm"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Cartão">Cartão</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setMostrarFormAdiantamento(false)}
                  className="btn-secondary text-sm py-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarAdiantamento}
                  className="bg-yellow-600 text-white px-4 py-1 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Registrar
                </button>
              </div>
            </div>
          )}

          {/* Lista de adiantamentos */}
          {adiantamentosProcessados.length > 0 && (
            <div className="space-y-2 mb-3">
              {adiantamentosProcessados.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        R$ {ad.valor.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ad.data).toLocaleDateString('pt-BR')} - {ad.motivo || 'Sem motivo'} ({ad.formaPagamento})
                      </p>
                    </div>
                  </div>
                  {!pagamentoRealizado && (
                    <button
                      onClick={() => onRemoverAdiantamento(ad.id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo financeiro completo */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Salário base:</span>
            <span className="font-semibold">{formatarMoeda(salarioBaseNum)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-red-700">(-) Descontos:</span>
            <span className="font-semibold text-red-700">- {formatarMoeda(totalDescontosNum)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-green-700">(+) Comissões:</span>
            <span className="font-semibold text-green-700">+ {formatarMoeda(totalComissaoNum)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-700">Subtotal:</span>
            <span className="font-semibold text-blue-700">{formatarMoeda(salarioTotal)}</span>
          </div>
          
          {totalAdiantamentos > 0 && (
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-700">(-) Adiantamentos:</span>
              <span className="font-semibold text-yellow-700">- {formatarMoeda(totalAdiantamentos)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border border-purple-200 mt-2">
            <div>
              <p className="text-sm text-purple-600 font-bold">VALOR LÍQUIDO A PAGAR</p>
              <p className="text-xs text-purple-500">
                {totalAdiantamentos > 0 ? 'Salário + Comissões - Adiantamentos' : 'Salário + Comissões'}
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{formatarMoeda(salarioLiquido)}</p>
          </div>
        </div>

        {/* Botão de pagamento */}
        <div className="flex justify-end">
          {pagamentoRealizado ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Pagamento já realizado para este mês</span>
            </div>
          ) : (
            <button
              onClick={() => onRegistrarPagamento(totalAdiantamentos)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
              disabled={salarioLiquido <= 0}
            >
              <CreditCard className="w-5 h-5" />
              Registrar Pagamento de {formatarMoeda(salarioLiquido)}
            </button>
          )}
        </div>

        {/* Detalhamento dos descontos */}
        {totalDescontosNum > 0 && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Descontos por faltas</p>
                <p className="text-xs text-yellow-700">
                  Total: {formatarMoeda(totalDescontosNum)}
                </p>
                <button 
                  onClick={onVisualizarDetalhes}
                  className="text-xs text-yellow-700 underline mt-1 hover:text-yellow-800"
                >
                  Ver detalhamento no ponto
                </button>
              </div>
            </div>
          </div>
        )}

        {pagamentoRealizado && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              Pagamento registrado com sucesso para este mês.
              {totalAdiantamentos > 0 && ` Foram descontados ${formatarMoeda(totalAdiantamentos)} em adiantamentos.`}
              {totalComissaoNum > 0 && ` Foram incluídas ${formatarMoeda(totalComissaoNum)} em comissões.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagamentos;