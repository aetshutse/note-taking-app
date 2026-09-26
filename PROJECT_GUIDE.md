# Project Guide

## What This App Is

This is a single-page React application for managing notes in the browser. It has no backend or account system. Notes and tags are persisted in the current browser profile using `localStorage`, so they do not automatically sync to another device or browser.

## Start, Check, And Build

Run these commands from the repository root, the folder containing `package.json`. In VS Code, choose the Command Prompt terminal profile if you prefer not to use PowerShell.

```cmd
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Keep the dev-server terminal open. Stop it with `Ctrl+C`.

Other project scripts:

```cmd
npm run build
npm run lint
npm run preview
```

`npm run build` runs `tsc -b` followed by `vite build`; generated production files go in `dist`. `npm run preview` serves that build and should be run after a successful build. `npm run lint` checks the source with ESLint.

If `package-lock.json` is present, `npm ci` installs its exact dependency versions and recreates `node_modules`. Use `npm install` if there is no lock file or when intentionally adding/updating dependencies. Do not move or commit `node_modules`; it is generated from the package files.

## Dependencies

The current runtime packages are:

- `react`, `react-dom`: UI and browser rendering (provided by the Vite React + TypeScript scaffold).
- `react-router-dom`: client-side page routes.
- `bootstrap`, `react-bootstrap`: CSS framework and React components.
- `react-select`: searchable, multi-select tag controls.
- `react-markdown`: renders note Markdown as page content.
- `uuid`: creates unique note and tag IDs.

The project-specific install command when adding these to a fresh scaffold is:

```cmd
npm install bootstrap react-bootstrap react-markdown react-router-dom react-select uuid
npm install --save-dev @types/uuid
```

Vite, TypeScript, React's Vite plugin, the React Compiler plugin, ESLint, and their supporting type packages are development dependencies already listed in `package.json`. For a clone of this repository, `npm ci` installs all runtime and development dependencies; do not repeat the package-by-package commands.

## Source Map

- `index.html`: HTML shell and the `root` element React mounts into.
- `src/main.tsx`: mounts React and wraps the app in `BrowserRouter` so routes work.
- `src/App.tsx`: defines the `Note`, `RawNote`, `RawNoteData`, `NoteData`, and `Tag` types; owns note/tag state; connects routes to screens; implements create, update, and delete operations.
- `src/useLocalStorage.ts`: a reusable hook that reads a value from local storage at startup and writes it when the value changes.
- `src/NoteList.tsx`: home screen, title/tag filters, note cards, and the tag-edit modal.
- `src/NoteForm.tsx`: shared create/edit form for title, Markdown body, and tags.
- `src/NewNote.tsx`: new-note screen using `NoteForm`.
- `src/NoteLayout.tsx`: finds a note from the URL ID, redirects if it does not exist, and shares the note with its child route.
- `src/Note.tsx`: note detail screen, Markdown rendering, and Edit/Delete/Back controls.
- `src/EditNote.tsx`: edit screen; loads the note from `NoteLayout` and passes its existing values into `NoteForm`.
- `src/NoteList.module.css`: local styles for note cards.

## Page Routes

- `/`: note list and search/filter controls.
- `/new`: create a note.
- `/:id`: view one note.
- `/:id/edit`: edit one note.
- Any unmatched path redirects to `/`.

`BrowserRouter` uses the browser URL for navigation. `NoteLayout` is the parent route for `/:id` and provides the matching note as outlet context to the detail and edit screens.

## Data And User Actions

`App` stores two arrays under local-storage keys `NOTES` and `TAGS`. A tag has an `id` and `label`. A stored raw note has an `id`, `title`, `markdown`, and `tagIds`. The screen-facing `Note` instead has full `Tag` objects. `App` derives those full tags by matching each note's `tagIds` to the tag array.

Creating a note generates a UUID and stores the note's selected tag IDs. Editing replaces that note's title, Markdown, and tag IDs. Deleting removes the note and returns to `/`. Creating a tag adds it to the shared tag list; renaming and deleting tags are handled by the tag modal. The home screen filters titles case-insensitively and shows notes matching the selected tags.

Because data is local to the browser, clearing site storage or using another browser profile may make notes appear missing. That does not mean the source files were deleted. There is currently no export, backup, or cloud synchronization feature.

## TypeScript Import Rule

`tsconfig.app.json` sets `verbatimModuleSyntax` to `true`. When an imported symbol is used only as a TypeScript type, mark the import as type-only, for example:

```ts
import type { NoteData, Tag } from "./App"
```

For a mixed import, use `type` on the type name or split the type and runtime imports. Without this, TypeScript can report that a type must be imported using a type-only import.

## Troubleshooting

- **Folder name appears twice:** create the Vite project from its parent directory and supply the name once; or use `.` when scaffolding inside the intended empty folder.
- **Blank browser page:** inspect the browser console and terminal running Vite. Look for the first import, syntax, or runtime exception; later errors may be consequences of the first one. Confirm each imported component file exists and exports the exact name its caller imports.
- **Component export error:** a file must contain a complete component body, and its named export must match the import. A declaration ending before the function body is implemented cannot render.
- **Type-only import diagnostic:** use `import type` for type aliases and interfaces when `verbatimModuleSyntax` is enabled.
- **Editor says existing relative modules are missing:** confirm VS Code opened the repository root (the folder containing `package.json`) and verify the files exist in `src`. If the app still runs and the files exist, restart the TypeScript server from the Command Palette; if needed, reload the VS Code window. Do not rewrite valid imports solely to silence stale diagnostics.
- **Dependency or command not found:** confirm the terminal is in the project root and Node.js/npm are installed. `node_modules` is recreated with `npm ci`.
- **PowerShell blocks `npm.ps1`:** use a Command Prompt terminal and run `npm ...`; do not change the machine's execution policy just for this project.
- **Changes do not appear:** make sure the Vite dev server is still running, use the URL it printed, and refresh the browser.

## Rebuilding From A New Vite Scaffold

From the directory above where the project should live:

```cmd
npm create vite@latest note-taking-app -- --template react-ts
cd note-taking-app
npm install
npm install bootstrap react-bootstrap react-markdown react-router-dom react-select uuid
npm install --save-dev @types/uuid
```

Then add the app source and configuration, and use `npm run dev`. For this existing repository, do not repeat scaffolding or reinstall packages individually; use `npm ci` to restore the checked-in dependency set.