import React, { useState, createContext, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import type { Quiz, QuizContextType, GlobalPageSettings } from './types';
import AdminPanel from './components/AdminPanel_new';
import QuizView from './components/QuizView';
import QuizList from './components/QuizList';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import { saveQuizToSupabase, loadQuizzesFromSupabase, deleteQuizFromSupabase } from './utils/supabaseQuiz';

export const QuizContext = createContext<QuizContextType | null>(null);

export const useQuiz = () => {
  const context = React.useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

const createInitialQuiz = (): Quiz => {
  const quiz: Quiz = {
    id: generateId(),
    headerText: 'Criador de Quiz',
    title: 'Quiz de Conhecimentos Gerais',
    description: 'Teste seus conhecimentos em diversas áreas!',
    logoUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    askTheApiLimit: 0, // Desabilitado por padrão
    audienceLimit: 0, // Desabilitado por padrão
    customization: {
      backgroundColor: '#f0f4f8',
      textColor: '#1e293b',
      accentColor: '#3b82f6',
      secondaryColor: '#64748b',
      cardBackgroundColor: '#ffffff',
      borderRadius: 'medium',
      fontFamily: 'sans',
      fontSize: 'medium',
      showImmediateFeedback: true,
      animationsEnabled: true,
      theme: 'light',
    },
    feedback: {
      randomize: true,
      correct: ['Parabéns, você acertou!', 'Ótima resposta!', 'Exato!', 'Mandou bem!'],
      incorrect: ['Ops, não foi dessa vez.', 'Resposta incorreta.', 'Tente novamente!', 'Quase lá!']
    },
    questions: [
      {
        id: generateId(),
        text: 'Qual é a capital da França?',
        answers: [
          { id: generateId(), text: 'Londres' },
          { id: generateId(), text: 'Berlim' },
          { id: generateId(), text: 'Paris' },
          { id: generateId(), text: 'Madri' },
        ],
        correctAnswerId: '', // Will be set below
      },
      {
        id: generateId(),
        text: 'Qual planeta é conhecido como o "Planeta Vermelho"?',
        answers: [
          { id: generateId(), text: 'Júpiter' },
          { id: generateId(), text: 'Marte' },
          { id: generateId(), text: 'Vênus' },
          { id: generateId(), text: 'Saturno' },
        ],
        correctAnswerId: '', // Will be set below
      },
    ],
    footer: {
      text: '© 2024 Criador de Quiz. Todos os direitos reservados.',
      logoUrl: '',
    },
  };

  // Fix placeholder correct answer IDs
  quiz.questions[0].correctAnswerId = quiz.questions[0].answers[2].id;
  quiz.questions[1].correctAnswerId = quiz.questions[1].answers[1].id;

  return quiz;
};

const GLOBAL_SETTINGS_KEY = 'my-dynamic-quiz-app-global-settings';
const AUTH_KEY = 'quiz-admin-auth-secure';
const ADMIN_PASSWORD = 'Surf@2025';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 horas em ms
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Verifica atividade a cada 1 minuto

const createDefaultGlobalSettings = (): GlobalPageSettings => ({
  siteName: 'Criador de Quiz',
  headerText: 'Sistema de Quiz Dinâmico',
  headerLogo: null,
  footerText: '© 2025 Criador de Quiz. Todos os direitos reservados.',
  footerLogo: null,
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  backgroundColor: '#f8fafc',
  textColor: '#1e293b',
  favicon: null,
  customCSS: ''
});

// Component for quiz-specific routing
const QuizViewWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = React.useContext(QuizContext);
  if (!context) {
    return <div>Carregando...</div>;
  }
  const { quizzes, setQuiz, quiz: currentQuiz } = context;
  const quiz = quizzes.find(q => q.id === id);

  useEffect(() => {
    if (quiz) setQuiz(quiz);
  }, [quiz, setQuiz]);

  if (!quiz || !currentQuiz || currentQuiz.id !== quiz.id) {
    return <div>Carregando quiz...</div>;
  }

  return <QuizView />;
};

const App: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const remoteQuizzes = await loadQuizzesFromSupabase();
        if (remoteQuizzes && Array.isArray(remoteQuizzes) && remoteQuizzes.length > 0) {
          setQuizzes(remoteQuizzes);
        } else {
          // Criar quiz inicial apenas se não houver nenhum quiz
          const initialQuiz = createInitialQuiz();
          setQuizzes([initialQuiz]);
        }
      } catch (error) {
        console.error('Erro ao carregar quizzes:', error);
        // Em caso de erro, criar quiz inicial como fallback
        setQuizzes([createInitialQuiz()]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Efeito para limpar quizzes inválidos do localStorage e garantir pelo menos um quiz publicado
  // Remove fallback localStorage init
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [dirtyQuizIds, setDirtyQuizIds] = useState(new Set<string>());

  const updateQuizLocally = useCallback((quizToUpdate: Quiz) => {
    setQuizzes(prevQuizzes =>
      prevQuizzes.map(q => (q.id === quizToUpdate.id ? quizToUpdate : q))
    );
    setDirtyQuizIds(prevIds => new Set(prevIds).add(quizToUpdate.id));
  }, []);

  const [globalSettings, setGlobalSettings] = useState<GlobalPageSettings>(createDefaultGlobalSettings());
  // Carregar configurações globais do Supabase ao iniciar o app
  React.useEffect(() => {
    (async () => {
      // Sempre busca do Supabase primeiro
      const remote = await import('./utils/supabaseConfig').then(mod => mod.loadAdminConfig('global_settings'));
      if (remote) {
        setGlobalSettings(remote);
        localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(remote));
      } else {
        // Se não houver no Supabase, tenta localStorage
        try {
          const savedSettingsJson = localStorage.getItem(GLOBAL_SETTINGS_KEY);
          if (savedSettingsJson) {
            setGlobalSettings(JSON.parse(savedSettingsJson));
          }
        } catch (error) {
          console.error("Failed to parse global settings from localStorage", error);
        }
      }
    })();
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Função para verificar se a sessão ainda é válida
  const checkSessionValidity = useCallback(() => {
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      if (!authData) {
        return false;
      }

      const { timestamp, sessionId } = JSON.parse(authData);
      const now = new Date().getTime();
      
      // Verifica se a sessão não expirou (2 horas)
      if (now - timestamp > SESSION_DURATION) {
        localStorage.removeItem(AUTH_KEY);
        return false;
      }

      // Verifica se há um sessionId válido (proteção adicional)
      if (!sessionId || sessionId.length < 10) {
        localStorage.removeItem(AUTH_KEY);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
  }, []);

  // Inicializar autenticação verificando sessão
  useEffect(() => {
    const isValidSession = checkSessionValidity();
    setIsAuthenticated(isValidSession);
    
    if (!isValidSession) {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [checkSessionValidity]);

  // Verificação periódica de sessão e atividade
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Se não há atividade por mais de 30 minutos, desloga
      if (isAuthenticated && now - lastActivity > 30 * 60 * 1000) {
        logout();
        return;
      }

      // Verifica se a sessão ainda é válida
      if (isAuthenticated && !checkSessionValidity()) {
        setIsAuthenticated(false);
      }
    }, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, checkSessionValidity]);

  // Rastrear atividade do usuário
  useEffect(() => {
    if (isAuthenticated) {
      const updateActivity = () => {
        setLastActivity(Date.now());
      };

      // Eventos que indicam atividade
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, updateActivity);
        });
      };
    }
  }, [isAuthenticated]);

  const saveAllChanges = useCallback(async () => {
    const quizzesToSave = quizzes.filter(q => dirtyQuizIds.has(q.id));
    if (quizzesToSave.length === 0) {
      alert('Nenhuma alteração para salvar.');
      return;
    }

    try {
      const savePromises = quizzesToSave.map(quiz =>
        saveQuizToSupabase({ ...quiz, updatedAt: new Date().toISOString() })
      );
      await Promise.all(savePromises);
      
      setDirtyQuizIds(new Set()); // Limpa o set de quizzes "sujos"
      alert(`${quizzesToSave.length} quiz(zes) salvos com sucesso!`);

    } catch (error) {
      console.error('Failed to save all changes:', error);
      alert('Ocorreu um erro ao salvar as alterações. Verifique o console para mais detalhes.');
    }
  }, [quizzes, dirtyQuizIds]);

  const saveQuiz = useCallback(async (quizToSave: Quiz): Promise<Quiz | null> => {
    try {
      const savedQuiz = await saveQuizToSupabase({ ...quizToSave, updatedAt: new Date().toISOString() });
      const remoteQuizzes = await loadQuizzesFromSupabase();
      setQuizzes(remoteQuizzes);
      return savedQuiz;
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('Ocorreu um erro ao salvar o quiz. Verifique o console para mais detalhes.');
      return null;
    }
  }, []);

  const deleteQuiz = useCallback(async (quizId: string) => {
    await deleteQuizFromSupabase(quizId);
    const remoteQuizzes = await loadQuizzesFromSupabase();
    setQuizzes(remoteQuizzes);
  }, []);

  const createNewQuiz = useCallback((): Quiz => {
    const newQuiz = createInitialQuiz();
    newQuiz.title = 'Novo Quiz';
    newQuiz.description = 'Descrição do seu novo quiz';
    newQuiz.isPublished = false;
    newQuiz.askTheApiLimit = 0; // Desabilitado por padrão
    newQuiz.audienceLimit = 0; // Desabilitado por padrão
    return newQuiz;
  }, []);

  const loadQuiz = useCallback(async (quizId: string) => {
    const remoteQuizzes = await loadQuizzesFromSupabase();
    const quiz = remoteQuizzes.find((q: Quiz) => q.id === quizId);
    if (quiz) {
      setCurrentQuiz(quiz);
    }
  }, []);

  const login = useCallback((password: string): boolean => {
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    // Gerar um sessionId único para maior segurança
    const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    
    const authData = {
      timestamp: new Date().getTime(),
      sessionId: sessionId,
      userAgent: navigator.userAgent.substring(0, 100), // Limitado para não ocupar muito espaço
    };

    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      setLastActivity(Date.now());
      return true;
    } catch (error) {
      console.error("Failed to save auth data", error);
      return false;
    }
  }, []);

  const saveGlobalSettings = useCallback(async (settings: GlobalPageSettings) => {
    try {
      // Salva localmente para feedback rápido da UI
      localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
      setGlobalSettings(settings);
      
      // Salva no Supabase
      const { saveAdminConfig } = await import('./utils/supabaseConfig');
      await saveAdminConfig('global_settings', settings);

    } catch (error) {
      console.error("Failed to save global settings", error);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setLastActivity(0);
    
    // Redirecionar para página inicial
    if (typeof window !== 'undefined') {
      window.location.hash = '#/';
    }
  }, []);

  // Remove auto-save localStorage effect

  const quizContextValue = useMemo(() => ({ 
    quiz: currentQuiz, 
    setQuiz: setCurrentQuiz,
    quizzes,
    setQuizzes,
    saveQuiz,
    updateQuizLocally,
    saveAllChanges,
    dirtyQuizIds,
    deleteQuiz,
    createNewQuiz,
    loadQuiz,
    isAuthenticated, 
    login, 
    logout,
    globalSettings,
    setGlobalSettings,
    saveGlobalSettings
  }), [currentQuiz, quizzes, saveQuiz, updateQuizLocally, saveAllChanges, dirtyQuizIds, deleteQuiz, createNewQuiz, loadQuiz, isAuthenticated, login, logout, globalSettings, saveGlobalSettings]);

  return (
    <QuizContext.Provider value={quizContextValue}>
      {/* Apply global custom CSS */}
      {globalSettings.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: globalSettings.customCSS }} />
      )}
      
      {/* Apply global favicon */}
      {globalSettings.favicon && (
        <>
          <link rel="icon" type="image/png" href={globalSettings.favicon} />
          <link rel="shortcut icon" type="image/png" href={globalSettings.favicon} />
        </>
      )}
      
      <div 
        className={`min-h-screen flex flex-col ${
          globalSettings.fontFamily ? `font-${globalSettings.fontFamily}` : ''
        } ${
          globalSettings.fontSize ? `text-${globalSettings.fontSize}` : ''
        } ${
          globalSettings.borderRadius === 'none' ? 'rounded-none' :
          globalSettings.borderRadius === 'small' ? 'rounded-sm' :
          globalSettings.borderRadius === 'large' ? 'rounded-lg' : 'rounded-md'
        }`}
        style={{ 
          backgroundColor: globalSettings.backgroundColor,
          color: globalSettings.textColor,
          '--primary-color': globalSettings.primaryColor,
          '--secondary-color': globalSettings.secondaryColor
        } as React.CSSProperties}
      >
        <Header />
        <main className="p-4 sm:p-6 md:p-8 flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando quizzes...</p>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<QuizList />} />
              <Route path="/quiz-list" element={<QuizList />} />
              <Route path="/admin" element={
                isAuthenticated ? <AdminPanel /> : <Login onLogin={login} />
              } />
              <Route path="/quiz/:id" element={<QuizViewWrapper />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </QuizContext.Provider>
  );
};

export default App;