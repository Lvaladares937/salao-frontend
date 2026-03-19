import React, { createContext, useState, useContext, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';

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

  // Carregar usuários
  const carregarUsuarios = async () => {
    try {
      const storedUsuarios = localStorage.getItem('usuarios');
      let usuariosCarregados = storedUsuarios ? JSON.parse(storedUsuarios) : [];
      
      if (usuariosCarregados.length === 0) {
        const usuariosIniciais = [
          {
            id: 1,
            funcionarioId: null,
            nome: 'Administrador',
            email: 'admin@vailsonhair.com',
            login: 'admin',
            senha: 'admin123',
            nivel: 'admin',
            ativo: true,
            avatar: 'AD',
            cor: 'bg-red-500'
          }
        ];
        usuariosCarregados = usuariosIniciais;
        localStorage.setItem('usuarios', JSON.stringify(usuariosIniciais));
      }
      
      setUsuarios(usuariosCarregados);
      console.log('✅ Usuários carregados:', usuariosCarregados.length);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    }
  };

  // Carregar todos os dados
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      await carregarFuncionarios();
      await carregarUsuarios();
      setLoading(false);
    };
    
    carregarDados();
  }, []);

  // ⚠️ PARTE CRÍTICA - VOLTAR COMO ERA ANTES ⚠️
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
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
    setLoading(false);
  }, [funcionarios]); // Dependência em funcionarios

  const login = async (login, senha) => {
    const usuarioEncontrado = usuarios.find(
      u => u.login === login && u.senha === senha && u.ativo
    );

    if (usuarioEncontrado) {
      let dadosFuncionario = null;
      if (usuarioEncontrado.funcionarioId) {
        dadosFuncionario = funcionarios.find(f => f.id === usuarioEncontrado.funcionarioId);
        
        if (!dadosFuncionario) {
          return { 
            success: false, 
            error: 'Funcionário vinculado não existe mais. Contate o administrador.' 
          };
        }
      }

      const { senha: _, ...usuarioSemSenha } = usuarioEncontrado;
      const usuarioComPermissoes = {
        ...usuarioSemSenha,
        ...dadosFuncionario,
        permissoes: niveisAcesso[usuarioEncontrado.nivel]?.permissoes || niveisAcesso.funcionario.permissoes
      };
      
      setUsuario(usuarioComPermissoes);
      localStorage.setItem('usuario', JSON.stringify(usuarioComPermissoes));
      return { success: true, usuario: usuarioComPermissoes };
    } else {
      return { success: false, error: 'Login ou senha inválidos' };
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

  const adicionarUsuario = (novoUsuario) => {
    const usuarioComId = {
      ...novoUsuario,
      id: usuarios.length + 1,
      ativo: true
    };
    const novosUsuarios = [...usuarios, usuarioComId];
    setUsuarios(novosUsuarios);
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios));
    return usuarioComId;
  };

  const atualizarUsuario = (id, dadosAtualizados) => {
    const novosUsuarios = usuarios.map(u => 
      u.id === id ? { ...u, ...dadosAtualizados } : u
    );
    setUsuarios(novosUsuarios);
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios));
    
    if (usuario && usuario.id === id) {
      let dadosFuncionario = null;
      if (dadosAtualizados.funcionarioId) {
        dadosFuncionario = funcionarios.find(f => f.id === dadosAtualizados.funcionarioId);
      }
      
      const usuarioAtualizado = { 
        ...usuario, 
        ...dadosAtualizados,
        ...dadosFuncionario 
      };
      setUsuario(usuarioAtualizado);
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
    }
  };

  const desativarUsuario = (id) => {
    const novosUsuarios = usuarios.map(u => 
      u.id === id ? { ...u, ativo: false } : u
    );
    setUsuarios(novosUsuarios);
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios));
    
    if (usuario && usuario.id === id) {
      logout();
    }
  };

  const ativarUsuario = (id) => {
    const novosUsuarios = usuarios.map(u => 
      u.id === id ? { ...u, ativo: true } : u
    );
    setUsuarios(novosUsuarios);
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios));
  };

  const alterarSenha = (id, senhaAtual, novaSenha) => {
    const usuarioEncontrado = usuarios.find(u => u.id === id);
    if (usuarioEncontrado && usuarioEncontrado.senha === senhaAtual) {
      const novosUsuarios = usuarios.map(u => 
        u.id === id ? { ...u, senha: novaSenha } : u
      );
      setUsuarios(novosUsuarios);
      localStorage.setItem('usuarios', JSON.stringify(novosUsuarios));
      return { success: true };
    }
    return { success: false, error: 'Senha atual incorreta' };
  };

  const recarregarDados = async () => {
    setLoading(true);
    await carregarFuncionarios();
    await carregarUsuarios();
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