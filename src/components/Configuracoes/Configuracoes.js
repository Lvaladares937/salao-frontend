import React, { useState, useEffect } from 'react';
import { 
  Save, Bell, Shield, Users, DollarSign, Clock, 
  Moon, Sun, Globe, Mail, Lock, CreditCard, Edit2, Check, X,
  Plus, Trash2
} from 'lucide-react';
import configService from '../../services/configService';
import Seguranca from './components/Seguranca';
import ConfiguracoesChatBot from './ConfiguracoesChatBot';
import { MessageCircle } from 'lucide-react'; 
import ConfiguracoesUsuarios from './ConfiguracoesUsuarios';
import ConfiguracoesHorarios from './ConfiguracoesHorarios';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('geral');
  const [darkMode, setDarkMode] = useState(false);
  const [servicos, setServicos] = useState([]);
  const [servicosEditando, setServicosEditando] = useState({});
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  
  // Estado para novo serviço
  const [mostrarFormNovoServico, setMostrarFormNovoServico] = useState(false);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    categoria: '',
    preco: '',
    duracao_minutos: 30,
    comissao_percentual: 30,
    descricao: ''
  });

  const [notificacoes, setNotificacoes] = useState({
    email: true,
    whatsapp: true,
    sms: false,
    lembrete24h: true,
    lembrete1h: true,
    promocoes: false
  });

  const [configGeral, setConfigGeral] = useState({
    nomeSalao: 'Salão Beleza & Estilo',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 99999-9999',
    email: 'contato@salao.com',
    moeda: 'BRL',
    comissaoPadrao: 30
  });

  // Carregar serviços do banco
  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    setLoading(true);
    try {
      const data = await configService.listarServicos();
      setServicos(data);
      
      // Extrair categorias únicas
      const cats = [...new Set(data.map(s => s.categoria).filter(Boolean))];
      setCategorias(cats);
      
      console.log('✅ Serviços carregados:', data.length);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComissaoChange = (servicoId, valor) => {
    setServicosEditando(prev => ({
      ...prev,
      [servicoId]: valor
    }));
  };

  const salvarComissao = async (servicoId) => {
    try {
      const novaComissao = servicosEditando[servicoId];
      await configService.atualizarComissao(servicoId, novaComissao);
      
      // Atualizar lista local
      setServicos(prev => prev.map(s => 
        s.id === servicoId ? { ...s, comissao_percentual: novaComissao } : s
      ));
      
      // Remover do estado de edição
      const newEditando = { ...servicosEditando };
      delete newEditando[servicoId];
      setServicosEditando(newEditando);
      
      alert('Comissão atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar comissão');
      console.error(error);
    }
  };

  const cancelarEdicao = (servicoId) => {
    const newEditando = { ...servicosEditando };
    delete newEditando[servicoId];
    setServicosEditando(newEditando);
  };

  const aplicarComissaoEmLote = async (categoria, percentual) => {
    if (!window.confirm(`Aplicar ${percentual}% a todos os serviços da categoria ${categoria}?`)) return;
    
    try {
      await configService.atualizarComissaoPorCategoria(categoria, percentual);
      await carregarServicos();
      alert(`Comissão de ${percentual}% aplicada a todos os serviços de ${categoria}`);
    } catch (error) {
      alert('Erro ao aplicar comissão em lote');
      console.error(error);
    }
  };

  // Função para adicionar novo serviço
  const adicionarServico = async () => {
    // Validações
    if (!novoServico.nome.trim()) {
      alert('Nome do serviço é obrigatório');
      return;
    }
    if (!novoServico.preco || novoServico.preco <= 0) {
      alert('Preço deve ser maior que zero');
      return;
    }
    if (!novoServico.categoria.trim()) {
      alert('Categoria é obrigatória');
      return;
    }

    try {
      setLoading(true);
      const servicoParaEnviar = {
        ...novoServico,
        preco: parseFloat(novoServico.preco),
        duracao_minutos: parseInt(novoServico.duracao_minutos),
        comissao_percentual: parseInt(novoServico.comissao_percentual)
      };

      await configService.criarServico(servicoParaEnviar);
      await carregarServicos();
      
      // Resetar formulário
      setNovoServico({
        nome: '',
        categoria: '',
        preco: '',
        duracao_minutos: 30,
        comissao_percentual: configGeral.comissaoPadrao,
        descricao: ''
      });
      setMostrarFormNovoServico(false);
      
      alert('Serviço adicionado com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar serviço');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Função para remover serviço
  const removerServico = async (servicoId, servicoNome) => {
    if (!window.confirm(`Tem certeza que deseja remover o serviço "${servicoNome}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await configService.removerServico(servicoId);
      await carregarServicos();
      alert('Serviço removido com sucesso!');
    } catch (error) {
      alert('Erro ao remover serviço');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'geral', nome: 'Geral', icone: Globe },
    { id: 'notificacoes', nome: 'Notificações', icone: Bell },
    { id: 'comissoes', nome: 'Comissões', icone: DollarSign },
    { id: 'chatbot', nome: 'ChatBot', icone: MessageCircle },
    { id: 'horarios', nome: 'Horários', icone: Clock }, // Atualizado
    { id: 'usuarios', nome: 'Usuários', icone: Users }, // Atualizado
    { id: 'seguranca', nome: 'Segurança', icone: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de Configurações */}
        <div className="w-64 space-y-2">
          {tabs.map(tab => {
            const Icone = tab.icone;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icone className="w-5 h-5" />
                <span className="font-medium">{tab.nome}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Configuração */}
        <div className="flex-1">
          <div className="card">
            {/* Aba Geral */}
            {activeTab === 'geral' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Configurações Gerais</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Salão
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={configGeral.nomeSalao}
                      onChange={(e) => setConfigGeral({...configGeral, nomeSalao: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={configGeral.endereco}
                      onChange={(e) => setConfigGeral({...configGeral, endereco: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={configGeral.telefone}
                        onChange={(e) => setConfigGeral({...configGeral, telefone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        value={configGeral.email}
                        onChange={(e) => setConfigGeral({...configGeral, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Moeda Padrão
                      </label>
                      <select 
                        className="input-field"
                        value={configGeral.moeda}
                        onChange={(e) => setConfigGeral({...configGeral, moeda: e.target.value})}
                      >
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="USD">Dólar Americano (US$)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comissão Padrão (%)
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        value={configGeral.comissaoPadrao}
                        onChange={(e) => setConfigGeral({...configGeral, comissaoPadrao: parseInt(e.target.value)})}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <div>
                        <p className="font-medium">Modo Escuro</p>
                        <p className="text-sm text-gray-600">Ative para uma interface mais escura</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aba de Comissões - TOTALMENTE RESTAURADA */}
            {activeTab === 'comissoes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Configuração de Comissões por Serviço</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMostrarFormNovoServico(!mostrarFormNovoServico)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {mostrarFormNovoServico ? 'Cancelar' : 'Novo Serviço'}
                    </button>
                    <div className="text-sm text-gray-600 flex items-center">
                      Comissão Padrão: <span className="font-bold text-blue-600 ml-1">{configGeral.comissaoPadrao}%</span>
                    </div>
                  </div>
                </div>

                {/* Formulário para novo serviço */}
                {mostrarFormNovoServico && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-800 mb-4">Adicionar Novo Serviço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Serviço *
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={novoServico.nome}
                          onChange={(e) => setNovoServico({...novoServico, nome: e.target.value})}
                          placeholder="Ex: Corte Masculino"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria *
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={novoServico.categoria}
                          onChange={(e) => setNovoServico({...novoServico, categoria: e.target.value})}
                          placeholder="Ex: Cabelo, Barbearia, Estética"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="input-field"
                          value={novoServico.preco}
                          onChange={(e) => setNovoServico({...novoServico, preco: e.target.value})}
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duração (minutos)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={novoServico.duracao_minutos}
                          onChange={(e) => setNovoServico({...novoServico, duracao_minutos: parseInt(e.target.value)})}
                          min="15"
                          step="15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comissão (%)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={novoServico.comissao_percentual}
                          onChange={(e) => setNovoServico({...novoServico, comissao_percentual: parseInt(e.target.value)})}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição
                        </label>
                        <textarea
                          className="input-field"
                          rows="2"
                          value={novoServico.descricao}
                          onChange={(e) => setNovoServico({...novoServico, descricao: e.target.value})}
                          placeholder="Descrição do serviço..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setMostrarFormNovoServico(false)}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={adicionarServico}
                        className="btn-primary"
                      >
                        Adicionar Serviço
                      </button>
                    </div>
                  </div>
                )}

                {/* Filtros por categoria */}
                <div className="flex flex-wrap gap-2">
                  {categorias.map(cat => (
                    <div key={cat} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                      <span className="text-sm font-medium">{cat}</span>
                      <input
                        type="number"
                        placeholder="%"
                        className="w-16 px-2 py-1 text-sm border rounded"
                        min="0"
                        max="100"
                        id={`batch-${cat}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`batch-${cat}`);
                          const valor = parseInt(input.value);
                          if (valor) aplicarComissaoEmLote(cat, valor);
                        }}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Aplicar
                      </button>
                    </div>
                  ))}
                </div>

                {loading ? (
                  <p className="text-center py-8">Carregando serviços...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="table-header">Serviço</th>
                          <th className="table-header">Categoria</th>
                          <th className="table-header">Preço</th>
                          <th className="table-header">Duração</th>
                          <th className="table-header">Comissão Atual</th>
                          <th className="table-header">Nova Comissão</th>
                          <th className="table-header">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {servicos.map(servico => (
                          <tr key={servico.id} className="hover:bg-gray-50">
                            <td className="table-cell font-medium">{servico.nome}</td>
                            <td className="table-cell">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {servico.categoria || 'Sem categoria'}
                              </span>
                            </td>
                            <td className="table-cell">
                              R$ {parseFloat(servico.preco).toFixed(2).replace('.', ',')}
                            </td>
                            <td className="table-cell">
                              {servico.duracao_minutos} min
                            </td>
                            <td className="table-cell">
                              <span className="font-semibold text-blue-600">
                                {servico.comissao_percentual || configGeral.comissaoPadrao}%
                              </span>
                            </td>
                            <td className="table-cell">
                              {servicosEditando[servico.id] !== undefined ? (
                                <input
                                  type="number"
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                  value={servicosEditando[servico.id]}
                                  onChange={(e) => handleComissaoChange(servico.id, parseInt(e.target.value))}
                                  min="0"
                                  max="100"
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="table-cell">
                              <div className="flex gap-2">
                                {servicosEditando[servico.id] !== undefined ? (
                                  <>
                                    <button
                                      onClick={() => salvarComissao(servico.id)}
                                      className="p-1 hover:bg-green-100 rounded"
                                      title="Salvar"
                                    >
                                      <Check className="w-4 h-4 text-green-600" />
                                    </button>
                                    <button
                                      onClick={() => cancelarEdicao(servico.id)}
                                      className="p-1 hover:bg-red-100 rounded"
                                      title="Cancelar"
                                    >
                                      <X className="w-4 h-4 text-red-600" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleComissaoChange(servico.id, servico.comissao_percentual || configGeral.comissaoPadrao)}
                                      className="p-1 hover:bg-blue-100 rounded"
                                      title="Editar comissão"
                                    >
                                      <Edit2 className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => removerServico(servico.id, servico.nome)}
                                      className="p-1 hover:bg-red-100 rounded"
                                      title="Remover serviço"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Aba de Notificações */}
            {activeTab === 'notificacoes' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Configurações de Notificações</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Canais de Notificação</h3>
                    <div className="space-y-3">
                      {Object.entries(notificacoes).map(([key, value]) => {
                        if (key === 'email' || key === 'whatsapp' || key === 'sms') {
                          return (
                            <label key={key} className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={() => setNotificacoes({...notificacoes, [key]: !value})}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="capitalize">{key === 'whatsapp' ? 'WhatsApp' : key}</span>
                            </label>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Lembretes</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={notificacoes.lembrete24h}
                          onChange={() => setNotificacoes({...notificacoes, lembrete24h: !notificacoes.lembrete24h})}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>Lembrete 24h antes</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={notificacoes.lembrete1h}
                          onChange={() => setNotificacoes({...notificacoes, lembrete1h: !notificacoes.lembrete1h})}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>Lembrete 1h antes</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Marketing</h3>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificacoes.promocoes}
                        onChange={() => setNotificacoes({...notificacoes, promocoes: !notificacoes.promocoes})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Receber promoções e novidades</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            

                        {/* Aba de Segurança */}
            {activeTab === 'seguranca' && (
              <Seguranca />
            )}

            {/* Aba de Usuários */}
            {activeTab === 'usuarios' && (
              <ConfiguracoesUsuarios />
            )}

            {/* Aba de Horários */}
            {activeTab === 'horarios' && (
              <ConfiguracoesHorarios />
            )}

            {/* Aba de ChatBot */}
            {activeTab === 'chatbot' && (
              <ConfiguracoesChatBot />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;