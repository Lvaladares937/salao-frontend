import { useAuth } from '../contexts/AuthContext';

export const usePermissao = () => {
  const { usuario, temPermissao, filtrarPorFuncionario } = useAuth();

  // Retorna se o usuário pode ver um módulo
  const podeVer = (modulo) => temPermissao(modulo, 'ver');
  
  // Retorna se o usuário pode editar
  const podeEditar = (modulo) => temPermissao(modulo, 'editar');
  
  // Retorna se o usuário pode excluir
  const podeExcluir = (modulo) => temPermissao(modulo, 'excluir');

  // Já filtra os dados automaticamente baseado no usuário
  const filtrarDados = (dados, campoId = 'funcionario_id') => {
    return filtrarPorFuncionario(dados, campoId);
  };

  // Verifica se o módulo deve ser mostrado no menu
  const moduloVisivel = (modulo) => {
    const modulosVisiveis = {
      dashboard: true,
      clientes: podeVer('clientes'),
      funcionarios: podeVer('funcionarios'),
      estoque: podeVer('estoque'),
      agendamentos: podeVer('agendamentos'),
      financeiro: podeVer('financeiro'),
      configuracoes: podeVer('configuracoes'),
    };
    return modulosVisiveis[modulo] || false;
  };

  // Retorna o título apropriado baseado no nível
  const getTitulo = (modulo, tituloPadrao) => {
    if (usuario?.nivel === 'funcionario') {
      const titulos = {
        dashboard: 'Meu Dashboard',
        agendamentos: 'Meus Agendamentos',
        financeiro: 'Minhas Comissões',
        clientes: 'Clientes',
      };
      return titulos[modulo] || tituloPadrao;
    }
    return tituloPadrao;
  };

  return {
    podeVer,
    podeEditar,
    podeExcluir,
    filtrarDados,
    moduloVisivel,
    getTitulo,
    nivel: usuario?.nivel,
    usuario
  };
};