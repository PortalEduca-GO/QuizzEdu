import React, { useState, createContext, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import type { Quiz, QuizContextType, GlobalPageSettings } from './types';
import AdminPanel from './components/AdminPanel';
import QuizView from './components/QuizView';
import QuizList from './components/QuizList';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';

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

const SAVED_QUIZZES_KEY = 'my-dynamic-quiz-app-quizzes';
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
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const savedQuizzesJson = localStorage.getItem(SAVED_QUIZZES_KEY);
      if (savedQuizzesJson) {
        const parsed = JSON.parse(savedQuizzesJson) as Quiz[];
        // Se não houver quizzes publicados, cria um padrão
        if (!parsed || !Array.isArray(parsed) || parsed.length === 0 || !parsed.some(q => q.isPublished)) {
          const initial = [createInitialQuiz()];
          localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(initial));
          return initial;
        }
        return parsed;
      }
    } catch (error) {
      console.error("Failed to parse saved quizzes from localStorage", error);
    }
    const initial = [createInitialQuiz()];
    localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(initial));
    return initial;
  });

  // Efeito para limpar quizzes inválidos do localStorage e garantir pelo menos um quiz publicado
  useEffect(() => {
    if (!quizzes || quizzes.length === 0 || !quizzes.some(q => q.isPublished)) {
      const initial = [createInitialQuiz()];
      setQuizzes(initial);
      localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(initial));
    }
  }, []);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  const [globalSettings, setGlobalSettings] = useState<GlobalPageSettings>(() => {
    try {
      const savedSettingsJson = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      if (savedSettingsJson) {
        return JSON.parse(savedSettingsJson) as GlobalPageSettings;
      }
    } catch (error) {
      console.error("Failed to parse global settings from localStorage", error);
    }
    return createDefaultGlobalSettings();
  });

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

  const saveQuizzes = useCallback((quizzesToSave: Quiz[]) => {
    try {
      localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(quizzesToSave));
    } catch (error) {
      console.error("Failed to save quizzes to localStorage", error);
    }
  }, []);

  const saveQuiz = useCallback((quizToSave: Quiz) => {
    setQuizzes(prevQuizzes => {
      const existingIndex = prevQuizzes.findIndex(q => q.id === quizToSave.id);
      let updatedQuizzes: Quiz[];
      
      if (existingIndex >= 0) {
        // Update existing quiz
        updatedQuizzes = prevQuizzes.map(q => 
          q.id === quizToSave.id 
            ? { ...quizToSave, updatedAt: new Date().toISOString() }
            : q
        );
      } else {
        // Add new quiz
        updatedQuizzes = [...prevQuizzes, { 
          ...quizToSave, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        }];
      }
      
      saveQuizzes(updatedQuizzes);
      return updatedQuizzes;
    });
  }, [saveQuizzes]);

  const deleteQuiz = useCallback((quizId: string) => {
    setQuizzes(prevQuizzes => {
      const updatedQuizzes = prevQuizzes.filter(q => q.id !== quizId);
      saveQuizzes(updatedQuizzes);
      return updatedQuizzes;
    });
  }, [saveQuizzes]);

  const createNewQuiz = useCallback((): Quiz => {
    const newQuiz = createInitialQuiz();
    newQuiz.title = 'Novo Quiz';
    newQuiz.description = 'Descrição do seu novo quiz';
    newQuiz.isPublished = false;
    return newQuiz;
  }, []);

  const loadQuiz = useCallback((quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setCurrentQuiz(quiz);
    }
  }, [quizzes]);

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

  const saveGlobalSettings = useCallback((settings: GlobalPageSettings) => {
    try {
      localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
      setGlobalSettings(settings);
    } catch (error) {
      console.error("Failed to save global settings to localStorage", error);
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

  // Auto-save quizzes when they change
  useEffect(() => {
    saveQuizzes(quizzes);
  }, [quizzes, saveQuizzes]);

  const quizContextValue = useMemo(() => ({ 
    quiz: currentQuiz, 
    setQuiz: setCurrentQuiz,
    quizzes,
    setQuizzes,
    saveQuiz, 
    deleteQuiz,
    createNewQuiz,
    loadQuiz,
    isAuthenticated, 
    login, 
    logout,
    globalSettings,
    setGlobalSettings,
    saveGlobalSettings
  }), [currentQuiz, quizzes, saveQuiz, deleteQuiz, createNewQuiz, loadQuiz, isAuthenticated, login, logout, globalSettings, saveGlobalSettings]);

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
        className="min-h-screen flex flex-col"
        style={{ 
          backgroundColor: globalSettings.backgroundColor,
          color: globalSettings.textColor
        }}
      >
        <Header />
        <main className="p-4 sm:p-6 md:p-8 flex-grow">
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/quiz-list" element={<QuizList />} />
            <Route path="/admin" element={
              isAuthenticated ? <AdminPanel /> : <Login onLogin={login} />
            } />
            <Route path="/quiz/:id" element={<QuizViewWrapper />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </QuizContext.Provider>
  );
};

export default App;