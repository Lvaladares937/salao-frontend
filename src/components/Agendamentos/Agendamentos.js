import React from 'react';
import { Plus, Loader } from 'lucide-react';
import { useAgendamentos } from './useAgendamentos';
import { useAuth } from '../../contexts/AuthContext';
import CalendarioNavegacao from './CalendarioNavegacao';
import Filtros from './Filtros';
import TimelineAgendamentos from './TimelineAgendamentos';
import ListaMobile from './ListaMobile';
import ModalAgendamento from './ModalAgendamento';

const Agendamentos = () => {
  const {
    dataSelecionada,
    setDataSelecionada,
    showModal,
    setShowModal,
    agendamentoSelecionado,
    filtroProfissional,
    setFiltroProfissional,
    filtroServico,
    setFiltroServico,
    agendamentos, // 👈 JÁ VEM FILTRADO DO HOOK!
    formData,
    setFormData,
    loading,
    profissionais, // 👈 JÁ VEM FILTRADO DO HOOK!
    funcionarios,
    clientes,
    servicos,
    abrirNovoAgendamento,
    abrirEditarAgendamento,
    salvarAgendamento,
    excluirAgendamento,
    isFuncionario // 👈 PEGA DO HOOK
  } = useAgendamentos();

  const { usuario, temPermissao } = useAuth();

  // 👇 REMOVA ESTA LINHA - NÃO FAÇA FILTRAGEM DUPLA!
  // const agendamentosFiltrados = filtrarPorFuncionario(agendamentos, 'funcionario_id');

  // 👇 LOG PARA DEBUG
  React.useEffect(() => {
    console.log('🎯 Agendamentos no componente:', {
      total: agendamentos.length,
      isFuncionario,
      profissionais: profissionais.map(p => p.nome)
    });
  }, [agendamentos, isFuncionario, profissionais]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando agendamentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">
            {isFuncionario 
              ? 'Seus agendamentos' 
              : 'Gerencie os horários e serviços agendados'}
          </p>
        </div>
        {temPermissao('agendamentos', 'editar') && (
          <button 
            onClick={() => abrirNovoAgendamento()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        )}
      </div>

      {/* Filtros e Navegação */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <CalendarioNavegacao 
          dataSelecionada={dataSelecionada}
          setDataSelecionada={setDataSelecionada}
        />
        
        <Filtros 
          filtroProfissional={filtroProfissional}
          setFiltroProfissional={setFiltroProfissional}
          filtroServico={filtroServico}
          setFiltroServico={setFiltroServico}
          agendamentos={agendamentos} // 👈 USA agendamentos DIRETO
          dataSelecionada={dataSelecionada}
          profissionais={profissionais} // 👈 JÁ VEM FILTRADO
          servicos={servicos}
        />
      </div>

      {/* Timeline de Agendamentos */}
      <TimelineAgendamentos 
        dataSelecionada={dataSelecionada}
        agendamentos={agendamentos} // 👈 USA agendamentos DIRETO
        onEditar={temPermissao('agendamentos', 'editar') ? abrirEditarAgendamento : null}
        onNovo={temPermissao('agendamentos', 'editar') ? abrirNovoAgendamento : null}
        profissionais={profissionais} // 👈 JÁ VEM FILTRADO!
        filtroProfissional={filtroProfissional}
        filtroServico={filtroServico}
      />

      {/* Lista de Agendamentos do Dia (para mobile) */}
      <ListaMobile 
        dataSelecionada={dataSelecionada}
        agendamentos={agendamentos} // 👈 USA agendamentos DIRETO
        onEditar={temPermissao('agendamentos', 'editar') ? abrirEditarAgendamento : null}
        profissionais={profissionais} // 👈 JÁ VEM FILTRADO
      />

      {/* Modal de Agendamento */}
      {temPermissao('agendamentos', 'editar') && (
        <ModalAgendamento
          show={showModal}
          onClose={() => setShowModal(false)}
          agendamentoSelecionado={agendamentoSelecionado}
          formData={formData}
          setFormData={setFormData}
          onSalvar={salvarAgendamento}
          onExcluir={temPermissao('agendamentos', 'excluir') ? excluirAgendamento : null}
          profissionais={profissionais} // 👈 JÁ VEM FILTRADO!
          servicos={servicos}
          clientes={clientes}
        />
      )}
    </div>
  );
};

export default Agendamentos;