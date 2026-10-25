import express from "express"
import rateLimit from "express-rate-limit"
import { AIConfigurationError, summarizeNote } from "./ai.js"

const MAX_TITLE_LENGTH = 200
const MAX_MARKDOWN_LENGTH = 40_000

export function createApp({
  summarize = summarizeNote,
  rateLimitLimit = 10,
  rateLimitWindowMs = 15 * 60 * 1000,
} = {}) {
  const app = express()

  app.set("trust proxy", 1)
  app.use(express.json({ limit: "64kb" }))

  app.get("/api/health", (_request, response) => {
    response.status(200).json({ status: "ok" })
  })

  const summarizeLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    limit: rateLimitLimit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: "Too many summarization requests. Please try again later.",
      })
    },
  })

  app.post("/api/summarize", summarizeLimiter, async (request, response) => {
    const { title, markdown } = request.body ?? {}

    if (
      typeof title !== "string" ||
      title.trim().length === 0 ||
      title.length > MAX_TITLE_LENGTH
    ) {
      return response.status(400).json({
        error: `Title must be a non-empty string of at most ${MAX_TITLE_LENGTH} characters.`,
      })
    }

    if (
      typeof markdown !== "string" ||
      markdown.trim().length === 0 ||
      markdown.length > MAX_MARKDOWN_LENGTH
    ) {
      return response.status(400).json({
        error: `Markdown must be a non-empty string of at most ${MAX_MARKDOWN_LENGTH} characters.`,
      })
    }

    try {
      const summary = await summarize({
        title: title.trim(),
        markdown: markdown.trim(),
      })
      response.status(200).json({ summary })
    } catch (error) {
      if (error instanceof AIConfigurationError) {
        return response.status(503).json({
          error: "AI summarization is not configured on this server.",
        })
      }

      console.error("AI provider request failed.")
      return response.status(502).json({
        error: "Unable to generate a summary right now. Please try again.",
      })
    }
  })

  app.use((error, _request, response, _next) => {
    if (error.type === "entity.too.large") {
      return response.status(413).json({ error: "Request body is too large." })
    }

    if (error.type === "entity.parse.failed") {
      return response.status(400).json({ error: "Request body must be valid JSON." })
    }

    console.error("Unhandled API error.")
    return response.status(500).json({ error: "Internal server error." })
  })

  return app
}
