import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import pagamentosService from '../../services/pagamentosService';

export const useFinanceiro = () => {
    const [loading, setLoading] = useState(true);
    const [vendas, setVendas] = useState([]);
    const [despesas, setDespesas] = useState([]);
    const [pagamentosFuncionarios, setPagamentosFuncionarios] = useState([]);
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
    const [resumo, setResumo] = useState({
        totalVendas: 0,
        totalDespesas: 0,
        totalPagamentos: 0,
        lucroLiquido: 0
    });

    // Carregar vendas - CORRIGIDO: converte mês de 0-11 para 1-12
    const carregarVendas = useCallback(async (mes, ano) => {
        try {
            console.log(`🔍 Buscando vendas para ${mes + 1}/${ano} (mês original: ${mes})`);
            const response = await api.get('/financeiro/vendas', {
                params: { 
                    mes: mes + 1,  // ← CONVERSÃO AQUI!
                    ano: ano 
                }
            });
            console.log(`✅ Vendas carregadas: ${response.data.length}`);
            setVendas(response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao carregar vendas:', error);
            return [];
        }
    }, []);

    // Carregar despesas - CORRIGIDO: converte mês de 0-11 para 1-12
    const carregarDespesas = useCallback(async (mes, ano) => {
        try {
            console.log(`🔍 Buscando despesas para ${mes + 1}/${ano}`);
            const response = await api.get('/financeiro/despesas', {
                params: { 
                    mes: mes + 1,  // ← CONVERSÃO AQUI!
                    ano: ano 
                }
            });
            console.log(`✅ Despesas carregadas: ${response.data.length}`);
            setDespesas(response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao carregar despesas:', error);
            return [];
        }
    }, []);

    // Carregar pagamentos de funcionários - CORRIGIDO: converte mês de 0-11 para 1-12
    const carregarPagamentosFuncionarios = useCallback(async (mes, ano) => {
        try {
            console.log(`🔍 Buscando pagamentos para ${mes + 1}/${ano}`);
            const data = await pagamentosService.listarPagamentosFuncionarios(mes + 1, ano); // ← CONVERSÃO AQUI!
            console.log(`✅ Pagamentos carregados: ${data.length}`);
            setPagamentosFuncionarios(data);
            return data;
        } catch (error) {
            console.error('❌ Erro ao carregar pagamentos:', error);
            return [];
        }
    }, []);

    // Calcular resumo mensal
    const calcularResumoMensal = useCallback(() => {
        const totalVendas = vendas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
        const totalDespesas = despesas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
        const totalPagamentos = pagamentosFuncionarios.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
        
        const despesasTotais = totalDespesas + totalPagamentos;
        
        const novoResumo = {
            totalVendas,
            totalDespesas: despesasTotais,
            totalPagamentos,
            lucroLiquido: totalVendas - despesasTotais
        };
        
        console.log('📊 Resumo calculado:', novoResumo);
        setResumo(novoResumo);
        return novoResumo;
    }, [vendas, despesas, pagamentosFuncionarios]);

    // Calcular comissões por funcionário
    const calcularComissoesPorFuncionario = useCallback(() => {
        const comissoes = {};
        
        vendas.forEach(venda => {
            if (venda?.funcionario_id) {
                if (!comissoes[venda.funcionario_id]) {
                    comissoes[venda.funcionario_id] = {
                        funcionario_id: venda.funcionario_id,
                        funcionario_nome: venda.funcionario_nome || 'Funcionário',
                        totalVendas: 0,
                        comissao: 0
                    };
                }
                comissoes[venda.funcionario_id].totalVendas += Number(venda.valor_total) || 0;
                // Calcular comissão (10% de exemplo - ajuste conforme sua regra)
                comissoes[venda.funcionario_id].comissao += (Number(venda.valor_total) || 0) * 0.1;
            }
        });
        
        return Object.values(comissoes);
    }, [vendas]);

    // Adicionar despesa
    const adicionarDespesa = async (despesa) => {
        try {
            console.log('➕ Adicionando despesa:', despesa);
            const response = await api.post('/financeiro/despesas', despesa);
            await carregarDespesas(mesSelecionado, anoSelecionado);
            await calcularResumoMensal();
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao adicionar despesa:', error);
            throw error;
        }
    };

    // Remover despesa
    const removerDespesa = async (id) => {
        try {
            console.log(`🗑️ Removendo despesa ID: ${id}`);
            const response = await api.delete(`/financeiro/despesas/${id}`);
            await carregarDespesas(mesSelecionado, anoSelecionado);
            await calcularResumoMensal();
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao remover despesa:', error);
            throw error;
        }
    };

    // Registrar pagamento de funcionário
    const registrarPagamentoFuncionario = async (pagamento) => {
        try {
            console.log('💰 Registrando pagamento de funcionário:', pagamento);
            const result = await pagamentosService.registrarPagamentoFuncionario(pagamento);
            await carregarPagamentosFuncionarios(mesSelecionado, anoSelecionado);
            await carregarVendas(mesSelecionado, anoSelecionado);
            await calcularResumoMensal();
            return result;
        } catch (error) {
            console.error('❌ Erro ao registrar pagamento:', error);
            throw error;
        }
    };

    // Remover pagamento de funcionário
    const removerPagamentoFuncionario = async (id) => {
        try {
            console.log(`🗑️ Removendo pagamento ID: ${id}`);
            const result = await pagamentosService.removerPagamento(id);
            await carregarPagamentosFuncionarios(mesSelecionado, anoSelecionado);
            await carregarVendas(mesSelecionado, anoSelecionado);
            await calcularResumoMensal();
            return result;
        } catch (error) {
            console.error('❌ Erro ao remover pagamento:', error);
            throw error;
        }
    };

    // Carregar todos os dados
    const carregarDados = useCallback(async (mes, ano) => {
        setLoading(true);
        try {
            console.log(`🔄 Carregando dados financeiros para ${mes + 1}/${ano}`);
            
            // Buscar dados em paralelo
            const [vendasData, despesasData, pagamentosData] = await Promise.all([
                carregarVendas(mes, ano),
                carregarDespesas(mes, ano),
                carregarPagamentosFuncionarios(mes, ano)
            ]);
            
            console.log('📊 Resumo do carregamento:', {
                vendas: vendasData.length,
                despesas: despesasData.length,
                pagamentos: pagamentosData.length
            });
            
            calcularResumoMensal();
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    }, [carregarVendas, carregarDespesas, carregarPagamentosFuncionarios, calcularResumoMensal]);

    // Mudar mês/ano
    const mudarMesAno = (mes, ano) => {
        setMesSelecionado(mes);
        setAnoSelecionado(ano);
        carregarDados(mes, ano);
    };

    // Efeito para carregar dados iniciais
    useEffect(() => {
        carregarDados(mesSelecionado, anoSelecionado);
    }, []); // Executa apenas uma vez na montagem

    return {
        // Estados
        loading,
        vendas,
        despesas,
        pagamentosFuncionarios,
        mesSelecionado,
        anoSelecionado,
        resumo,
        
        // Funções de carregamento
        carregarVendas,
        carregarDespesas,
        carregarPagamentosFuncionarios,
        
        // Funções de cálculo
        calcularResumoMensal,
        calcularComissoesPorFuncionario,
        
        // Funções de CRUD
        adicionarDespesa,
        removerDespesa,
        registrarPagamentoFuncionario,
        removerPagamentoFuncionario,
        
        // Funções de navegação
        mudarMesAno,
        
        // Setters (caso precise usar diretamente)
        setMesSelecionado,
        setAnoSelecionado
    };
};