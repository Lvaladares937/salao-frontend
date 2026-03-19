import { isSameDay } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import React from 'react';

// Cores baseadas no status
export const getStatusColor = (status) => {
  switch(status) {
    case 'confirmado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'agendado':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'em_atendimento':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelado':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'concluido':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Ícone baseado no status
export const getStatusIcon = (status) => {
  switch(status) {
    case 'confirmado':
      return <CheckCircle className="w-4 h-4" />;
    case 'agendado':
      return <Clock className="w-4 h-4" />;
    case 'em_atendimento':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

// Filtrar agendamentos por data
export const filtrarPorData = (agendamentos, data) => {
  return agendamentos.filter(ag => isSameDay(ag.data, data));
};

// Filtrar agendamentos por profissional e serviço
export const filtrarAgendamentos = (agendamentos, filtroProfissional, filtroServico) => {
  return agendamentos.filter(ag => {
    if (filtroProfissional !== 'todos' && ag.profissional.id !== parseInt(filtroProfissional)) return false;
    if (filtroServico !== 'todos' && ag.servico.id !== parseInt(filtroServico)) return false;
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