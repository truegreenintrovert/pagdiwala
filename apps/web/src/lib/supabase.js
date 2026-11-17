import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the project .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

export const handleError = (error) => {
  console.error('Supabase error:', error);
  
  // Handle specific error types
  if (error.code === 'PGRST301') {
    throw new Error('Database row level security policy violation');
  }
  
  if (error.code === 'PGRST204') {
    throw new Error('No data found');
  }
  
  if (error.code === '23505') {
    throw new Error('Duplicate record found');
  }
  
  if (error.code === '23503') {
    throw new Error('Referenced record not found');
  }
  
  // Handle auth errors
  if (error.message?.includes('JWT')) {
    throw new Error('Authentication error. Please sign in again.');
  }
  
  // Handle network errors
  if (error.message?.includes('Failed to fetch')) {
    throw new Error('Network error. Please check your connection.');
  }
  
  // Default error
  throw error;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!session;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Helper function to check if user is admin
export const isAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('is_admin', { checking_user_id: userId });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};
