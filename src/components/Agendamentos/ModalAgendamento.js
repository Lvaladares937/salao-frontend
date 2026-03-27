import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Mail, DollarSign, CreditCard, Info, Clock, Search, User, Scissors, CheckCircle, CalendarCheck, XCircle } from 'lucide-react';
import { useConfiguracoesHorarios } from '../../hooks/useConfiguracoesHorarios';

// 🔥 FUNÇÕES DE CORES ATUALIZADAS
const getStatusBgColor = (status) => {
  switch(status) {
    case 'confirmado':
      return 'bg-green-100';
    case 'agendado':
      return 'bg-blue-100';
    case 'em_atendimento':
      return 'bg-yellow-100';
    case 'concluido':
      return 'bg-gray-100';
    case 'cancelado':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

const getStatusTextColor = (status) => {
  switch(status) {
    case 'confirmado':
      return 'text-green-700';
    case 'agendado':
      return 'text-blue-700';
    case 'em_atendimento':
      return 'text-yellow-700';
    case 'concluido':
      return 'text-gray-700';
    case 'cancelado':
      return 'text-red-700';
    default:
      return 'text-gray-700';
  }
};

const getStatusLargeIcon = (status) => {
  switch(status) {
    case 'confirmado':
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    case 'agendado':
      return <Clock className="w-6 h-6 text-blue-600" />;
    case 'em_atendimento':
      return <Scissors className="w-6 h-6 text-yellow-600" />;
    case 'concluido':
      return <CalendarCheck className="w-6 h-6 text-gray-600" />;
    case 'cancelado':
      return <XCircle className="w-6 h-6 text-red-600" />;
    default:
      return <Clock className="w-6 h-6 text-gray-600" />;
  }
};

const getStatusName = (status) => {
  switch(status) {
    case 'confirmado':
      return 'Confirmado';
    case 'agendado':
      return 'Agendado';
    case 'em_atendimento':
      return 'Em Atendimento';
    case 'concluido':
      return 'Concluído';
    case 'cancelado':
      return 'Cancelado';
    default:
      return 'Agendado';
  }
};

const ModalAgendamento = ({
  show,
  onClose,
  agendamentoSelecionado,
  formData,
  setFormData,
  onSalvar,
  onExcluir,
  profissionais,
  servicos,
  clientes,
  horarioInicial
}) => {
  const { horariosDisponiveis, loading, config } = useConfiguracoesHorarios();
  
  const [statusAnterior, setStatusAnterior] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [comissaoCalculada, setComissaoCalculada] = useState(0);
  const [percentualComissao, setPercentualComissao] = useState(0);
  const [mostrarPagamento, setMostrarPagamento] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [bandeiraCartao, setBandeiraCartao] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [pagamentoRegistrado, setPagamentoRegistrado] = useState(false);
  const [horariosDoDia, setHorariosDoDia] = useState([]);
  
  // Estados para proteger os dados do clique
  const [dadosDoClique, setDadosDoClique] = useState(false);
  const [profissionalDoClique, setProfissionalDoClique] = useState(null);
  
  // Estados para busca de cliente
  const [buscaCliente, setBuscaCliente] = useState('');
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const dropdownClienteRef = useRef(null);

  // Estados para busca de serviço
  const [buscaServico, setBuscaServico] = useState('');
  const [mostrarDropdownServico, setMostrarDropdownServico] = useState(false);
  const [servicosFiltrados, setServicosFiltrados] = useState([]);
  const dropdownServicoRef = useRef(null);

  // Log para debug
  useEffect(() => {
    console.log('📅 ModalAgendamento renderizado:', {
      show,
      horarioInicial,
      agendamentoSelecionado: !!agendamentoSelecionado,
      formDataHora: formData?.hora
    });
  }, [show, horarioInicial, agendamentoSelecionado, formData?.hora]);

  // Lista de bandeiras de cartão
  const bandeirasCartao = [
    'Visa',
    'Mastercard',
    'American Express',
    'Elo',
    'Hipercard',
    'Diners Club',
    'Discover',
    'Aura',
    'JCB',
    'Sorocred',
    'Credsystem',
    'Policard',
    'Agiplan',
    'Banes Card',
    'Calcard',
    'Up (Alelo)',
    'Sodexo',
    'Ticket Restaurante',
    'Vale (Alelo)'
  ];

  // Formas de pagamento
  const formasPagamento = [
    { id: 'dinheiro', nome: 'Dinheiro' },
    { id: 'pix', nome: 'PIX' },
    { id: 'debito', nome: 'Cartão de Débito' },
    { id: 'credito', nome: 'Cartão de Crédito' },
    { id: 'credito_parcelado', nome: 'Cartão de Crédito Parcelado' },
    { id: 'transferencia', nome: 'Transferência Bancária' },
    { id: 'fiado', nome: 'Fiado (Crediário)' }
  ];

  // RESETAR O MODAL QUANDO FECHAR
  useEffect(() => {
    if (!show) {
      setBuscaCliente('');
      setBuscaServico('');
      setServicoSelecionado(null);
      setProfissionalSelecionado(null);
      setMostrarPagamento(false);
      setFormaPagamento('dinheiro');
      setBandeiraCartao('');
      setParcelas(1);
      setPagamentoRegistrado(false);
      setDadosDoClique(false);
      setProfissionalDoClique(null);
    }
  }, [show]);

  // Atualizar dados quando o agendamentoSelecionado mudar
  useEffect(() => {
    if (show && agendamentoSelecionado) {
      setDadosDoClique(false);
      setProfissionalDoClique(null);
      
      setBuscaCliente('');
      setBuscaServico('');
      setServicoSelecionado(null);
      setProfissionalSelecionado(null);
      
      if (agendamentoSelecionado.cliente_id) {
        const clienteEncontrado = clientes?.find(c => c.id === agendamentoSelecionado.cliente_id);
        if (clienteEncontrado) {
          setBuscaCliente(clienteEncontrado.nome);
        }
      }
      
      if (agendamentoSelecionado.servico_id) {
        const servicoEncontrado = servicos?.find(s => s.id === agendamentoSelecionado.servico_id);
        if (servicoEncontrado) {
          setBuscaServico(servicoEncontrado.nome);
          setServicoSelecionado(servicoEncontrado);
        }
      }
      
      if (agendamentoSelecionado.funcionario_id) {
        const profissionalEncontrado = profissionais?.find(p => p.id === agendamentoSelecionado.funcionario_id);
        if (profissionalEncontrado) {
          setProfissionalSelecionado(profissionalEncontrado);
        }
      }
      
      setStatusAnterior(agendamentoSelecionado.status);
    }
  }, [agendamentoSelecionado, show, clientes, servicos, profissionais]);

  // 🔥 DEFINIR HORÁRIO BASEADO NO CLIQUE DO CALENDÁRIO (COM DELAY)
  useEffect(() => {
    if (show && horarioInicial && !agendamentoSelecionado) {
      console.log('🎯 Definindo horário do clique:', horarioInicial);
      setDadosDoClique(true);
      
      if (formData.profissionalId) {
        const prof = profissionais?.find(p => p.id === parseInt(formData.profissionalId));
        if (prof) {
          setProfissionalDoClique(prof);
          setProfissionalSelecionado(prof);
        }
      }
      
      // Pequeno delay para garantir que o formData está pronto
      setTimeout(() => {
        if (formData.hora !== horarioInicial) {
          console.log('⏰ Aplicando horário com delay:', horarioInicial);
          setFormData(prev => ({ ...prev, hora: horarioInicial }));
        }
      }, 50);
    }
  }, [show, horarioInicial, agendamentoSelecionado, formData.profissionalId, formData.hora, profissionais, setFormData]);

  // 🔥 VERIFICAÇÃO ADICIONAL - Garantir horário após modal abrir
  useEffect(() => {
    if (show && horarioInicial && !agendamentoSelecionado) {
      const timer = setTimeout(() => {
        if (formData.hora !== horarioInicial) {
          console.log('🎯 Verificação adicional - corrigindo horário para:', horarioInicial);
          setFormData(prev => ({ ...prev, hora: horarioInicial }));
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [show, horarioInicial, agendamentoSelecionado, formData.hora, setFormData]);

  // 🔥 PROTEGER: Garantir que o horário não seja alterado por outros efeitos
  useEffect(() => {
    if (dadosDoClique && horarioInicial && formData.hora !== horarioInicial) {
      console.log('🔒 Protegendo horário - restaurando para:', horarioInicial);
      setFormData(prev => ({ ...prev, hora: horarioInicial }));
    }
  }, [formData.hora, dadosDoClique, horarioInicial, setFormData]);

  // 🔥 PROTEGER HORÁRIO QUANDO OS HORÁRIOS DO DIA SÃO CARREGADOS
  useEffect(() => {
    if (dadosDoClique && horarioInicial && horariosDoDia.length > 0) {
      if (formData.hora !== horarioInicial) {
        console.log('🔒 Restaurando horário após carregar lista:', horarioInicial);
        setFormData(prev => ({ ...prev, hora: horarioInicial }));
      }
    }
  }, [horariosDoDia, dadosDoClique, horarioInicial, formData.hora, setFormData]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownClienteRef.current && !dropdownClienteRef.current.contains(event.target)) {
        setMostrarDropdownCliente(false);
      }
      if (dropdownServicoRef.current && !dropdownServicoRef.current.contains(event.target)) {
        setMostrarDropdownServico(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar clientes baseado na busca
  useEffect(() => {
    if (buscaCliente.trim() === '') {
      setClientesFiltrados(clientes || []);
    } else {
      const termoBusca = buscaCliente.toLowerCase();
      const filtrados = (clientes || []).filter(cliente => 
        cliente.nome.toLowerCase().includes(termoBusca) ||
        (cliente.telefone && cliente.telefone.includes(termoBusca)) ||
        (cliente.email && cliente.email.toLowerCase().includes(termoBusca))
      );
      setClientesFiltrados(filtrados);
    }
  }, [buscaCliente, clientes]);

  // Filtrar serviços baseado na busca
  useEffect(() => {
    if (buscaServico.trim() === '') {
      setServicosFiltrados(servicos || []);
    } else {
      const termoBusca = buscaServico.toLowerCase();
      const filtrados = (servicos || []).filter(servico => 
        servico.nome.toLowerCase().includes(termoBusca) ||
        (servico.categoria && servico.categoria.toLowerCase().includes(termoBusca)) ||
        (servico.preco && servico.preco.toString().includes(termoBusca))
      );
      setServicosFiltrados(filtrados);
    }
  }, [buscaServico, servicos]);

  // Atualizar busca quando o cliente for selecionado externamente
  useEffect(() => {
    if (formData.clienteId && clientes && show) {
      const clienteSelecionado = clientes.find(c => c.id === parseInt(formData.clienteId));
      if (clienteSelecionado) {
        setBuscaCliente(clienteSelecionado.nome);
      }
    }
  }, [formData.clienteId, clientes, show]);

  // Atualizar busca quando o serviço for selecionado externamente
  useEffect(() => {
    if (dadosDoClique) return;
    
    if (formData.servicoId && servicos && show) {
      const servicoSelecionadoObj = servicos.find(s => s.id === parseInt(formData.servicoId));
      if (servicoSelecionadoObj) {
        setBuscaServico(servicoSelecionadoObj.nome);
        setServicoSelecionado(servicoSelecionadoObj);
      }
    }
  }, [formData.servicoId, servicos, show, dadosDoClique]);

  // Gerar horários disponíveis baseados nas configurações
  useEffect(() => {
    if (formData.data) {
      console.log('📅 Gerando horários para data:', formData.data);
      setHorariosDoDia(horariosDisponiveis);
    }
  }, [formData.data, horariosDisponiveis]);

  // Atualizar profissional selecionado (protegido)
  useEffect(() => {
    if (dadosDoClique && profissionalDoClique) {
      if (profissionalSelecionado?.id !== profissionalDoClique.id) {
        setProfissionalSelecionado(profissionalDoClique);
      }
      return;
    }
    
    if (formData.profissionalId && profissionais && show) {
      const prof = profissionais.find(p => p.id === parseInt(formData.profissionalId));
      setProfissionalSelecionado(prof);
    } else {
      setProfissionalSelecionado(null);
    }
  }, [formData.profissionalId, profissionais, show, dadosDoClique, profissionalDoClique, profissionalSelecionado]);

  // Calcular comissão baseada no serviço e profissional
  useEffect(() => {
    if (servicoSelecionado && profissionalSelecionado) {
      const percComissao = servicoSelecionado.comissao_percentual || 
                          profissionalSelecionado.comissao_percentual || 
                          30;
      
      setPercentualComissao(percComissao);
      
      const valorComissao = (parseFloat(servicoSelecionado.preco) * percComissao) / 100;
      setComissaoCalculada(valorComissao);
    } else {
      setComissaoCalculada(0);
      setPercentualComissao(0);
    }
  }, [servicoSelecionado, profissionalSelecionado]);

  // Salvar o status anterior quando o modal abrir
  useEffect(() => {
    if (agendamentoSelecionado && show) {
      setStatusAnterior(agendamentoSelecionado.status);
    }
  }, [agendamentoSelecionado, show]);

  // Quando o status muda para concluído, mostrar opções de pagamento
  useEffect(() => {
    if (formData.status === 'concluido') {
      setMostrarPagamento(true);
    } else {
      setMostrarPagamento(false);
    }
  }, [formData.status]);

  // Função para selecionar cliente
  const selecionarCliente = (cliente) => {
    setBuscaCliente(cliente.nome);
    setFormData({ ...formData, clienteId: cliente.id });
    setMostrarDropdownCliente(false);
  };

  // Função para selecionar serviço
  const selecionarServico = (servico) => {
    setBuscaServico(servico.nome);
    setFormData({ ...formData, servicoId: servico.id });
    setServicoSelecionado(servico);
    setMostrarDropdownServico(false);
    
    if (dadosDoClique) {
      setDadosDoClique(false);
    }
  };

  // Função para limpar seleção de cliente
  const limparCliente = () => {
    setBuscaCliente('');
    setFormData({ ...formData, clienteId: '' });
    setMostrarDropdownCliente(false);
  };

  // Função para limpar seleção de serviço
  const limparServico = () => {
    setBuscaServico('');
    setFormData({ ...formData, servicoId: '' });
    setServicoSelecionado(null);
    setMostrarDropdownServico(false);
  };

  // Função para atualizar apenas o status
  const handleStatusChange = (novoStatus) => {
    setFormData(prev => ({ 
      ...prev, 
      status: novoStatus
    }));
  };

  // 🔥 FUNÇÃO PARA QUANDO O USUÁRIO MUDA O PROFISSIONAL MANUALMENTE
  const handleProfissionalChange = (e) => {
    const profissionalId = e.target.value;
    console.log('👤 Usuário alterou profissional manualmente para:', profissionalId);
    setFormData({ ...formData, profissionalId });
    
    if (dadosDoClique) {
      setDadosDoClique(false);
      setProfissionalDoClique(null);
    }
  };

  // 🔥 FUNÇÃO PARA QUANDO O USUÁRIO MUDA O HORÁRIO MANUALMENTE
  const handleHorarioChange = (e) => {
    const novoHorario = e.target.value;
    console.log('👤 Usuário alterou horário manualmente para:', novoHorario);
    setFormData({ ...formData, hora: novoHorario });
    
    if (dadosDoClique) {
      setDadosDoClique(false);
    }
  };

  const handleSalvar = async () => {
    if (!formData.clienteId) {
      alert('Selecione um cliente');
      return;
    }

    if (!formData.servicoId) {
      alert('Selecione um serviço');
      return;
    }

    if (!formData.profissionalId) {
      alert('Selecione um profissional');
      return;
    }

    if (!formData.hora) {
      alert('Selecione um horário');
      return;
    }

    const statusMudouParaConcluido = 
      agendamentoSelecionado && 
      formData.status === 'concluido' && 
      statusAnterior !== 'concluido';

    if (formData.status === 'concluido' && !formaPagamento) {
      alert('Selecione a forma de pagamento');
      return;
    }

    if (formaPagamento === 'credito_parcelado' && (!parcelas || parcelas < 1)) {
      alert('Selecione o número de parcelas');
      return;
    }

    if ((formaPagamento === 'debito' || formaPagamento === 'credito' || formaPagamento === 'credito_parcelado') && !bandeiraCartao) {
      alert('Selecione a bandeira do cartão');
      return;
    }

    const dadosPagamento = {
      forma_pagamento: formaPagamento,
      bandeira_cartao: bandeiraCartao || null,
      parcelas: parcelas || 1,
      valor_total: servicoSelecionado?.preco || 0,
      valor_comissao: comissaoCalculada,
      percentual_comissao: percentualComissao,
      data_pagamento: new Date().toISOString()
    };

    await onSalvar(dadosPagamento);

    if (statusMudouParaConcluido) {
      const evento = new CustomEvent('agendamentoConcluido', {
        detail: {
          agendamentoId: agendamentoSelecionado.id,
          funcionarioId: parseInt(formData.profissionalId),
          funcionarioNome: profissionalSelecionado?.nome,
          servicoNome: servicoSelecionado?.nome,
          valor: servicoSelecionado?.preco || 0,
          comissao: comissaoCalculada,
          data: formData.data,
          hora: formData.hora,
          pagamento: dadosPagamento
        }
      });
      window.dispatchEvent(evento);
      
      console.log('🎉 Evento agendamentoConcluido disparado!', evento.detail);
    }

    setMostrarPagamento(false);
    setPagamentoRegistrado(true);
  };

  // Formatar preço para exibição
  const formatarPreco = (preco) => {
    return `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${getStatusBgColor(formData.status)}`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {getStatusLargeIcon(formData.status)}
            <h2 className="text-xl font-semibold">
              {agendamentoSelecionado ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(formData.status)} ${getStatusTextColor(formData.status)} border`}>
              {getStatusName(formData.status)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Cliente com busca autocomplete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <div className="relative" ref={dropdownClienteRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10 pr-10"
                  placeholder="Digite o nome, telefone ou email do cliente..."
                  value={buscaCliente}
                  onChange={(e) => {
                    setBuscaCliente(e.target.value);
                    setMostrarDropdownCliente(true);
                    if (e.target.value === '') {
                      setFormData({ ...formData, clienteId: '' });
                    }
                  }}
                  onFocus={() => setMostrarDropdownCliente(true)}
                />
                {buscaCliente && (
                  <button
                    onClick={limparCliente}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {mostrarDropdownCliente && clientesFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {clientesFiltrados.map(cliente => (
                    <div
                      key={cliente.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      onClick={() => selecionarCliente(cliente)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{cliente.nome}</div>
                          <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                            {cliente.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {cliente.telefone}
                              </span>
                            )}
                            {cliente.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {cliente.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {mostrarDropdownCliente && buscaCliente && clientesFiltrados.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">Nenhum cliente encontrado</p>
                  <button
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                    onClick={() => alert('Função de cadastrar novo cliente em breve')}
                  >
                    + Cadastrar novo cliente
                  </button>
                </div>
              )}
            </div>
            
            {formData.clienteId && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <User className="w-3 h-3" />
                Cliente selecionado: {buscaCliente}
              </div>
            )}
          </div>

          {/* Serviço com busca autocomplete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serviço *
            </label>
            <div className="relative" ref={dropdownServicoRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10 pr-10"
                  placeholder="Digite o nome do serviço..."
                  value={buscaServico}
                  onChange={(e) => {
                    setBuscaServico(e.target.value);
                    setMostrarDropdownServico(true);
                    if (e.target.value === '') {
                      setFormData({ ...formData, servicoId: '' });
                      setServicoSelecionado(null);
                    }
                  }}
                  onFocus={() => setMostrarDropdownServico(true)}
                />
                {buscaServico && (
                  <button
                    onClick={limparServico}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {mostrarDropdownServico && servicosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {servicosFiltrados.map(servico => (
                    <div
                      key={servico.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      onClick={() => selecionarServico(servico)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{servico.nome}</div>
                          <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                            {servico.categoria && (
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">📂</span>
                                {servico.categoria}
                              </span>
                            )}
                            {servico.duracao_minutos && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {servico.duracao_minutos} min
                              </span>
                            )}
                            <span className="font-medium text-green-600">
                              {formatarPreco(servico.preco)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {mostrarDropdownServico && buscaServico && servicosFiltrados.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">Nenhum serviço encontrado</p>
                  <button
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                    onClick={() => alert('Função de cadastrar novo serviço em breve')}
                  >
                    + Cadastrar novo serviço
                  </button>
                </div>
              )}
            </div>
            
            {formData.servicoId && servicoSelecionado && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-2">
                <Scissors className="w-3 h-3" />
                <span>Serviço selecionado: {buscaServico}</span>
                <span className="text-blue-600 font-medium">
                  {formatarPreco(servicoSelecionado.preco)}
                </span>
              </div>
            )}
          </div>

          {/* Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional *
            </label>
            <select 
              className={`input-field ${dadosDoClique ? 'border-green-500 bg-green-50' : ''}`}
              value={formData.profissionalId}
              onChange={handleProfissionalChange}
            >
              <option value="">Selecione um profissional</option>
              {profissionais.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.nome}</option>
              ))}
            </select>
            {dadosDoClique && profissionalDoClique && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                Profissional selecionado automaticamente do calendário: {profissionalDoClique.nome}
              </p>
            )}
          </div>

          {/* Informações de Preço e Comissão */}
          {servicoSelecionado && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Informações do Serviço
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor do Serviço</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatarPreco(servicoSelecionado.preco)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comissão ({percentualComissao}%)</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatarPreco(comissaoCalculada)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Configurado nas configurações
                  </p>
                </div>
              </div>
              {servicoSelecionado.duracao_minutos && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duração estimada: {servicoSelecionado.duracao_minutos} minutos
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Data e Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input 
                type="date" 
                className="input-field"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário *
              </label>
              <select
                className={`input-field ${dadosDoClique ? 'border-green-500 bg-green-50' : ''}`}
                value={formData.hora || ''}
                onChange={handleHorarioChange}
                required
              >
                <option value="">Selecione um horário</option>
                {horariosDoDia.map(horario => (
                  <option key={horario} value={horario}>
                    {horario} {dadosDoClique && horario === horarioInicial ? '✓ (Selecionado)' : ''}
                  </option>
                ))}
              </select>
              {loading && (
                <p className="text-xs text-gray-500 mt-1">Carregando horários...</p>
              )}
              {config && config.intervaloMinutos && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Intervalo de {config.intervaloMinutos} minutos entre horários
                </p>
              )}
              {dadosDoClique && horarioInicial && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Horário selecionado automaticamente do calendário: {horarioInicial}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select 
              className={`input-field ${getStatusTextColor(formData.status)}`}
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="agendado">📅 Agendado (Azul)</option>
              <option value="confirmado">✅ Confirmado (Verde)</option>
              <option value="em_atendimento">⏳ Em Atendimento (Amarelo)</option>
              <option value="concluido">🎉 Concluído (Cinza)</option>
              <option value="cancelado">❌ Cancelado (Vermelho)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Agendado: Azul | Confirmado: Verde | Em Atendimento: Amarelo | Concluído: Cinza | Cancelado: Vermelho
            </p>
          </div>

          {/* Seção de Pagamento */}
          {mostrarPagamento && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
              <h3 className="font-medium text-green-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Registrar Pagamento
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  className="input-field"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {formasPagamento.map(fp => (
                    <option key={fp.id} value={fp.id}>{fp.nome}</option>
                  ))}
                </select>
              </div>

              {(formaPagamento === 'debito' || formaPagamento === 'credito' || formaPagamento === 'credito_parcelado') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      Bandeira do Cartão *
                    </label>
                    <select
                      className="input-field"
                      value={bandeiraCartao}
                      onChange={(e) => setBandeiraCartao(e.target.value)}
                    >
                      <option value="">Selecione a bandeira...</option>
                      {bandeirasCartao.map(bandeira => (
                        <option key={bandeira} value={bandeira}>{bandeira}</option>
                      ))}
                    </select>
                  </div>

                  {formaPagamento === 'credito_parcelado' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Parcelas *
                      </label>
                      <select
                        className="input-field"
                        value={parcelas}
                        onChange={(e) => setParcelas(parseInt(e.target.value))}
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                          <option key={num} value={num}>{num}x</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="bg-white p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Valor Total:</span>
                  <span className="font-bold">
                    {formatarPreco(servicoSelecionado?.preco || 0)}
                  </span>
                </div>
                {formaPagamento === 'credito_parcelado' && parcelas > 1 && (
                  <div className="flex justify-between text-sm mt-1 text-gray-600">
                    <span>{parcelas}x de:</span>
                    <span>
                      {formatarPreco((parseFloat(servicoSelecionado?.preco || 0) / parcelas))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea 
              rows="3"
              className="input-field"
              placeholder="Observações sobre o atendimento..."
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            />
          </div>

          {/* Informações adicionais */}
          {agendamentoSelecionado && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-gray-700">Informações do Cliente</h3>
              <p className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {agendamentoSelecionado.cliente_telefone || 'Não informado'}
              </p>
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {agendamentoSelecionado.cliente_email || 'Não informado'}
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          {agendamentoSelecionado && (
            <button 
              onClick={() => onExcluir(agendamentoSelecionado.id)}
              className="btn-danger"
            >
              Excluir
            </button>
          )}
          <button 
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSalvar}
            className="btn-primary"
          >
            {agendamentoSelecionado ? 'Salvar Alterações' : 'Criar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgendamento;
