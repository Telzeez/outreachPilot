import Link from "next/link";
import ReviewQueueClient from "./ReviewQueueClient";

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const leadId = searchParams?.leadId as string | undefined;

  // Fetch pending messages server-side
  let pendingMessages = [];
  try {
    const res = await fetch("http://localhost:3001/outreach/pending", {
      cache: "no-store",
    });
    if (res.ok) {
      pendingMessages = await res.json();
      if (leadId) {
        pendingMessages = pendingMessages.filter((m: any) => m.leadId === leadId);
      }
    }
  } catch (err) {
    console.error("Failed to fetch pending messages", err);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 hover:text-black hover:border-zinc-300 transition-colors shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-black mb-2">Review Queue</h1>
          <p className="text-zinc-500 font-medium text-lg">
            Review, edit, and approve AI-generated outreach drafts before they are sent.
          </p>
        </div>
      </div>

      <ReviewQueueClient initialMessages={pendingMessages} />
    </div>
  );
}
