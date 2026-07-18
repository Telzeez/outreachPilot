import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-[#FAFAFA] overflow-hidden relative">
      
      {/* Soft Colorful Pastel Blobs Background */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-pink-300/40 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[30%] right-[30%] w-[400px] h-[400px] bg-orange-200/50 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-cyan-200/50 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[20%] right-[40%] w-[400px] h-[400px] bg-indigo-200/40 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center justify-between z-10 relative">
        
        {/* Left Content Area */}
        <div className="flex-1 max-w-2xl text-left mb-16 lg:mb-0">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-4 h-[1px] bg-zinc-400" />
              For Sales Teams
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#0D1F43] leading-[1.2] tracking-tight mb-8 uppercase">
            AUTOMATE <span className="text-[#0066FF]">outreach.</span><br />
            LAND <span className="text-[#0066FF]">clients.</span><br />
            GROW <span className="text-[#0066FF]">your business.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-zinc-600 max-w-lg mb-10 font-medium leading-relaxed">
            The intelligent reverse-outreach platform that works for you.
          </p>

          <Link
            href="/signup"
            className="inline-block text-lg font-bold text-black border-b-2 border-black pb-1 hover:text-zinc-600 hover:border-zinc-600 transition-colors"
          >
            Learn More
          </Link>

          <div className="mt-20 flex items-center gap-4">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <p className="font-semibold text-black text-sm">Best Automation Platform</p>
              <p className="text-zinc-500 text-sm">Go Live Instantly.</p>
              <Link href="/signup" className="text-sm font-bold text-black border-b border-black pb-0.5 inline-block mt-1">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Right Composition Area (Mock UI Cards) */}
        <div className="flex-1 relative w-full h-[600px] lg:h-[700px] flex items-center justify-center">
          
          {/* Main Large Card */}
          <div className="absolute right-[10%] lg:right-0 top-1/2 -translate-y-1/2 w-full max-w-[400px] bg-white/60 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50">
            <div className="flex justify-between items-center mb-8">
               <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold"><div className="w-3 h-3 rounded-full bg-white/20 ml-1" /></div>
               <button className="w-8 h-8 flex items-center justify-center text-black font-bold">...</button>
            </div>
            <h3 className="text-4xl font-bold text-black mb-1">1,421</h3>
            <p className="text-sm font-semibold text-zinc-500 mb-8">Leads Processed</p>
            
            <div className="w-full h-1 bg-zinc-100 rounded-full mb-8 relative overflow-hidden">
               <div className="absolute left-0 top-0 h-full bg-black w-[60%]" />
            </div>

            {/* Sub-card inside main card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-zinc-100 shadow-sm mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">✓</div>
                <div>
                  <p className="font-semibold text-black text-sm">Approval Rate</p>
                  <p className="font-bold text-black text-lg">89.5%</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#0D1F43] text-white text-xs font-bold rounded-full">View</button>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
               <div className="flex gap-4 text-zinc-400">
                  <span className="font-bold">✓</span>
                  <span className="font-bold">💬</span>
                  <span className="font-bold">✉️</span>
               </div>
               <button className="px-6 py-3 bg-[#0D1F43] text-white text-sm font-bold rounded-full shadow-lg">Draft All</button>
            </div>
          </div>

          {/* Floating Small Card Top Left */}
          <div className="absolute top-[20%] right-[55%] lg:right-[45%] bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50 w-48 z-20">
             <div className="flex justify-between items-center mb-4">
               <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-lg">📈</div>
             </div>
             <p className="text-xs font-semibold text-zinc-500">Weekly Target</p>
             <p className="text-lg font-bold text-black mb-4">290 / 500</p>
             <button className="w-full py-2 bg-[#0D1F43] text-white text-xs font-bold rounded-full">Boost</button>
          </div>

          {/* Floating Small Card Left */}
          <div className="absolute top-[45%] right-[65%] lg:right-[55%] bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50 w-40 z-20 flex flex-col items-center text-center">
             <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-xl mb-3">🧑‍💻</div>
             <p className="text-sm font-bold text-black">Sarah Jenkins</p>
             <p className="text-xs font-semibold text-zinc-500 mb-4">Engineer</p>
             <button className="w-full py-2 bg-[#0D1F43] text-white text-xs font-bold rounded-full">Approve</button>
          </div>

          {/* Floating Small Card Bottom Right */}
          <div className="absolute bottom-[20%] right-[-5%] lg:right-[-10%] bg-[#DFF5FF]/80 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50 w-40 z-20 flex flex-col items-center text-center">
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl mb-3 shadow-sm">🌍</div>
             <p className="text-sm font-bold text-black">Remote OK</p>
             <p className="text-xs font-semibold text-zinc-500 mb-4">Source</p>
             <button className="w-full py-2 bg-[#0D1F43] text-white text-xs font-bold rounded-full">Sync Now</button>
          </div>

        </div>

      </main>
    </div>
  );
}
