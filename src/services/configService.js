import api from './api';

const configService = {
  // Listar todos os serviços
  listarServicos: async () => {
    try {
      const response = await api.get('/servicos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      throw error;
    }
  },

  // Criar novo serviço
  criarServico: async (servico) => {
    try {
      const response = await api.post('/servicos', servico);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  },

  // Atualizar comissão de um serviço
  atualizarComissao: async (servicoId, comissao) => {
    try {
      const response = await api.put(`/servicos/${servicoId}/comissao`, { comissao });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error);
      throw error;
    }
  },

  // Atualizar comissão por categoria
  atualizarComissaoPorCategoria: async (categoria, comissao) => {
    try {
      const response = await api.put('/servicos/categoria/comissao', { categoria, comissao });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar comissões por categoria:', error);
      throw error;
    }
  },

  // Remover serviço
  removerServico: async (servicoId) => {
    try {
      const response = await api.delete(`/servicos/${servicoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      throw error;
    }
  }
};

export default configService;