# cartabio / Living Systems

Single-page concept website. The current page is `index.html`; no legacy or duplicate preview page is included.

## Open the downloaded ZIP

1. Extract `cartabio-v0.2.1-preview-offline.zip` completely.
2. On Windows, double-click `START_HERE.cmd`. It opens the homepage in your browser using a local server. Keep the terminal window open while viewing; close it to stop the server.

Do not double-click `index.html`. Browsers do not load this Vite/Three.js build correctly from a `file://` URL; that file shows a launch hint instead. The launcher binds only to `127.0.0.1` and uses an available port automatically.

## Develop

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5188/ . The dev port is strict so it cannot silently take another project's port.

## Verify

```powershell
npm.cmd test
npm.cmd run test:browser
npm.cmd run test:story
npm.cmd run test:content
npm.cmd run build
npm.cmd run test:offline
```

Browser tests use Playwright Chromium. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when Chrome is installed elsewhere. The build contains only `index.html`, its required assets, and the two local launcher files.

The site remains a concept preview, not a cleared public corporate launch. Consultation creates a local draft file and does not send data. Historical image identity and permissions, current team roles, fixed-sample SAFE validation, service scope and official contact details need confirmation before publication. See `docs/content-provenance.md` and `docs/content-audit.md`. Procedural tissue visuals are illustrative, not experimental results.
