import api from './api';

const agendamentosService = {
  // Listar todos os agendamentos
  listar: async () => {
    try {
      const response = await api.get('/agendamentos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      throw error;
    }
  },

  // Buscar agendamento por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/agendamentos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      throw error;
    }
  },

  // Buscar agendamentos por período
  buscarPorPeriodo: async (inicio, fim) => {
    try {
      const response = await api.get(`/agendamentos/periodo?inicio=${inicio}&fim=${fim}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos por período:', error);
      throw error;
    }
  },

  // Buscar agendamentos por data específica
  buscarPorData: async (data) => {
    try {
      const response = await api.get(`/agendamentos/data?data=${data}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos por data:', error);
      throw error;
    }
  },

  // Criar novo agendamento
  criar: async (agendamento) => {
    try {
      const response = await api.post('/agendamentos', agendamento);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  // Atualizar agendamento
  atualizar: async (id, agendamento) => {
    try {
      const response = await api.put(`/agendamentos/${id}`, agendamento);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  },

  // Excluir agendamento
  excluir: async (id) => {
    try {
      const response = await api.delete(`/agendamentos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      throw error;
    }
  },

  // Verificar disponibilidade de horário
  verificarDisponibilidade: async (funcionarioId, data, hora) => {
    try {
      const response = await api.get(`/agendamentos/disponibilidade?funcionario_id=${funcionarioId}&data=${data}&hora=${hora}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  },

  buscarPorFuncionarioPeriodo: async (funcionarioId, mes, ano) => {
    try {
      let url = `/agendamentos/funcionario/${funcionarioId}`;
      // Só adiciona os parâmetros se eles existirem
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes);
      if (ano) params.append('ano', ano);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log('🔍 URL:', url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos do funcionário:', error);
      throw error;
    }
  },
  
};

export default agendamentosService;
