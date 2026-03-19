import React, { useState } from 'react';
import { 
  Users, UserPlus, Edit2, Trash2, Check, X, 
  Search, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ConfiguracoesUsuarios = () => {
  const { 
    usuarios, 
    funcionarios,
    adicionarUsuario, 
    atualizarUsuario, 
    desativarUsuario, 
    ativarUsuario 
  } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [modalModo, setModalModo] = useState('novo');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    login: '',
    senha: '',
    nivel: 'funcionario',
    funcionarioId: ''
  });

  const niveisExibicao = [
    {
      nivel: 'admin',
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      cor: 'bg-red-100 text-red-800 border-red-200',
      permissoes: [
        'Dashboard completo',
        'Clientes (CRUD completo)',
        'Funcionários (CRUD)',
        'Estoque (CRUD)',
        'Agendamentos (todos)',
        'Financeiro (todos)',
        'Configurações',
        'Usuários'
      ]
    },
    {
      nivel: 'gerente',
      nome: 'Gerente',
      descricao: 'Acesso gerencial, sem exclusões',
      cor: 'bg-blue-100 text-blue-800 border-blue-200',
      permissoes: [
        'Dashboard completo',
        'Clientes (CRUD)',
        'Funcionários (visualizar)',
        'Estoque (gerenciar)',
        'Agendamentos (todos)',
        'Financeiro (visualizar todos)',
        'Configurações (sem acesso)',
        'Usuários (sem acesso)'
      ]
    },
    {
      nivel: 'funcionario',
      nome: 'Funcionário',
      descricao: 'Acesso limitado apenas ao necessário',
      cor: 'bg-green-100 text-green-800 border-green-200',
      permissoes: [
        'Sem acesso ao Dashboard',
        'Clientes (apenas nome e visualização)',
        'Dados sensíveis ocultos',
        'Funcionários (sem acesso)',
        'Estoque (sem acesso)',
        'Apenas seus próprios agendamentos',
        'Financeiro (apenas suas comissões)',
        'Configurações (sem acesso)',
        'Usuários (sem acesso)'
      ]
    }
  ];

  const handleSalvarUsuario = (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.login) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (modalModo === 'novo' && !formData.senha) {
      alert('Senha é obrigatória para novos usuários');
      return;
    }

    if (formData.nivel === 'funcionario' && !formData.funcionarioId) {
      alert('Selecione um funcionário para vincular');
      return;
    }

    const funcionarioSelecionado = funcionarios.find(f => f.id === parseInt(formData.funcionarioId));
    
    const dadosUsuario = {
      nome: formData.nome,
      email: formData.email,
      login: formData.login,
      senha: formData.senha || (usuarioSelecionado ? usuarioSelecionado.senha : ''),
      nivel: formData.nivel,
      funcionarioId: formData.funcionarioId ? parseInt(formData.funcionarioId) : null,
      avatar: funcionarioSelecionado?.avatar || formData.nome.substring(0, 2).toUpperCase(),
      cor: funcionarioSelecionado?.cor || getCorPorId(formData.funcionarioId)
    };

    if (modalModo === 'editar' && usuarioSelecionado) {
      atualizarUsuario(usuarioSelecionado.id, dadosUsuario);
      alert('Usuário atualizado com sucesso!');
    } else {
      adicionarUsuario(dadosUsuario);
      alert('Usuário adicionado com sucesso!');
    }

    setShowModal(false);
    resetForm();
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioSelecionado(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      login: usuario.login,
      senha: '',
      nivel: usuario.nivel,
      funcionarioId: usuario.funcionarioId || ''
    });
    setModalModo('editar');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      login: '',
      senha: '',
      nivel: 'funcionario',
      funcionarioId: ''
    });
    setUsuarioSelecionado(null);
  };

  const getCorPorId = (id) => {
    const cores = [
      'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 
      'bg-yellow-500', 'bg-green-500', 'bg-indigo-500', 
      'bg-red-500', 'bg-teal-500', 'bg-orange-500'
    ];
    return cores[((id || 1) - 1) % cores.length] || 'bg-gray-500';
  };

  const getNivelBadge = (nivel) => {
    switch(nivel) {
      case 'admin':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Administrador</span>;
      case 'gerente':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Gerente</span>;
      default:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Funcionário</span>;
    }
  };

  const getNomeFuncionario = (funcionarioId) => {
    const func = funcionarios.find(f => f.id === funcionarioId);
    return func ? func.nome : 'Não vinculado';
  };

  const usuariosFiltrados = usuarios.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Gerenciamento de Usuários
        </h2>
        <button
          onClick={() => {
            resetForm();
            setModalModo('novo');
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Cards explicativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {niveisExibicao.map((nivel) => (
          <div key={nivel.nivel} className={`bg-white rounded-lg shadow p-4 border-l-4 ${nivel.cor.split(' ')[2]}`}>
            <h3 className="font-semibold text-gray-900">{nivel.nome}</h3>
            <p className="text-sm text-gray-600 mt-1">{nivel.descricao}</p>
            <div className="mt-3 text-xs space-y-1">
              {nivel.permissoes.map((perm, idx) => (
                <p key={idx} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {perm}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Aviso de proteção de dados */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong className="font-medium">Proteção de dados:</strong> Usuários com nível "Funcionário" não terão acesso a telefone e email dos clientes, apenas aos nomes para identificação.
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar usuários por nome, login ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${user.cor || 'bg-blue-500'} flex items-center justify-center text-white font-bold text-sm mr-3`}>
                        {user.avatar || user.nome?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.login}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.funcionarioId ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getNomeFuncionario(user.funcionarioId)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getNivelBadge(user.nivel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.ativo ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditarUsuario(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.ativo ? (
                      <button
                        onClick={() => desativarUsuario(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Desativar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => ativarUsuario(user.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Ativar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {modalModo === 'novo' ? 'Novo Usuário' : 'Editar Usuário'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarUsuario} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login *
                </label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({...formData, login: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalModo === 'novo' ? 'Senha *' : 'Nova Senha (deixe em branco para manter)'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className="input-field"
                  required={modalModo === 'novo'}
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Acesso *
                </label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                  className="input-field"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {formData.nivel === 'funcionario' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vincular a Funcionário *
                  </label>
                  <select
                    value={formData.funcionarioId}
                    onChange={(e) => {
                      const funcId = e.target.value;
                      const funcSelecionado = funcionarios.find(f => f.id === parseInt(funcId));
                      setFormData({
                        ...formData,
                        funcionarioId: funcId,
                        nome: funcSelecionado?.nome || formData.nome,
                        email: funcSelecionado?.email || formData.email
                      });
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios.map(func => (
                      <option key={func.id} value={func.id}>
                        {func.nome} - {func.especialidade || 'Sem especialidade'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    O usuário terá acesso apenas aos seus próprios agendamentos e comissões, e poderá ver apenas os nomes dos clientes.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {modalModo === 'novo' ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesUsuarios;