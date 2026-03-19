import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Plus, Edit2, Trash2, Filter, 
  Download, AlertTriangle, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, DollarSign
} from 'lucide-react';
import { useEstoque } from './useEstoque';
import ModalProduto from './ModalProduto';
import ModalVendaProduto from './ModalVendaProduto';
import api from '../../services/api';

const Estoque = () => {
  const {
    produtosPaginados,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    categoriaFiltro,
    setCategoriaFiltro,
    categorias,
    resumo,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    registrarMovimentacao,
    carregarProdutos
  } = useEstoque();

  const [showModalProduto, setShowModalProduto] = useState(false);
  const [showModalVenda, setShowModalVenda] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [produtoParaVender, setProdutoParaVender] = useState(null);
  const [modalModo, setModalModo] = useState('novo');
  const [clientes, setClientes] = useState([]);
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

  // Carregar clientes para a venda
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const response = await api.get('/clientes');
        setClientes(response.data);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    };
    carregarClientes();
  }, []);

  const handleNovoProduto = () => {
    setProdutoSelecionado(null);
    setModalModo('novo');
    setShowModalProduto(true);
  };

  const handleEditarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setModalModo('editar');
    setShowModalProduto(true);
  };

  const handleSalvarProduto = async (produtoData) => {
    try {
      if (modalModo === 'editar' && produtoSelecionado) {
        await atualizarProduto(produtoSelecionado.id, produtoData);
        alert('Produto atualizado com sucesso!');
      } else {
        await adicionarProduto(produtoData);
        alert('Produto adicionado com sucesso!');
      }
      setShowModalProduto(false);
    } catch (error) {
      alert('Erro ao salvar produto: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleExcluirProduto = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      try {
        await excluirProduto(id);
        alert('Produto excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir produto: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleVenderProduto = (produto) => {
    if (produto.quantidade <= 0) {
      alert('Produto sem estoque disponível');
      return;
    }
    setProdutoParaVender(produto);
    setShowModalVenda(true);
  };

  const handleConfirmarVenda = async (vendaData) => {
    try {
      const result = await api.post('/estoque/vender', vendaData);
      alert('Venda registrada com sucesso!');
      setShowModalVenda(false);
      await carregarProdutos(); // Recarregar estoque
      
      // Disparar evento de venda de produto
      window.dispatchEvent(new CustomEvent('vendaRealizada', { 
        detail: { tipo: 'produto', dados: vendaData }
      }));
      
      // Atualizar dashboard
      window.dispatchEvent(new CustomEvent('atualizarDashboard'));
      
    } catch (error) {
      alert('Erro ao registrar venda: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleMovimentar = (produto) => {
    // Implementar movimentação manual (entrada/saída)
    alert('Funcionalidade em desenvolvimento');
  };

  const getStatusEstoque = (qtd, minimo) => {
    if (qtd <= 2) return { cor: 'bg-red-100 text-red-800 border-red-200', texto: 'Crítico' };
    if (qtd <= minimo) return { cor: 'bg-yellow-100 text-yellow-800 border-yellow-200', texto: 'Baixo' };
    return { cor: 'bg-green-100 text-green-800 border-green-200', texto: 'Normal' };
  };

  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading && produtosPaginados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando estoque...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie seus produtos e movimentações</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={carregarProdutos}
            className="btn-secondary flex items-center gap-2"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNovoProduto}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Produtos</p>
              <p className="text-3xl font-bold">{resumo.totalProdutos}</p>
            </div>
            <Package className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Estoque Baixo</p>
              <p className="text-3xl font-bold">{resumo.estoqueBaixo}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Valor em Estoque</p>
              <p className="text-3xl font-bold">{formatarMoeda(resumo.valorTotal)}</p>
            </div>
            <Package className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Fornecedores</p>
              <p className="text-3xl font-bold">{resumo.fornecedores}</p>
            </div>
            <Package className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Filter className="w-5 h-5 text-gray-500" />
            <select 
              value={categoriaFiltro}
              onChange={(e) => {
                setCategoriaFiltro(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field w-48"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'todos' ? 'Todas Categorias' : cat}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, fornecedor ou código..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10"
              />
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Estoque */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-center border-b border-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Produto</th>
                <th className="table-header">Categoria</th>
                <th className="table-header">Quantidade</th>
                <th className="table-header">Mínimo</th>
                <th className="table-header">Preço Custo</th>
                <th className="table-header">Preço Venda</th>
                <th className="table-header">Fornecedor</th>
                <th className="table-header">Status</th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {produtosPaginados.length > 0 ? (
                produtosPaginados.map((produto) => {
                  const status = getStatusEstoque(produto.quantidade, produto.quantidade_minima);
                  return (
                    <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium">{produto.nome}</td>
                      <td className="table-cell">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {produto.categoria}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`font-semibold ${
                          produto.quantidade <= produto.quantidade_minima ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {produto.quantidade}
                        </span>
                      </td>
                      <td className="table-cell text-gray-600">{produto.quantidade_minima}</td>
                      <td className="table-cell">{formatarMoeda(produto.preco_custo)}</td>
                      <td className="table-cell font-medium text-green-600">{formatarMoeda(produto.preco_venda)}</td>
                      <td className="table-cell text-gray-600">{produto.fornecedor || '-'}</td>
                      <td className="table-cell">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.cor}`}>
                          {status.texto}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          {/* Botão de Venda */}
                          <button
                            onClick={() => handleVenderProduto(produto)}
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                            title="Vender produto"
                            disabled={produto.quantidade <= 0}
                          >
                            <DollarSign className={`w-4 h-4 ${produto.quantidade > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                          </button>
                          
                          {/* Botão de Movimentação */}
                          <button
                            onClick={() => handleMovimentar(produto)}
                            className="p-1 hover:bg-orange-100 rounded transition-colors"
                            title="Registrar movimentação"
                          >
                            {produto.quantidade > 0 ? (
                              <TrendingDown className="w-4 h-4 text-orange-600" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-orange-600" />
                            )}
                          </button>
                          
                          {/* Botão de Editar */}
                          <button
                            onClick={() => handleEditarProduto(produto)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          
                          {/* Botão de Excluir */}
                          <button
                            onClick={() => handleExcluirProduto(produto.id, produto.nome)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg">Nenhum produto encontrado</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchTerm ? 'Tente buscar com outros termos' : 'Clique em "Novo Produto" para adicionar'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, produtosPaginados.length)} de {produtosPaginados.length} produtos
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalProduto
        show={showModalProduto}
        onClose={() => setShowModalProduto(false)}
        produto={produtoSelecionado}
        onSave={handleSalvarProduto}
        modo={modalModo}
      />

      <ModalVendaProduto
        show={showModalVenda}
        onClose={() => setShowModalVenda(false)}
        produto={produtoParaVender}
        onConfirmarVenda={handleConfirmarVenda}
        clientes={clientes}
      />
    </div>
  );
};

export default Estoque;