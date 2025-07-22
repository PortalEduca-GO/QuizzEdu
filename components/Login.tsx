import React, { useState, useEffect } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface LoginProps {
  onLogin: (password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [totalFailedAttempts, setTotalFailedAttempts] = useState(() => {
    // Recuperar tentativas falhadas do localStorage
    const saved = localStorage.getItem('login-failed-attempts');
    return saved ? parseInt(saved) : 0;
  });
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const [isPermanentlyBlocked, setIsPermanentlyBlocked] = useState(false);

  // Verificar se deve aplicar bloqueio permanente
  useEffect(() => {
    if (totalFailedAttempts >= 10) {
      setIsPermanentlyBlocked(true);
      setError('Acesso permanentemente bloqueado devido a múltiplas tentativas falhadas. Contate o administrador do sistema.');
    }
  }, [totalFailedAttempts]);

  // Calcular tempo de bloqueio progressivo
  const getBlockTime = (attempts: number) => {
    if (attempts >= 10) return 0; // Bloqueio permanente
    if (attempts >= 7) return 300; // 5 minutos
    if (attempts >= 5) return 120; // 2 minutos
    return 30; // 30 segundos (padrão)
  };

  // Bloquear após múltiplas tentativas incorretas
  useEffect(() => {
    if (attemptCount >= 3 && !isPermanentlyBlocked) {
      setIsBlocked(true);
      const blockDuration = getBlockTime(totalFailedAttempts + attemptCount);
      setBlockTime(blockDuration);
      
      const interval = setInterval(() => {
        setBlockTime((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setAttemptCount(0);
            setError('');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [attemptCount, totalFailedAttempts, isPermanentlyBlocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked || isPermanentlyBlocked) {
      if (isPermanentlyBlocked) {
        setError('Acesso permanentemente bloqueado. Contate o administrador do sistema.');
      } else {
        setError(`Acesso bloqueado. Tente novamente em ${blockTime} segundos.`);
      }
      return;
    }

    setError('');
    setIsLoading(true);

    // Simular um pequeno delay para melhor UX e dificultar ataques
    setTimeout(() => {
      const success = onLogin(password);
      if (!success) {
        const newAttemptCount = attemptCount + 1;
        const newTotalFailed = totalFailedAttempts + 1;
        
        setAttemptCount(newAttemptCount);
        setTotalFailedAttempts(newTotalFailed);
        
        // Salvar no localStorage
        localStorage.setItem('login-failed-attempts', newTotalFailed.toString());
        
        // Mensagens progressivas baseadas no total de tentativas
        if (newTotalFailed >= 10) {
          setError('ACESSO PERMANENTEMENTE BLOQUEADO! Contate o administrador.');
        } else if (newTotalFailed >= 7) {
          setError(`Senha incorreta. ${3 - newAttemptCount} tentativas restantes. ATENÇÃO: Próximo bloqueio será de 5 minutos.`);
        } else if (newTotalFailed >= 5) {
          setError(`Senha incorreta. ${3 - newAttemptCount} tentativas restantes. AVISO: Próximo bloqueio será de 2 minutos.`);
        } else {
          setError(`Senha incorreta. ${3 - newAttemptCount} tentativas restantes.`);
        }
        
        setPassword('');
      } else {
        // Login bem-sucedido - resetar contadores
        setAttemptCount(0);
        setTotalFailedAttempts(0);
        localStorage.removeItem('login-failed-attempts');
      }
      setIsLoading(false);
    }, Math.random() * 1000 + 500); // Delay aleatório entre 500-1500ms
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Acesso Administrativo
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite a senha para acessar o painel de administração
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={`text-sm text-center p-3 rounded-lg border flex items-center justify-center ${
              isPermanentlyBlocked 
                ? 'text-red-900 bg-red-100 border-red-300 font-bold' 
                : isBlocked 
                  ? 'text-red-800 bg-red-50 border-red-200' 
                  : 'text-red-600 bg-red-50 border-red-200'
            }`}>
              {(isBlocked || isPermanentlyBlocked) && <ExclamationTriangleIcon className="h-5 w-5 mr-2" />}
              {error}
            </div>
          )}

          {isPermanentlyBlocked && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <p className="text-red-900 font-bold text-lg mb-2">🚨 ACESSO BLOQUEADO PERMANENTEMENTE 🚨</p>
              <p className="text-red-800 text-sm mb-2">
                Este IP foi bloqueado devido a múltiplas tentativas de login inválidas.
              </p>
              <p className="text-red-700 text-xs">
                Para recuperar o acesso, contate o administrador do sistema ou limpe os dados do navegador.
              </p>
              <div className="mt-3 text-xs text-red-600 bg-red-50 rounded p-2">
                <strong>Código de Segurança:</strong> SEC_BLOCK_001_{totalFailedAttempts}
              </div>
            </div>
          )}

          {isBlocked && !isPermanentlyBlocked && (
            <div className={`border rounded-lg p-4 text-center ${
              totalFailedAttempts >= 7 
                ? 'bg-red-50 border-red-200' 
                : totalFailedAttempts >= 5 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-yellow-50 border-yellow-200'
            }`}>
              <ExclamationTriangleIcon className={`h-6 w-6 mx-auto mb-2 ${
                totalFailedAttempts >= 7 
                  ? 'text-red-600' 
                  : totalFailedAttempts >= 5 
                    ? 'text-orange-600' 
                    : 'text-yellow-600'
              }`} />
              <p className={`font-medium ${
                totalFailedAttempts >= 7 
                  ? 'text-red-800' 
                  : totalFailedAttempts >= 5 
                    ? 'text-orange-800' 
                    : 'text-yellow-800'
              }`}>
                {totalFailedAttempts >= 7 
                  ? '⚠️ BLOQUEIO SEVERO ATIVO' 
                  : totalFailedAttempts >= 5 
                    ? '🔶 AVISO DE SEGURANÇA' 
                    : 'Acesso temporariamente bloqueado'
                }
              </p>
              <p className={`text-sm mt-1 ${
                totalFailedAttempts >= 7 
                  ? 'text-red-700' 
                  : totalFailedAttempts >= 5 
                    ? 'text-orange-700' 
                    : 'text-yellow-700'
              }`}>
                Aguarde {Math.floor(blockTime / 60)}:{(blockTime % 60).toString().padStart(2, '0')} para tentar novamente
              </p>
              <p className="text-xs mt-2 opacity-75">
                Total de tentativas falhadas: {totalFailedAttempts}
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !password || isBlocked || isPermanentlyBlocked}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
                isPermanentlyBlocked 
                  ? 'bg-red-600 cursor-not-allowed' 
                  : isBlocked 
                    ? totalFailedAttempts >= 7 
                      ? 'bg-red-500 cursor-not-allowed' 
                      : 'bg-orange-500 cursor-not-allowed'
                    : isLoading || !password 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isPermanentlyBlocked ? (
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  🚨 BLOQUEADO PERMANENTEMENTE
                </div>
              ) : isBlocked ? (
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  {totalFailedAttempts >= 7 ? '🔴' : totalFailedAttempts >= 5 ? '🟠' : '🟡'} 
                  Bloqueado ({Math.floor(blockTime / 60)}:{(blockTime % 60).toString().padStart(2, '0')})
                </div>
              ) : isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </div>
              ) : (
                'Acessar Painel'
              )}
            </button>
          </div>
        </form>

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Apenas administradores autorizados podem acessar este painel
          </p>
          
          <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
            <p className="font-medium mb-1">🛡️ Sistema de Segurança Progressiva:</p>
            <div className="text-left space-y-1">
              <p>• 3 tentativas erradas = Bloqueio de 30s</p>
              <p>• 5+ tentativas = Bloqueio de 2 minutos</p>
              <p>• 7+ tentativas = Bloqueio de 5 minutos</p>
              <p>• 10+ tentativas = <span className="text-red-600 font-medium">Bloqueio permanente</span></p>
            </div>
            {totalFailedAttempts > 0 && (
              <p className="mt-2 text-orange-600 font-medium">
                Tentativas falhadas registradas: {totalFailedAttempts}/10
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
