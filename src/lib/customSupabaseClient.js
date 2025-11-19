import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkdypjlfgqszjsyiwugh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZHlwamxmZ3FzempzeWl3dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTY1OTgsImV4cCI6MjA3NjU3MjU5OH0.iANFOiZrbQdLKJOH6Y_iCfZZKZn9Ib-7bZJGuqyueR4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);