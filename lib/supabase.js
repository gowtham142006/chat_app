import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bdposmgqlgbpvcyywklj.supabase.co";
const supabaseKey = "sb_publishable_D4p9Oqo1a9AhEqBZoc2xEg_qBid5HEU";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);