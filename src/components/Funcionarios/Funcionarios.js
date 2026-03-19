import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, Users, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useFuncionarios } from './useFuncionarios';
import ListaFuncionarios from './ListaFuncionarios';
import CalendarioPonto from './CalendarioPonto';
import ModalFuncionario from './ModalFuncionario';
import Comissoes from './Comissoes';
import Pagamentos from './Pagamentos';
import { meses, anos } from './constants';
import { formatarMoeda } from './helpers';
import api from '../../services/api';

const Funcionarios = () => {
  const {
    // Estados
    funcionarios,
    funcionarioSelecionado,
    setFuncionarioSelecionado,
    mesSelecionado,
    setMesSelecionado,
    anoSelecionado,
    setAnoSelecionado,
    pontoData,
    pagamentos,
    
    // Funções
    marcarDia,
    salvarPonto,
    calcularResumo,
    selecionarFuncionario,
    limparSelecao,
    mudarMesAno,
    
    // Funções de pagamento/comissão
    carregarPagamentos,
    verificarPagamentoRealizado,
    registrarPagamento,
    
    // Funções de adiantamento
    adiantamentos,
    registrarAdiantamento,
    removerAdiantamento,
    
    // Estados do Modal
    showModal,
    setShowModal,
    modalModo,
    setModalModo,
    adicionarFuncionario,
    atualizarFuncionario,
    desativarFuncionario
  } = useFuncionarios();

  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [totalComissao, setTotalComissao] = useState(0);

  // Calcular resumo do ponto para o funcionário selecionado
  const resumo = funcionarioSelecionado 
    ? calcularResumo(funcionarioSelecionado.salario_base) 
    : { diasTrabalhados: 0, totalDescontos: 0, salarioFinal: 0, valorDia: 0 };

  // Calcular salário total com comissão
  const salarioComComissao = resumo.salarioFinal + totalComissao;

  const handleMesAnterior = () => {
    if (mesSelecionado === 0) {
      mudarMesAno(11, anoSelecionado - 1);
    } else {
      mudarMesAno(mesSelecionado - 1, anoSelecionado);
    }
    setTotalComissao(0);
  };

  const handleProximoMes = () => {
    if (mesSelecionado === 11) {
      mudarMesAno(0, anoSelecionado + 1);
    } else {
      mudarMesAno(mesSelecionado + 1, anoSelecionado);
    }
    setTotalComissao(0);
  };

  const handleVisualizarFuncionario = async (func) => {
    await selecionarFuncionario(func);
    setAbaAtiva('ponto');
    setTotalComissao(0);
  };

  const handleEditarFuncionario = (func) => {
    setFuncionarioSelecionado(func);
    setModalModo('editar');
    setShowModal(true);
  };

  const handleNovoFuncionario = () => {
    setFuncionarioSelecionado(null);
    setModalModo('novo');
    setShowModal(true);
  };

  const handleSalvarFuncionario = (funcionarioData) => {
    if (modalModo === 'editar' && funcionarioSelecionado) {
      atualizarFuncionario(funcionarioSelecionado.id, funcionarioData);
      alert('Funcionário atualizado com sucesso!');
    } else {
      adicionarFuncionario(funcionarioData);
      alert('Funcionário cadastrado com sucesso!');
    }
    setShowModal(false);
  };

  const handleDesativarFuncionario = (id) => {
    if (window.confirm('Tem certeza que deseja desativar este funcionário?')) {
      desativarFuncionario(id);
      alert('Funcionário desativado com sucesso!');
    }
  };

  const handleMarcarDia = (dataStr, info) => {
    marcarDia(dataStr, info);
  };

  const handleSalvarPonto = async () => {
    if (funcionarioSelecionado) {
      await salvarPonto(
        funcionarioSelecionado.id,
        mesSelecionado,
        anoSelecionado,
        pontoData
      );
    }
  };

  const handleRegistrarPagamento = async (totalAdiantamentos = 0) => {
    if (!funcionarioSelecionado) return;
    
    const valorLiquido = salarioComComissao - totalAdiantamentos;
    
    const confirmar = window.confirm(
      `Registrar pagamento de ${formatarMoeda(valorLiquido)} para ${funcionarioSelecionado.nome}?\n\n` +
      `Salário Base: ${formatarMoeda(funcionarioSelecionado.salario_base)}\n` +
      `Descontos: ${formatarMoeda(resumo.totalDescontos)}\n` +
      `Comissões: ${formatarMoeda(totalComissao)}\n` +
      `Adiantamentos: ${formatarMoeda(totalAdiantamentos)}\n` +
      `Valor Final: ${formatarMoeda(valorLiquido)}`
    );
    
    if (confirmar) {
      try {
        // ✅ ÚNICA CHAMADA - Isso já registra no banco e o financeiro puxa de lá
        await registrarPagamento(
          funcionarioSelecionado.id,
          mesSelecionado,
          anoSelecionado,
          {
            valor: valorLiquido,
            salarioBase: funcionarioSelecionado.salario_base,
            descontos: resumo.totalDescontos,
            comissoes: totalComissao,
            adiantamentos: totalAdiantamentos
          }
        );
        
        alert('Pagamento registrado com sucesso!');
      } catch (error) {
        alert('Erro ao registrar pagamento: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-600 mt-1">Gerencie sua equipe, ponto e pagamentos</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleNovoFuncionario}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* Seletor de Mês/Ano */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleMesAnterior}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <select
              value={mesSelecionado}
              onChange={(e) => mudarMesAno(parseInt(e.target.value), anoSelecionado)}
              className="input-field w-40"
            >
              {meses.map((mes, index) => (
                <option key={index} value={index}>{mes}</option>
              ))}
            </select>
            
            <select
              value={anoSelecionado}
              onChange={(e) => mudarMesAno(mesSelecionado, parseInt(e.target.value))}
              className="input-field w-24"
            >
              {anos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleProximoMes}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setAbaAtiva('lista')}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            abaAtiva === 'lista'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Lista de Funcionários
        </button>
        
        <button
          onClick={() => setAbaAtiva('ponto')}
          disabled={!funcionarioSelecionado}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            !funcionarioSelecionado && 'opacity-50 cursor-not-allowed'
          } ${
            abaAtiva === 'ponto' && funcionarioSelecionado
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Folha de Ponto
        </button>
        
        <button
          onClick={() => setAbaAtiva('comissoes')}
          disabled={!funcionarioSelecionado}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            !funcionarioSelecionado && 'opacity-50 cursor-not-allowed'
          } ${
            abaAtiva === 'comissoes' && funcionarioSelecionado
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Comissões
        </button>
        
        <button
          onClick={() => setAbaAtiva('pagamentos')}
          disabled={!funcionarioSelecionado}
          className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
            !funcionarioSelecionado && 'opacity-50 cursor-not-allowed'
          } ${
            abaAtiva === 'pagamentos' && funcionarioSelecionado
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Pagamentos
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6">
        {abaAtiva === 'lista' && (
          <ListaFuncionarios
            funcionarios={funcionarios}
            onSelecionar={selecionarFuncionario}
            onEditar={handleEditarFuncionario}
            onDesativar={handleDesativarFuncionario}
            onVisualizar={handleVisualizarFuncionario}
          />
        )}

        {abaAtiva === 'ponto' && !funcionarioSelecionado && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Selecione um funcionário</strong> na aba "Lista de Funcionários" para visualizar a folha de ponto.
                </p>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'ponto' && funcionarioSelecionado && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CalendarioPonto
                ano={anoSelecionado}
                mes={mesSelecionado}
                ponto={pontoData}
                onMarcarDia={handleMarcarDia}
                salarioBase={Number(funcionarioSelecionado.salario_base) || 0}
              />
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSalvarPonto}
                  className="btn-primary px-6 py-2"
                >
                  Salvar Ponto
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {funcionarioSelecionado.nome}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Especialidade:</span> {funcionarioSelecionado.especialidade || 'Não informada'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Desde:</span> {funcionarioSelecionado.data_contratacao 
                      ? new Date(funcionarioSelecionado.data_contratacao).toLocaleDateString() 
                      : 'Não informado'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Comissão:</span> {funcionarioSelecionado.comissao_percentual || 0}%
                  </p>
                </div>

                <h4 className="font-medium text-gray-700 mb-3">Resumo do Mês</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dias trabalhados:</span>
                    <span className="font-semibold text-green-600">{resumo.diasTrabalhados}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor por dia:</span>
                    <span className="font-semibold">{formatarMoeda(resumo.valorDia)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Salário base:</span>
                    <span className="font-semibold">{formatarMoeda(funcionarioSelecionado.salario_base)}</span>
                  </div>
                  
                  <div className="flex justify-between text-red-600">
                    <span>Total descontos:</span>
                    <span className="font-semibold">- {formatarMoeda(resumo.totalDescontos)}</span>
                  </div>
                  
                  <div className="flex justify-between text-green-600">
                    <span>Comissões do mês:</span>
                    <span className="font-semibold">+ {formatarMoeda(totalComissao)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t text-lg font-bold">
                    <span>Total a receber:</span>
                    <span className="text-blue-600">{formatarMoeda(salarioComComissao)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Clique em qualquer dia para abrir o menu de opções e marcar como trabalhado, falta (com desconto), falta justificada, feriado ou folga.
                </p>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'comissoes' && !funcionarioSelecionado && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Selecione um funcionário</strong> na aba "Lista de Funcionários" para visualizar as comissões.
                </p>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'comissoes' && funcionarioSelecionado && (
          <Comissoes
            funcionario={funcionarioSelecionado}
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            onComissaoCalculada={setTotalComissao}
          />
        )}

        {abaAtiva === 'pagamentos' && !funcionarioSelecionado && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Selecione um funcionário</strong> na aba "Lista de Funcionários" para visualizar os pagamentos.
                </p>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'pagamentos' && funcionarioSelecionado && (
          <Pagamentos
            funcionario={funcionarioSelecionado}
            salarioFinal={salarioComComissao}
            totalDescontos={resumo.totalDescontos}
            salarioBase={funcionarioSelecionado.salario_base}
            diasTrabalhados={resumo.diasTrabalhados}
            valorDia={resumo.valorDia}
            totalComissao={totalComissao}
            pagamentoRealizado={verificarPagamentoRealizado(mesSelecionado, anoSelecionado)}
            onRegistrarPagamento={handleRegistrarPagamento}
            onVisualizarDetalhes={() => setAbaAtiva('ponto')}
            adiantamentos={adiantamentos}
            onRegistrarAdiantamento={(ad) => registrarAdiantamento(
              funcionarioSelecionado.id,
              mesSelecionado,
              anoSelecionado,
              ad
            )}
            onRemoverAdiantamento={(id) => removerAdiantamento(
              funcionarioSelecionado.id,
              mesSelecionado,
              anoSelecionado,
              id
            )}
          />
        )}
      </div>

      {/* Modal de Funcionário */}
      <ModalFuncionario
        show={showModal}
        onClose={() => setShowModal(false)}
        funcionario={funcionarioSelecionado}
        onSave={handleSalvarFuncionario}
        modo={modalModo}
      />
    </div>
  );
};

export default Funcionarios;