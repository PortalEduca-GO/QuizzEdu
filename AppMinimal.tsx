import React, { useState, createContext, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Quiz, QuizContextType, GlobalPageSettings } from './types';

export const QuizContext = createContext<QuizContextType | null>(null);

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultGlobalSettings = (): GlobalPageSettings => ({
  siteName: 'Sistema de Quiz',
  headerText: 'Criador de Quiz Dinâmico',
  headerLogo: null,
  footerText: '© 2024 Sistema de Quiz. Todos os direitos reservados.',
  footerLogo: null,
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  backgroundColor: '#f8fafc',
  textColor: '#1e293b',
  favicon: null,
  customCSS: ''
});

const AppMinimal: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<GlobalPageSettings>(createDefaultGlobalSettings);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const contextValue: QuizContextType = useMemo(() => ({
    quiz,
    setQuiz,
    quizzes,
    setQuizzes,
    saveQuiz: async () => null,
    deleteQuiz: async () => {},
    updateQuizLocally: () => {},
    saveAllChanges: async () => {},
    dirtyQuizIds: new Set<string>(),
    createNewQuiz: () => ({
      id: generateId(),
      headerText: 'Quiz Teste',
      title: 'Quiz Teste',
      description: 'Descrição teste',
      logoUrl: '',
      questions: [],
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
        randomize: false,
        correct: ['Parabéns! Você acertou!'],
        incorrect: ['Ops! Tente novamente!']
      },
      footer: { text: 'Footer teste' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
    }),
    loadQuiz: async () => {},
    isAuthenticated,
    login: () => { setIsAuthenticated(true); return true; },
    logout: () => setIsAuthenticated(false),
    globalSettings,
    setGlobalSettings,
    saveGlobalSettings: async () => {}
  }), [quiz, quizzes, isAuthenticated, globalSettings]);

  return (
    <QuizContext.Provider value={contextValue}>
      <div style={{ padding: '20px' }}>
        <h1>Sistema de Quiz - Versão Mínima</h1>
        <p>App.tsx carregado com sucesso!</p>
        <Routes>
          <Route path="/" element={<div>Página inicial funcionando</div>} />
          <Route path="/test" element={<div>Rota de teste funcionando</div>} />
        </Routes>
      </div>
    </QuizContext.Provider>
  );
};

export default AppMinimal;
