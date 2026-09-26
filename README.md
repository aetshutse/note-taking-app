# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Note Taking App

  A browser-based note-taking app built with React, TypeScript, and Vite. It supports creating, editing, deleting, searching, and tagging notes. Note bodies are written in Markdown. Notes and tags are saved in the browser's local storage; there is no server or cloud sync.

  For the file-by-file architecture, data flow, routes, dependencies, and troubleshooting notes, see [PROJECT_GUIDE.md](PROJECT_GUIDE.md).

  ## Requirements

  - Node.js (use a current LTS release supported by Vite)
  - npm, included with Node.js

  ## Install And Run

  Open Command Prompt in this project folder (`note-taking-app`). Install the locked dependencies, then start the development server:

  ```cmd
  npm ci
  npm run dev
  ```

  Open the local URL printed by Vite, usually `http://localhost:5173`. Keep the terminal running while using the app; press `Ctrl+C` there to stop the server.

  If you do not have a `package-lock.json`, use `npm install` instead of `npm ci`. `npm ci` restores the exact versions recorded in the lock file and recreates `node_modules`.

  ## Useful Commands

  ```cmd
  npm run dev
  npm run build
  npm run lint
  npm run preview
  ```

  - `npm run dev` starts the local development server.
  - `npm run build` checks TypeScript and creates the production build in `dist`.
  - `npm run lint` runs ESLint.
  - `npm run preview` serves the already-created `dist` build locally. Run `npm run build` first.

  ## Dependencies

  For this existing project, `npm ci` (or `npm install`) installs every dependency listed in `package.json`. Do not install them all again each time you start the app.

  If recreating the project from a Vite React + TypeScript scaffold, these are the app-specific runtime packages used here:

  ```cmd
  npm install bootstrap react-bootstrap react-markdown react-router-dom react-select uuid
  ```

  The Vite React + TypeScript scaffold supplies React, React DOM, Vite, TypeScript, and the React Vite plugin. This project also lists `@types/uuid` as a development dependency:

  ```cmd
  npm install --save-dev @types/uuid
  ```

  The remaining development tools and their exact versions are recorded in `package.json` and `package-lock.json`; use `npm ci` to restore them together. The lock file is important: keep it in version control and commit it when dependencies change.

  ## Creating The Project Folder

  Run the Vite create command from the directory that should contain the project folder, and give the project name once. If you have already opened the intended empty project folder, use `.` as the destination instead. Avoid creating a same-named folder inside the project folder.
