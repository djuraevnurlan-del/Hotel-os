import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://syihsecugrnygqbzfxck.supabase.co";
const SUPABASE_ANON_KEY = "EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aWhzZWN1Z3JueWdxYnpmeGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjc2NDIsImV4cCI6MjEwNzcwMzY0Mn0.qXtNjo8wFC3VJRkh8wWgSoB1XIkhlCWFkGAQRrKVgnM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);