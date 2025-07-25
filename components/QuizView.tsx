import React, { useContext, useState, useEffect } from 'react';
import { QuizContext } from '../App';

import { AcademicCapIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const QuizView: React.FC = () => {
  const context = useContext(QuizContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [questionKey, setQuestionKey] = useState<number>(0); // Forçar reset do timer
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  // Limite de uso dos auxílios para todo o quiz (não reinicia por questão)
  const [lifelinesUsed, setLifelinesUsed] = useState<{ askTheApi: number; probability: number }>({ askTheApi: 0, probability: 0 });
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [probabilities, setProbabilities] = useState<Record<string, number> | null>(null);
  
  const quiz = context?.quiz;
  // Fallback para compatibilidade com bancos que ainda não têm essas colunas
  const askTheApiLimit = quiz?.askTheApiLimit ?? (quiz ? 1 : 0);
  const audienceLimit = quiz?.audienceLimit ?? (quiz ? 1 : 0);
  
  useEffect(() => {
    if (quiz) {
      const { customization } = quiz;
      document.documentElement.style.setProperty('--color-bg', customization.backgroundColor);
      document.documentElement.style.setProperty('--color-text', customization.textColor);
      document.documentElement.style.setProperty('--color-primary', customization.accentColor);
      document.documentElement.style.setProperty('--color-secondary', customization.secondaryColor);
      document.documentElement.style.setProperty('--color-card-bg', customization.cardBackgroundColor);
      document.documentElement.style.setProperty('--color-primary-focus', `${customization.accentColor}E6`);
      
      // Aplicar classe de tamanho de fonte
      document.documentElement.className = `font-size-${customization.fontSize}`;
      
      // Aplicar classe de arredondamento
      document.documentElement.setAttribute('data-border-radius', customization.borderRadius);
    }
  }, [quiz]);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <div className="text-center p-8 bg-white/20 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Nenhum quiz disponível</h2>
          <p>Parece que o administrador ainda não criou um quiz. Volte mais tarde!</p>
        </div>
      </div>
    );
  }

  // Protege contra índice fora do array
  const safeIndex = Math.min(currentQuestionIndex, quiz.questions.length - 1);
  const currentQuestion = quiz.questions[safeIndex];
  const { customization } = quiz;

  // Inicia ou reinicia o timer ao trocar de pergunta
  useEffect(() => {
    if (!quiz.questions.length || isFinished || !currentQuestion) return;
    
    const time = typeof currentQuestion.timeLimit === 'number' && currentQuestion.timeLimit >= 5 ? currentQuestion.timeLimit : 30;
    setTimeLeft(time);
    setTimerActive(true);
    setSelectedAnswerId(null);
    setFeedback(null);
    setProbabilities(null);
    setQuestionKey(prev => prev + 1); // Força reset do timer
  }, [currentQuestionIndex, isFinished, currentQuestion, quiz.questions.length]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || feedback || isFinished || !currentQuestion) return;
    
    if (timeLeft <= 0) {
      setTimerActive(false);
      setFeedback({ correct: false, message: 'Tempo esgotado!' });
      setTimeout(() => {
        proceedToNextQuestion();
      }, 1200);
      return;
    }
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          setFeedback({ correct: false, message: 'Tempo esgotado!' });
          setTimeout(() => {
            proceedToNextQuestion();
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerActive, feedback, isFinished, currentQuestion, questionKey]);

  const handleAnswerSelect = (answerId: string) => {
    // Proteção extra: só permite seleção se não houver feedback, não houver resposta já selecionada, e o quiz não estiver finalizado
    if (feedback || selectedAnswerId !== null || isFinished || !timerActive) return;
    
    setSelectedAnswerId(answerId);
    setTimerActive(false); // Pausa o timer imediatamente
    
    // Exibe feedback imediatamente ao selecionar
    const isCorrect = answerId === currentQuestion.correctAnswerId;
    let message = '';
    if (quiz.feedback) {
      const { randomize, correct, incorrect } = quiz.feedback;
      if (isCorrect) {
        if (correct && correct.length > 0) {
          message = randomize
            ? correct[Math.floor(Math.random() * correct.length)]
            : correct[0];
        } else {
          message = 'Correto!';
        }
      } else {
        if (incorrect && incorrect.length > 0) {
          message = randomize
            ? incorrect[Math.floor(Math.random() * incorrect.length)]
            : incorrect[0];
        } else {
          message = 'Incorreto!';
        }
      }
    } else {
      message = isCorrect ? 'Correto!' : 'Incorreto!';
    }
    
    setFeedback({ correct: isCorrect, message });
    if (isCorrect) setScore(prev => prev + 10);
    
    // Avança após mostrar feedback
    setTimeout(() => {
      proceedToNextQuestion();
    }, 1200);
  };
  
  const proceedToNextQuestion = () => {
    if (isFinished) return; // Proteção extra
    
    setFeedback(null);
    setSelectedAnswerId(null);
    setProbabilities(null);
    setTimerActive(false);
    
    // NÃO reseta lifelinesUsed aqui!
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      setTimerActive(false);
    }
  };



  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setScore(0);
    setIsFinished(false);
    setFeedback(null);
    setProbabilities(null);
    setTimerActive(false);
    setLifelinesUsed({ askTheApi: 0, probability: 0 }); // Só reseta ao reiniciar o quiz
    setQuestionKey(prev => prev + 1); // Força reinicialização do timer
  };

  const handleAskTheApi = () => {
    setIsApiLoading(true);
    setLifelinesUsed(prev => ({ ...prev, askTheApi: prev.askTheApi + 1 }));
    setTimeout(() => {
      const isCorrectChance = Math.random() <= 0.6;
      let suggestedAnswerText = '';
      if (isCorrectChance) {
        const correctAnswer = currentQuestion.answers.find(a => a.id === currentQuestion.correctAnswerId);
        suggestedAnswerText = correctAnswer?.text || 'Não foi possível determinar.';
      } else {
        const incorrectAnswers = currentQuestion.answers.filter(a => a.id !== currentQuestion.correctAnswerId);
        if (incorrectAnswers.length > 0) {
          const randomIncorrectAnswer = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
          suggestedAnswerText = randomIncorrectAnswer.text;
        } else {
          const correctAnswer = currentQuestion.answers.find(a => a.id === currentQuestion.correctAnswerId);
          suggestedAnswerText = correctAnswer?.text || 'Não foi possível determinar.';
        }
      }
      alert(`O universitário sugere: ${suggestedAnswerText}`);
      setIsApiLoading(false);
    }, 600); // Mais rápido
  };
  
  const handleProbabilityLifeline = () => {
    setLifelinesUsed(prev => ({ ...prev, probability: prev.probability + 1 }));
    const audienceIsCorrect = Math.random() <= 0.4;
    let popularChoiceId: string;
    if (audienceIsCorrect) {
      popularChoiceId = currentQuestion.correctAnswerId;
    } else {
      const incorrectAnswers = currentQuestion.answers.filter(a => a.id !== currentQuestion.correctAnswerId);
      popularChoiceId = incorrectAnswers.length > 0
        ? incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)].id
        : currentQuestion.correctAnswerId;
    }
    const randoms = currentQuestion.answers.map(answer => {
      const base = Math.random() * 20 + 5;
      return answer.id === popularChoiceId ? base + 45 : base;
    });
    const total = randoms.reduce((sum, val) => sum + val, 0);
    const newProbs: Record<string, number> = {};
    let sumOfProbs = 0;
    currentQuestion.answers.forEach((answer, index) => {
      const prob = Math.round((randoms[index] / total) * 100);
      newProbs[answer.id] = prob;
      sumOfProbs += prob;
    });
    let diff = 100 - sumOfProbs;
    if (diff !== 0) {
      const keyToAdjust = Object.keys(newProbs).reduce((a, b) => newProbs[a] > newProbs[b] ? a : b);
      newProbs[keyToAdjust] += diff;
    }
    setProbabilities(newProbs);
  };


  
  const mainContent = isFinished ? (
    <div className="text-center">
      {quiz.logoUrl && <img src={quiz.logoUrl} alt="Quiz Logo" className="max-h-16 sm:max-h-24 w-auto object-contain mx-auto mb-2 sm:mb-6"/>}
      <h2 className="text-xl sm:text-4xl font-bold mb-2 sm:mb-4">Quiz Finalizado!</h2>
      <p className="text-sm sm:text-xl mb-2 sm:mb-6">Sua pontuação final é: <span className="font-bold text-primary">{score}</span> de {quiz.questions.length * 10}</p>
      <button
        onClick={restartQuiz}
        className="w-full sm:w-auto px-4 sm:px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-105 text-base sm:text-lg"
      >
        Tentar Novamente
      </button>
    </div>
  ) : (
    <>
      <div className="flex items-center gap-4 mb-6">
        {quiz.logoUrl && (
            <img src={quiz.logoUrl} alt="Quiz Logo" className="max-h-16 max-w-[240px] object-contain flex-shrink-0"/>
        )}
        <div>
            <h1 className={`text-2xl md:text-3xl font-bold`}>{quiz.title}</h1>
            <p className={`mt-1 text-sm opacity-80 font-${customization.fontFamily}`}>
                {quiz.description}
            </p>
        </div>
      </div>
      <div className="mb-4 text-right font-semibold">
        <span>Pontuação: {score}</span>
      </div>
      <div className="bg-black/10 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pergunta {currentQuestionIndex + 1} de {quiz.questions.length}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-lg font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded">
            <span role="img" aria-label="timer">⏰</span>
            <span>{timeLeft}s</span>
          </div>
          {/* Só mostra as ajudas se estiverem habilitadas */}
          {askTheApiLimit > 0 && (
            <button 
                onClick={handleAskTheApi} 
                disabled={lifelinesUsed.askTheApi >= askTheApiLimit || isApiLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                aria-label="Pedir ajuda a um universitário"
            >
                <AcademicCapIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{isApiLoading ? 'Pensando...' : 'Universitário'}</span>
                <span className="ml-2 text-xs bg-white/30 rounded px-2 py-0.5">{askTheApiLimit - lifelinesUsed.askTheApi}/{askTheApiLimit}</span>
            </button>
          )}
          {audienceLimit > 0 && (
            <button 
                onClick={handleProbabilityLifeline} 
                disabled={lifelinesUsed.probability >= audienceLimit || !!probabilities}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                aria-label="Ver probabilidades da plateia"
            >
                <ChartBarIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Plateia</span>
                <span className="ml-2 text-xs bg-white/30 rounded px-2 py-0.5">{audienceLimit - lifelinesUsed.probability}/{audienceLimit}</span>
            </button>
          )}
          </div>
        </div>
        <p className="text-lg mb-6">{currentQuestion.text}</p>
        <div className="flex flex-col gap-4">
          {currentQuestion.answers.map(answer => {
            const prob = probabilities ? probabilities[answer.id] : null;
            const isSelected = selectedAnswerId === answer.id;
            const isCorrect = feedback && answer.id === currentQuestion.correctAnswerId;
            const isIncorrect = feedback && isSelected && !isCorrect;
            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={!!feedback || selectedAnswerId !== null || isFinished || !timerActive}
                className={
                  `w-full flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-medium transition-all duration-200 shadow-sm ${
                    !!feedback || selectedAnswerId !== null || isFinished || !timerActive ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                  } ` +
                  (isCorrect
                    ? 'bg-green-100 border-green-400 text-green-900'
                    : isIncorrect
                      ? 'bg-red-100 border-red-400 text-red-900'
                      : isSelected && !feedback
                        ? 'bg-blue-100 border-blue-400 text-blue-900'
                        : 'bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-300')
                }
                style={{ minHeight: 48, minWidth: 44 }}
              >
                <span className="break-words text-left w-full text-sm sm:text-base">{answer.text}</span>
                {prob !== null && (
                  <span className="ml-2 sm:ml-4 text-xs sm:text-base font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {prob}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Feedback visual */}
      {feedback && (
        <div className={`mt-8 text-center p-5 rounded-xl font-bold text-2xl shadow-md ${feedback.correct ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.message}
        </div>
      )}
      {/* Botão removido: transição automática */}
    </>
  );

  return (
    <div
      style={{ fontFamily: `var(--font-${customization.fontFamily})` }}
      className={`quiz-container min-h-[calc(100vh-128px)] flex items-center justify-center p-2 sm:p-4 ${customization.animationsEnabled ? 'animate-smooth' : ''}`}
    >
      <div className="w-full max-w-md sm:max-w-2xl mx-auto quiz-card text-inherit p-3 sm:p-6 md:p-8 shadow-2xl border-2 border-white/10">
        {mainContent}
      </div>
    </div>
  );
};

export default QuizView;