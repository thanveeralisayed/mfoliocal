"use client"

import * as React from "react"
import { Send, CheckCircle2, Sparkles } from "lucide-react"
import { REFERRAL_OPTIONS, UserComment } from "@/models/comment"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface CommentFormProps {
  onAddComment: (comment: Omit<UserComment, "id" | "createdAt">) => Promise<void> | void
}

export function CommentForm({ onAddComment }: CommentFormProps) {
  const [name, setName] = React.useState("")
  const [comment, setComment] = React.useState("")
  const [referralSource, setReferralSource] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [errors, setErrors] = React.useState<{ name?: string; comment?: string }>({})

  const validate = () => {
    const newErrors: { name?: string; comment?: string } = {}
    if (!name.trim()) {
      newErrors.name = "Please enter your name"
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!comment.trim()) {
      newErrors.comment = "Please write your feedback or comment"
    } else if (comment.trim().length < 5) {
      newErrors.comment = "Comment must be at least 5 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onAddComment({
        name: name.trim(),
        comment: comment.trim(),
        referralSource: referralSource || undefined,
      })
      setName("")
      setComment("")
      setReferralSource("")
      setErrors({})
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
      }, 3500)
    } catch (err) {
      console.error("Failed to post comment:", err)
      setErrors({ comment: "Unable to submit comment. Please check connection and try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showSuccess && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Thank you for your feedback! Your comment has been posted.</span>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="author-name" className="text-sm font-medium">
            Your Name <span className="text-destructive">*</span>
          </Label>
        </div>
        <Input
          id="author-name"
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
          maxLength={60}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-xs text-destructive font-medium">{errors.name}</p>
        )}
      </div>

      {/* Comment / Feedback Field */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="feedback-comment" className="text-sm font-medium">
            Your Feedback or Question <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">{comment.length}/500</span>
        </div>
        <Textarea
          id="feedback-comment"
          placeholder="Share your experience, feature ideas, or ask a question about mutual fund calculations..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }))
          }}
          className={`min-h-[100px] resize-y ${
            errors.comment ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
          maxLength={500}
          disabled={isSubmitting}
        />
        {errors.comment && (
          <p className="text-xs text-destructive font-medium">{errors.comment}</p>
        )}
      </div>

      {/* Optional: How did you know about this app? */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-500" />
          <Label className="text-xs font-medium text-muted-foreground">
            How did you hear about this app? <span className="text-muted-foreground/70">(Optional)</span>
          </Label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REFERRAL_OPTIONS.map((option) => {
            const isSelected = referralSource === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setReferralSource(isSelected ? "" : option)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                    : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                }`}
                disabled={isSubmitting}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || !comment.trim()}
          className="gap-2 px-5 cursor-pointer font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span>Post Comment</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
