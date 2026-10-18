import { NextResponse } from "next/server"
import {
  buildSystemInstruction,
  generateSmartFallbackResponse,
  ChatRequestBody,
} from "@/utils/chatHelpers.ts"

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody = await req.json()
    const { messages, context } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const latestUserMessage = messages[messages.length - 1]?.content || ""

    // If no API key is provided, use intelligent context-aware simulator
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      const simulatedReply = generateSmartFallbackResponse(latestUserMessage, context)
      return NextResponse.json({ reply: simulatedReply, isSimulated: true })
    }

    // Prepare Gemini payload
    const systemInstruction = buildSystemInstruction(context)

    // Map chat history for Gemini contents
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    // Try modern models with fallback
    const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    let lastError: unknown = null

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 1200,
            },
          }),
        })

        if (!response.ok) {
          const errData = await response.text()
          console.warn(`Gemini API error with model ${model}:`, response.status, errData)
          lastError = new Error(`Status ${response.status}: ${errData}`)
          continue // Try next model
        }

        const data = await response.json()
        const replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I analyzed your request, but could not generate a textual reply. Please try again."

        return NextResponse.json({ reply: replyText, model })
      } catch (err) {
        lastError = err
        console.warn(`Exception calling Gemini with ${model}:`, err)
      }
    }

    // If all models failed (e.g. invalid key or network issue), fallback gracefully
    console.error("All Gemini models failed, falling back to smart simulator:", lastError)
    const fallback = generateSmartFallbackResponse(latestUserMessage, context)
    return NextResponse.json({
      reply: fallback,
      isSimulated: true,
      errorNotice: "AI service call encountered an issue. Displaying smart local analysis.",
    })
  } catch (error) {
    console.error("Error in /api/chat route:", error)
    return NextResponse.json(
      { error: "Internal server error processing chat request." },
      { status: 500 }
    )
  }
}
