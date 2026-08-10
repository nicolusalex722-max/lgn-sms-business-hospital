// The logged-in tenant's own company profile.
// Replace getTenantCompanyProfile() with a real lookup once wired to auth + Prisma, e.g.:
//
//   export async function getTenantCompanyProfile(): Promise<TenantCompanyProfile> {
//     const session = await getServerSession(authOptions);
//     return prisma.company.findUnique({ where: { id: session.user.companyId } });
//   }

export interface TenantCompanyProfile {
  name: string;
  displayName: string;
  status: string;
  taxId: string;
  businessStructure: string;
  businessType: string;
  industry: string;
  baseCurrency: string;
  timezone: string;
  companyEmail: string;
  companyPhone: string;
  website: string;
  supportEmail: string;
  supportPhone: string;
  supportUrl: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_TENANT_PROFILE: TenantCompanyProfile = {
  name: "Wari Secondary Company Limited",
  displayName: "Wari Secondary Company Limited",
  status: "Active",
  taxId: "141-996-037",
  businessStructure: "Corporation",
  businessType: "Corporate",
  industry: "Retail & E-commerce",
  baseCurrency: "Tanzanian Shilling",
  timezone: "Africa/Dar_es_Salaam",
  companyEmail: "admin@wari.com",
  companyPhone: "+255755545977",
  website: "https://wari.com",
  supportEmail: "admin@wari.com",
  supportPhone: "+255755545977",
  supportUrl: "https://wari.com",
  addressLine1: "Mawenzi Road",
  addressLine2: "",
  city: "Kilimanjaro",
  state: "Moshi",
  postalCode: "33102",
  country: "Tanzania",
  createdAt: "2026-03-14",
  updatedAt: "2026-07-11",
};

export function getTenantCompanyProfile(): TenantCompanyProfile {
  return MOCK_TENANT_PROFILE;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export { formatDate };