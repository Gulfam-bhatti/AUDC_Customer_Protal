export interface FormData {
  // Personal Details
  Name: string;
  server: string;
  access_code: string;

  // Contact Information
  organization_type: string;
  entity_full_name: string;
  entity_short_name: string;
  entity_email: string;
  entity_website_url: string;
  entity_purpose: string;
  entity_mission: string;
  child_entities_term: string;
  employees_term: string;
  members_term: string;
  groups_term: string;
  entity_description: string;
  enabled_features: string[];
}

export type FormStep = "personal" | "contact" | "preferences" | "review";
