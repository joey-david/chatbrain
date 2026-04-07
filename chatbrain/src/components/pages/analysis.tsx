import { useState, useRef, useEffect, useCallback } from "react"
import { validateFiles } from "@/utils/fileValidation"
import { MetadataResults } from "@/components/metadataResults"
import { LLMResults } from "@/components/LLMResults"
import { EmptyState } from "@/components/empty-state"
import { TextSelect, LucideFileStack, AudioLines } from "lucide-react"
import { LoadingBar } from "@/components/ui/loadingBar"
import { TextInputSection } from "@/components/ui/textInputSelection"
import { ImageResults } from "@/components/imageResults"

type FileType = 'txt' | 'img' | 'aud' | null
type AnalysisState = 'idle' | 'metadata' | 'llm' | 'complete' | 'error'
type LoadingPhase = 'preparing' | 'uploading' | 'extracting' | 'llm'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, '')

function Analysis() {
  // File handling state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileType, setFileType] = useState<FileType>(null)
  const [showTextInput, setShowTextInput] = useState(false)

  // Analysis state
  const [metadataResults, setMetadataResults] = useState<any>(null)
  const [conversation, setConversation] = useState("")
  const [users, setUsers] = useState<string[]>([])
  const [imageResults, setImageResults] = useState<any>(null)
  const [llmResults, setLlmResults] = useState<any>(null)
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')

  // Progress tracking
  const [error, setError] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState("")
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('preparing')
  
  // Fetch guards
  const metadataFetchedRef = useRef(false)
  const llmFetchedRef = useRef(false)

  // Reset state when files change
  const resetState = useCallback(() => {
    metadataFetchedRef.current = false
    llmFetchedRef.current = false
    setMetadataResults(null)
    setConversation("")
    setUsers([])
    setLlmResults(null)
    setAnalysisState('idle')
    setStatus("")
    setError(undefined)
    setImageResults(null)
    setLoadingPhase('preparing')
  }, [])

  // File handling
  const handleFilesSelected = useCallback((files: File[]) => {
    try {
      validateFiles(files)
      const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name))
      const selectedType = detectFileType(sortedFiles[0])

      const beginAnalysis = (filesToUse: File[], nextType: FileType) => {
        setSelectedFiles(filesToUse)
        setFileType(nextType)
        resetState()
        setAnalysisState('metadata')
        setLoadingPhase('preparing')
        setStatus(`Prepared ${filesToUse.length} file${filesToUse.length === 1 ? "" : "s"} for analysis`)
      }

      // Scale down tall screenshots before upload to reduce OCR latency on CPU-only servers.
      if (selectedType === 'img') {
        Promise.all(sortedFiles.map(file => new Promise<File>((resolve) => {
          const objectUrl = URL.createObjectURL(file)
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height

            if (height > 1000) {
              width = Math.floor(width * (1000 / height))
              height = 1000
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)
            URL.revokeObjectURL(objectUrl)

            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: file.type }))
              } else {
                resolve(file)
              }
            }, file.type)
          }
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(file)
          }
          img.src = objectUrl
        }))).then(scaledFiles => {
          beginAnalysis(scaledFiles, 'img')
        })
        return
      }

      beginAnalysis(sortedFiles, selectedType)
    } catch (error) {
      console.error("File validation error:", error)
    }
  }, [resetState])

  const handleTextSubmit = useCallback((text: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const file = new File([blob], "input.txt", { type: "text/plain" })
    handleFilesSelected([file])
    setShowTextInput(false)
  }, [handleFilesSelected])

  // Metadata analysis
  useEffect(() => {
    if (!selectedFiles.length || metadataFetchedRef.current || analysisState !== 'metadata') return

    async function fetchMetadata() {
      try {
        setLoadingPhase('uploading')
        setStatus(`Reading ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`)
        const formData = new FormData()
        selectedFiles.forEach(file => formData.append('files', file))
        
        const response = await fetch(`${API_BASE_URL}/metadata`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Metadata fetch failed: ${response.statusText}`)
        }
        
        setLoadingPhase('extracting')
        setStatus("Extracting speakers and conversation structure")
        const { metadata, conversation, img_results } = await response.json()
        const userList = Object.keys(metadata).filter(key => 
          !['total_messages', 'total_characters'].includes(key)
        )
        
        setMetadataResults(metadata)
        setConversation(conversation)
        setUsers(userList)
        if (img_results) {
          setImageResults(img_results)
        }
        metadataFetchedRef.current = true

        if (userList.length === 0) {
          setAnalysisState('idle')
          setStatus("No conversation detected in the uploaded input")
        } else {
          setAnalysisState('llm')
          setLoadingPhase('llm')
        }
      } catch (error) {
        console.error('Metadata error:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setAnalysisState('error')
      }
    }

    fetchMetadata()
  }, [selectedFiles, analysisState])

  // LLM analysis
  useEffect(() => {
    if (!conversation || !users.length || llmFetchedRef.current || analysisState !== 'llm') return

    async function fetchLLM() {
      try {
        setLoadingPhase('llm')
        setStatus("Generating objective conversation analysis")
        const response = await fetch(`${API_BASE_URL}/llm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation, users, metadata: metadataResults })
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || 'LLM fetch failed')
        }
        
        const results = await response.json()
        setLlmResults(results)
        llmFetchedRef.current = true
        setAnalysisState('complete')
        setStatus("Analysis complete")
      } catch (error) {
        console.error('LLM error:', error)
        setError(error instanceof Error ? error.message : 'Unknown LLM error')
        setAnalysisState('error')
      }
    }

    fetchLLM()
  }, [conversation, users, metadataResults, analysisState])

  // Update status based on state
  useEffect(() => {
    switch (analysisState) {
      case 'metadata':
        setStatus(prev => prev || "Reading conversation input")
        break
      case 'llm':
        setStatus(prev => prev || "Generating objective conversation analysis")
        break
      case 'complete':
        setStatus("Analysis complete")
        break
      case 'error':
        setStatus(prev => prev || "Analysis failed")
        break
      default:
        setStatus("")
    }
  }, [analysisState])

  return (
    <div className="flex w-full flex-col items-center overflow-hidden rounded-[1.75rem] border-none p-2 text-center transition-all duration-300 ease-in-out md:p-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={e => e.target.files && handleFilesSelected(Array.from(e.target.files))}
      />

      {showTextInput ? (
        <TextInputSection
          onCancel={() => setShowTextInput(false)}
          onSubmit={handleTextSubmit}
        />
      ) : (
        <EmptyState
          title={selectedFiles.length ? `Selected: ${selectedFiles.map(file => file.name).join(', ')}` : "No Files Uploaded"}
          description={selectedFiles.length 
            ? `${selectedFiles.length} file(s) selected - ${fileType?.toUpperCase() || 'Unknown'} type`
            : "Please upload a chat log, screenshots, or an audio recording."}
          icons={[TextSelect, LucideFileStack, AudioLines]}
          action={{
            label: selectedFiles.length ? "Change files" : "Upload file(s)",
            onClick: () => fileInputRef.current?.click()
          }}
          secondaryAction={{
            label: "Type/paste text",
            onClick: () => setShowTextInput(true)
          }}
        />
      )}

      {imageResults && fileType === 'img' && (
        <ImageResults 
        results={imageResults} 
        originalFiles={selectedFiles}
        />
      )}
      {metadataResults && <MetadataResults data={metadataResults} />}
      {analysisState === 'complete' && llmResults && (
        <div className="mt-6 w-full max-w-7xl">
          <LLMResults data={llmResults} />
        </div>
      )}
      {(analysisState !== 'idle' && analysisState !== 'complete') || error ? (
      <LoadingBar 
        phase={loadingPhase}
        status={status} 
        fileCount={selectedFiles.length}
        error={error} 
      />
    ) : null}
    </div>
  )
}

// Utility function
const detectFileType = (file: File): FileType => {
  if (file.name.endsWith(".txt")) return 'txt'
  if (file.type.startsWith("image")) return 'img'
  if (file.type.startsWith("audio")) return 'aud'
  return null
}

export { Analysis }
