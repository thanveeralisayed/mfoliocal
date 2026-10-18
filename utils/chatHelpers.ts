export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequestBody {
  messages: Message[]
  context?: {
    page?: "home-loan" | "mutual-funds" | "arbitrage" | "general"
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
  }
}

export function formatCurrency(amount: number): string {
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
  } else {
    contextSnippet = `
CURRENT USER VIEW: General Navigation / MfolioCal Dashboard.`
  }

  return `You are Kuber (कुबेर), the intelligent, approachable, and expert AI financial advisor built into MfolioCal (created by Thanveer Ali).
Your specialization is personal finance in India, specifically:
1. Home Loans & Mortgages: EMI mathematics, floating vs fixed rates, tenure reduction strategies, prepayment compounding math, and tax deductions under Section 80C (principal up to ₹1.5L) & Section 24(b) (interest up to ₹2L).
2. Mutual Funds & Wealth Building: Systematic Investment Plans (SIP), compounding effects, CAGR vs XIRR, expense ratio impact (Direct vs Regular schemes), asset allocation, and fund categories (Flexi Cap, Large Cap, Mid Cap, Small Cap, Hybrid, Debt/Liquid). Also cover Indian capital gains tax (LTCG: 12.5% above ₹1.25L exemption, STCG: 20%).
3. The Classic Dilemma (Loan Prepayment vs SIP Arbitrage): Providing mathematical comparisons of prepaying an 8.5%-9% loan vs investing surplus in an equity fund generating 12%-14% long-term returns.

${contextSnippet}

STYLE & BEHAVIOR GUIDELINES:
- Be clear, practical, and analytical. Use numbers and simple math over vague advice.
- When the user asks a question related to their current loan or funds, DIRECTLY use their active numbers to calculate or explain the impact!
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

    if (query.includes("prepay") || query.includes("extra") || query.includes("part-payment") || query.includes("foreclos")) {
      return `### 🏠 Prepayment Analysis for Your Loan

Based on your active loan of **${formatCurrency(principal)} (${principalLakhs} Lakhs)** at **${annualRate}%** for **${tenureYears} years** (Monthly EMI: **${formatCurrency(monthlyEmi)}**):

- **If you pay an extra ₹5,000 every month**:
  - You can save approximately **₹11 to ₹14 Lakhs** in total interest.
  - Your tenure can be shortened by **3 to 4.5 years**!
- **If you pay 1 extra EMI every year (13 EMIs instead of 12)**:
  - You can knock off **nearly 3 years** of tenure.
  - You can save **~₹8 to ₹10 Lakhs** in interest cost.

**Key Rule of Home Loans**: Because EMIs in the early years are predominantly interest, any prepayment made in the first 5-7 years has a compounding multiplier effect on interest savings.

*(💡 Tip: Ask Kuber follow-up questions to explore custom prepayment or EMI scenarios.)*

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
    }

    if (query.includes("sip") || query.includes("invest") || query.includes("arbitrage")) {
      return `### ⚖️ Home Loan Prepayment vs. Equity SIP

Here is the financial breakdown for your **${annualRate}%** loan:

- **Home Loan Prepayment**: Gives a **guaranteed, tax-free return of ${annualRate}%** (the interest saved).
- **Equity Mutual Fund SIP**: Historically delivers **12% - 14% CAGR** over a 10+ year horizon.
- **The Spread (Arbitrage)**: That is a ~**3.5% to 5.5% annual return advantage** in favour of equity investing.

**The Hybrid Strategy (Best of both worlds)**:
1. If your risk tolerance is conservative: Prepay 5%-10% extra each year to achieve debt freedom early.
2. If your horizon is 10+ years: Maintain your standard EMI of **${formatCurrency(monthlyEmi)}** and channel any surplus bonus/savings into an Index or Flexi-Cap SIP!

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
    }
  }

  if (context?.page === "arbitrage" && context.arbitrage) {
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

    const advFormatted = formatCurrency(Math.abs(netWealthAdvantage))
    const winnerText = netWealthAdvantage >= 0 ? "Equity SIP Arbitrage" : "Loan Prepayment"
    const bonusText = annualLumpSum > 0 ? ` + ${formatCurrency(annualLumpSum)} annual bonus` : ""

    return `### ⚖️ Kuber's Arbitrage Verdict: ${winnerText} Leads

Here is the exact financial breakdown for your **${formatCurrency(loanPrincipal)}** loan at **${loanRate}%** with **${formatCurrency(monthlySurplus)}/month surplus${bonusText}**:

1. **Option A: Prepay Loan Aggressively**
   - **Debt Freedom**: You become 100% debt-free in **${prepayPayoffYears} years** (knocking off **${yearsSaved} years**).
   - **Guaranteed Interest Saved**: **${formatCurrency(interestSaved)}**.
   - **Psychological Value**: 0 debt stress, guaranteed risk-free return equal to your loan rate of **${loanRate}%**.

2. **Option B: Invest Surplus in Equity SIP (${expectedSipReturn}% CAGR)**
   - **Final SIP Corpus**: **${formatCurrency(sipFinalCorpus)}** accumulated over ${loanTenureYears} years.
   - **The Arbitrage Spread**: **+${arbitrageSpread}% p.a.** over your loan interest rate.
   - **Net Wealth Advantage**: Equity SIP produces **${advFormatted} MORE net wealth** than prepaying!

**Kuber's Strategic Recommendation**:
- **If your horizon is 10+ years & job is stable**: Keep paying standard EMI and channel your **${formatCurrency(monthlySurplus)}** into a disciplined Index or Flexi-Cap fund.
- **If debt causes high anxiety**: Follow the **50:50 Hybrid Rule** — allocate 50% to prepayment and 50% to equity SIP.

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
  }

  if (context?.page === "mutual-funds" && context.funds && context.funds.length > 0) {
    const firstFund = context.funds[0]
    return `### 📈 Analysis for ${firstFund.scheme_name}

- **Fund Category**: **${firstFund.scheme_category || "Equity Mutual Fund"}**
- **Fund House**: **${firstFund.fund_house || "Indian Asset Management Company"}**
- **Current NAV**: **₹${firstFund.nav || "Latest"}**

**Category & Risk Overview**:
- **Risk Level**: High to Very High (Standard for Equity/Growth funds). Ideal investment horizon is **5+ years**.
- **Compounding Potential**: Suitable for long-term wealth creation via monthly SIP. Short-term volatility (1-2 years) is normal.
- **Direct Plan Advantage**: Since this is a Direct Growth plan, there is **0% distributor commission**, giving you **0.5% - 1.2% higher annual returns** than a Regular plan over 15-20 years!

*(💡 Tip: Ask Kuber to compare this fund with other categories or evaluate your portfolio diversification.)*

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
  }

  // Default general response
  return `### 👋 Hello! I'm Kuber, your MfolioCal AI Wealth & Financial Guide.

I can help you navigate personal finance, loan amortization, and mutual fund wealth creation:

- 🏠 **Home Loan Analysis**: Ask about your monthly EMI, prepayment strategies, interest vs principal breakdown, and tax savings under 80C & 24(b).
- 📈 **Mutual Fund Insights**: Ask about SIP compounding, XIRR vs CAGR, Direct vs Regular savings, and risk categories (Flexi Cap, Small Cap, etc.).
- ⚖️ **Loan vs SIP**: Find out whether prepaying your home loan or investing in an equity SIP is mathematically superior for your goals.

*(💡 Tip: Try clicking any suggested question below or ask any custom doubt.)*

💡 *Kuber provides educational insights and scenario calculations, not certified SEBI financial advice.*`
}
