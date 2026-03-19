import api from './api';

const estoqueService = {
  // Listar todos os produtos
  listar: async () => {
    try {
      const response = await api.get('/estoque');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  },

  // Buscar produto por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/estoque/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  // Criar novo produto
  criar: async (produto) => {
    try {
      console.log('📤 Enviando produto para o backend:', produto);
      const response = await api.post('/estoque', produto);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      console.error('Resposta do servidor:', error.response?.data);
      throw error;
    }
  },

  // Atualizar produto
  atualizar: async (id, produto) => {
    try {
      const response = await api.put(`/estoque/${id}`, produto);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Excluir produto (soft delete)
  excluir: async (id) => {
    try {
      const response = await api.delete(`/estoque/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  },

  // Registrar movimentação
  movimentar: async (movimentacao) => {
    try {
      const response = await api.post('/estoque/movimentacao', movimentacao);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      throw error;
    }
  },

  // Buscar movimentações de um produto
  listarMovimentacoes: async (produtoId) => {
    try {
      const response = await api.get(`/estoque/${produtoId}/movimentacoes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      throw error;
    }
  },

  // Buscar produtos com estoque baixo
  listarEstoqueBaixo: async () => {
    try {
      const response = await api.get('/estoque/baixo');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar estoque baixo:', error);
      throw error;
    }
  },

  // Resumo do estoque (para o financeiro)
  resumo: async () => {
    try {
      const response = await api.get('/estoque/resumo');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter resumo do estoque:', error);
      throw error;
    }
  },

  // VENDER PRODUTO (nova funcionalidade)
  vender: async (venda) => {
    try {
      console.log('💰 Registrando venda de produto:', venda);
      const response = await api.post('/estoque/vender', venda);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao registrar venda:', error);
      console.error('Resposta do servidor:', error.response?.data);
      throw error;
    }
  }
};

export default estoqueService;