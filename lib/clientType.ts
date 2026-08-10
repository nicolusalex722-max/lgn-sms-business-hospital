// Resolves which product(s) the current tenant/client has purchased.
//
// Replace the body of this function with your real lookup — e.g. reading
// the authenticated user's session (NextAuth) and querying Prisma for the
// tenant's subscribed product(s):
//
//   import { getServerSession } from "next-auth";
//   import { authOptions } from "@/lib/auth";
//   import { prisma } from "@/lib/prisma";
//
//   export async function getClientType(): Promise<ClientType> {
//     const session = await getServerSession(authOptions);
//     const tenant = await prisma.tenant.findUnique({
//       where: { id: session.user.tenantId },
//       select: { productType: true },
//     });
//     return tenant.productType; // "sales" | "school"
//   }

export type ClientType = "sales" | "school";

export async function getClientType(): Promise<ClientType> {
  // TEMPORARY mock — swap for the real lookup described above.
  return "school";
}