import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://syihsecugrnygqbzfxck.supabase.co'
const supabaseAnonKey = 'sb_publishable_Lr8L0ltfXwDhNE6EizDVeA_BqRKidPK'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)