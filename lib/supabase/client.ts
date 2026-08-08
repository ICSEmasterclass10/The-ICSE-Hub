import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not configured")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

export type UserProgressRow = {
  id: number
  created_at: string
  sync_code: string | null
  completed_ids: string[] | null
}

export async function createProgressSync(
  syncCode: string,
  completedIds: string[],
) {
  return supabase
    .from("user_progress")
    .insert({ sync_code: syncCode, completed_ids: completedIds })
    .select("id, created_at, sync_code, completed_ids")
    .single<UserProgressRow>()
}

export async function loadProgressSync(syncCode: string) {
  return supabase
    .from("user_progress")
    .select("id, created_at, sync_code, completed_ids")
    .eq("sync_code", syncCode)
    .maybeSingle<UserProgressRow>()
}

export async function updateProgressSync(
  syncCode: string,
  completedIds: string[],
) {
  return supabase
    .from("user_progress")
    .update({ completed_ids: completedIds })
    .eq("sync_code", syncCode)
}

export function generateSyncCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
