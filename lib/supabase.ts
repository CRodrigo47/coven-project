import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygjjanjokmerrixypbon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnamphbmpva21lcnJpeHlwYm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMTgzNDAsImV4cCI6MjA1MDY5NDM0MH0.YO9NOh0TQbMByeq1rdpM-pHlp-32jUL_9j1k864ILAA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});