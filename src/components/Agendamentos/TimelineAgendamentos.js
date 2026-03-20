import React, { useRef, useState, useEffect } from 'react';
import { Clock, Plus, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { getStatusColor } from './helpers';
import { useConfiguracoesHorarios } from '../../hooks/useConfiguracoesHorarios';
import { useAuth } from '../../contexts/AuthContext';

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
  
  const { horariosDisponiveis, loading } = useConfiguracoesHorarios();

  // LOG PARA DEBUG
  useEffect(() => {
    console.log('📊 Timeline - Profissionais recebidos:', profissionais?.map(p => ({ id: p.id, nome: p.nome })));
    console.log('👤 Timeline - Usuário:', { 
      isFuncionario, 
      funcionarioId: usuario?.funcionarioId,
      nome: usuario?.nome 
    });
    console.log('📅 Timeline - Agendamentos recebidos:', agendamentos?.length);
    if (agendamentos?.length > 0) {
      console.log('📅 Timeline - Primeiro agendamento:', {
        id: agendamentos[0].id,
        data_hora: agendamentos[0].data_hora,
        profissional_id: agendamentos[0].funcionario_id
      });
    }
  }, [profissionais, isFuncionario, usuario, agendamentos]);

  // FILTRO DE PROFISSIONAIS - FORÇADO para funcionário
  const profissionaisFiltrados = React.useMemo(() => {
    if (!profissionais) return [];
    
    if (isFuncionario && usuario?.funcionarioId) {
      // Filtra para garantir que só tem o funcionário logado
      const apenasEu = profissionais.filter(prof => prof.id === usuario.funcionarioId);
      console.log('🔒 Timeline - Profissionais filtrados (só eu):', apenasEu.map(p => p.nome));
      return apenasEu;
    }
    console.log('🔓 Timeline - Todos profissionais:', profissionais.map(p => p.nome));
    return profissionais;
  }, [profissionais, isFuncionario, usuario]);

  // Função segura para formatar valor
  const formatarValor = (valor) => {
    if (valor === null || valor === undefined) return '0,00';
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero)) return '0,00';
    return numero.toFixed(2).replace('.', ',');
  };

  // Aplicar filtros nos agendamentos (SEM FILTRO DE DATA, pois o hook já fez)
  const agendamentosFiltrados = React.useMemo(() => {
    if (!agendamentos) return [];
    
    console.log('🔍 Timeline - Filtrando agendamentos:', {
      total: agendamentos.length,
      isFuncionario,
      filtroProfissional,
      filtroServico
    });
    
    return agendamentos.filter(ag => {
      // Se for funcionário, mostra SÓ os dele
      if (isFuncionario && usuario?.funcionarioId) {
        return ag.funcionario_id === usuario.funcionarioId;
      }
      
      // Para admin/gerente, aplica os filtros normais
      if (filtroProfissional && filtroProfissional !== 'todos') {
        if (ag.funcionario_id !== parseInt(filtroProfissional)) return false;
      }
      if (filtroServico && filtroServico !== 'todos') {
        if (ag.servico_id !== parseInt(filtroServico)) return false;
      }
      return true;
    });
  }, [agendamentos, isFuncionario, usuario, filtroProfissional, filtroServico]);

  // Log dos agendamentos após filtros
  useEffect(() => {
    console.log('✅ Timeline - Agendamentos após filtros:', {
      total: agendamentosFiltrados.length,
      detalhes: agendamentosFiltrados.map(a => ({
        id: a.id,
        data_hora: a.data_hora,
        profissional_id: a.funcionario_id,
        servico: a.servico_nome
      }))
    });
  }, [agendamentosFiltrados]);

  // Usar horários das configurações ou fallback
  const horarios = React.useMemo(() => {
    if (loading || !horariosDisponiveis?.length) {
      return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
              '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
              '17:00', '17:30', '18:00', '18:30', '19:00'];
    }
    return horariosDisponiveis;
  }, [horariosDisponiveis, loading]);

  // Funções para controlar o scroll e as setas
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Eventos de mouse para arrastar
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

  const larguraMinimaColuna = 280;
  const larguraTotal = profissionaisFiltrados.length * larguraMinimaColuna + 100;

  // Se não houver profissionais filtrados
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Setas de navegação - SÓ MOSTRA SE TIVER MAIS DE 1 PROFISSIONAL */}
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

      {/* Container com scroll horizontal e arrasto por mouse */}
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
          {/* Cabeçalho dos profissionais */}
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
                className="p-4 flex items-center gap-3 border-l border-gray-200 min-w-[280px] bg-white hover:bg-gray-50 transition-colors"
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

          {/* Linhas de horário */}
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
                  const agendamento = agendamentosFiltrados.find(ag => {
                    if (!ag?.data_hora) return false;
                    
                    // Converter data_hora para objeto Date
                    let dataAg;
                    try {
                      // Normalizar o formato: substituir espaço por T se necessário
                      let dataStr = ag.data_hora;
                      if (dataStr.includes(' ')) {
                        dataStr = dataStr.replace(' ', 'T');
                      }
                      // Garantir que tem segundos
                      if (dataStr.split(':').length === 2) {
                        dataStr = dataStr + ':00';
                      }
                      dataAg = new Date(dataStr);
                    } catch (e) {
                      console.error('Erro ao parsear data:', ag.data_hora, e);
                      return false;
                    }
                    
                    // Verificar se a data é válida
                    if (isNaN(dataAg.getTime())) {
                      console.error('Data inválida:', ag.data_hora);
                      return false;
                    }
                    
                    // Extrair hora no formato HH:MM
                    const horaAgendamento = dataAg.getHours().toString().padStart(2, '0') + ':' + 
                                           dataAg.getMinutes().toString().padStart(2, '0');
                    
                    // Comparar profissional e horário
                    const match = ag.funcionario_id === prof.id && horaAgendamento === hora;
                    
                    // Log para debug (apenas para os primeiros agendamentos)
                    if (ag.id && (ag.id === 120 || ag.id === 119 || ag.id === 118)) {
                      console.log(`🔍 Comparando agendamento ID ${ag.id}:`, {
                        data_hora_original: ag.data_hora,
                        hora_extraida: horaAgendamento,
                        hora_timeline: hora,
                        profissional_ag: ag.funcionario_id,
                        profissional_prof: prof.id,
                        match
                      });
                    }
                    
                    return match;
                  });

                  if (agendamento) {
                    return (
                      <div 
                        key={prof.id}
                        className={`
                          p-3 border-l border-gray-200 cursor-pointer min-w-[280px] transition-all
                          ${getStatusColor(agendamento.status)}
                          hover:shadow-md hover:scale-[1.02] hover:z-20 relative
                        `}
                        onClick={() => onEditar?.(agendamento)}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">
                              {agendamento.cliente_nome || 'Cliente'}
                            </p>
                            <p className="text-xs mt-1 text-gray-600 truncate">
                              {agendamento.servico_nome || 'Serviço'}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {agendamento.servico_duracao || 30}min
                              </span>
                            </div>
                          </div>
                          <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 font-medium shadow-sm">
                            R$ {formatarValor(agendamento.valor)}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={prof.id} 
                      className="p-4 border-l border-gray-200 cursor-pointer hover:bg-gray-100 transition-all min-w-[280px] group"
                      onClick={() => onNovo?.(prof.id, hora)}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className="h-full flex items-center justify-center">
                        <button className="text-gray-300 group-hover:text-blue-600 transition-all transform group-hover:scale-110">
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de arraste - SÓ MOSTRA SE TIVER MAIS DE 1 PROFISSIONAL */}
      {profissionaisFiltrados.length > 1 && (
        <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-100 bg-gray-50/50">
          ← Arraste para o lado para ver mais profissionais (clique nos agendamentos para editar) →
        </div>
      )}

      {/* Mensagem para funcionário quando está sozinho */}
      {isFuncionario && profissionaisFiltrados.length === 1 && (
        <div className="text-xs text-blue-600 text-center py-2 border-t border-gray-100 bg-blue-50">
          ✓ Mostrando apenas seus agendamentos
        </div>
      )}
    </div>
  );
};

export default TimelineAgendamentos;
