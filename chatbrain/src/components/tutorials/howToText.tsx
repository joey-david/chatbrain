function TextTutorial() {
  return (
    <div className="mx-auto max-w-4xl p-4 text-left">
      <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-2xl font-medium text-white">1. Paste from another platform</h2>
        <div className="mt-5 space-y-4 text-zinc-300">
          <p>
            You can manually <b>copy and paste</b> conversations from any platform into ChatBrain.
          </p>
          <ol className="space-y-2 text-sm leading-6 text-zinc-400">
            <li>1. Open the conversation you want to analyze.</li>
            <li>2. Copy the messages from the app or website.</li>
            <li>3. Go to the <a href="/use" className="text-white underline">Analyze</a> page and click <b>Type/paste text</b>.</li>
            <li>4. Paste the conversation, then submit it.</li>
          </ol>
        </div>
      </section>

      <section className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-2xl font-medium text-white">2. Transcribe manually</h2>
        <div className="mt-5 space-y-4 text-zinc-300">
          <p>If copying is impossible, you can still enter the conversation by hand.</p>
          <p className="text-sm leading-6 text-zinc-400">
            Use one message per line and keep the format:
          </p>
          <code className="block rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center text-white">
            Username: message
          </code>
          <p className="text-sm leading-6 text-zinc-400">
            Once the text is structured that way, ChatBrain can split speakers and compute metadata reliably.
          </p>
        </div>
      </section>
    </div>
  )
}

export default TextTutorial
