import { Link } from "react-router-dom"
import { Brain, Camera, FileCode2, MessagesSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-8 md:py-12">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-10 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:px-10 md:py-14">
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
          Privacy-first objective conversation analysis
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400 md:text-lg">
          Upload screenshots or paste a transcript. ChatBrain extracts speakers,
          measures participation, and generates a deeper read of the relationship
          dynamics in a single pass, keeping none of your data.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/use">
            <Button size="lg" className="gap-2 rounded-full px-6">
              <MessagesSquare className="h-5 w-5" />
              Start analysis
            </Button>
          </Link>
          <a href="https://github.com/joey-david/chatbrain" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="gap-2 rounded-full border-white/15 bg-transparent px-6 text-white hover:bg-white/5">
              <FileCode2 className="h-5 w-5" />
              Source
            </Button>
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-6 text-left">
          <MessagesSquare className="mb-4 h-5 w-5 text-zinc-200" />
          <h2 className="text-lg font-medium text-white">Text-first parsing</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Handles generic transcripts, Discord exports, and WhatsApp-style logs,
            including multiline messages.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-6 text-left">
          <Camera className="mb-4 h-5 w-5 text-zinc-200" />
          <h2 className="text-lg font-medium text-white">Screenshot OCR</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Detects chat bubbles, separates speakers, and ignores most menu or
            utility screens instead of hallucinating conversations.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-6 text-left">
          <Brain className="mb-4 h-5 w-5 text-zinc-200" />
          <h2 className="text-lg font-medium text-white">LLM readout</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Produces bold, structured analysis from the cleaned conversation rather
            than generic canned commentary.
          </p>
        </article>
      </section>
    </div>
  )
}

export { Home }
