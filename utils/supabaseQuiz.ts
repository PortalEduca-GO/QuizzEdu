import { supabase } from './supabaseClient';
import type { Quiz } from '../types';

export async function saveQuizToSupabase(quiz: Quiz): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .upsert([quiz], { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Supabase save error:', error);
    throw error;
  }
  
  return data as Quiz;
}

export async function loadQuizzesFromSupabase() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*');
  return error ? [] : data;
}

export async function deleteQuizFromSupabase(id: string) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);
  return error;
}
