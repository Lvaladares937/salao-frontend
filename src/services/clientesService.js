import api from './api';

const clientesService = {
  // Listar todos os clientes
  listar: async () => {
    try {
      const response = await api.get('/clientes');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  },

  // Buscar cliente por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  },

  // Criar novo cliente
  criar: async (cliente) => {
    try {
      const response = await api.post('/clientes', cliente);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  // Atualizar cliente
  atualizar: async (id, cliente) => {
    try {
      const response = await api.put(`/clientes/${id}`, cliente);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  // Excluir cliente
  excluir: async (id) => {
    try {
      const response = await api.delete(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      throw error;
    }
  }
};

export default clientesService;