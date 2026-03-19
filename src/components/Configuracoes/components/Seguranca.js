import React, { useState } from 'react';
import { 
  Shield, Key, Lock, AlertCircle, Check, Save,
  Smartphone, Fingerprint, History, Eye, EyeOff,
  Globe, Bell, Clock, Users, UserCheck, UserX
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const Seguranca = () => {
  const { 
    usuario: usuarioLogado, 
    alterarSenha 
  } = useAuth();

  // Estado para alterar senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Estado para configurações de segurança
  const [configuracoes, setConfiguracoes] = useState({
    doisFatores: false,
    notificacoesLogin: true,
    expirarSessao: 30, // minutos
    bloquearAposTentativas: 5,
    historicoSenhas: 3,
    ipRestrito: false,
    horarioRestrito: false,
    horarioInicio: '08:00',
    horarioFim: '22:00',
    diasPermitidos: [1, 2, 3, 4, 5, 6], // segunda a sábado
    dispositivosConfiaveis: [
      { id: 1, nome: 'Chrome - Windows', ip: '192.168.1.100', data: '2026-03-01', atual: true },
      { id: 2, nome: 'Firefox - Windows', ip: '192.168.1.101', data: '2026-02-28', atual: false }
    ]
  });

  // Estado para logs de segurança
  const [logsSeguranca, setLogsSeguranca] = useState([
    { id: 1, data: '2026-03-06 08:30', evento: 'Login realizado', ip: '192.168.1.100', dispositivo: 'Chrome - Windows', status: 'sucesso' },
    { id: 2, data: '2026-03-05 18:45', evento: 'Tentativa de login', ip: '192.168.1.150', dispositivo: 'Firefox - Windows', status: 'falha' },
    { id: 3, data: '2026-03-05 14:20', evento: 'Senha alterada', ip: '192.168.1.100', dispositivo: 'Chrome - Windows', status: 'sucesso' },
    { id: 4, data: '2026-03-04 09:15', evento: 'Login realizado', ip: '192.168.1.100', dispositivo: 'Chrome - Windows', status: 'sucesso' },
    { id: 5, data: '2026-03-03 22:30', evento: 'Tentativa de acesso fora do horário', ip: '192.168.1.200', dispositivo: 'Desconhecido', status: 'bloqueado' }
  ]);

  const [activeTab, setActiveTab] = useState('senha');
  const [mostrarLogs, setMostrarLogs] = useState(false);

  const diasSemana = [
    { id: 0, nome: 'Domingo' },
    { id: 1, nome: 'Segunda' },
    { id: 2, nome: 'Terça' },
    { id: 3, nome: 'Quarta' },
    { id: 4, nome: 'Quinta' },
    { id: 5, nome: 'Sexta' },
    { id: 6, nome: 'Sábado' }
  ];

  const handleAlterarSenha = (e) => {
    e.preventDefault();
    setErroSenha('');
    setSucessoSenha('');

    if (novaSenha !== confirmarSenha) {
      setErroSenha('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 6) {
      setErroSenha('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Verificar força da senha
    const temMaiuscula = /[A-Z]/.test(novaSenha);
    const temMinuscula = /[a-z]/.test(novaSenha);
    const temNumero = /[0-9]/.test(novaSenha);
    const temEspecial = /[!@#$%^&*]/.test(novaSenha);

    if (!temMaiuscula || !temMinuscula || !temNumero) {
      setErroSenha('A senha deve conter letras maiúsculas, minúsculas e números');
      return;
    }

    const result = alterarSenha(usuarioLogado.id, senhaAtual, novaSenha);
    if (result.success) {
      setSucessoSenha('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      
      // Adicionar ao log
      const novoLog = {
        id: logsSeguranca.length + 1,
        data: new Date().toLocaleString('pt-BR'),
        evento: 'Senha alterada',
        ip: '192.168.1.100',
        dispositivo: 'Sessão atual',
        status: 'sucesso'
      };
      setLogsSeguranca([novoLog, ...logsSeguranca]);
    } else {
      setErroSenha(result.error || 'Senha atual incorreta');
    }
  };

  const toggleDia = (diaId) => {
    setConfiguracoes(prev => ({
      ...prev,
      diasPermitidos: prev.diasPermitidos.includes(diaId)
        ? prev.diasPermitidos.filter(d => d !== diaId)
        : [...prev.diasPermitidos, diaId]
    }));
  };

  const handleRemoverDispositivo = (id) => {
    if (window.confirm('Remover este dispositivo da lista de confiáveis?')) {
      setConfiguracoes(prev => ({
        ...prev,
        dispositivosConfiaveis: prev.dispositivosConfiaveis.filter(d => d.id !== id)
      }));
    }
  };

  const getForcaSenha = (senha) => {
    if (!senha) return { texto: 'Digite uma senha', cor: 'bg-gray-200', largura: '0%' };
    
    let forca = 0;
    if (senha.length >= 6) forca += 25;
    if (senha.length >= 8) forca += 25;
    if (/[A-Z]/.test(senha)) forca += 15;
    if (/[a-z]/.test(senha)) forca += 15;
    if (/[0-9]/.test(senha)) forca += 10;
    if (/[!@#$%^&*]/.test(senha)) forca += 10;
    
    forca = Math.min(forca, 100);
    
    if (forca < 30) return { texto: 'Fraca', cor: 'bg-red-500', largura: `${forca}%` };
    if (forca < 60) return { texto: 'Média', cor: 'bg-yellow-500', largura: `${forca}%` };
    if (forca < 80) return { texto: 'Boa', cor: 'bg-blue-500', largura: `${forca}%` };
    return { texto: 'Forte', cor: 'bg-green-500', largura: `${forca}%` };
  };

  const forcaSenha = getForcaSenha(novaSenha);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Segurança da Conta
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarLogs(!mostrarLogs)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {mostrarLogs ? 'Ocultar Logs' : 'Ver Logs'}
          </button>
        </div>
      </div>

      {/* Cards de Status de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Status da Conta</p>
              <p className="text-lg font-semibold text-green-700">Protegida</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Último Login</p>
              <p className="text-lg font-semibold text-blue-700">Hoje 08:30</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Dispositivos</p>
              <p className="text-lg font-semibold text-yellow-700">2 ativos</p>
            </div>
            <Smartphone className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">2FA</p>
              <p className="text-lg font-semibold text-purple-700">Desativado</p>
            </div>
            <Fingerprint className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('senha')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'senha'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Alterar Senha
          </button>
          
          <button
            onClick={() => setActiveTab('autenticacao')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'autenticacao'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Fingerprint className="w-4 h-4 inline mr-2" />
            Autenticação
          </button>
          
          <button
            onClick={() => setActiveTab('sessao')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sessao'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Sessão e Dispositivos
          </button>
          
          <button
            onClick={() => setActiveTab('notificacoes')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'notificacoes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notificações
          </button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6">
        {/* Aba de Alterar Senha */}
        {activeTab === 'senha' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Alterar Senha */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Alterar Minha Senha
              </h3>

              {erroSenha && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{erroSenha}</span>
                </div>
              )}

              {sucessoSenha && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">{sucessoSenha}</span>
                </div>
              )}

              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={mostrarSenhaAtual ? 'text' : 'password'}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {mostrarSenhaAtual ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={mostrarNovaSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {mostrarNovaSenha ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  
                  {/* Indicador de força da senha */}
                  {novaSenha && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Força da senha:</span>
                        <span className="text-xs font-medium" style={{ color: forcaSenha.cor.replace('bg-', 'text-') }}>
                          {forcaSenha.texto}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${forcaSenha.cor} transition-all duration-300`}
                          style={{ width: forcaSenha.largura }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={mostrarConfirmarSenha ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  {confirmarSenha && confirmarSenha !== novaSenha && (
                    <p className="text-xs text-red-600 mt-1">As senhas não coincidem</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Alterar Senha
                </button>
              </form>
            </div>

            {/* Políticas de Senha */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">Política de Senhas</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Mínimo de 6 caracteres
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Pelo menos 1 letra maiúscula
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Pelo menos 1 letra minúscula
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Pelo menos 1 número
                </li>
                <li className="flex items-center gap-2 text-blue-500">
                  <AlertCircle className="w-4 h-4" />
                  Recomendado: use caracteres especiais (!@#$%)
                </li>
              </ul>

              <h3 className="font-semibold text-blue-800 mt-6 mb-3">Últimas alterações</h3>
              <div className="space-y-2">
                <p className="text-sm text-blue-700">• Senha alterada em 01/03/2026</p>
                <p className="text-sm text-blue-700">• Senha alterada em 15/02/2026</p>
                <p className="text-sm text-blue-700">• Senha alterada em 30/01/2026</p>
              </div>
            </div>
          </div>
        )}

        {/* Aba de Autenticação */}
        {activeTab === 'autenticacao' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium mb-4">Autenticação de Dois Fatores</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Google Authenticator</p>
                      <p className="text-sm text-gray-600">Use um aplicativo de autenticação</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfiguracoes({...configuracoes, doisFatores: !configuracoes.doisFatores})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      configuracoes.doisFatores ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        configuracoes.doisFatores ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Recomendado:</strong> Ative a autenticação de dois fatores para maior segurança da sua conta.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Tentativas de Login</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Bloquear após:</span>
                    <select
                      value={configuracoes.bloquearAposTentativas}
                      onChange={(e) => setConfiguracoes({...configuracoes, bloquearAposTentativas: parseInt(e.target.value)})}
                      className="input-field w-24"
                    >
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                    <span className="text-sm text-gray-600">tentativas falhas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium mb-4">Restrições de Acesso</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={configuracoes.ipRestrito}
                      onChange={(e) => setConfiguracoes({...configuracoes, ipRestrito: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">Restringir por IP</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Apenas IPs autorizados poderão acessar
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={configuracoes.horarioRestrito}
                      onChange={(e) => setConfiguracoes({...configuracoes, horarioRestrito: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">Restringir por horário</span>
                  </label>
                </div>

                {configuracoes.horarioRestrito && (
                  <div className="ml-6 space-y-3">
                    <div className="flex gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Início</label>
                        <input
                          type="time"
                          value={configuracoes.horarioInicio}
                          onChange={(e) => setConfiguracoes({...configuracoes, horarioInicio: e.target.value})}
                          className="input-field w-32"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Fim</label>
                        <input
                          type="time"
                          value={configuracoes.horarioFim}
                          onChange={(e) => setConfiguracoes({...configuracoes, horarioFim: e.target.value})}
                          className="input-field w-32"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Dias permitidos</label>
                      <div className="flex flex-wrap gap-2">
                        {diasSemana.map(dia => (
                          <button
                            key={dia.id}
                            onClick={() => toggleDia(dia.id)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                              configuracoes.diasPermitidos.includes(dia.id)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {dia.nome.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Aba de Sessão e Dispositivos */}
        {activeTab === 'sessao' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium mb-4">Sessão Atual</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Chrome - Windows</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Atual</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">IP: 192.168.1.100</p>
                  <p className="text-xs text-gray-600">Login: 08:30 - 06/03/2026</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Configurações da Sessão</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expirar sessão após</span>
                      <select
                        value={configuracoes.expirarSessao}
                        onChange={(e) => setConfiguracoes({...configuracoes, expirarSessao: parseInt(e.target.value)})}
                        className="input-field w-24"
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="60">60 min</option>
                        <option value="120">2 horas</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Histórico de senhas</span>
                      <select
                        value={configuracoes.historicoSenhas}
                        onChange={(e) => setConfiguracoes({...configuracoes, historicoSenhas: parseInt(e.target.value)})}
                        className="input-field w-24"
                      >
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors mt-2">
                  Encerrar Todas as Sessões
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium mb-4">Dispositivos Confiáveis</h3>
              
              <div className="space-y-3">
                {configuracoes.dispositivosConfiaveis.map(dispositivo => (
                  <div key={dispositivo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{dispositivo.nome}</span>
                        {dispositivo.atual && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Atual</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">IP: {dispositivo.ip} • {dispositivo.data}</p>
                    </div>
                    {!dispositivo.atual && (
                      <button
                        onClick={() => handleRemoverDispositivo(dispositivo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Aba de Notificações */}
        {activeTab === 'notificacoes' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium mb-4">Notificações de Segurança</h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Novos dispositivos</p>
                  <p className="text-sm text-gray-600">Receber alerta quando um novo dispositivo acessar</p>
                </div>
                <input
                  type="checkbox"
                  checked={configuracoes.notificacoesLogin}
                  onChange={(e) => setConfiguracoes({...configuracoes, notificacoesLogin: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Tentativas de login</p>
                  <p className="text-sm text-gray-600">Alertar sobre tentativas de login falhas</p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 text-blue-600 rounded opacity-50"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Alterações de senha</p>
                  <p className="text-sm text-gray-600">Notificar quando a senha for alterada</p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 text-blue-600 rounded opacity-50"
                />
              </label>
            </div>
          </div>
        )}

        {/* Logs de Segurança (aparece em todas as abas) */}
        {mostrarLogs && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Histórico de Atividades de Segurança
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {logsSeguranca.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{log.evento}</p>
                    <p className="text-xs text-gray-500">
                      {log.data} • IP: {log.ip} • {log.dispositivo}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    log.status === 'sucesso' ? 'bg-green-100 text-green-800' :
                    log.status === 'falha' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seguranca;