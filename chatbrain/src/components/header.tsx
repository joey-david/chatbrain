import { useState } from "react"
import { Menu, User } from "lucide-react"
import ChatbrainLogo from "@/components/ui/ChatbrainLogo"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <header className="flex items-center justify-between px-12 py-5 sticky top-0 z-20">
      <a href="/" className="flex items-center justify-center gap-2 text-2xl font-light
      text-white">
        <ChatbrainLogo className="h-8 relative top-[-2px]" /> chatbrain
      </a>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background
            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary
            text-secondary-foreground hover:bg-secondary/80 px-4 text-base"
          onClick={() => {
            // handle user connection / creation page
          }}
        >
          Sign in
        </Button>
        <Button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide-out panel on the right */}
      {isMenuOpen && (
        <aside className="fixed top-0 right-0 w-64 h-full bg-background shadow-lg p-4">
          {isLoggedIn ? (
            <ul className="space-y-2">
              <li className="font-medium">My Analyses</li>
              {/* Add your analysis items */}
            </ul>
          ) : (
            <Button
              onClick={() => {
                // log in or sign up
                // https://21st.dev/aceternity/sidebar
              }}
              className="w-full mt-4"
            >
              Log In
            </Button>
          )}
        </aside>
      )}
    </header>
  )
}