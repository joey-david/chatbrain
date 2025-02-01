import { Loader2, Brain, AlertCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"

interface LoadingBarProps {
  /** 
   * A number indicating the phase:
   * < 50 => metadata 
   * >= 50 => llm
   */
  progress: number
  /**
   * Plain text status message
   */
  status: string
  /**
   * Error string if any
   */
  error?: string
  /**
   * The number of files being analyzed,
   * used to calculate metadata timing
   */
  fileCount?: number
}

export function LoadingBar({ progress, status, error, fileCount = 1 }: LoadingBarProps) {
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
    if (progress < 50) setPhase('metadata')
    else setPhase('llm')
  }, [progress, error])

  // Animate progress from 0 to 96% 
  // metadata => n*6s, llm => 15s
  useEffect(() => {
    if (error) {
      setDisplayedProgress(0)
      return
    }

    // Cancel any old animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setDisplayedProgress(0)
    startTimeRef.current = undefined

    // Compute duration
    const duration = phase === 'metadata'
      ? fileCount * 6000
      : 15000

    const target = 96

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }
      const elapsed = timestamp - startTimeRef.current
      const nextVal = Math.min((elapsed / duration) * 100, target)

      setDisplayedProgress(Math.floor(nextVal))
      if (nextVal < target) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (phase !== 'error') {
      animationRef.current = requestAnimationFrame(animate)
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
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
  const displayText = error || status || "Processing..."


  return (
    <div className="flex items-center gap-3 p-4 max-w-xl mx-auto">
      {activeIcon}
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
      <div className="text-xl font-mono">
        {phase === 'error' ? "--" : displayedProgress}%
      </div>
    </div>
  )
}