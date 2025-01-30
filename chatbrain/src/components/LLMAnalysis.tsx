import { useEffect } from "react"

interface LLMAnalysisProps {
  conversation: string
  users: string[]
  onComplete: (results: any) => void
  onLoading: (loading: boolean) => void
}

export function LLMAnalysis({ conversation, users, onComplete, onLoading }: LLMAnalysisProps) {
  useEffect(() => {
    async function getLLMAnalysis() {
      try {
        const response = await fetch('http://localhost:5000/llm', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ conversation, users })
        })
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`)
        }
        const results = await response.json()
        onComplete(results)
      } catch (error) {
        alert("Error in LLM analysis.")
      } finally {
        onLoading(false)
      }
    }
    if (conversation && users.length > 0) {
      getLLMAnalysis()
    }
  }, [conversation, users, onComplete, onLoading])

  return null
}