# Verification / 2026-09-22

## v0.2.1-preview Offline Package / 2026-09-25

- One current homepage, 15-file ZIP. Legacy/duplicate pages and unused assets are absent from the production build. `file://` displays launch guidance, while the Windows launcher serves the page over loopback HTTP with no external runtime.
- `npm.cmd test`: 12 current scene/frame-loop tests pass. Homepage, four-viewport story/canvas, content-boundary, and offline-launcher checks pass. ZIP entries match `dist` by SHA-256; package SHA-256 is `A7FD4EF6023F4E21FB5516AB2F76C2627FBAF43E6F6724E82FE5506617EA60E1`.
- The release remains a preview pending the source and business confirmations in `docs/content-audit.md`.

## v0.2.0-preview Release / 2026-09-25

- `npm.cmd test`: 28/28 passing. Homepage, story, legacy, and content-audit browser checks passed; story/canvas coverage includes 1920x1080, 1440x900, 1024x768 and 390x844, with no horizontal overflow, page errors or missing images. The story checks cover moving/nonblank 3D pixels, pointer response, pause, reduced motion, anchors and history. Local consultation draft download remains verified.
- `npm.cmd run build`: passed. The static archive contains 23 files, each SHA-256 matched to `dist`. Archive SHA-256: `619D55820B2D0A4501EE42AD02FB0609ADF6271198CD85509578586C3855E4CB`.
- This is a preview release, not publication clearance. See `docs/content-audit.md` for outstanding image, fixed-sample SAFE, team, service and contact checks.

## Revision 19: Continuous Tissue Field and Text Rhythm / 2026-09-24

- The service chapter now shares the exact graphite background of the technology chapter and its WebGL clear color. Its process controls, captions, provisional deliverables and next-section link use light, legible colors; the historical research spread remains the intentional light transition. The existing 3D coordinates, scene controls and source qualifications are unchanged.
- `tests/lower-story.mjs` was first made to fail against the prior light service background, then passed the common field, matched canvas background, text contrast, compact layout and mobile flow. `tests/scroll-reveal.mjs` checks staged lower-chapter headings at intermediate positions, reversal, non-clipping, research body readability, pause and reduced motion. A screenshot review found the service next-section action too dim on anchor arrival; a failing anchor-state regression reproduced it, then passed after its reveal was moved earlier.
- Fresh desktop and mobile screenshots, including mid-scroll frames, are in `test-results/lower-motion/`. The fresh mobile 03 transition remains graphite and the 05 transition shows a readable evidence/status bridge. An independent image-only reviewer reported no blocker and identified the dim action, which was fixed. One reviewed transition image predated the graphite recolor and was replaced by fresh screenshots. Reviewer inherited the current Codex model; exact billing was unavailable.
- Final checks: `npm.cmd test` 28/28; `tests/lower-story.mjs`, `tests/scroll-reveal.mjs`, `tests/responsive-browser.mjs` (nine viewports, zero horizontal overflow at 1024 and 390px, canvas pixel and aspect-ratio checks), `tests/continuous-browser.mjs` (navigation/history, local draft, WebGL pixels), `tests/solution-interaction.mjs` (keyboard, pointer, pause) and `npm.cmd run build` passed. Historical image association, company service scope, team roles and formal contact information still require confirmation before publication.

## Revision 18: Lower-Chapter Art Direction / 2026-09-24

- Scope: chapters 03–06 only, plus a narrow-viewport scale adjustment to their existing tissue scenes. Chapters 01–02, the historical image source, the local-only contact workflow and the sibling project are unchanged.
- New `tests/lower-story.mjs` first failed on the prior dark service surface, then passed the distinct chapter treatments, process/scene ordering, image source-size limit, team caveat placement and mobile flow. The existing responsive regression now checks non-overlap against the new left-process/right-scene order rather than assuming the old placement.
- `npm.cmd test`: 28/28 pass. `tests/continuous-browser.mjs`, `tests/responsive-browser.mjs` (nine viewport sizes), `tests/solution-interaction.mjs`, `tests/scroll-reveal.mjs`, `tests/spatial-lens.mjs`, `tests/business.mjs`, `tests/approved-ui.mjs` and the production build pass. Browser checks include navigation/history, keyboard selection, consultation draft download, pause/reduced motion and nonblank 3D pixels.
- Fresh 1440x900, 1024x768 and 390x844 chapter screenshots are in `test-results/visual-audit/`. Horizontal overflow is zero at all three widths; the responsive suite also confirms 1920x1080 and six other sizes. Historical case and team information, publication rights, actual service/outputs and formal contact details still need company confirmation before public release.
- An independent screenshot-only review found the mobile research image appearing before the research question and the mobile feature map too small. Both were corrected and rechecked at 390px; the nine-viewport and continuous-browser suites passed again. The reviewer inherited the current Codex model; exact model identifier and billing were not provided by the platform. Team image consistency remains limited by the historical source files.

## v0.1.0-preview Release / 2026-09-24

- Rebuilt `dist` with Vite and packaged its 18 files into `releases/v0.1.0-preview/cartabio-v0.1.0-preview-static.zip`; archive contents match `dist` exactly. SHA-256: `72674C433614496FA49855B44157DC79D465A4096EE903A5DFB2F6D60EF7EA60`.
- Fresh unit suite passed 28/28. `tests/layout-overlap.mjs` and `tests/continuous-browser.mjs` passed. The built site was served separately on local port 5189; `tests/release-smoke.mjs` passed at 1440 and 390 px, including nonblank 3D pixels, working consultation dialog, correct local-only disclosure and no failed asset requests.
- This is a local review release. Historical content, image rights and formal contact details remain unverified; no public deployment is claimed.

## Revision 17: Layout Overlap / 2026-09-24

- `tests/layout-overlap.mjs` covers 1440, 1024, 996 and 390 px: sticky proposition and actions do not intersect; solution detail and SAFE status remain grouped with their respective controls and visual; offscreen delivery has a nonblank first frame. Desktop and mobile screenshots are in `test-results/layout-overlap/`.
- The three module posters are generated from the site's own procedural Three.js scenes using `tests/capture-scene-fallbacks.mjs`; they are illustrative rather than experimental images. The 3D canvases replace them on activation. The historical research image is unchanged.
- Unit suite: 28/28. Production build, `tests/spatial-lens.mjs`, `tests/continuous-browser.mjs`, `tests/responsive-browser.mjs`, and `tests/solution-interaction.mjs` pass. Browser checks include navigation/history, scene pixels, pause, keyboard selection, and local contact draft.

## Revision 16: Spatial Lens Sample / 2026-09-24

- Scope: hero, collaboration overview, and solution/SAFE reading sequence. Existing case, team, local contact-draft workflow and source qualifications remain unchanged.
- New `tests/spatial-lens.mjs` checks first-frame canvas visibility, reversible hero and SAFE scroll state, non-overlapping hero text handoff, pause, four screenshot widths and SAFE canvas pixels. `tests/staining.test.js` covers the live imaging sweep within a scroll-selected SAFE stage.
- Updated the sticky collaboration-heading regression to check exit after the section is read. The first-scroll regression checks readable brand text and visible motion rather than requiring a static first gesture.
- Browser checks: continuous navigation/history/contact draft, nine responsive viewports, reversible text reveal, solution keyboard and WebGL interaction, and first-scroll behavior pass. Production build and unit suite pass.
- Hardware probe on the RTX 4070 Laptop, headless Chromium D3D11 at 1440x900 DPR 1: approximately 240 render submissions/s in each active 3D chapter, 12-15 draw calls/frame, zero inactive/paused/static-chapter submissions. This is render-submission cadence, not a guarantee of presented FPS on other devices.
- Screenshots: `test-results/spatial-lens/`. Historical case image, current team roles, publication rights and formal contact details still need company confirmation before public release.

## Revision 9: Commercial Information Architecture / 2026-09-23

- Reordered the six chapters around company proposition, solution directions, collaboration/deliverables, technical basis, historical research direction, and team/contact. The existing independent Three.js scenes, scroll gesture threshold and local contact download remain in place.
- Business interaction test now asserts the consultation CTA, three solution directions with need/collaboration/deliverable fields, explicit pending-confirmation language, four delivery examples and the prohibition on price, schedule, throughput and acceptance claims. It also retains AI region interaction, historical-case dialog and the local-only contact boundary.
- Desktop screenshots at 1440 and 1024 were reviewed after moving the solution background tissue away from the information rows and suppressing duplicate ROI labels. Mobile hides the decorative solution scene to preserve readable natural-scroll content; the remaining scientific scenes retain their canvas checks.
- Pending confirmation before release: actual service catalogue and scope, sample acceptance, turnaround, pricing, deliverable definitions, validated case materials, current team roles and any live contact destination.
- Final verification: `npm.cmd test` passed 27/27; `node tests/business.mjs`, `node tests/refinement.mjs`, `node tests/browser.mjs`, and `node tests/scroll-browser.mjs` passed. `npm.cmd run build` passed. Browser checks cover 1920x1080, 1440x900, 1024x768, 390x844, 800x900 and 1280x600 with zero horizontal overflow and no desktop section clipping.
- `test-results/performance/commercial-gpu.json` records actual RTX 4070 Laptop D3D11 submissions at 1440x900 DPR 1: about 240 submissions/s, 12-15 draw calls/frame and p95 interval about 4.4 ms. This is a headless-renderer measurement, not a cross-device or display-frame-rate guarantee.

## Revision 8: Business-Led Layouts / 2026-09-23

- 27 unit tests pass. New failing tests reproduced slow-wheel reset and verified the coordinate selection, registration offsets and brighter continuous visual fade before their implementations.
- `tests/refinement.mjs` passes real mouse-wheel steps of 120 pixels at 450 ms intervals, all six sections at 1440/1024/390 px, zero horizontal overflow, and exact schematic object counts of 1/9/21. Spatial modes change 109,346 and 101,825 canvas pixels while autonomous animation is paused, proving the buttons change the figure rather than just text.
- Full hardware browser suite passes 1920x1080, 1440x900, 1024x768, 390x844, 800x900 and 1280x600. Six desktop panels fit without vertical clipping; images load; four canvases are nonblank, framed and moving. Pause, reduced motion, ROI pixel changes, keyboard navigation, dialogs, download, history, resize and WebGL fallback pass with no page errors.
- Scroll regression and business interaction suites pass. The slow-wheel fix does not remove momentum locking, reversible preview, release rollback, or history/dialog interruption handling.
- `test-results/performance/after-refinement-gpu.json`: RTX 4070 Laptop via D3D11, headless Chromium, 1440x900 DPR 1; approximately 239.8-240 render submissions/s, p95 submission interval 4.3-4.4 ms; 12-15 draw calls per frame. Inactive, paused and static-section scenes submit zero frames; outgoing animation continues through its fade. These are submission measurements, not guaranteed screen-presented FPS or performance on other devices.
- Evidence: `test-results/refinement/`, `test-results/deck/`, `test-results/scroll/`, and the performance JSON above. Old project SHA256 values match the recorded integrity table. Historical case/team information and the live contact destination still require confirmation before publication.
- Independent visual reviewer inspected 18 rendered screenshots across 1440/1024/390 px and confirmed meaningful chapter differentiation, improved readability and no blocking overlap/clipping. Follow-up fixes remove layout-dependent wording and distinguish in-place spatial mode selection from navigation. More explicit registration reference markers and a dedicated mobile chapter menu remain possible future improvements; current scope is desktop-first.

## Revision 7: Scroll-Progress Handoff / 2026-09-23

- New scroll-progress unit suite failed before implementation. Six added tests cover distance/progress, 60% commitment, reversal, idle/latch, suppression, resuming a return and fade boundaries. All 24 unit tests pass.
- `test:scroll` failed on the old trigger-only implementation and now passes actual-browser progress, opacity, below-threshold release/return, reversed input, boundary protection, threshold commitment, inertia suppression, navigation/history interruption, modal cancellation, resize cleanup, 390px/1024px zero overflow and reduced-motion behavior. An additional failing regression caught simultaneous incoming/outgoing copy; incoming copy is now held until outgoing text has faded out.
- Uncommitted scrolling preserves the current hash and active chapter. Chapter history is created only when committed. Pause and reduced-motion suppress animated scrubbing. Narrow/short native scrolling remains intact.
- Final build passes: app 102.15 kB / 41.50 kB gzip, unchanged Three.js chunk 490.11 kB / 122.90 kB gzip. Content, assets, geometry, shaders, pixel ratio and old project are unchanged in this revision.
- Transition evidence: `test-results/scroll/verification.json`, `half-progress.png`, `committed.png`, `returned.png`.
- Full six-viewport hardware browser suite and business interaction suite pass. All four canvases remain nonblank, moving and framed; six desktop chapters fit and all tested widths have zero horizontal overflow. An additional failing history regression reproduced duplicate popstate/hashchange ending a transition prematurely; repeated navigation to the already-settling destination is now idempotent, and the regression passes.
- `after-scroll-gpu.json` verifies unchanged 12-15 draw calls, approximately 240 submissions/s on the RTX 4070 Laptop at 1440x900 DPR 1, zero inactive/paused/static-chapter rendering and continuing outgoing animation while visible. No universal display-FPS guarantee is implied.
- Independent reviewer inspected the three transition screenshots: no overlapping incoming/outgoing text, clipped fixed chrome or residual transforms after returning. Exact inherited reviewer model identifier and cost remain unavailable. Preview HTTP 200; sibling project's recorded SHA256 hashes still match.

## Revision 6: Business Narrative / 2026-09-23

- Six independently navigable modules follow the user's business-to-visual table. A fourth Three.js scene retains the same tissue coordinates for ROI-linked analysis tabs. Historical case and four team portraits are source-qualified, with user approval for preview only.
- `tests/business.mjs` failed first because only five sections existed; after implementation it passes six-section counts, dynamic chapter numbering, analysis selection/keyboard behavior, project details dialog and historical team presence.
- `npm.cmd test`: 18/18 pass. `npm.cmd run build`: pass. App 100.46 kB / 40.82 kB gzip, Three.js 490.11 kB / 122.90 kB gzip.
- Full D3D11 browser suite passed: 1920x1080, 1440x900, 1024x768, 390x844, 800x900 and 1280x600. All six desktop sections fit; horizontal overflow is zero including fresh 390px/1024px measurements. All four scientific canvases are nonblank/framed, moving when enabled, and static when paused/reduced-motion. ROI selection changes actual WebGL pixels while autonomous motion is paused. Assets load; no page errors. Navigation, inertia, history, keyboard, dialog isolation, draft download, resize context and fallback pass.
- Hardware probe `test-results/performance/after-business-gpu.json`: actual RTX 4070 Laptop D3D11 renderer, 1440x900 DPR 1. Four scenes approximately 240 render submissions/s, p95 interval 4.4 ms. Draw calls: overview 12, SAFE 12-13, spatial 15, AI 13. Inactive and paused scenes record zero renders; the static research section stops all renderers; outgoing animation continues through the fade. Submission cadence is not monitor-presented FPS or a guarantee for other hardware.
- Separate software probe `after-business-software.json` also passes scheduling, batching, pause, static-section and outgoing-transition assertions. SwiftShader remains software-bound at approximately 15.4-15.7 submissions/s; no claim of universal high FPS or software-renderer performance improvement is made.
- Old-project SHA256 values still match the integrity table. Local preview HTTP 200 at http://127.0.0.1:5188/ .
- No live backend, authenticated SAFE case results or current team credentials were established by this implementation. See `content-provenance.md` for release requirements.
- Independent screenshot reviewer inspected eight fresh images: desktop and 1024px platform/research/team, mobile platform viewport and complete mobile page. No blocking collisions, clipping or hierarchy defects found; concept/archive/team qualifications remain visible. Reviewer inherited the session model; exact identifier and billing are unavailable.

## Revision 5: Refresh-Rate Rendering / 2026-09-23

- Performance-only revision. No HTML copy, CSS layout, specimen detail, particle count or pixel-ratio reduction. Old project hashes still match the integrity table below.
- Removed the explicit 33 ms throttle. Refresh scheduling stops entirely while inactive, paused, document-hidden or context-lost, and resumes without adding hidden time. Pointer easing now depends on elapsed time.
- Batched fixed specimen geometry/contours by material/channel and pooled particle instances. The three scene renderers share CPU-side specimen assets. Draw calls dropped from 105 (overview), approximately 105-106 (SAFE), and 126 (integration), to 12, 12-13 and 15 respectively.
- Outgoing scene keeps rendering through its 0.32 s fade; afterward only the incoming scene renders. The performance probe verifies increasing outgoing frame counts while visible, no inactive-frame rendering and zero paused-frame rendering.
- `npm.cmd test`: 18/18 pass, including new failing-before-implementation tests for 60/120 Hz scheduling, inactive-loop cancellation, idle-resume behavior and refresh-independent pointer response. `npm.cmd run build`: pass, Three.js chunk 490.01 kB / 122.88 kB gzip.
- Matched software benchmark, 1440x900 DPR 1: overview 15.16 to 16.17 render submissions/s; SAFE 14.33 to 16.31; integration 15.06 to 16.17. Batching alone does not solve the software rasterizer bottleneck.
- Separate D3D11 benchmark identifies the actual renderer as NVIDIA GeForce RTX 4070 Laptop GPU: overview 240.00, SAFE 239.75, integration 239.98 render submissions/s, each with p95 frame interval approximately 4.4 ms. Headless submission cadence is not a measurement of monitor-presented frames or a performance guarantee for other devices. No original-version hardware baseline was measured.
- Complete browser suites passed with both D3D11 and SwiftShader: six viewport configurations, zero horizontal overflow including 390px and 1024px, all five desktop panels unclipped, nonblank/framed/moving scientific canvases, paused/reduced-motion stillness, assets loaded, navigation, history, dialogs/download, resize context and WebGL fallback. No page errors.
- Software-renderer test diagnosis: two CDP wheel calls arrived 512 ms apart, then 255 ms apart even without explicit waiting, exceeding the genuine 240 ms gesture-idle window. Accumulation and momentum bursts are now scheduled inside the browser to avoid transport latency masquerading as a product defect; native wheel events still exercise burst initiation and reversal. The app's gesture thresholds did not change.
- Evidence: `test-results/performance/before.json`, `after.json`, `after-gpu.json`, and fresh screenshots/browser results under `test-results/deck/`. Preview returned HTTP 200 at http://127.0.0.1:5188/ .
- Independent screenshot review retained membranes, nuclei, granules, palette and layout, but caught a brief stage-label mismatch: the process caption updated immediately while the previous highlight faded for 0.25 s. A MutationObserver regression assertion reproduced the stale computed color before the fix. Process highlights now switch immediately with the caption; no page-layout styling changed. Reviewer model inherited from this session; exact identifier and cost unavailable.
- Final build and six-viewport hardware browser rerun passed after the highlight fix, including its same-frame color/label assertion. Independent reinspection confirmed `02` imaging and `ROUND 02 / IMAGE` agree; no remaining reported visual findings.

## Revision 4: Fixed-Specimen SAFE / 2026-09-23

- User confirmed fixed cells/tissue sections, not live-cell longitudinal tracking. The site now follows tissue context, multiplex staining cycles, spatial readout integration and research questions. No future-state prediction story remains in the active page.
- `npm.cmd test`: 15/15 pass. New tests cover labeling/imaging/clearance/next-round timing, deterministic thin-section coordinates and fixed-specimen copy. They failed before implementation.
- `npm.cmd run build`: pass. Three.js chunk is 485.76 kB before gzip, 121.86 kB gzipped; no chunk-size advisory on this build.
- Final Playwright run: pass, zero page errors. Desktop 1920x1080, 1440x900 and 1024x768: five panels fit, zero horizontal overflow. Native-scroll 390x844, 800x900 and 1280x600: zero horizontal overflow.
- Canvas-only pixel checks now hide overlaid navigation/text during capture; an initial framing assertion correctly exposed that locator screenshots also contain overlaid chrome. The corrected checks verify nonblank rendered scenes and bounded geometry at desktop and mobile sizes, as well as animation, pause and reduced-motion stillness.
- SAFE process indicators advance with the scene and stop with global pause. Threshold navigation, inertia suppression, keyboard navigation, tabs, dialogs, local draft download, browser history, deep links, resize context and WebGL fallback pass.
- Visible image assets loaded at tested desktop sizes. The supplied tissue image remains labeled as unverified source material, not a SAFE performance result. The unrelated conceptual network film is no longer displayed.
- Screenshot review caught excessive readout-layer depth; this was reduced to keep outlines inside the viewport. Independent review then identified ambiguous color-key semantics. Readout layers A/B/C now match the mint/coral/blue geometry, and the caption explicitly excludes physical displacement and time evolution. Reviewer reinspection passed, with no clipping or text overlap in reviewed desktop/mobile screenshots.
- Reviewer used the inherited session model; exact model identifier and cost are not exposed by the tool.
- Preview returned HTTP 200 at http://127.0.0.1:5188/ . The sibling project's four SHA256 values below still match. No sibling project files were edited.
- Evidence: fresh screenshots and `test-results/deck/verification.json`. Headless Chromium with software WebGL only; physical GPU performance and other browsers are not measured. Company-approved fixed-sample specifications and authenticated SAFE image data remain needed before public release.

## Revision 3: One Cell, One Narrative

- Twelve unit tests pass, including shared focal-cell identity, deterministic stronger motion and entry-camera settlement. The new narrative tests failed before their implementation was added.
- All five modules now use the same graphite environment and typography. The warm focal-cell identity repeats through structure, relationships and hypothetical state branches.
- The three scientific canvases are all Three.js/WebGL scenes using shared geometry, shader and lighting code. Canvas-pixel checks cover every scientific scene at desktop sizes and the two new scenes at 390px.
- Stronger motion includes camera approach, depth rotation, pointer response, membrane deformation and traveling signals. Global pause and reduced-motion frame comparisons pass.
- The established wheel-threshold, inertia protection, keyboard navigation, deep links, history and responsive fallbacks remain verified.
- Six viewport configurations have zero horizontal overflow; all five panels fit at the three desktop configurations.
- A new continuity assertion caught a collision between the page's active-index attribute and the section selector. The active index now uses `data-active-panel`, and section enumeration is scoped to `main`. This also isolates dialog text from section theme variables.
- Screenshots and machine-readable results remain in `test-results/deck/`. Browser checks use headless Chromium with software WebGL; real-device GPU performance is not measured.
- Independent visual review found a non-blocking overlap between the middle hypothetical state and its parent at 1024px. The branch was moved rightward and forward in depth, with a clearer connecting path; the full browser suite passed again after the adjustment.

## Revision 2: Section-Based Experience

- Nine unit tests pass, including threshold accumulation, direction changes, idle reset and inertia suppression. The new gesture suite failed before the gesture module was implemented.
- Desktop browser coverage: 1920x1080, 1440x900 and 1024x768. All five panels have zero horizontal overflow and no vertical clipping at each size.
- Native-scroll fallback coverage: 390x844, 800x900 and 1280x600. Zero horizontal overflow and no inert content left behind.
- Actual wheel events verify a sub-threshold gesture stays in place, an accumulated threshold advances one panel, continuous momentum cannot skip another panel, and reversal returns one panel.
- Mid-transition screenshot and transform checks verify whole-section motion. The hero canvas is invisible after leaving its section.
- Canvas pixel comparisons verify a nonblank and moving hero, moving independent network/atlas figures, paused stillness and reduced-motion stillness.
- Tabs and arrow-key selection, deck keyboard navigation, modal scroll isolation, local download, browser Back, section deep links and resize context preservation pass.
- WebGL context loss shows the fallback; no browser page errors.
- Build passes. The existing non-blocking Three.js chunk size advisory remains (500.53 kB uncompressed).
- Evidence: `test-results/deck/verification.json` and corresponding screenshots. Tests use headless Chromium with software WebGL, not physical-device GPU measurements.
- Before/after checks reconfirm the sibling project's four tracked hashes below are unchanged.
- Independent screenshot review identified a 1024px chart-label overlap; the plot label was moved to a dedicated row above the graph and retested. The reviewer inspected the fresh screenshot and confirmed the overlap resolved.

## Revision 1 Record

## Results

- `npm.cmd test`: 4/4 passing. The initial red run failed on the not-yet-implemented story module; the implementation made the tests pass.
- `npm.cmd run build`: passing. Vite emits a non-blocking bundle advisory: the Three.js chunk is 500.53 kB before gzip, 125.63 kB gzipped.
- `npm.cmd run test:browser`: passing, no page errors.
- Viewports: 1920x1080, 1440x900, 1024x768, 390x844. Horizontal overflow: 0 at each width; all images decoded; canvas foreground verified at all four sizes.
- Frame comparison confirms animation. Paused and reduced-motion frame comparisons confirm stillness.
- Navigation, mouse/touch tab selection, keyboard tab selection, modal Escape, local draft download, and simulated WebGL context loss fallback verified.
- Preview responds HTTP 200 at http://127.0.0.1:5188/ .
- Browser: locally available Playwright Chromium 1234, headless, software WebGL. Real-device GPU performance and non-Chromium browsers were not measured.

## Visual Review

An independent reviewer inspected rendered desktop and mobile screenshots. Model inherited from the current session; exact model identifier and billing are not exposed by the agent tool.
First review identified overlapping specimen annotations and a control/section-divider collision. Both were corrected. Second review confirmed those defects resolved and no visible blockers in the two reviewed screenshots.
Additional refinement keeps the supplied tissue image contained without cropping and removes a redundant crosshair beside the motion control.

## Original Project Integrity

The sibling project was not edited. Before/after SHA256 values match for:

| File | SHA256 |
| --- | --- |
| helixa-biotech/index.html | C9B8C460E9245F99F578DA76F7E4E32F3F6CE8F6F500F378F163C3E7863263C0 |
| helixa-biotech/package.json | 0528DD2E371D714646B1429AE6827D8D44C8F91A6BBB202A4BC094BC5B3D9832 |
| helixa-biotech/src/cartabio.js | 57B45A3BFEA4202F9804D8A9717ED7E8253CC09B33FBA88B60653E747CF22FE5 |
| helixa-biotech/src/cartabio.css | C99EFD06C684F4B277BA2DED6F12035C6B44D20A33EFA0EF9618479E4FC6EA6E |

This is a local concept preview. Supplied asset publication rights, official company text and a real contact destination still need confirmation before public deployment.
