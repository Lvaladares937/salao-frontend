import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, LogIn, Sparkles, ShoppingBag, MessageCircle, 
  Globe, Smartphone, Palette, Zap, Shield, CheckCircle, 
  ArrowRight, Star, Users, TrendingUp, Menu, X, ChevronRight,
  Instagram, Facebook, Linkedin, Github, Heart, Send, Phone, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onLoginSuccess }) => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const { login: loginAuth } = useAuth();

  // Função para abrir WhatsApp com mensagem personalizada
  const abrirWhatsApp = (plano = null, servico = null) => {
    let mensagem = "Olá! Vi os serviços da Rumbrov e gostaria de mais informações sobre";
    
    if (plano) {
      mensagem = `Olá! Tenho interesse no plano ${plano} da Rumbrov. Gostaria de saber mais detalhes e iniciar meu projeto!`;
    } else if (servico) {
      mensagem = `Olá! Tenho interesse no serviço de ${servico} da Rumbrov. Gostaria de saber mais sobre como funciona e os valores!`;
    } else {
      mensagem = "Olá! Gostaria de saber mais sobre os serviços da Rumbrov. Podemos conversar?";
    }
    
    const mensagemCodificada = encodeURIComponent(mensagem);
    window.open(`https://wa.me/5561983530733?text=${mensagemCodificada}`, '_blank');
  };

  // Função para abrir email
  const abrirEmail = (plano = null) => {
    let assunto = "Contato Rumbrov - Orçamento";
    let corpo = "Olá, gostaria de solicitar um orçamento para os serviços da Rumbrov.\n\n";
    
    if (plano) {
      assunto = `Orçamento - Plano ${plano} Rumbrov`;
      corpo = `Olá, tenho interesse no plano ${plano} e gostaria de saber mais detalhes e valores.\n\nMeu contato: \nNome: \nTelefone: \n\nAguardo retorno.`;
    }
    
    window.location.href = `mailto:rumbrov@gmail.com?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  };

  // Serviços oferecidos
  const servicos = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Sites Profissionais",
      description: "Sites modernos, responsivos e otimizados para SEO",
      features: ["Design exclusivo", "Mobile first", "Alta performance"],
      color: "from-blue-500 to-cyan-500",
      whatsappMsg: "Sites Profissionais"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "E-commerce Completo",
      description: "Lojas virtuais com carrinho, pagamentos e gestão de estoque",
      features: ["Catálogo de produtos", "Pagamentos integrados", "Gestão de pedidos"],
      color: "from-purple-500 to-pink-500",
      whatsappMsg: "E-commerce"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Chatbot Inteligente",
      description: "Atendimento automático 24/7 com IA integrada",
      features: ["Respostas automáticas", "Agendamentos", "Suporte contínuo"],
      color: "from-green-500 to-emerald-500",
      whatsappMsg: "Chatbot"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Landing Pages",
      description: "Páginas de alta conversão para campanhas e produtos",
      features: ["Copy persuasiva", "CTA estratégicos", "A/B Testing"],
      color: "from-orange-500 to-red-500",
      whatsappMsg: "Landing Pages"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Apps e Sistemas",
      description: "Sistemas customizados para gestão e automação",
      features: ["Dashboard intuitivo", "Relatórios", "Integrações API"],
      color: "from-teal-500 to-green-500",
      whatsappMsg: "Apps e Sistemas"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Integrações API",
      description: "Conecte seus sistemas com WhatsApp, Instagram e mais",
      features: ["Automação de mensagens", "CRM integrado", "Análise de dados"],
      color: "from-yellow-500 to-orange-500",
      whatsappMsg: "Integrações API"
    }
  ];

  // Planos
  const planos = [
    {
      nome: "Essencial",
      preco: "R$ 997",
      periodo: "único",
      features: [
        "Site profissional (5 páginas)",
        "Formulário de contato",
        "SEO básico",
        "Hospedagem 1 ano",
        "Suporte 30 dias"
      ],
      destaque: false,
      whatsappMsg: "Essencial"
    },
    {
      nome: "Profissional",
      preco: "R$ 2.497",
      periodo: "único",
      features: [
        "Site completo (10+ páginas)",
        "Blog integrado",
        "E-commerce básico",
        "Chatbot",
        "SEO avançado",
        "Hospedagem 1 ano",
        "Suporte 6 meses"
      ],
      destaque: true,
      whatsappMsg: "Profissional"
    },
    {
      nome: "Enterprise",
      preco: "Sob consulta",
      periodo: "personalizado",
      features: [
        "Sistema personalizado",
        "App mobile",
        "API dedicada",
        "Infraestrutura própria",
        "Suporte prioritário",
        "Treinamento equipe"
      ],
      destaque: false,
      whatsappMsg: "Enterprise"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAuth(login, senha);
      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowLoginModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Botão flutuante do WhatsApp
  const WhatsAppFloatButton = () => (
    <button
      onClick={() => abrirWhatsApp()}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 group"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Fale conosco no WhatsApp
      </span>
    </button>
  );

  // Botão flutuante do Chatbot
  const ChatbotFloatButton = () => (
    <button
      onClick={() => setShowChatbot(!showChatbot)}
      className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 group"
    >
      <HelpCircle className="w-7 h-7" />
      <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chatbot de atendimento
      </span>
    </button>
  );

  // Chatbot Simples
  const ChatbotModal = () => (
    <div className="fixed bottom-24 left-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Atendimento Rumbrov</span>
        </div>
        <button onClick={() => setShowChatbot(false)} className="hover:bg-white/20 rounded-full p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-600">Olá! 👋 Como posso ajudar?</p>
        <button 
          onClick={() => abrirWhatsApp()}
          className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-sm flex items-center gap-2"
        >
          <Send className="w-4 h-4 text-purple-600" />
          Quero falar com um especialista
        </button>
        <button 
          onClick={() => abrirEmail()}
          className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-sm flex items-center gap-2"
        >
          <Mail className="w-4 h-4 text-purple-600" />
          Prefiro contato por e-mail
        </button>
        <button 
          onClick={() => window.open('https://wa.me/5561983530733?text=Olá! Gostaria de saber mais sobre os planos e valores', '_blank')}
          className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-sm flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          Quero saber sobre os planos
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header com menu */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Rumbrov
              </span>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#servicos" className="text-gray-600 hover:text-purple-600 transition-colors">Serviços</a>
              <a href="#planos" className="text-gray-600 hover:text-purple-600 transition-colors">Planos</a>
              <a href="#contato" className="text-gray-600 hover:text-purple-600 transition-colors">Contato</a>
            </div>

            {/* Botões Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors"
              >
                Já sou cliente
              </button>
              <button 
                onClick={() => abrirWhatsApp()}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Começar Agora
              </button>
            </div>

            {/* Menu Mobile Button */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {showMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <div className="px-4 space-y-3">
              <a href="#servicos" className="block py-2 text-gray-600 hover:text-purple-600">Serviços</a>
              <a href="#planos" className="block py-2 text-gray-600 hover:text-purple-600">Planos</a>
              <a href="#contato" className="block py-2 text-gray-600 hover:text-purple-600">Contato</a>
              <div className="pt-4 space-y-2">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full py-2 text-purple-600 font-medium border border-purple-200 rounded-lg hover:bg-purple-50"
                >
                  Já sou cliente
                </button>
                <button 
                  onClick={() => abrirWhatsApp()}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Começar Agora
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Transforme seu negócio digital</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Soluções Digitais que
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Impulsionam</span>
                seu Negócio
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Sites profissionais, e-commerce completo, chatbots inteligentes e sistemas personalizados para levar seu negócio ao próximo nível.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => abrirWhatsApp()}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Quero transformar meu negócio
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-3 border-2 border-purple-200 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all">
                  Ver cases de sucesso
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  +50 empresas confiam na Rumbrov
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Resultados Rumbrov</h3>
                    <p className="text-sm text-gray-500">Índices de performance</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>+ Conversão</span>
                      <span className="text-green-600">+156%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Agendamentos via Chatbot</span>
                      <span className="text-green-600">+234%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-5/6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfação dos Clientes</span>
                      <span>98%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Nossos Serviços</h2>
            <p className="text-xl text-gray-600">Soluções completas para transformar seu negócio digital</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicos.map((servico, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className={`w-16 h-16 bg-gradient-to-r ${servico.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {servico.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{servico.title}</h3>
                <p className="text-gray-600 mb-4">{servico.description}</p>
                <ul className="space-y-2 mb-4">
                  {servico.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => abrirWhatsApp(servico.whatsappMsg)}
                  className="w-full py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Quero este serviço
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section id="planos" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-xl text-gray-600">Escolha o plano ideal para seu negócio</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {planos.map((plano, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${plano.destaque ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
                {plano.destaque && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plano.preco}</span>
                  <span className="text-gray-500">/{plano.periodo}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plano.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="space-y-3">
                  <button 
                    onClick={() => abrirWhatsApp(plano.whatsappMsg)}
                    className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${plano.destaque ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg' : 'border-2 border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Quero o plano {plano.nome}
                  </button>
                  <button 
                    onClick={() => abrirEmail(plano.nome)}
                    className="w-full py-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    Solicitar orçamento por e-mail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Fale Conosco</h2>
          <p className="text-xl text-gray-600 mb-8">Estamos prontos para transformar sua ideia em realidade</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl">
              <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">Resposta rápida e personalizada</p>
              <button 
                onClick={() => abrirWhatsApp()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                (61) 98353-0733
              </button>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl">
              <Mail className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">E-mail</h3>
              <p className="text-gray-600 mb-4">Envie sua solicitação</p>
              <button 
                onClick={() => abrirEmail()}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                rumbrov@gmail.com
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center relative">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
              <p className="text-purple-100 mt-2">Acesse sua conta Rumbrov</p>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite seu usuário"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite sua senha"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
                  </label>
                  <button type="button" className="text-sm text-purple-600 hover:text-purple-800">
                    Esqueceu a senha?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Entrar no Sistema
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Não tem uma conta?{" "}
                  <button onClick={() => abrirWhatsApp()} className="text-purple-600 hover:text-purple-800 font-medium">
                    Contate-nos
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões Flutuantes */}
      <WhatsAppFloatButton />
      <ChatbotFloatButton />
      {showChatbot && <ChatbotModal />}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">Rumbrov</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transformando ideias em soluções digitais de sucesso.
              </p>
              <div className="mt-4">
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (61) 98353-0733
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  rumbrov@gmail.com
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Sites Profissionais</li>
                <li>E-commerce</li>
                <li>Chatbot</li>
                <li>Landing Pages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Sobre nós</li>
                <li>Cases de sucesso</li>
                <li>Blog</li>
                <li>Carreiras</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Redes Sociais</h4>
              <div className="flex gap-4">
                <Instagram className="w-5 h-5 hover:text-purple-400 cursor-pointer" />
                <Facebook className="w-5 h-5 hover:text-purple-400 cursor-pointer" />
                <Linkedin className="w-5 h-5 hover:text-purple-400 cursor-pointer" />
                <Github className="w-5 h-5 hover:text-purple-400 cursor-pointer" />
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Atendimento</h4>
                <p className="text-sm text-gray-400">Segunda a Sexta: 9h às 18h</p>
                <p className="text-sm text-gray-400">Sábado: 9h às 13h</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Rumbrov - Todos os direitos reservados.</p>
            <p className="mt-1">Feito com <Heart className="w-3 h-3 inline text-red-500" /> para transformar negócios digitais</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
