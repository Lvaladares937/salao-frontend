import React, { useRef, useState, useEffect } from 'react';
import { Clock, Plus, ChevronLeft, ChevronRight, User, AlertCircle, AlertTriangle } from 'lucide-react';
import { isSameDay, format } from 'date-fns';
import { getStatusColor } from './helpers';
import { useConfiguracoesHorarios } from '../../hooks/useConfiguracoesHorarios';
import { useAuth } from '../../contexts/AuthContext';

// 🔥 FUNÇÃO PARA EXTRAIR HORA - CONVERTER UTC PARA LOCAL
const extrairHoraCorreta = (dataHoraStr) => {
  if (!dataHoraStr) return null;
  
  const match = dataHoraStr.match(/T(\d{2}):(\d{2})/);
  if (match) {
    let horaUTC = parseInt(match[1]);
    let minuto = parseInt(match[2]);
    
    let horaLocal = horaUTC - 3;
    if (horaLocal < 0) {
      horaLocal = horaLocal + 24;
    }
    
    return `${horaLocal.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  }
  
  return null;
};

// 🔥 FUNÇÃO PARA CONVERTER HORA STRING PARA MINUTOS
const horaParaMinutos = (horaStr) => {
  const [hora, minuto] = horaStr.split(':').map(Number);
  return hora * 60 + minuto;
};

// 🔥 FUNÇÃO PARA FORMATAR DURAÇÃO
const formatarDuracao = (minutos) => {
  if (!minutos || minutos <= 0) return 'N/A';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins}min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h${mins}`;
};

// 🔥 FUNÇÃO PARA FORMATAR DATA
const formatarData = (dataStr) => {
  if (!dataStr) return '';
  const data = new Date(dataStr);
  return format(data, 'dd/MM/yyyy');
};

// 🔥 FUNÇÃO PARA FORMATAR VALOR COM PERSONALIZADO
const formatarValorComPersonalizado = (agendamento) => {
  const valor = agendamento.valor_personalizado || agendamento.valor;
  if (valor === null || valor === undefined) return '0,00';
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(numero)) return '0,00';
  return numero.toFixed(2).replace('.', ',');
};

// 🔥 FUNÇÃO PARA VERIFICAR SE TEM VALOR PERSONALIZADO
const temValorPersonalizado = (agendamento) => {
  return agendamento.valor_personalizado && agendamento.valor_personalizado !== agendamento.valor;
};

// 🔥 FUNÇÃO PARA CORES BASEADAS NA DURAÇÃO
const getDuracaoColors = (duracaoMinutos) => {
  if (!duracaoMinutos) return { 
    bg: 'bg-blue-500', 
    bgLight: 'bg-blue-100', 
    border: 'border-blue-500', 
    text: 'text-blue-700',
    gradient: 'from-blue-400 to-indigo-500',
    icon: '🔵'
  };
  
  if (duracaoMinutos <= 30) {
    return { 
      bg: 'bg-emerald-500', 
      bgLight: 'bg-emerald-100', 
      border: 'border-emerald-500', 
      text: 'text-emerald-700',
      gradient: 'from-emerald-400 to-green-500',
      icon: '🟢',
      label: 'Rápido'
    };
  } else if (duracaoMinutos <= 60) {
    return { 
      bg: 'bg-blue-500', 
      bgLight: 'bg-blue-100', 
      border: 'border-blue-500', 
      text: 'text-blue-700',
      gradient: 'from-blue-400 to-indigo-500',
      icon: '🔵',
      label: 'Médio'
    };
  } else if (duracaoMinutos <= 90) {
    return { 
      bg: 'bg-yellow-500', 
      bgLight: 'bg-yellow-100', 
      border: 'border-yellow-500', 
      text: 'text-yellow-700',
      gradient: 'from-yellow-400 to-amber-500',
      icon: '🟡',
      label: 'Longo'
    };
  } else if (duracaoMinutos <= 120) {
    return { 
      bg: 'bg-orange-500', 
      bgLight: 'bg-orange-100', 
      border: 'border-orange-500', 
      text: 'text-orange-700',
      gradient: 'from-orange-400 to-red-500',
      icon: '🟠',
      label: 'Muito Longo'
    };
  } else {
    return { 
      bg: 'bg-red-500', 
      bgLight: 'bg-red-100', 
      border: 'border-red-500', 
      text: 'text-red-700',
      gradient: 'from-red-400 to-rose-600',
      icon: '🔴',
      label: 'Extenso'
    };
  }
};

// 🔥 COMPONENTE DE MODAL DE CONFIRMAÇÃO
const ModalConfirmacaoSobreposicao = ({ show, onConfirm, onCancel, agendamentoConflitante, novoHorario, dataSelecionada }) => {
  if (!show) return null;
  
  const dataFormatada = formatarData(dataSelecionada);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 text-yellow-600 mb-4">
          <AlertTriangle className="w-8 h-8" />
          <h3 className="text-lg font-semibold">Conflito de Horário</h3>
        </div>
        
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700 mb-2">
            Este horário está dentro do atendimento de:
          </p>
          <p className="font-medium text-gray-900">
            {agendamentoConflitante?.cliente_nome || 'Cliente'}
          </p>
          <p className="text-sm text-gray-600">
            {agendamentoConflitante?.servico_nome} - {formatarDuracao(agendamentoConflitante?.servico_duracao)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Data: {dataFormatada} | Horário: {agendamentoConflitante?.horaInicio} até {agendamentoConflitante?.horaFim}
          </p>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Deseja <strong>forçar</strong> o agendamento para <strong>{dataFormatada} às {novoHorario}</strong> mesmo assim?
          Isso pode causar sobreposição de atendimentos.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Forçar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};

const TimelineAgendamentos = ({ 
  dataSelecionada, 
  agendamentos, 
  onEditar, 
  onNovo,
  profissionais,
  filtroProfissional,
  filtroServico
}) => {
  const { usuario } = useAuth();
  const isFuncionario = usuario?.nivel === 'funcionario';
  
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAgendamento, setPendingAgendamento] = useState(null);
  const [agendamentoConflitante, setAgendamentoConflitante] = useState(null);
  
  const { horariosDisponiveis, loading } = useConfiguracoesHorarios();

  const ordenarProfissionais = (lista) => {
    const ordemDesejada = [18, 12, 13, 16, 17, 14, 15, 6, 1, 10];
    
    return [...lista].sort((a, b) => {
      const indexA = ordemDesejada.indexOf(a.id);
      const indexB = ordemDesejada.indexOf(b.id);
      
      if (indexA === -1 && indexB === -1) return a.nome.localeCompare(b.nome);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  const profissionaisFiltrados = React.useMemo(() => {
    if (!profissionais) return [];
    
    let lista = [...profissionais];
    
    if (isFuncionario && usuario?.funcionarioId) {
      lista = lista.filter(prof => prof.id === usuario.funcionarioId);
    }
    
    if (!isFuncionario) {
      lista = ordenarProfissionais(lista);
    }
    
    return lista;
  }, [profissionais, isFuncionario, usuario]);

  const horarios = React.useMemo(() => {
    if (loading || !horariosDisponiveis?.length) {
      return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
              '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
              '17:00', '17:30', '18:00', '18:30', '19:00'];
    }
    return horariosDisponiveis;
  }, [horariosDisponiveis, loading]);

  const getAgendamentosPorProfissional = React.useMemo(() => {
    const mapa = new Map();
    
    if (!agendamentos) return mapa;
    
    agendamentos.forEach(ag => {
      if (!isSameDay(new Date(ag.data_hora), dataSelecionada)) return;
      
      if (filtroProfissional && filtroProfissional !== 'todos') {
        if (ag.funcionario_id !== parseInt(filtroProfissional)) return;
      }
      if (filtroServico && filtroServico !== 'todos') {
        if (ag.servico_id !== parseInt(filtroServico)) return;
      }
      if (isFuncionario && usuario?.funcionarioId) {
        if (ag.funcionario_id !== usuario.funcionarioId) return;
      }
      
      const horaInicio = extrairHoraCorreta(ag.data_hora);
      if (!horaInicio) return;
      
      const duracao = ag.servico_duracao || 60;
      const horaInicioMinutos = horaParaMinutos(horaInicio);
      const horaFimMinutos = horaInicioMinutos + duracao;
      
      const horaFimHoras = Math.floor(horaFimMinutos / 60);
      const horaFimMin = horaFimMinutos % 60;
      const horaFim = `${horaFimHoras.toString().padStart(2, '0')}:${horaFimMin.toString().padStart(2, '0')}`;
      
      if (!mapa.has(ag.funcionario_id)) {
        mapa.set(ag.funcionario_id, []);
      }
      
      mapa.get(ag.funcionario_id).push({
        ...ag,
        horaInicio,
        horaFim,
        horaInicioMinutos,
        horaFimMinutos,
        duracao
      });
    });
    
    return mapa;
  }, [agendamentos, dataSelecionada, filtroProfissional, filtroServico, isFuncionario, usuario]);

  const getAgendamentoNoHorario = (profissionalId, horario) => {
    const agendamentosProf = getAgendamentosPorProfissional.get(profissionalId) || [];
    const horarioMinutos = horaParaMinutos(horario);
    
    return agendamentosProf.find(ag => {
      return horarioMinutos >= ag.horaInicioMinutos && horarioMinutos < ag.horaFimMinutos;
    });
  };

  const isPrimeiroHorario = (profissionalId, horario) => {
    const agendamento = getAgendamentoNoHorario(profissionalId, horario);
    if (!agendamento) return false;
    
    return horario === agendamento.horaInicio;
  };

  const handleAgendarClick = (profissionalId, horario) => {
    const agendamentoConflito = getAgendamentoNoHorario(profissionalId, horario);
    
    if (agendamentoConflito) {
      setAgendamentoConflitante(agendamentoConflito);
      setPendingAgendamento({ profissionalId, horario });
      setShowConfirmModal(true);
    } else {
      console.log('🕐 CLIQUE NORMAL - HORÁRIO:', horario);
      onNovo?.(profissionalId, horario);
    }
  };

  const handleConfirmForcarAgendamento = () => {
    if (pendingAgendamento) {
      console.log('⚠️ FORÇANDO AGENDAMENTO - HORÁRIO:', pendingAgendamento.horario);
      onNovo?.(
        pendingAgendamento.profissionalId, 
        pendingAgendamento.horario
      );
    }
    setShowConfirmModal(false);
    setPendingAgendamento(null);
    setAgendamentoConflitante(null);
  };

  const handleCancelForcarAgendamento = () => {
    setShowConfirmModal(false);
    setPendingAgendamento(null);
    setAgendamentoConflitante(null);
  };

  // Funções de scroll
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.removeProperty('user-select');
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.removeProperty('user-select');
      }
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [profissionaisFiltrados]);

  const scrollLeftHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const scrollRightHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const larguraMinimaColuna = 320;
  const larguraTotal = profissionaisFiltrados.length * larguraMinimaColuna + 100;

  if (!profissionaisFiltrados || profissionaisFiltrados.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">
          {isFuncionario 
            ? 'Você não está vinculado a nenhum profissional' 
            : 'Nenhum profissional cadastrado'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
        {profissionaisFiltrados.length > 1 && showLeftArrow && (
          <button
            onClick={scrollLeftHandler}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50 transition-all border border-gray-200 ml-2"
            style={{ marginTop: '-20px' }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        {profissionaisFiltrados.length > 1 && showRightArrow && (
          <button
            onClick={scrollRightHandler}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50 transition-all border border-gray-200 mr-2"
            style={{ marginTop: '-20px' }}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 cursor-grab active:cursor-grabbing"
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ 
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            userSelect: 'none'
          }}
        >
          <div style={{ minWidth: `${larguraTotal}px` }}>
            <div 
              className="grid bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 sticky top-0"
              style={{ 
                gridTemplateColumns: `100px repeat(${profissionaisFiltrados.length}, minmax(${larguraMinimaColuna}px, 1fr))` 
              }}
            >
              <div className="p-4 font-medium text-gray-600 sticky left-0 bg-gradient-to-r from-gray-50 to-white z-10 border-r border-gray-200">
                Horário
              </div>
              {profissionaisFiltrados.map(prof => (
                <div 
                  key={prof.id} 
                  className="p-4 flex items-center gap-3 border-l border-gray-200 min-w-[320px] bg-white hover:bg-gray-50 transition-colors"
                  style={{ pointerEvents: 'none' }}
                >
                  <div className={`w-10 h-10 rounded-full ${prof.cor || 'bg-blue-500'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                    {prof.avatar || prof.nome?.substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{prof.nome}</p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {isFuncionario ? 'Você' : (prof.especialidade || 'Profissional')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-100">
              {horarios.map((hora, index) => (
                <div 
                  key={index} 
                  className="grid hover:bg-gray-50/50 transition-colors"
                  style={{ 
                    gridTemplateColumns: `100px repeat(${profissionaisFiltrados.length}, minmax(${larguraMinimaColuna}px, 1fr))` 
                  }}
                >
                  <div className="p-4 text-sm font-medium text-gray-600 border-r border-gray-200 sticky left-0 bg-white z-10">
                    {hora}
                  </div>

                  {profissionaisFiltrados.map((prof) => {
                    const agendamento = getAgendamentoNoHorario(prof.id, hora);
                    const isPrimeiro = isPrimeiroHorario(prof.id, hora);
                    
                    if (agendamento) {
                      const duracao = agendamento.duracao;
                      const coresStatus = getStatusColor(agendamento.status);
                      const coresDuracao = getDuracaoColors(duracao);
                      const valorFormatado = formatarValorComPersonalizado(agendamento);
                      const temPersonalizado = temValorPersonalizado(agendamento);
                      
                      if (isPrimeiro) {
                        return (
                          <div 
                            key={prof.id}
                            className={`
                              p-3 border-l border-gray-200 cursor-pointer min-w-[320px] transition-all relative overflow-hidden
                              ${coresStatus}
                              hover:shadow-lg hover:scale-[1.02] hover:z-20
                            `}
                            onClick={() => onEditar?.(agendamento)}
                            style={{ pointerEvents: 'auto' }}
                          >
                            <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-r ${coresDuracao.gradient}`} />
                            
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{coresDuracao.icon}</span>
                                  <p className="font-semibold text-sm truncate">
                                    {agendamento.cliente_nome || 'Cliente'}
                                  </p>
                                </div>
                                
                                <p className="text-xs mt-1 text-gray-600 truncate font-medium">
                                  {agendamento.servico_nome || 'Serviço'}
                                </p>
                                
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-60">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatarDuracao(duracao)}</span>
                                </div>
                                
                                <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Clique para editar</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex flex-col items-end">
                                  {temPersonalizado && (
                                    <span className="text-xs text-gray-400 line-through">
                                      R$ {formatarValorComPersonalizado({...agendamento, valor_personalizado: null})}
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded-full font-bold shadow-sm ${temPersonalizado ? 'bg-purple-100 text-purple-700' : 'bg-white bg-opacity-70'}`}>
                                    R$ {valorFormatado}
                                    {temPersonalizado && <span className="ml-1 text-purple-600">✨</span>}
                                  </span>
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white bg-opacity-60 ${coresDuracao.text}`}>
                                  {coresDuracao.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={prof.id}
                            className={`
                              border-l border-gray-200 min-w-[320px] transition-all relative
                              ${coresStatus}
                              group
                            `}
                            style={{ 
                              pointerEvents: 'auto',
                              height: '100%',
                              minHeight: '80px'
                            }}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r ${coresDuracao.gradient} opacity-20`} />
                            
                            <div 
                              className="relative h-full flex items-center justify-center cursor-pointer z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAgendarClick(prof.id, hora);
                              }}
                            >
                              <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 transition-all transform hover:scale-110">
                                  <Plus className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-medium text-yellow-700 bg-white px-2 py-0.5 rounded-full shadow">
                                  Forçar Agendamento
                                </span>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                                <div className="text-xs text-gray-500 flex flex-col items-center gap-1">
                                  <Clock className="w-4 h-4 opacity-50" />
                                  <span className="text-[10px]">Ocupado</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }

                    return (
                      <div 
                        key={prof.id} 
                        className="p-4 border-l border-gray-200 cursor-pointer hover:bg-gray-100 transition-all min-w-[320px] group relative"
                        onClick={() => handleAgendarClick(prof.id, hora)}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="h-full flex flex-col items-center justify-center gap-2">
                          <button className="text-gray-300 group-hover:text-blue-600 transition-all transform group-hover:scale-110">
                            <Plus className="w-6 h-6" />
                          </button>
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Agendar
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="font-medium text-gray-700">Duração dos Serviços:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-600">≤30min (Rápido)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">31-60min (Médio)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">61-90min (Longo)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">91-120min (Muito Longo)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">120min+ (Extenso)</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-purple-600">✨</span>
              <span className="text-gray-600">Valor personalizado</span>
            </div>
          </div>
        </div>

        {profissionaisFiltrados.length > 1 && (
          <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-100 bg-gray-50/50">
            ← Arraste para o lado para ver mais profissionais | Passe o mouse sobre horários ocupados para forçar agendamento →
          </div>
        )}

        {isFuncionario && profissionaisFiltrados.length === 1 && (
          <div className="text-xs text-blue-600 text-center py-2 border-t border-gray-100 bg-blue-50">
            ✓ Mostrando apenas seus agendamentos
          </div>
        )}
      </div>

      <ModalConfirmacaoSobreposicao
        show={showConfirmModal}
        onConfirm={handleConfirmForcarAgendamento}
        onCancel={handleCancelForcarAgendamento}
        agendamentoConflitante={agendamentoConflitante}
        novoHorario={pendingAgendamento?.horario}
        dataSelecionada={dataSelecionada}
      />
    </>
  );
};

export default TimelineAgendamentos;
