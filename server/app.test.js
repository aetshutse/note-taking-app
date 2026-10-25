import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"
import { createApp } from "./app.js"
import { AIConfigurationError } from "./ai.js"

async function startServer(app) {
  const server = app.listen(0, "127.0.0.1")
  await new Promise((resolve, reject) => {
    server.once("listening", resolve)
    server.once("error", reject)
  })

  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => {
      const closed = new Promise((resolve, reject) => {
        server.close(error => (error ? reject(error) : resolve()))
      })
      server.closeAllConnections()
      return closed
    },
  }
}

describe("POST /api/summarize", () => {
  let server

  before(async () => {
    server = await startServer(
      createApp({ summarize: async () => "A concise summary." }),
    )
  })

  after(async () => {
    await server.close()
  })

  it("returns the generated summary", async () => {
    const response = await fetch(`${server.url}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "  A title  ", markdown: "  Note text  " }),
    })

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { summary: "A concise summary." })
  })

  it("rejects empty or missing note fields", async () => {
    for (const body of [
      {},
      { title: "Title", markdown: " " },
      { title: "", markdown: "Note text" },
    ]) {
      const response = await fetch(`${server.url}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      assert.equal(response.status, 400)
      assert.equal(typeof (await response.json()).error, "string")
    }
  })

  it("rejects note fields that exceed their limits", async () => {
    const response = await fetch(`${server.url}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Title", markdown: "x".repeat(40_001) }),
    })

    assert.equal(response.status, 400)
  })

  it("rejects malformed JSON with a JSON error response", async () => {
    const response = await fetch(`${server.url}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
      error: "Request body must be valid JSON.",
    })
  })

  it("rejects request bodies over the parser limit", async () => {
    const response = await fetch(`${server.url}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Title", markdown: "x".repeat(70_000) }),
    })

    assert.equal(response.status, 413)
    assert.deepEqual(await response.json(), {
      error: "Request body is too large.",
    })
  })

  it("returns a generic response when the AI provider fails", async () => {
    const providerFailureServer = await startServer(
      createApp({
        summarize: async () => {
          throw new Error("provider details must not be returned")
        },
      }),
    )

    try {
      const response = await fetch(`${providerFailureServer.url}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Title", markdown: "Note text" }),
      })

      assert.equal(response.status, 502)
      assert.deepEqual(await response.json(), {
        error: "Unable to generate a summary right now. Please try again.",
      })
    } finally {
      await providerFailureServer.close()
    }
  })

  it("reports missing AI configuration as a service-unavailable response", async () => {
    const unconfiguredServer = await startServer(
      createApp({
        summarize: async () => {
          throw new AIConfigurationError("configuration details stay server-side")
        },
      }),
    )

    try {
      const response = await fetch(`${unconfiguredServer.url}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Title", markdown: "Note text" }),
      })

      assert.equal(response.status, 503)
      assert.deepEqual(await response.json(), {
        error: "AI summarization is not configured on this server.",
      })
    } finally {
      await unconfiguredServer.close()
    }
  })
})

it("limits summarization requests", async () => {
  const limitedServer = await startServer(
    createApp({
      summarize: async () => "Summary.",
      rateLimitLimit: 1,
      rateLimitWindowMs: 60_000,
    }),
  )

  try {
    const requestSummary = () =>
      fetch(`${limitedServer.url}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Title", markdown: "Note text" }),
      })

    assert.equal((await requestSummary()).status, 200)
    const limitedResponse = await requestSummary()
    assert.equal(limitedResponse.status, 429)
    assert.deepEqual(await limitedResponse.json(), {
      error: "Too many summarization requests. Please try again later.",
    })
  } finally {
    await limitedServer.close()
  }
})
