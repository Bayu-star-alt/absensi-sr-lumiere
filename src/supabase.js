import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rpdxoytcbgtkzenbzkxt.supabase.co'
const supabaseKey = 'sb_publishable_5BiB6w7m_IVYbYj5amHwkQ_ne8eDB9u'

export const supabase = createClient(supabaseUrl, supabaseKey)