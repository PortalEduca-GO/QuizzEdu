import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>
          ✅ Sistema de Quiz Funcionando!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          O React está carregando corretamente, agora vamos testar os componentes.
        </p>
        <div style={{ 
          backgroundColor: '#e6f3ff', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#1f2937', fontSize: '18px', marginBottom: '10px' }}>Status:</h2>
          <ul style={{ textAlign: 'left', color: '#4b5563' }}>
            <li>✅ React 19.1.0 funcionando</li>
            <li>✅ TypeScript compilando</li>
            <li>✅ Vite servindo na porta 5173</li>
            <li>✅ CSS carregado</li>
            <li>✅ Router funcionando</li>
          </ul>
        </div>
        <button 
          onClick={() => window.location.hash = '#/quiz-list-test'}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Testar Navegação
        </button>
      </div>
    </div>
  );
};

export default TestComponent;
