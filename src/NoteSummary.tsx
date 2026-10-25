import { useEffect, useRef, useState } from "react"
import { Alert, Button, Spinner } from "react-bootstrap"
import type { Note } from "./App"

type NoteSummaryProps = {
  note: Note
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function NoteSummary({ note }: NoteSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [note.id])

  async function handleSummarize() {
    const controller = new AbortController()
    controllerRef.current = controller
    setIsLoading(true)
    setSummary(null)
    setError(null)

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: note.title, markdown: note.markdown }),
        signal: controller.signal,
      })

      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        setError("The summarization service returned an invalid response.")
        return
      }

      if (!response.ok) {
        const message =
          isRecord(payload) && typeof payload.error === "string"
            ? payload.error
            : `The summarization request failed (${response.status}).`
        setError(message)
        return
      }

      if (
        !isRecord(payload) ||
        typeof payload.summary !== "string" ||
        payload.summary.trim().length === 0
      ) {
        setError("The summarization service returned no summary.")
        return
      }

      setSummary(payload.summary.trim())
    } catch {
      if (!controller.signal.aborted) {
        setError(
          "Could not reach the summarization service. Check your connection and try again.",
        )
      }
    } finally {
      if (!controller.signal.aborted) {
        controllerRef.current = null
        setIsLoading(false)
      }
    }
  }

  return (
    <section className="mb-4" aria-label="AI note summary">
      <Alert variant="light" className="border" role="note">
        <p className="mb-3">
          When you choose to summarize, this note's title and content will be
          sent to the configured external AI provider. The summary is not saved
          to your note.
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={handleSummarize}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                aria-hidden="true"
                className="me-2"
              />
              Summarizing...
            </>
          ) : (
            "Summarize note"
          )}
        </Button>
      </Alert>

      {isLoading && (
        <p role="status" aria-live="polite">
          Generating a summary...
        </p>
      )}
      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}
      {summary && (
        <Alert variant="success" role="status" aria-live="polite">
          <Alert.Heading as="h2" className="h5">
            AI-generated summary
          </Alert.Heading>
          <p className="mb-0">Review this summary before using it.</p>
          <hr />
          <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
            {summary}
          </p>
        </Alert>
      )}
    </section>
  )
}
