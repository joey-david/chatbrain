import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  title: string
  description: string
  icons?: LucideIcon[]
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icons = [],
  action,
  secondaryAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "bg-muted/0 border-border text-center",
      "border-2 border-dashed rounded-xl p-14 w-full w-[550px]",
      "group transition duration-300 ease-in-out hover:duration-200",
      className
    )}>
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[0], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[1], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[2], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
          </>
        ) : (
          <div className="bg-background size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            {icons[0] && React.createElement(icons[0], {
              className: "w-6 h-6 text-muted-foreground"
            })}
          </div>
        )}
      </div>
      <h2 className="text-foreground font-medium mt-6">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{description}</p>
      <div className="flex justify-center">
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            className={cn(
              "mt-4 mr-2",
              "shadow-sm active:shadow-none text-black"
            )}
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className={cn(
              "mt-4 ml-2",
              "shadow-sm active:shadow-none text-black"
            )}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// ...existing code...
import { useState, useRef, useEffect } from "react"
import { validateFiles } from "@/utils/fileValidation"
import { MetadataAnalysis } from "@/components/metadataAnalysis"
import { LLMAnalysis } from "@/components/LLMAnalysis"
import { MetadataResults } from "@/components/metadataResults"
import { LLMResults } from "@/components/LLMResults"
import { EmptyState } from "@/components/empty-state"
import { PhoneCall, Image, Mic } from "lucide-react"
import { LoadingBar } from "@/components/ui/loadingBar"
import { Button } from "@/components/ui/button"

// ...existing state and code...

function Analysis() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [metadataResults, setMetadataResults] = useState(null)
  const [llmResults, setLlmResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileType, setFileType] = useState<'txt' | 'img' | 'aud' | null>(null)

// ...existing code...

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

// ...file select, effects, etc...

  return (
    <main className="p-8 flex flex-col items-center">
      <div className="bg-muted/60 border-border text-center border-2 rounded-xl p-14 justify-center items-center flex flex-col">
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
                : "Please upload an exported whatsapp chat, screenshots, or an audio recording."
            }
            icons={[Image, PhoneCall, Mic]}
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
          <div className="max-w-md w-full flex flex-col items-center space-y-4">
            <textarea
              className="border p-2 w-full rounded"
              rows={6}
              placeholder="Type or paste your text here..."
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
            />
            <Button onClick={handleSendText}>Send</Button>
          </div>
        )}

        {metadataResults && (
          <div className="max-w-5xl mt-6 w-full">
            <MetadataResults data={metadataResults} />
          </div>
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
    </main>
  )
}

// ...existing export...