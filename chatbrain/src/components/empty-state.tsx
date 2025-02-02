import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon, TextSelect, Paperclip } from "lucide-react"

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
      "bg-muted/0 text-center",
      "md:border-2 border-dashed border-gray-500 rounded-xl p-6 md:p-14 w-full md:w-[600px]",
      "group transition duration-300 ease-in-out hover:duration-200",
      className
    )}>
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200 antialiased">
              {React.createElement(icons[0], {
              className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200 antialiased">
              {React.createElement(icons[1], {
              className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200 antialiased">
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
      <h2 className="text-gray text-lg text font-medium mt-10">{title}</h2>
      <p className="text-md mt-1 whitespace-pre-line text-gray-400">{description}</p>
      <div className="flex flex-col md:flex-row justify-center mt-4">
        {action && (
          <Button
        onClick={action.onClick}
        variant="outline"
        className={cn(
          "mt-4 gap-2",
          "shadow-lg active:shadow-none text-black",
          "w-full sm:w-auto sm:mr-2"
        )}
          >
        <>
          <Paperclip className="w-5 h-5" /> {action.label}
        </>
          </Button>
        )}
        {secondaryAction && (
          <Button
        onClick={secondaryAction.onClick}
        className={cn(
          "mt-4 gap-2",
          "shadow-lg active:shadow-none text-white bg-primary outline-primary",
          "w-full sm:w-auto"
        )}
          >
        <>
          <TextSelect className="w-5 h-5" /> {secondaryAction.label}
        </>
          </Button>
        )}
      </div>
    </div>
  )
}
