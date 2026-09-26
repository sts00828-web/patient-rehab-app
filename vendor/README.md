# Vendored browser libraries

Existing dependency versions were retained and downloaded from jsDelivr on 2026-09-18 so QR transfer also works after an offline reload.

- lz-string 1.5.0 — https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js
- qrcode-generator 1.4.4 — https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js
- html5-qrcode 2.3.8 — https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js

Upstream license files are included alongside the distributions. No patient data is sent to jsDelivr at runtime.

## TASK-021 local patch: opt-in native camera sampling

`html5-qrcode.min.js` 2.3.8 has two local edits; preserve/reapply them when replacing the vendor file:

1. Internal scan configuration `X` copies `useNativeResolution === true` from the start configuration (default remains false).
2. `Html5Qrcode.prototype.foreverScan` retains the existing source crop, but when enabled sizes the hidden decoding canvas to source crop pixels, proportionally capped at a 1920px long edge (no upscaling). It draws to that canvas size instead of CSS `qrRegion` dimensions and resets the context transform before each native draw, including after mirrored retries.

Reason: upstream `setupUi` creates a CSS-sized canvas and `foreverScan` draws high resolution camera frames into that small destination. Merely removing `qrbox` or requesting HD video does not retain dense QR detail. No decoder algorithm, camera lifecycle, file scanning, or default behavior was replaced. The app opts in, omits `qrbox`, requests ideal 1920x1080 video, and limits decoding to QR at 5 fps. The image exists only in the scanner's in-memory canvas.

Regression coverage: `tests/qr-camera.test.cjs` (actual patched sampling method, real ZXing decoding of six-exercise synthetic pixels, lifecycle tests) and `tests/qr-camera-browser.cjs` (real video/decoder scenario; requires Chrome). Optical phone testing remains necessary.

## TASK-022 local patch: await initial video playback

Preserve this lifecycle patch as well as both TASK-021 sampling edits above. `RenderedCameraImpl.setupSurface` returns and handles the initial `surface.play()` Promise; `create` waits for it before returning the camera. Previously startup resolved while playback was pending, so immediate cancellation could remove the video and leave its rejected `play()` Promise unhandled (`AbortError`). The app already waits for startup before stopping, so awaiting playback closes this race without suppressing errors.

If playback rejects (or throws synchronously), remove the pending `playing` listener, close the camera to release tracks/video, and propagate the original error through `start()` to the existing camera-start failure display. Rejection settles startup instead of waiting indefinitely for a `playing` event. No global rejection handler or blanket AbortError suppression is added. Bundled in the existing v53 service-worker asset list.

Regression coverage: `tests/qr-camera.test.cjs` exercises the real vendor startup with deferred playback, cancellation, and playback rejection; the parent reruns the real Chrome QR scenario after this change.

## TASK-023 local patch: start scanning after camera assignment

Preserve this startup-order fix with TASK-021 and TASK-022. The `onRenderSurfaceReady` callback now only calls `setupUi`. After `render()` resolves, `start()` assigns `renderedCamera`, commits the SCANNING state transition, sets `isScanning`, and calls `foreverScan` once. TASK-022 made playback finish before camera assignment; starting the loop in the surface callback therefore returned without scanning or scheduling another frame because `renderedCamera` was still null.

Regression coverage: `tests/qr-camera.test.cjs` checks that startup does not scan while playback is pending, that camera/UI/state are ready at the sole initial scan, that repeated playing notifications do not start another loop, and that cancellation and playback rejection still release the camera. Existing native-resolution sampling and app duplicate-import checks remain in place. The browser fixture retains its periodically updated synthetic video, integer coordinates, and 1020px sizing. Run `node tests/qr-camera-browser.cjs` to verify actual video-to-ZXing decoding and six-exercise import; unit tests alone do not establish browser acceptance. The TASK-023 implementation environment attempted this command, but Chrome did not start, so that browser validation remains pending. Service-worker version remains v53.

## 2026-09-26 browser fixture verification

The six-exercise fixture uses random prescription IDs, so the generated QR matrix changes between runs. Some high-version matrices fail ZXing finder detection when held at one perfectly static, axis-aligned pose, even though their data is valid. The video fixture now cycles through distance and angle changes (including a quarter-turn), preserving the actual generated QR, full video/canvas pipeline, vendored ZXing decoder and exact imported-payload assertion. Initial static decoding is logged separately. The former low-resolution configuration must still fail the same moving fixture. Three independent runs passed at both 320px and 390px after the catalog update. This verifies synthetic camera decoding, not physical phone focus/lighting performance. No decoder or sampling behavior was changed for this test update.
