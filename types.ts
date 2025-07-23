import type { Dispatch, SetStateAction } from 'react';

export interface Answer {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerId: string;
  timeLimit?: number; // tempo em segundos (opcional)
}

export interface QuizCustomization {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  secondaryColor: string;
  cardBackgroundColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'small' | 'medium' | 'large';
  showImmediateFeedback: boolean;
  animationsEnabled: boolean;
  theme: 'light' | 'dark' | 'custom';
}

export interface FooterCustomization {
  text: string;
  logoUrl?: string;
}

export interface GlobalPageSettings {
  siteName: string;
  headerText: string;
  headerLogo: string | null; // base64 ou data URL da imagem
  footerText: string;
  footerLogo: string | null; // base64 ou data URL da imagem
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  favicon: string | null; // base64 ou data URL da imagem
  customCSS: string;
}

export interface QuizFeedback {
  randomize: boolean;
  correct: string[];
  incorrect: string[];
}

export interface Quiz {
  id: string;
  headerText: string;
  title: string;
  description: string;
  logoUrl?: string;
  questions: Question[];
  customization: QuizCustomization;
  feedback: QuizFeedback;
  footer: FooterCustomization;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  askTheApiLimit?: number; // Limite de uso universitário
  audienceLimit?: number; // Limite de uso plateia
}

export interface QuizContextType {
  quiz: Quiz | null;
  setQuiz: Dispatch<SetStateAction<Quiz | null>>;
  quizzes: Quiz[];
  setQuizzes: Dispatch<SetStateAction<Quiz[]>>;
  saveQuiz: (quizToSave: Quiz) => Promise<Quiz | null>;
  updateQuizLocally: (quizToUpdate: Quiz) => void;
  saveAllChanges: () => Promise<void>;
  dirtyQuizIds: Set<string>;
  deleteQuiz: (quizId: string) => Promise<void>;
  createNewQuiz: () => Quiz;
  loadQuiz: (quizId: string) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  globalSettings: GlobalPageSettings;
  setGlobalSettings: Dispatch<SetStateAction<GlobalPageSettings>>;
  saveGlobalSettings: (settings: GlobalPageSettings) => void;
}