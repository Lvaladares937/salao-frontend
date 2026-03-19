import React from 'react';
import { 
  Calendar, Clock, DollarSign, TrendingUp, Star,
  Target, ChevronRight, User, AlertCircle
} from 'lucide-react';
import { useDashboardFuncionario } from '../../hooks/useDashboardFuncionario';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardFuncionario = () => {
  const {
    loading,
    agendamentosHoje,
    proximosAgendamentos,
    resumoMes,
    metas,
    nomeFuncionario
  } = useDashboardFuncionario();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando seu dashboard...</span>
      </div>
    );
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarHora = (dataHora) => {
    try {
      return format(parseISO(dataHora), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  const formatarData = (dataHora) => {
    try {
      return format(parseISO(dataHora), "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmado': 'bg-green-100 text-green-800',
      'agendado': 'bg-yellow-100 text-yellow-800',
      'concluido': 'bg-blue-100 text-blue-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Olá, {nomeFuncionario}! 👋</h1>
            <p className="text-blue-100">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agendamentos</p>
              <p className="text-3xl font-bold text-gray-900">{resumoMes.totalAgendamentos}</p>
              <p className="text-xs text-gray-500">no mês</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Gerado</p>
              <p className="text-3xl font-bold text-gray-900">{formatarMoeda(resumoMes.totalValor)}</p>
              <p className="text-xs text-gray-500">no mês</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Comissões</p>
              <p className="text-3xl font-bold text-gray-900">{formatarMoeda(resumoMes.totalComissao)}</p>
              <p className="text-xs text-gray-500">a receber</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média por dia</p>
              <p className="text-3xl font-bold text-gray-900">{formatarMoeda(resumoMes.mediaPorDia)}</p>
              <p className="text-xs text-gray-500">em atendimentos</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Meta de Agendamentos</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{metas.agendamentosAtual} de 50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${metas.percentualAgendamentos}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Meta de Valor</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{formatarMoeda(metas.valorAtual)} de R$ 5.000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all"
                style={{ width: `${metas.percentualValor}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos de Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Agendamentos de Hoje
          </h3>
          {agendamentosHoje.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentosHoje.map(ag => (
                <div key={ag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{ag.cliente_nome}</p>
                    <p className="text-sm text-gray-600">{ag.servico_nome} - {formatarHora(ag.data_hora)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ag.status)}`}>
                    {ag.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos Agendamentos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Próximos Agendamentos
          </h3>
          {proximosAgendamentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum agendamento nos próximos dias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximosAgendamentos.map(ag => (
                <div key={ag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{ag.cliente_nome}</p>
                    <p className="text-sm text-gray-600">{ag.servico_nome}</p>
                    <p className="text-xs text-gray-500">{formatarData(ag.data_hora)} às {formatarHora(ag.data_hora)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dica do dia */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-4 text-white">
        <p className="text-sm">
          <strong>💡 Dica:</strong> Confirme os agendamentos com os clientes 1 hora antes do horário!
        </p>
      </div>
    </div>
  );
};

export default DashboardFuncionario;