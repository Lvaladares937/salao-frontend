import React from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { getStatusColor } from './helpers';

const ListaMobile = ({ dataSelecionada, agendamentos, onEditar, profissionais }) => {
  // Filtrar agendamentos do dia e ordenar por horário
  const agendamentosDoDia = agendamentos
    .filter(ag => ag && ag.data_hora && isSameDay(new Date(ag.data_hora), dataSelecionada))
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

  // Se não houver agendamentos, mostrar mensagem
  if (agendamentosDoDia.length === 0) {
    return (
      <div className="lg:hidden text-center py-8 text-gray-500">
        Nenhum agendamento para hoje
      </div>
    );
  }

  // Função segura para obter a cor do profissional
  const getProfissionalCor = (funcionarioId) => {
    if (!funcionarioId || !profissionais) return 'bg-blue-500';
    const prof = profissionais.find(p => p && p.id === funcionarioId);
    return prof?.cor || 'bg-blue-500';
  };

  // Função segura para obter o avatar do profissional
  const getProfissionalAvatar = (funcionarioId) => {
    if (!funcionarioId || !profissionais) return '??';
    const prof = profissionais.find(p => p && p.id === funcionarioId);
    
    if (prof?.avatar) return prof.avatar;
    if (prof?.nome) return prof.nome.substring(0, 2).toUpperCase();
    return '??';
  };

  // Função para formatar valor monetário com segurança
  const formatarValor = (valor) => {
    if (valor === null || valor === undefined) return '0,00';
    
    // Converter para número se for string
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    // Verificar se é um número válido
    if (isNaN(numero)) return '0,00';
    
    return numero.toFixed(2).replace('.', ',');
  };

  // Função para obter a duração com segurança
  const getDuracao = (ag) => {
    return ag.servico_duracao || ag.duracao || 30;
  };

  // Função para obter o valor com segurança
  const getValor = (ag) => {
    return ag.valor || ag.servico_preco || 0;
  };

  return (
    <div className="lg:hidden space-y-3">
      <h3 className="font-semibold text-gray-700 px-1">
        Agendamentos do dia {format(dataSelecionada, 'dd/MM/yyyy')}
      </h3>
      
      {agendamentosDoDia.map(ag => (
        <div 
          key={ag.id}
          className={`p-4 rounded-lg border-2 ${getStatusColor(ag?.status)} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => onEditar(ag)}
        >
          {/* Cabeçalho com cliente e horário */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar do profissional */}
              <div className={`w-10 h-10 rounded-full ${getProfissionalCor(ag.funcionario_id)} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                {getProfissionalAvatar(ag.funcionario_id)}
              </div>
              
              {/* Informações do cliente */}
              <div>
                <p className="font-medium text-gray-900">
                  {ag.cliente_nome || 'Cliente não identificado'}
                </p>
                <p className="text-sm text-gray-600">
                  {ag.servico_nome || 'Serviço não especificado'}
                </p>
              </div>
            </div>
            
            {/* Horário */}
            <span className="text-sm font-semibold bg-white bg-opacity-50 px-3 py-1 rounded-full">
              {ag.data_hora ? format(new Date(ag.data_hora), 'HH:mm') : '--:--'}
            </span>
          </div>
          
          {/* Detalhes do agendamento */}
          <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getDuracao(ag)} min
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              R$ {formatarValor(getValor(ag))}
            </span>
            <span className="text-xs uppercase px-2 py-1 bg-gray-200 rounded-full">
              {ag.status || 'agendado'}
            </span>
          </div>
          
          {/* Observações (se houver) */}
          {ag.observacoes && (
            <div className="mt-3 text-sm text-gray-500 italic border-t border-gray-200 pt-2">
              📝 {ag.observacoes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListaMobile;