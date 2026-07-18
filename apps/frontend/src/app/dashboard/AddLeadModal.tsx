"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddLeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      companyName: formData.get("companyName"),
      website: formData.get("website"),
      contactName: formData.get("contactName"),
      contactEmail: formData.get("contactEmail"),
      notes: formData.get("notes"),
    };

    try {
      const res = await fetch("http://localhost:3001/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Failed to add lead");
      }
    } catch (err) {
      alert("Error submitting lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-[#0D1F43] text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg hover:bg-zinc-800 transition-all"
      >
        + Add Lead
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-100 w-full max-w-md overflow-hidden relative">
            <div className="p-6">
              <h3 className="text-2xl font-black text-black mb-1">Add Manual Lead</h3>
              <p className="text-sm font-medium text-zinc-500 mb-6">Enter details for a single target company.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 ml-1">Company Name *</label>
                  <input required name="companyName" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 ml-1">Website</label>
                  <input name="website" placeholder="https://" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-zinc-700 mb-1 ml-1">Contact Name</label>
                    <input name="contactName" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-zinc-700 mb-1 ml-1">Contact Email</label>
                    <input name="contactEmail" type="email" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 ml-1">Notes</label>
                  <textarea name="notes" rows={2} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none"></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-zinc-600 font-bold hover:text-black">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#0D1F43] text-white font-bold rounded-full disabled:opacity-50 hover:bg-zinc-800">
                    {loading ? "Adding..." : "Save Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
