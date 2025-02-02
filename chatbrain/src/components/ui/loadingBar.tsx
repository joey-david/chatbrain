import { Loader2, Brain, AlertCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"

interface LoadingBarProps {
  progress: number
  status: string
  error?: string
  fileCount?: number
}

export function LoadingBar({ progress, status, error, fileCount }: LoadingBarProps) {
  const [phase, setPhase] = useState<'metadata' | 'llm' | 'error'>('metadata')
  const [displayedProgress, setDisplayedProgress] = useState(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  // Decide phase based on "progress" prop or error
  useEffect(() => {
    if (error) {
      setPhase('error')
      return
    }
  }, [progress, error])

  useEffect(() => {
    if (error) {
      setPhase('error')
      return
    }
    setPhase(progress >= 50 ? 'llm' : 'metadata')
  }, [progress, error])

  // Animate progress bar
  useEffect(() => {
    if (error) {
      setDisplayedProgress(0)
      return
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setDisplayedProgress(0)
    startTimeRef.current = undefined

    const duration = phase === 'metadata'
    ? 2000 + ((fileCount ?? 1) * 5000)  // 2s base + 5s per file
    : 13000                     // 13s for LLM

    const target = phase === 'metadata' ? 96 : 99

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      
      // Add nonlinear easing for better perception
      const progressRatio = elapsed / duration
      const easedProgress = progressRatio < 0.9 
        ? progressRatio * 0.9
        : 0.81 + (progressRatio - 0.9) * 2
      
      const nextVal = Math.min(easedProgress * 100, target)
      
      setDisplayedProgress(Math.floor(nextVal))
      if (nextVal < target) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (phase !== 'error') {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      animationRef.current && cancelAnimationFrame(animationRef.current)
    }
  }, [phase, fileCount, error])

  // Icons
  const icons = {
    metadata: <Loader2 className="w-6 h-6 animate-spin" />,
    llm: <Brain className="w-6 h-6" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
  }

  // Display icon
  const activeIcon = phase === 'error' ? icons.error : phase === 'llm' ? icons.llm : icons.metadata

  // Display text
  const displayText = error 
    ? error 
    : `${status || "Processing..."} ${phase === 'error' ? "--" : displayedProgress}%`

  return (
    <div className="flex items-center gap-3 p-4 max-w-xl mx-auto">
      {activeIcon}
      <div className="wave-text-container font-mono text-lg w-full">
        {displayText.split('').map((char, i) => (
          <span
            key={i}
            className={`wave-char inline-block ${error ? 'text-red-500' : ''}`}
            style={{
              ['--char-index' as string]: i,
              whiteSpace: 'pre-wrap',
            } as React.CSSProperties}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  )
}
