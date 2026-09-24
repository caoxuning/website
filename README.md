# cartabio / Living Systems

Independent concept website. No changes to the sibling `helixa-biotech` project.

## Initial preview release

The deployable static package is `releases/v0.1.0-preview/cartabio-v0.1.0-preview-static.zip`. Extract its contents at the web root so `index.html` is at `/`. This is a review release, not a cleared public launch; see `releases/v0.1.0-preview/RELEASE_NOTES.md` and `docs/content-provenance.md`.

## Local preview

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://127.0.0.1:5188/ . Port is strict; the server fails instead of taking another project's port.

## Verification

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:browser
npm.cmd run test:business
npm.cmd run test:scroll
npm.cmd run test:performance
```

Browser verification uses Playwright Chromium. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium binary, or install the matching browser with `npx playwright install chromium`.
Screenshots and machine-readable results are generated in `test-results/`.

On Windows, `npm.cmd run test:performance:gpu` requests D3D11 hardware acceleration and records the actual WebGL renderer. Set `PLAYWRIGHT_USE_GPU=1` to run the full browser suite with the same backend. Performance reports are in `test-results/performance/`; software and hardware results are not interchangeable, and render-submission cadence is not a guarantee of visible display FPS.

## Contents

- `src/scene.js`: four coordinated Three.js compositions sharing fixed tissue coordinates: a low-signal specimen overview, SAFE staining cycles, depth-separated readout layers and selectable schematic analysis regions. Camera motion does not move or deform individual cells.
- `src/frame-loop.js`: refresh-driven scheduling with no 30 FPS throttle, time-based pointer easing, and cancellation while inactive, paused or hidden.
- `src/story.js`: deterministic motion, staining-cycle state and thin-section coordinates. Legacy helpers remain for earlier tests.
- `src/deck.js`: desktop threshold-based section transitions, navigation, focus and native-scroll fallback.
- `src/gesture.js`: gesture threshold and inertia latch, covered by unit tests.
- `src/experience.css`: unified graphite and cool-white visual system with mint, coral and blue readout colors. Earlier CSS files and `diagrams.js` are not imported.
- `src/main.js`: scene coordination, accessible tabs, dialogs and local draft export.
- `docs/design.md`: visual intent and source attribution.

The site is a concept, not a deployed corporate site. Contact drafts are downloaded locally; no form data is transmitted. Company claims and supplied asset rights require confirmation before public launch.

The provided logo, tissue image, four historical team portraits and older unused film/fallback assets are copied from the original asset package. Manrope is supplied with its OFL license. No ThreeUI source or paid template is used.

The current page is one continuous document: company proposition, research-question-led solutions, collaboration/deliverables, SAFE and AI foundations, source-qualified research archive, and team/contact. Desktop text and scene motion follow reading position; navigation, history and keyboard scrolling use native document behavior. Narrow viewports retain a natural stacked flow. The legacy deck and gesture modules remain in the source for historical tests but are not the current page controller.

The user approved historical case/team material for preview; current roles, credentials, image identity, scientific provenance and publication rights still need confirmation. See `docs/content-provenance.md`. The older network film is not displayed. Fixed-cell/tissue-section multiplex staining is the user-confirmed SAFE focus. All 3D scenes and cycle timing are illustrative; official panel specifications, sample compatibility and performance claims require company-approved material.

The refresh-driven renderer still batches fixed specimen geometry and stops inactive scenes. The static first frames are captured from the site's own procedural scenes. Reduced-motion and global pause leave the content readable. No code or dependencies in the sibling project were changed.
