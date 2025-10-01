// lib/supabaseHelpers.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL and API key must be defined in your environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey,{auth:{
  autoRefreshToken:true,
  persistSession:true,
}});

export async function createTenant(input: {
  id: string;
  name: string;
  domain_url: string;
  access_code: string;
  entity_full_name: string;
  entity_short_name: string;
  entity_description: string;
  entity_email: string;
  entity_website_url: string;
  entity_purpose: string;
  entity_mission: string;
}) {
  const { data, error } = await supabase.rpc("prob_create_tenant", {
    p_id: input.id,
    p_name: input.name,
    p_domain_url: input.domain_url,
    p_access_code: input.access_code,
    p_entity_full_name: input.entity_full_name,
    p_entity_short_name: input.entity_short_name,
    p_entity_description: input.entity_description,
    p_entity_email: input.entity_email,
    p_entity_website_url: input.entity_website_url,
    p_entity_purpose: input.entity_purpose,
    p_entity_mission: input.entity_mission,
  });

  if (error) throw error;
  return data; // returns generated schema name
}
