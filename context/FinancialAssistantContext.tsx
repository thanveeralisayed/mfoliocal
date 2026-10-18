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

export interface ArbitrageContextData {
  loanPrincipal: number
  loanRate: number
  loanTenureYears: number
  monthlySurplus: number
  annualLumpSum: number
  expectedSipReturn: number
  yearsSaved: number
  interestSaved: number
  sipFinalCorpus: number
  netWealthAdvantage: number
  arbitrageSpread: number
  prepayPayoffYears: number
}

export interface AssistantContextPayload {
  page: "home-loan" | "mutual-funds" | "arbitrage" | "general"
  pathname: string
  loan?: LoanContextData
  funds?: FundItemContext[]
  portfolio?: PortfolioContextData
  arbitrage?: ArbitrageContextData
}

interface FinancialAssistantContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggleOpen: () => void
  pageContext: AssistantContextPayload
  updateLoanContext: (loan: LoanContextData) => void
  updateFundsContext: (funds: FundItemContext[]) => void
  updatePortfolioContext: (portfolio: PortfolioContextData) => void
  updateArbitrageContext: (arbitrage: ArbitrageContextData) => void
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
  const [arbitrageContext, setArbitrageContext] = React.useState<ArbitrageContextData | undefined>(undefined)

  // Determine current page type
  const currentPageType = React.useMemo<"home-loan" | "mutual-funds" | "arbitrage" | "general">(() => {
    if (pathname.includes("/prepay-vs-sip") || pathname.includes("/loan-vs-sip")) return "arbitrage"
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
      arbitrage: currentPageType === "arbitrage" ? arbitrageContext : undefined,
    }
  }, [currentPageType, pathname, loanContext, fundsContext, portfolioContext, arbitrageContext])

  const updateLoanContext = React.useCallback((data: LoanContextData) => {
    setLoanContext(data)
  }, [])

  const updateFundsContext = React.useCallback((funds: FundItemContext[]) => {
    setFundsContext(funds)
  }, [])

  const updatePortfolioContext = React.useCallback((portfolio: PortfolioContextData) => {
    setPortfolioContext(portfolio)
  }, [])

  const updateArbitrageContext = React.useCallback((arbitrage: ArbitrageContextData) => {
    setArbitrageContext(arbitrage)
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
        updateArbitrageContext,
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
