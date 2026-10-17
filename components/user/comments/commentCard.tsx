"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ThumbsUp, Compass } from "lucide-react"
import { UserComment } from "@/models/comment"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CommentCardProps {
  comment: UserComment
}

// Generate consistent avatar color based on name
function getAvatarGradient(name: string) {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

export function CommentCard({ comment }: CommentCardProps) {
  const [likes, setLikes] = React.useState(0)
  const [hasLiked, setHasLiked] = React.useState(false)

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1)
      setHasLiked(false)
    } else {
      setLikes((prev) => prev + 1)
      setHasLiked(true)
    }
  }

  const initials = getInitials(comment.name) || "U"
  const gradient = getAvatarGradient(comment.name)

  const formattedTime = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    } catch {
      return "recently"
    }
  }, [comment.createdAt])

  return (
    <Card className="p-4 transition-all duration-200 hover:shadow-md border-border/60 bg-card/60 backdrop-blur-xs">
      <CardContent className="p-0 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-semibold text-sm shadow-xs shrink-0`}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm leading-none text-foreground">
                  {comment.name}
                </h4>
                {comment.referralSource && (
                  <Badge variant="secondary" className="text-[11px] font-normal py-0 h-5 gap-1">
                    <Compass className="size-3 text-muted-foreground" />
                    <span>via {comment.referralSource}</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formattedTime}</p>
            </div>
          </div>

          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors border ${
              hasLiked
                ? "bg-primary/10 border-primary/30 text-primary font-medium"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            title="Mark as helpful"
            type="button"
          >
            <ThumbsUp className={`size-3.5 ${hasLiked ? "fill-primary" : ""}`} />
            <span>{likes > 0 ? likes : "Helpful"}</span>
          </button>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap pl-1">
          {comment.comment}
        </p>
      </CardContent>
    </Card>
  )
}
