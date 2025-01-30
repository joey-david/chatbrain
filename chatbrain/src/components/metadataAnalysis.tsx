import { useEffect } from "react"

interface MetadataAnalysisProps {
  files: File[]
  onComplete: (metadata: any, conversation: string, users: string[]) => void
}

export function MetadataAnalysis({ files, onComplete }: MetadataAnalysisProps) {
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file, file.name))

        const response = await fetch('http://localhost:5000/metadata', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`)
        }

        const { metadata, conversation } = await response.json()

        // Build a user array from metadata keys except total_messages / total_characters
        const users = Object.keys(metadata).filter(key =>
          !['total_messages', 'total_characters'].includes(key)
        )

        onComplete(metadata, conversation, users)
      } catch (error) {
        console.error('Error fetching metadata:', error)
      }
    }
    fetchMetadata()
  }, [files, onComplete])

  return null
}