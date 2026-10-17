"use client"

import * as React from "react"
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
  Home,
  TrendingUp,
  Lightbulb,
} from "lucide-react"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

// Lightweight, safe markdown formatter for financial messages
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        // Headings
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-foreground text-sm sm:text-base mt-2 mb-1 flex items-center gap-1.5">
              {trimmed.replace("### ", "")}
            </h4>
          )
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-extrabold text-foreground text-sm sm:text-base mt-2 mb-1">
              {trimmed.replace("## ", "")}
            </h3>
          )
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="font-extrabold text-foreground text-base mt-2 mb-1">
              {trimmed.replace("# ", "")}
            </h2>
          )
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.slice(2)
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-primary font-bold select-none">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
            </div>
          )
        }

        // Numbered list
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="font-semibold text-primary select-none text-[11px] mt-0.5">
                {numberedMatch[1]}.
              </span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(numberedMatch[2]) }} />
            </div>
          )
        }

        // Standard text line
        return (
          <p
            key={idx}
            className="my-0.5"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        )
      })}
    </div>
  )
}

function formatInline(text: string): string {
  // Bold **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
  // Inline code `code`
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-primary">$1</code>'
  )
  // Italics *text*
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-muted-foreground">$1</em>')
  return formatted
}

export function KuberChatWidget() {
  const {
    isOpen,
    setIsOpen,
    toggleOpen,
    pageContext,
    pendingPrompt,
    clearPendingPrompt,
  } = useFinancialAssistant()

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `### 👋 Namaste! I am Kuber, your AI Wealth & Financial Advisor.

I am context-aware and continuously follow your calculations on **MfolioCal**:
- 🏠 **Home Loan Analysis**: Ask about your monthly EMI, tenure reduction, and prepayment impact.
- 📈 **Mutual Funds**: Ask about SIP compounding, XIRR vs CAGR, and scheme risk profiles.
- ⚖️ **Loan vs SIP**: Find out whether prepaying your mortgage or investing in an equity SIP is mathematically smarter for you.

Pick a quick question below or ask me anything!`,
      timestamp: "Just now",
    },
  ])

  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSendMessage = React.useCallback(
    async (textToSend?: string) => {
      const messageContent = (textToSend ?? inputValue).trim()
      if (!messageContent || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => {
        const nextMessages = [...prev, userMessage]
        ;(async () => {
          setIsLoading(true)
          try {
            const conversationHistory = nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            }))

            const response = await fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: conversationHistory,
                context: pageContext,
              }),
            })

            if (!response.ok) {
              throw new Error(`Server returned ${response.status}`)
            }

            const data = await response.json()
            const botReply: ChatMessage = {
              id: `bot-${Date.now()}`,
              role: "assistant",
              content:
                data.reply ||
                "I analyzed your request, but could not produce a response. Please try again.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }

            setMessages((current) => [...current, botReply])
          } catch (error) {
            console.error("Chat error:", error)
            const errorReply: ChatMessage = {
              id: `error-${Date.now()}`,
              role: "assistant",
              content:
                "⚠️ I had trouble connecting to the AI service. Please check your connection and try again.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
            setMessages((current) => [...current, errorReply])
          } finally {
            setIsLoading(false)
          }
        })()

        return nextMessages
      })

      setInputValue("")
    },
    [inputValue, isLoading, pageContext]
  )

  // Scroll to bottom whenever messages or loading state changes
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, isOpen])

  // Handle external prompt requests (e.g., clicking a button inside a card)
  React.useEffect(() => {
    if (pendingPrompt && isOpen) {
      handleSendMessage(pendingPrompt)
      clearPendingPrompt()
    }
  }, [pendingPrompt, isOpen, clearPendingPrompt, handleSendMessage])

  // Auto focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // Dynamic quick prompt chips based on active page & context
  const quickPrompts = React.useMemo(() => {
    if (pageContext.page === "home-loan" && pageContext.loan) {
      const { principal, annualRate } = pageContext.loan
      const amountLakhs = (principal / 100000).toFixed(0)
      return [
        `How much will prepaying ₹5,000/mo save on my ₹${amountLakhs}L loan at ${annualRate}%?`,
        "Prepay home loan vs invest in equity SIP: what's better?",
        "How do 80C & 24(b) tax deductions work on this loan?",
        "Should I choose a longer tenure or higher EMI?",
      ]
    }

    if (pageContext.page === "mutual-funds" && pageContext.funds && pageContext.funds.length > 0) {
      const firstFund = pageContext.funds[0]
      return [
        `Explain the risk and category of ${firstFund.scheme_name}`,
        "What is the difference between Direct and Regular plans?",
        "Explain XIRR vs CAGR with an example",
        "How are equity mutual funds taxed in India (LTCG / STCG)?",
      ]
    }

    return [
      "Should I prepay my home loan or invest in SIP?",
      "What is XIRR vs CAGR in mutual funds?",
      "How to claim maximum tax deductions on a home loan?",
      "How does SIP compounding work over 10 years?",
    ]
  }, [pageContext])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `### 🔄 Chat Reset

I am Kuber, ready to help you again! Ask any doubts on your current loans or mutual funds.`,
        timestamp: "Just now",
      },
    ])
  }

  // Active context pill label
  const contextPill = React.useMemo(() => {
    if (pageContext.page === "home-loan" && pageContext.loan) {
      const { principal, annualRate, tenureYears } = pageContext.loan
      return {
        icon: <Home className="size-3 text-orange-500" />,
        label: `Loan: ₹${(principal / 100000).toFixed(0)}L @ ${annualRate}% (${tenureYears}y)`,
      }
    }
    if (pageContext.page === "mutual-funds" && pageContext.funds && pageContext.funds.length > 0) {
      return {
        icon: <TrendingUp className="size-3 text-emerald-500" />,
        label: `Funds: ${pageContext.funds.length} selected`,
      }
    }
    return {
      icon: <Sparkles className="size-3 text-primary" />,
      label: pageContext.page === "home-loan" ? "Home Loan Mode" : "Mutual Funds Mode",
    }
  }, [pageContext])

  return (
    <>
      {/* 1. Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Open Kuber AI Assistant"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 group flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-tr from-primary via-indigo-600 to-violet-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="size-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-ping" />
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-bold tracking-tight leading-none flex items-center gap-1">
              Ask Kuber <span className="text-[10px] font-medium bg-white/20 px-1.5 py-0.2 rounded-full">AI</span>
            </span>
            <span className="text-[10px] text-white/80 leading-tight hidden sm:inline">
              Wealth & Loan Advisor
            </span>
          </div>
        </button>
      )}

      {/* 2. Floating AI Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Kuber Financial Copilot"
          className="fixed bottom-20 md:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[430px] h-[580px] max-h-[85vh] rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-muted/40 border-b border-border/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-gradient-to-tr from-primary via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="size-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-foreground tracking-tight">Kuber</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    AI Advisor
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {contextPill.icon}
                  <span className="font-medium truncate max-w-[190px]">{contextPill.label}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronDown className="size-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-thin">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant"

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                      <Bot className="size-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                      isAssistant
                        ? "bg-muted/70 text-foreground border border-border/60"
                        : "bg-primary text-primary-foreground font-medium"
                    }`}
                  >
                    {isAssistant ? (
                      <FormattedMessage content={message.content} />
                    ) : (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                    <span
                      className={`block text-[9px] mt-1.5 ${
                        isAssistant ? "text-muted-foreground text-left" : "text-primary-foreground/70 text-right"
                      }`}
                    >
                      {message.timestamp}
                    </span>
                  </div>

                  {!isAssistant && (
                    <div className="size-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-1">
                      <User className="size-3.5" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 justify-start">
                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="size-3.5" />
                </div>
                <div className="rounded-2xl px-3.5 py-2.5 bg-muted/70 border border-border/60 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-2 rounded-full bg-primary animate-bounce" />
                  <span className="text-[11px] text-muted-foreground ml-1.5">Kuber is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Suggestions */}
          <div className="px-3 py-2 bg-background/50 border-t border-border/40 shrink-0">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
              <Lightbulb className="size-3 text-amber-500" />
              <span className="font-semibold">Suggested Questions:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-muted/80 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/70 transition-colors cursor-pointer text-left disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-card border-t border-border/70 shrink-0">
            <div className="flex items-end gap-2 bg-muted/40 rounded-2xl border border-border/70 p-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your loan EMI, prepayment, or mutual funds..."
                className="flex-1 bg-transparent border-0 resize-none px-2 py-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-20"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                title="Send message"
                className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="size-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-1.5">
              💡 Kuber provides educational calculations, not SEBI-registered advice.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
