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
      "group w-full max-w-2xl rounded-[1.75rem] border border-dashed border-white/15 bg-black/20 p-8 text-center transition duration-300 ease-in-out md:p-12",
      className
    )}>
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className="relative left-2.5 top-1.5 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg transition duration-500 antialiased group-hover:-translate-x-5 group-hover:-translate-y-0.5 group-hover:-rotate-12 group-hover:duration-200">
              {React.createElement(icons[0], {
              className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="relative z-10 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg transition duration-500 antialiased group-hover:-translate-y-0.5 group-hover:duration-200">
              {React.createElement(icons[1], {
              className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="relative right-2.5 top-1.5 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg transition duration-500 antialiased group-hover:translate-x-5 group-hover:-translate-y-0.5 group-hover:rotate-12 group-hover:duration-200">
              {React.createElement(icons[2], {
              className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
          </>
        ) : (
          <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg transition duration-500 hover:-translate-y-0.5 group-hover:duration-200">
            {icons[0] && React.createElement(icons[0], {
              className: "w-6 h-6 text-muted-foreground"
            })}
          </div>
        )}
      </div>
      <h2 className="mt-8 text-lg font-medium text-white md:text-xl">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-400 md:text-base">{description}</p>
      <div className="flex justify-center mt-4">
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            className={cn(
              "mt-4 mr-2 gap-2 rounded-full border-white/15 bg-transparent text-white shadow-lg hover:bg-white/5"
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
              "mt-4 mr-2 gap-2 rounded-full shadow-lg"
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
