# cartabio / Living Systems

Independent concept website. No changes to the sibling `helixa-biotech` project.

## Current preview release

The current review release is `v0.2.0-preview`. Download `cartabio-v0.2.0-preview-static.zip` from the GitHub release, or build it locally from this source. Extract the ZIP at the web root so `index.html` is at `/`; asset URLs assume root-path hosting. See `releases/v0.2.0-preview/RELEASE_NOTES.md` and `docs/content-audit.md` before any public deployment.

`/` is the current narrative homepage. `/design-preview.html` mirrors it for review, while `/legacy.html` preserves the previous homepage. The initial `v0.1.0-preview` release remains available separately.

## Local preview

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5188/ . Port is strict; the server fails instead of taking another project's port.

## Verification

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:browser
npm.cmd run test:story
npm.cmd run test:legacy
node tests/content-audit.mjs
```

Browser verification uses Playwright Chromium. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium binary, or install the matching browser with `npx playwright install chromium`.
Screenshots and machine-readable results are generated in `test-results/`.

## Contents

- `index.html`, `design-preview.css`, `src/design-preview.js`: current continuous-scroll homepage, responsive layout and interactions.
- `src/scene.js`, `src/frame-loop.js`, `src/story.js`: the shared fixed-tissue Three.js scene, animation scheduling and schematic states.
- `legacy.html`, `src/main.js`, `src/continuous-deck.js`: archived previous homepage and its controller.
- `tests/story-preview.mjs`, `tests/homepage-promotion.mjs`, `tests/content-audit.mjs`: current route, visual, interaction and claim-boundary checks.
- `docs/content-provenance.md`, `docs/content-audit.md`: source boundaries and publication checks.

The site is a concept, not a deployed corporate site. Contact drafts are downloaded locally; no form data is transmitted. Company claims and supplied asset rights require confirmation before public launch.

The provided logo, tissue image, four historical team portraits and older unused film/fallback assets are copied from the original asset package. Manrope is supplied with its OFL license. No ThreeUI source or paid template is used.

The current page is one continuous document: proposition, cooperation directions, delivery path, SAFE and AI foundation, research scene, team and contact. The same procedural tissue scene links the upper chapters; lower sections return to a source-qualified historical image. Navigation, history and keyboard scrolling use native document behavior. Narrow viewports retain a stacked flow, and reduced-motion and pause controls keep content readable. All 3D imagery and cycle timing are illustrative, not experimental or validated AI output.
