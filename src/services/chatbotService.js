import api from './api';

const chatbotService = {
  // Verificar status do bot
  verificarStatus: async () => {
    try {
      const response = await api.get('/bot/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do bot:', error);
      // Retorna status offline como fallback
      return { online: false, motivo: 'Erro de conexão' };
    }
  },

  // Iniciar bot
  iniciar: async () => {
    try {
      const response = await api.post('/bot/iniciar');
      return response.data;
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      throw error;
    }
  },

  // Parar bot
  parar: async () => {
    try {
      const response = await api.post('/bot/parar');
      return response.data;
    } catch (error) {
      console.error('Erro ao parar bot:', error);
      throw error;
    }
  },

  // Listar conversas recentes
  listarConversas: async () => {
    try {
      const response = await api.get('/bot/conversas');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar conversas:', error);
      return [];
    }
  },

  // Configurar bot
  configurar: async (config) => {
    try {
      const response = await api.post('/bot/configurar', config);
      return response.data;
    } catch (error) {
      console.error('Erro ao configurar bot:', error);
      throw error;
    }
  },

  // Enviar mensagem de teste
  enviarMensagemTeste: async (numero, mensagem) => {
    try {
      const response = await api.post('/bot/testar', { numero, mensagem });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem de teste:', error);
      throw error;
    }
  },

  // Buscar configurações atuais
  buscarConfiguracoes: async () => {
    try {
      const response = await api.get('/bot/configuracoes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  },

  // Buscar QR Code (se necessário)
  buscarQRCode: async () => {
    try {
      const response = await api.get('/bot/qrcode');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);
      return null;
    }
  }
};

export default chatbotService;