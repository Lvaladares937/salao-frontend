import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const ModalFuncionario = ({ 
  show, 
  onClose, 
  funcionario, 
  onSave,
  modo // 'novo' ou 'editar'
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    telefone: '',
    email: '',
    dataContratacao: '',
    salarioBase: '',
    comissaoPercentual: '30',
    documentos: {
      cpf: '',
      rg: '',
      ctps: ''
    }
  });

  // Preencher formulário quando editar
  useEffect(() => {
    console.log('📝 ModalFuncionario - useEffect chamado', { funcionario, modo, show });
    
    if (show) {
      if (funcionario && modo === 'editar') {
        console.log('📝 Preenchendo formulário com dados do funcionário:', funcionario);
        
        // Formatar data de contratação se existir
        let dataContratacao = '';
        if (funcionario.data_contratacao) {
          const data = new Date(funcionario.data_contratacao);
          dataContratacao = data.toISOString().split('T')[0];
        }

        // Parse dos documentos se for string
        let documentos = {
          cpf: '',
          rg: '',
          ctps: ''
        };
        
        if (funcionario.documentos) {
          if (typeof funcionario.documentos === 'string') {
            try {
              documentos = JSON.parse(funcionario.documentos);
            } catch (e) {
              console.error('Erro ao parsear documentos:', e);
            }
          } else if (typeof funcionario.documentos === 'object') {
            documentos = funcionario.documentos;
          }
        }
        
        setFormData({
          nome: funcionario.nome || '',
          especialidade: funcionario.especialidade || '',
          telefone: funcionario.telefone || '',
          email: funcionario.email || '',
          dataContratacao: dataContratacao,
          salarioBase: funcionario.salario_base?.toString() || '',
          comissaoPercentual: funcionario.comissao_percentual?.toString() || '30',
          documentos: {
            cpf: documentos.cpf || '',
            rg: documentos.rg || '',
            ctps: documentos.ctps || ''
          }
        });
      } else {
        // Resetar formulário para novo funcionário
        console.log('📝 Resetando formulário para novo funcionário');
        setFormData({
          nome: '',
          especialidade: '',
          telefone: '',
          email: '',
          dataContratacao: new Date().toISOString().split('T')[0],
          salarioBase: '',
          comissaoPercentual: '30',
          documentos: {
            cpf: '',
            rg: '',
            ctps: ''
          }
        });
      }
    }
  }, [funcionario, modo, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Para campos aninhados (documentos)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios - NOME e ESPECIALIDADE são obrigatórios
    if (!formData.nome || !formData.especialidade) {
      alert('Nome e especialidade são obrigatórios');
      return;
    }

    // Garantir que salarioBase é um número (pode ser 0)
    let salarioBaseNum = 0;
    if (formData.salarioBase !== '' && formData.salarioBase !== null && formData.salarioBase !== undefined) {
      salarioBaseNum = parseFloat(formData.salarioBase);
      if (isNaN(salarioBaseNum)) {
        salarioBaseNum = 0;
      }
    }

    console.log('💰 Salário base processado:', salarioBaseNum);

    // Gerar avatar e cor baseados no nome
    const palavras = formData.nome.split(' ');
    const avatar = palavras.length > 1 
      ? (palavras[0][0] + palavras[1][0]).toUpperCase()
      : palavras[0].substring(0, 2).toUpperCase();

    const cores = [
      'bg-purple-500', 'bg-blue-500', 'bg-pink-500', 
      'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'
    ];
    const cor = cores[Math.floor(Math.random() * cores.length)];

    const funcionarioData = {
      nome: formData.nome,
      especialidade: formData.especialidade,
      telefone: formData.telefone,
      email: formData.email,
      dataContratacao: formData.dataContratacao,
      salarioBase: salarioBaseNum, // Agora é um número (0 ou positivo)
      comissaoPercentual: parseInt(formData.comissaoPercentual) || 30,
      documentos: formData.documentos,
      avatar,
      cor,
      ativo: true
    };

    console.log('📤 Enviando dados do funcionário:', funcionarioData);
    onSave(funcionarioData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {modo === 'editar' ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade *
                </label>
                <input
                  type="text"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Cabelos, Barbearia, Manicure"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Contratação *
                </label>
                <input
                  type="date"
                  name="dataContratacao"
                  value={formData.dataContratacao}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  name="documentos.cpf"
                  value={formData.documentos.cpf}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RG
                </label>
                <input
                  type="text"
                  name="documentos.rg"
                  value={formData.documentos.rg}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="00.000.000-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTPS
                </label>
                <input
                  type="text"
                  name="documentos.ctps"
                  value={formData.documentos.ctps}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Número da carteira"
                />
              </div>
            </div>
          </div>

          {/* Dados Financeiros */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Financeiros</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salário Base (R$) *
                </label>
                <input
                  type="number"
                  name="salarioBase"
                  value={formData.salarioBase}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe 0 para funcionários que trabalham apenas com comissão
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comissão Padrão (%)
                </label>
                <input
                  type="number"
                  name="comissaoPercentual"
                  value={formData.comissaoPercentual}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="40"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {modo === 'editar' ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalFuncionario;