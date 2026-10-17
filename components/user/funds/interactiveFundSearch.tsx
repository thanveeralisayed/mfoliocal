"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useQueryState } from "nuqs"
import { Search, Plus, Check, Loader2, X, Sparkles } from "lucide-react"
import { Schemes } from "@/models/scheme"

const POPULAR_FUNDS: { code: number; name: string; tag: string }[] = [
  {
    code: 122639,
    name: "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
    tag: "Flexi Cap",
  },
  {
    code: 118778,
    name: "Nippon India Small Cap Fund - Direct Plan - Growth Option",
    tag: "Small Cap",
  },
  {
    code: 120828,
    name: "Quant Small Cap Fund - Direct Plan - Growth Option",
    tag: "Small Cap",
  },
  {
    code: 118834,
    name: "Mirae Asset Large Cap Fund - Direct Plan - Growth",
    tag: "Large Cap",
  },
  {
    code: 119598,
    name: "SBI Bluechip Fund - Direct Plan - Growth",
    tag: "Large Cap",
  },
  {
    code: 119063,
    name: "HDFC Top 100 Fund - Direct Plan - Growth Option",
    tag: "Large Cap",
  },
]

export const InteractiveFundSearch: React.FC = () => {
  const [existingSchemes, setExistingSchemeCodes] = useQueryState("schemeCode", {
    shallow: false,
    scroll: false,
  })
  const [, setHistoryGet] = useQueryState("getselectedfundshistory", {
    shallow: false,
    scroll: false,
  })
  const [timeframe, setTimeframe] = useQueryState("timeframe", {
    shallow: false,
    scroll: false,
  })

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Schemes[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [lastAddedCode, setLastAddedCode] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedCodeList = (existingSchemes?.split(",") || [])
    .map((c) => c.trim())
    .filter((c) => c !== "")

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Debounced search query
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const controller = new AbortController()

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/funds/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setResults(data.schemes || [])
        }
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search fetch failed:", err)
        }
      } finally {
        setIsLoading(false)
      }
    }, 200)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const handleAddFund = useCallback(
    (schemeCode?: number) => {
      if (!schemeCode) return
      const codeStr = schemeCode.toString()
      const currentList = existingSchemes?.split(",").filter((c) => c.trim() !== "") || []

      if (!currentList.includes(codeStr)) {
        currentList.push(codeStr)
        setExistingSchemeCodes(currentList.join(","))
        setHistoryGet("false")
        if (!timeframe) {
          setTimeframe("3Y")
        }
        setLastAddedCode(schemeCode)
        setTimeout(() => setLastAddedCode(null), 1500)
      }
    },
    [existingSchemes, setExistingSchemeCodes, setHistoryGet, timeframe, setTimeframe]
  )

  const handleRemoveFund = useCallback(
    (schemeCode?: number) => {
      if (!schemeCode) return
      const codeStr = schemeCode.toString()
      const currentList = existingSchemes?.split(",").filter((c) => c.trim() !== "") || []
      const filtered = currentList.filter((c) => c !== codeStr)

      setExistingSchemeCodes(filtered.length > 0 ? filtered.join(",") : null)
      setHistoryGet("false")
    },
    [existingSchemes, setExistingSchemeCodes, setHistoryGet]
  )

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          {isLoading ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <Search className="size-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any Indian mutual fund (e.g., Parag Parikh, SBI Small Cap, HDFC Top 100)..."
          className="w-full h-13 pl-12 pr-12 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl text-foreground placeholder:text-muted-foreground/70 text-sm sm:text-base font-medium shadow-md focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary/80 transition-all duration-200"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Floating Interactive Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          {query.trim().length >= 2 ? (
            /* Search Results View */
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 p-1.5">
              {results.length > 0 ? (
                results.map((scheme) => {
                  const isSelected = scheme.schemeCode
                    ? selectedCodeList.includes(scheme.schemeCode.toString())
                    : false
                  const isJustAdded = lastAddedCode === scheme.schemeCode

                  return (
                    <div
                      key={scheme.schemeCode}
                      onClick={() => !isSelected && handleAddFund(scheme.schemeCode)}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-xs sm:text-sm gap-3 ${
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/70 active:scale-[0.99]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground tracking-tight leading-snug truncate group-hover:text-primary transition-colors">
                          {scheme.schemeName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span className="font-mono">Code: {scheme.schemeCode}</span>
                          {scheme.schemeName?.toLowerCase().includes("direct") && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-semibold">
                              Direct
                            </span>
                          )}
                          {scheme.schemeName?.toLowerCase().includes("growth") && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                              Growth
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isSelected ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveFund(scheme.schemeCode)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer group/btn"
                          >
                            <Check className="size-3.5 group-hover/btn:hidden" />
                            <span className="group-hover/btn:hidden">Added</span>
                            <X className="size-3.5 hidden group-hover/btn:inline" />
                            <span className="hidden group-hover/btn:inline">Remove</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddFund(scheme.schemeCode)
                            }}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                              isJustAdded
                                ? "bg-emerald-500 text-white"
                                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="size-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="size-3.5" />
                                <span>Add to SIP</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  {isLoading ? "Searching schemes..." : `No mutual funds found matching "${query}"`}
                </div>
              )}
            </div>
          ) : (
            /* Popular / Benchmark Schemes Drawer (Shown when query is empty) */
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between px-2 pt-1 pb-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  Popular & Benchmark Schemes
                </span>
                <span className="text-[10px] font-normal lowercase text-muted-foreground/80">click to add</span>
              </div>

              <div className="max-h-[340px] overflow-y-auto space-y-1">
                {POPULAR_FUNDS.map((fund) => {
                  const isSelected = selectedCodeList.includes(fund.code.toString())
                  return (
                    <div
                      key={fund.code}
                      onClick={() => !isSelected && handleAddFund(fund.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm gap-3 ${
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/70 active:scale-[0.99]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground tracking-tight truncate">
                          {fund.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          <span className="font-mono">Code: {fund.code}</span>
                          <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold">
                            {fund.tag}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <Check className="size-3.5" /> Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddFund(fund.code)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                          >
                            <Plus className="size-3.5" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
