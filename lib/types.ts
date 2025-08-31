export interface TenantProps {
  params: { tenantId?: string };
  searchParams: { [key: string]: string | string[] | undefined };
}