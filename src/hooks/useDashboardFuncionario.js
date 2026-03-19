import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import agendamentosService from '../services/agendamentosService';
import { format, addDays } from 'date-fns';

export const useDashboardFuncionario = () => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);
  const [resumoMes, setResumoMes] = useState({
    totalAgendamentos: 0,
    totalValor: 0,
    totalComissao: 0,
    mediaPorDia: 0
  });
  const [metas, setMetas] = useState({
    agendamentosAtual: 0,
    valorAtual: 0,
    percentualAgendamentos: 0,
    percentualValor: 0
  });

  const funcionarioId = usuario?.funcionarioId;
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  // Função para carregar todos os dados de uma vez
  const carregarDados = async () => {
    if (!funcionarioId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar todos os agendamentos do funcionário
      const todosAgendamentos = await agendamentosService.buscarPorFuncionarioPeriodo(
        funcionarioId,
        null,
        null
      );

      // Filtrar agendamentos de hoje
      const hojeStr = format(hoje, 'yyyy-MM-dd');
      const agendamentosHojeFiltrados = todosAgendamentos.filter(ag => {
        if (!ag.data_hora) return false;
        try {
          const dataAg = format(new Date(ag.data_hora), 'yyyy-MM-dd');
          return dataAg === hojeStr;
        } catch {
          return false;
        }
      });
      setAgendamentosHoje(agendamentosHojeFiltrados);

      // Filtrar próximos agendamentos (próximos 7 dias)
      const hojeStr2 = format(hoje, 'yyyy-MM-dd');
      const seteDias = addDays(hoje, 7);
      const seteDiasStr = format(seteDias, 'yyyy-MM-dd');
      
      const proximos = todosAgendamentos.filter(ag => {
        if (!ag.data_hora) return false;
        try {
          const dataAg = format(new Date(ag.data_hora), 'yyyy-MM-dd');
          return dataAg > hojeStr2 && dataAg <= seteDiasStr;
        } catch {
          return false;
        }
      }).sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
      
      setProximosAgendamentos(proximos.slice(0, 5));

      // Filtrar agendamentos do mês atual
      const agendamentosMes = todosAgendamentos.filter(ag => {
        if (!ag.data_hora) return false;
        try {
          const dataAg = new Date(ag.data_hora);
          return dataAg.getMonth() + 1 === mesAtual && dataAg.getFullYear() === anoAtual;
        } catch {
          return false;
        }
      });

      const agendamentosConcluidos = agendamentosMes.filter(ag => 
        ag.status === 'concluido' || ag.status === 'confirmado' || ag.status === 'agendado'
      );

      const totalValor = agendamentosConcluidos.reduce((acc, ag) => 
        acc + (parseFloat(ag.valor) || 0), 0
      );

      const totalComissao = agendamentosConcluidos.reduce((acc, ag) => 
        acc + (parseFloat(ag.valor_comissao) || 0), 0
      );

      // Calcular dias trabalhados
      const diasSet = new Set();
      agendamentosConcluidos.forEach(ag => {
        try {
          diasSet.add(format(new Date(ag.data_hora), 'yyyy-MM-dd'));
        } catch {}
      });
      const diasTrabalhados = diasSet.size;

      setResumoMes({
        totalAgendamentos: agendamentosConcluidos.length,
        totalValor,
        totalComissao,
        mediaPorDia: diasTrabalhados > 0 ? (totalValor / diasTrabalhados) : 0
      });

      // Calcular metas
      const percentualAgendamentos = (agendamentosConcluidos.length / 50) * 100;
      const percentualValor = (totalValor / 5000) * 100;

      setMetas({
        agendamentosAtual: agendamentosConcluidos.length,
        valorAtual: totalValor,
        percentualAgendamentos: isNaN(percentualAgendamentos) ? 0 : Math.min(percentualAgendamentos, 100),
        percentualValor: isNaN(percentualValor) ? 0 : Math.min(percentualValor, 100)
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados apenas quando o funcionarioId mudar
  useEffect(() => {
    carregarDados();
  }, [funcionarioId]); // ⚠️ APENAS funcionarioId

  return {
    loading,
    agendamentosHoje,
    proximosAgendamentos,
    resumoMes,
    metas,
    nomeFuncionario: usuario?.nome || 'Funcionário'
  };
};