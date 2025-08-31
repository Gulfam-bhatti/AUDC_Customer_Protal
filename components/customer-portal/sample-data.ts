import { BillingHistory, PaymentMethod, Subscription, Tenant } from "@/types/customer-portal";

export const tenantData: Tenant = {
  id: 'tenant-001',
  name: 'Acme Corporation',
  domain: 'acme-corp.example.com',
  plan: 'Enterprise',
  status: 'active',
  users: 247,
  storage: '2.4 TB',
  createdAt: '2023-01-15'
};

export const billingHistory: BillingHistory[] = [
  {
    id: 'inv-001',
    date: '2024-08-01',
    description: 'Enterprise Plan - Monthly',
    amount: 299.00,
    status: 'paid',
    invoiceUrl: '#'
  },
  {
    id: 'inv-002',
    date: '2024-07-01',
    description: 'Enterprise Plan - Monthly',
    amount: 299.00,
    status: 'paid',
    invoiceUrl: '#'
  },
  {
    id: 'inv-003',
    date: '2024-06-01',
    description: 'Enterprise Plan - Monthly',
    amount: 299.00,
    status: 'paid',
    invoiceUrl: '#'
  },
  {
    id: 'inv-004',
    date: '2024-05-01',
    description: 'Storage Add-on',
    amount: 99.00,
    status: 'paid',
    invoiceUrl: '#'
  }
];

export const subscriptions: Subscription[] = [
  {
    id: 'sub-001',
    name: 'Enterprise Plan',
    plan: 'Monthly',
    status: 'active',
    nextBilling: '2024-09-01',
    amount: 299.00,
    features: ['Unlimited Users', '10TB Storage', '24/7 Support', 'Advanced Analytics']
  },
  {
    id: 'sub-002',
    name: 'Storage Add-on',
    plan: 'Monthly',
    status: 'active',
    nextBilling: '2024-09-01',
    amount: 99.00,
    features: ['Additional 5TB Storage', 'Enhanced Backup']
  }
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: 'pm-002',
    type: 'card',
    last4: '5555',
    brand: 'Mastercard',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false
  }
];
