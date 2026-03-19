// src/components/Clientes/useClientes.js
import { useState, useEffect, useCallback } from 'react';
import clientesService from '../../services/clientesService';
import { useAuth } from '../../contexts/AuthContext'; // 👈 IMPORTAR useAuth

export const useClientes = () => {
  const { usuario, temPermissao } = useAuth(); // 👈 PEGAR USUÁRIO DO CONTEXTO
  
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  
  const itemsPerPage = 10;

  // LOG PARA DEBUG
  useEffect(() => {
    console.log('👤 useClientes - usuário:', {
      id: usuario?.id,
      nome: usuario?.nome,
      nivel: usuario?.nivel,
      funcionarioId: usuario?.funcionarioId
    });
  }, [usuario]);

  // Carregar clientes
  const carregarClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientesService.listar();
      console.log('📦 Clientes carregados:', data.length);
      setClientes(data);
      setClientesFiltrados(data);
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  // Filtrar clientes baseado no searchTerm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setClientesFiltrados(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, clientes]);

  const abrirNovoCliente = () => {
    setClienteSelecionado(null);
    setShowModal(true);
  };

  const abrirEditarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setShowModal(true);
  };

  const abrirVisualizarCliente = (cliente) => {
    alert(JSON.stringify(cliente, null, 2));
  };

  const salvarCliente = async (clienteData) => {
    try {
      if (clienteSelecionado) {
        await clientesService.atualizar(clienteSelecionado.id, clienteData);
      } else {
        await clientesService.criar(clienteData);
      }
      await carregarClientes();
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('Erro ao salvar cliente');
    }
  };

  const excluirCliente = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clientesService.excluir(id);
        await carregarClientes();
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        alert('Erro ao excluir cliente');
      }
    }
  };

  // Paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);

  // Permissões baseadas no usuário
  const permissoes = {
    podeAdicionar: temPermissao?.('clientes', 'adicionar') || usuario?.nivel === 'admin' || usuario?.nivel === 'gerente',
    podeEditar: temPermissao?.('clientes', 'editar') || usuario?.nivel === 'admin' || usuario?.nivel === 'gerente',
    podeExcluir: temPermissao?.('clientes', 'excluir') || usuario?.nivel === 'admin'
  };

  return {
    clientes,
    clientesFiltrados,
    clientesPaginados,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    showModal,
    setShowModal,
    clienteSelecionado,
    abrirNovoCliente,
    abrirEditarCliente,
    abrirVisualizarCliente,
    salvarCliente,
    excluirCliente,
    permissoes,
    usuario // 👈 RETORNAR USUÁRIO PARA O COMPONENTE
  };
};