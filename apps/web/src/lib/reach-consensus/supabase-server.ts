import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseServerConfig = {
  url: string;
  secretKey: string;
};

export type SupabaseDraftFunctionConfig = {
  url: string;
  apiKey: string;
};

let cachedClient: SupabaseClient | undefined;

export function readSupabaseServerConfig(): SupabaseServerConfig | undefined {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !secretKey) {
    return undefined;
  }

  return { url, secretKey };
}

export function getSupabaseServiceClient() {
  const config = readSupabaseServerConfig();

  if (!config) {
    return undefined;
  }

  cachedClient ??= createClient(config.url, config.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

export function readSupabaseDraftFunctionConfig(): SupabaseDraftFunctionConfig | undefined {
  const projectUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!projectUrl || !apiKey) {
    return undefined;
  }

  return {
    url: `${projectUrl.replace(/\/$/, "")}/functions/v1/proposal-drafts`,
    apiKey,
  };
}
