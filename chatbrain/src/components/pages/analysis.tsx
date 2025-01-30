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
type AnalysisState = 'idle' | 'metadata' | 'llm' | 'complete'

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
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  
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
    setProgress(0)
    setStatus("")
  }, [])

  // File handling
  const handleFilesSelected = useCallback((files: File[]) => {
    try {
      validateFiles(files)
      const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name))
      setSelectedFiles(sortedFiles)
      setFileType(detectFileType(sortedFiles[0]))
      resetState()
      setAnalysisState('metadata')
      setProgress(5)
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
        const formData = new FormData()
        selectedFiles.forEach(file => formData.append('files', file))
        
        const response = await fetch('http://localhost:5000/metadata', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error('Metadata fetch failed')
        
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
          setProgress(0)
        } else {
          setAnalysisState('llm')
          setProgress(50)
        }
      } catch (error) {
        console.error('Metadata error:', error)
        setAnalysisState('idle')
      }
    }

    fetchMetadata()
  }, [selectedFiles, analysisState])

  // LLM analysis
  useEffect(() => {
    if (!conversation || !users.length || llmFetchedRef.current || analysisState !== 'llm') return

    async function fetchLLM() {
      try {
        const response = await fetch('http://localhost:5000/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation, users })
        })

        if (!response.ok) throw new Error('LLM fetch failed')
        
        const results = await response.json()
        setLlmResults(results)
        llmFetchedRef.current = true
        setAnalysisState('complete')
        setProgress(100)
      } catch (error) {
        console.error('LLM error:', error)
        setAnalysisState('metadata')
      }
    }

    fetchLLM()
  }, [conversation, users, analysisState])

  // Update status based on state
  useEffect(() => {
    switch (analysisState) {
      case 'metadata':
        setStatus("Analyzing metadata...")
        break
      case 'llm':
        setStatus("Running LLM analysis...")
        break
      case 'complete':
        setStatus("Analysis complete!")
        break
      default:
        setStatus("")
    }
  }, [analysisState])

  return (
    <div className="border-none text-center rounded-xl p-5 items-center flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
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
        <div className="max-w-7xl mt-6 w-full">
          <LLMResults data={llmResults} />
        </div>
      )}
      {analysisState !== 'idle' && <LoadingBar progress={progress} status={status} />}
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