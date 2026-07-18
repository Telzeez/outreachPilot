"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditLeadModal({ lead }: { lead: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      companyName: formData.get("companyName") as string,
      website: formData.get("website") as string,
      contactName: formData.get("contactName") as string,
      contactEmail: formData.get("contactEmail") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const res = await fetch(`http://localhost:3001/leads/${lead.leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Failed to update lead");
      }
    } catch (err) {
      alert("Error updating lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-500 hover:text-[#0055CC] p-2 rounded-full hover:bg-blue-50 transition-colors"
        title="Edit Lead"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"
              >
                ✕
              </button>
              
              <div className="mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-[#0066FF]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-black mb-1">Edit Lead</h3>
                <p className="text-sm font-medium text-zinc-500">Update company and contact details.</p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Company Name</label>
                  <input 
                    name="companyName" 
                    defaultValue={lead.companyName || ""} 
                    required 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Website</label>
                  <input 
                    name="website" 
                    defaultValue={lead.website || ""} 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Contact Name</label>
                    <input 
                      name="contactName" 
                      defaultValue={lead.contactName || ""} 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Contact Email</label>
                    <input 
                      name="contactEmail" 
                      defaultValue={lead.contactEmail || ""} 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Notes</label>
                  <textarea 
                    name="notes" 
                    defaultValue={lead.notes || ""} 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-[#0D1F43] hover:bg-[#0A1835] text-white font-bold rounded-xl shadow-lg shadow-zinc-200 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
