# cartabio v0.2.1-preview

Offline review package, 2026-09-25. The ZIP contains only the current `index.html` page, its required assets, `START_HERE.cmd`, and `preview-server.ps1`. Legacy and duplicate preview pages, unused media, and their code are removed from the current source and package.

## Open on Windows

Extract the ZIP, then double-click `START_HERE.cmd`. It opens the homepage in the browser on a loopback-only local server, using an available port. Keep the terminal open while viewing. No Node.js, Python, installation, or internet connection is needed to view the extracted package. Do not open `index.html` with `file://`; it displays a launch hint because browser module and root-relative asset loading require HTTP.

## Verification

The ZIP contains 15 files and is 621,428 bytes. Every entry was SHA-256 compared with the production build. Unit, current-homepage browser, four-viewport 3D/story, content, and offline-server checks passed. The extracted-package test confirms styles, images, and nonblank 3D canvas rendering. Archive SHA-256: `A7FD4EF6023F4E21FB5516AB2F76C2627FBAF43E6F6724E82FE5506617EA60E1`.

## Review boundary

This is still a concept preview, not publication clearance. Historical image source/rights, current team roles/portrait rights, fixed-sample SAFE validation, service scope, and official contact details require confirmation. Consultation downloads a local draft and does not send data.
