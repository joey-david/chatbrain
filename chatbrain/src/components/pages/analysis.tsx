import { useState, useRef, useEffect } from "react"
import { validateFiles } from "@/utils/fileValidation"
import { MetadataAnalysis } from "@/components/metadataAnalysis"
import { LLMAnalysis } from "@/components/LLMAnalysis"
import { MetadataResults } from "@/components/metadataResults"
import { LLMResults } from "@/components/LLMResults"
import { EmptyState } from "@/components/empty-state"
import { TextIcon, Image, Mic, ArrowUpFromLine, Undo2, Undo } from "lucide-react"
import { LoadingBar } from "@/components/ui/loadingBar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


function Analysis() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [metadataResults, setMetadataResults] = useState(null)
  const [llmResults, setLlmResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileType, setFileType] = useState<'txt' | 'img' | 'aud' | null>(null)
  const progressInterval = useRef<NodeJS.Timeout>()
  const [showTextInput, setShowTextInput] = useState(false)
  const [typedText, setTypedText] = useState("")

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleSendText = () => {
    if (!typedText.trim()) return
    const blob = new Blob([typedText], { type: "text/plain" })
    const file = new File([blob], "input.txt", { type: "text/plain" })
    try {
      validateFiles([file])
      setSelectedFiles([file])
      setFileType("txt")
      setIsLoading(true)
      setShowTextInput(false)
    } catch (error) {
      console.error("Validation error:", error)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return
    const files = Array.from(event.target.files)
    // Clear any existing interval first}
    setMetadataResults(null)
    setLlmResults(null)

    try {
      validateFiles(files)
      setSelectedFiles(files)
      if (files[0].name.endsWith(".txt")) setFileType("txt")
      else if (files[0].type.startsWith("image")) setFileType("img")
      else if (files[0].type.startsWith("audio")) setFileType("aud")
      setProgress(5) // Initialize progress on file selection
      setIsLoading(true)
    } catch (error) {
      console.error("Validation error:", error)
    }
  }

  // Progress handler
  useEffect(() => {
    // Clear any existing interval first
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    // Set up new interval based on current state
    if (isLoading) {
      if (!metadataResults && progress < 30) {
        progressInterval.current = setInterval(() => {
          setProgress(prev => {
            if (prev < 30) return prev + 1
            clearInterval(progressInterval.current as NodeJS.Timeout)
            return prev
          })
        }, 100)
      } else if (metadataResults && !llmResults && progress < 95) {
        progressInterval.current = setInterval(() => {
          setProgress(prev => {
            if (prev < 95) return prev + 1
            clearInterval(progressInterval.current as NodeJS.Timeout)
            return prev
          })
        }, 100)
      } else if (llmResults) {
        setProgress(100)
      }
    } else {
      setProgress(0)
    }

    // Cleanup
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isLoading, metadataResults, llmResults, progress])

  // Status message handler
  useEffect(() => {
    if (!isLoading) {
      setStatus("")
    } else if (!metadataResults) {
      setStatus("Analyzing metadata...")
    } else if (!llmResults) {
      setStatus("Running LLM analysis...")
    } else {
      setStatus("Analysis complete!")
    }
  }, [isLoading, metadataResults, llmResults])

  return (
    <div className="
        bg-muted/60 border-border text-center border-2 rounded-xl p-14
        items-center flex flex-col
        transition-all duration-300 ease-in-out
        overflow-hidden
      "
      >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileSelect}
      />
      {!showTextInput && (
        <EmptyState
          title={selectedFiles.length ? `Selected: ${selectedFiles[0].name}` : "No Files Uploaded"}
          description={
            selectedFiles.length
              ? `${selectedFiles.length} file(s) selected - ${fileType?.toUpperCase() || 'Unknown'} type`
              : "Please upload a chat log, screenshots, or an audio recording."
          }
          icons={[Image, TextIcon, Mic]}
          action={{
            label: selectedFiles.length ? "Change files" : "Upload file(s)",
            onClick: handleUploadClick,
          }}
          secondaryAction={{
            label: "Type/paste text",
            onClick: () => setShowTextInput(true)
          }}
        />
      )}
      {showTextInput && (
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
              <Button onClick={() => setShowTextInput(false)}
                className="gap-1 text-black"
                variant={"outline"}>
                <Undo2 className="w-4 gap-2"/> Cancel
              </Button>
              <Button onClick={handleSendText}
                className="gap-1">
                <ArrowUpFromLine className="w-4 gap-2"/> Send
              </Button>
            </div>
          </div>
      )}

      {metadataResults && (
          <MetadataResults data={metadataResults} />
      )}
      {isLoading && <LoadingBar progress={progress} status={status} />}
      {!isLoading && llmResults && (
        <div className="max-w-5xl mt-6 w-full">
          <LLMResults data={llmResults} />
        </div>
      )}
      {selectedFiles.length > 0 && (
        <>
          <MetadataAnalysis files={selectedFiles} onComplete={setMetadataResults} />
          <LLMAnalysis files={selectedFiles} onComplete={setLlmResults} onLoading={setIsLoading} />
        </>
      )}
    </div>
  )
}


export { Analysis }