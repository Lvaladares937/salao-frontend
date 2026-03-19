import api from './api';

const horariosService = {
    // Buscar configurações de horários
    buscarConfiguracoes: async () => {
        try {
            const response = await api.get('/configuracoes/horarios');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar configurações de horários:', error);
            // Valores padrão
            return {
                horarioInicio: '09:00',
                horarioFim: '19:00',
                intervaloMinutos: 30,
                diasSemana: [1, 2, 3, 4, 5, 6],
                horariosPersonalizados: [],
                slotsPorProfissional: true,
                tempoMedioServico: 30,
                antecedenciaMinima: 60,
                janelaAgendamento: 30
            };
        }
    },

    // Salvar configurações de horários
    salvarConfiguracoes: async (config) => {
        try {
            const response = await api.post('/configuracoes/horarios', config);
            return response.data;
        } catch (error) {
            console.error('Erro ao salvar configurações de horários:', error);
            throw error;
        }
    },

    // Gerar horários baseado nas configurações
    gerarHorarios: (config) => {
        const horarios = [];
        const [horaInicio, minInicio] = config.horarioInicio.split(':').map(Number);
        const [horaFim, minFim] = config.horarioFim.split(':').map(Number);
        
        const totalMinutosInicio = horaInicio * 60 + minInicio;
        const totalMinutosFim = horaFim * 60 + minFim;
        
        for (let minutos = totalMinutosInicio; minutos <= totalMinutosFim; minutos += config.intervaloMinutos) {
            const hora = Math.floor(minutos / 60);
            const minuto = minutos % 60;
            horarios.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
        }
        
        return horarios;
    },

    // Verificar se o dia está disponível
    isDiaDisponivel: (data, config) => {
        const diaSemana = new Date(data).getDay();
        return config.diasSemana.includes(diaSemana);
    }
};

export default horariosService;