import React, { useState, useEffect } from 'react';
import { X, Save, Package, DollarSign, Hash, Calendar } from 'lucide-react';

const ModalProduto = ({ show, onClose, produto, onSave, modo }) => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    quantidade: 0,
    quantidade_minima: 5,
    preco_custo: '',
    preco_venda: '',
    fornecedor: '',
    codigo_barras: '',
    localizacao: '',
    data_ultima_compra: '',
    data_validade: '',
    observacoes: ''
  });

  useEffect(() => {
    if (produto && modo === 'editar') {
      setFormData({
        nome: produto.nome || '',
        categoria: produto.categoria || '',
        quantidade: produto.quantidade || 0,
        quantidade_minima: produto.quantidade_minima || 5,
        preco_custo: produto.preco_custo || '',
        preco_venda: produto.preco_venda || '',
        fornecedor: produto.fornecedor || '',
        codigo_barras: produto.codigo_barras || '',
        localizacao: produto.localizacao || '',
        data_ultima_compra: produto.data_ultima_compra || '',
        data_validade: produto.data_validade || '',
        observacoes: produto.observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        categoria: '',
        quantidade: 0,
        quantidade_minima: 5,
        preco_custo: '',
        preco_venda: '',
        fornecedor: '',
        codigo_barras: '',
        localizacao: '',
        data_ultima_compra: '',
        data_validade: '',
        observacoes: ''
      });
    }
  }, [produto, modo, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome || !formData.categoria) {
      alert('Nome e categoria são obrigatórios');
      return;
    }

    // ✅ CORREÇÃO AQUI: parseInt separado corretamente
    const produtoData = {
      ...formData,
      preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo) : null,
      preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda) : null,
      quantidade: parseInt(formData.quantidade) || 0,  // 👈 LINHA CORRIGIDA
      quantidade_minima: parseInt(formData.quantidade_minima) || 5
    };

    console.log('📦 Dados do produto a salvar:', produtoData);
    onSave(produtoData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {modo === 'editar' ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade Atual
              </label>
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                className="input-field"
                min="0"
              />
            </div>

            {/* Quantidade Mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade Mínima
              </label>
              <input
                type="number"
                name="quantidade_minima"
                value={formData.quantidade_minima}
                onChange={handleChange}
                className="input-field"
                min="0"
              />
            </div>

            {/* Preço de Custo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Custo (R$)
              </label>
              <input
                type="number"
                name="preco_custo"
                value={formData.preco_custo}
                onChange={handleChange}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>

            {/* Preço de Venda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                name="preco_venda"
                value={formData.preco_venda}
                onChange={handleChange}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>

            {/* Fornecedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor
              </label>
              <input
                type="text"
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Código de Barras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras
              </label>
              <input
                type="text"
                name="codigo_barras"
                value={formData.codigo_barras}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              <input
                type="text"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: Prateleira A1"
              />
            </div>

            {/* Data da Última Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Última Compra
              </label>
              <input
                type="date"
                name="data_ultima_compra"
                value={formData.data_ultima_compra}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Data de Validade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Validade
              </label>
              <input
                type="date"
                name="data_validade"
                value={formData.data_validade}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                name="observacoes"
                rows="3"
                value={formData.observacoes}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {modo === 'editar' ? 'Salvar Alterações' : 'Adicionar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalProduto;