import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqedujzbkpndhrbyrdzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZWR1anpia3BuZGhyYnlyZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTM4OTEsImV4cCI6MjA2ODc4OTg5MX0.6E4jOlvqhb5rmIv3z_q46BBaOxN4bn40qcgTz3PRIvM';

export const supabase = createClient(supabaseUrl, supabaseKey);
