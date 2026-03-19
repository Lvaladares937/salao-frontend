import { useState, useEffect } from 'react';
import horariosService from '../services/horariosService';

export const useConfiguracoesHorarios = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      const savedConfig = await horariosService.buscarConfiguracoes();
      setConfig(savedConfig);
      const horarios = horariosService.gerarHorarios(savedConfig);
      setHorariosDisponiveis(horarios);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarDisponibilidadeDia = (data) => {
    if (!config) return true;
    return horariosService.isDiaDisponivel(data, config);
  };

  const getHorariosDoDia = (data, profissionalId = null) => {
    if (!config) return [];
    
    // Verificar se o dia está disponível
    if (!verificarDisponibilidadeDia(data)) {
      return [];
    }
    
    return horariosDisponiveis;
  };

  const recarregar = () => {
    carregarConfiguracoes();
  };

  return {
    config,
    loading,
    horariosDisponiveis,
    verificarDisponibilidadeDia,
    getHorariosDoDia,
    recarregar
  };
};