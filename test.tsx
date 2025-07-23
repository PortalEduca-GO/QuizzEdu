import { createRoot } from 'react-dom/client';
// ...existing code...

const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sistema de Quiz - Teste</h1>
      <p>Se você está vendo esta mensagem, o React está funcionando!</p>
      <button 
        onClick={() => alert('JavaScript funcionando!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Clique aqui para testar
      </button>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(<SimpleTest />);
