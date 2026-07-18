import { signIn, auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      
      {/* Soft Colorful Pastel Blobs Background */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-pink-300/30 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-cyan-200/30 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />

      <div className="w-full max-w-md p-10 space-y-8 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50 z-10 relative">
        <div className="flex flex-col items-center justify-center">
          <img src="/logo.png" alt="OutreachPilot Logo" className="h-16 object-contain mb-4" />
          <h2 className="text-3xl font-black tracking-tight text-black">Welcome Back</h2>
          <p className="mt-3 text-sm font-medium text-zinc-500">Sign in to your account</p>
        </div>

        <form
          className="mt-10 space-y-4"
          action={async (formData) => {
            "use server"
            await signIn("nodemailer", { 
              email: formData.get("email"), 
              redirectTo: "/dashboard" 
            })
          }}
        >
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50 text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="name@company.com"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md bg-[#0D1F43] hover:bg-[#0A1835] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D1F43] transition-all duration-300 active:scale-[0.98]"
          >
            <span className="text-sm font-bold text-white">Sign in with Email</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-zinc-500 font-medium">Or continue with</span>
          </div>
        </div>

        <form
          className="space-y-6"
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}
        >
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-zinc-200 rounded-xl shadow-sm bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-200 transition-all duration-300 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-bold text-black">Sign in with Google</span>
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-zinc-500">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-black hover:text-zinc-700 transition-colors border-b border-black pb-0.5">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
