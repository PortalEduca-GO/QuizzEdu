import React from 'react';

const AppTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sistema de Quiz - Teste de Funcionamento</h1>
      <p>Se você está vendo esta mensagem, o React está carregando corretamente!</p>
      <div style={{ 
        backgroundColor: '#e6f3ff', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Status do Sistema:</h2>
        <ul>
          <li>✅ React funcionando</li>
          <li>✅ TypeScript compilando</li>
          <li>✅ Vite servindo</li>
        </ul>
      </div>
    </div>
  );
};

export default AppTest;
