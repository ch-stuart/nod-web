# Sleep Noise Web

Marketing website for Nod.

## Node iOS

Located at ~/Code/sleep-noise-ios. Reference the CLAUDE.md at ~/Code/sleep-noise-ios/CLAUDE.md for information about the iOS app.

## Developing

- `pnpm dev` — start dev server
- `pnpm build` — generate `docs/` (runs screenshot conversion first)
- `pnpm preview` — preview the built output locally
- `pnpm lighthouse` — audit production URL; saves compact JSON report to `lighthouse-reports/`

## Technical Requirements

- Heavily prioritize performance and score 99 or above on Lighthouse tests: Performance, Accessibility, Best Practices and SEO
- Use Vite to build static website which will be hosted by Github Pages
- Configure Vite build `outDir` to point at 'docs'
- Set Vite `base` to `'./'` so asset paths are relative — works with both a GitHub Pages subdirectory URL and a custom domain
- GitHub Pages is configured to serve from the `/docs` folder on `main`
- Leverage CSS in place of JavaScript wherever possible and reasonable
- Do not use Github Actions
- Do not use any third-party runtime libraries
- Use pnpm
- Use CSS vars as design tokens
- Leverage modern web platform features
- All selectors should be single token class selectors, e.g. `.foo { font-weight: bold; }`
- Use CSS Modules. Split CSS into separate files as needed.

## Images

The Vite build plugin processes master source images into AVIF, WebP, and palette PNG formats automatically. Each image type lives in its own subdirectory under `src/images/`. Place the source file at `original.png` inside the relevant directory; the plugin converts it and writes the output files. Generated files are gitignored — only `original.png` is committed. Use a `<picture>` element in HTML with AVIF → WebP → PNG fallback.

- **Screenshot** — source: `src/images/screenshots/original.png`, outputs: `shot.avif` / `shot.webp` / `shot.png` (AVIF q75, WebP q85, PNG q90)
- **App icon** — source: `src/images/app-icon/original.png`, outputs: `icon.avif` / `icon.webp` / `icon.png` (AVIF q80, WebP q90, PNG q95)

## UX Requirements

- Prioritize accessibility and meet strict accessibility targets
- Follow best practices for marketing web pages
- Use "Nod" for the name of the app
- Display screenshot in src/images/screenshots
- Base the visual design on the visual design of the iOS app
- Give a summary of the app and include a call to action to install the app
