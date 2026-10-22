"use client"

import * as React from "react"
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  shareText: string
  generateCard: () => Promise<string>
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  shareText,
  generateCard,
}: ShareModalProps) {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)

  // Generate image whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      generateCard()
        .then((url) => {
          setImageUrl(url)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to generate card:", err)
          setIsLoading(false)
        })
    } else {
      setImageUrl(null)
      setCopiedLink(false)
    }
  }, [isOpen, generateCard])

  if (!isOpen) return null

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement("a")
    a.href = imageUrl
    a.download = `mfoliocal-plan-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleWhatsAppShare = () => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href
      const message = `${shareText}\n\n👉 Calculate yours here: ${currentUrl}`
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleNativeShare = async () => {
    if (!imageUrl || typeof window === "undefined") return

    try {
      // Convert data URL to Blob for native file sharing
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob], "mfoliocal-plan.png", { type: "image/png" })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: `${shareText}\n\n${window.location.href}`,
          files: [file],
        })
      } else if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: window.location.href,
        })
      } else {
        handleWhatsAppShare()
      }
    } catch (e) {
      console.log("Share dismissed or failed", e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">
                High-resolution snapshot ready to post or send
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-muted/40 aspect-[16/9] flex items-center justify-center shadow-inner">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Rendering high-DPI card...</span>
            </div>
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="MfolioCal Share Card"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-xs text-muted-foreground">Preview unavailable</span>
          )}
        </div>

        {/* 4 Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="size-4" />
            <span>Share on WhatsApp</span>
          </button>

          {/* Download Image (PNG) */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!imageUrl}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="size-4" />
            <span>Download Image (PNG)</span>
          </button>

          {/* Native Mobile Share Sheet */}
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={!imageUrl}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-muted/70 hover:bg-muted border border-border/70 text-foreground transition-all cursor-pointer"
          >
            <Share2 className="size-3.5 text-primary" />
            <span>More Apps (Instagram, LinkedIn)</span>
          </button>

          {/* Copy Shareable Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-muted/70 hover:bg-muted border border-border/70 text-foreground transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-500">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>Copy Calculation Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
