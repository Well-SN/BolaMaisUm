import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://ftynjejdzkwokoendsdb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eW5qZWpkemt3b2tvZW5kc2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDQwMTksImV4cCI6MjA2NDI4MDAxOX0.d3S-6U1ecxVawY5xek3GuIOm4x8Ym2jtj_uF9K9_6yE'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);