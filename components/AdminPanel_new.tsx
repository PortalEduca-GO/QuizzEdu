import React, { useContext, useState, useRef } from 'react';
import { QuizContext } from '../App';
import type { Quiz, Question, Answer } from '../types';
import {
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PencilIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  SwatchIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Paletas de cores predefinidas
const COLOR_PALETTES = {
  modern: {
    name: 'Moderno',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    accentColor: '#3b82f6',
    secondaryColor: '#64748b',
    cardBackgroundColor: '#ffffff'
  },
  dark: {
    name: 'Escuro',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
    accentColor: '#06b6d4',
    secondaryColor: '#94a3b8',
    cardBackgroundColor: '#1e293b'
  },
  warm: {
    name: 'Aconchegante',
    backgroundColor: '#fef7ed',
    textColor: '#7c2d12',
    accentColor: '#ea580c',
    secondaryColor: '#a3a3a3',
    cardBackgroundColor: '#ffffff',
  },
  nature: {
    name: 'Natureza',
    backgroundColor: '#f0fdf4',
    textColor: '#14532d',
    accentColor: '#16a34a',
    secondaryColor: '#6b7280',
    cardBackgroundColor: '#ffffff'
  },
  purple: {
    name: 'Roxo',
    backgroundColor: '#faf5ff',
    textColor: '#581c87',
    accentColor: '#9333ea',
    secondaryColor: '#6b7280',
    cardBackgroundColor: '#ffffff'
  },
  ocean: {
    name: 'Oceano',
    backgroundColor: '#f0f9ff',
    textColor: '#0c4a6e',
    accentColor: '#0284c7',
    secondaryColor: '#64748b',
    cardBackgroundColor: '#ffffff'
  }
};

// Componente de configurações globais (placeholder)
const GlobalSettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações do Site</h1>
              <p className="text-gray-600">Configure as opções globais do seu site</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações Gerais</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Nome do Site</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Digite o nome do seu site"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Descrição do Site</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Descreva o propósito do seu site"
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const context = useContext(QuizContext);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'settings'>('list');
  const [activeTab, setActiveTab] = useState<'basic' | 'design' | 'questions' | 'settings'>('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!context) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const { quizzes, deleteQuiz, createNewQuiz, saveQuiz, updateQuizLocally, saveAllChanges, dirtyQuizIds } = context;

  const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

  // Função para upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingQuiz) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateQuizField('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para aplicar paleta de cores
  const applyColorPalette = (palette: typeof COLOR_PALETTES.modern) => {
    if (!editingQuiz) return;

    const updatedCustomization = {
      ...editingQuiz.customization,
      backgroundColor: palette.backgroundColor,
      textColor: palette.textColor,
      accentColor: palette.accentColor,
      secondaryColor: palette.secondaryColor,
      cardBackgroundColor: palette.cardBackgroundColor
    };

    updateQuizField('customization', updatedCustomization);
  };

  // Função para atualizar uma propriedade específica da customização
  const updateCustomization = (property: string, value: any) => {
    if (!editingQuiz) return;

    const currentCustomization = editingQuiz.customization || {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#3b82f6',
      secondaryColor: '#64748b',
      cardBackgroundColor: '#ffffff'
    };

    const updatedCustomization = {
      ...currentCustomization,
      [property]: value
    };

    updateQuizField('customization', updatedCustomization);
  };

  const handleCreateNew = async () => {
    const newQuiz = createNewQuiz();
    const savedQuiz = await saveQuiz(newQuiz);
    if (savedQuiz) {
        setEditingQuiz(savedQuiz);
        setViewMode('edit');
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz({...quiz});
    setViewMode('edit');
  };

  const handleSaveQuiz = () => {
    if (editingQuiz) {
      updateQuizLocally(editingQuiz);
      setEditingQuiz(null);
      setViewMode('list');
    }
  };

  const handleCancelEdit = () => {
    setEditingQuiz(null);
    setViewMode('list');
  };

  const handleOpenSettings = () => {
    setViewMode('settings');
  };

  const handleCloseSettings = () => {
    setViewMode('list');
  };

  const updateQuizField = (field: string, value: any) => {
    if (editingQuiz) {
      setEditingQuiz({
        ...editingQuiz,
        [field]: value,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Funções para gerenciar perguntas
  const addQuestion = () => {
    if (!editingQuiz) return;

    const newQuestion: Question = {
      id: generateId(),
      text: '',
      correctAnswerId: '',
      answers: [
        { id: generateId(), text: '' },
        { id: generateId(), text: '' }
      ]
    };

    setEditingQuiz({
      ...editingQuiz,
      questions: [...editingQuiz.questions, newQuestion]
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (!editingQuiz) return;

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.filter(q => q.id !== questionId)
    });
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    if (!editingQuiz) return;

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  // Funções para gerenciar respostas
  const addAnswer = (questionId: string) => {
    if (!editingQuiz) return;

    const newAnswer: Answer = {
      id: generateId(),
      text: ''
    };

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map(q =>
        q.id === questionId
          ? { ...q, answers: [...q.answers, newAnswer] }
          : q
      )
    });
  };

  const updateAnswer = (questionId: string, answerId: string, text: string) => {
    if (!editingQuiz) return;

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map(a =>
                a.id === answerId ? { ...a, text } : a
              )
            }
          : q
      )
    });
  };

  const deleteAnswer = (questionId: string, answerId: string) => {
    if (!editingQuiz) return;

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.filter(a => a.id !== answerId),
              correctAnswerId: q.correctAnswerId === answerId ? '' : q.correctAnswerId
            }
          : q
      )
    });
  };

  const setCorrectAnswer = (questionId: string, answerId: string) => {
    if (!editingQuiz) return;

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map(q =>
        q.id === questionId ? { ...q, correctAnswerId: answerId } : q
      )
    });
  };

  const handleDelete = (quizId: string) => {
    if (confirmDelete === quizId) {
      deleteQuiz(quizId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(quizId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleTogglePublish = (quiz: Quiz) => {
    const updatedQuiz = { ...quiz, isPublished: !quiz.isPublished };
    updateQuizLocally(updatedQuiz);
  };

  const handleDuplicate = (quiz: Quiz) => {
    const duplicatedQuiz = {
      ...quiz,
      id: generateId(),
      title: `${quiz.title} (Cópia)`,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveQuiz(duplicatedQuiz);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Renderizar configurações globais do site
  if (viewMode === 'settings') {
    return <GlobalSettingsPanel onClose={handleCloseSettings} />;
  }

  // Renderizar o editor de quiz
  if (viewMode === 'edit' && editingQuiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header do Editor */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editor de Quiz</h1>
                <p className="text-gray-600">Configure o conteúdo e aparência do quiz</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuiz}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                Salvar Quiz
              </button>
            </div>
          </div>

          {/* Navegação por Abas */}
          <div className="mb-6">
            <nav className="flex space-x-8 bg-white rounded-lg p-1 shadow">
              <button
                onClick={() => setActiveTab('basic')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'basic'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Informações Básicas
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'design'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PaintBrushIcon className="h-4 w-4 mr-2" />
                Design do Quiz
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'questions'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Perguntas ({editingQuiz.questions.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <PencilIcon className="h-6 w-6 mr-3 text-blue-600" />
                Informações Básicas
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Título do Quiz</label>
                    <input
                      type="text"
                      value={editingQuiz.title}
                      onChange={(e) => updateQuizField('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Digite um título atrativo para o quiz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Descrição</label>
                    <textarea
                      value={editingQuiz.description}
                      onChange={(e) => updateQuizField('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Descreva sobre o que é o quiz"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Texto do Cabeçalho</label>
                    <input
                      type="text"
                      value={editingQuiz.headerText || ''}
                      onChange={(e) => updateQuizField('headerText', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Texto que aparece no topo do quiz"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editingQuiz.isPublished}
                      onChange={(e) => updateQuizField('isPublished', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                    />
                    <label className="text-sm font-semibold text-gray-700">
                      Publicar quiz imediatamente
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Logo do Quiz</label>
                  <div className="space-y-4">
                    {editingQuiz.logoUrl && (
                      <div className="relative">
                        <img
                          src={editingQuiz.logoUrl}
                          alt="Logo do quiz"
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => updateQuizField('logoUrl', '')}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Clique para selecionar uma imagem</p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF até 5MB</p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <PaintBrushIcon className="h-6 w-6 mr-3 text-blue-600" />
                Design do Quiz
              </h2>

              {/* Paletas de Cores */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <SwatchIcon className="h-5 w-5 mr-2" />
                  Paletas de Cores
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(COLOR_PALETTES).map(([key, palette]) => {
                    const typedPalette = palette as typeof COLOR_PALETTES.modern;
                    return (
                      <div
                        key={key}
                        onClick={() => applyColorPalette(typedPalette)}
                        className="cursor-pointer rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all p-4 group"
                      >
                        <div className="flex space-x-2 mb-3">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: typedPalette.backgroundColor }}
                          ></div>
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: typedPalette.accentColor }}
                          ></div>
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: typedPalette.cardBackgroundColor }}
                          ></div>
                        </div>
                        <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {typedPalette.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customização Individual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Cores Personalizadas</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                    <div className="flex space-x-3">
                      <input
                        type="color"
                        value={editingQuiz.customization?.backgroundColor || '#f8fafc'}
                        onChange={(e) => updateCustomization('backgroundColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingQuiz.customization?.backgroundColor || '#f8fafc'}
                        onChange={(e) => updateCustomization('backgroundColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Texto</label>
                    <div className="flex space-x-3">
                      <input
                        type="color"
                        value={editingQuiz.customization?.textColor || '#1e293b'}
                        onChange={(e) => updateCustomization('textColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingQuiz.customization?.textColor || '#1e293b'}
                        onChange={(e) => updateCustomization('textColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Destaque</label>
                    <div className="flex space-x-3">
                      <input
                        type="color"
                        value={editingQuiz.customization?.accentColor || '#3b82f6'}
                        onChange={(e) => updateCustomization('accentColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingQuiz.customization?.accentColor || '#3b82f6'}
                        onChange={(e) => updateCustomization('accentColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Configurações de Estilo</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Família da Fonte</label>
                    <select
                      value={editingQuiz.customization?.fontFamily || 'sans'}
                      onChange={(e) => updateCustomization('fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sans">Sans Serif (Padrão)</option>
                      <option value="serif">Serif</option>
                      <option value="mono">Monospace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                    <select
                      value={editingQuiz.customization?.fontSize || 'medium'}
                      onChange={(e) => updateCustomization('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Arredondamento das Bordas</label>
                    <select
                      value={editingQuiz.customization?.borderRadius || 'medium'}
                      onChange={(e) => updateCustomization('borderRadius', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">Sem arredondamento</option>
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={editingQuiz.customization?.showImmediateFeedback ?? true}
                        onChange={(e) => updateCustomization('showImmediateFeedback', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">Mostrar feedback imediato</label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={editingQuiz.customization?.animationsEnabled ?? true}
                        onChange={(e) => updateCustomization('animationsEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">Ativar animações</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AdjustmentsHorizontalIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Perguntas ({editingQuiz.questions.length})
                </h2>
                <button
                  onClick={addQuestion}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Adicionar Pergunta
                </button>
              </div>

              {editingQuiz.questions.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <AdjustmentsHorizontalIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-medium">Nenhuma pergunta adicionada ainda</p>
                  <p className="text-sm mt-2">Clique em "Adicionar Pergunta" para começar a criar seu quiz</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {editingQuiz.questions.map((question, questionIndex) => (
                    <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {questionIndex + 1}
                          </span>
                          Pergunta {questionIndex + 1}
                        </h3>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir pergunta"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Texto da pergunta</label>
                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Digite sua pergunta aqui..."
                          rows={3}
                        />
                      </div>

                      {/* Configurações da Pergunta */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Configurações da Pergunta</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tempo Limite (segundos)
                            </label>
                            <input
                              type="number"
                              min="5"
                              max="300"
                              value={question.timeLimit || 30}
                              onChange={(e) => updateQuestion(question.id, 'timeLimit', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="30"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tempo em segundos para responder (mínimo 5)</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-semibold text-gray-700">
                            Opções de Resposta
                          </label>
                          <button
                            onClick={() => addAnswer(question.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Adicionar Resposta
                          </button>
                        </div>

                        <div className="space-y-3">
                          {question.answers.map((answer, answerIndex) => (
                            <div key={answer.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswerId === answer.id}
                                onChange={() => setCorrectAnswer(question.id, answer.id)}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-400"
                              />
                              <input
                                type="text"
                                value={answer.text}
                                onChange={(e) => updateAnswer(question.id, answer.id, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder={`Opção ${answerIndex + 1}`}
                              />
                              {question.answers.length > 2 && (
                                <button
                                  onClick={() => deleteAnswer(question.id, answer.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                  title="Remover opção"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {!question.correctAnswerId && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 flex items-center">
                              <span className="mr-2">⚠️</span>
                              Selecione a resposta correta clicando no botão de rádio ao lado da opção
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Cog6ToothIcon className="h-6 w-6 mr-3 text-blue-600" />
                Configurações Avançadas do Quiz
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configurações de Ajudas */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2 text-yellow-600" />
                    Configurações de Ajudas
                  </h3>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={(editingQuiz.askTheApiLimit ?? 0) > 0}
                        onChange={(e) => updateQuizField('askTheApiLimit', e.target.checked ? 1 : 0)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Ativar ajuda do "Universitário"</span>
                    </label>
                    {(editingQuiz.askTheApiLimit ?? 0) > 0 && (
                      <div className="mt-3 ml-7">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantidade de usos por quiz
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={editingQuiz.askTheApiLimit || 1}
                          onChange={(e) => updateQuizField('askTheApiLimit', parseInt(e.target.value))}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Probabilidade de acerto: 60% - O universitário sugere uma resposta
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={(editingQuiz.audienceLimit ?? 0) > 0}
                        onChange={(e) => updateQuizField('audienceLimit', e.target.checked ? 1 : 0)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Ativar ajuda da "Plateia"</span>
                    </label>
                    {(editingQuiz.audienceLimit ?? 0) > 0 && (
                      <div className="mt-3 ml-7">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantidade de usos por quiz
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={editingQuiz.audienceLimit || 1}
                          onChange={(e) => updateQuizField('audienceLimit', parseInt(e.target.value))}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Probabilidade de acerto: 40% - Mostra porcentagens simuladas de votos
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configurações de Feedback */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-green-600" />
                    Configurações de Feedback
                  </h3>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={editingQuiz.feedback?.randomize ?? false}
                        onChange={(e) => updateQuizField('feedback', {
                          ...editingQuiz.feedback,
                          randomize: e.target.checked
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Randomizar mensagens de feedback</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagens para respostas corretas (uma por linha)
                    </label>
                    <textarea
                      value={(editingQuiz.feedback?.correct || []).join('\n')}
                      onChange={(e) => updateQuizField('feedback', {
                        ...editingQuiz.feedback,
                        correct: e.target.value.split('\n').filter(line => line.trim())
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Correto!&#10;Muito bem!&#10;Excelente!"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagens para respostas incorretas (uma por linha)
                    </label>
                    <textarea
                      value={(editingQuiz.feedback?.incorrect || []).join('\n')}
                      onChange={(e) => updateQuizField('feedback', {
                        ...editingQuiz.feedback,
                        incorrect: e.target.value.split('\n').filter(line => line.trim())
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Incorreto!&#10;Tente novamente!&#10;Não foi dessa vez!"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizar a lista de quizzes (view mode === 'list')
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="mt-2 text-gray-600">Gerencie seus quizzes e configurações do site</p>
            </div>
            <div className="flex items-center space-x-3">
              {dirtyQuizIds.size > 0 && (
                  <button
                    onClick={saveAllChanges}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg animate-pulse"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Salvar Alterações ({dirtyQuizIds.size})
                  </button>
              )}
              <button
                onClick={handleOpenSettings}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Configurações do Site
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Novo Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <DocumentDuplicateIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <EyeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Publicados</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.filter(q => q.isPublished).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <EyeSlashIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.filter(q => !q.isPublished).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <DocumentDuplicateIcon className="mx-auto h-16 w-16 text-gray-300 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum quiz encontrado</h3>
            <p className="text-gray-500 mb-8">Comece criando seu primeiro quiz agora mesmo.</p>
            <div className="space-y-4">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Criar Primeiro Quiz
              </button>
              <p className="text-sm text-gray-400">ou</p>
              <button
                onClick={handleOpenSettings}
                className="inline-flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configurar o Site
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg overflow-hidden rounded-xl">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Seus Quizzes</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className={`transition-colors ${dirtyQuizIds.has(quiz.id) ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}`}>
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {quiz.isPublished ? (
                              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                <EyeIcon className="h-6 w-6 text-green-600" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <EyeSlashIcon className="h-6 w-6 text-yellow-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xl font-bold text-gray-900 truncate">{quiz.title}</p>
                            <p className="text-gray-600 truncate mb-2">{quiz.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                📅 {formatDate(quiz.createdAt)}
                              </span>
                              <span className="flex items-center">
                                ❓ {quiz.questions?.length || 0} perguntas
                              </span>
                              <span className={`flex items-center font-semibold ${quiz.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                                {dirtyQuizIds.has(quiz.id) && <span className="text-xs font-bold text-yellow-700 mr-2">(Não salvo)</span>}
                                {quiz.isPublished ? '✅ Publicado' : '📝 Rascunho'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(quiz)}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar quiz"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(quiz)}
                          className="p-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Duplicar quiz"
                        >
                          <DocumentDuplicateIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className={`p-3 rounded-lg transition-colors ${
                            quiz.isPublished
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={quiz.isPublished ? 'Despublicar' : 'Publicar'}
                        >
                          {quiz.isPublished ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>

                        <button
                          onClick={() => handleDelete(quiz.id)}
                          className={`p-3 rounded-lg transition-colors ${
                            confirmDelete === quiz.id
                              ? 'text-white bg-red-600 hover:bg-red-700'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={confirmDelete === quiz.id ? "Clique novamente para confirmar" : "Excluir quiz"}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;