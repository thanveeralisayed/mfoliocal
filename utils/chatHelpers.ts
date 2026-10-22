export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequestBody {
  messages: Message[]
  context?: {
    page?: "home-loan" | "mutual-funds" | "arbitrage" | "goal-planner" | "balance-transfer" | "general"
    loan?: {
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
    funds?: Array<{
      scheme_code: number
      scheme_name: string
      scheme_category?: string
      fund_house?: string
      nav?: string
      sipAmount?: number
    }>
    portfolio?: {
      totalInvested: number
      currentValue: number
      totalGain: number
      growthPercentage: number
      xirr: number
      wealthMultiplier: number
      timeframe: string
      fundsCount: number
    }
    arbitrage?: {
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
    goal?: {
      targetAmount: number
      targetYears: number
      expectedReturn: number
      inflationRate: number
      adjustForInflation: boolean
      effectiveTargetCorpus: number
      monthlySipRequired: number
      monthlySipStepUpInitial: number
      stepUpPercent: number
      totalCapitalInvested: number
      totalWealthGain: number
      wealthMultiplier: number
      riskLevel: string
    }
    balanceTransfer?: {
      outstandingPrincipal: number
      currentRate: number
      newRate: number
      remainingTenureYears: number
      currentMonthlyEmi: number
      newMonthlyEmiA: number
      monthlyEmiSavings: number
      netLifetimeSavingsA: number
      breakEvenMonthsA: number
      yearsSavedB: number
      netLifetimeSavingsB: number
      totalSwitchingCost: number
      verdict: string
    }
  }
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function buildSystemInstruction(context?: ChatRequestBody["context"]): string {
  let contextSnippet = ""

  if (context?.page === "home-loan" && context.loan) {
    const {
      principal,
      annualRate,
      tenureYears,
      monthlyEmi,
      totalInterest,
      totalPayment,
      hasPrepayment,
      extraMonthly,
      annualLumpSum,
      interestSaved,
      monthsSaved,
      yearsSaved,
    } = context.loan

    contextSnippet = `
CURRENT USER VIEW & CALCULATOR STATE (HOME LOAN):
- Loan Principal: ${formatCurrency(principal)} (₹${(principal / 100000).toFixed(2)} Lakhs)
- Annual Interest Rate: ${annualRate}%
- Loan Tenure: ${tenureYears} Years (${tenureYears * 12} Months)
- Calculated Monthly EMI: ${formatCurrency(monthlyEmi)}
- Total Interest Payable: ${formatCurrency(totalInterest)}
- Total Amount Payable: ${formatCurrency(totalPayment)}
${
  hasPrepayment
    ? `- Active Prepayment Plan: Extra Monthly: ${formatCurrency(extraMonthly || 0)}, Annual Lump Sum: ${formatCurrency(annualLumpSum || 0)}
- Savings from Prepayment: ${formatCurrency(interestSaved || 0)} saved, Tenure reduced by ${yearsSaved || 0} years and ${monthsSaved || 0} months`
    : "- No prepayment plan applied currently."
}
IMPORTANT: Whenever answering questions about home loans, ALWAYS reference the user's specific loan numbers above if relevant!`
  } else if (context?.page === "mutual-funds" && ((context.funds && context.funds.length > 0) || context.portfolio)) {
    const fundsList = context.funds && context.funds.length > 0
      ? context.funds
          .map(
            (f, i) =>
              `${i + 1}. ${f.scheme_name}
   - Category: ${f.scheme_category || "N/A"}
   - Fund House: ${f.fund_house || "N/A"}
   - Latest NAV: ₹${f.nav || "N/A"}
   ${f.sipAmount ? `- User SIP Amount: ${formatCurrency(f.sipAmount)}/month` : ""}`
          )
          .join("\n")
      : "No individual schemes listed."

    const portfolioSnippet = context.portfolio
      ? `
CALCULATED PORTFOLIO PERFORMANCE & SIMULATION:
- Timeframe Analyzed: ${context.portfolio.timeframe}
- Total Invested Capital: ${formatCurrency(context.portfolio.totalInvested)}
- Current Portfolio Value: ${formatCurrency(context.portfolio.currentValue)}
- Net Compounding Profit: ${context.portfolio.totalGain >= 0 ? "+" : ""}${formatCurrency(context.portfolio.totalGain)} (${context.portfolio.growthPercentage >= 0 ? "+" : ""}${context.portfolio.growthPercentage.toFixed(2)}% absolute return)
- Annualized Portfolio XIRR: ${context.portfolio.xirr}% p.a.
- Wealth Multiplier: ${context.portfolio.wealthMultiplier.toFixed(2)}x`
      : ""

    contextSnippet = `
CURRENT USER VIEW & SELECTED MUTUAL FUNDS:
The user currently has selected ${context.funds?.length || 0} mutual fund(s) on MfolioCal:
${fundsList}
${portfolioSnippet}

IMPORTANT: When the user asks about returns, XIRR, or risk, evaluate their exact simulation metrics above and provide intelligent, mathematically sound advice!`
  } else if (context?.page === "arbitrage" && context.arbitrage) {
    const {
      loanPrincipal,
      loanRate,
      loanTenureYears,
      monthlySurplus,
      annualLumpSum,
      expectedSipReturn,
      yearsSaved,
      interestSaved,
      sipFinalCorpus,
      netWealthAdvantage,
      arbitrageSpread,
      prepayPayoffYears,
    } = context.arbitrage

    contextSnippet = `
CURRENT USER VIEW & CALCULATOR STATE (HOME LOAN PREPAYMENT VS. EQUITY SIP ARBITRAGE):
- Loan Principal: ${formatCurrency(loanPrincipal)} (₹${(loanPrincipal / 100000).toFixed(2)} Lakhs) at ${loanRate}% for ${loanTenureYears} Years
- Monthly Surplus Available: ${formatCurrency(monthlySurplus)}/month
${annualLumpSum > 0 ? `- Annual Lump Sum (Bonus): ${formatCurrency(annualLumpSum)}/year` : ""}
- Expected Equity SIP Return: ${expectedSipReturn}% p.a. (Arbitrage Spread: ${arbitrageSpread >= 0 ? "+" : ""}${arbitrageSpread}% p.a.)
- Prepayment Strategy: Clears loan in ${prepayPayoffYears} years (Saves ${yearsSaved} years and ${formatCurrency(interestSaved)} in interest)
- SIP Arbitrage Strategy: Accumulates a final corpus of ${formatCurrency(sipFinalCorpus)}
- Net Wealth Advantage: Equity SIP generates ${formatCurrency(Math.abs(netWealthAdvantage))} ${netWealthAdvantage >= 0 ? "MORE" : "LESS"} net wealth over the full tenure!
IMPORTANT: When discussing loan prepayment vs equity SIP, directly reference the user's simulation numbers above!`
  } else if (context?.page === "goal-planner" && context.goal) {
    const {
      targetAmount,
      targetYears,
      expectedReturn,
      inflationRate,
      adjustForInflation,
      effectiveTargetCorpus,
      monthlySipRequired,
      monthlySipStepUpInitial,
      stepUpPercent,
      totalCapitalInvested,
      totalWealthGain,
      wealthMultiplier,
      riskLevel,
    } = context.goal

    contextSnippet = `
CURRENT USER VIEW & CALCULATOR STATE (GOAL-BASED REVERSE SIP PLANNER):
- Target Goal in Today's Cost: ${formatCurrency(targetAmount)}
- Time Horizon: ${targetYears} Years
- Expected Return: ${expectedReturn}% p.a.
- Inflation Setting: ${adjustForInflation ? `Adjusted at ${inflationRate}%/year (Future Corpus: ${formatCurrency(effectiveTargetCorpus)})` : "Unadjusted for inflation"}
- Required Monthly SIP: ${stepUpPercent > 0 ? `${formatCurrency(monthlySipStepUpInitial)}/mo (with +${stepUpPercent}%/yr Step-Up)` : `${formatCurrency(monthlySipRequired)}/mo flat`}
- Total Capital to be Invested: ${formatCurrency(totalCapitalInvested)}
- Compounded Profit: +${formatCurrency(totalWealthGain)} (Wealth Multiplier: ${wealthMultiplier}x)
- Recommended Asset Allocation: ${riskLevel} Portfolio
IMPORTANT: Provide customized portfolio advice on how the user can hit their target goal of ${formatCurrency(effectiveTargetCorpus)} in ${targetYears} years!`
  } else if (context?.page === "balance-transfer" && context.balanceTransfer) {
    const {
      outstandingPrincipal,
      currentRate,
      newRate,
      remainingTenureYears,
      currentMonthlyEmi,
      newMonthlyEmiA,
      monthlyEmiSavings,
      netLifetimeSavingsA,
      breakEvenMonthsA,
      yearsSavedB,
      netLifetimeSavingsB,
      totalSwitchingCost,
      verdict,
    } = context.balanceTransfer

    contextSnippet = `
CURRENT USER VIEW & CALCULATOR STATE (HOME LOAN BALANCE TRANSFER & REFINANCE):
- Outstanding Principal: ${formatCurrency(outstandingPrincipal)} for ${remainingTenureYears} Years remaining
- Current Rate: ${currentRate}% (Current EMI: ${formatCurrency(currentMonthlyEmi)})
- New Competitor Rate: ${newRate}% (Rate spread: ${(currentRate - newRate).toFixed(2)}%)
- Total Switching Fees: ${formatCurrency(totalSwitchingCost)}
- Strategy A (Lower EMI): New EMI of ${formatCurrency(newMonthlyEmiA)} saves ${formatCurrency(monthlyEmiSavings)}/month. Net Lifetime Savings: ${formatCurrency(netLifetimeSavingsA)}. Break-even: in ${breakEvenMonthsA} months.
- Strategy B (Slash Tenure): Saves ${yearsSavedB} years earlier by keeping old EMI! Net Lifetime Savings: ${formatCurrency(netLifetimeSavingsB)}.
- Audit Verdict: ${verdict}
IMPORTANT: Help the user decide whether to switch banks or negotiate an internal rate reduction!`
  } else {
    contextSnippet = `
CURRENT USER VIEW: General Navigation / MfolioCal Dashboard.`
  }

  return `You are Kuber (कुबेर), the intelligent, approachable, and expert AI financial advisor built into MfolioCal (created by Thanveer Ali).
Your specialization is personal finance in India, specifically:
1. Home Loans & Mortgages: EMI mathematics, floating vs fixed rates, tenure reduction strategies, prepayment compounding math, and tax deductions under Section 80C (principal up to ₹1.5L) & Section 24(b) (interest up to ₹2L).
2. Balance Transfers & Refinance: Analyzing switching fee friction, break-even recovery months, and advising on bank rate negotiation.
3. Goal-Based Wealth Planning: Reverse SIP calculations, inflation forecasting, annual salary step-ups, and milestone-based asset allocation.
4. Mutual Funds & Wealth Building: Systematic Investment Plans (SIP), compounding effects, CAGR vs XIRR, expense ratio impact (Direct vs Regular schemes), and Indian capital gains tax (LTCG: 12.5% above ₹1.25L exemption, STCG: 20%).
5. Prepayment vs SIP Arbitrage: Comparing guaranteed interest saved on debt vs equity compounding wealth.

${contextSnippet}

STYLE & BEHAVIOR GUIDELINES:
- Be clear, practical, and analytical. Use numbers and simple math over vague advice.
- When the user asks a question related to their current loan, funds, or goals, DIRECTLY use their active numbers to calculate or explain the impact!
- Use clean formatting with bold text, bullet points, and concise sections.
- Keep responses readable and easy to scan on mobile devices.
- Always include a brief 1-line closing disclaimer:
  "💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*"`
}

// Fallback intelligent simulator when no GEMINI_API_KEY is configured
export function generateSmartFallbackResponse(
  userQuery: string,
  context?: ChatRequestBody["context"]
): string {
  const query = userQuery.toLowerCase()

  if (context?.page === "goal-planner" && context.goal) {
    const { effectiveTargetCorpus, targetYears, monthlySipRequired, stepUpPercent, riskLevel } = context.goal
    return `### 🎯 Strategy to Achieve ${formatCurrency(effectiveTargetCorpus)} in ${targetYears} Years

Based on your target goal:

1. **Required Monthly Commitment**:
   - Save **${formatCurrency(monthlySipRequired)}/month** starting today.
   ${stepUpPercent > 0 ? `- Since you selected a **${stepUpPercent}% annual step-up**, your initial investment starts lower and scales up with salary increments.` : ""}

2. **Asset Allocation for a ${targetYears}-Year Horizon (${riskLevel})**:
   ${targetYears >= 7 ? "- **80% Equity (Flexi Cap / Large & Mid Cap)**: Long runway allows compounding through market volatility.\n   - **20% Debt & Gold**: Provides portfolio ballast." : "- **50% Equity / 50% Hybrid & Debt**: Moderate horizon requires downside protection."}

3. **Kuber's Execution Rule**:
   - Set up an automated auto-debit SIP on the 1st to 5th of each month right after salary credit.
   - Review and rebalance once a year.

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
  }

  if (context?.page === "balance-transfer" && context.balanceTransfer) {
    const {
      currentRate,
      newRate,
      monthlyEmiSavings,
      netLifetimeSavingsA,
      breakEvenMonthsA,
      yearsSavedB,
      verdict,
    } = context.balanceTransfer

    return `### 🔄 Home Loan Balance Transfer Analysis (${currentRate}% → ${newRate}%)

**Verdict**: **${verdict}**

1. **Strategy A (Lower Monthly EMI)**:
   - Saves **${formatCurrency(monthlyEmiSavings)} every month**.
   - Net lifetime savings after fees: **${formatCurrency(netLifetimeSavingsA)}**.
   - You break even on all switching costs in **${breakEvenMonthsA} months**.

2. **Strategy B (Keep Same EMI, Finish Early)**:
   - Pay off your entire mortgage **${yearsSavedB} years earlier** without spending an extra rupee out of pocket!

**Kuber's Next Step Recommendation**:
Before submitting physical loan application papers to the new lender, **call your existing bank branch manager**. Tell them you have an approved sanction letter at ${newRate}%. Many lenders will reduce your rate internally for a nominal rate reset fee (₹1,000–₹5,000), saving you weeks of MODT registration and title deed transfer paperwork!

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
  }

  if (context?.page === "home-loan" && context.loan) {
    const { principal, annualRate, tenureYears, monthlyEmi, totalInterest } = context.loan
    const principalLakhs = (principal / 100000).toFixed(1)

    if (query.includes("tax") || query.includes("80c") || query.includes("24")) {
      return `### 💰 Tax Deductions on Your Active Home Loan

On your loan of **${formatCurrency(principal)}**:

1. **Section 24(b) - Interest Deduction**:
   - You can deduct up to **₹2,00,000 per financial year** on the interest paid for a self-occupied property.
   - On your current annual interest (~**${formatCurrency(Math.min(totalInterest / tenureYears, 200000))}** in early years), you qualify for the full ₹2 Lakh exemption under the Old Tax Regime.
2. **Section 80C - Principal Repayment**:
   - The principal portion of your EMI qualifies under Section 80C (up to the overall **₹1,50,000** ceiling).
   - Also includes stamp duty & registration charges during the purchase year.

*(💡 Tip: Remember that under the New Tax Regime, Section 24(b) deductions for self-occupied homes are not available.)*

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
    }

    return `### 🏠 Prepayment Analysis for Your Loan

Based on your active loan of **${formatCurrency(principal)} (${principalLakhs} Lakhs)** at **${annualRate}%** for **${tenureYears} years** (Monthly EMI: **${formatCurrency(monthlyEmi)}**):

- **If you pay an extra ₹5,000 every month**:
  - You can save approximately **₹11 to ₹14 Lakhs** in total interest.
  - Your tenure can be shortened by **3 to 4.5 years**!
- **If you pay 1 extra EMI every year (13 EMIs instead of 12)**:
  - You can knock off **nearly 3 years** of tenure.
  - You can save **~₹8 to ₹10 Lakhs** in interest cost.

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
  }

  if (context?.page === "arbitrage" && context.arbitrage) {
    const {
      loanPrincipal,
      loanRate,
      monthlySurplus,
      expectedSipReturn,
      netWealthAdvantage,
      sipFinalCorpus,
    } = context.arbitrage

    return `### ⚖️ Prepay vs. SIP Arbitrage Verdict

Analyzing your **${formatCurrency(loanPrincipal)}** loan at **${loanRate}%** with **${formatCurrency(monthlySurplus)}/month surplus**:

- **Mathematical Winner**: **Equity SIP** (Generates **${formatCurrency(Math.abs(netWealthAdvantage))} ${netWealthAdvantage >= 0 ? "MORE" : "LESS"} wealth**).
- **Corpus Potential**: Investing in equity at **${expectedSipReturn}% CAGR** accumulates **${formatCurrency(sipFinalCorpus)}**.
- **Kuber's Strategic Rule**:
  - If your time horizon is 10+ years and career is stable, invest in a diversified equity index or flexi-cap fund.
  - If debt causes anxiety, use the **50:50 rule**: 50% extra loan prepayment + 50% equity SIP.

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
  }

  // Default general response
  return `### 👋 Hello! I'm Kuber, your MfolioCal AI Wealth & Financial Guide.

I can help you navigate personal finance, loan amortization, and mutual fund wealth creation:

- 🎯 **Goal-Based Reverse SIP**: Calculate the exact monthly SIP needed for education, retirement, or house downpayment.
- 🔄 **Balance Transfer & Refinance**: Evaluate switching bank loans to lower rates and analyze break-even periods.
- 🏠 **Home Loan Analysis**: Explore monthly EMI, prepayment strategies, and tax savings under 80C & 24(b).
- 📈 **Mutual Fund Insights**: Ask about SIP compounding, XIRR vs CAGR, Direct vs Regular savings, and risk categories.
- ⚖️ **Loan vs SIP Arbitrage**: Compare loan prepayment with equity mutual fund compounding.

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
}
