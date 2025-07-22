import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizContext } from '../App';
import type { Quiz } from '../types';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import GlobalSettingsPanel from './GlobalSettingsPanel';

const QuizManager: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(QuizContext);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  if (!context) {
    return <div>Carregando...</div>;
  }

  const { quizzes, createNewQuiz, loadQuiz, deleteQuiz, saveQuiz } = context;

  const handleCreateNew = () => {
    const newQuiz = createNewQuiz();
    saveQuiz(newQuiz); // Save the new quiz first
    loadQuiz(newQuiz.id);
    navigate(`/admin/edit/${newQuiz.id}`);
  };

  const handleTogglePublish = (quiz: Quiz) => {
    const updatedQuiz = {
      ...quiz,
      isPublished: !quiz.isPublished,
      updatedAt: new Date().toISOString()
    };
    saveQuiz(updatedQuiz);
  };

  const handleDuplicate = (quiz: Quiz) => {
    const duplicatedQuiz = createNewQuiz();
    const newQuiz = {
      ...duplicatedQuiz,
      ...quiz,
      id: duplicatedQuiz.id,
      title: `${quiz.title} - Cópia`,
      createdAt: duplicatedQuiz.createdAt,
      updatedAt: duplicatedQuiz.updatedAt,
      isPublished: false
    };
    saveQuiz(newQuiz);
    loadQuiz(newQuiz.id);
    navigate(`/admin/edit/${newQuiz.id}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuizStats = (quiz: Quiz) => {
    const questionCount = quiz.questions.length;
    const maxScore = questionCount * 10;
    return { questionCount, maxScore };
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Quizzes</h1>
          <p className="text-gray-600 mt-2">Crie, edite e publique seus quizzes</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGlobalSettings(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Configurações
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Quiz
          </button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum quiz encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro quiz.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Primeiro Quiz
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const { questionCount, maxScore } = getQuizStats(quiz);
            return (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {quiz.logoUrl && (
                  <div className="h-32 bg-gray-50 flex items-center justify-center">
                    <img src={quiz.logoUrl} alt={quiz.title} className="max-h-24 max-w-full object-contain" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mr-2">{quiz.title}</h3>
                    <div className="flex items-center">
                      {quiz.isPublished ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" title="Publicado" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full" title="Rascunho" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                    <span className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(quiz.updatedAt)}
                    </span>
                    <span>{questionCount} perguntas</span>
                    <span>{maxScore} pontos máx.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          loadQuiz(quiz.id);
                          navigate(`/admin/edit/${quiz.id}`);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar quiz"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDuplicate(quiz)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                        title="Duplicar quiz"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleTogglePublish(quiz)}
                        className={`p-2 rounded-full transition-colors ${
                          quiz.isPublished 
                            ? 'text-orange-600 hover:bg-orange-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={quiz.isPublished ? "Despublicar" : "Publicar"}
                      >
                        {quiz.isPublished ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      {quiz.isPublished && (
                        <a
                          href={`#/quiz/${quiz.id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Ver quiz"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className={`p-2 rounded-full transition-colors ${
                          confirmDelete === quiz.id
                            ? 'text-white bg-red-600 hover:bg-red-700'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={confirmDelete === quiz.id ? "Clique novamente para confirmar" : "Excluir quiz"}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {confirmDelete === quiz.id && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      Clique novamente para confirmar a exclusão
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Settings Panel */}
      {showGlobalSettings && (
        <GlobalSettingsPanel 
          onClose={() => setShowGlobalSettings(false)} 
        />
      )}
    </div>
  );
};

export default QuizManager;
