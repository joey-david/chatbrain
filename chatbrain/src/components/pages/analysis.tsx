import { useState, useRef, useEffect } from "react"
import { validateFiles } from "@/utils/fileValidation"
import { MetadataAnalysis } from "@/components/metadataAnalysis"
import { LLMAnalysis } from "@/components/LLMAnalysis"
import { MetadataResults } from "@/components/metadataResults"
import { LLMResults } from "@/components/LLMResults"
import { EmptyState } from "@/components/empty-state"
import { TextIcon, Image, Mic, ArrowUpFromLine, Undo2 } from "lucide-react"
import { LoadingBar } from "@/components/ui/loadingBar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Define FileType type
type FileType = 'txt' | 'img' | 'aud' | null

// Custom hook for managing analysis progress
const useAnalysisProgress = () => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const progressInterval = useRef<NodeJS.Timeout>()

  const updateStatus = (isLoading: boolean, metadataExists: boolean, llmExists: boolean) => {
    if (!isLoading) return setStatus("")
    if (!metadataExists) return setStatus("Analyzing metadata...")
    if (!llmExists) return setStatus("Running LLM analysis...")
    setStatus("Analysis complete!")
  }

  const startProgressInterval = (
    targetProgress: number,
    increment: number,
    intervalTime: number
  ) => {
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          clearInterval(progressInterval.current as NodeJS.Timeout)
          return prev
        }
        return Math.min(prev + increment, targetProgress)
      })
    }, intervalTime)
  }

  const clearCurrentInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }
  }

  return {
    progress,
    status,
    setProgress,
    updateStatus,
    startProgressInterval,
    clearCurrentInterval
  }
}

// Text input component for direct text entry
const TextInputSection = ({
  onCancel,
  onSubmit
}: {
  onCancel: () => void
  onSubmit: (text: string) => void
}) => {
  const [typedText, setTypedText] = useState("")

  const handleSubmit = () => {
    onSubmit(typedText)
    setTypedText("")
  }

  return (
    <div className={cn(
      "bg-muted/0 border-border text-center",
      "border-2 border-dashed rounded-xl p-2 w-[550px]",
      "group transition duration-300 ease-in-out hover:duration-200"
    )}>
      <textarea
        className="bg-muted/0 border-none p-2 w-full rounded text-black resize-none placeholder-gray-500 focus:outline-none"
        rows={10}
        placeholder="Type or paste your text here..."
        value={typedText}
        onChange={(e) => setTypedText(e.target.value)}
      />
      <div className="flex justify-center gap-2">
        <Button onClick={onCancel} className="gap-1 text-black" variant="outline">
          <Undo2 className="w-4 gap-2"/> Cancel
        </Button>
        <Button onClick={handleSubmit} className="gap-1">
          <ArrowUpFromLine className="w-4 gap-2"/> Send
        </Button>
      </div>
    </div>
  )
}

// Main analysis component
function Analysis() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [metadataResults, setMetadataResults] = useState(null)
  const [llmResults, setLlmResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileType, setFileType] = useState<FileType | null>(null)
  const [showTextInput, setShowTextInput] = useState(false)

  const {
    progress,
    status,
    setProgress,
    updateStatus,
    startProgressInterval,
    clearCurrentInterval
  } = useAnalysisProgress()

  // Handle file validation and state updates
  const handleFilesSelected = (files: File[]) => {
    try {
      validateFiles(files)
      setSelectedFiles(files)
      setFileType(detectFileType(files[0]))
      setIsLoading(true)
      setProgress(5)
    } catch (error) {
      console.error("File validation error:", error)
    }
  }

  // Determine file type from File object
  const detectFileType = (file: File): FileType => {
    if (file.name.endsWith(".txt")) return 'txt'
    if (file.type.startsWith("image")) return 'img'
    if (file.type.startsWith("audio")) return 'aud'
    return null
  }

  // Handle text submission as file
  const handleTextSubmit = (text: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const file = new File([blob], "input.txt", { type: "text/plain" })
    handleFilesSelected([file])
    setShowTextInput(false)
  }

  // Progress management effects
  useEffect(() => {
    clearCurrentInterval()

    if (isLoading) {
      if (!metadataResults && progress < 30) {
        startProgressInterval(30, 1, 100)
      } else if (metadataResults && !llmResults && progress < 95) {
        startProgressInterval(95, 1, 100)
      } else if (llmResults) {
        setProgress(100)
      }
    } else {
      setProgress(0)
    }
  }, [isLoading, metadataResults, llmResults])

  // Status updates
  useEffect(() => {
    updateStatus(isLoading, !!metadataResults, !!llmResults)
  }, [isLoading, metadataResults, llmResults])

  return (
    <div className="
      bg-muted/60 border-border text-center border-2 rounded-xl p-14
      items-center flex flex-col transition-all duration-300 ease-in-out
      overflow-hidden
    ">
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
          title={selectedFiles.length ? `Selected: ${selectedFiles[0].name}` : "No Files Uploaded"}
          description={selectedFiles.length 
            ? `${selectedFiles.length} file(s) selected - ${fileType?.toUpperCase() || 'Unknown'} type`
            : "Please upload a chat log, screenshots, or an audio recording."}
          icons={[Image, TextIcon, Mic]}
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

      {metadataResults && <MetadataResults data={metadataResults} />}
      {isLoading && <LoadingBar progress={progress} status={status} />}
      {!isLoading && llmResults && (
        <div className="max-w-5xl mt-6 w-full">
          <LLMResults data={llmResults} />
        </div>
      )}

      {selectedFiles.length > 0 && (
        <>
          <MetadataAnalysis files={selectedFiles} onComplete={setMetadataResults} />
          <LLMAnalysis
            files={selectedFiles}
            onComplete={setLlmResults}
            onLoading={setIsLoading}
          />
        </>
      )}
    </div>
  )
}

export { Analysis }