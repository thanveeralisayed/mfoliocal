"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calculator,
  Home as HomeIcon,
  MessageSquare,
  Scale,
  Target,
  ArrowRightLeft,
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export default function Navbar() {
  const pathname = usePathname()

  const isArbitrage = pathname === "/prepay-vs-sip" || pathname === "/loan-vs-sip"
  const isGoal = pathname === "/goal-planner"
  const isTransfer = pathname === "/balance-transfer"

  return (
    <>
      {/* 1. Desktop & Mobile Top Floating Sticky App Bar */}
      <div className="sticky top-2.5 z-40 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300">
        <header className="w-full rounded-2xl border border-border/70 bg-card/85 backdrop-blur-xl shadow-xs px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between">
          {/* Left: Brand Logo & Icon */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
                M
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                  Mfolio<span className="text-primary font-black">Cal</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v2.0
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Segmented Calculator Switcher (Hidden on mobile) */}
          <nav
            aria-label="Calculators Switcher"
            className="hidden lg:flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 gap-1 shadow-2xs"
          >
            {/* SIP Calculator */}
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                pathname === "/"
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Calculator className={`size-3.5 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`} />
              <span>SIP</span>
            </Link>

            {/* Goal Planner */}
            <Link
              href="/goal-planner"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isGoal
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Target className={`size-3.5 ${isGoal ? "text-indigo-500" : "text-muted-foreground"}`} />
              <span>Goal Planner</span>
            </Link>

            {/* Home Loan EMI */}
            <Link
              href="/home-loan"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                pathname === "/home-loan"
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <HomeIcon className={`size-3.5 ${pathname === "/home-loan" ? "text-orange-500" : "text-muted-foreground"}`} />
              <span>Home Loan</span>
            </Link>

            {/* Balance Transfer */}
            <Link
              href="/balance-transfer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isTransfer
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <ArrowRightLeft className={`size-3.5 ${isTransfer ? "text-blue-500" : "text-muted-foreground"}`} />
              <span>Refinance</span>
            </Link>

            {/* Prepay vs SIP Arbitrage */}
            <Link
              href="/prepay-vs-sip"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isArbitrage
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Scale className={`size-3.5 ${isArbitrage ? "text-emerald-500" : "text-muted-foreground"}`} />
              <span>Prepay vs SIP</span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                HOT
              </span>
            </Link>
          </nav>

          {/* Right: Feedback Shortcut & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="#feedback-section"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <MessageSquare className="size-3.5 text-primary" />
              <span>Feedback</span>
            </Link>

            <ThemeToggle />
          </div>
        </header>
      </div>

      {/* 2. Mobile Floating Bottom Navigation Dock (Hidden on Desktop) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-3 inset-x-3 z-50 pointer-events-none"
      >
        <div className="pointer-events-auto max-w-md mx-auto rounded-2xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl p-1.5 flex items-center justify-around gap-1">
          {/* SIP Tab */}
          <Link
            href="/"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-medium transition-all duration-200 ${
              pathname === "/"
                ? "bg-primary/10 text-primary font-bold shadow-2xs border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Calculator className={`size-4 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-[9px] sm:text-[10px] mt-1">SIP</span>
          </Link>

          {/* Goal Tab */}
          <Link
            href="/goal-planner"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-medium transition-all duration-200 ${
              isGoal
                ? "bg-primary/10 text-primary font-bold shadow-2xs border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Target className={`size-4 ${isGoal ? "text-indigo-500" : "text-muted-foreground"}`} />
            <span className="text-[9px] sm:text-[10px] mt-1">Goal</span>
          </Link>

          {/* Home Loan Tab */}
          <Link
            href="/home-loan"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-medium transition-all duration-200 ${
              pathname === "/home-loan"
                ? "bg-primary/10 text-primary font-bold shadow-2xs border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <HomeIcon className={`size-4 ${pathname === "/home-loan" ? "text-orange-500" : "text-muted-foreground"}`} />
            <span className="text-[9px] sm:text-[10px] mt-1">Loan</span>
          </Link>

          {/* Refinance Tab */}
          <Link
            href="/balance-transfer"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-medium transition-all duration-200 ${
              isTransfer
                ? "bg-primary/10 text-primary font-bold shadow-2xs border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <ArrowRightLeft className={`size-4 ${isTransfer ? "text-blue-500" : "text-muted-foreground"}`} />
            <span className="text-[9px] sm:text-[10px] mt-1">Switch</span>
          </Link>

          {/* Arbitrage Tab */}
          <Link
            href="/prepay-vs-sip"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-medium transition-all duration-200 relative ${
              isArbitrage
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs border border-emerald-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Scale className={`size-4 ${isArbitrage ? "text-emerald-500" : "text-muted-foreground"}`} />
            <span className="text-[9px] sm:text-[10px] mt-1">Prepay/SIP</span>
          </Link>
        </div>
      </nav>
    </>
  )
}