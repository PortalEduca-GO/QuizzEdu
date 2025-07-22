import React, { useContext } from 'react';
import { QuizContext } from '../App';
import { PlayIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const QuizList: React.FC = () => {
  const context = useContext(QuizContext);

  if (!context) {
    return <div>Carregando...</div>;
  }

  const { quizzes } = context;
  const publishedQuizzes = quizzes.filter(quiz => quiz.isPublished);

  const getQuizStats = (quiz: any) => {
    const questionCount = quiz.questions.length;
    const estimatedTime = Math.ceil(questionCount * 1.5); // 1.5 min por pergunta
    const maxScore = questionCount * 10;
    return { questionCount, estimatedTime, maxScore };
  };

  const getDifficultyLevel = (questionCount: number) => {
    if (questionCount <= 5) return { level: 'Fácil', color: 'text-green-600 bg-green-50' };
    if (questionCount <= 10) return { level: 'Médio', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Difícil', color: 'text-red-600 bg-red-50' };
  };

  if (publishedQuizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum Quiz Disponível</h2>
          <p className="text-gray-600 mb-6">
            Os administradores ainda não publicaram nenhum quiz. Volte mais tarde!
          </p>
          <div className="animate-pulse">
            <div className="inline-flex items-center text-sm text-blue-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              Novos quizzes em breve...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quizzes Disponíveis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Teste seus conhecimentos com nossos quizzes interativos. 
            Escolha um tema e descubra o quanto você sabe!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedQuizzes.map((quiz) => {
            const { questionCount, estimatedTime, maxScore } = getQuizStats(quiz);
            const difficulty = getDifficultyLevel(questionCount);
            
            return (
              <div key={quiz.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {quiz.logoUrl && (
                  <div 
                    className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                    style={{
                      background: quiz.customization?.backgroundColor || 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                    }}
                  >
                    <img 
                      src={quiz.logoUrl} 
                      alt={quiz.title} 
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                )}
                
                {!quiz.logoUrl && (
                  <div 
                    className="h-48 flex items-center justify-center"
                    style={{
                      background: quiz.customization?.backgroundColor || 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                    }}
                  >
                    <div className="text-white text-center">
                      <CheckBadgeIcon className="h-16 w-16 mx-auto mb-2 opacity-80" />
                      <h3 className="text-xl font-semibold">{quiz.title}</h3>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {quiz.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${difficulty.color}`}>
                      {difficulty.level}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {quiz.description}
                  </p>

                  <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        {questionCount} perguntas
                      </span>
                      
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        ~{estimatedTime} min
                      </span>
                    </div>
                    
                    <div className="flex items-center text-yellow-500">
                      <StarIcon className="h-4 w-4 mr-1" />
                      <span className="text-gray-700 font-medium">{maxScore} pts</span>
                    </div>
                  </div>

                  <a
                    href={`#/quiz/${quiz.id}`}
                    className="w-full flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{
                      backgroundColor: quiz.customization?.accentColor || '#3b82f6'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      const color = quiz.customization?.accentColor || '#3b82f6';
                      target.style.backgroundColor = color + 'DD';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      const color = quiz.customization?.accentColor || '#3b82f6';
                      target.style.backgroundColor = color;
                    }}
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Iniciar Quiz
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {publishedQuizzes.length > 0 && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md">
              <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700 font-medium">
                {publishedQuizzes.length} quiz{publishedQuizzes.length > 1 ? 'zes' : ''} disponível{publishedQuizzes.length > 1 ? 'eis' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
