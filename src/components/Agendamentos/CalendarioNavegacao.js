import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { diasSemana } from './constants';
import { useAuth } from '../../contexts/AuthContext'; // 👈 IMPORTAR useAuth

const CalendarioNavegacao = ({ dataSelecionada, setDataSelecionada }) => {
  const { usuario } = useAuth(); // 👈 PEGAR USUÁRIO LOGADO
  const isFuncionario = usuario?.nivel === 'funcionario';

  const navigateDate = (direction) => {
    if (direction === 'prev') {
      setDataSelecionada(subDays(dataSelecionada, 1));
    } else {
      setDataSelecionada(addDays(dataSelecionada, 1));
    }
  };

  // Gerar dias do mini calendário
  const renderMiniCalendario = () => {
    const dias = [];
    const primeiroDiaDoMes = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1);
    const ultimoDiaDoMes = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth() + 1, 0);
    const diasNoMes = ultimoDiaDoMes.getDate();
    const primeiroDiaSemana = primeiroDiaDoMes.getDay();

    for (let i = 0; i < 42; i++) {
      const dia = i - primeiroDiaSemana + 1;
      const dataAtual = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dia);
      const isMesAtual = dia > 0 && dia <= diasNoMes;
      const isHoje = isSameDay(dataAtual, new Date());
      const isSelecionado = isSameDay(dataAtual, dataSelecionada);

      dias.push(
        <button
          key={i}
          onClick={() => isMesAtual && setDataSelecionada(dataAtual)}
          className={`
            py-2 rounded-lg text-sm transition-colors
            ${!isMesAtual ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
            ${isHoje ? 'bg-blue-100 text-blue-600 font-bold' : ''}
            ${isSelecionado ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          `}
        >
          {isMesAtual ? dia : ''}
        </button>
      );
    }
    return dias;
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* 👇 TÍTULO DINÂMICO */}
          <h2 className="text-xl font-semibold">
            {isFuncionario ? 'Meus Agendamentos' : format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          
          <button 
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* 👇 BOTÃO HOJE - MANTÉM */}
        <button 
          onClick={() => setDataSelecionada(new Date())}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Hoje
        </button>
      </div>

      {/* Mini calendário - sempre visível */}
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-sm">
        {diasSemana.map((dia, i) => (
          <div key={i} className="font-medium text-gray-500 py-2">{dia}</div>
        ))}
        {renderMiniCalendario()}
      </div>

      {/* 👇 INFORMAÇÃO DO FUNCIONÁRIO LOGADO (só para funcionário) */}
      {isFuncionario && usuario && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <span className="font-semibold">👤 Você está logado como:</span>
            {usuario.nome}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Mostrando apenas seus agendamentos
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarioNavegacao;