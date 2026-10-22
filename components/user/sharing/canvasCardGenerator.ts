/**
 * High-DPI Canvas 2D Visual Social Card Generator
 * Produces crisp 1200x675 (16:9) retina graphics for WhatsApp, LinkedIn, and social media sharing.
 */

export interface GoalCardData {
  targetAmount: number
  effectiveTargetCorpus: number
  targetYears: number
  monthlySip: number
  totalInvested: number
  wealthMultiplier: number
  riskLevel: string
  stepUpPercent: number
}

export interface BalanceTransferCardData {
  principal: number
  currentRate: number
  newRate: number
  remainingTenure: number
  monthlySavings: number
  netLifetimeSavings: number
  breakEvenMonths: number
  yearsSaved: number
  switchingCost: number
  verdict: string
}

export interface ArbitrageCardData {
  loanPrincipal: number
  loanRate: number
  monthlySurplus: number
  sipReturn: number
  netWealthAdvantage: number
  yearsSaved: number
  interestSaved: number
  sipFinalCorpus: number
}

export interface SipPortfolioCardData {
  totalInvested: number
  currentValue: number
  totalGain: number
  growthPercentage: number
  wealthMultiplier: number
  xirr?: number
  timeframe: string
  fundCount: number
}

export interface LoanSavingsCardData {
  principal: number
  annualRate: number
  tenureYears: number
  monthlyEmi: number
  interestSaved: number
  yearsSaved: number
}

function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return "₹0"
  const abs = Math.abs(val)
  const sign = val < 0 ? "-" : ""
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} Lakhs`
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`
  }
  return `${sign}₹${Math.round(abs)}`
}

/**
 * Base canvas setup with background, branding, and decorative elements
 */
function createBaseCanvas(titleTag: string): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
} {
  const width = 1200
  const height = 675
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  // Deep background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, "#0b0f19")
  bgGrad.addColorStop(0.5, "#111827")
  bgGrad.addColorStop(1, "#1e1b4b")
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Decorative ambient glow circles
  const glow1 = ctx.createRadialGradient(1000, 100, 10, 1000, 100, 350)
  glow1.addColorStop(0, "rgba(99, 102, 241, 0.25)")
  glow1.addColorStop(1, "rgba(99, 102, 241, 0.0)")
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, width, height)

  const glow2 = ctx.createRadialGradient(200, 550, 10, 200, 550, 400)
  glow2.addColorStop(0, "rgba(16, 185, 129, 0.2)")
  glow2.addColorStop(1, "rgba(16, 185, 129, 0.0)")
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, width, height)

  // Outer framing card
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"
  ctx.lineWidth = 1.5
  roundRect(ctx, 30, 30, width - 60, height - 60, 24)
  ctx.stroke()

  // Logo Icon
  const logoGrad = ctx.createLinearGradient(60, 60, 110, 110)
  logoGrad.addColorStop(0, "#6366f1")
  logoGrad.addColorStop(0.5, "#4f46e5")
  logoGrad.addColorStop(1, "#7c3aed")
  ctx.fillStyle = logoGrad
  roundRect(ctx, 60, 60, 50, 50, 14)
  ctx.fill()

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 26px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("M", 85, 86)

  // Brand Name
  ctx.textAlign = "left"
  ctx.font = "bold 28px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.fillText("Mfolio", 125, 82)
  ctx.fillStyle = "#6366f1"
  ctx.fillText("Cal", 215, 82)

  // Tag Badge
  ctx.font = "bold 13px sans-serif"
  ctx.fillStyle = "rgba(99, 102, 241, 0.2)"
  roundRect(ctx, 275, 68, 175, 28, 14)
  ctx.fill()
  ctx.strokeStyle = "rgba(99, 102, 241, 0.4)"
  ctx.stroke()
  ctx.fillStyle = "#a5b4fc"
  ctx.textAlign = "center"
  ctx.fillText(titleTag.toUpperCase(), 362, 85)

  // Top right URL
  ctx.textAlign = "right"
  ctx.font = "bold 15px monospace"
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
  ctx.fillText("mfoliocal.com", width - 65, 85)

  // Bottom Footer
  ctx.textAlign = "left"
  ctx.font = "14px sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)"
  ctx.fillText("Simulated with real financial mathematics on MfolioCal", 65, height - 60)

  ctx.textAlign = "right"
  ctx.font = "bold 14px sans-serif"
  ctx.fillStyle = "#10b981"
  ctx.fillText("Free Financial Decision Engine", width - 65, height - 60)

  return { canvas, ctx, width, height }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 1. Goal-Based Reverse SIP Card Generator
 */
export function generateGoalShareCard(data: GoalCardData): string {
  const { canvas, ctx, width } = createBaseCanvas("Goal-Based SIP")

  // Hero Card Container
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)"
  roundRect(ctx, 60, 130, width - 120, 240, 20)
  ctx.fill()
  ctx.strokeStyle = "rgba(99, 102, 241, 0.3)"
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Target subtitle
  ctx.textAlign = "left"
  ctx.font = "bold 18px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText(
    `ROADMAP FOR ${formatINR(data.effectiveTargetCorpus).toUpperCase()} IN ${data.targetYears} YEARS`,
    95,
    175
  )

  // Primary Highlight
  ctx.font = "bold 16px sans-serif"
  ctx.fillStyle = "#a5b4fc"
  ctx.fillText("REQUIRED MONTHLY SIP", 95, 220)

  ctx.font = "900 58px monospace"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(formatINR(data.monthlySip), 95, 285)

  if (data.stepUpPercent > 0) {
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#10b981"
    ctx.fillText(`(+${data.stepUpPercent}% Annual Salary Step-Up)`, 95, 330)
  } else {
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#94a3b8"
    ctx.fillText("(Fixed Flat Monthly SIP)", 95, 330)
  }

  // Right side multiplier trophy badge
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)"
  roundRect(ctx, width - 360, 160, 240, 170, 18)
  ctx.fill()
  ctx.strokeStyle = "rgba(16, 185, 129, 0.35)"
  ctx.stroke()

  ctx.textAlign = "center"
  ctx.font = "bold 14px sans-serif"
  ctx.fillStyle = "#34d399"
  ctx.fillText("WEALTH MULTIPLIER", width - 240, 205)

  ctx.font = "900 48px monospace"
  ctx.fillStyle = "#10b981"
  ctx.fillText(`${data.wealthMultiplier}x`, width - 240, 265)

  ctx.font = "bold 13px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText(data.riskLevel.toUpperCase(), width - 240, 305)

  // 3 Bottom Metric Tiles
  const tileY = 400
  const tileW = (width - 120 - 40) / 3
  const tileH = 150

  // Tile 1: Target Corpus
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
  roundRect(ctx, 60, tileY, tileW, tileH, 16)
  ctx.fill()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.stroke()

  ctx.textAlign = "left"
  ctx.font = "14px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText("Target Maturity Corpus", 85, tileY + 40)
  ctx.font = "bold 28px monospace"
  ctx.fillStyle = "#f59e0b"
  ctx.fillText(formatINR(data.effectiveTargetCorpus), 85, tileY + 85)
  ctx.font = "12px sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.fillText(`Target Horizon: ${data.targetYears} Years`, 85, tileY + 120)

  // Tile 2: Total Invested
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
  roundRect(ctx, 60 + tileW + 20, tileY, tileW, tileH, 16)
  ctx.fill()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.stroke()

  ctx.fillText("Your Total Capital", 85 + tileW + 20, tileY + 40)
  ctx.font = "bold 28px monospace"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(formatINR(data.totalInvested), 85 + tileW + 20, tileY + 85)
  ctx.font = "12px sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.fillText("Cumulative SIP Payments", 85 + tileW + 20, tileY + 120)

  // Tile 3: Free Compounding Gain
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
  roundRect(ctx, 60 + (tileW + 20) * 2, tileY, tileW, tileH, 16)
  ctx.fill()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.stroke()

  ctx.fillText("Free Compounding Gain", 85 + (tileW + 20) * 2, tileY + 40)
  ctx.font = "bold 28px monospace"
  ctx.fillStyle = "#10b981"
  ctx.fillText(`+${formatINR(data.effectiveTargetCorpus - data.totalInvested)}`, 85 + (tileW + 20) * 2, tileY + 85)
  ctx.font = "12px sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.fillText("Generated from Market Growth", 85 + (tileW + 20) * 2, tileY + 120)

  return canvas.toDataURL("image/png")
}

/**
 * 2. Balance Transfer & Refinance Card Generator
 */
export function generateBalanceTransferShareCard(data: BalanceTransferCardData): string {
  const { canvas, ctx, width } = createBaseCanvas("Refinance ROI")

  // Hero Card Container
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)"
  roundRect(ctx, 60, 130, width - 120, 240, 20)
  ctx.fill()
  ctx.strokeStyle = "rgba(16, 185, 129, 0.3)"
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.textAlign = "left"
  ctx.font = "bold 18px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText(
    `BALANCE TRANSFER AUDIT: ${data.currentRate}% → ${data.newRate}% (${data.remainingTenure}Y REMAINING)`,
    95,
    175
  )

  ctx.font = "bold 16px sans-serif"
  ctx.fillStyle = "#34d399"
  ctx.fillText("NET LIFETIME INTEREST SAVINGS", 95, 220)

  ctx.font = "900 58px monospace"
  ctx.fillStyle = "#10b981"
  ctx.fillText(formatINR(data.netLifetimeSavings), 95, 285)

  ctx.font = "bold 16px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(`Break-Even: In ${data.breakEvenMonths} Months • Save ${data.yearsSaved} Years Early`, 95, 330)

  // Right side verdict box
  ctx.fillStyle = "rgba(99, 102, 241, 0.15)"
  roundRect(ctx, width - 360, 160, 240, 170, 18)
  ctx.fill()
  ctx.strokeStyle = "rgba(99, 102, 241, 0.35)"
  ctx.stroke()

  ctx.textAlign = "center"
  ctx.font = "bold 14px sans-serif"
  ctx.fillStyle = "#a5b4fc"
  ctx.fillText("AUDIT VERDICT", width - 240, 205)

  ctx.font = "bold 20px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(data.verdict === "Strongly Recommended" ? "SWITCH NOW" : "NEGOTIATE", width - 240, 255)

  ctx.font = "12px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText(`Fees: ${formatINR(data.switchingCost)}`, width - 240, 295)

  // 3 Bottom Metric Tiles
  const tileY = 400
  const tileW = (width - 120 - 40) / 3
  const tileH = 150

  // Tile 1: Monthly Cash Saved
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
  roundRect(ctx, 60, tileY, tileW, tileH, 16)
  ctx.fill()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.stroke()

  ctx.textAlign = "left"
  ctx.font = "14px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText("Monthly Cashflow Freed", 85, tileY + 40)
  ctx.font = "bold 28px monospace"
  ctx.fillStyle = "#10b981"
  ctx.fillText(`+${formatINR(data.monthlySavings)}/mo`, 85, tileY + 85)
  ctx.font = "12px sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.fillText("Immediate monthly relief", 85, tileY + 120)

  // Tile 2: Loan Principal
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
  roundRect(ctx, 60 + tileW + 20, tileY, tileW, tileH, 16)
  ctx.fill()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.stroke()

  ctx.fillText("Outstanding Principal", 85 + tileW + 20, tileY + 40)
  ctx.font = "bold 28px monospace"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(formatINR(data.principal), 85 + tileW + 20, tileY + 85)
  ctx.font = "12px sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.fillText(`Tenure: ${data.remainingTenure} Years`, 85 + tileW + 20, tileY + 120)

  // Tile 3: Debt-Free Sooner
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
  roundRect(ctx, 60 + (tileW + 20) * 2, tileY, tileW, tileH, 16)
  ctx.fill()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.stroke()

  ctx.fillText("Time Saved (Strategy B)", 85 + (tileW + 20) * 2, tileY + 40)
  ctx.font = "bold 28px monospace"
  ctx.fillStyle = "#6366f1"
  ctx.fillText(`${data.yearsSaved} Years Earlier`, 85 + (tileW + 20) * 2, tileY + 85)
  ctx.font = "12px sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.fillText("By maintaining your old EMI", 85 + (tileW + 20) * 2, tileY + 120)

  return canvas.toDataURL("image/png")
}

/**
 * 3. Prepay vs SIP Arbitrage Card Generator
 */
export function generateArbitrageShareCard(data: ArbitrageCardData): string {
  const { canvas, ctx, width } = createBaseCanvas("Arbitrage Engine")

  // Hero Card Container
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)"
  roundRect(ctx, 60, 130, width - 120, 240, 20)
  ctx.fill()
  ctx.strokeStyle = "rgba(99, 102, 241, 0.3)"
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.textAlign = "left"
  ctx.font = "bold 18px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText(`HOME LOAN (${data.loanRate}%) VS. EQUITY SIP (${data.sipReturn}%)`, 95, 175)

  ctx.font = "bold 16px sans-serif"
  ctx.fillStyle = "#34d399"
  ctx.fillText("EQUITY SIP WEALTH ADVANTAGE", 95, 220)

  ctx.font = "900 58px monospace"
  ctx.fillStyle = data.netWealthAdvantage >= 0 ? "#10b981" : "#f59e0b"
  ctx.fillText(`+${formatINR(Math.abs(data.netWealthAdvantage))}`, 95, 285)

  ctx.font = "bold 16px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(
    `Surplus: ${formatINR(data.monthlySurplus)}/mo • Loan: ${formatINR(data.loanPrincipal)}`,
    95,
    330
  )

  // Right side trophy box
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)"
  roundRect(ctx, width - 360, 160, 240, 170, 18)
  ctx.fill()
  ctx.strokeStyle = "rgba(16, 185, 129, 0.35)"
  ctx.stroke()

  ctx.textAlign = "center"
  ctx.font = "bold 14px sans-serif"
  ctx.fillStyle = "#34d399"
  ctx.fillText("WINNING STRATEGY", width - 240, 205)

  ctx.font = "900 24px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(data.netWealthAdvantage >= 0 ? "EQUITY SIP" : "PREPAYMENT", width - 240, 255)

  ctx.font = "12px sans-serif"
  ctx.fillStyle = "#94a3b8"
  ctx.fillText("Mathematically Superior", width - 240, 295)

  return canvas.toDataURL("image/png")
}
