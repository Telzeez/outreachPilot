"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewQueueClient({ initialMessages }: { initialMessages: any[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<string>("");

  const handleExpand = (msg: any) => {
    if (expandedId === msg.id) {
      setExpandedId(null);
    } else {
      setExpandedId(msg.id);
      setEditingDraft(msg.draft);
    }
  };

  const updateMessageStatus = async (id: string, status: string, newDraft?: string) => {
    try {
      const payload: any = { status };
      if (newDraft !== undefined) {
        payload.draft = newDraft;
      }

      const res = await fetch(`http://localhost:3001/outreach/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Remove from local state
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (expandedId === id) setExpandedId(null);
        router.refresh();
      } else {
        alert("Failed to update message");
      }
    } catch (err) {
      alert("Error updating message");
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 p-12 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">You're all caught up!</h3>
        <p className="text-zinc-500">There are no pending drafts waiting for your review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`bg-white rounded-[1.5rem] shadow-sm border transition-all duration-300 overflow-hidden cursor-pointer ${expandedId === msg.id ? 'border-blue-200 ring-4 ring-blue-50' : 'border-zinc-100 hover:border-zinc-300'}`}
          onClick={() => { if (expandedId !== msg.id) handleExpand(msg); }}
        >
          {/* Header (Always Visible) */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                {msg.companyName}
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] uppercase font-black tracking-wider rounded-md">
                  Pending
                </span>
              </h3>
              <p className="text-zinc-500 text-sm mt-1 font-medium">
                To: <span className="text-black">{msg.contactName || "Team"}</span> {msg.contactEmail ? `(${msg.contactEmail})` : ""}
              </p>
            </div>
            <div className="text-zinc-400 transform transition-transform duration-300">
              {expandedId === msg.id ? (
                <button onClick={(e) => { e.stopPropagation(); handleExpand(msg); }} className="p-2 hover:bg-zinc-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                </button>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          <div 
            className={`transition-all duration-500 ease-in-out origin-top ${expandedId === msg.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
          >
            <div className="px-6 pb-6 pt-2 border-t border-zinc-50" onClick={(e) => e.stopPropagation()}>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Message Draft</label>
              <textarea
                value={editingDraft}
                onChange={(e) => setEditingDraft(e.target.value)}
                className="w-full h-48 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none mb-4"
              />
              
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => updateMessageStatus(msg.id, "REJECTED")}
                  className="px-6 py-2.5 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors"
                >
                  Reject & Delete
                </button>
                <button
                  onClick={() => updateMessageStatus(msg.id, "APPROVED", editingDraft)}
                  className="px-6 py-2.5 bg-[#0D1F43] hover:bg-[#0A1835] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Approve Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
