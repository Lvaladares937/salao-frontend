import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, DollarSign, CreditCard, Info, Clock } from 'lucide-react';
import { useConfiguracoesHorarios } from '../../hooks/useConfiguracoesHorarios';

const ModalAgendamento = ({
  show,
  onClose,
  agendamentoSelecionado,
  formData,
  setFormData,
  onSalvar,
  onExcluir,
  profissionais,
  servicos,
  clientes,
  agendamentosExistentes = [] // Adicionado para verificar horários ocupados
}) => {
  const { horariosDisponiveis, loading, config } = useConfiguracoesHorarios();
  
  const [statusAnterior, setStatusAnterior] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [comissaoCalculada, setComissaoCalculada] = useState(0);
  const [percentualComissao, setPercentualComissao] = useState(0);
  const [mostrarPagamento, setMostrarPagamento] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [bandeiraCartao, setBandeiraCartao] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [pagamentoRegistrado, setPagamentoRegistrado] = useState(false);
  const [horariosDoDia, setHorariosDoDia] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // Lista de bandeiras de cartão
  const bandeirasCartao = [
    'Visa',
    'Mastercard',
    'American Express',
    'Elo',
    'Hipercard',
    'Diners Club',
    'Discover',
    'Aura',
    'JCB',
    'Sorocred',
    'Credsystem',
    'Policard',
    'Agiplan',
    'Banes Card',
    'Calcard',
    'Up (Alelo)',
    'Sodexo',
    'Ticket Restaurante',
    'Vale (Alelo)'
  ];

  // Formas de pagamento
  const formasPagamento = [
    { id: 'dinheiro', nome: 'Dinheiro' },
    { id: 'pix', nome: 'PIX' },
    { id: 'debito', nome: 'Cartão de Débito' },
    { id: 'credito', nome: 'Cartão de Crédito' },
    { id: 'credito_parcelado', nome: 'Cartão de Crédito Parcelado' },
    { id: 'transferencia', nome: 'Transferência Bancária' },
    { id: 'fiado', nome: 'Fiado (Crediário)' }
  ];

  // Gerar horários disponíveis baseados nas configurações e agendamentos existentes
  useEffect(() => {
    if (formData.data && formData.profissionalId && horariosDisponiveis.length > 0) {
      // Buscar agendamentos já existentes para este profissional nesta data
      const agendamentosDoDia = agendamentosExistentes.filter(ag => {
        const dataAgendamento = ag.data_hora?.split(' ')[0];
        const profissionalId = ag.profissional_id || ag.profissionalId;
        return dataAgendamento === formData.data && 
               profissionalId === parseInt(formData.profissionalId);
      });
      
      // Extrair horários já ocupados
      const horariosOcupados = agendamentosDoDia.map(ag => {
        const horaCompleta = ag.data_hora?.split(' ')[1];
        return horaCompleta?.substring(0, 5); // Pega apenas HH:MM
      }).filter(h => h);
      
      // Se for edição, remover o horário do próprio agendamento da lista de ocupados
      if (agendamentoSelecionado && agendamentoSelecionado.hora) {
        const index = horariosOcupados.indexOf(agendamentoSelecionado.hora);
        if (index !== -1) {
          horariosOcupados.splice(index, 1);
        }
      }
      
      // Filtrar horários disponíveis
      const horariosLivres = horariosDisponiveis.filter(horario => 
        !horariosOcupados.includes(horario)
      );
      
      setHorariosDoDia(horariosLivres);
    } else {
      setHorariosDoDia(horariosDisponiveis);
    }
  }, [formData.data, formData.profissionalId, horariosDisponiveis, agendamentosExistentes, agendamentoSelecionado]);

  // Atualizar serviço selecionado quando mudar
  useEffect(() => {
    if (formData.servicoId) {
      const servico = servicos.find(s => s.id === parseInt(formData.servicoId));
      setServicoSelecionado(servico);
    } else {
      setServicoSelecionado(null);
    }
  }, [formData.servicoId, servicos]);

  // Atualizar profissional selecionado
  useEffect(() => {
    if (formData.profissionalId) {
      const prof = profissionais.find(p => p.id === parseInt(formData.profissionalId));
      setProfissionalSelecionado(prof);
    } else {
      setProfissionalSelecionado(null);
    }
  }, [formData.profissionalId, profissionais]);

  // Calcular comissão baseada no serviço e profissional
  useEffect(() => {
    if (servicoSelecionado && profissionalSelecionado) {
      // Pegar comissão do serviço (se tiver) ou a comissão padrão do profissional
      const percComissao = servicoSelecionado.comissao_percentual || 
                          profissionalSelecionado.comissao_percentual || 
                          30;
      
      setPercentualComissao(percComissao);
      
      const valorComissao = (parseFloat(servicoSelecionado.preco) * percComissao) / 100;
      setComissaoCalculada(valorComissao);
    } else {
      setComissaoCalculada(0);
      setPercentualComissao(0);
    }
  }, [servicoSelecionado, profissionalSelecionado]);

  // Salvar o status anterior quando o modal abrir
  useEffect(() => {
    if (agendamentoSelecionado) {
      setStatusAnterior(agendamentoSelecionado.status);
    }
  }, [agendamentoSelecionado, show]);

  // Quando o status muda para concluído, mostrar opções de pagamento
  useEffect(() => {
    if (formData.status === 'concluido') {
      setMostrarPagamento(true);
    } else {
      setMostrarPagamento(false);
    }
  }, [formData.status]);

  // Resetar estado do modal quando fechar
  useEffect(() => {
    if (!show) {
      setSalvando(false);
      setPagamentoRegistrado(false);
      setMostrarPagamento(false);
      setFormaPagamento('dinheiro');
      setBandeiraCartao('');
      setParcelas(1);
    }
  }, [show]);

  const handleSalvar = async () => {
    if (salvando) return;
    
    // Validações básicas
    if (!formData.clienteId) {
      alert('Selecione um cliente');
      return;
    }
    
    if (!formData.profissionalId) {
      alert('Selecione um profissional');
      return;
    }
    
    if (!formData.servicoId) {
      alert('Selecione um serviço');
      return;
    }
    
    if (!formData.data) {
      alert('Selecione uma data');
      return;
    }
    
    if (!formData.hora) {
      alert('Selecione um horário');
      return;
    }
    
    // Verificar se o horário ainda está disponível (evitar conflitos)
    if (!horariosDoDia.includes(formData.hora)) {
      alert('Este horário não está mais disponível. Por favor, selecione outro horário.');
      return;
    }
    
    // Verificar se é um agendamento concluído
    const statusMudouParaConcluido = 
      agendamentoSelecionado && 
      formData.status === 'concluido' && 
      statusAnterior !== 'concluido';

    // Se for concluído, validar forma de pagamento
    if (formData.status === 'concluido') {
      if (!formaPagamento) {
        alert('Selecione a forma de pagamento');
        return;
      }

      // Se for cartão de crédito parcelado, validar parcelas
      if (formaPagamento === 'credito_parcelado' && (!parcelas || parcelas < 1)) {
        alert('Selecione o número de parcelas');
        return;
      }

      // Se for cartão (débito ou crédito), validar bandeira
      if ((formaPagamento === 'debito' || formaPagamento === 'credito' || formaPagamento === 'credito_parcelado') && !bandeiraCartao) {
        alert('Selecione a bandeira do cartão');
        return;
      }
    }

    setSalvando(true);

    try {
      // Preparar dados do pagamento
      const dadosPagamento = formData.status === 'concluido' ? {
        forma_pagamento: formaPagamento,
        bandeira_cartao: bandeiraCartao || null,
        parcelas: parcelas || 1,
        valor_total: servicoSelecionado?.preco || 0,
        valor_comissao: comissaoCalculada,
        percentual_comissao: percentualComissao,
        data_pagamento: new Date().toISOString()
      } : null;

      // Preparar dados COMPLETOS do agendamento
      const dadosCompletos = {
        ...formData,
        // Garantir que os IDs sejam números
        clienteId: parseInt(formData.clienteId),
        profissionalId: parseInt(formData.profissionalId),
        servicoId: parseInt(formData.servicoId),
        // Se for edição, manter o ID
        ...(agendamentoSelecionado && { id: agendamentoSelecionado.id }),
        // Adicionar dados de pagamento se houver
        ...(dadosPagamento && { pagamento: dadosPagamento })
      };

      console.log('📝 Salvando agendamento completo:', dadosCompletos);

      // Chamar a função de salvar com os dados completos
      await onSalvar(dadosCompletos);

      // Se o status mudou para concluído, disparar evento
      if (statusMudouParaConcluido) {
        const evento = new CustomEvent('agendamentoConcluido', {
          detail: {
            agendamentoId: agendamentoSelecionado.id,
            funcionarioId: parseInt(formData.profissionalId),
            funcionarioNome: profissionalSelecionado?.nome,
            servicoNome: servicoSelecionado?.nome,
            valor: servicoSelecionado?.preco || 0,
            comissao: comissaoCalculada,
            data: formData.data,
            pagamento: dadosPagamento
          }
        });
        window.dispatchEvent(evento);
        
        console.log('🎉 Evento agendamentoConcluido disparado!', evento.detail);
      }

      // Resetar estado de pagamento
      setMostrarPagamento(false);
      setPagamentoRegistrado(true);
      
      // Fechar o modal após salvar
      onClose();
      
    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento. Verifique o console para mais detalhes.');
    } finally {
      setSalvando(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {agendamentoSelecionado ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={salvando}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select 
              className="input-field"
              value={formData.clienteId}
              onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
              disabled={salvando}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </div>

          {/* Profissional e Serviço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional *
              </label>
              <select 
                className="input-field"
                value={formData.profissionalId}
                onChange={(e) => {
                  setFormData({...formData, profissionalId: e.target.value});
                  // Resetar horário quando mudar profissional
                  setFormData(prev => ({...prev, hora: ''}));
                }}
                disabled={salvando}
              >
                <option value="">Selecione</option>
                {profissionais.map(prof => (
                  <option key={prof.id} value={prof.id}>{prof.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serviço *
              </label>
              <select 
                className="input-field"
                value={formData.servicoId}
                onChange={(e) => setFormData({...formData, servicoId: e.target.value})}
                disabled={salvando}
              >
                <option value="">Selecione</option>
                {servicos.map(serv => (
                  <option key={serv.id} value={serv.id}>{serv.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Informações de Preço e Comissão (visível quando serviço selecionado) */}
          {servicoSelecionado && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Informações do Serviço
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor do Serviço</p>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {parseFloat(servicoSelecionado.preco).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comissão ({percentualComissao}%)</p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {comissaoCalculada.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Configurado nas configurações
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data e Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input 
                type="date" 
                className="input-field"
                value={formData.data}
                onChange={(e) => {
                  setFormData({...formData, data: e.target.value, hora: ''});
                }}
                disabled={salvando}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário *
              </label>
              <select
                className="input-field"
                value={formData.hora}
                onChange={(e) => setFormData({...formData, hora: e.target.value})}
                required
                disabled={salvando || !formData.profissionalId || !formData.data}
              >
                <option value="">Selecione um horário</option>
                {horariosDoDia.map(horario => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
              {loading && (
                <p className="text-xs text-gray-500 mt-1">Carregando horários...</p>
              )}
              {formData.profissionalId && formData.data && horariosDoDia.length === 0 && !loading && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Não há horários disponíveis para este profissional nesta data
                </p>
              )}
              {config && config.intervaloMinutos && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Intervalo de {config.intervaloMinutos} minutos entre horários
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select 
              className="input-field"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              disabled={salvando}
            >
              <option value="agendado">📅 Agendado</option>
              <option value="confirmado">✅ Confirmado</option>
              <option value="em_atendimento">⏳ Em Atendimento</option>
              <option value="concluido">🎉 Concluído</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>

          {/* Seção de Pagamento (aparece quando status = concluído) */}
          {mostrarPagamento && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
              <h3 className="font-medium text-green-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Registrar Pagamento
              </h3>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  className="input-field"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  disabled={salvando}
                >
                  <option value="">Selecione...</option>
                  {formasPagamento.map(fp => (
                    <option key={fp.id} value={fp.id}>{fp.nome}</option>
                  ))}
                </select>
              </div>

              {/* Bandeira do Cartão (para pagamentos com cartão) */}
              {(formaPagamento === 'debito' || formaPagamento === 'credito' || formaPagamento === 'credito_parcelado') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      Bandeira do Cartão *
                    </label>
                    <select
                      className="input-field"
                      value={bandeiraCartao}
                      onChange={(e) => setBandeiraCartao(e.target.value)}
                      disabled={salvando}
                    >
                      <option value="">Selecione a bandeira...</option>
                      {bandeirasCartao.map(bandeira => (
                        <option key={bandeira} value={bandeira}>{bandeira}</option>
                      ))}
                    </select>
                  </div>

                  {/* Parcelas (para crédito parcelado) */}
                  {formaPagamento === 'credito_parcelado' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Parcelas *
                      </label>
                      <select
                        className="input-field"
                        value={parcelas}
                        onChange={(e) => setParcelas(parseInt(e.target.value))}
                        disabled={salvando}
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                          <option key={num} value={num}>{num}x</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Resumo do Pagamento */}
              <div className="bg-white p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Valor Total:</span>
                  <span className="font-bold">
                    R$ {servicoSelecionado ? parseFloat(servicoSelecionado.preco).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {formaPagamento === 'credito_parcelado' && parcelas > 1 && (
                  <div className="flex justify-between text-sm mt-1 text-gray-600">
                    <span>{parcelas}x de:</span>
                    <span>
                      R$ {(parseFloat(servicoSelecionado?.preco || 0) / parcelas).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea 
              rows="3"
              className="input-field"
              placeholder="Observações sobre o atendimento..."
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              disabled={salvando}
            />
          </div>

          {/* Informações adicionais */}
          {agendamentoSelecionado && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-gray-700">Informações do Cliente</h3>
              <p className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {agendamentoSelecionado.cliente_telefone || 'Não informado'}
              </p>
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {agendamentoSelecionado.cliente_email || 'Não informado'}
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          {agendamentoSelecionado && (
            <button 
              onClick={() => onExcluir(agendamentoSelecionado.id)}
              className="btn-danger"
              disabled={salvando}
            >
              Excluir
            </button>
          )}
          <button 
            onClick={onClose}
            className="btn-secondary"
            disabled={salvando}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSalvar}
            className="btn-primary"
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : (agendamentoSelecionado ? 'Salvar Alterações' : 'Criar Agendamento')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgendamento;
