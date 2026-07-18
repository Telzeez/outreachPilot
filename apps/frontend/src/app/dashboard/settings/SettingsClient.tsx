"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [provider, setProvider] = useState(initialSettings.llmProvider || "mock");
  const [model, setModel] = useState(initialSettings.llmModel || "");
  const [apiKey, setApiKey] = useState("");
  const [smtpHost, setSmtpHost] = useState(initialSettings.smtpHost || "");
  const [smtpPort, setSmtpPort] = useState(initialSettings.smtpPort ? String(initialSettings.smtpPort) : "");
  const [smtpUser, setSmtpUser] = useState(initialSettings.smtpUser || "");
  const [smtpPass, setSmtpPass] = useState("");
  const [weeklyTarget, setWeeklyTarget] = useState(initialSettings.weeklyTarget || 100);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isAiConfigured = initialSettings.hasApiKey || (initialSettings.llmProvider && initialSettings.llmProvider !== "mock");
  const isSmtpConfigured = !!(initialSettings.smtpHost && initialSettings.hasSmtpPass);

  const [aiExpanded, setAiExpanded] = useState(!isAiConfigured);
  const [smtpExpanded, setSmtpExpanded] = useState(!isSmtpConfigured);

  const needsApiKey = provider === "openai" || provider === "nvidia";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    const data: any = {
      llmProvider: provider,
      llmModel: model,
      smtpHost,
      smtpUser,
      weeklyTarget: parseInt(String(weeklyTarget), 10) || 100,
    };

    if (smtpPort) data.smtpPort = parseInt(smtpPort, 10);

    // Only send the API key if it was updated by the user (it's not empty)
    // Or if they switched to a provider that doesn't need one, we can clear it.
    if (apiKey) {
      data.llmApiKey = apiKey;
    } else if (!needsApiKey) {
      data.llmApiKey = ""; // Clear it from DB
    }

    if (smtpPass) {
      data.smtpPass = smtpPass;
    }

    try {
      const res = await fetch("http://localhost:3001/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccessMsg("Settings saved successfully!");
        setApiKey(""); // Clear local state after saving
        setSmtpPass("");
        router.refresh();
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-12">
      <div className="space-y-6">
        <div 
          className="flex justify-between items-center cursor-pointer border-b border-zinc-100 pb-2"
          onClick={() => setAiExpanded(!aiExpanded)}
        >
          <h2 className="text-xl font-bold text-black tracking-tight mb-0">AI Configuration</h2>
          <div className="flex items-center gap-3">
            {!aiExpanded && isAiConfigured && (
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Configured
              </span>
            )}
            <svg className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${aiExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        
        {aiExpanded && (
          <div className="space-y-6 animate-in slide-in-from-top-2 fade-in duration-200">
            <div>
              <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2">LLM Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
          >
            <option value="mock">Mock Provider (Local Dev)</option>
            <option value="openai">OpenAI</option>
            <option value="nvidia">NVIDIA NIM</option>
            <option value="ollama">Ollama (Local Open Source)</option>
          </select>
          <p className="mt-2 text-xs text-zinc-500 font-medium">
            {provider === "mock" && "Uses a hardcoded template for quick local testing without API keys."}
            {provider === "openai" && "Uses OpenAI's models (e.g. gpt-4o-mini)."}
            {provider === "nvidia" && "Uses NVIDIA's NIM API for blazing fast Llama 3."}
            {provider === "ollama" && "Uses a local Ollama instance running on port 11434."}
          </p>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${needsApiKey || provider === 'ollama' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2">Model Name</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={provider === "openai" ? "gpt-4o-mini" : provider === "nvidia" ? "meta/llama3-70b-instruct" : "llama3"}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${needsApiKey ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2 flex justify-between">
            <span>API Key</span>
            {initialSettings.hasApiKey && !apiKey && (
              <span className="text-green-500 text-xs flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Key is currently set
              </span>
            )}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={initialSettings.hasApiKey ? "•••••••••••••••••••••••• (Leave blank to keep existing)" : "Enter API Key"}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <p className="mt-2 text-xs text-zinc-500 font-medium">Your key is securely encrypted using AES-256-GCM before being stored in the database.</p>
        </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div 
          className="flex justify-between items-center cursor-pointer border-b border-zinc-100 pb-2"
          onClick={() => setSmtpExpanded(!smtpExpanded)}
        >
          <div>
            <h2 className="text-xl font-bold text-black tracking-tight mb-0">SMTP Email Configuration</h2>
            {smtpExpanded && <p className="text-sm text-zinc-500 mt-1">Configure your email provider to send outreach emails automatically when a draft is approved.</p>}
          </div>
          <div className="flex items-center gap-3">
            {!smtpExpanded && isSmtpConfigured && (
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Configured
              </span>
            )}
            <svg className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${smtpExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {smtpExpanded && (
          <div className="space-y-6 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2">SMTP Host</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-2 text-xs text-zinc-500 font-medium">e.g., smtp.gmail.com for Gmail, or smtp.office365.com for Outlook.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2">SMTP Port</label>
            <input
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="587"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-2 text-xs text-zinc-500 font-medium">Usually 587 (TLS) or 465 (SSL).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2">SMTP User (Email)</label>
            <input
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-2 text-xs text-zinc-500 font-medium">The email address you use to log in to your provider.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2 flex justify-between">
              <span>SMTP Password</span>
              {initialSettings.hasSmtpPass && !smtpPass && (
                <span className="text-green-500 text-xs flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Set
                </span>
              )}
            </label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder={initialSettings.hasSmtpPass ? "•••••••••••• (Leave blank to keep)" : "App Password"}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <div className="mt-2 text-xs text-zinc-500 font-medium space-y-1">
              <p>For Gmail and Outlook, you <strong className="text-zinc-700">must</strong> generate an "App Password" to use here. Your regular login password will not work.</p>
              <div className="flex gap-3 pt-1">
                <a href="https://knowledge.workspace.google.com/admin/gmail/send-email-from-a-printer-scanner-or-app" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:text-[#0055CC] hover:underline inline-flex items-center gap-1">
                  Read Gmail Guide <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
                <a href="https://www.gmass.co/blog/outlook-smtp/" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:text-[#0055CC] hover:underline inline-flex items-center gap-1">
                  Read Outlook Guide <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-black mb-4 tracking-tight border-b border-zinc-100 pb-2">Outreach Configuration</h2>
        </div>
        <div>
          <label className="block text-sm font-bold text-zinc-600 uppercase tracking-wider mb-2">Weekly Outreach Volume Target</label>
          <input
            type="number"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <p className="mt-2 text-xs text-zinc-500 font-medium">This target is used to display your progress on the dashboard.</p>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-100 flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-[#0D1F43] hover:bg-[#0A1835] text-white font-bold rounded-xl shadow-lg shadow-zinc-200 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? "Saving..." : "Save Configuration"}
        </button>
        {successMsg && (
          <span className="text-green-600 font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">
            {successMsg}
          </span>
        )}
      </div>
    </form>
  );
}
