Fixes applied to package.json and notes
- Updated Next.js to ^15.4.6 and React/React-DOM to ^19.1.1 to match Next 15 requirements.
- Added 'engines' field: node >= 18.18.0 (Next.js 15 requirement).
- Added eslint and eslint-config-next as recommended devDependencies.
- Created backup: package.json.bak (original file is preserved).

Important notes:
- Upgrading major framework versions can introduce breaking changes. If your codebase was authored for Next 14 / React 18, run the Next upgrade codemod:
  npx @next/codemod@canary upgrade latest
- If you prefer to stay on Next 14 / React 18, restore the backup package.json.bak.
- If you previously saw 'No matching version found for tailwindcss@^4.3.2', install a valid Tailwind version: e.g. 'npm i -D tailwindcss@^4.1.11' or keep v3 if you need older browsers.
- After making changes, run:
  npm install
  npm run dev
- If you encounter Node version errors, use nvm to switch:
  nvm install 18.18.0
  nvm use 18.18.0
