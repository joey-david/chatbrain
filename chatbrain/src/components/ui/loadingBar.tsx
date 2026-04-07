import { AlertCircle, Brain, Check, Loader2 } from "lucide-react"

interface LoadingBarProps {
  phase: 'preparing' | 'uploading' | 'extracting' | 'llm'
  status: string
  error?: string
  fileCount?: number
}

export function LoadingBar({ phase, status, error, fileCount = 1 }: LoadingBarProps) {
  const steps = [
    { key: 'preparing', label: 'Prepare input' },
    { key: 'uploading', label: `Read ${fileCount} file${fileCount === 1 ? '' : 's'}` },
    { key: 'extracting', label: 'Extract conversation' },
    { key: 'llm', label: 'Generate analysis' },
  ] as const

  const activeIndex = error
    ? steps.findIndex(step => step.key === phase)
    : Math.max(0, steps.findIndex(step => step.key === phase))
  const progress = error ? ((activeIndex + 1) / steps.length) * 100 : ((activeIndex + 1) / steps.length) * 100
  const headline = error || status || "Processing conversation"

  return (
    <div className={`mx-auto mt-8 w-full max-w-3xl rounded-[1.5rem] border px-5 py-5 ${error ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-center gap-3">
        {error ? (
          <AlertCircle className="h-5 w-5 text-red-400" />
        ) : phase === 'llm' ? (
          <Brain className="h-5 w-5 text-white" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        )}
        <div className="text-left">
          <p className={`text-sm font-medium ${error ? 'text-red-300' : 'text-white'}`}>{headline}</p>
          <p className="text-xs text-zinc-500">
            {error ? 'The pipeline stopped before completion.' : 'Progress is tied to real pipeline stages.'}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full transition-all duration-300 ${error ? 'bg-red-400' : 'bg-white'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const isComplete = !error && index < activeIndex
          const isActive = index === activeIndex
          return (
            <div
              key={step.key}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${
                isActive
                  ? error
                    ? 'border-red-500/40 bg-red-500/5 text-red-200'
                    : 'border-white/20 bg-white/8 text-white'
                  : isComplete
                    ? 'border-white/10 bg-white/[0.05] text-zinc-200'
                    : 'border-white/10 bg-transparent text-zinc-500'
              }`}
            >
              {isComplete ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : isActive && !error ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : error && isActive ? (
                <AlertCircle className="h-4 w-4 shrink-0" />
              ) : (
                <div className="h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
              )}
              <span>{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
