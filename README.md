# Meet landing page

An implementation of the [Frontend Mentor Meet landing page challenge](https://www.frontendmentor.io/challenges/meet-landing-page-rbTDS6OUR), using its supplied photos, logo, copy and Figma design. The premium design file is not committed.

Meet is a practice brand. The Download buttons explain that there is no app to download, and nothing is sent anywhere. "What is it?" jumps to the feature section.

## Development

Node 22.13 or later. Use `npm ci`, `npm run dev`, `npm run lint`, `npm run build`, `npm run typecheck` and `npm test`. Browser tests use installed Chrome and own port 4573.

Next 16.3.6, React 19.2.8, TypeScript 5.9.3 and Tailwind 4.2.1 are pinned to the family baseline. The page is a server component; only the Download button is a client component.

## Sources

The original starter README, `index.html` and preview are under `reference/`; supplied images moved byte-for-byte to `public/images/`. Layout, spacing, type sizes and hover colours follow the decoded Figma frames Desktop (1440), Desktop - Hover, Tablet (768) and Mobile (375). Red Hat Display 500/900 is served through `next/font`. The teal tint over the footer photo is recreated with a gradient overlay, since the starter ships the untinted photo.

## Implementation choices

- The desktop layout starts at 1200px, the narrowest width that fits the 1120px design row. Below that the tablet arrangement (one combined face strip above centred copy) is used. The face clusters are decorative CSS backgrounds anchored to their columns as in Figma, and clip at the viewport edge. Below 1200px the combined strip is a centred background on a full-width row rather than a box wider than the hero, so nothing spills out of the hero row (width sweep, October 8, 2026).
- Contrast: the design's grey `#87879d`, cyan `#4d96a9` text and white-on-`#4d96a9` buttons are about 3.3:1, under WCAG AA. Body grey and the numbered markers use `#6e6e85`, the eyebrow `#367586`, and the resting button fills deepen to `#2f6d7d` and `#6f4a9a` with paler "v1.3" tints, all at least 4.5:1. Hover uses the design's exact lighter fills (`#71c0d4`, `#b18bdd`) with dark text. Button colors change together without interpolation, keeping both the label and version readable throughout hover changes. The footer overlay is a 92% deep teal so its white text passes over the brightest part of the photo.
- The design's 12px and 14px eyebrow and the 01/02 markers are held at the 16px family floor.
- One site name, "Meet landing page", appears in the footer, `og:site_name` and `WebSite` JSON-LD. The canonical URL is the attached `meet-landing-page-fm.royeradames.com` production domain.
