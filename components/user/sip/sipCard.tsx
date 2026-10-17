import { Card } from "@/components/ui/card"
import { SearchParams } from "@/models/searchParams"
import { getSelectedFundsDataLatest } from "@/server/action"
import { SchemeLatest } from "@/models/SchemeLatest"
import RemoveSchemeButton from "./removeSchemeButton"
import SipAmountInput from "./sipAmount"
import CalculateButton from "./calculateButton"
import YearButton from "./yearButton"
import { FundContextTracker } from "@/components/user/chat/fundContextTracker"
import { AskKuberButton } from "@/components/user/chat/askKuberButton"
import { Layers, Calendar } from "lucide-react"

type SipCardProps = {
  searchParams: SearchParams
}

const SipCard = async ({ searchParams }: SipCardProps) => {
  const params = await searchParams
  const existingSchemeCodes =
    params.schemeCode
      ?.split(",")
      .filter((code) => code.trim() !== "")
      .map((code) => parseInt(code, 10)) || []
  const funds: SchemeLatest[] = (await getSelectedFundsDataLatest(existingSchemeCodes)) || []

  if (funds.length === 0) {
    return (
      <Card className="overflow-hidden border border-dashed border-border/80 bg-card/60 backdrop-blur-md p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
            <Layers className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Your Portfolio is Empty</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Search any mutual fund scheme using the search bar above to add it to your calculation.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border border-border/80 bg-card/90 backdrop-blur-xl shadow-sm p-4 sm:p-5 space-y-5">
      <FundContextTracker funds={funds} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Selected Schemes ({funds.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure monthly SIP installments for each fund
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          {funds.length} Active {funds.length === 1 ? "Fund" : "Funds"}
        </span>
      </div>

      {/* Scheme Cards Grid */}
      <div className="space-y-3">
        {funds.map((fund) => {
          const latestNav = fund.data?.[0]?.nav
          return (
            <div
              key={fund.meta.scheme_code}
              className="relative rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/30 hover:border-primary/40 transition-all p-3.5 sm:p-4 space-y-3"
            >
              {/* Header with Title and Delete */}
              <div className="flex items-start justify-between gap-3 pr-7">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                    <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                      Code: {fund.meta.scheme_code}
                    </span>
                    {fund.meta.scheme_category && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-medium">
                        {fund.meta.scheme_category}
                      </span>
                    )}
                    {latestNav && (
                      <span className="font-medium text-foreground">
                        NAV: ₹{parseFloat(latestNav).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                    {fund.meta.scheme_name}
                  </h4>
                </div>

                <div className="absolute top-3 right-3">
                  <RemoveSchemeButton schemeCode={fund.meta.scheme_code} />
                </div>
              </div>

              {/* Monthly Amount Input */}
              <div className="pt-1">
                <SipAmountInput schemeCode={fund.meta.scheme_code} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Timeframe Selection */}
      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-semibold text-foreground uppercase tracking-wider text-[11px]">
            <Calendar className="size-3.5 text-primary" />
            Time Period (Years)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <YearButton label="6 Months" value="6M" />
          <YearButton label="1 Year" value="1Y" />
          <YearButton label="3 Years" value="3Y" />
          <YearButton label="5 Years" value="5Y" />
          <YearButton label="8 Years" value="8Y" />
          <YearButton label="10 Years" value="10Y" />
        </div>
      </div>

      {/* Actions Bar */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between flex-wrap gap-3">
        <CalculateButton />
        <AskKuberButton
          promptText={`Can you analyze the category, risk profile, and long-term compounding expectations for the selected fund(s): ${funds.map((f) => f.meta.scheme_name).join(", ")}?`}
          label="Ask Kuber About These Funds"
          variant="subtle"
        />
      </div>
    </Card>
  )
}

export default SipCard