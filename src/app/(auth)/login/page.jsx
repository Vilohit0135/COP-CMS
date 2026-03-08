"use client"
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-50 flex">

      {/* ── Left panel — gradient banner ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0a0a0a 0%, #111111 30%, #1f1f1f 60%, #e8e8e8 100%)",
        }}
      >
        {/* Layered orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 65%)", transform: "translate(20%, -20%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 65%)", transform: "translate(-25%, 25%)" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 65%)", transform: "translate(-50%, -50%)" }} />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        {/* Diagonal accent line */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(45deg, transparent 40%, #ffffff 50%, transparent 60%)",
            backgroundSize: "300px 300px",
          }} />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <span className="text-slate-900 font-black text-sm">C</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">COP CMS</p>
              <p className="text-white/30 text-xs mt-0.5">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-white/90 text-3xl font-light leading-tight mb-4">
            Your content.<br />
            Your control.
            </p>
            <p className="text-white/35 text-sm leading-relaxed">
            Pages, experts, leads —<br />
              all under your control.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["📝 Blogs", "🎓 Courses", "👤 Experts", "📊 Leads"].map((item) => (
              <span
                key={item}
                className="text-xs text-white/50 border border-white/10 rounded-full px-3 py-1.5 bg-white/5"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-6 h-1.5 rounded-full bg-white/60" />
            <div className="w-2 h-1.5 rounded-full bg-white/20" />
            <div className="w-2 h-1.5 rounded-full bg-white/20" />
          </div>
          <p className="text-white/20 text-xs">© 2026 COP CMS</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 relative">

        {/* Subtle bg pattern */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

        <div className="relative w-full max-w-sm flex flex-col items-center gap-6">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 lg:hidden self-start">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-slate-800 font-bold">COP CMS</span>
          </div>

          {/* Heading above card */}
          <div className="self-start w-full">
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your admin account</p>
          </div>

          {/* Clerk SignIn */}
          <SignIn
            afterSignInUrl="/admin"
            signUpUrl="/login"
            redirectUrl="/admin"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-sm border-2 border-slate-200 rounded-2xl overflow-hidden p-0",
                cardBox: "w-full",
                header: "px-6 pt-6 pb-0",
                headerTitle: "text-slate-800 font-bold text-base",
                headerSubtitle: "text-slate-400 text-xs",
                socialButtonsBlockButton:
                  "border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg transition-colors",
                socialButtonsBlockButtonText: "font-semibold text-sm text-slate-700",
                dividerLine: "bg-slate-200",
                dividerText: "text-slate-400 text-xs font-medium",
                formFieldLabel:
                  "text-xs font-semibold text-slate-600 uppercase tracking-wide",
                formFieldInput:
                  "border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 hover:border-slate-400 transition-colors w-full",
                formButtonPrimary:
                  "bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors w-full",
                footerActionText: "text-slate-400 text-xs",
                footerActionLink:
                  "text-slate-700 font-semibold hover:text-slate-900 text-xs",
                identityPreviewText: "text-slate-700 text-sm",
                identityPreviewEditButton:
                  "text-slate-500 hover:text-slate-700 text-xs",
                alertText: "text-red-700 text-xs font-medium",
                formFieldErrorText: "text-red-600 text-xs",
                footer: "px-6 pb-6",
                main: "px-6 py-4",
              },
              layout: {
                socialButtonsPlacement: "top",
              },
            }}
          />

          <p className="text-xs text-slate-400 text-center">
            Having trouble signing in?{" "}
            <span className="text-slate-600 font-semibold cursor-pointer hover:text-slate-800 transition-colors">
              Contact your admin
            </span>
          </p>

        </div>
      </div>

    </div>
  )
}