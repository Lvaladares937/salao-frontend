import api from './api';

const funcionariosService = {
  // Listar todos os funcionários ativos
  listar: async () => {
    try {
      console.log('📋 Buscando funcionários...');
      const response = await api.get('/funcionarios');
      console.log('✅ Funcionários carregados:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar funcionários:', error);
      throw error;
    }
  },

  // Listar todos (inclusive inativos)
  listarTodos: async () => {
    try {
      const response = await api.get('/funcionarios/todos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar todos funcionários:', error);
      throw error;
    }
  },

  // Buscar por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/funcionarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      throw error;
    }
  },

  // Criar novo funcionário
  criar: async (funcionario) => {
    try {
      console.log('➕ Criando funcionário:', funcionario);
      console.log('📦 Dados completos enviados:', JSON.stringify(funcionario, null, 2));
      console.log('💰 salarioBase:', funcionario.salarioBase, 'tipo:', typeof funcionario.salarioBase);
      
      const response = await api.post('/funcionarios', funcionario);
      console.log('✅ Funcionário criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar funcionário:');
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Dados do erro:', error.response?.data);
      console.error('❌ Mensagem do servidor:', error.response?.data?.error);
      throw error;
    }
  },

  // Atualizar funcionário
  atualizar: async (id, funcionario) => {
    try {
      console.log(`✏️ Atualizando funcionário ${id}:`, funcionario);
      const response = await api.put(`/funcionarios/${id}`, funcionario);
      console.log('✅ Funcionário atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar funcionário:', error);
      console.error('❌ Detalhes:', error.response?.data);
      throw error;
    }
  },

  // Desativar funcionário
  desativar: async (id) => {
    try {
      const response = await api.delete(`/funcionarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao desativar funcionário:', error);
      throw error;
    }
  },

  // Reativar funcionário
  reativar: async (id) => {
    try {
      const response = await api.put(`/funcionarios/${id}/reativar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao reativar funcionário:', error);
      throw error;
    }
  },

  // Salvar ponto
  salvarPonto: async (funcionarioId, mes, ano, dados) => {
    try {
      console.log(`💾 Salvando ponto do funcionário ${funcionarioId} para ${mes}/${ano}`);
      const response = await api.post(`/funcionarios/${funcionarioId}/ponto`, {
        mes,
        ano,
        dados
      });
      console.log('✅ Ponto salvo:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao salvar ponto:', error);
      console.error('❌ Detalhes:', error.response?.data);
      throw error;
    }
  },

  // Buscar ponto
  buscarPonto: async (funcionarioId, mes, ano) => {
    try {
      console.log(`📅 Buscando ponto do funcionário ${funcionarioId} para ${mes}/${ano}`);
      const response = await api.get(`/funcionarios/${funcionarioId}/ponto?mes=${mes}&ano=${ano}`);
      console.log('✅ Ponto carregado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar ponto:', error);
      throw error;
    }
  }
};

export default funcionariosService;