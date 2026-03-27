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
    agendamentos,
    formData,
    setFormData,
    loading,
    profissionais,
    funcionarios,
    clientes,
    servicos,
    abrirNovoAgendamento,
    abrirEditarAgendamento,
    salvarAgendamento,
    excluirAgendamento,
    isFuncionario,
    horarioInicial,        // 🔥 JÁ TEM
    setHorarioInicial      // 🔥 JÁ TEM
  } = useAgendamentos();

  const { usuario, temPermissao } = useAuth();

  React.useEffect(() => {
    console.log('🎯 Agendamentos no componente:', {
      total: agendamentos.length,
      isFuncionario,
      profissionais: profissionais.map(p => p.nome),
      horarioInicial // 🔥 VERIFICAR SE ESTÁ CHEGANDO
    });
  }, [agendamentos, isFuncionario, profissionais, horarioInicial]);

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
          agendamentos={agendamentos}
          dataSelecionada={dataSelecionada}
          profissionais={profissionais}
          servicos={servicos}
        />
      </div>

      {/* Timeline de Agendamentos */}
      <TimelineAgendamentos 
        dataSelecionada={dataSelecionada}
        agendamentos={agendamentos}
        onEditar={temPermissao('agendamentos', 'editar') ? abrirEditarAgendamento : null}
        onNovo={temPermissao('agendamentos', 'editar') ? abrirNovoAgendamento : null}
        profissionais={profissionais}
        filtroProfissional={filtroProfissional}
        filtroServico={filtroServico}
      />

      {/* Lista de Agendamentos do Dia (para mobile) */}
      <ListaMobile 
        dataSelecionada={dataSelecionada}
        agendamentos={agendamentos}
        onEditar={temPermissao('agendamentos', 'editar') ? abrirEditarAgendamento : null}
        profissionais={profissionais}
      />

      {/* Modal de Agendamento - 🔥 ADICIONAR horarioInicial */}
      {temPermissao('agendamentos', 'editar') && (
        <ModalAgendamento
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setHorarioInicial(null); // 🔥 Limpar ao fechar
          }}
          agendamentoSelecionado={agendamentoSelecionado}
          formData={formData}
          setFormData={setFormData}
          onSalvar={salvarAgendamento}
          onExcluir={temPermissao('agendamentos', 'excluir') ? excluirAgendamento : null}
          profissionais={profissionais}
          servicos={servicos}
          clientes={clientes}
          horarioInicial={horarioInicial} // 🔥 PASSAR O HORÁRIO INICIAL
        />
      )}
    </div>
  );
};

export default Agendamentos;
