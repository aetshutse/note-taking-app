# Note Taking App

A browser-based notes app built with React, TypeScript, and Vite. It supports Markdown notes, tags, search, and user-triggered AI summaries. Notes remain in the current browser's local storage; they are not synced to an account or stored on the server.

## Requirements

- Node.js 22.12 or later
- npm

## Local development

Install dependencies:

```powershell
npm ci
```

Run the API and Vite frontend in separate terminals:

```powershell
npm run dev:server
```

```powershell
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. The frontend proxies `/api` requests to Express on port `3001`. The health endpoint is available at `http://localhost:5173/api/health`.

To enable real AI summaries locally, copy `.env.example` to `.env` and set `AI_KEY`, `AI_MODEL`, and optionally `AI_URL`. Keep the key server-side; `.env` is ignored by Git. Summarizing sends the selected note's title and Markdown to the configured AI provider.

## Production build and run

```powershell
npm run build
npm start
```

Express serves both the generated `dist` frontend and `/api` on the same port. By default it listens on `http://localhost:3001`; it uses the `PORT` environment variable when provided by a host such as Render. The server falls back to the frontend for browser routes, so directly opening or refreshing a note URL loads the app.

## Deploy to Render

This repository includes a Render Blueprint in `render.yaml`. To deploy:

1. Push this repository to GitHub and sign in to Render.
2. In Render, create a new Blueprint Instance and select this repository and branch.
3. Review the `note-taking-app` web service configured by the Blueprint. It uses the free plan; free services can spin down while idle and take longer to respond after inactivity.
4. When prompted for unsynced environment variables, enter `AI_KEY` and `AI_MODEL`. `AI_URL` defaults to Groq's OpenAI-compatible API URL; change it if using another compatible provider.
5. Confirm creation and wait for the build and deployment to finish.
6. Open the service URL. Check `/api/health`, load the home page, and refresh a nested note route. Then create a test note and use **Summarize note** to verify the live model call.
7. Check the Render deploy logs for build/runtime errors. Never paste provider keys into Git, the frontend, issues, or logs.

The Blueprint sets `npm ci && npm run build` as the build command, `npm start` as the start command, and `/api/health` as the service health check. The API’s per-IP rate limit is in-memory and is a basic safeguard, not a durable quota.

Do not add provider secrets to the repository. Notes still live in each visitor's browser and are not shared across devices.

## Checks

```powershell
npm test
npm run lint
npm run build
```

The API tests use a local mock and do not need a provider key or make paid model requests. See [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) for the app architecture and data flow.
