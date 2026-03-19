import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, Calendar, FileText, 
  Save, X, AlertCircle
} from 'lucide-react';

const ClienteForm = ({ cliente, onSave, onCancel, modo }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});

  // Carregar dados do cliente quando for edição/visualização
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        data_nascimento: cliente.data_nascimento || '',
        observacoes: cliente.observacoes || ''
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const formatarTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleTelefoneChange = (e) => {
    const formatted = formatarTelefone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modo === 'visualizar') {
      onCancel();
      return;
    }
    
    if (validateForm()) {
      // Criar objeto apenas com os campos que existem no banco
      const clienteData = {
        nome: formData.nome,
        telefone: formData.telefone || null,
        email: formData.email || null,
        data_nascimento: formData.data_nascimento || null,
        observacoes: formData.observacoes || null
      };
      
      onSave(clienteData);
    }
  };

  const isVisualizacao = modo === 'visualizar';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Dados do Cliente
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                disabled={isVisualizacao}
                className={`pl-10 input-field ${errors.nome ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Digite o nome completo"
              />
            </div>
            {errors.nome && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.nome}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Telefone
              </div>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                disabled={isVisualizacao}
                className="pl-10 input-field"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                E-mail
              </div>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isVisualizacao}
                className={`pl-10 input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="cliente@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Data de Nascimento
              </div>
            </label>
            <input
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              disabled={isVisualizacao}
              className="input-field"
            />
          </div>

          {/* Observações */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Observações
              </div>
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              disabled={isVisualizacao}
              rows="3"
              className="input-field"
              placeholder="Observações sobre o cliente..."
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          
          {modo !== 'visualizar' && (
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {modo === 'editar' ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ClienteForm;