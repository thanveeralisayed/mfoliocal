"use client"

import * as React from "react"
import { MessageSquare, Users, MessageCircle } from "lucide-react"
import { UserComment } from "@/models/comment"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CommentForm } from "./commentForm"
import { CommentList } from "./commentList"
import { subscribeToComments, addComment } from "@/lib/commentsService"

export default function CommentSection() {
  const [comments, setComments] = React.useState<UserComment[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isCloud, setIsCloud] = React.useState<boolean>(false)

  React.useEffect(() => {
    const unsubscribe = subscribeToComments((loadedComments, liveStatus) => {
      setComments(loadedComments)
      setIsCloud(liveStatus)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleAddComment = async (newCommentData: Omit<UserComment, "id" | "createdAt">) => {
    const created = await addComment(newCommentData)
    // If not live Firestore (i.e. running local storage), update local state immediately
    if (!isCloud) {
      setComments((prev) => [created, ...prev])
    }
  }

  return (
    <section className="w-full my-10" id="feedback-section">
      <Card className="border-border/80 shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/95">
        <CardHeader className="border-b border-border/50 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold tracking-tight">
                    User Feedback & Comments
                  </CardTitle>
                  <Badge variant="outline" className="font-semibold text-xs px-2 py-0.5 min-w-6 justify-center">
                    {isLoading ? (
                      <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
                    ) : (
                      comments.length
                    )}
                  </Badge>
                </div>
                <CardDescription className="text-sm mt-0.5">
                  Have feedback, questions, or ideas for MfolioCal? We would love to hear from you.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground self-start sm:self-center">
              <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-full border border-border/40">
                <Users className="size-3.5 text-primary" />
                <span>Investor Community</span>
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Comment Post Form */}
            <div className="lg:col-span-5 bg-muted/20 p-5 rounded-xl border border-border/60">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="size-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Leave a Comment</h3>
              </div>
              <CommentForm onAddComment={handleAddComment} />
            </div>

            {/* Right: Comments Feed */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <span>Recent Feedback</span>
                  {!isLoading && (
                    <span className="text-xs text-muted-foreground font-normal">
                      ({comments.length} {comments.length === 1 ? "comment" : "comments"})
                    </span>
                  )}
                </h3>
              </div>

              <div className="max-h-[600px] overflow-y-auto pr-1">
                <CommentList comments={comments} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
