import { supabase } from './supabaseClient';
import type { Quiz } from '../types';

export async function saveQuizToSupabase(quiz: Quiz): Promise<Quiz> {
  try {
    // Mapear os nomes das colunas para lowercase conforme PostgreSQL criou
    const quizForDatabase = {
      ...quiz,
      asktheapilimit: quiz.askTheApiLimit,
      audiencelimit: quiz.audienceLimit
    };
    
    // Remove as propriedades camelCase para evitar conflito
    delete (quizForDatabase as any).askTheApiLimit;
    delete (quizForDatabase as any).audienceLimit;
    
    const { data, error } = await supabase
      .from('quizzes')
      .upsert([quizForDatabase], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase save error:', error);
      throw error;
    }
    
    // Mapear de volta para camelCase no retorno
    const result = {
      ...data,
      askTheApiLimit: data.asktheapilimit || 1,
      audienceLimit: data.audiencelimit || 1
    };
    
    // Remove as propriedades lowercase do resultado
    delete (result as any).asktheapilimit;
    delete (result as any).audiencelimit;
    
    return result as Quiz;
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
  
  // Mapear os nomes das colunas lowercase para camelCase
  const quizzesWithDefaults = data?.map(quiz => ({
    ...quiz,
    askTheApiLimit: quiz.asktheapilimit ?? 1,
    audienceLimit: quiz.audiencelimit ?? 1
  })) || [];
  
  // Remove as propriedades lowercase para manter consistência
  quizzesWithDefaults.forEach(quiz => {
    delete (quiz as any).asktheapilimit;
    delete (quiz as any).audiencelimit;
  });
  
  return quizzesWithDefaults;
}

export async function deleteQuizFromSupabase(id: string) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);
  return error;
}
