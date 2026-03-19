import api from './api';

const pagamentosService = {
    // Listar pagamentos de funcionários
    listarPagamentosFuncionarios: async (mes, ano) => {
        try {
            const response = await api.get('/pagamentos/funcionarios', {
                params: { mes, ano }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao listar pagamentos:', error);
            throw error;
        }
    },

    // Registrar pagamento de funcionário
    registrarPagamentoFuncionario: async (pagamento) => {
        try {
            const response = await api.post('/pagamentos/funcionarios', pagamento);
            return response.data;
        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            throw error;
        }
    },

    // Remover pagamento
    removerPagamento: async (id) => {
        try {
            const response = await api.delete(`/pagamentos/funcionarios/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao remover pagamento:', error);
            throw error;
        }
    }
};

export default pagamentosService;