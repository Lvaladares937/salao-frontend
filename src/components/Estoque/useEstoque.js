import { useState, useEffect, useCallback } from 'react';
import estoqueService from '../../services/estoqueService';

export const useEstoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [categorias, setCategorias] = useState([]);
  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    estoqueBaixo: 0,
    valorTotal: 0,
    fornecedores: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Carregar produtos do banco
  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Carregando produtos do banco...');
      
      const data = await estoqueService.listar();
      console.log('📦 Produtos carregados:', data);
      
      // Garantir que data é um array
      const produtosArray = Array.isArray(data) ? data : [];
      setProdutos(produtosArray);
      
      // Extrair categorias únicas
      const cats = [...new Set(produtosArray.map(p => p.categoria).filter(Boolean))];
      setCategorias(['todos', ...cats]);
      
      // Calcular resumo com valores numéricos
      const total = produtosArray.length;
      const baixo = produtosArray.filter(p => {
        const qtd = parseInt(p.quantidade) || 0;
        const min = parseInt(p.quantidade_minima) || 5;
        return qtd <= min;
      }).length;
      
      const valor = produtosArray.reduce((acc, p) => {
        const preco = parseFloat(p.preco_venda) || 0;
        const qtd = parseInt(p.quantidade) || 0;
        return acc + (preco * qtd);
      }, 0);
      
      const fornecedores = new Set(produtosArray.map(p => p.fornecedor).filter(Boolean)).size;
      
      setResumo({
        totalProdutos: total,
        estoqueBaixo: baixo,
        valorTotal: valor,
        fornecedores
      });
      
    } catch (err) {
      console.error('❌ Erro detalhado:', err);
      console.error('❌ Resposta do servidor:', err.response?.data);
      setError(err.response?.data?.error || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    // Garantir que produto existe
    if (!produto) return false;
    
    const nome = produto.nome || '';
    const fornecedor = produto.fornecedor || '';
    const codigo = produto.codigo_barras || '';
    const termo = searchTerm.toLowerCase();
    
    const matchesSearch = 
      nome.toLowerCase().includes(termo) ||
      fornecedor.toLowerCase().includes(termo) ||
      codigo.includes(termo);
    
    const matchesCategoria = categoriaFiltro === 'todos' || produto.categoria === categoriaFiltro;
    
    return matchesSearch && matchesCategoria;
  });

  // Paginação
  const totalPages = Math.ceil(produtosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const produtosPaginados = produtosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  // Resetar página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaFiltro]);

  // Adicionar produto
  const adicionarProduto = async (produto) => {
    try {
      setLoading(true);
      console.log('➕ Adicionando produto:', produto);
      
      // Validar campos obrigatórios
      if (!produto.nome || !produto.categoria) {
        throw new Error('Nome e categoria são obrigatórios');
      }
      
      const result = await estoqueService.criar(produto);
      console.log('✅ Produto adicionado:', result);
      
      await carregarProdutos();
      return result;
    } catch (err) {
      console.error('❌ Erro ao adicionar produto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produto
  const atualizarProduto = async (id, produto) => {
    try {
      setLoading(true);
      console.log('✏️ Atualizando produto:', id, produto);
      
      if (!produto.nome || !produto.categoria) {
        throw new Error('Nome e categoria são obrigatórios');
      }
      
      const result = await estoqueService.atualizar(id, produto);
      console.log('✅ Produto atualizado:', result);
      
      await carregarProdutos();
      return result;
    } catch (err) {
      console.error('❌ Erro ao atualizar produto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Excluir produto (soft delete)
  const excluirProduto = async (id) => {
    try {
      setLoading(true);
      console.log('🗑️ Excluindo produto:', id);
      
      const result = await estoqueService.excluir(id);
      console.log('✅ Produto excluído:', result);
      
      await carregarProdutos();
      
      // Ajustar página se necessário
      if (produtosPaginados.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      return result;
    } catch (err) {
      console.error('❌ Erro ao excluir produto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registrar movimentação
  const registrarMovimentacao = async (movimentacao) => {
    try {
      setLoading(true);
      console.log('📦 Registrando movimentação:', movimentacao);
      
      if (!movimentacao.produto_id || !movimentacao.tipo || !movimentacao.quantidade) {
        throw new Error('Produto, tipo e quantidade são obrigatórios');
      }
      
      const result = await estoqueService.movimentar(movimentacao);
      console.log('✅ Movimentação registrada:', result);
      
      await carregarProdutos(); // Recarregar para atualizar quantidades
      return result;
    } catch (err) {
      console.error('❌ Erro ao registrar movimentação:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos com estoque baixo
  const buscarEstoqueBaixo = async () => {
    try {
      const data = await estoqueService.listarEstoqueBaixo();
      return data;
    } catch (err) {
      console.error('❌ Erro ao buscar estoque baixo:', err);
      throw err;
    }
  };

  return {
    // Estados
    produtos,
    produtosFiltrados,
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
    
    // Funções
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    registrarMovimentacao,
    carregarProdutos,
    buscarEstoqueBaixo
  };
};