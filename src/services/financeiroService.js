import api from './api';

const financeiroService = {
  // Listar vendas
  listarVendas: async (mes, ano, funcionarioId = null) => {
    try {
      let url = `/financeiro/vendas?mes=${mes}&ano=${ano}`;
      if (funcionarioId) {
        url += `&funcionario_id=${funcionarioId}`;
      }
      console.log('🌐 Buscando vendas:', url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      throw error;
    }
  },

  // Listar despesas
  listarDespesas: async (mes, ano) => {
    try {
      const url = `/financeiro/despesas?mes=${mes}&ano=${ano}`;
      console.log('🌐 Buscando despesas:', url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      throw error;
    }
  },

  // Adicionar despesa
  adicionarDespesa: async (despesa) => {
    try {
      const response = await api.post('/financeiro/despesas', despesa);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      throw error;
    }
  },

  // Remover despesa
  removerDespesa: async (id) => {
    try {
      const response = await api.delete(`/financeiro/despesas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover despesa:', error);
      throw error;
    }
  },

  // Resumo financeiro
  resumo: async (mes, ano) => {
    try {
      const response = await api.get(`/financeiro/resumo?mes=${mes}&ano=${ano}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error);
      throw error;
    }
  }
};

export default financeiroService;