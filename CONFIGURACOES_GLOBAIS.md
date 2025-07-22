# Sistema de Configurações Globais da Página

## Visão Geral

O sistema agora possui configurações globais que permitem ao administrador personalizar completamente a aparência e identidade visual da plataforma de quizzes.

## Funcionalidades Implementadas

### 🎨 **Personalização Visual**
- **Cores Primárias e Secundárias**: Defina as cores principais da interface
- **Cor de Fundo**: Personalize a cor de fundo de toda a aplicação
- **Cor do Texto**: Ajuste a cor do texto global
- **CSS Personalizado**: Adicione regras CSS customizadas

### 🖼️ **Gerenciamento de Logos**
- **Logo do Cabeçalho**: Upload de imagem com redimensionamento automático (máx: 200x80px)
- **Logo do Rodapé**: Upload de imagem com redimensionamento automático (máx: 150x60px)
- **Favicon**: Ícone da aba do navegador (32x32px)
- **Ajuste Automático**: Todas as imagens são redimensionadas mantendo a proporção

### ⚙️ **Configurações Gerais**
- **Nome do Site**: Título principal da plataforma
- **Texto do Cabeçalho**: Texto exibido no cabeçalho
- **Texto do Rodapé**: Texto exibido no rodapé

## Como Acessar

### 🔐 **Acesso Discreto ao Admin**
- O botão de admin agora é apenas um pequeno ícone de escudo no cabeçalho
- Aparece com 30% de opacidade, ficando 100% visível ao passar o mouse
- Não há texto "Admin" visível para usuários finais
- URL direta: `#/admin`

### 📋 **Painel de Configurações**
1. Faça login como admin (senha: `Surf@2025`)
2. No gerenciador de quizzes, clique no botão "Configurações"
3. O painel possui 3 abas:
   - **Geral**: Textos e CSS personalizado
   - **Aparência**: Cores da interface
   - **Logos & Imagens**: Upload de logos e favicon

## Processamento de Imagens

### 🖼️ **Sistema de Upload Inteligente**
- **Redimensionamento Automático**: Imagens são ajustadas para não ficarem cortadas
- **Manutenção de Proporção**: As dimensões são calculadas mantendo a proporção original
- **Formato Base64**: Imagens são armazenadas como data URLs no localStorage
- **Compressão PNG**: Qualidade otimizada para reduzir tamanho

### 📐 **Limites de Tamanho**
```
Logo do Cabeçalho: 200x80 pixels (máximo)
Logo do Rodapé:    150x60 pixels (máximo)
Favicon:           32x32 pixels (exato)
```

## Hierarquia de Configurações

### 🔄 **Sistema de Fallback**
1. **Configurações Globais** (prioridade máxima)
2. **Configurações do Quiz** (fallback)
3. **Valores Padrão** (fallback final)

### 🎯 **Aplicação das Configurações**
- **Cabeçalho**: Usa logo global > logo do quiz > ícone padrão
- **Rodapé**: Usa configurações globais > configurações do quiz
- **Cores**: Configurações globais aplicadas em toda a interface

## Persistência de Dados

### 💾 **Armazenamento Local**
- Configurações salvas no localStorage
- Chave: `my-dynamic-quiz-app-global-settings`
- Backup automático das configurações
- Imagens em formato base64 otimizado

## CSS Personalizado

### 🎨 **Recursos Avançados**
```css
/* Exemplo de CSS personalizado */
.custom-class {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 15px;
}

/* Personalizar cards de quiz */
.quiz-card {
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* Animações personalizadas */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Interface Administrativa

### 🛡️ **Segurança**
- Acesso discreto sem chamar atenção
- Sistema de sessão com 2h de duração
- Logout automático após 30min de inatividade
- Bloqueio progressivo por tentativas incorretas

### 📊 **Estatísticas de Uso**
- Total de quizzes criados
- Quizzes publicados vs. rascunhos
- Indicador de sessão ativa
- Data/hora atual no painel

## Melhorias Implementadas

### ✨ **User Experience**
- **Upload por Drag & Drop**: Interface intuitiva para upload de imagens
- **Preview em Tempo Real**: Visualização imediata das mudanças
- **Tabs Organizadas**: Configurações organizadas em categorias
- **Feedback Visual**: Indicadores de sucesso e erro

### 🔧 **Funcionalidades Técnicas**
- **Validação de Imagens**: Verificação automática de formato e tamanho
- **Otimização de Performance**: Imagens comprimidas automaticamente
- **Responsividade**: Interface adaptável a diferentes telas
- **Acessibilidade**: Tooltips e descrições para todos os controles

## Próximos Passos Sugeridos

1. **🎨 Temas Pré-definidos**: Criar templates de cores prontos
2. **📱 Mode Mobile**: Otimizações específicas para dispositivos móveis  
3. **🌐 Multi-idiomas**: Sistema de internacionalização
4. **📈 Analytics**: Métricas de uso dos quizzes
5. **💾 Export/Import**: Backup e restauração de configurações

---

## 🚀 Status do Projeto

✅ **COMPLETO E FUNCIONAL**
- Sistema de configurações globais implementado
- Upload de imagens com redimensionamento automático
- Interface administrativa discreta
- Aplicação de configurações em tempo real
- Persistência segura de dados
- Documentação completa

**Acesso:** http://localhost:5175
**Admin:** `#/admin` (senha: `Surf@2025`)
