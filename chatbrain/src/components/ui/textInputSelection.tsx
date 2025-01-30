import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpFromLine, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
      "bg-muted/0 text-center",
      "border-2 border-dashed border-gray-500 rounded-xl p-2 w-[600px]",
      "group transition duration-300 ease-in-out hover:duration-200"
    )}>
      <textarea
        className="bg-muted/0 border-none p-2 w-full rounded text-gray-100 resize-none placeholder-gray-400 focus:outline-none"
        rows={10}
        placeholder="Type or paste your text here..."
        value={typedText}
        onChange={(e) => setTypedText(e.target.value)}
      />
      <div className="flex justify-center gap-2 mb-3">
        <Button onClick={onCancel} className="gap-1 text-black" variant="outline">
          <Undo2 className="w-4 gap-2"/> Cancel
        </Button>
        <Button onClick={handleSubmit} className="gap-1">
          <ArrowUpFromLine className="w-4 gap-2"/> Submit
        </Button>
      </div>
    </div>
  )
}

export { TextInputSection }