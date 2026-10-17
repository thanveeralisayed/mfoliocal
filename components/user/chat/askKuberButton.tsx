"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"

interface AskKuberButtonProps {
  promptText: string
  label?: string
  className?: string
  variant?: "default" | "outline" | "subtle"
}

export function AskKuberButton({
  promptText,
  label = "Ask Kuber AI",
  className = "",
  variant = "subtle",
}: AskKuberButtonProps) {
  const { askPrompt } = useFinancialAssistant()

  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95"

  const variantStyles = {
    default:
      "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xs hover:shadow-md hover:opacity-95",
    outline:
      "border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10",
    subtle:
      "bg-muted/80 hover:bg-muted text-foreground border border-border/60 hover:border-primary/40",
  }

  return (
    <button
      type="button"
      onClick={() => askPrompt(promptText)}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <Sparkles className="size-3.5 text-primary shrink-0 animate-pulse" />
      <span>{label}</span>
    </button>
  )
}
