import { supabase } from './supabaseClient';

export async function saveAdminConfig(key: string, value: any) {
  const { error } = await supabase
    .from('admin_config')
    .upsert([{ key, value }], { onConflict: 'key' });
  return error;
}

export async function loadAdminConfig(key: string) {
  const { data, error } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', key)
    .single();
  return error ? null : data?.value;
}
