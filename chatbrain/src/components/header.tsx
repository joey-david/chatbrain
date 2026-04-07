import { Link, useLocation } from "react-router-dom"
import ChatbrainLogo from "@/components/ui/ChatbrainLogo"

const links = [
  { to: "/", label: "Overview" },
  { to: "/use", label: "Analyze" },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <ChatbrainLogo className="h-6" />
          </span>
          <span className="text-lg font-medium tracking-[0.18em] uppercase text-zinc-100">
            ChatBrain
          </span>
        </Link>

        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {links.map((link) => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-white/6 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
