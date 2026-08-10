import DocumentDetailView from "@/components/Billing-components/Documentdetailview";

// Note: if you're on Next.js 15+, `params` is a Promise for page components.
// In that case, change this to:
//   export default async function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = await params;
//     return <DocumentDetailView type="bill" id={id} />;
//   }
export default function BillDetailPage({ params }: { params: { id: string } }) {
  return <DocumentDetailView type="bill" id={params.id} />;
}