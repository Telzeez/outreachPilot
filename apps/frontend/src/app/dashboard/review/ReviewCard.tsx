"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewCard({ message }: { message: any }) {
  const [draft, setDraft] = useState(message.draft);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdate = async (status: 'APPROVED' | 'REJECTED') => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:3001/outreach/${message.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draft, status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error("Failed to update message");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-sm rounded-3xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-black">{message.companyName}</h3>
          <p className="text-zinc-500 font-medium text-sm">
            {message.contactName ? `${message.contactName} (${message.contactEmail})` : 'No contact specified'}
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          Pending Review
        </span>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Draft Message</label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full h-48 p-4 border border-zinc-200 rounded-2xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all resize-none font-medium text-zinc-800 text-sm"
          disabled={isUpdating}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => handleUpdate('REJECTED')}
          disabled={isUpdating}
          className="px-6 py-2.5 text-sm font-bold rounded-full text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => handleUpdate('APPROVED')}
          disabled={isUpdating}
          className="px-6 py-2.5 text-sm font-bold rounded-full text-white bg-[#0D1F43] hover:bg-[#0A1835] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}
