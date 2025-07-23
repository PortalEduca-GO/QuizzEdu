import { supabase } from './supabaseClient';
import type { Quiz } from '../types';

export async function saveQuizToSupabase(quiz: Quiz): Promise<Quiz> {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .upsert([quiz], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase save error:', error);
      
      // Se o erro for relacionado às colunas de lifelines, tenta salvar sem elas
      if (error.message.includes('askTheApiLimit') || error.message.includes('audienceLimit')) {
        console.warn('Colunas de lifelines não existem no banco. Salvando sem elas...');
        const { askTheApiLimit, audienceLimit, ...quizWithoutLifelines } = quiz;
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('quizzes')
          .upsert([quizWithoutLifelines], { onConflict: 'id' })
          .select()
          .single();
          
        if (fallbackError) {
          throw fallbackError;
        }
        
        // Adiciona as propriedades de lifelines de volta aos dados retornados
        return { ...fallbackData, askTheApiLimit: 1, audienceLimit: 1 } as Quiz;
      }
      
      throw error;
    }
    
    return data as Quiz;
  } catch (err) {
    console.error('Erro ao salvar quiz:', err);
    throw err;
  }
}

export async function loadQuizzesFromSupabase() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*');
    
  if (error) {
    console.error('Erro ao carregar quizzes:', error);
    return [];
  }
  
  // Adiciona valores padrão para propriedades que podem não existir no banco
  const quizzesWithDefaults = data?.map(quiz => ({
    ...quiz,
    askTheApiLimit: quiz.askTheApiLimit ?? 1,
    audienceLimit: quiz.audienceLimit ?? 1
  })) || [];
  
  return quizzesWithDefaults;
}

export async function deleteQuizFromSupabase(id: string) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);
  return error;
}
