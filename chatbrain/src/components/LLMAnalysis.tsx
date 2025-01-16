import { useEffect } from "react"

interface LLMAnalysisProps {
  files: File[]
  onComplete: (results: any) => void
  onLoading: (loading: boolean) => void
}

export function LLMAnalysis({ files, onComplete, onLoading }: LLMAnalysisProps) {
  useEffect(() => {
    async function getLLMAnalysis() {
      try {
        const formData = new FormData()
        files.forEach((file, index) => formData.append('files', file, file.name))

        const response = await fetch('http://localhost:5000/llm', { 
          method: 'POST', 
          body: formData 
        })
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`)
        }

        const results = await response.json()
        onComplete(results)
      } catch (error) {
        alert("An error occurred in the LLM analysis.")
      } finally {
        onLoading(false)
      }
    }
    getLLMAnalysis()
  }, [files, onComplete, onLoading])

  return null
}