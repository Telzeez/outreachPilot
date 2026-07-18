import LeadDetailClient from "./LeadDetailClient";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: leadId } = await params;

  let lead = null;
  try {
    const res = await fetch(`http://localhost:3001/leads/${leadId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      lead = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch lead", err);
  }

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Lead Not Found</h1>
        <p className="text-zinc-500 mt-2">The lead you are looking for does not exist or has been deleted.</p>
      </div>
    );
  }

  return <LeadDetailClient lead={lead} leadId={leadId} />;
}
