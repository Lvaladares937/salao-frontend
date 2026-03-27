import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import agendamentosService from '../../services/agendamentosService';
import funcionariosService from '../../services/funcionariosService';
import clientesService from '../../services/clientesService';
import servicosService from '../../services/servicosService';
import { usePermissao } from '../../hooks/usePermissao';

// Função para calcular comissão baseada no serviço e profissional
const calcularComissaoServico = (servico, profissional) => {
  const comissoesEspeciais = {
    'Corte Masculino': 35,
    'Corte Feminino': 40,
    'Barba': 35,
    'Barba completa': 35,
    'Manicure': 30,
    'Pedicure': 30,
    'Coloração': 45,
    'Hidratação': 35,
    'Escova': 30,
    'Design de Sobrancelha': 40,
    'Limpeza de Pele': 35,
    'Depilação': 30,
    'Maquiagem': 35,
    'Alongamento de Cílios': 40
  };
  
  for (const [key, value] of Object.entries(comissoesEspeciais)) {
    if (servico.nome.includes(key)) {
      return value;
    }
  }
  
  return profissional.comissao_percentual || 30;
};

// 🔥 FUNÇÃO PARA CONVERTER DATA/HORA LOCAL PARA ISO (CORRIGIDA)
const localToISO = (data, hora) => {
  if (!data || !hora) return null;
  
  const [ano, mes, dia] = data.split('-');
  const [horaStr, minutoStr] = hora.split(':');
  
  // Criar data em UTC sem conversão de timezone
  return new Date(Date.UTC(
    parseInt(ano),
    parseInt(mes) - 1,
    parseInt(dia),
    parseInt(horaStr),
    parseInt(minutoStr),
    0
  )).toISOString();
};

// 🔥 FUNÇÃO PARA EXTRAIR DATA CORRETAMENTE (SEM CONVERSÃO DE TIMEZONE)
const extrairDataCorreta = (dataHoraStr) => {
  if (!dataHoraStr) return format(new Date(), 'yyyy-MM-dd');
  
  // Se for string ISO "2026-03-27T14:00:00.000Z"
  let match = dataHoraStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }
  
  // Se for formato "2026-03-27 14:00:00"
  match = dataHoraStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }
  
  return format(new Date(), 'yyyy-MM-dd');
};

// 🔥 FUNÇÃO PARA EXTRAIR HORA - CONVERTER UTC PARA LOCAL
const extrairHoraCorreta = (dataHoraStr) => {
  if (!dataHoraStr) return '09:00';
  
  // Formato ISO "2026-03-27T13:30:00.000Z"
  let match = dataHoraStr.match(/T(\d{2}):(\d{2})/);
  if (match) {
    let horaUTC = parseInt(match[1]);
    let minuto = parseInt(match[2]);
    
    // Converter UTC para horário de Brasília (UTC-3)
    let horaLocal = horaUTC - 3;
    if (horaLocal < 0) {
      horaLocal = horaLocal + 24;
    }
    
    console.log('🔄 Conversão UTC -> Local:', `${horaUTC}:${minuto} -> ${horaLocal}:${minuto}`);
    
    return `${horaLocal.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  }
  
  // Formato com espaço "2026-03-20 16:00:00"
  match = dataHoraStr.match(/\s(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  
  return '09:00';
};

export const useAgendamentos = () => {
  const { podeVer, podeEditar, podeExcluir, nivel, usuario } = usePermissao();
  const isFuncionario = nivel === 'funcionario';
  
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  const [filtroServico, setFiltroServico] = useState('todos');
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [horarioInicial, setHorarioInicial] = useState(null);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: '',
    servicoId: '',
    data: '',
    hora: '09:00',
    status: 'agendado',
    observacoes: ''
  });

  // 🔥 FUNÇÃO PARA RESETAR FORMULÁRIO
  const resetarFormData = useCallback(() => {
    console.log('🔄 Resetando formulário');
    setFormData({
      clienteId: '',
      profissionalId: '',
      servicoId: '',
      data: format(dataSelecionada, 'yyyy-MM-dd'),
      hora: '09:00',
      status: 'agendado',
      observacoes: ''
    });
    setAgendamentoSelecionado(null);
    setHorarioInicial(null);
  }, [dataSelecionada]);

  // 🔥 RESETAR QUANDO O MODAL FECHAR
  useEffect(() => {
    if (!showModal) {
      resetarFormData();
    }
  }, [showModal, resetarFormData]);

  // Log para debug
  useEffect(() => {
    console.log('👤 useAgendamentos - Usuário logado:', {
      nivel,
      funcionarioId: usuario?.funcionarioId,
      nome: usuario?.nome,
      isFuncionario
    });
  }, [nivel, usuario, isFuncionario]);

  // Carregar funcionários do banco
  const carregarFuncionarios = async () => {
    try {
      const data = await funcionariosService.listar();
      console.log('📦 Todos funcionários do banco:', data.map(f => ({ id: f.id, nome: f.nome })));
      
      setFuncionarios(data);
      
      if (isFuncionario && usuario?.funcionarioId) {
        const apenasOMeu = data.filter(f => f.id === usuario.funcionarioId);
        console.log('✅ FUNCIONÁRIO FILTRADO - SÓ EU:', apenasOMeu.map(f => f.nome));
        setFuncionariosFiltrados(apenasOMeu);
      } else {
        console.log('✅ ADMIN/GERENTE - TODOS FUNCIONÁRIOS');
        setFuncionariosFiltrados(data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários:', error);
    }
  };

  // Carregar clientes do banco
  const carregarClientes = async () => {
    try {
      const data = await clientesService.listar();
      
      if (isFuncionario) {
        setClientes(data.map(cliente => ({
          id: cliente.id,
          nome: cliente.nome
        })));
        console.log('✅ Clientes carregados (sem dados sensíveis):', data.length);
      } else {
        setClientes(data);
        console.log('✅ Clientes carregados (completos):', data.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
    }
  };

  // Carregar serviços do banco
  const carregarServicos = async () => {
    try {
      const data = await servicosService.listar();
      setServicos(data);
      console.log('✅ Serviços carregados:', data.length);
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error);
    }
  };

  // Carregar agendamentos do banco
  const carregarAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      
      let data = [];
      
      if (isFuncionario && usuario?.funcionarioId) {
        console.log(`🔍 Buscando agendamentos do funcionário ID: ${usuario.funcionarioId}`);
        data = await agendamentosService.buscarPorFuncionarioPeriodo(
          usuario.funcionarioId,
          null,
          null
        );
        console.log(`✅ Encontrados ${data.length} agendamentos para este funcionário`);
      } else {
        console.log('🔍 Buscando todos os agendamentos');
        data = await agendamentosService.listar();
        console.log(`✅ Total de agendamentos: ${data.length}`);
      }
      
      // 🔥 CORREÇÃO: Normalizar os agendamentos ao carregar
      const agendamentosNormalizados = data.map(ag => ({
        ...ag,
        data_hora_normalizada: ag.data_hora,
        hora_extraida: extrairHoraCorreta(ag.data_hora),
        data_extraida: extrairDataCorreta(ag.data_hora)
      }));
      
      setAgendamentos(agendamentosNormalizados);
      setAgendamentosFiltrados(agendamentosNormalizados);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  }, [isFuncionario, usuario]);

  // Carregar todos os dados iniciais
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoading(true);
      await Promise.all([
        carregarFuncionarios(),
        carregarClientes(),
        carregarServicos(),
        carregarAgendamentos()
      ]);
      setLoading(false);
    };
    
    carregarDadosIniciais();
  }, [carregarAgendamentos]);

  // FILTRO POR PROFISSIONAL E SERVIÇO
  useEffect(() => {
    if (!agendamentos.length) return;
    
    if (isFuncionario) {
      setAgendamentosFiltrados(agendamentos);
      return;
    }
    
    let filtrados = agendamentos;
    
    if (filtroProfissional !== 'todos') {
      filtrados = filtrados.filter(
        ag => ag.funcionario_id === parseInt(filtroProfissional)
      );
    }
    
    if (filtroServico !== 'todos') {
      filtrados = filtrados.filter(
        ag => ag.servico_id === parseInt(filtroServico)
      );
    }
    
    setAgendamentosFiltrados(filtrados);
  }, [agendamentos, filtroProfissional, filtroServico, isFuncionario]);

  // 🔥 FUNÇÃO PARA ABRIR NOVO AGENDAMENTO (com profissional e horário)
  const abrirNovoAgendamento = (profissionalId = null, horario = null, data = null) => {
    console.log('➕ Abrindo novo agendamento', { profissionalId, horario, data });
    
    if (!podeEditar('agendamentos')) {
      alert('Você não tem permissão para criar agendamentos');
      return;
    }

    const dataParaUsar = data || format(dataSelecionada, 'yyyy-MM-dd');
    const profissionalParaUsar = profissionalId || (isFuncionario ? usuario?.funcionarioId : '');
    const horarioParaUsar = horario || '09:00';
    
    // 🔥 Armazenar o horário inicial para o modal
    setHorarioInicial(horarioParaUsar);
    
    setAgendamentoSelecionado(null);
    setFormData({
      clienteId: '',
      profissionalId: profissionalParaUsar,
      servicoId: '',
      data: dataParaUsar,
      hora: horarioParaUsar,
      status: 'agendado',
      observacoes: ''
    });
    setShowModal(true);
  };

  // 🔥 FUNÇÃO PARA ABRIR EDIÇÃO DE AGENDAMENTO (CORRIGIDA)
  const abrirEditarAgendamento = (agendamento) => {
    console.log('🔍 VERIFICAÇÃO DE EDIÇÃO:');
    console.log('   Agendamento ID:', agendamento.id);
    console.log('   Data/Hora original (banco):', agendamento.data_hora);
    
    // 🔥 CORREÇÃO: Extrair data e hora sem conversão de timezone
    const horaCorreta = extrairHoraCorreta(agendamento.data_hora);
    const dataCorreta = extrairDataCorreta(agendamento.data_hora);
    
    console.log('   Hora extraída (UTC original):', horaCorreta);
    console.log('   Data extraída:', dataCorreta);

    if (!podeEditar('agendamentos')) {
      alert('Você não tem permissão para editar agendamentos');
      return;
    }

    if (isFuncionario) {
      if (agendamento.funcionario_id !== usuario?.funcionarioId) {
        alert('Você só pode editar seus próprios agendamentos!');
        return;
      }
    }

    setAgendamentoSelecionado(agendamento);
    setHorarioInicial(horaCorreta);
    setFormData({
      clienteId: agendamento.cliente_id,
      profissionalId: agendamento.funcionario_id,
      servicoId: agendamento.servico_id,
      data: dataCorreta,
      hora: horaCorreta,
      status: agendamento.status,
      observacoes: agendamento.observacoes || ''
    });
    setShowModal(true);
  };

  // 🔥 FUNÇÃO PARA SALVAR AGENDAMENTO - ENVIAR HORÁRIO LOCAL
  const salvarAgendamento = async (dadosPagamento = null) => {
    console.log('📝 Salvando agendamento:', formData);
    console.log('📝 Status atual:', formData.status);
    console.log('💳 Dados de pagamento:', dadosPagamento);
    
    if (!formData.clienteId || !formData.profissionalId || !formData.servicoId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const cliente = clientes.find(c => c.id === parseInt(formData.clienteId));
    const profissional = funcionarios.find(f => f.id === parseInt(formData.profissionalId));
    const servico = servicos.find(s => s.id === parseInt(formData.servicoId));

    if (!cliente) {
      alert(`Cliente ID ${formData.clienteId} não encontrado`);
      return;
    }
    
    if (!profissional) {
      alert(`Profissional ID ${formData.profissionalId} não encontrado`);
      return;
    }
    
    if (!servico) {
      alert(`Serviço ID ${formData.servicoId} não encontrado`);
      return;
    }

    if (isFuncionario && agendamentoSelecionado) {
      if (agendamentoSelecionado.funcionario_id !== usuario?.funcionarioId) {
        alert('Você só pode editar seus próprios agendamentos!');
        return;
      }
    }

    const percentualComissao = calcularComissaoServico(servico, profissional);
    const valorComissao = servico.preco * (percentualComissao / 100);
    
    // 🔥 CORREÇÃO: Enviar o horário LOCAL sem conversão
    const dataHoraLocal = `${formData.data}T${formData.hora}:00`;
    
    console.log('🔍 Horário local clicado:', `${formData.data} ${formData.hora}`);
    console.log('🔍 Horário enviado para API:', dataHoraLocal);

    const agendamentoData = {
      cliente_id: parseInt(formData.clienteId),
      funcionario_id: parseInt(formData.profissionalId),
      servico_id: parseInt(formData.servicoId),
      data_hora: dataHoraLocal, // Envia como "2026-03-27T10:00:00"
      status: formData.status,
      observacoes: formData.observacoes || '',
      valor: servico.preco,
      valor_comissao: valorComissao,
      percentual_comissao: percentualComissao,
      ...(dadosPagamento && {
        forma_pagamento: dadosPagamento.forma_pagamento,
        bandeira_cartao: dadosPagamento.bandeira_cartao,
        parcelas: dadosPagamento.parcelas,
        data_pagamento: dadosPagamento.data_pagamento
      })
    };

    console.log('📤 Enviando para API:', agendamentoData);

    try {
      if (agendamentoSelecionado) {
        console.log(`✏️ Atualizando agendamento ID: ${agendamentoSelecionado.id}`);
        await agendamentosService.atualizar(agendamentoSelecionado.id, agendamentoData);
        console.log('✅ Atualizado com sucesso');
        
        const evento = new CustomEvent('agendamentoAtualizado', { 
          detail: { tipo: 'edicao', agendamento: agendamentoData }
        });
        window.dispatchEvent(evento);
        
        alert('Agendamento atualizado com sucesso!');
      } else {
        console.log('➕ Criando novo agendamento');
        const response = await agendamentosService.criar(agendamentoData);
        console.log('✅ Criado com sucesso', response);
        
        const evento = new CustomEvent('novoAgendamento', { 
          detail: { 
            venda: {
              funcionarioId: profissional.id,
              funcionario: profissional.nome,
              data: formData.data,
              valor: servico.preco,
              servico: servico.nome,
              comissao: valorComissao
            }
          }
        });
        window.dispatchEvent(evento);
        
        alert('Agendamento criado com sucesso!');
      }
      
      await carregarAgendamentos();
      setShowModal(false);
      setHorarioInicial(null);
    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('Erro ao salvar agendamento: ' + errorMsg);
    }
  };

  // Função para excluir agendamento
  const excluirAgendamento = async (id) => {
    const agendamentoParaExcluir = agendamentos.find(ag => ag.id === id);
    
    if (!agendamentoParaExcluir) {
      alert('Agendamento não encontrado');
      return;
    }

    console.log('🗑️ Tentando excluir agendamento:', {
      id,
      funcionario_id: agendamentoParaExcluir.funcionario_id,
      meuFuncionarioId: usuario?.funcionarioId,
      nivel
    });

    if (!podeExcluir('agendamentos')) {
      alert('Você não tem permissão para excluir agendamentos');
      return;
    }

    if (isFuncionario && agendamentoParaExcluir.funcionario_id !== usuario?.funcionarioId) {
      alert('Você só pode excluir seus próprios agendamentos!');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await agendamentosService.excluir(id);
        await carregarAgendamentos();
        
        const evento = new CustomEvent('agendamentoRemovido', { 
          detail: { agendamento: agendamentoParaExcluir }
        });
        window.dispatchEvent(evento);
        
        setShowModal(false);
        alert('Agendamento excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir agendamento');
        console.error(error);
      }
    }
  };

  // Funções auxiliares
  const buscarAgendamentosPorPeriodo = (mes, ano) => {
    return agendamentosFiltrados.filter(ag => {
      const dataAg = new Date(ag.data_hora);
      return dataAg.getUTCMonth() === mes && dataAg.getUTCFullYear() === ano;
    });
  };

  const calcularVendasPorFuncionario = (funcionarioId, mes, ano) => {
    const agendamentosPeriodo = buscarAgendamentosPorPeriodo(mes, ano);
    return agendamentosPeriodo
      .filter(ag => ag.funcionario_id === funcionarioId && ag.status !== 'cancelado')
      .reduce((total, ag) => total + (ag.valor || 0), 0);
  };

  const calcularComissoesPorFuncionario = (funcionarioId, mes, ano) => {
    const agendamentosPeriodo = buscarAgendamentosPorPeriodo(mes, ano);
    return agendamentosPeriodo
      .filter(ag => ag.funcionario_id === funcionarioId && ag.status !== 'cancelado')
      .reduce((total, ag) => total + (ag.valor_comissao || 0), 0);
  };

  const profissionais = funcionariosFiltrados;

  return {
    dataSelecionada,
    setDataSelecionada,
    showModal,
    setShowModal,
    agendamentoSelecionado,
    filtroProfissional,
    setFiltroProfissional,
    filtroServico,
    setFiltroServico,
    agendamentos: agendamentosFiltrados,
    todosAgendamentos: agendamentos,
    formData,
    setFormData,
    loading,
    abrirNovoAgendamento,
    abrirEditarAgendamento,
    salvarAgendamento,
    excluirAgendamento,
    buscarAgendamentosPorPeriodo,
    calcularVendasPorFuncionario,
    calcularComissoesPorFuncionario,
    profissionais,
    funcionarios: funcionariosFiltrados,
    clientes,
    servicos,
    permissoes: {
      podeVer: podeVer('agendamentos'),
      podeEditar: podeEditar('agendamentos'),
      podeExcluir: podeExcluir('agendamentos')
    },
    nivel,
    usuario,
    isFuncionario,
    horarioInicial,
    setHorarioInicial
  };
};
