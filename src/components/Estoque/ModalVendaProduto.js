import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Package } from 'lucide-react';

const ModalVendaProduto = ({ show, onClose, produto, onConfirmarVenda, clientes }) => {
  const [quantidade, setQuantidade] = useState(1);
  const [clienteId, setClienteId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [observacoes, setObservacoes] = useState('');
  const [bandeiraCartao, setBandeiraCartao] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [mostrarBandeira, setMostrarBandeira] = useState(false);

  // Função para converter preço para número com segurança
  const getPrecoVenda = () => {
    if (!produto) return 0;
    // Se for string, converte para número, senão usa o valor direto
    return typeof produto.preco_venda === 'string' 
      ? parseFloat(produto.preco_venda) 
      : produto.preco_venda || 0;
  };

  const precoVenda = getPrecoVenda();
  const valorTotal = precoVenda * quantidade;

  // Formas de pagamento
  const formasPagamento = [
    { id: 'dinheiro', nome: 'Dinheiro' },
    { id: 'pix', nome: 'PIX' },
    { id: 'debito', nome: 'Cartão de Débito' },
    { id: 'credito', nome: 'Cartão de Crédito' },
    { id: 'credito_parcelado', nome: 'Cartão de Crédito Parcelado' },
    { id: 'transferencia', nome: 'Transferência Bancária' },
    { id: 'fiado', nome: 'Fiado' }
  ];

  // Bandeiras de cartão
  const bandeirasCartao = [
    'Visa', 'Mastercard', 'American Express', 'Elo', 'Hipercard',
    'Diners Club', 'Discover', 'Aura', 'JCB', 'Sorocred'
  ];

  // Mostrar campo de bandeira quando forma de pagamento for cartão
  useEffect(() => {
    setMostrarBandeira(['debito', 'credito', 'credito_parcelado'].includes(formaPagamento));
    if (!['debito', 'credito', 'credito_parcelado'].includes(formaPagamento)) {
      setBandeiraCartao('');
    }
  }, [formaPagamento]);

  const handleQuantidadeChange = (e) => {
    const novaQtd = parseInt(e.target.value) || 1;
    if (novaQtd > 0 && novaQtd <= (produto?.quantidade || 0)) {
      setQuantidade(novaQtd);
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return valor.toFixed(2).replace('.', ',');
  };

  const handleConfirmar = () => {
    // Validar produto
    if (!produto) {
      alert('Produto não selecionado');
      return;
    }

    // Validar quantidade
    if (quantidade > produto.quantidade) {
      alert(`Quantidade indisponível. Estoque atual: ${produto.quantidade}`);
      return;
    }

    if (quantidade <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    // Validar bandeira do cartão se necessário
    if (mostrarBandeira && !bandeiraCartao) {
      alert('Selecione a bandeira do cartão');
      return;
    }

    // Calcular valor total (já temos a variável valorTotal)
    const vendaData = {
      produto_id: produto.id,
      produto_nome: produto.nome,
      quantidade: quantidade,
      valor_total: valorTotal,
      cliente_id: clienteId || null,
      forma_pagamento: formaPagamento,
      bandeira_cartao: mostrarBandeira ? bandeiraCartao : null,
      parcelas: formaPagamento === 'credito_parcelado' ? parcelas : 1,
      observacoes: observacoes || '',
      data_venda: new Date().toISOString().split('T')[0] // Data atual
    };

    console.log('📦 Dados da venda:', vendaData);
    onConfirmarVenda(vendaData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Vender Produto
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Informações do Produto */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-800">{produto?.nome}</p>
            <p className="text-sm text-blue-600">
              Preço: R$ {formatarMoeda(precoVenda)}
            </p>
            <p className="text-sm text-blue-600">
              Estoque disponível: {produto?.quantidade}
            </p>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              max={produto?.quantidade}
              value={quantidade}
              onChange={handleQuantidadeChange}
              className="input-field"
            />
          </div>

          {/* Cliente (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente (opcional)
            </label>
            <select
              className="input-field"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Cliente não identificado</option>
              {clientes?.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento *
            </label>
            <select
              className="input-field"
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              {formasPagamento.map(fp => (
                <option key={fp.id} value={fp.id}>{fp.nome}</option>
              ))}
            </select>
          </div>

          {/* Bandeira do Cartão (se aplicável) */}
          {mostrarBandeira && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                Bandeira do Cartão *
              </label>
              <select
                className="input-field"
                value={bandeiraCartao}
                onChange={(e) => setBandeiraCartao(e.target.value)}
              >
                <option value="">Selecione a bandeira...</option>
                {bandeirasCartao.map(bandeira => (
                  <option key={bandeira} value={bandeira}>{bandeira}</option>
                ))}
              </select>
            </div>
          )}

          {/* Parcelas (se crédito parcelado) */}
          {formaPagamento === 'credito_parcelado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Parcelas
              </label>
              <select
                className="input-field"
                value={parcelas}
                onChange={(e) => setParcelas(parseInt(e.target.value))}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                  <option key={num} value={num}>{num}x</option>
                ))}
              </select>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              rows="2"
              className="input-field"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre a venda..."
            />
          </div>

          {/* Resumo da Venda */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Valor unitário:</span>
              <span>R$ {formatarMoeda(precoVenda)}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantidade:</span>
              <span>{quantidade}x</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">
                R$ {formatarMoeda(valorTotal)}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={handleConfirmar} className="btn-primary flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Confirmar Venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalVendaProduto;