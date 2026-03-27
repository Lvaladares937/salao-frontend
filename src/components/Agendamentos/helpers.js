import { isSameDay } from 'date-fns';
import { CheckCircle, Clock, AlertCircle, XCircle, CalendarCheck, Scissors } from 'lucide-react';
import React from 'react';

// 🔥 CORES BASEADAS NO STATUS (para o calendário/timeline)
export const getStatusColor = (status) => {
  switch(status) {
    case 'confirmado':
      return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    case 'agendado':
      return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
    case 'em_atendimento':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
    case 'concluido':
      return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
    case 'cancelado':
      return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
  }
};

// 🔥 CORES DO BADGE (para o card do agendamento)
export const getStatusBadgeColor = (status) => {
  switch(status) {
    case 'confirmado':
      return 'bg-green-500 text-white';
    case 'agendado':
      return 'bg-blue-500 text-white';
    case 'em_atendimento':
      return 'bg-yellow-500 text-white';
    case 'concluido':
      return 'bg-gray-500 text-white';
    case 'cancelado':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

// 🔥 CORES DO TEXTO (para o modal)
export const getStatusTextColor = (status) => {
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

// 🔥 CORES DO BACKGROUND (para o modal)
export const getStatusBgColor = (status) => {
  switch(status) {
    case 'confirmado':
      return 'bg-green-50';
    case 'agendado':
      return 'bg-blue-50';
    case 'em_atendimento':
      return 'bg-yellow-50';
    case 'concluido':
      return 'bg-gray-50';
    case 'cancelado':
      return 'bg-red-50';
    default:
      return 'bg-gray-50';
  }
};

// 🔥 ÍCONE BASEADO NO STATUS
export const getStatusIcon = (status) => {
  switch(status) {
    case 'confirmado':
      return <CheckCircle className="w-4 h-4" />;
    case 'agendado':
      return <Clock className="w-4 h-4" />;
    case 'em_atendimento':
      return <Scissors className="w-4 h-4" />;
    case 'concluido':
      return <CalendarCheck className="w-4 h-4" />;
    case 'cancelado':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

// 🔥 ÍCONE GRANDE (para o modal)
export const getStatusLargeIcon = (status) => {
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

// 🔥 NOME LEGÍVEL DO STATUS
export const getStatusName = (status) => {
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

// Filtrar agendamentos por data
export const filtrarPorData = (agendamentos, data) => {
  return agendamentos.filter(ag => isSameDay(new Date(ag.data_hora), data));
};

// Filtrar agendamentos por profissional e serviço
export const filtrarAgendamentos = (agendamentos, filtroProfissional, filtroServico) => {
  return agendamentos.filter(ag => {
    if (filtroProfissional !== 'todos' && ag.funcionario_id !== parseInt(filtroProfissional)) return false;
    if (filtroServico !== 'todos' && ag.servico_id !== parseInt(filtroServico)) return false;
    return true;
  });
};

// Calcular estatísticas do dia
export const calcularEstatisticas = (agendamentos, data) => {
  const agendamentosDoDia = filtrarPorData(agendamentos, data);
  return {
    total: agendamentosDoDia.length,
    confirmados: agendamentosDoDia.filter(a => a.status === 'confirmado').length,
    agendados: agendamentosDoDia.filter(a => a.status === 'agendado').length,
    emAtendimento: agendamentosDoDia.filter(a => a.status === 'em_atendimento').length,
    concluidos: agendamentosDoDia.filter(a => a.status === 'concluido').length,
    cancelados: agendamentosDoDia.filter(a => a.status === 'cancelado').length
  };
};
