"use client"

import * as React from "react"
import { MessageSquareText } from "lucide-react"
import { UserComment } from "@/models/comment"
import { CommentCard } from "./commentCard"

export function CommentSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/40 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted/60 rounded" />
        </div>
      </div>
      <div className="space-y-2 pl-1">
        <div className="h-3.5 w-full bg-muted/70 rounded" />
        <div className="h-3.5 w-4/5 bg-muted/50 rounded" />
      </div>
    </div>
  )
}

interface CommentListProps {
  comments: UserComment[]
  isLoading?: boolean
}

export function CommentList({ comments, isLoading = false }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/20">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <MessageSquareText className="size-6 text-primary" />
        </div>
        <h4 className="font-medium text-foreground text-sm">No feedback yet</h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Be the first to share your thoughts, questions, or ideas for improving MfolioCal!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
