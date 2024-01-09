import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = "https://ognbczpptvmvdvxuzjwm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbmJjenBwdHZtdmR2eHV6andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE1Mjg2ODgsImV4cCI6MjAxNzEwNDY4OH0.jf4V-7VOQTJTsYNGTeVFyg7pCYwsRd6xvWMB2eCAUP0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})