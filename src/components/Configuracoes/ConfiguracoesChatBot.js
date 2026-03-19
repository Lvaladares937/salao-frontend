import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Power, Settings, Phone, Mail, 
  Clock, Calendar, Globe, Smartphone, Check, X,
  AlertCircle, RefreshCw, Play, Pause, History
} from 'lucide-react';
import chatbotService from '../../services/chatbotService';

const ConfiguracoesChatBot = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ online: false });
  const [conversas, setConversas] = useState([]);
  const [mostrarLogs, setMostrarLogs] = useState(false);
  const [mensagemTeste, setMensagemTeste] = useState({
    numero: '',
    mensagem: ''
  });
  const [config, setConfig] = useState({
    saudacao: "Olá! Seja bem-vindo ao Salão! 🌟",
    horarioInicio: "09:00",
    horarioFim: "19:00",
    diasAtendimento: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
    mensagemForaHorario: "No momento estamos fora do horário de atendimento. Retornaremos amanhã! 😊",
    tempoRespostaAutomatica: 5, // minutos
    responderForaHorario: false,
    notificarNovoContato: true
  });

  const diasSemana = [
    { id: 0, nome: 'Domingo' },
    { id: 1, nome: 'Segunda' },
    { id: 2, nome: 'Terça' },
    { id: 3, nome: 'Quarta' },
    { id: 4, nome: 'Quinta' },
    { id: 5, nome: 'Sexta' },
    { id: 6, nome: 'Sábado' }
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const statusData = await chatbotService.verificarStatus();
      setStatus(statusData);
      
      const conversasData = await chatbotService.listarConversas();
      setConversas(conversasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarBot = async () => {
    try {
      await chatbotService.iniciar();
      await carregarDados();
      alert('Bot iniciado com sucesso!');
    } catch (error) {
      alert('Erro ao iniciar bot');
    }
  };

  const handlePararBot = async () => {
    try {
      await chatbotService.parar();
      await carregarDados();
      alert('Bot parado com sucesso!');
    } catch (error) {
      alert('Erro ao parar bot');
    }
  };

  const handleSalvarConfig = async () => {
    try {
      await chatbotService.configurar(config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    }
  };

  const handleEnviarTeste = async () => {
    if (!mensagemTeste.numero) {
      alert('Digite um número para teste');
      return;
    }
    
    try {
      await chatbotService.enviarMensagemTeste(
        mensagemTeste.numero,
        mensagemTeste.mensagem || 'Teste de integração do chatbot! 🤖'
      );
      alert('Mensagem de teste enviada!');
      setMensagemTeste({ numero: '', mensagem: '' });
    } catch (error) {
      alert('Erro ao enviar mensagem de teste');
    }
  };

  const toggleDia = (diaId) => {
    setConfig(prev => ({
      ...prev,
      diasAtendimento: prev.diasAtendimento.includes(diaId)
        ? prev.diasAtendimento.filter(d => d !== diaId)
        : [...prev.diasAtendimento, diaId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          ChatBot WhatsApp
        </h2>
        <button
          onClick={carregarDados}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Atualizar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status do Bot */}
      <div className={`p-4 rounded-lg ${
        status.online 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <div>
              <p className="font-medium">
                {status.online ? 'Bot Online' : 'Bot Offline'}
              </p>
              <p className="text-sm text-gray-600">
                {status.online 
                  ? 'Aguardando mensagens...' 
                  : 'Clique em "Iniciar Bot" para ativar'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!status.online ? (
              <button
                onClick={handleIniciarBot}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Iniciar Bot
              </button>
            ) : (
              <button
                onClick={handlePararBot}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Parar Bot
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            Configurações Gerais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem de Saudação
              </label>
              <textarea
                value={config.saudacao}
                onChange={(e) => setConfig({...config, saudacao: e.target.value})}
                className="input-field"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem Fora do Horário
              </label>
              <textarea
                value={config.mensagemForaHorario}
                onChange={(e) => setConfig({...config, mensagemForaHorario: e.target.value})}
                className="input-field"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário Início
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
                  Horário Fim
                </label>
                <input
                  type="time"
                  value={config.horarioFim}
                  onChange={(e) => setConfig({...config, horarioFim: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias de Atendimento
              </label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <button
                    key={dia.id}
                    onClick={() => toggleDia(dia.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      config.diasAtendimento.includes(dia.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dia.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.responderForaHorario}
                  onChange={(e) => setConfig({...config, responderForaHorario: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">Responder fora do horário (com mensagem automática)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.notificarNovoContato}
                  onChange={(e) => setConfig({...config, notificarNovoContato: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">Notificar novo contato</span>
              </label>
            </div>

            <button
              onClick={handleSalvarConfig}
              className="btn-primary w-full"
            >
              Salvar Configurações
            </button>
          </div>
        </div>

        {/* Teste e Logs */}
        <div className="space-y-6">
          {/* Teste de Mensagem */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Testar Mensagem
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número WhatsApp (com DDD)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 61999999999"
                  value={mensagemTeste.numero}
                  onChange={(e) => setMensagemTeste({...mensagemTeste, numero: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem de Teste (opcional)
                </label>
                <textarea
                  placeholder="Deixe em branco para usar mensagem padrão"
                  value={mensagemTeste.mensagem}
                  onChange={(e) => setMensagemTeste({...mensagemTeste, mensagem: e.target.value})}
                  className="input-field"
                  rows="2"
                />
              </div>

              <button
                onClick={handleEnviarTeste}
                className="btn-secondary w-full"
              >
                Enviar Mensagem de Teste
              </button>
            </div>
          </div>

          {/* Logs de Conversas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={() => setMostrarLogs(!mostrarLogs)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Últimas Conversas
              </h3>
              <span className="text-sm text-gray-500">
                {mostrarLogs ? '▼' : '▶'}
              </span>
            </button>

            {mostrarLogs && (
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {conversas.length > 0 ? (
                  conversas.map((conv, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{conv.numero}</span>
                        <span className="text-xs text-gray-500">{conv.data}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{conv.ultimaMensagem}</p>
                      <span className={`text-xs ${
                        conv.status === 'ativo' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {conv.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma conversa recente
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações do Bot */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Sobre o ChatBot
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• O bot responde automaticamente a mensagens no WhatsApp</li>
          <li>• Pode agendar serviços, informar preços e horários</li>
          <li>• Funciona apenas no horário configurado acima</li>
          <li>• Para testar, use seu próprio número com DDD (ex: 61999999999)</li>
          <li>• O QR Code para conectar o WhatsApp aparece no terminal do servidor</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfiguracoesChatBot;