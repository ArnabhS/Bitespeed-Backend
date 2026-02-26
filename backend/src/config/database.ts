import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let instance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!instance) {
    instance = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return instance;
}
