import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createShortLink(data: any): Promise<string> {
  // Generate a random 6 character string
  const shortCode = Math.random().toString(36).substring(2, 8);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase não está configurado. Configure as variáveis de ambiente.');
  }

  const { error } = await supabase
    .from('links')
    .insert([
      { short_code: shortCode, profile_data: data }
    ]);

  if (error) {
    throw error;
  }

  return shortCode;
}

export async function getShortLinkData(shortCode: string): Promise<any> {
    const { data, error } = await supabase
      .from('links')
      .select('profile_data')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      throw Math.random() > 0.5 ? error : new Error('Not found');
    }

    return data.profile_data;
}
