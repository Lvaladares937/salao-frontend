import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Users, Package, DollarSign, Calendar, TrendingUp,
  ShoppingBag, Clock, AlertTriangle, CheckCircle, XCircle,
  RefreshCw
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import DashboardFuncionario from './DashboardFuncionario'; // 👈 CORRIGIDO

const Dashboard = () => {
  const { usuario } = useAuth();
  const isFuncionario = usuario?.nivel === 'funcionario';

  // Se for funcionário, mostra o dashboard específico
  if (isFuncionario) {
    return <DashboardFuncionario />;
  }

  // Para admin/gerente, mostra o dashboard completo
  const DashboardAdmin = () => {
    const {
      loading,
      dados,
      vendasSemana,
      servicosMaisVendidos,
      horariosPico,
      clientesPorDia,
      estoqueCritico,
      agendamentosRecentes,
      alertas,
      carregarDados
    } = useDashboard();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const Card = ({ titulo, valor, icone: Icone, cor, subtitulo }) => {
      const isCurrency = titulo.includes('Vendas') || titulo.includes('Ticket');
      const displayValue = isCurrency 
        ? valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
        : valor;

      return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{titulo}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">
              {displayValue ?? 0}
            </p>
            {subtitulo && <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>}
          </div>
          <div className={`p-4 rounded-xl ${cor}`}>
            <Icone className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando dashboard...</span>
        </div>
      );
    }

    const horarioPicoCard = horariosPico?.length > 0 
      ? horariosPico.reduce((max, h) => h.agendamentos > (max?.agendamentos || 0) ? h : max, { agendamentos: 0 }).hora 
      : '--:--';
    
    const agendamentosPico = horariosPico?.length > 0
      ? horariosPico.reduce((max, h) => h.agendamentos > (max?.agendamentos || 0) ? h : max, { agendamentos: 0 }).agendamentos
      : 0;

    const ocupacao = dados?.agendamentosHoje > 0 
      ? Math.min(Math.round((dados.agendamentosHoje / 20) * 100), 100) 
      : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button 
            onClick={carregarDados}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card 
            titulo="Vendas Hoje"
            valor={dados?.vendasHoje || 0}
            icone={DollarSign}
            cor="bg-gradient-to-br from-green-400 to-green-600"
            subtitulo="Total do dia"
          />
          <Card 
            titulo="Clientes Hoje"
            valor={dados?.clientesHoje || 0}
            icone={Users}
            cor="bg-gradient-to-br from-blue-400 to-blue-600"
            subtitulo={`${dados?.servicosHoje || 0} serviços realizados`}
          />
          <Card 
            titulo="Ticket Médio"
            valor={dados?.ticketMedio || 0}
            icone={ShoppingBag}
            cor="bg-gradient-to-br from-purple-400 to-purple-600"
            subtitulo="Média por serviço"
          />
          <Card 
            titulo="Agendamentos Hoje"
            valor={dados?.agendamentosHoje || 0}
            icone={Calendar}
            cor="bg-gradient-to-br from-yellow-400 to-yellow-600"
            subtitulo={`${ocupacao}% de ocupação`}
          />
          <Card 
            titulo="Produtos em Falta"
            valor={dados?.produtosBaixoEstoque || 0}
            icone={Package}
            cor="bg-gradient-to-br from-red-400 to-red-600"
            subtitulo="Precisam de reposição"
          />
          <Card 
            titulo="Horário de Pico"
            valor={horarioPicoCard}
            icone={Clock}
            cor="bg-gradient-to-br from-indigo-400 to-indigo-600"
            subtitulo={`${agendamentosPico} agendamentos`}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendas por dia */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Vendas por Dia da Semana</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={vendasSemana?.length > 0 ? vendasSemana : [{ dia: 'Sem dados', vendas: 0 }]}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value?.toLocaleString('pt-BR') || '0'}`} />
                <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVendas)" name="Vendas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Serviços mais vendidos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Serviços Mais Vendidos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={servicosMaisVendidos?.length > 0 ? servicosMaisVendidos : [{ name: 'Sem dados', quantidade: 1 }]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {(servicosMaisVendidos?.length > 0 ? servicosMaisVendidos : [{ name: 'Sem dados', quantidade: 1 }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Horários de pico */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Horários de Pico</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={horariosPico?.length > 0 ? horariosPico : [{ hora: 'Sem dados', agendamentos: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="agendamentos" fill="#f59e0b" name="Agendamentos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clientes por dia */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Clientes por Dia</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clientesPorDia?.length > 0 ? clientesPorDia : [{ dia: 'Sem dados', clientes: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clientes" stroke="#10b981" strokeWidth={2} name="Clientes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estoque Crítico */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Estoque Crítico</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos os produtos
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Mínimo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estoqueCritico?.length > 0 ? (
                  estoqueCritico.map((produto, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-semibold ${
                          produto.quantidade <= 2 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {produto.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{produto.minimo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {produto.quantidade <= 2 ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Crítico
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            Baixo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Repor estoque
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Nenhum produto com estoque baixo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Últimos Agendamentos</h2>
            <div className="space-y-3">
              {agendamentosRecentes?.length > 0 ? (
                agendamentosRecentes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.cliente}</p>
                        <p className="text-sm text-gray-600">{item.servico} - {item.horario}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Confirmado' || item.status === 'confirmado'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum agendamento recente</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Alertas e Notificações</h2>
            <div className="space-y-3">
              {alertas?.length > 0 ? (
                alertas.map((alerta, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                    alerta.tipo === 'estoque' ? 'bg-yellow-50 border-yellow-400' :
                    alerta.tipo === 'cancelamento' ? 'bg-red-50 border-red-400' :
                    'bg-green-50 border-green-400'
                  }`}>
                    {alerta.tipo === 'estoque' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {alerta.tipo === 'cancelamento' && <XCircle className="w-5 h-5 text-red-600" />}
                    {alerta.tipo === 'meta' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    <div>
                      <p className="font-medium text-gray-900">{alerta.mensagem}</p>
                      <p className="text-sm text-gray-600">{alerta.detalhe}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum alerta no momento</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <DashboardAdmin />;
};

export default Dashboard;