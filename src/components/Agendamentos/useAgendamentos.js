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
  
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: '',
    servicoId: '',
    data: '',
    hora: '09:00',
    status: 'agendado',
    observacoes: ''
  });

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
      
      // FILTRO FORÇADO - SÓ O FUNCIONÁRIO LOGADO
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
      
      // SE FOR FUNCIONÁRIO, REMOVE DADOS SENSÍVEIS
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
      
      // SE FOR FUNCIONÁRIO, BUSCA SÓ OS DELE (SEM FILTRO DE DATA)
      if (isFuncionario && usuario?.funcionarioId) {
        console.log(`🔍 Buscando agendamentos do funcionário ID: ${usuario.funcionarioId} (sem filtro de data)`);
        data = await agendamentosService.buscarPorFuncionarioPeriodo(
          usuario.funcionarioId,
          null,  // 👈 MÊS null = TODOS
          null   // 👈 ANO null = TODOS
        );
        console.log(`✅ Encontrados ${data.length} agendamentos para este funcionário`);
      } 
      // ADMIN E GERENTE VEEM TODOS
      else {
        console.log('🔍 Buscando todos os agendamentos');
        data = await agendamentosService.listar();
        console.log(`✅ Total de agendamentos: ${data.length}`);
      }
      
      setAgendamentos(data);
      setAgendamentosFiltrados(data);
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
  }, []);

  // FILTRO POR PROFISSIONAL E SERVIÇO (apenas para admin/gerente)
  useEffect(() => {
    if (!agendamentos.length) return;
    
    // Se for funcionário, ignora os filtros (já vem só os dele)
    if (isFuncionario) {
      setAgendamentosFiltrados(agendamentos);
      return;
    }
    
    let filtrados = agendamentos;
    
    // Aplicar filtro de profissional
    if (filtroProfissional !== 'todos') {
      filtrados = filtrados.filter(
        ag => ag.funcionario_id === parseInt(filtroProfissional)
      );
    }
    
    // Aplicar filtro de serviço
    if (filtroServico !== 'todos') {
      filtrados = filtrados.filter(
        ag => ag.servico_id === parseInt(filtroServico)
      );
    }
    
    setAgendamentosFiltrados(filtrados);
  }, [agendamentos, filtroProfissional, filtroServico, isFuncionario]);

  // Função para abrir novo agendamento
  const abrirNovoAgendamento = (profissionalId = null, horario = null) => {
    console.log('➕ Abrindo novo agendamento', { profissionalId, horario });
    
    if (!podeEditar('agendamentos')) {
      alert('Você não tem permissão para criar agendamentos');
      return;
    }

    setAgendamentoSelecionado(null);
    setFormData({
      clienteId: '',
      profissionalId: profissionalId || (isFuncionario ? usuario?.funcionarioId : ''),
      servicoId: '',
      data: format(dataSelecionada, 'yyyy-MM-dd'),
      hora: horario || '09:00',
      status: 'agendado',
      observacoes: ''
    });
    setShowModal(true);
  };

  // FUNÇÃO CORRIGIDA - Abrir editar agendamento com verificação rigorosa
  const abrirEditarAgendamento = (agendamento) => {
    console.log('🔍 VERIFICAÇÃO DE EDIÇÃO:');
    console.log('   Agendamento ID:', agendamento.id);
    console.log('   Funcionário ID do agendamento:', agendamento.funcionario_id);
    console.log('   Meu funcionário ID:', usuario?.funcionarioId);
    console.log('   Meu nível:', nivel);
    console.log('   É funcionário?', isFuncionario);

    // Verificação de permissão básica
    if (!podeEditar('agendamentos')) {
      alert('Você não tem permissão para editar agendamentos');
      return;
    }

    // VERIFICAÇÃO ESPECÍFICA PARA FUNCIONÁRIO
    if (isFuncionario) {
      // Garantir que o funcionário só edite os próprios agendamentos
      if (agendamento.funcionario_id !== usuario?.funcionarioId) {
        console.log('❌ BLOQUEADO: Tentativa de editar agendamento de outro funcionário');
        alert('Você só pode editar seus próprios agendamentos!');
        return;
      }
      
      console.log('✅ PERMITIDO: Funcionário editando próprio agendamento');
    } else {
      console.log('✅ PERMITIDO: Admin/Gerente editando agendamento');
    }

    // Se passou pelas verificações, abre o modal
    setAgendamentoSelecionado(agendamento);
    setFormData({
      clienteId: agendamento.cliente_id,
      profissionalId: agendamento.funcionario_id,
      servicoId: agendamento.servico_id,
      data: format(new Date(agendamento.data_hora), 'yyyy-MM-dd'),
      hora: format(new Date(agendamento.data_hora), 'HH:mm'),
      status: agendamento.status,
      observacoes: agendamento.observacoes || ''
    });
    setShowModal(true);
  };

  // Função para salvar agendamento
  const salvarAgendamento = async () => {
    console.log('📝 Salvando agendamento:', formData);
    
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

    // VERIFICAÇÃO DE SEGURANÇA NO SALVAMENTO
    if (isFuncionario && agendamentoSelecionado) {
      // Se for edição, verificar se é do próprio funcionário
      if (agendamentoSelecionado.funcionario_id !== usuario?.funcionarioId) {
        alert('Você só pode editar seus próprios agendamentos!');
        return;
      }
    }

    const percentualComissao = calcularComissaoServico(servico, profissional);
    const valorComissao = servico.preco * (percentualComissao / 100);
    
    const dataHora = `${formData.data}T${formData.hora}:00`;

    const agendamentoData = {
      cliente_id: parseInt(formData.clienteId),
      funcionario_id: parseInt(formData.profissionalId),
      servico_id: parseInt(formData.servicoId),
      data_hora: dataHora,
      status: formData.status,
      observacoes: formData.observacoes || '',
      valor: servico.preco,
      valor_comissao: valorComissao,
      percentual_comissao: percentualComissao
    };

    try {
      if (agendamentoSelecionado) {
        await agendamentosService.atualizar(agendamentoSelecionado.id, agendamentoData);
        
        const evento = new CustomEvent('agendamentoAtualizado', { 
          detail: { tipo: 'edicao', agendamento: agendamentoData }
        });
        window.dispatchEvent(evento);
        
        alert('Agendamento atualizado com sucesso!');
      } else {
        const result = await agendamentosService.criar(agendamentoData);
        
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
    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('Erro ao salvar agendamento: ' + errorMsg);
    }
  };

  // Função para excluir agendamento
  const excluirAgendamento = async (id) => {
    // Encontrar o agendamento antes de excluir
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

    // Verificação de permissão
    if (!podeExcluir('agendamentos')) {
      alert('Você não tem permissão para excluir agendamentos');
      return;
    }

    // Funcionário só pode excluir próprios agendamentos
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
      return dataAg.getMonth() === mes && dataAg.getFullYear() === ano;
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
    isFuncionario
  };
};