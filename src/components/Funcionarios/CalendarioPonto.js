import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, AlertCircle, Sun, Calendar as CalendarIcon, DollarSign, TrendingUp } from 'lucide-react';
import { diasSemana, statusPonto, statusPontoCores, opcoesDesconto } from './constants';
import { gerarDiasDoMes } from './helpers';

const CalendarioPonto = ({ 
  ano, 
  mes, 
  ponto, 
  onMarcarDia,
  salarioBase = 0 
}) => {
  // Garantir que salarioBase é número
  const salarioBaseNum = Number(salarioBase) || 0;
  
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDescontoModal, setShowDescontoModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [statusSelecionado, setStatusSelecionado] = useState(null);
  const [descontoSelecionado, setDescontoSelecionado] = useState(1);
  
  const dias = gerarDiasDoMes(ano, mes);
  const valorDia = salarioBaseNum > 0 ? salarioBaseNum / dias.length : 0;
  
  // Calcular estatísticas do mês
  const calcularEstatisticas = () => {
    let diasTrabalhados = 0;
    let diasFalta = 0;
    let diasFaltaJustificada = 0;
    let diasFeriado = 0;
    let diasFolga = 0;
    let totalDescontos = 0;
    
    Object.entries(ponto || {}).forEach(([dataStr, info]) => {
      const data = new Date(dataStr);
      if (data.getMonth() === mes && data.getFullYear() === ano) {
        if (info?.status === statusPonto.TRABALHADO) {
          diasTrabalhados++;
        } else if (info?.status === statusPonto.FALTA) {
          diasFalta++;
          if (info?.desconto) {
            totalDescontos += valorDia * info.desconto;
          }
        } else if (info?.status === statusPonto.FALTA_JUSTIFICADA) {
          diasFaltaJustificada++;
        } else if (info?.status === statusPonto.FERIADO) {
          diasFeriado++;
        } else if (info?.status === statusPonto.FOLGA) {
          diasFolga++;
        }
      }
    });
    
    return {
      diasTrabalhados,
      diasFalta,
      diasFaltaJustificada,
      diasFeriado,
      diasFolga,
      totalDescontos,
      salarioFinal: salarioBaseNum - totalDescontos
    };
  };

  const estatisticas = calcularEstatisticas();
  
  useEffect(() => {
    setShowMenu(false);
    setShowDescontoModal(false);
    setDiaSelecionado(null);
  }, [ano, mes]);

  const getStatusTexto = (info) => {
    if (!info) return 'Não definido';
    
    switch(info.status) {
      case statusPonto.TRABALHADO: return 'Trabalhado';
      case statusPonto.FALTA: 
        return info.desconto ? `Falta (${info.desconto * 100}% desconto)` : 'Falta';
      case statusPonto.FALTA_JUSTIFICADA: return 'Falta Justificada';
      case statusPonto.FERIADO: return 'Feriado';
      case statusPonto.FOLGA: return 'Folga';
      default: return 'Não definido';
    }
  };

  const getStatusIcon = (info) => {
    if (!info) return null;
    
    switch(info.status) {
      case statusPonto.TRABALHADO: return <Check className="w-4 h-4" />;
      case statusPonto.FALTA: 
        return info.desconto ? <DollarSign className="w-4 h-4" /> : <X className="w-4 h-4" />;
      case statusPonto.FALTA_JUSTIFICADA: return <AlertCircle className="w-4 h-4" />;
      case statusPonto.FERIADO: return <CalendarIcon className="w-4 h-4" />;
      case statusPonto.FOLGA: return <Sun className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleDiaClick = (event, dataStr) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setDiaSelecionado(dataStr);
    setShowMenu(true);
  };

  const handleStatusSelect = (status) => {
    setStatusSelecionado(status);
    setShowMenu(false);
    
    if (status === statusPonto.FALTA) {
      setShowDescontoModal(true);
    } else {
      onMarcarDia(diaSelecionado, { status, desconto: 0 });
      setDiaSelecionado(null);
    }
  };

  const handleConfirmarDesconto = () => {
    onMarcarDia(diaSelecionado, { 
      status: statusSelecionado, 
      desconto: descontoSelecionado 
    });
    setShowDescontoModal(false);
    setDiaSelecionado(null);
    setStatusSelecionado(null);
    setDescontoSelecionado(1);
  };

  const handleCancelarDesconto = () => {
    setShowDescontoModal(false);
    setDiaSelecionado(null);
    setStatusSelecionado(null);
    setDescontoSelecionado(1);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
    };
    
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative">
      <h3 className="text-lg font-semibold mb-4">
        {format(new Date(ano, mes, 1), 'MMMM yyyy', { locale: ptBR })}
      </h3>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {diasSemana.map(dia => (
          <div key={dia} className="text-center text-sm font-medium text-gray-600 py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map(dia => {
          const dataStr = format(dia, 'yyyy-MM-dd');
          const info = ponto?.[dataStr] || { status: statusPonto.TRABALHADO, desconto: 0 };
          const statusClasses = statusPontoCores[info.status] || 'bg-gray-100 text-gray-800';

          return (
            <button
              key={dataStr}
              onClick={(e) => {
                e.stopPropagation();
                handleDiaClick(e, dataStr);
              }}
              className={`
                p-3 rounded-lg text-sm transition-all relative
                ${statusClasses}
                hover:shadow-md hover:scale-105
                flex flex-col items-center
                group
              `}
              title={getStatusTexto(info)}
            >
              <span className="font-semibold">{format(dia, 'd')}</span>
              <span className="text-[10px] mt-1 opacity-75 flex items-center gap-1">
                {getStatusIcon(info)}
                {getStatusTexto(info).substring(0, 3)}
                {info.desconto > 0 && ` (${info.desconto * 100}%)`}
              </span>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all"></div>
            </button>
          );
        })}
      </div>

      {/* Menu de opções */}
      {showMenu && (
        <div 
          className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 min-w-[250px]"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <div className="text-sm font-medium text-gray-700 px-3 py-2 border-b border-gray-100">
            Marcar dia {diaSelecionado} como:
          </div>
          
          <button
            onClick={() => handleStatusSelect(statusPonto.TRABALHADO)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Trabalhado</p>
              <p className="text-xs text-gray-500">Dia normal de trabalho</p>
            </div>
          </button>
          
          <button
            onClick={() => handleStatusSelect(statusPonto.FALTA)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Falta</p>
              <p className="text-xs text-gray-500">Falta não justificada (com desconto)</p>
            </div>
          </button>
          
          <button
            onClick={() => handleStatusSelect(statusPonto.FALTA_JUSTIFICADA)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded-lg transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Falta Justificada</p>
              <p className="text-xs text-gray-500">Com atestado ou justificativa</p>
            </div>
          </button>
          
          <button
            onClick={() => handleStatusSelect(statusPonto.FERIADO)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Feriado</p>
              <p className="text-xs text-gray-500">Dia de feriado oficial</p>
            </div>
          </button>
          
          <button
            onClick={() => handleStatusSelect(statusPonto.FOLGA)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Sun className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Folga</p>
              <p className="text-xs text-gray-500">Folga programada/domingo</p>
            </div>
          </button>
        </div>
      )}

      {/* Modal de Desconto para Faltas */}
      {showDescontoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Configurar Desconto</h3>
            <p className="text-gray-600 mb-4">
              Defina o percentual de desconto para a falta do dia {diaSelecionado}:
            </p>
            
            <div className="space-y-3 mb-6">
              {opcoesDesconto.map(opcao => (
                <label key={opcao.valor} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="desconto"
                    value={opcao.valor}
                    checked={descontoSelecionado === opcao.valor}
                    onChange={(e) => setDescontoSelecionado(parseFloat(e.target.value))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium">{opcao.label}</p>
                    {salarioBaseNum > 0 && (
                      <p className="text-sm text-gray-500">
                        Valor: R$ {(valorDia * opcao.valor).toFixed(2)}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelarDesconto}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDesconto}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
          <span>Trabalhado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
          <span>Falta c/ desconto</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
          <span>Falta Just.</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
          <span>Feriado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
          <span>Folga</span>
        </div>
      </div>

      {/* Resumo detalhado do mês */}
      {salarioBaseNum > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Resumo do Mês
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white p-2 rounded border border-gray-100">
              <p className="text-xs text-gray-500">Dias trabalhados</p>
              <p className="text-lg font-semibold text-green-600">{estatisticas.diasTrabalhados}</p>
            </div>
            <div className="bg-white p-2 rounded border border-gray-100">
              <p className="text-xs text-gray-500">Faltas</p>
              <p className="text-lg font-semibold text-red-600">{estatisticas.diasFalta}</p>
            </div>
            <div className="bg-white p-2 rounded border border-gray-100">
              <p className="text-xs text-gray-500">Faltas Just.</p>
              <p className="text-lg font-semibold text-yellow-600">{estatisticas.diasFaltaJustificada}</p>
            </div>
            <div className="bg-white p-2 rounded border border-gray-100">
              <p className="text-xs text-gray-500">Feriados</p>
              <p className="text-lg font-semibold text-blue-600">{estatisticas.diasFeriado}</p>
            </div>
            <div className="bg-white p-2 rounded border border-gray-100">
              <p className="text-xs text-gray-500">Folgas</p>
              <p className="text-lg font-semibold text-gray-600">{estatisticas.diasFolga}</p>
            </div>
            <div className="bg-white p-2 rounded border border-gray-100">
              <p className="text-xs text-gray-500">Valor/Dia</p>
              <p className="text-lg font-semibold">R$ {valorDia.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Salário Base:</span>
              <span className="font-medium">R$ {salarioBaseNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>(-) Descontos:</span>
              <span className="font-medium">- R$ {estatisticas.totalDescontos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
              <span>Salário Final:</span>
              <span className="text-blue-600">R$ {estatisticas.salarioFinal.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Total de {dias.length} dias no mês
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarioPonto;