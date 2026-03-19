import api from './api';

const servicosService = {
  // Listar todos os serviços
  listar: async () => {
    try {
      const response = await api.get('/servicos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      throw error;
    }
  },

  // Buscar serviço por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/servicos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      throw error;
    }
  }
};

export default servicosService;