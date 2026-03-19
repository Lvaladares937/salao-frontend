import React from 'react';
import { Filter, User } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext'; // 👈 IMPORTAR useAuth

const Filtros = ({ 
  filtroProfissional, 
  setFiltroProfissional, 
  filtroServico, 
  setFiltroServico,
  agendamentos,
  dataSelecionada,
  profissionais,
  servicos
}) => {
  const { usuario } = useAuth(); // 👈 PEGAR USUÁRIO LOGADO
  const isFuncionario = usuario?.nivel === 'funcionario';

  // Calcular estatísticas do dia com segurança
  const agendamentosDoDia = agendamentos?.filter(ag => 
    ag?.data_hora && isSameDay(new Date(ag.data_hora), dataSelecionada)
  ) || [];
  
  const total = agendamentosDoDia.length;
  const confirmados = agendamentosDoDia.filter(a => a?.status === 'confirmado').length;
  const agendados = agendamentosDoDia.filter(a => a?.status === 'agendado').length;

  // 👇 Se for funcionário, mostra versão SIMPLIFICADA
  if (isFuncionario) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-700">
            Meus Agendamentos
          </h3>
        </div>
        
        {/* Informação do funcionário logado */}
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <span className="font-semibold">👤 Profissional:</span>
            {usuario?.nome}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Mostrando apenas seus agendamentos
          </p>
        </div>

        {/* Estatísticas do dia - MANTÉM para funcionário */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Meus Agendamentos</p>
            <p className="text-xl font-bold text-blue-600">{total}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Confirmados</p>
            <p className="text-xl font-bold text-green-600">{confirmados}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Em aberto</p>
            <p className="text-xl font-bold text-yellow-600">{agendados}</p>
          </div>
        </div>
      </div>
    );
  }

  // 👇 Admin/Gerente vê versão COMPLETA com filtros
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Filtros
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Filtro por Profissional - SÓ PARA ADMIN/GERENTE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profissional
          </label>
          <select 
            value={filtroProfissional}
            onChange={(e) => setFiltroProfissional(e.target.value)}
            className="input-field"
          >
            <option value="todos">Todos os profissionais</option>
            {profissionais && profissionais.length > 0 ? (
              profissionais.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.nome}
                </option>
              ))
            ) : (
              <option disabled>Carregando profissionais...</option>
            )}
          </select>
        </div>
        
        {/* Filtro por Serviço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serviço
          </label>
          <select 
            value={filtroServico}
            onChange={(e) => setFiltroServico(e.target.value)}
            className="input-field"
          >
            <option value="todos">Todos os serviços</option>
            {servicos && servicos.length > 0 ? (
              servicos.map(serv => (
                <option key={serv.id} value={serv.id}>
                  {serv.nome}
                </option>
              ))
            ) : (
              <option disabled>Carregando serviços...</option>
            )}
          </select>
        </div>
      </div>

      {/* Estatísticas do dia */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600">Agendamentos</p>
          <p className="text-xl font-bold text-blue-600">{total}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600">Confirmados</p>
          <p className="text-xl font-bold text-green-600">{confirmados}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600">Em aberto</p>
          <p className="text-xl font-bold text-yellow-600">{agendados}</p>
        </div>
      </div>
    </div>
  );
};

export default Filtros;