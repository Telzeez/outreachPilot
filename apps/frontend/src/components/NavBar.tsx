import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import MobileNav from "./MobileNav"

export default async function NavBar() {
  const session = await auth()

  const handleSignOut = async () => {
    "use server"
    await signOut()
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#FAFAFA]/70 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-1.5 group">
                <img src="/logo.png" alt="OutreachPilot Logo" className="h-10 object-contain group-hover:scale-105 transition-transform" />
                <div className="flex flex-col hidden sm:flex">
                  <span className="text-2xl font-bold tracking-tight">
                    <span className="text-[#0D1F43]">outreach</span><span className="text-[#0066FF]">Pilot</span>
                  </span>
                </div>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {/* Desktop Navigation */}
            {session?.user ? (
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-sm font-semibold text-zinc-600 hover:text-black transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/review" className="text-sm font-semibold text-zinc-600 hover:text-black transition-colors">
                  Review Queue
                </Link>
                <Link href="/dashboard/settings" className="text-sm font-semibold text-zinc-600 hover:text-black transition-colors">
                  Settings
                </Link>
                <form action={handleSignOut}>
                  <button type="submit" className="text-sm font-semibold text-zinc-500 hover:text-black transition-colors">
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/login" className="text-sm font-semibold text-zinc-600 hover:text-black transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="inline-flex items-center px-6 py-2.5 text-sm font-bold rounded-full text-white bg-[#0D1F43] hover:bg-[#0A1835] transition-all duration-300 shadow-md hover:shadow-lg">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Navigation */}
            <MobileNav isLoggedIn={!!session?.user} logoutAction={handleSignOut} />
          </div>
        </div>
      </div>
    </nav>
  )
}
