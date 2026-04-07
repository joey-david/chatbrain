function Footer() {
  return (
    <footer className="border-t border-white/10 py-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 text-sm text-zinc-500 md:px-8">
        <a
          href="https://joeydavid.fyi"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-white"
        >
          Joey David, 2024
        </a>
        <a
          href="https://github.com/joey-david/chatbrain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 transition-colors hover:text-white"
        >
          Source
        </a>
      </div>
    </footer>
  )
}

export { Footer }
