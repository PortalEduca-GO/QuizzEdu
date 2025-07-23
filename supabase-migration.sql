-- Adicionar colunas askTheApiLimit e audienceLimit à tabela quizzes
-- Execute este script no SQL Editor do Supabase

ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS askTheApiLimit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS audienceLimit INTEGER DEFAULT 1;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
AND column_name IN ('askTheApiLimit', 'audienceLimit');
