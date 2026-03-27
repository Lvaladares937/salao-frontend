// useConfiguracoesHorarios.js - VERSÃO CORRIGIDA
import { useState, useEffect, useCallback } from 'react';
import horariosService from '../services/horariosService';

export const useConfiguracoesHorarios = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [cacheHorarios, setCacheHorarios] = useState({}); // Cache por data

  const carregarConfiguracoes = useCallback(async () => {
    setLoading(true);
    try {
      const savedConfig = await horariosService.buscarConfiguracoes();
      setConfig(savedConfig);
      const horarios = horariosService.gerarHorarios(savedConfig);
      setHorariosDisponiveis(horarios);
      console.log('✅ Configurações carregadas:', savedConfig);
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 FUNÇÃO PARA OBTER HORÁRIOS COM CACHE
  const getHorariosPorData = useCallback((data, profissionalId = null, horarioAtual = null) => {
    if (!config) return [];
    
    // Verificar se o dia está disponível
    const diaDisponivel = horariosService.isDiaDisponivel(data, config);
    if (!diaDisponivel) {
      console.log(`📅 Dia ${data} não está disponível`);
      return [];
    }
    
    // Usar cache para evitar recálculos desnecessários
    const cacheKey = `${data}-${profissionalId || 'todos'}`;
    if (cacheHorarios[cacheKey] && !horarioAtual) {
      return cacheHorarios[cacheKey];
    }
    
    let horarios = [...horariosDisponiveis];
    
    // Se tem um horário atual que não está na lista, adicionar
    if (horarioAtual && !horarios.includes(horarioAtual)) {
      horarios = [...horarios, horarioAtual].sort();
    }
    
    // Salvar no cache
    setCacheHorarios(prev => ({ ...prev, [cacheKey]: horarios }));
    
    return horarios;
  }, [config, horariosDisponiveis, cacheHorarios]);

  const verificarDisponibilidadeDia = useCallback((data) => {
    if (!config) return true;
    return horariosService.isDiaDisponivel(data, config);
  }, [config]);

  const recarregar = useCallback(() => {
    carregarConfiguracoes();
  }, [carregarConfiguracoes]);

  // Limpar cache quando recarregar
  useEffect(() => {
    setCacheHorarios({});
  }, [config]);

  useEffect(() => {
    carregarConfiguracoes();
  }, [carregarConfiguracoes]);

  return {
    config,
    loading,
    horariosDisponiveis,
    verificarDisponibilidadeDia,
    getHorariosPorData,
    recarregar
  };
};
