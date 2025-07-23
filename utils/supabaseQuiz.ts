import { supabase } from './supabaseClient';
import type { Quiz } from '../types';

export async function saveQuizToSupabase(quiz: Quiz) {
  const { error } = await supabase
    .from('quizzes')
    .upsert([quiz], { onConflict: 'id' });
  return error;
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
