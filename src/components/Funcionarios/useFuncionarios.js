import { useState, useEffect } from 'react';
import funcionariosService from '../../services/funcionariosService';
import { gerarDiasDoMes, migrarPontoParaNovoFormato } from './helpers';
import { statusPonto } from './constants';
import api from '../../services/api';

export const useFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pontoData, setPontoData] = useState({});
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [adiantamentos, setAdiantamentos] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalModo, setModalModo] = useState('novo');

  // Carregar funcionários
  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      const data = await funcionariosService.listar();
      setFuncionarios(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar funcionários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar ponto do funcionário
  const carregarPonto = async (funcionarioId, mes, ano) => {
    if (!funcionarioId) return;
    
    try {
      setLoading(true);
      console.log(`📅 Carregando ponto do funcionário ${funcionarioId} para ${mes}/${ano}`);
      const response = await funcionariosService.buscarPonto(funcionarioId, mes, ano);
      
      if (response && response.dados) {
        let dadosPonto = response.dados;
        if (typeof dadosPonto === 'string') {
          try {
            dadosPonto = JSON.parse(dadosPonto);
          } catch (e) {
            console.error('Erro ao parsear dados do ponto:', e);
          }
        }
        
        console.log('📦 Dados do ponto (brutos):', dadosPonto);
        const dadosMigrados = migrarPontoParaNovoFormato(dadosPonto);
        console.log('🔄 Dados migrados:', dadosMigrados);
        setPontoData(dadosMigrados);
      } else {
        console.log('⚠️ Nenhum ponto encontrado, gerando inicial');
        const pontoInicial = gerarPontoInicial(ano, mes);
        setPontoData(pontoInicial);
      }
    } catch (err) {
      console.error('Erro ao carregar ponto:', err);
      const pontoInicial = gerarPontoInicial(ano, mes);
      setPontoData(pontoInicial);
    } finally {
      setLoading(false);
    }
  };

  // Gerar ponto inicial
  const gerarPontoInicial = (ano, mes) => {
    const pontoInicial = {};
    const dias = gerarDiasDoMes(ano, mes);
    dias.forEach(dia => {
      const dataStr = dia.toISOString().split('T')[0];
      if (dia.getDay() === 0) {
        pontoInicial[dataStr] = { status: statusPonto.FOLGA, desconto: 0 };
      } else {
        pontoInicial[dataStr] = { status: statusPonto.TRABALHADO, desconto: 0 };
      }
    });
    return pontoInicial;
  };

  // Salvar ponto
  const salvarPonto = async (funcionarioId, mes, ano, dados) => {
    if (!funcionarioId) return;
    
    try {
      setLoading(true);
      await funcionariosService.salvarPonto(funcionarioId, mes, ano, dados);
      setPontoData(dados);
      alert('Ponto salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar ponto:', err);
      alert('Erro ao salvar ponto: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Marcar dia no ponto
  const marcarDia = (dataStr, info) => {
    console.log('📝 Marcando dia:', dataStr, info);
    setPontoData(prev => {
      const novoPonto = {
        ...prev,
        [dataStr]: info
      };
      return novoPonto;
    });
  };

  // Calcular resumo do ponto
  const calcularResumo = (salarioBase) => {
    if (!salarioBase) return { 
      diasTrabalhados: 0, 
      totalDescontos: 0, 
      salarioFinal: 0,
      valorDia: 0 
    };
    
    const salarioBaseNum = Number(salarioBase) || 0;
    const dias = gerarDiasDoMes(anoSelecionado, mesSelecionado);
    const diasNoMes = dias.length;
    const valorDia = salarioBaseNum / diasNoMes;
    
    let diasTrabalhados = 0;
    let totalDescontos = 0;
    
    Object.entries(pontoData || {}).forEach(([dataStr, info]) => {
      const data = new Date(dataStr);
      if (data.getMonth() === mesSelecionado && data.getFullYear() === anoSelecionado) {
        if (info?.status === statusPonto.TRABALHADO) {
          diasTrabalhados++;
        } else if (info?.status === statusPonto.FALTA && info?.desconto) {
          totalDescontos += valorDia * info.desconto;
        }
      }
    });
    
    const salarioFinal = salarioBaseNum - totalDescontos;
    
    console.log('📊 Resumo calculado:', { diasTrabalhados, totalDescontos, salarioFinal, valorDia });
    
    return { diasTrabalhados, totalDescontos, salarioFinal, valorDia };
  };

  // Carregar pagamentos do funcionário
  const carregarPagamentos = async (funcionarioId, ano) => {
    if (!funcionarioId) return;
    
    try {
      console.log(`📋 Carregando pagamentos do funcionário ${funcionarioId} para ano ${ano}`);
      const response = await api.get(`/funcionarios/${funcionarioId}/pagamentos`, {
        params: { ano }
      });
      console.log('✅ Pagamentos carregados:', response.data);
      setPagamentos(response.data);
    } catch (err) {
      console.error('❌ Erro ao carregar pagamentos:', err);
      console.error('❌ Detalhes:', err.response?.data);
      setPagamentos([]);
    }
  };

  // Verificar se pagamento já foi realizado
  const verificarPagamentoRealizado = (mes, ano) => {
    if (!funcionarioSelecionado) return false;
    return pagamentos.some(p => 
      p.funcionario_id === funcionarioSelecionado.id && 
      p.mes === mes && 
      p.ano === ano
    );
  };

  // Registrar pagamento
  const registrarPagamento = async (funcionarioId, mes, ano, valores) => {
    if (!funcionarioId) return;
    
    try {
      console.log('Registrando pagamento:', { funcionarioId, mes, ano, valores });
      
      const response = await api.post(`/funcionarios/${funcionarioId}/pagamentos`, {
        mes,
        ano,
        ...valores,
        data_pagamento: new Date().toISOString()
      });
      
      await carregarPagamentos(funcionarioId, ano);
      
      // Limpar adiantamentos do mês após pagamento
      const chave = `${funcionarioId}-${mes}-${ano}`;
      setAdiantamentos(prev => {
        const novos = { ...prev };
        delete novos[chave];
        return novos;
      });
      
      alert('Pagamento registrado com sucesso!');
      return response.data;
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err);
      alert('Erro ao registrar pagamento: ' + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  // Carregar adiantamentos do funcionário
  const carregarAdiantamentos = async (funcionarioId, mes, ano) => {
    if (!funcionarioId) return [];
    
    try {
      console.log(`📋 Carregando adiantamentos do funcionário ${funcionarioId} para ${mes}/${ano}`);
      const response = await api.get(`/funcionarios/${funcionarioId}/adiantamentos`, {
        params: { mes, ano }
      });
      console.log('✅ Adiantamentos carregados:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erro ao carregar adiantamentos:', err);
      return [];
    }
  };

  // Registrar adiantamento (AGORA CHAMA A API)
  const registrarAdiantamento = async (funcionarioId, mes, ano, adiantamento) => {
    if (!funcionarioId) return;
    
    try {
      // Verificar se já existe pagamento para este mês
      if (verificarPagamentoRealizado(mes, ano)) {
        alert('Não é possível registrar adiantamento para um mês já pago');
        return;
      }
      
      // Buscar adiantamentos existentes para verificar o total
      const adiantamentosExistentes = await carregarAdiantamentos(funcionarioId, mes, ano);
      const totalAtual = adiantamentosExistentes.reduce((acc, ad) => acc + ad.valor, 0) + adiantamento.valor;
      
      if (totalAtual > funcionarioSelecionado?.salario_base) {
        alert('O total de adiantamentos não pode ultrapassar o salário base');
        return;
      }
      
      console.log('💰 Registrando adiantamento no backend:', adiantamento);
      
      // Salvar no backend
      const response = await api.post(`/funcionarios/${funcionarioId}/adiantamentos`, {
        mes,
        ano,
        ...adiantamento
      });
      
      console.log('✅ Adiantamento registrado:', response.data);
      
      // Recarregar adiantamentos do mês
      const novosAdiantamentos = await carregarAdiantamentos(funcionarioId, mes, ano);
      const chave = `${funcionarioId}-${mes}-${ano}`;
      setAdiantamentos(prev => ({
        ...prev,
        [chave]: novosAdiantamentos
      }));
      
    } catch (err) {
      console.error('❌ Erro ao registrar adiantamento:', err);
      alert('Erro ao registrar adiantamento: ' + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  // Remover adiantamento (AGORA CHAMA A API)
  const removerAdiantamento = async (funcionarioId, mes, ano, adiantamentoId) => {
    if (!funcionarioId) return;
    
    try {
      // Verificar se já existe pagamento para este mês
      if (verificarPagamentoRealizado(mes, ano)) {
        alert('Não é possível remover adiantamento de um mês já pago');
        return;
      }
      
      console.log(`🗑️ Removendo adiantamento ${adiantamentoId}`);
      
      await api.delete(`/funcionarios/${funcionarioId}/adiantamentos/${adiantamentoId}`);
      
      // Recarregar adiantamentos do mês
      const novosAdiantamentos = await carregarAdiantamentos(funcionarioId, mes, ano);
      const chave = `${funcionarioId}-${mes}-${ano}`;
      setAdiantamentos(prev => ({
        ...prev,
        [chave]: novosAdiantamentos
      }));
      
    } catch (err) {
      console.error('❌ Erro ao remover adiantamento:', err);
      alert('Erro ao remover adiantamento: ' + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  const getAdiantamentosDoMes = (funcionarioId, mes, ano) => {
    if (!funcionarioId) return [];
    const chave = `${funcionarioId}-${mes}-${ano}`;
    return adiantamentos[chave] || [];
  };

  // CRUD de funcionários
  const adicionarFuncionario = async (funcionario) => {
    try {
      console.log('➕ Adicionando funcionário:', funcionario);
      
      const funcionarioParaEnviar = {
        ...funcionario,
        salarioBase: parseFloat(funcionario.salarioBase) || 0
      };
      
      const novoFuncionario = await funcionariosService.criar(funcionarioParaEnviar);
      console.log('✅ Funcionário adicionado:', novoFuncionario);
      setFuncionarios(prev => [...prev, novoFuncionario]);
      return novoFuncionario;
    } catch (err) {
      console.error('Erro ao adicionar funcionário:', err);
      throw err;
    }
  };

  const atualizarFuncionario = async (id, funcionario) => {
    try {
      console.log('✏️ Atualizando funcionário ID:', id, funcionario);
      
      const funcionarioParaEnviar = {
        nome: funcionario.nome,
        especialidade: funcionario.especialidade,
        telefone: funcionario.telefone,
        email: funcionario.email,
        dataContratacao: funcionario.dataContratacao,
        salarioBase: parseFloat(funcionario.salarioBase),
        comissaoPercentual: parseInt(funcionario.comissaoPercentual) || 30,
        documentos: funcionario.documentos || {},
        avatar: funcionario.avatar,
        cor: funcionario.cor,
        ativo: true
      };
      
      const funcionarioAtualizado = await funcionariosService.atualizar(id, funcionarioParaEnviar);
      console.log('✅ Funcionário atualizado:', funcionarioAtualizado);
      
      setFuncionarios(prev => prev.map(f => f.id === id ? funcionarioAtualizado : f));
      
      if (funcionarioSelecionado?.id === id) {
        setFuncionarioSelecionado(funcionarioAtualizado);
      }
      
      return funcionarioAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar funcionário:', err);
      throw err;
    }
  };

  const desativarFuncionario = async (id) => {
    try {
      await funcionariosService.desativar(id);
      setFuncionarios(prev => prev.filter(f => f.id !== id));
      if (funcionarioSelecionado?.id === id) {
        setFuncionarioSelecionado(null);
      }
    } catch (err) {
      console.error('Erro ao desativar funcionário:', err);
      throw err;
    }
  };

  // Selecionar funcionário
  const selecionarFuncionario = async (funcionario) => {
    console.log('Selecionando funcionário:', funcionario);
    setFuncionarioSelecionado(funcionario);
    await carregarPonto(funcionario.id, mesSelecionado, anoSelecionado);
    await carregarPagamentos(funcionario.id, anoSelecionado);
    
    // Carregar adiantamentos
    const adiantamentosCarregados = await carregarAdiantamentos(
      funcionario.id, 
      mesSelecionado, 
      anoSelecionado
    );
    
    const chave = `${funcionario.id}-${mesSelecionado}-${anoSelecionado}`;
    setAdiantamentos(prev => ({
      ...prev,
      [chave]: adiantamentosCarregados
    }));
  };

  // Limpar seleção
  const limparSelecao = () => {
    setFuncionarioSelecionado(null);
    setPontoData({});
  };

  // Mudar mês/ano
  const mudarMesAno = async (mes, ano) => {
    setMesSelecionado(mes);
    setAnoSelecionado(ano);
    if (funcionarioSelecionado) {
      await carregarPonto(funcionarioSelecionado.id, mes, ano);
      await carregarPagamentos(funcionarioSelecionado.id, ano);
      
      // Carregar adiantamentos do novo mês
      const adiantamentosCarregados = await carregarAdiantamentos(
        funcionarioSelecionado.id, 
        mes, 
        ano
      );
      
      const chave = `${funcionarioSelecionado.id}-${mes}-${ano}`;
      setAdiantamentos(prev => ({
        ...prev,
        [chave]: adiantamentosCarregados
      }));
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  return {
    // Estados
    funcionarios,
    loading,
    error,
    pontoData,
    mesSelecionado,
    anoSelecionado,
    funcionarioSelecionado,
    pagamentos,
    showModal,
    setShowModal,
    modalModo,
    setModalModo,
    
    // Adiantamentos
    adiantamentos: getAdiantamentosDoMes(
      funcionarioSelecionado?.id, 
      mesSelecionado, 
      anoSelecionado
    ),
    
    // Funções principais
    carregarFuncionarios,
    carregarPonto,
    salvarPonto,
    marcarDia,
    calcularResumo,
    carregarPagamentos,
    
    // Funções de pagamento
    verificarPagamentoRealizado,
    registrarPagamento,
    
    // Funções de adiantamento
    registrarAdiantamento,
    removerAdiantamento,
    
    // Funções de seleção
    selecionarFuncionario,
    limparSelecao,
    mudarMesAno,
    
    // CRUD
    adicionarFuncionario,
    atualizarFuncionario,
    desativarFuncionario,
    
    // Setters
    setFuncionarioSelecionado,
    setMesSelecionado,
    setAnoSelecionado
  };
};