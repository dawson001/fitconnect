"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '../sensay-sdk/client';
import { postV1ReplicasByReplicaUuidChatCompletions } from '../sensay-sdk';
import { SENSAY_CONFIG, REPLICA_UUID, validateConfig } from '../lib/config';

// Configuração do cliente Sensay
const sensayClient = createClient({
  baseUrl: SENSAY_CONFIG.baseUrl,
  headers: {
    'X-ORGANIZATION-SECRET': SENSAY_CONFIG.orgSecret,
    'X-API-Version': SENSAY_CONFIG.apiVersion,
    'Content-Type': 'application/json'
  }
});

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SavedChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

interface UserInfo {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
}

type Language = 'pt' | 'en';

// Função para formatar texto da replica
const formatReplicaText = (text: string) => {
  if (!text) return text;
  
  // Substituir **texto** por negrito
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Substituir [texto](link) por links clicáveis
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
  
  return formattedText;
};

// Sistema de traduções
const translations = {
  pt: {
    // Navigation
    navTitle: 'FitConnect',
    howItWorks: 'Como funciona',
    solutions: 'Soluções',
    startNow: 'Começar agora',
    
    // Hero Section
    poweredBy: 'Powered by Sensay AI',
    heroTitle: 'Seu treino ideal começa com uma',
    heroTitleHighlight: 'conversa inteligente',
    heroSubtitle: 'Conectamos você ao personal trainer perfeito através de inteligência artificial. Sem complicações, sem perda de tempo — apenas o match ideal para seus objetivos.',
    findTrainer: '💪 Encontrar personal trainer',
    
    // How it works
    howItWorksTitle: 'Como funciona',
    howItWorksSubtitle: 'Três passos simples para encontrar seu personal trainer ideal',
    step1Title: 'Converse com a IA',
    step1Description: 'Nossa inteligência artificial entende seus objetivos, disponibilidade e preferências através de perguntas inteligentes.',
    step2Title: 'Receba matches personalizados',
    step2Description: 'Analisamos milhares de personal trainers para encontrar os que melhor se encaixam no seu perfil e necessidades.',
    step3Title: 'Conecte-se e comece',
    step3Description: 'Entre em contato direto com os profissionais selecionados e inicie sua jornada de transformação hoje mesmo.',
    
    // For whom section
    forWhomTitle: 'Para quem busca resultados',
    forWhomSubtitle: 'Transforme seus objetivos de fitness em realidade com o personal trainer ideal',
    findIdealTrainer: 'Encontre seu personal trainer ideal',
    perfectMatch: 'Match perfeito para seus objetivos e estilo de vida',
    benefits: [
      'Emagrecer com acompanhamento profissional',
      'Ganhar massa muscular de forma eficiente',
      'Começar do zero com total segurança',
      'Ter motivação e acompanhamento constante',
      'Treinar presencial, online ou híbrido',
      'Horários flexíveis que se adaptam à sua rotina'
    ],
    
    // Chat section
    chatTitle: 'Encontre seu personal trainer',
    chatSubtitle: 'Converse com nossa IA e descubra o profissional perfeito para seus objetivos',
    
    // Chat component
    chatHeader: 'Sensay AI - Personal Trainer',
    chatHeaderSubtitle: 'Encontre seu personal trainer ideal',
    restart: 'Reiniciar',
    
    // Form
    formTitle: 'Sua Transformação Começa Aqui!',
    fullName: 'Nome completo',
    fullNamePlaceholder: 'Seu nome completo',
    birthDate: 'Data de nascimento',
    phone: 'Telefone',
    phonePlaceholder: '(11) 99999-9999',
    email: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    startJourney: '🚀 Iniciar Minha Jornada Fitness!',
    fillAllFields: 'Por favor, preencha todos os campos.',
    
    // Chat messages
    typePlaceholder: 'Digite sua mensagem...',
    defaultWelcome: 'Olá! Vou te ajudar a encontrar o personal trainer perfeito para você!',
    fallbackWelcome: 'Olá! Vou te ajudar a encontrar o personal trainer perfeito para você! Vamos começar nossa conversa.',
    errorMessage: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
    processingError: 'Desculpe, não consegui processar sua mensagem.',
    
    // Footer
    footerDescription: 'Revolucionando a conexão entre pessoas e personal trainers através de inteligência artificial avançada.',
    allRightsReserved: '© 2025 FitConnect. Todos os direitos reservados.'
  },
  
  en: {
    // Navigation
    navTitle: 'FitConnect',
    howItWorks: 'How it works',
    solutions: 'Solutions',
    startNow: 'Start now',
    
    // Hero Section
    poweredBy: 'Powered by Sensay AI',
    heroTitle: 'Your ideal workout starts with an',
    heroTitleHighlight: 'intelligent conversation',
    heroSubtitle: 'We connect you to the perfect personal trainer through artificial intelligence. No complications, no wasted time — just the ideal match for your goals.',
    findTrainer: '💪 Find personal trainer',
    
    // How it works
    howItWorksTitle: 'How it works',
    howItWorksSubtitle: 'Three simple steps to find your ideal personal trainer',
    step1Title: 'Talk to AI',
    step1Description: 'Our artificial intelligence understands your goals, availability and preferences through smart questions.',
    step2Title: 'Get personalized matches',
    step2Description: 'We analyze thousands of personal trainers to find those that best fit your profile and needs.',
    step3Title: 'Connect and start',
    step3Description: 'Get in direct contact with selected professionals and start your transformation journey today.',
    
    // For whom section
    forWhomTitle: 'For those seeking results',
    forWhomSubtitle: 'Transform your fitness goals into reality with the ideal personal trainer',
    findIdealTrainer: 'Find your ideal personal trainer',
    perfectMatch: 'Perfect match for your goals and lifestyle',
    benefits: [
      'Lose weight with professional guidance',
      'Gain muscle mass efficiently',
      'Start from scratch with total safety',
      'Have motivation and constant support',
      'Train in-person, online or hybrid',
      'Flexible schedules that adapt to your routine'
    ],
    
    // Chat section
    chatTitle: 'Find your personal trainer',
    chatSubtitle: 'Talk to our AI and discover the perfect professional for your goals',
    
    // Chat component
    chatHeader: 'Sensay AI - Personal Trainer',
    chatHeaderSubtitle: 'Find your ideal personal trainer',
    restart: 'Restart',
    
    // Form
    formTitle: 'Your Transformation Starts Here!',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your full name',
    birthDate: 'Date of birth',
    phone: 'Phone',
    phonePlaceholder: '+55 (11) 99999-9999',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    startJourney: '🚀 Start My Fitness Journey!',
    fillAllFields: 'Please fill in all fields.',
    
    // Chat messages
    typePlaceholder: 'Type your message...',
    defaultWelcome: 'Hello! I will help you find the perfect personal trainer for you!',
    fallbackWelcome: 'Hello! I will help you find the perfect personal trainer for you! Let\'s start our conversation.',
    errorMessage: 'Sorry, an error occurred. Please try again in a few moments.',
    processingError: 'Sorry, I couldn\'t process your message.',
    
    // Footer
    footerDescription: 'Revolutionizing the connection between people and personal trainers through advanced artificial intelligence.',
    allRightsReserved: '© 2025 FitConnect. All rights reserved.',
  }
};

// Função para gerar mensagem inicial baseada no idioma
const generateInitialMessage = (userInfo: UserInfo, age: number, language: Language) => {
  if (language === 'en') {
    return `Hello! My name is ${userInfo.name}, I am ${age} years old. My phone is ${userInfo.phone} and my email is ${userInfo.email}. I am looking for a personal trainer who can help me achieve my fitness goals and transform my life through exercise. Can you help me find the ideal professional for me?`;
  }
  
  return `Olá! Meu nome é ${userInfo.name}, tenho ${age} anos. Meu telefone é ${userInfo.phone} e meu email é ${userInfo.email}. Estou procurando um personal trainer que me ajude a alcançar meus objetivos de fitness e transformar minha vida através do exercício. Pode me ajudar a encontrar o profissional ideal para mim?`;
};

// Tipo para as traduções
type Translations = typeof translations.en;

// Componente do Chat para Clientes
const ClientChat = ({ language, t }: { language: Language, t: Translations }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    birthDate: '',
    phone: '',
    email: ''
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Carregar mensagens salvas ao montar o componente
  useEffect(() => {
    const savedMessages = localStorage.getItem('fitconnect-client-chat');
    const savedUserInfo = localStorage.getItem('fitconnect-user-info');
    
    if (savedMessages && savedUserInfo) {
      try {
        const parsedMessages: SavedChatMessage[] = JSON.parse(savedMessages);
        const parsedUserInfo: UserInfo = JSON.parse(savedUserInfo);
        
        // Converter timestamps de string para Date
        const messagesWithDates = parsedMessages.map((msg: SavedChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(messagesWithDates);
        setUserInfo(parsedUserInfo);
        setShowForm(false);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        // Reset em caso de erro
        localStorage.removeItem('fitconnect-client-chat');
        localStorage.removeItem('fitconnect-user-info');
      }
    }
  }, []);

  // Salvar mensagens sempre que mudarem
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('fitconnect-client-chat', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildConversationHistory = () => {
    const userLabel = language === 'en' ? 'User' : 'Usuário';
    const assistantLabel = language === 'en' ? 'Assistant' : 'Assistente';
    
    return messages.map(msg => 
      `${msg.sender === 'user' ? userLabel : assistantLabel}: ${msg.content}`
    ).join('\n');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!userInfo.name || !userInfo.birthDate || !userInfo.phone || !userInfo.email) {
      alert(t.fillAllFields);
      return;
    }

    // Salvar informações do usuário
    localStorage.setItem('fitconnect-user-info', JSON.stringify(userInfo));

    const age = calculateAge(userInfo.birthDate);
    
    // Gerar mensagem inicial com os dados do usuário no idioma correto
    const initialMessage = generateInitialMessage(userInfo, age, language);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: initialMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([userMessage]);
    setShowForm(false);
    setIsLoading(true);

    try {
      const response = await postV1ReplicasByReplicaUuidChatCompletions({
        client: sensayClient,
        path: {
          replicaUUID: REPLICA_UUID
        },
        body: {
          content: initialMessage,
          skip_chat_history: true,
          source: 'web'
        },
        headers: {
          'X-USER-ID': `fitconnect-admin`,
        }
      });

      if (response.data) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.content || t.defaultWelcome,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem inicial:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: t.fallbackWelcome,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    localStorage.removeItem('fitconnect-client-chat');
    localStorage.removeItem('fitconnect-user-info');
    setMessages([]);
    setUserInfo({ name: '', birthDate: '', phone: '', email: '' });
    setShowForm(true);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = buildConversationHistory();
      const userLabel = language === 'en' ? 'User' : 'Usuário';
      const fullContext = `${conversationHistory}\n${userLabel}: ${currentInput}`;

      const response = await postV1ReplicasByReplicaUuidChatCompletions({
        client: sensayClient,
        path: {
          replicaUUID: REPLICA_UUID
        },
        body: {
          content: fullContext,
          skip_chat_history: true,
          source: 'web'
        },
        headers: {
          'X-USER-ID': `fitconnect-admin`,
        }
      });

      if (response.data) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.content || t.processingError,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: t.errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 h-[600px] flex flex-col">
        {/* Header do Chat */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl text-white mr-3">
              🤖
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.chatHeader}</h3>
              <p className="text-sm text-blue-600">{t.chatHeaderSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            {!showForm && (
              <button
                onClick={resetChat}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
              >
                {t.restart}
              </button>
            )}
          </div>
        </div>

        {/* Área das Mensagens */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border border-blue-100'
                }`}
              >
                {message.sender === 'bot' ? (
                  <p 
                    className="text-sm" 
                    dangerouslySetInnerHTML={{ __html: formatReplicaText(message.content) }}
                  />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-blue-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input de Mensagem */}
        {!showForm && (
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.typePlaceholder}
              className="flex-1 px-4 py-2 border border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Formulário Glassmorphism Overlay */}
      {showForm && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.formTitle}</h3>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  placeholder={t.fullNamePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.birthDate}</label>
                <input
                  type="date"
                  value={userInfo.birthDate}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  placeholder={t.phonePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  placeholder={t.emailPlaceholder}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-6"
              >
                {t.startJourney}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // Carregar idioma salvo e validar configuração
  useEffect(() => {
    const savedLanguage = localStorage.getItem('fitconnect-language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
    
    // Validar configuração de ambiente
    if (!validateConfig()) {
      console.warn('Algumas configurações estão faltando. Verifique o arquivo .env.local');
    }
  }, []);

  // Salvar idioma quando mudar
  useEffect(() => {
    localStorage.setItem('fitconnect-language', language);
  }, [language]);

  const t = translations[language];

  const toggleLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5' 
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Image 
                  src="/FitConnect.svg" 
                  alt="FitConnect" 
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Language Toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => toggleLanguage('pt')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${
                      language === 'pt' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">🇧🇷</span>
                    <span className="text-sm font-medium">PT</span>
                  </button>
                  <button
                    onClick={() => toggleLanguage('en')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${
                      language === 'en' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">🇺🇸</span>
                    <span className="text-sm font-medium">EN</span>
                  </button>
                </div>

                <div className="hidden md:flex items-center space-x-8">
                  <button 
                    onClick={() => scrollToSection('como-funciona')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    {t.howItWorks}
                  </button>
                  <button 
                    onClick={() => scrollToSection('para-quem')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    {t.solutions}
                  </button>
                  <button 
                    onClick={() => scrollToSection('chat-cliente')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {t.startNow}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                {t.poweredBy}
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {t.heroTitle}{' '}
                <span className="text-blue-600">{t.heroTitleHighlight}</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                {t.heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button
                  onClick={() => scrollToSection('chat-cliente')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-600/25 hover:scale-105"
                >
                  {t.findTrainer}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="py-24 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t.howItWorksTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t.howItWorksSubtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: t.step1Title,
                  description: t.step1Description,
                  icon: "🤖"
                },
                {
                  step: "02", 
                  title: t.step2Title,
                  description: t.step2Description,
                  icon: "🎯"
                },
                {
                  step: "03",
                  title: t.step3Title,
                  description: t.step3Description,
                  icon: "⚡"
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-gray-50 rounded-2xl p-8 h-full hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {item.step}
                      </div>
                      <span className="text-4xl">{item.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Para Quem É */}
        <section id="para-quem" className="py-24 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t.forWhomTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t.forWhomSubtitle}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Para Clientes */}
              <div className="bg-white rounded-2xl p-10 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mr-6">
                    🏃‍♂️
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t.findIdealTrainer}</h3>
                    <p className="text-gray-600">{t.perfectMatch}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {t.benefits.map((item: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <section className="py-24 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            
            {/* Chat Cliente */}
            <div id="chat-cliente" className="scroll-mt-24">
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  {t.chatTitle}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {t.chatSubtitle}
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <ClientChat language={language} t={t} />
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="mb-4 filter invert">
                  <Image 
                    src="/FitConnect.svg" 
                    alt="FitConnect" 
                    width={40}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>
                <p className="text-gray-400 max-w-md leading-relaxed">
                  {t.footerDescription}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                {t.allRightsReserved}
              </p>
              <div className="flex items-center text-gray-400">
                <a
                  href="/admin"
                  className="text-gray-400 hover:text-gray-200 transition-colors text-sm"
                >
                  🔧 Admin
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
