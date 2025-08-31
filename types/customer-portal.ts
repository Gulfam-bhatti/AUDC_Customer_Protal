export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: 'active' | 'suspended' | 'pending';
  users: number;
  storage: string;
  createdAt: string;
}

export interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl: string;
}

export interface Subscription {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired';
  nextBilling: string;
  amount: number;
  features: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}


export interface TenantFormData {
  id: string;
  Name: string;
  abn: string;
  domain_url: string;
  server: string;
  access_code: string;
  organization_type?: string;
  enabled_features?: string[];
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
}

export interface TenantFormPageProps {
  tenantId: string;
}