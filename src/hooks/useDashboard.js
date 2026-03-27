import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import agendamentosService from '../services/agendamentosService';
import financeiroService from '../services/financeiroService';
import estoqueService from '../services/estoqueService';

export const useDashboard = () => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    vendasHoje: 0,
    clientesHoje: 0,
    servicosHoje: 0,
    produtosBaixoEstoque: 0,
    agendamentosHoje: 0,
    ticketMedio: 0
  });
  
  const [vendasSemana, setVendasSemana] = useState([]);
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [horariosPico, setHorariosPico] = useState([]);
  const [clientesPorDia, setClientesPorDia] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [agendamentosRecentes, setAgendamentosRecentes] = useState([]);
  const [alertas, setAlertas] = useState([]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando carregamento do dashboard...');
      
      const hoje = new Date();
      const dataInicio = new Date(hoje);
      dataInicio.setHours(0, 0, 0, 0);
      const dataFim = new Date(hoje);
      dataFim.setHours(23, 59, 59, 999);
      
      // Calcular semana
      const diaSemana = hoje.getDay();
      const diffParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
      
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - diffParaSegunda);
      inicioSemana.setHours(0, 0, 0, 0);
      
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      fimSemana.setHours(23, 59, 59, 999);
      
      console.log('📅 Períodos calculados');

      // ========== 1. BUSCAR AGENDAMENTOS DO DIA ==========
      let agendamentosHoje = [];
      try {
        agendamentosHoje = await agendamentosService.buscarPorPeriodo(
          dataInicio.toISOString(),
          dataFim.toISOString()
        ) || [];
        console.log(`✅ Agendamentos hoje: ${agendamentosHoje.length}`);
      } catch (error) {
        console.error('❌ Erro ao buscar agendamentos hoje:', error);
      }

      // ========== 2. BUSCAR AGENDAMENTOS DA SEMANA ==========
      let agendamentosSemana = [];
      try {
        agendamentosSemana = await agendamentosService.buscarPorPeriodo(
          inicioSemana.toISOString(),
          fimSemana.toISOString()
        ) || [];
        console.log(`✅ Agendamentos semana: ${agendamentosSemana.length}`);
      } catch (error) {
        console.error('❌ Erro ao buscar agendamentos semana:', error);
      }

      // ========== 3. BUSCAR VENDAS DO FINANCEIRO (JÁ INCLUI TUDO) ==========
      let vendas = [];
      try {
        vendas = await financeiroService.listarVendas(
          hoje.getMonth() + 1,
          hoje.getFullYear()
        ) || [];
        console.log(`💰 Vendas do financeiro: ${vendas.length}`);
        
        if (vendas.length > 0) {
          console.log('💰 Primeira venda:', vendas[0]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar vendas:', error);
      }

      // ========== 4. BUSCAR ESTOQUE BAIXO ==========
      let estoque = [];
      try {
        estoque = await estoqueService.listarEstoqueBaixo() || [];
        console.log(`📦 Estoque baixo: ${estoque.length}`);
      } catch (error) {
        console.error('❌ Erro ao buscar estoque:', error);
      }

      // Garantir que são arrays
      agendamentosHoje = Array.isArray(agendamentosHoje) ? agendamentosHoje : [];
      agendamentosSemana = Array.isArray(agendamentosSemana) ? agendamentosSemana : [];
      vendas = Array.isArray(vendas) ? vendas : [];
      estoque = Array.isArray(estoque) ? estoque : [];

      console.log('📊 RESUMO:');
      console.log(`   Agendamentos hoje: ${agendamentosHoje.length}`);
      console.log(`   Agendamentos semana: ${agendamentosSemana.length}`);
      console.log(`   Vendas: ${vendas.length}`);
      console.log(`   Estoque baixo: ${estoque.length}`);

      // Calcular vendas de HOJE
      const vendasHoje = vendas.filter(v => {
        const dataVenda = v.data_venda;
        return dataVenda && new Date(dataVenda).toDateString() === hoje.toDateString();
      });
      
      const totalVendasHoje = vendasHoje.reduce((acc, v) => acc + (parseFloat(v.valor_total) || 0), 0);
      
      // Calcular clientes únicos hoje
      const clientesHoje = new Set(
        agendamentosHoje.map(a => a?.cliente_id).filter(Boolean)
      ).size;
      
      const servicosHoje = agendamentosHoje.length;
      const ticketMedio = servicosHoje > 0 ? totalVendasHoje / servicosHoje : 0;
      
      setDados({
        vendasHoje: totalVendasHoje,
        clientesHoje,
        servicosHoje,
        produtosBaixoEstoque: estoque.length,
        agendamentosHoje: servicosHoje,
        ticketMedio
      });

      // Calcular vendas por dia da semana
      const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      const vendasPorDia = diasSemana.map((dia, index) => {
        const data = new Date(inicioSemana);
        data.setDate(inicioSemana.getDate() + index);
        
        const vendasDia = vendas
          .filter(v => v && v.data_venda && new Date(v.data_venda).toDateString() === data.toDateString())
          .reduce((acc, v) => acc + (parseFloat(v.valor_total) || 0), 0);
        
        const clientesDia = new Set(
          agendamentosSemana
            .filter(a => a && a.data_hora && new Date(a.data_hora).toDateString() === data.toDateString())
            .map(a => a.cliente_id)
            .filter(Boolean)
        ).size;
        
        return { dia, vendas: vendasDia, clientes: clientesDia };
      });
      
      setVendasSemana(vendasPorDia);
      setClientesPorDia(vendasPorDia);

      // Serviços mais vendidos (baseado nos agendamentos da semana)
      const servicosCount = {};
      agendamentosSemana.forEach(ag => {
        if (ag?.servico_nome) {
          servicosCount[ag.servico_nome] = (servicosCount[ag.servico_nome] || 0) + 1;
        }
      });
      
      setServicosMaisVendidos(
        Object.entries(servicosCount)
          .map(([name, quantidade]) => ({ name, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5)
      );

      // Horários de pico
      const horariosCount = {};
      agendamentosHoje.forEach(ag => {
        if (ag?.data_hora) {
          const hora = new Date(ag.data_hora).getHours();
          const horaStr = `${hora.toString().padStart(2, '0')}:00`;
          horariosCount[horaStr] = (horariosCount[horaStr] || 0) + 1;
        }
      });
      
      setHorariosPico(
        Object.entries(horariosCount)
          .map(([hora, qtd]) => ({ hora, agendamentos: qtd }))
          .sort((a, b) => a.hora.localeCompare(b.hora))
      );

      // Estoque crítico
      setEstoqueCritico(
        estoque.slice(0, 5).map(p => ({
          nome: p.nome || 'Produto',
          quantidade: p.quantidade || 0,
          minimo: p.quantidade_minima || 0
        }))
      );

      // Agendamentos recentes
      setAgendamentosRecentes(
        agendamentosHoje
          .filter(ag => ag)
          .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
          .slice(0, 5)
          .map(ag => ({
            cliente: ag.cliente_nome || 'Cliente',
            servico: ag.servico_nome || 'Serviço',
            horario: ag.data_hora ? new Date(ag.data_hora).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '--:--',
            status: ag.status === 'confirmado' ? 'Confirmado' : 
                    ag.status === 'concluido' ? 'Concluído' : 
                    ag.status === 'cancelado' ? 'Cancelado' : 'Agendado'
          }))
      );

      // Alertas
      const alertasList = [];
      
      if (estoque.length > 0) {
        alertasList.push({
          tipo: 'estoque',
          mensagem: `${estoque.length} produtos com estoque baixo`,
          detalhe: 'Precisam de reposição urgente'
        });
      }
      
      const cancelamentosHoje = agendamentosHoje.filter(a => a?.status === 'cancelado').length;
      if (cancelamentosHoje > 2) {
        alertasList.push({
          tipo: 'cancelamento',
          mensagem: `${cancelamentosHoje} cancelamentos hoje`,
          detalhe: 'Taxa acima do normal'
        });
      }
      
      const totalVendasSemana = vendasPorDia.reduce((acc, d) => acc + d.vendas, 0);
      if (totalVendasSemana > 5000) {
        const percentual = ((totalVendasSemana - 5000) / 5000 * 100).toFixed(0);
        alertasList.push({
          tipo: 'meta',
          mensagem: 'Meta da semana atingida',
          detalhe: `Faturamento ${percentual}% acima`
        });
      }
      
      setAlertas(alertasList);
      
    } catch (error) {
      console.error('❌ Erro no dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    
    const handleAtualizarDashboard = () => {
      console.log('🔄 Atualizando dashboard...');
      carregarDados();
    };
    
    window.addEventListener('atualizarDashboard', handleAtualizarDashboard);
    
    const interval = setInterval(carregarDados, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('atualizarDashboard', handleAtualizarDashboard);
    };
  }, [carregarDados]);

  return {
    loading,
    dados,
    vendasSemana,
    servicosMaisVendidos,
    horariosPico,
    clientesPorDia,
    estoqueCritico,
    agendamentosRecentes,
    alertas,
    carregarDados
  };
};
