import React from 'react';
import { Users, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

const ListaFuncionarios = ({ 
  funcionarios, 
  onSelecionar, 
  onEditar, 
  onDesativar,
  onVisualizar 
}) => {
  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getAvatarIniciais = (nome) => {
    if (!nome) return '??';
    const palavras = nome.split(' ');
    if (palavras.length > 1) {
      return (palavras[0][0] + palavras[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const getCorAleatoria = (id) => {
    const cores = [
      'bg-purple-500', 'bg-blue-500', 'bg-pink-500', 
      'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'
    ];
    return cores[id % cores.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Funcionários Ativos
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {funcionarios.filter(f => f.ativo).map(func => (
          <div key={func.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${func.cor || getCorAleatoria(func.id)} flex items-center justify-center text-white font-bold text-lg`}>
                  {func.avatar || getAvatarIniciais(func.nome)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{func.nome}</h3>
                  <p className="text-sm text-gray-600">{func.especialidade || 'Sem especialidade'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {func.data_contratacao ? `Desde ${new Date(func.data_contratacao).getFullYear()}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Salário Base</p>
                  <p className="font-semibold text-gray-900">
                    {formatarMoeda(func.salario_base)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onVisualizar(func)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onEditar(func)}
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5 text-green-600" />
                  </button>
                  <button
                    onClick={() => onDesativar(func.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Desativar"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {funcionarios.filter(f => f.ativo).length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum funcionário ativo encontrado
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaFuncionarios;