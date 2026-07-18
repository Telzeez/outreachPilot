"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LeadDetailClient({ lead, leadId }: { lead: any, leadId: string }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [editingDraft, setEditingDraft] = useState(lead.message?.draft || "");

  useEffect(() => {
    if (lead.message?.draft && editingDraft === "") {
      setEditingDraft(lead.message.draft);
    }
  }, [lead.message?.draft, editingDraft]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`http://localhost:3001/outreach/lead/${leadId}/generate`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to generate draft");
      }
    } catch (err) {
      alert("Error generating draft");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const payload: any = { status };
      if (editingDraft !== undefined) {
        payload.draft = editingDraft;
      }

      const res = await fetch(`http://localhost:3001/outreach/${lead.message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update message");
      }
    } catch (err) {
      alert("Error updating message");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 hover:text-black hover:border-zinc-300 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-black">{lead.companyName}</h1>
          <p className="text-zinc-500 font-medium">Lead Details & Outreach Draft</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-zinc-100 p-6">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4">Lead Info</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Website</div>
                <div className="text-sm font-medium text-black mt-1">
                  {lead.website ? <a href={lead.website} target="_blank" className="text-[#0066FF] hover:underline">{lead.website}</a> : "N/A"}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contact</div>
                <div className="text-sm font-medium text-black mt-1">
                  {lead.contactName || "No Name"} {lead.contactRole ? `— ${lead.contactRole}` : ""}
                  <br />
                  <span className="text-zinc-500">{lead.contactEmail || "No Email"}</span>
                </div>
              </div>
              
              <div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stage</div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    {lead.stage}
                  </span>
                </div>
              </div>

              {lead.notes && (
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Notes</div>
                  <div className="text-sm font-medium text-zinc-700 mt-1 whitespace-pre-wrap">{lead.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-zinc-100 p-6">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4">Outreach Message</h3>
            
            {!lead.message ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h4 className="text-lg font-bold text-black mb-2">No draft exists</h4>
                <p className="text-sm text-zinc-500 mb-6">There is no outreach message drafted for this lead yet.</p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-6 py-2.5 bg-[#0D1F43] text-white text-sm font-bold rounded-full disabled:opacity-50 hover:bg-zinc-800"
                >
                  {generating ? "Generating..." : "Generate Draft with AI"}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-[10px] uppercase font-black tracking-wider rounded-md ${
                    lead.message.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    lead.message.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    lead.message.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-zinc-100 text-zinc-800'
                  }`}>
                    {lead.message.status.replace('_', ' ')}
                  </span>
                </div>
                <textarea
                  value={editingDraft}
                  onChange={(e) => setEditingDraft(e.target.value)}
                  className="w-full h-64 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4"
                />
                
                {lead.message.status === 'PENDING_REVIEW' && (
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => handleUpdateStatus("REJECTED")}
                      className="px-6 py-2.5 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("APPROVED")}
                      className="px-6 py-2.5 bg-[#0D1F43] hover:bg-[#0A1835] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Approve Draft
                    </button>
                  </div>
                )}
                {lead.message.status === 'APPROVED' && (
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => handleUpdateStatus("PENDING_REVIEW")}
                      className="px-6 py-2.5 text-zinc-600 hover:bg-zinc-50 font-bold rounded-xl transition-colors"
                    >
                      Needs Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("APPROVED")}
                      className="px-6 py-2.5 bg-[#0D1F43] hover:bg-[#0A1835] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
