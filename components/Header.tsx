import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheckIcon, PencilSquareIcon, ArrowRightOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import { QuizContext } from '../App';

const Header: React.FC = () => {
  const context = useContext(QuizContext);
  const quiz = context?.quiz;
  const quizzes = context?.quizzes || [];
  const globalSettings = context?.globalSettings;
  const isAuthenticated = context?.isAuthenticated || false;
  const logout = context?.logout;

  const activeLinkClass = 'bg-blue-600 text-white';
  const inactiveLinkClass = 'text-gray-200 hover:bg-blue-500 hover:text-white';

  const handleLogout = () => {
    if (logout) {
      logout();
      window.location.href = '#/';
    }
  };

  return (
    <header 
      className="shadow-lg"
      style={{ 
        backgroundColor: globalSettings?.primaryColor || quiz?.customization.accentColor || '#3b82f6',
        color: 'white'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            {globalSettings?.headerLogo ? (
              <img 
                src={globalSettings.headerLogo} 
                alt="Logo" 
                className="h-12 w-auto object-contain max-w-[200px]"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))'
                }}
              />
            ) : quiz?.logoUrl ? (
              <img 
                src={quiz.logoUrl} 
                alt="Logo" 
                className="h-10 w-10 object-contain rounded"
              />
            ) : (
              <div className="h-10 w-10 bg-white/20 rounded flex items-center justify-center">
                <PencilSquareIcon className="h-6 w-6" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {globalSettings?.headerText || quiz?.headerText || 'Criador de Quiz'}
              </h1>
              <p className="text-sm opacity-80">
                Sistema de Criação e Gerenciamento de Quizzes
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            {/* Public Quiz List */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  isActive ? activeLinkClass : inactiveLinkClass
                }`
              }
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Quizzes
            </NavLink>

            {/* Discrete Admin Access - Small icon button */}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `p-2 rounded-lg transition-colors opacity-30 hover:opacity-100 ${
                  isActive ? 'bg-blue-600 text-white opacity-100' : 'hover:bg-blue-500'
                }`
              }
              title={isAuthenticated ? 'Painel Admin' : 'Acesso Admin'}
            >
              <ShieldCheckIcon className="h-4 w-4" />
            </NavLink>

            {/* Logout (only show if authenticated) */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-xs ${inactiveLinkClass}`}
                title="Sair da sessão admin"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Sair
              </button>
            )}
          </nav>
        </div>

        {/* Stats Bar (when authenticated) */}
        {isAuthenticated && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <span>Total de Quizzes: {quizzes.length}</span>
                <span>
                  Publicados: {quizzes.filter(q => q.isPublished).length}
                </span>
                <span>
                  Rascunhos: {quizzes.filter(q => !q.isPublished).length}
                </span>
                <span className="text-green-200 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Sessão Ativa
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs opacity-75">
                <span>
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })} às {new Date().toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <span className="text-yellow-200">
                  🛡️ Admin
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
