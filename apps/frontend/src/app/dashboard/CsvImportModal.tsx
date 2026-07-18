"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CsvImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    if (!file || !file.size) {
      alert("Please select a file.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/leads/import", {
        method: "POST",
        body: formData, // the browser automatically sets multipart/form-data headers
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        router.refresh();
      } else {
        alert("Failed to import CSV");
      }
    } catch (err) {
      alert("Error submitting CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setResult(null); }}
        className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full shadow-sm hover:shadow-md border border-zinc-200 transition-all flex items-center gap-2"
      >
        <span className="text-zinc-400">↑</span> Import Leads
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-100 w-full max-w-sm overflow-hidden relative">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-xl mb-4">
                📄
              </div>
              <h3 className="text-2xl font-black text-black mb-1">Import Leads</h3>
              <p className="text-sm font-medium text-zinc-500 mb-6 px-4">
                Upload a CSV or Excel file with columns: <br/> <span className="text-zinc-800 font-bold">company_name, website, contact_name, contact_email</span>.
              </p>

              {result ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-4 text-sm font-medium">
                  Import complete!<br/>
                  <span className="font-bold">{result.created}</span> created, <span className="font-bold">{result.skipped}</span> skipped.
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4 text-left">
                  <div className="w-full">
                    <input 
                      type="file" 
                      name="file" 
                      accept=".csv, .xls, .xlsx" 
                      required 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-zinc-800"
                    />
                  </div>
                  
                  <div className="flex justify-between gap-3 pt-4">
                    <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-zinc-600 font-bold hover:text-black">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#0D1F43] text-white font-bold rounded-full disabled:opacity-50 hover:bg-zinc-800">
                      {loading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </form>
              )}
              
              {result && (
                <button onClick={() => setIsOpen(false)} className="mt-4 w-full px-6 py-2.5 bg-[#0D1F43] text-white font-bold rounded-full hover:bg-zinc-800">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
