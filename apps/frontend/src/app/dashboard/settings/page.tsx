import Link from "next/link";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  // Fetch initial settings from backend server-side
  const res = await fetch("http://localhost:3001/settings", {
    cache: "no-store",
  });
  
  const settings = res.ok ? await res.json() : { llmProvider: 'mock', llmModel: '', hasApiKey: false };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 hover:text-black hover:border-zinc-300 transition-colors shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-black mb-2">Settings</h1>
          <p className="text-zinc-500 font-medium text-lg">Configure your LLM provider and other workspace preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 p-8">
        <h2 className="text-2xl font-bold text-black mb-6">AI Drafting Configuration</h2>
        <SettingsClient initialSettings={settings} />
      </div>
    </div>
  );
}
