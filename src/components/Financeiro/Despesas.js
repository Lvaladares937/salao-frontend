import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, Users } from 'lucide-react';

const Despesas = ({ 
  despesas = [], 
  pagamentosFuncionarios = [], 
  onAdicionar, 
  onRemover,
  onRemoverPagamentoFuncionario
}) => {
  const [showForm, setShowForm] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: '',
    categoria: 'Outros',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    formaPagamento: 'Dinheiro'
  });

  const formatarMoeda = (valor) => {
    return valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const categoriasDespesas = [
    'Aluguel', 'Água', 'Luz', 'Telefone/Internet', 'Produtos',
    'Material de Limpeza', 'Manutenção', 'Marketing', 'Impostos',
    'Pró-Labore', 'Salários', 'Comissões', 'Outros'
  ];

  const formasPagamento = [
    'Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Crediário'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!novaDespesa.descricao || !novaDespesa.valor) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    onAdicionar({
      ...novaDespesa,
      valor: parseFloat(novaDespesa.valor)
    });

    setNovaDespesa({
      descricao: '',
      categoria: 'Outros',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      formaPagamento: 'Dinheiro'
    });
    setShowForm(false);
  };

  // Combinar despesas comuns e pagamentos de funcionários
  const todasDespesas = [
    ...(despesas || []).map(d => ({ ...d, tipo: 'despesa' })),
    ...(pagamentosFuncionarios || []).map(p => ({
      id: `func_${p.id}`,
      descricao: `Salário: ${p.funcionario_nome || 'Funcionário'}`,
      categoria: 'Salários',
      valor: p.valor || 0,
      data: p.data_pagamento || p.data || new Date(),
      formaPagamento: p.forma_pagamento || 'Dinheiro',
      tipo: 'pagamento_funcionario',
      originalId: p.id
    }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  const handleRemover = (item) => {
    if (item.tipo === 'pagamento_funcionario') {
      if (window.confirm(`Remover pagamento de ${item.descricao}?`)) {
        if (onRemoverPagamentoFuncionario) {
          onRemoverPagamentoFuncionario(item.originalId);
        } else {
          console.error('Função onRemoverPagamentoFuncionario não fornecida');
          alert('Função de remover pagamento não disponível');
        }
      }
    } else {
      if (window.confirm(`Remover despesa ${item.descricao}?`)) {
        onRemover(item.id);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Despesas e Pagamentos
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Despesa
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              value={novaDespesa.descricao}
              onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Compra de produtos"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={novaDespesa.categoria}
                onChange={(e) => setNovaDespesa({...novaDespesa, categoria: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categoriasDespesas.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={novaDespesa.valor}
                onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={novaDespesa.data}
                onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={novaDespesa.formaPagamento}
                onChange={(e) => setNovaDespesa({...novaDespesa, formaPagamento: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {formasPagamento.map(fp => (
                  <option key={fp} value={fp}>{fp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Despesa
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {todasDespesas.length > 0 ? (
          todasDespesas.map((item, index) => (
            <div 
              key={item.id || index}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                item.tipo === 'pagamento_funcionario' 
                  ? 'bg-purple-50 hover:bg-purple-100' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {item.tipo === 'pagamento_funcionario' && (
                    <Users className="w-4 h-4 text-purple-600" />
                  )}
                  {item.descricao}
                </p>
                <p className="text-xs text-gray-600">
                  {item.categoria} • {formatarData(item.data)} • {item.formaPagamento}
                  {item.tipo === 'pagamento_funcionario' && (
                    <span className="ml-2 text-purple-600">(Pagamento Funcionário)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`font-semibold ${
                  item.tipo === 'pagamento_funcionario' 
                    ? 'text-purple-600' 
                    : 'text-red-600'
                }`}>
                  {formatarMoeda(item.valor)}
                </span>
                <button
                  onClick={() => handleRemover(item)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  title={item.tipo === 'pagamento_funcionario' ? 'Remover pagamento' : 'Remover despesa'}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            Nenhuma despesa ou pagamento cadastrado
          </p>
        )}
      </div>
    </div>
  );
};

export default Despesas;
