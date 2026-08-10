import DocumentDetailView from "@/components/Billing-components/Documentdetailview";

// Note: if you're on Next.js 15+, `params` is a Promise for page components.
// In that case, change this to:
//   export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = await params;
//     return <DocumentDetailView type="invoice" id={id} />;
//   }
export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return <DocumentDetailView type="invoice" id={params.id} />;
}