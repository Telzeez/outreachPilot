"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AutoScraperModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    setResultMsg("");
    setDomains([]);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg("");
    setDomains([]);

    const formData = new FormData(e.currentTarget);
    const query = formData.get("query");

    try {
      const res = await fetch("http://localhost:3001/broken-sites/search-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (res.ok) {
        setResultMsg(data.message || "Successfully queued.");
        if (data.domains) {
          setDomains(data.domains);
        }
      } else {
        alert(data.message || "Failed to start scraping");
      }
    } catch (err) {
      alert("Error starting scraper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all"
      >
        Auto-Search Sites
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-100 w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-6 flex-shrink-0">
              <h3 className="text-2xl font-black text-black mb-1">Search & Seed</h3>
              <p className="text-sm font-medium text-zinc-500 mb-6">Enter a search query to find domains and check for broken sites.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 ml-1">Search Query *</label>
                  <input required name="query" placeholder="e.g. plumbers in Texas" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none" />
                </div>

                {resultMsg && (
                  <div className="p-3 bg-green-50 text-green-700 text-sm font-bold rounded-xl">
                    {resultMsg}
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={handleClose} className="px-5 py-2.5 text-zinc-600 font-bold hover:text-black">Close</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full disabled:opacity-50 hover:bg-indigo-700">
                    {loading ? "Searching..." : "Search & Seed"}
                  </button>
                </div>
              </form>
            </div>
            
            {domains.length > 0 && (
              <div className="px-6 pb-6 overflow-y-auto">
                <h4 className="text-sm font-bold text-zinc-800 mb-2">Queued Domains</h4>
                <ul className="space-y-2">
                  {domains.map((d, i) => (
                    <li key={i} className="px-3 py-2 bg-zinc-50 rounded-lg text-sm text-zinc-600 font-medium border border-zinc-100">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
