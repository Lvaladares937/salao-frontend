import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Eye,
  Phone,
  Mail,
  Calendar,
  User
} from 'lucide-react';
import { useClientes } from './useClientes';
import ClienteForm from './ClienteForm';

function ClienteList() {
  const {
    clientesPaginados,
    loading,
    error,
    showModal,
    setShowModal,
    clienteSelecionado,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    clientesFiltrados,
    abrirNovoCliente,
    abrirEditarCliente,
    abrirVisualizarCliente,
    salvarCliente,
    excluirCliente,
    permissoes,
    usuario
  } = useClientes();

  const formatarTelefone = (telefone) => {
    if (!telefone) return '-';
    return telefone;
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // 👇 VERIFICAÇÃO CORRETA: só funcionário tem dados ocultos
  const isFuncionario = usuario?.nivel === 'funcionario';
  const isAdminOuGerente = usuario?.nivel === 'admin' || usuario?.nivel === 'gerente';

  // Priorizar exibição: Email tem prioridade sobre Telefone
  const getContatoPrincipal = (cliente) => {
    if (cliente.email) {
      return {
        tipo: 'email',
        valor: cliente.email,
        icone: Mail,
        cor: 'text-purple-600',
        bg: 'bg-purple-100'
      };
    } else if (cliente.telefone) {
      return {
        tipo: 'telefone',
        valor: formatarTelefone(cliente.telefone),
        icone: Phone,
        cor: 'text-green-600',
        bg: 'bg-green-100'
      };
    } else {
      return {
        tipo: 'sem_contato',
        valor: 'Sem contato',
        icone: User,
        cor: 'text-gray-400',
        bg: 'bg-gray-100'
      };
    }
  };

  // Componente para renderizar contato com proteção de dados
  const RenderContato = ({ cliente }) => {
    // 👇 FUNCIONÁRIO: não vê dados de contato
    if (isFuncionario) {
      return (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gray-100">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 italic">Dados restritos</p>
            <p className="text-xs text-gray-400">Apenas administradores</p>
          </div>
        </div>
      );
    }

    // 👇 ADMIN/GERENTE: veem tudo normal
    const contato = getContatoPrincipal(cliente);
    const IconeContato = contato.icone;

    return (
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${contato.bg}`}>
          <IconeContato className={`w-4 h-4 ${contato.cor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-900">{contato.valor}</p>
          {cliente.telefone && cliente.email && (
            <p className="text-xs text-gray-500">
              Tel: {formatarTelefone(cliente.telefone)}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            {isFuncionario ? 'Consulta de clientes' : 'Gerencie seus clientes'}
          </p>
          {/* 👇 AVISO SÓ PARA FUNCIONÁRIO */}
          {isFuncionario && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Dados de contato visíveis apenas para administradores
            </p>
          )}
        </div>
        
        {/* Botão NOVO CLIENTE - SÓ PARA QUEM TEM PERMISSÃO (admin/gerente) */}
        {permissoes?.podeAdicionar && !isFuncionario && (
          <button 
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={abrirNovoCliente}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Novo Cliente</span>
          </button>
        )}
      </div>

      {/* Estatísticas (visível para todos) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-blue-600">{clientesFiltrados.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Com E-mail</p>
              <p className="text-2xl font-bold text-purple-600">
                {clientesFiltrados.filter(c => c.email).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Com Telefone</p>
              <p className="text-2xl font-bold text-green-600">
                {clientesFiltrados.filter(c => c.telefone).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            // 👇 Placeholder diferente para funcionário
            placeholder={isFuncionario ? "Buscar por nome..." : "Buscar por nome, telefone ou email..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {/* 👇 AVISO SÓ PARA FUNCIONÁRIO */}
        {isFuncionario && (
          <p className="text-xs text-gray-400 mt-2">
            * Busca disponível apenas por nome
          </p>
        )}
      </div>

      {/* Modal do Formulário - SÓ PARA ADMIN/GERENTE */}
      {showModal && !isFuncionario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {clienteSelecionado ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ClienteForm
                cliente={clienteSelecionado}
                onSave={salvarCliente}
                onCancel={() => setShowModal(false)}
                modo={clienteSelecionado ? 'editar' : 'novo'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando clientes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : clientesPaginados.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum cliente encontrado</p>
            {permissoes?.podeAdicionar && !isFuncionario && (
              <button 
                onClick={abrirNovoCliente}
                className="mt-4 btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Cadastrar primeiro cliente
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Cards para mobile */}
            <div className="block sm:hidden divide-y divide-gray-200">
              {clientesPaginados.map(cliente => (
                <div key={cliente.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{cliente.nome}</p>
                      <p className="text-xs text-gray-500">ID: {cliente.id}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Cliente
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {/* 👇 FUNCIONÁRIO: não vê contato */}
                    {isFuncionario ? (
                      <p className="text-sm text-gray-400 italic">
                        Dados de contato restritos
                      </p>
                    ) : (
                      /* 👇 ADMIN/GERENTE: vê tudo */
                      <>
                        {cliente.email && (
                          <p className="text-sm flex items-center gap-2 text-purple-600">
                            <Mail className="w-4 h-4" />
                            {cliente.email}
                          </p>
                        )}
                        {cliente.telefone && (
                          <p className="text-sm flex items-center gap-2 text-green-600">
                            <Phone className="w-4 h-4" />
                            {formatarTelefone(cliente.telefone)}
                          </p>
                        )}
                      </>
                    )}
                    
                    {cliente.data_nascimento && (
                      <p className="text-sm flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatarData(cliente.data_nascimento)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Botão VER - funciona diferente para cada tipo */}
                    <button 
                      onClick={() => {
                        if (isFuncionario) {
                          alert(`Cliente: ${cliente.nome}\n\nDados de contato disponíveis apenas para administradores.`);
                        } else {
                          abrirVisualizarCliente(cliente);
                        }
                      }}
                      className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    
                    {/* Botão EDITAR - SÓ ADMIN/GERENTE */}
                    {permissoes?.podeEditar && !isFuncionario && (
                      <button 
                        onClick={() => abrirEditarCliente(cliente)}
                        className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                    )}
                    
                    {/* Botão EXCLUIR - SÓ ADMIN/GERENTE */}
                    {permissoes?.podeExcluir && !isFuncionario && (
                      <button 
                        onClick={() => excluirCliente(cliente.id)}
                        className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela para desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nascimento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clientesPaginados.map(cliente => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{cliente.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {cliente.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{cliente.nome}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RenderContato cliente={cliente} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarData(cliente.data_nascimento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {/* Botão VER */}
                          <button 
                            onClick={() => {
                              if (isFuncionario) {
                                alert(`Cliente: ${cliente.nome}\n\nDados de contato disponíveis apenas para administradores.`);
                              } else {
                                abrirVisualizarCliente(cliente);
                              }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          {/* Botão EDITAR - SÓ ADMIN/GERENTE */}
                          {permissoes?.podeEditar && !isFuncionario && (
                            <button 
                              onClick={() => abrirEditarCliente(cliente)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                          
                          {/* Botão EXCLUIR - SÓ ADMIN/GERENTE */}
                          {permissoes?.podeExcluir && !isFuncionario && (
                            <button 
                              onClick={() => excluirCliente(cliente.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação (visível para todos) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, clientesFiltrados.length)}
                  </span>{' '}
                  de <span className="font-medium">{clientesFiltrados.length}</span> clientes
                </div>
                <div className="flex gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ClienteList;