"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

export interface LoanContextData {
  principal: number
  annualRate: number
  tenureYears: number
  monthlyEmi: number
  totalInterest: number
  totalPayment: number
  hasPrepayment?: boolean
  extraMonthly?: number
  annualLumpSum?: number
  interestSaved?: number
  monthsSaved?: number
  yearsSaved?: number
}

export interface FundItemContext {
  scheme_code: number
  scheme_name: string
  scheme_category?: string
  fund_house?: string
  nav?: string
  sipAmount?: number
}

export interface PortfolioContextData {
  totalInvested: number
  currentValue: number
  totalGain: number
  growthPercentage: number
  xirr: number
  wealthMultiplier: number
  timeframe: string
  fundsCount: number
}

export interface AssistantContextPayload {
  page: "home-loan" | "mutual-funds" | "general"
  pathname: string
  loan?: LoanContextData
  funds?: FundItemContext[]
  portfolio?: PortfolioContextData
}

interface FinancialAssistantContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggleOpen: () => void
  pageContext: AssistantContextPayload
  updateLoanContext: (loan: LoanContextData) => void
  updateFundsContext: (funds: FundItemContext[]) => void
  updatePortfolioContext: (portfolio: PortfolioContextData) => void
  pendingPrompt: string | null
  askPrompt: (promptText: string) => void
  clearPendingPrompt: () => void
}

const FinancialAssistantContext = React.createContext<FinancialAssistantContextType | undefined>(undefined)

export function FinancialAssistantProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [pendingPrompt, setPendingPrompt] = React.useState<string | null>(null)

  const [loanContext, setLoanContext] = React.useState<LoanContextData | undefined>(undefined)
  const [fundsContext, setFundsContext] = React.useState<FundItemContext[] | undefined>(undefined)
  const [portfolioContext, setPortfolioContext] = React.useState<PortfolioContextData | undefined>(undefined)

  // Determine current page type
  const currentPageType = React.useMemo<"home-loan" | "mutual-funds" | "general">(() => {
    if (pathname.includes("/home-loan")) return "home-loan"
    if (pathname === "/") return "mutual-funds"
    return "general"
  }, [pathname])

  const pageContext = React.useMemo<AssistantContextPayload>(() => {
    return {
      page: currentPageType,
      pathname,
      loan: currentPageType === "home-loan" ? loanContext : undefined,
      funds: currentPageType === "mutual-funds" ? fundsContext : undefined,
      portfolio: currentPageType === "mutual-funds" ? portfolioContext : undefined,
    }
  }, [currentPageType, pathname, loanContext, fundsContext, portfolioContext])

  const updateLoanContext = React.useCallback((data: LoanContextData) => {
    setLoanContext(data)
  }, [])

  const updateFundsContext = React.useCallback((funds: FundItemContext[]) => {
    setFundsContext(funds)
  }, [])

  const updatePortfolioContext = React.useCallback((portfolio: PortfolioContextData) => {
    setPortfolioContext(portfolio)
  }, [])

  const toggleOpen = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const askPrompt = React.useCallback((promptText: string) => {
    setPendingPrompt(promptText)
    setIsOpen(true)
  }, [])

  const clearPendingPrompt = React.useCallback(() => {
    setPendingPrompt(null)
  }, [])

  return (
    <FinancialAssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        pageContext,
        updateLoanContext,
        updateFundsContext,
        updatePortfolioContext,
        pendingPrompt,
        askPrompt,
        clearPendingPrompt,
      }}
    >
      {children}
    </FinancialAssistantContext.Provider>
  )
}

export function useFinancialAssistant() {
  const context = React.useContext(FinancialAssistantContext)
  if (!context) {
    throw new Error("useFinancialAssistant must be used within a FinancialAssistantProvider")
  }
  return context
}
