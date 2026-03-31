import api from './api';

const usuariosService = {
    // Listar todos os usuários
    listar: async () => {
        try {
            const response = await api.get('/usuarios');
            return response.data;
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            return [];
        }
    },

    // Buscar usuário por ID
    buscarPorId: async (id) => {
        try {
            const response = await api.get(`/usuarios/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return null;
        }
    },

    // Criar novo usuário
    criar: async (dados) => {
        try {
            const response = await api.post('/usuarios', dados);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    },

    // Atualizar usuário
    atualizar: async (id, dados) => {
        try {
            const response = await api.put(`/usuarios/${id}`, dados);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    },

    // Desativar usuário
    desativar: async (id) => {
        try {
            const response = await api.put(`/usuarios/${id}/desativar`);
            return response.data;
        } catch (error) {
            console.error('Erro ao desativar usuário:', error);
            throw error;
        }
    },

    // Ativar usuário
    ativar: async (id) => {
        try {
            const response = await api.put(`/usuarios/${id}/ativar`);
            return response.data;
        } catch (error) {
            console.error('Erro ao ativar usuário:', error);
            throw error;
        }
    },

    // Alterar senha
    alterarSenha: async (id, senhaAtual, novaSenha) => {
        try {
            const response = await api.put(`/usuarios/${id}/senha`, {
                senha_atual: senhaAtual,
                nova_senha: novaSenha
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            throw error;
        }
    }
};

export default usuariosService;
