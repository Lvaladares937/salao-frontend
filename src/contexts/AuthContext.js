import React, { createContext, useState, useContext, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';
import usuariosService from '../services/usuariosService';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  // Níveis de acesso
  const niveisAcesso = {
    admin: {
      nome: 'Administrador',
      permissoes: {
        dashboard: { ver: true, editar: true },
        clientes: { ver: true, editar: true, excluir: true },
        funcionarios: { ver: true, editar: true, excluir: true },
        estoque: { ver: true, editar: true, excluir: true },
        agendamentos: { ver: true, editar: true, excluir: true, verTodos: true },
        financeiro: { ver: true, editar: true, excluir: true, verTodos: true },
        configuracoes: { ver: true, editar: true },
        usuarios: { ver: true, editar: true, excluir: true }
      }
    },
    gerente: {
      nome: 'Gerente',
      permissoes: {
        dashboard: { ver: true, editar: true },
        clientes: { ver: true, editar: true, excluir: true },
        funcionarios: { ver: true, editar: false, excluir: false },
        estoque: { ver: true, editar: true, excluir: false },
        agendamentos: { ver: true, editar: true, excluir: false, verTodos: true },
        financeiro: { ver: true, editar: false, excluir: false, verTodos: true },
        configuracoes: { ver: false, editar: false },
        usuarios: { ver: false, editar: false, excluir: false }
      }
    },
    funcionario: {
      nome: 'Funcionário',
      permissoes: {
        dashboard: { ver: false, editar: false },
        clientes: { 
          ver: true, 
          editar: false, 
          excluir: false,
          verDadosSensiveis: false
        },
        funcionarios: { ver: false, editar: false, excluir: false },
        estoque: { ver: false, editar: false, excluir: false },
        agendamentos: { 
          ver: true, 
          editar: true, 
          excluir: false, 
          verTodos: false, 
          apenasProprios: true 
        },
        financeiro: { 
          ver: true, 
          editar: false, 
          excluir: false, 
          verTodos: false, 
          apenasProprios: true 
        },
        configuracoes: { ver: false, editar: false },
        usuarios: { ver: false, editar: false, excluir: false }
      }
    }
  };

  // Carregar funcionários do banco
  const carregarFuncionarios = async () => {
    try {
      const data = await funcionariosService.listar();
      console.log('✅ Funcionários carregados:', data.length);
      setFuncionarios(data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários:', error);
      return [];
    }
  };

  // 🔥 CARREGAR USUÁRIOS DO BACKEND (BANCO DE DADOS)
  const carregarUsuarios = async () => {
    try {
      const data = await usuariosService.listar();
      setUsuarios(data);
      console.log('✅ Usuários carregados do backend:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      setUsuarios([]);
      return [];
    }
  };

  // Carregar todos os dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      await Promise.all([
        carregarFuncionarios(),
        carregarUsuarios()
      ]);
      setLoading(false);
    };
    
    carregarDados();
  }, []);

  // 🔥 RECUPERAR USUÁRIO DO localStorage APÓS LOGIN
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser && !usuario) {
      const userData = JSON.parse(storedUser);
      
      // Validar se o funcionário ainda existe
      if (userData.funcionarioId) {
        const funcionarioExiste = funcionarios.some(f => f.id === userData.funcionarioId);
        if (!funcionarioExiste) {
          console.log('⚠️ Funcionário do usuário logado não existe mais');
          localStorage.removeItem('usuario');
          setUsuario(null);
          return;
        }
      }
      
      setUsuario(userData);
    }
  }, [funcionarios, usuario]);

  // 🔥 LOGIN VIA BACKEND
  const login = async (login, senha) => {
    try {
      const response = await api.post('/auth/login', { login, senha });
      
      if (response.data.success) {
        const usuarioData = response.data.usuario;
        
        let dadosFuncionario = null;
        if (usuarioData.funcionario_id) {
          dadosFuncionario = funcionarios.find(f => f.id === usuarioData.funcionario_id);
        }

        const getCorPorId = (id) => {
          const cores = [
            'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 
            'bg-yellow-500', 'bg-green-500', 'bg-indigo-500', 
            'bg-red-500', 'bg-teal-500', 'bg-orange-500'
          ];
          return cores[((id || 1) - 1) % cores.length] || 'bg-gray-500';
        };

        const usuarioComPermissoes = {
          id: usuarioData.id,
          nome: usuarioData.nome,
          email: usuarioData.email,
          login: usuarioData.login,
          nivel: usuarioData.nivel,
          funcionarioId: usuarioData.funcionario_id,
          ativo: usuarioData.ativo,
          avatar: dadosFuncionario?.avatar || usuarioData.nome.substring(0, 2).toUpperCase(),
          cor: dadosFuncionario?.cor || getCorPorId(usuarioData.id),
          ...dadosFuncionario,
          permissoes: niveisAcesso[usuarioData.nivel]?.permissoes || niveisAcesso.funcionario.permissoes
        };
        
        setUsuario(usuarioComPermissoes);
        localStorage.setItem('usuario', JSON.stringify(usuarioComPermissoes));
        return { success: true, usuario: usuarioComPermissoes };
      }
      
      return { success: false, error: response.data.error || 'Login ou senha inválidos' };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      if (error.response?.status === 401) {
        return { success: false, error: 'Login ou senha inválidos' };
      }
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const temPermissao = (modulo, acao = 'ver') => {
    if (!usuario) return false;
    if (usuario.nivel === 'admin') return true;
    
    const permissao = usuario.permissoes?.[modulo]?.[acao];
    return permissao || false;
  };

  const filtrarPorFuncionario = (dados, campoId = 'funcionario_id') => {
    if (!usuario) return dados;
    if (usuario.nivel === 'admin' || usuario.nivel === 'gerente') return dados;
    
    return dados.filter(item => item[campoId] === usuario.funcionarioId);
  };

  // 🔥 ADICIONAR USUÁRIO VIA BACKEND
  const adicionarUsuario = async (novoUsuario) => {
    try {
      const response = await usuariosService.criar(novoUsuario);
      await carregarUsuarios(); // Recarregar lista
      return response;
    } catch (error) {
      console.error('❌ Erro ao adicionar usuário:', error);
      throw error;
    }
  };

  // 🔥 ATUALIZAR USUÁRIO VIA BACKEND
  const atualizarUsuario = async (id, dadosAtualizados) => {
    try {
      await usuariosService.atualizar(id, dadosAtualizados);
      await carregarUsuarios(); // Recarregar lista
      
      // Se o usuário atualizou a si mesmo, atualizar o estado
      if (usuario && usuario.id === id) {
        const usuarioAtualizado = usuarios.find(u => u.id === id);
        if (usuarioAtualizado) {
          const dadosFuncionario = funcionarios.find(f => f.id === usuarioAtualizado.funcionario_id);
          const getCorPorId = (id) => {
            const cores = [
              'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 
              'bg-yellow-500', 'bg-green-500', 'bg-indigo-500', 
              'bg-red-500', 'bg-teal-500', 'bg-orange-500'
            ];
            return cores[((id || 1) - 1) % cores.length] || 'bg-gray-500';
          };
          
          const usuarioComPermissoes = {
            ...usuarioAtualizado,
            ...dadosFuncionario,
            permissoes: niveisAcesso[usuarioAtualizado.nivel]?.permissoes
          };
          setUsuario(usuarioComPermissoes);
          localStorage.setItem('usuario', JSON.stringify(usuarioComPermissoes));
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  // 🔥 DESATIVAR USUÁRIO VIA BACKEND
  const desativarUsuario = async (id) => {
    try {
      await usuariosService.desativar(id);
      await carregarUsuarios(); // Recarregar lista
      
      if (usuario && usuario.id === id) {
        logout();
      }
    } catch (error) {
      console.error('❌ Erro ao desativar usuário:', error);
      throw error;
    }
  };

  // 🔥 ATIVAR USUÁRIO VIA BACKEND
  const ativarUsuario = async (id) => {
    try {
      await usuariosService.ativar(id);
      await carregarUsuarios(); // Recarregar lista
    } catch (error) {
      console.error('❌ Erro ao ativar usuário:', error);
      throw error;
    }
  };

  // 🔥 ALTERAR SENHA VIA BACKEND
  const alterarSenha = async (id, senhaAtual, novaSenha) => {
    try {
      const response = await usuariosService.alterarSenha(id, senhaAtual, novaSenha);
      return response;
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      if (error.response?.status === 400) {
        return { success: false, error: error.response.data.error };
      }
      return { success: false, error: 'Erro ao alterar senha' };
    }
  };

  const recarregarDados = async () => {
    setLoading(true);
    await Promise.all([
      carregarFuncionarios(),
      carregarUsuarios()
    ]);
    setLoading(false);
  };

  const value = {
    usuario,
    loading,
    login,
    logout,
    usuarios,
    funcionarios,
    niveisAcesso,
    temPermissao,
    filtrarPorFuncionario,
    adicionarUsuario,
    atualizarUsuario,
    desativarUsuario,
    ativarUsuario,
    alterarSenha,
    recarregarDados
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
