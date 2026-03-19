import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Scissors, Package, 
  Calendar, Settings, LogOut, Menu, X, DollarSign,
  User, Shield
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { usePermissao } from './hooks/usePermissao';
import Dashboard from './components/Dashboard/Dashboard';
import ClienteList from './components/Clientes/ClienteList';
import Estoque from './components/Estoque/Estoque';
import Configuracoes from './components/Configuracoes/Configuracoes';
import Agendamentos from './components/Agendamentos/Agendamentos';
import Funcionarios from './components/Funcionarios/Funcionarios';
import Financeiro from './components/Financeiro/Financeiro';
import Login from './components/Login/Login';
import './App.css';

function AppContent() {
  const [menuAtivo, setMenuAtivo] = useState('dashboard');
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { usuario, logout } = useAuth();
  const { moduloVisivel, getTitulo } = usePermissao();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuAberto(false);
      }
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Menu dinâmico - só mostra o que o usuário pode ver
  const menuItems = [
    { id: 'dashboard', nome: getTitulo('dashboard', 'Dashboard'), icone: LayoutDashboard },
    { id: 'clientes', nome: 'Clientes', icone: Users, visivel: moduloVisivel('clientes') },
    { id: 'funcionarios', nome: 'Funcionários', icone: Scissors, visivel: moduloVisivel('funcionarios') },
    { id: 'estoque', nome: 'Estoque', icone: Package, visivel: moduloVisivel('estoque') },
    { id: 'agendamentos', nome: getTitulo('agendamentos', 'Agendamentos'), icone: Calendar, visivel: moduloVisivel('agendamentos') },
    { id: 'financeiro', nome: getTitulo('financeiro', 'Financeiro'), icone: DollarSign, visivel: moduloVisivel('financeiro') },
    { id: 'configuracoes', nome: 'Configurações', icone: Settings, visivel: moduloVisivel('configuracoes') },
  ].filter(item => item.visivel !== false);

  const renderContent = () => {
    switch(menuAtivo) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <ClienteList />;
      case 'funcionarios':
        return <Funcionarios />;
      case 'estoque':
        return <Estoque />;
      case 'agendamentos':
        return <Agendamentos />;
      case 'financeiro':
        return <Financeiro />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Módulo em desenvolvimento</p>
          </div>
        );
    }
  };

  if (!usuario) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay escuro quando menu está aberto no mobile */}
      {mobileMenuAberto && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuAberto(false)}
        />
      )}

      {/* Menu Lateral */}
      <div className={`
        fixed md:relative z-50 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transition-transform duration-300 ease-in-out
        ${mobileMenuAberto ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 border-blue-400">
                <img 
                  src="/image/vailsonhair.jpg" 
                  alt="Logo Vailson Hair" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">Vailson Hair</h2>
                <p className="text-xs text-gray-400">Salão de Beleza</p>
              </div>
            </div>
          </div>

          {/* Botão fechar no mobile */}
          {isMobile && (
            <button 
              onClick={() => setMobileMenuAberto(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Menu Items - Agora dinâmico */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map(item => {
              const Icone = item.icone;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setMenuAtivo(item.id);
                    if (isMobile) setMobileMenuAberto(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-6 py-3 transition-all
                    ${menuAtivo === item.id 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icone className="w-5 h-5" />
                  <span>{item.nome}</span>
                </button>
              );
            })}
          </nav>

          {/* Informações do usuário e botão Sair */}
          <div className="p-4 border-t border-gray-800">
            <div className="mb-3 px-3 py-2 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm font-medium text-white truncate">{usuario?.nome}</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-blue-400" />
                <p className="text-xs text-blue-400 capitalize">{usuario?.nivel}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com botão do menu mobile */}
        <header className="bg-white shadow-sm p-4 flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuAberto(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="ml-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-400">
              <img 
                src="/image/vailsonhair.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Vailson Hair</h1>
          </div>
        </header>

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;