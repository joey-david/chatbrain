import { Loader2, Brain, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface LoadingBarProps {
  progress: number
  status: string
  error?: string
}

export function LoadingBar({ progress, status, error }: LoadingBarProps) {
  const [phase, setPhase] = useState<'metadata' | 'llm' | 'error'>('metadata')

  useEffect(() => {
    if (error) {
      setPhase('error')
    } else if (progress < 50) {
      setPhase('metadata')
    } else {
      setPhase('llm')
    }
  }, [progress, error])

  const icons = {
    metadata: <Loader2 className="w-6 h-6 animate-spin" />,
    llm: <Brain className="w-6 h-6" />,
    error: <AlertCircle className="w-6 h-6 text-orange-400" />
  }

  // If no status provided, default to "Processing..."
  const displayText = error ? error : status || "Processing..."

  return (
    <div className="flex items-center gap-3 p-4 max-w-xl mx-auto">
      {icons[phase]}
      <div className="wave-text-container">
        {displayText.split('').map((char, i) => (
          <span
            key={i}
            className={`wave-char text-xl${error ? 'text-red-500' : ''}`}
            style={{
              '--char-index': i,
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            } as React.CSSProperties}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}