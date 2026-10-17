import { NextRequest, NextResponse } from "next/server"
import { Schemes } from "@/models/scheme"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ schemes: [] })
  }

  try {
    const url = `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache search queries for 1 hour
    })

    if (!res.ok) {
      return NextResponse.json({ schemes: [] })
    }

    const data: Schemes[] = await res.json()

    // Sort to prioritize "Direct Plan" and "Growth" options
    const sorted = [...data].sort((a, b) => {
      const aName = (a.schemeName || "").toLowerCase()
      const bName = (b.schemeName || "").toLowerCase()

      const aIsDirectGrowth = aName.includes("direct") && aName.includes("growth")
      const bIsDirectGrowth = bName.includes("direct") && bName.includes("growth")

      if (aIsDirectGrowth && !bIsDirectGrowth) return -1
      if (!aIsDirectGrowth && bIsDirectGrowth) return 1

      const aIsDirect = aName.includes("direct")
      const bIsDirect = bName.includes("direct")

      if (aIsDirect && !bIsDirect) return -1
      if (!aIsDirect && bIsDirect) return 1

      return 0
    })

    // Return top 20 relevant schemes
    return NextResponse.json({
      schemes: sorted.slice(0, 20),
    })
  } catch (error) {
    console.error("Fund search error:", error)
    return NextResponse.json({ schemes: [] }, { status: 500 })
  }
}
