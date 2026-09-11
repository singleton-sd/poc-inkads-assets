# House ad (800×480 B/W)

Editable source for the InkAds **default / fallback** creative shown on
Waveshare 7.5″ B/W panels when no campaign creative is scheduled
(POC-260 / ClickUp track — assets only; no firmware in this repo).

## Composition

| File | Role |
| --- | --- |
| `house-ad-800x480.svg` | Master composition (viewBox `0 0 800 480`) |
| `qr-go.svg` | Generated QR modules (260×260, ≥4-module quiet zone) |

Layout (left → right):

1. Mono brand mark (from `src/logo/sources/mono.svg`), **InkAds** wordmark, **BY SINGLETON SD**
2. Concise CTA: “Advertise here” / “Put your brand on display” / “Scan to learn more”
3. Large QR in a framed quiet panel (~260px)

Colors are **pure black / white** only for reliable 1-bit e-paper thresholding.
Yellow brand accents are intentional omissions here — they do not survive 1 bpp.

## QR target URL

The QR encodes the stable marketing redirect:

```text
https://inkads.poc.singletonsd.com/go
```

Final destination is configured on the marketing `/go` route — do **not** hardcode
`/contact` (or any other deep link) into the QR. Keep the URL out of SVG files
(comments / text / hrefs); `assertSvgSafe` rejects `https?:` / `//` outside
approved W3C xmlns.

## Regenerate QR

```sh
pnpm generate:house-ad-qr
```

Script: `scripts/generate-house-ad-qr.mjs` (devDependency `qrcode`). Writes
`qr-go.svg` only; the master SVG references it via relative `<image href="qr-go.svg">`.

## Venue distance / readability

- Designed for ~1–2 m hospitality viewing (lobby / corridor / F&B, not bathroom-only).
- CTA type ≥20 px at 800×480; primary headline ~36 px.
- QR ≥220 px with margin 4 modules — prefer threshold mono render (issue #10), not dither, so modules stay crisp.
- Keep the framed white quiet zone; do not crop into the QR when compositing.
