"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav({ 
  isLoggedIn, 
  logoutAction 
}: { 
  isLoggedIn: boolean, 
  logoutAction?: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-zinc-600 hover:text-black transition-colors"
        aria-label="Toggle Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-lg py-6 px-6 flex flex-col space-y-6 z-50">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-base font-bold text-zinc-800">Dashboard</Link>
              <Link href="/dashboard/review" onClick={() => setIsOpen(false)} className="text-base font-bold text-zinc-800">Review Queue</Link>
              <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className="text-base font-bold text-zinc-800">Settings</Link>
              {logoutAction && (
                <form action={logoutAction}>
                  <button type="submit" className="text-base font-bold text-zinc-500 hover:text-black">Log out</button>
                </form>
              )}
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-base font-bold text-zinc-800">Log in</Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="text-base font-bold text-[#0D1F43]">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
