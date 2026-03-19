import React, { useState, useEffect } from 'react';
import { 
  Clock, Save, Plus, Trash2, Sun, Moon, 
  Calendar, AlertCircle, Check, RefreshCw
} from 'lucide-react';
import horariosService from '../../services/horariosService';

const ConfiguracoesHorarios = () => {
  const [loading, setLoading] = useState(false);
  const [horariosGerados, setHorariosGerados] = useState([]);
  
  const [config, setConfig] = useState({
    horarioInicio: '09:00',
    horarioFim: '19:00',
    intervaloMinutos: 30,
    diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
    horariosPersonalizados: [],
    slotsPorProfissional: true,
    tempoMedioServico: 30,
    antecedenciaMinima: 60,
    janelaAgendamento: 30
  });

  const [intervalos, setIntervalos] = useState([
    { id: 1, ativo: true, inicio: '12:00', fim: '13:00', dias: [1, 2, 3, 4, 5] }
  ]);

  const [mostrarNovoIntervalo, setMostrarNovoIntervalo] = useState(false);
  const [novoIntervalo, setNovoIntervalo] = useState({
    inicio: '12:00',
    fim: '13:00',
    dias: [1, 2, 3, 4, 5]
  });

  const diasSemana = [
    { id: 0, nome: 'Dom', nomeCompleto: 'Domingo' },
    { id: 1, nome: 'Seg', nomeCompleto: 'Segunda-feira' },
    { id: 2, nome: 'Ter', nomeCompleto: 'Terça-feira' },
    { id: 3, nome: 'Qua', nomeCompleto: 'Quarta-feira' },
    { id: 4, nome: 'Qui', nomeCompleto: 'Quinta-feira' },
    { id: 5, nome: 'Sex', nomeCompleto: 'Sexta-feira' },
    { id: 6, nome: 'Sáb', nomeCompleto: 'Sábado' }
  ];

  // Carregar configurações salvas
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  // Gerar horários sempre que a config mudar
  useEffect(() => {
    const horarios = horariosService.gerarHorarios(config);
    setHorariosGerados(horarios);
  }, [config]);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      const savedConfig = await horariosService.buscarConfiguracoes();
      setConfig(savedConfig);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    setLoading(true);
    try {
      await horariosService.salvarConfiguracoes(config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const toggleDia = (diaId) => {
    setConfig(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(diaId)
        ? prev.diasSemana.filter(d => d !== diaId)
        : [...prev.diasSemana, diaId]
    }));
  };

  const toggleDiaIntervalo = (diaId) => {
    setNovoIntervalo(prev => ({
      ...prev,
      dias: prev.dias.includes(diaId)
        ? prev.dias.filter(d => d !== diaId)
        : [...prev.dias, diaId]
    }));
  };

  const adicionarIntervalo = () => {
    setIntervalos(prev => [
      ...prev,
      { ...novoIntervalo, id: Date.now(), ativo: true }
    ]);
    setMostrarNovoIntervalo(false);
    setNovoIntervalo({ inicio: '12:00', fim: '13:00', dias: [1, 2, 3, 4, 5] });
  };

  const removerIntervalo = (id) => {
    setIntervalos(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Configuração de Horários
        </h2>
        <button
          onClick={handleSalvar}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Configurações
        </button>
      </div>

      {/* Pré-visualização dos horários */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Pré-visualização dos Horários
        </h3>
        <div className="flex flex-wrap gap-2">
          {horariosGerados.map(horario => (
            <span key={horario} className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm border border-blue-200">
              {horario}
            </span>
          ))}
        </div>
        <p className="text-sm text-blue-600 mt-2">
          Total de {horariosGerados.length} horários disponíveis por dia
        </p>
      </div>

      {/* Horários de Funcionamento */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Horários de Funcionamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário de Início
            </label>
            <input
              type="time"
              value={config.horarioInicio}
              onChange={(e) => setConfig({...config, horarioInicio: e.target.value})}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário de Fim
            </label>
            <input
              type="time"
              value={config.horarioFim}
              onChange={(e) => setConfig({...config, horarioFim: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalo entre horários (minutos)
            </label>
            <select
              value={config.intervaloMinutos}
              onChange={(e) => setConfig({...config, intervaloMinutos: parseInt(e.target.value)})}
              className="input-field"
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dias de Funcionamento
            </label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map(dia => (
                <button
                  key={dia.id}
                  onClick={() => toggleDia(dia.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    config.diasSemana.includes(dia.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={dia.nomeCompleto}
                >
                  {dia.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intervalos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Intervalos</h3>
          <button
            onClick={() => setMostrarNovoIntervalo(!mostrarNovoIntervalo)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Intervalo
          </button>
        </div>

        {mostrarNovoIntervalo && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-3">Novo Intervalo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Início</label>
                <input
                  type="time"
                  value={novoIntervalo.inicio}
                  onChange={(e) => setNovoIntervalo({...novoIntervalo, inicio: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fim</label>
                <input
                  type="time"
                  value={novoIntervalo.fim}
                  onChange={(e) => setNovoIntervalo({...novoIntervalo, fim: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>

            <label className="block text-sm text-gray-600 mb-2">Dias de aplicação</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {diasSemana.map(dia => (
                <button
                  key={dia.id}
                  onClick={() => toggleDiaIntervalo(dia.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    novoIntervalo.dias.includes(dia.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dia.nome}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarNovoIntervalo(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarIntervalo}
                className="btn-primary"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {intervalos.map((intervalo) => (
            <div key={intervalo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={intervalo.ativo}
                  onChange={(e) => {
                    setIntervalos(prev => prev.map(i =>
                      i.id === intervalo.id ? { ...i, ativo: e.target.checked } : i
                    ));
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-medium">{intervalo.inicio} às {intervalo.fim}</span>
                <span className="text-sm text-gray-600">
                  {diasSemana.filter(d => intervalo.dias.includes(d.id)).map(d => d.nome).join(', ')}
                </span>
              </div>
              <button
                onClick={() => removerIntervalo(intervalo.id)}
                className="p-1 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações Gerais */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Configurações Gerais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo Médio por Serviço (minutos)
            </label>
            <input
              type="number"
              value={config.tempoMedioServico}
              onChange={(e) => setConfig({...config, tempoMedioServico: parseInt(e.target.value)})}
              className="input-field"
              min="15"
              step="15"
            />
            <p className="text-xs text-gray-500 mt-1">Usado para calcular disponibilidade</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antecedência Mínima (minutos)
            </label>
            <input
              type="number"
              value={config.antecedenciaMinima}
              onChange={(e) => setConfig({...config, antecedenciaMinima: parseInt(e.target.value)})}
              className="input-field"
              min="0"
              step="15"
            />
            <p className="text-xs text-gray-500 mt-1">Tempo mínimo para agendar</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Janela de Agendamento (dias)
            </label>
            <input
              type="number"
              value={config.janelaAgendamento}
              onChange={(e) => setConfig({...config, janelaAgendamento: parseInt(e.target.value)})}
              className="input-field"
              min="1"
              max="90"
            />
            <p className="text-xs text-gray-500 mt-1">Até quantos dias no futuro pode agendar</p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.slotsPorProfissional}
                onChange={(e) => setConfig({...config, slotsPorProfissional: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Slots individuais por profissional</span>
            </label>
          </div>
        </div>
      </div>

      {/* Informações úteis */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Como os horários funcionam</p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Os horários são gerados automaticamente baseados no início e fim</li>
              <li>• Intervalos bloqueiam determinados períodos</li>
              <li>• Dias não selecionados não terão horários disponíveis</li>
              <li>• A pré-visualização mostra todos os horários gerados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesHorarios;