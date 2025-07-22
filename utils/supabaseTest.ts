import { saveAdminConfig, loadAdminConfig } from './supabaseConfig';

export async function testSupabaseConnection() {
  // Tenta salvar um valor de teste
  const testKey = 'test_key';
  const testValue = { msg: 'Teste Supabase', timestamp: Date.now() };
  const saveError = await saveAdminConfig(testKey, testValue);
  console.log('Supabase save error:', saveError);

  // Tenta ler o valor salvo
  const loaded = await loadAdminConfig(testKey);
  console.log('Supabase loaded value:', loaded);

  if (!saveError && loaded && loaded.msg === 'Teste Supabase') {
    alert('Supabase está funcionando!');
  } else {
    alert('Supabase NÃO está funcionando. Veja o console para detalhes.');
  }
}
