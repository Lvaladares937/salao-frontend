import React, { useState } from 'react';
import { X, Save, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const ModalMovimentacao = ({ show, onClose, produto, onRegistrar }) => {
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    quantidade: 1,
    motivo: '',
    valor_unitario: produto?.preco_custo || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.quantidade || formData.quantidade <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    onRegistrar({
      ...formData,
      produto_id: produto.id,
      quantidade: parseInt(formData.quantidade),
      valor_unitario: formData.valor_unitario ? parseFloat(formData.valor_unitario) : null
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Movimentar Estoque - {produto?.nome}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimentação
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tipo"
                  value="entrada"
                  checked={formData.tipo === 'entrada'}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                />
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
                <span>Entrada</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tipo"
                  value="saida"
                  checked={formData.tipo === 'saida'}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                />
                <ArrowDownCircle className="w-5 h-5 text-red-600" />
                <span>Saída</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
              className="input-field"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Unitário (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valor_unitario}
              onChange={(e) => setFormData({...formData, valor_unitario: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({...formData, motivo: e.target.value})}
              className="input-field"
              rows="2"
              placeholder="Ex: Compra, Venda, Ajuste, Devolução..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalMovimentacao;