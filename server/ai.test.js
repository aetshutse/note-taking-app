import assert from "node:assert/strict"
import { createServer } from "node:http"
import { after, before, it } from "node:test"
import { summarizeNote } from "./ai.js"

let server
let serverUrl
let requestBody
let authorization

before(async () => {
  server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    requestBody = JSON.parse(Buffer.concat(chunks).toString("utf8"))
    authorization = request.headers.authorization

    response.writeHead(200, { "Content-Type": "application/json" })
    response.end(
      JSON.stringify({
        id: "test-completion",
        object: "chat.completion",
        created: 0,
        model: "test-model",
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: { role: "assistant", content: "A mocked summary." },
          },
        ],
      }),
    )
  })

  await new Promise((resolve, reject) => {
    server.once("listening", resolve)
    server.once("error", reject)
    server.listen(0, "127.0.0.1")
  })
  serverUrl = `http://127.0.0.1:${server.address().port}/v1`
})

after(async () => {
  const closed = new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()))
  })
  server.closeAllConnections()
  await closed
})

it("sends the note to the configured OpenAI-compatible endpoint", async () => {
  const originalEnvironment = {
    AI_KEY: process.env.AI_KEY,
    AI_URL: process.env.AI_URL,
    AI_MODEL: process.env.AI_MODEL,
  }

  process.env.AI_KEY = "local-test-key"
  process.env.AI_URL = serverUrl
  process.env.AI_MODEL = "test-model"

  try {
    const summary = await summarizeNote({
      title: "A note title",
      markdown: "Note body",
    })

    assert.equal(summary, "A mocked summary.")
    assert.equal(authorization, "Bearer local-test-key")
    assert.equal(requestBody.model, "test-model")
    assert.equal(requestBody.messages[0].role, "system")
    assert.match(requestBody.messages[0].content, /untrusted data/)
    assert.equal(requestBody.messages[1].role, "user")
    assert.equal(
      requestBody.messages[1].content,
      "Title: A note title\n\nNote:\nNote body",
    )
  } finally {
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
})
