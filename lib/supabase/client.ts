import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmzvxuzparxejoiawtoy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttenZ4dXpwYXJ4ZWpvaWF3dG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NjM2NTcsImV4cCI6MjA4NTMzOTY1N30.ke6KVvft38_SV12JK3QsbcWQMBa6YLEkOSpFxCOC7qc';

/**
 * A single anonymous Supabase client for read-only server-side data fetching.
 * Intentionally NOT exported as a singleton mutable object — Next.js Server
 * Components create this per-request in a stateless fashion.
 */
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
