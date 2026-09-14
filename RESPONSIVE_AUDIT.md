# Frontend responsive audit

Reviewed 2026-09-14 against the local development site at `http://localhost:3000`.

**Verdict: partially responsive, but not ready to claim good support for every device.** The main desktop layouts work, and the photo grid adapts. Mobile report content and tablet admin navigation need corrections. A page fitting the viewport does not mean all its nested content is readable or reachable.

## Coverage and method

The review covered both actual routes (`/` and `/admin`), all four inspection screens (checklist, results, paywall, unlocked report), both damage-overlay implementations, and all five admin tabs (Dashboard, Inspections Log, Registered Users, Revenue & Payments, System Settings).

- Ran 30 browser layout measurements: five main views at **320, 375, 390, 768, 1024 and 1440 CSS pixels** wide. Narrow viewports used 844px height in the measurement harness; others used 900px. Windows scrollbars consume some available layout width.
- Used direct browser viewport screenshots for representative mobile, tablet and desktop views, including 320×740, 375×844, 768×1024 and 1440×900.
- Opened each non-overview admin tab at 375, 768 and 1440px and verified that its content rendered. These are mostly placeholder panels and share the same navigation/header defects.
- Tested the results photo overlay at 320px portrait and **844×390 landscape**, including a measured close-button height. Opened the unlocked overlay too; its implementation shares the same geometry. A later capture/measurement of that overlay timed out, so the 18.84px measurement below belongs specifically to the results overlay.
- Used temporary local fixtures importing the **actual unchanged components**, with four synthetic findings, an existing embedded demo image and `responsive.test@example.com`. The fixture reproduced the root page's wrapper and props. Results/payment/report layouts were inspected without AI calls, checkout submissions or database writes.
- Inspected source classes and line locations to explain observed issues. Removed the temporary fixture/harness after review. No responsive fixes were applied.

This is viewport testing in the Codex in-app browser, not physical-device or Safari/Firefox certification. Camera hardware, mobile file pickers, virtual keyboard, browser zoom, screen readers, network performance, real payment flow and generated PDF layout were not tested. The PDF is a backend document, not another responsive frontend page.

## Page-by-page assessment

| Screen | Desktop (1440px) | Tablet (768–1024px) | Mobile (320–390px) |
| --- | --- | --- | --- |
| Header and photo checklist | Four-column photo grid, balanced layout | Three columns at 768; four-column rule at 1024 | One column fits; progress badge wraps awkwardly, camera/gallery targets are small |
| Results preview | Diagram and cards fit side-by-side | Responsive layout rules switch between stacked and split views | Fits width; compact labels/legend and long vertical journey before report CTA |
| Paywall | Centered constrained-width form | Fits viewport | Fits at 320; gateway labels wrap and lower controls require scrolling; no clipping failure confirmed in the tested data |
| Unlocked report | Broad layout accommodates cards | Two-column cards render with ordinary sample labels | **Needs fixes:** banner clips at 320, finding names truncate heavily at 320–375, verification footer breaks into cramped lines |
| Damage overlays | Overlay positioning is incorrect whenever the image is letterboxed | Same geometry issue | Portrait dialog opens; **landscape needs fixes:** box covers black margins and Close Overlay shrinks |
| Admin dashboard | Main layout fits; small supporting text remains dense | **Needs fixes at 768:** shared header action clips, stat labels crowd; table scroll is separate | **Needs fixes:** full-height navigation consumes first screen; dashboard labels/date controls crowd |
| Admin inspections/users/revenue tabs | Placeholder content renders | Same shared header clipping at 768 | Same full-height navigation problem |
| Admin settings | Price field and button render | Form fits, shared header still clips | Form renders below full-screen navigation; save behavior is mock, not part of layout validation |

## Prioritized findings and exact change locations

### R1 — Tablet admin header hides a navigation action (high)

**Observed at 768×1024 on overview and settings.** The title breaks into three lines, the fixed-width search field occupies most remaining space, and the “Back to Web App” link extends past the visible right edge. The main content region can scroll horizontally even though the document-wide overflow check says the page fits.

Source: [admin/page.js](src/app/admin/page.js), lines **95–122**, especially `flex items-center justify-between`, `w-64` search and the unwrapped action row. The fixed 256px sidebar begins at `md`, reducing space available for this header.

Recommended change: give the main region `min-w-0`, stack/wrap the header at intermediate widths, make search flexible or move it to a second row, and retain adequate width for the back link. Do not hide the problem by applying page-wide `overflow-x-hidden`.

Acceptance: at 768px, all header controls are visible without horizontally scrolling the main panel; repeat on each admin tab and at 1024px.

### R2 — Small-mobile report loses important text (high)

**Observed at 320×740 and 375×844.** At 320px, the payment banner's icon/text group exceeds its inner area: the icon protrudes and the sample email clips. In finding cards, an 80px nonshrinking thumbnail plus padding, gap and nonshrinking severity badge leaves almost no room for the part name. Labels such as “Front Bumper” collapse to a letter or tiny truncated fragment. At 375px they still truncate significantly. The footer's hash/signature labels also wrap into a cramped multi-line row.

Source: [UnlockedReport.jsx](src/components/UnlockedReport.jsx), lines **134–155** (banner), **160–168** (heading/count), **174–190** (cards), **218–220** (footer).

Recommended change: stack banner content at narrow sizes, use `min-w-0` and breakable email text, move severity to its own row, allow part names to wrap, reduce/stack thumbnail placement, and stack footer items. Move the unlocked count below the heading on very narrow screens.

Acceptance: full ordinary part names and the sample email remain readable at 320px; test longer names/emails separately. No truncation should hide the identity of a damaged part.

### R3 — Damage boxes do not stay aligned with the image (high)

**Visually confirmed in the results overlay at 844×390.** The image is centered with `object-contain`, leaving black side margins. The damage rectangle is positioned as a percentage of the full container, so it crosses into the black margin instead of remaining aligned to the image. At other aspect ratios the error changes direction/size.

Source: [CarMapResults.jsx](src/components/CarMapResults.jsx), lines **108–127**; duplicated in [UnlockedReport.jsx](src/components/UnlockedReport.jsx), lines **105–121**.

Recommended change: position the overlay relative to the actual rendered image bounds, including letterbox offsets, or use an intrinsic-ratio wrapper shared by the image and overlays. Match the selected box's image ID to the displayed image. Preserve the backend coordinate order `[ymin,xmin,ymax,xmax]`.

Acceptance: a box remains attached to the same image pixels in portrait and landscape, with wide and tall photos, and never draws over a letterbox margin merely because the viewport changed.

### R4 — Landscape modal compresses the close control (medium)

**Measured in the results overlay at 844×390:** “Close Overlay” rendered at approximately **18.84 CSS pixels high**, despite `h-11` in source. The flex column, viewport max-height, image and gaps consume the available height and the button shrinks. This is hard to tap. The unlocked overlay has the same structural pattern, but a separate landscape measurement did not complete.

Source: [CarMapResults.jsx](src/components/CarMapResults.jsx), lines **90, 109, 130–135**; analogous blocks in [UnlockedReport.jsx](src/components/UnlockedReport.jsx), lines **87, 105, 124–129**.

Recommended change: prevent header/footer controls from shrinking, constrain/scroll the image/body region, and use a deliberate short-viewport layout. Add a minimum usable button height. Also add dialog semantics, focus management and Escape behavior in a separate accessibility pass.

Acceptance: at 844×390 and smaller landscape heights, the close action remains visible and comfortably tappable without squeezing to a thin strip.

### R5 — Mobile admin navigation occupies the whole first screen (medium)

**Observed at 375×844.** Only the sidebar is visible initially, with a large empty middle area and user identity near the bottom. The actual dashboard starts after a full viewport of navigation. This repeats for every admin tab because the shared shell remains the same.

Source: [admin/page.js](src/app/admin/page.js), lines **16–19**: `flex-col md:flex-row` plus unconditional sidebar `min-h-screen`.

Recommended change: use a compact mobile header/drawer or horizontal navigation; apply full-height sidebar behavior only above the appropriate breakpoint. Keep the current selected tab apparent after changing tabs.

Acceptance: a mobile user can see the active page heading and some main content immediately, without first scrolling past an otherwise mostly empty full-height sidebar.

### R6 — Admin supporting text and controls crowd each other (medium)

**Observed at mobile and 768px.** Two-part statistic footers run together (particularly revenue/payment-provider text), growth badges wrap, and date-range buttons break into short multi-line fragments. Desktop is much better, but the small font and dense footer arrangement remain.

Source: [admin/page.js](src/app/admin/page.js), lines **141–197** (stats), **200–211** (trend heading/ranges), **241–249** (recent-inspection header/action).

Recommended change: stack footer labels at narrow card widths, add gaps, delay the four-column stats layout where necessary, and place range controls below the heading on small screens. Choose breakpoints based on available main-panel space, not only total viewport width.

Acceptance: labels have visible separation and actions retain readable labels at 375 and 768px. The inspection table may scroll within its own clearly bounded container; that is intentional and distinct from clipping the header.

### R7 — Checklist progress and touch controls need mobile polish (medium/low)

**Observed at 375px:** the progress pill splits "Progress:" and "0%" onto separate lines while the count heading also wraps. Camera/gallery actions are noticeably short and use 11px labels; source padding produces roughly 29px-high controls with normal line-height. No actual camera or gallery picker was opened.

Source: [PhotoChecklist.jsx](src/components/PhotoChecklist.jsx), lines **61–70** (progress), **169–180** (camera/gallery labels).

Recommended change: stack the count/progress row or keep the progress pill nonshrinking, and enlarge camera/gallery target height and spacing. Consider a more compact capture flow or a persistent progress/analyze area for the long fourteen-card mobile page.

**2026-09-14 fix applied:** Camera button is now hidden on desktop (no `videoinput` device detected via `navigator.mediaDevices.enumerateDevices()`). On mobile/tablet devices with a camera the Camera + Gallery two-column layout is preserved. On desktop the Gallery button (labelled "Upload Photo") expands to full width. Progress display replaced with an animated gradient bar + percentage. Subtitles adapt based on `hasCamera` value.

Acceptance: the progress display reads naturally at 320–390px; photo actions are easy to tap without adjacent mis-taps.

## Measurement results and interpretation

All 30 checks reported no **document-level** overflow beyond the viewport. That result is deliberately not called a pass for overall responsiveness: the admin `main` region creates its own scrolling context, report cards truncate text, and dialogs/images have internal layout defects. Visual inspection found the issues above even where the root width appeared correct.

| View | 320 | 375 | 390 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- | --- | --- |
| Checklist: document width fits | Yes | Yes | Yes | Yes | Yes | Yes |
| Results: document width fits | Yes | Yes | Yes | Yes | Yes | Yes |
| Paywall: document width fits | Yes | Yes | Yes | Yes | Yes | Yes |
| Unlocked: document width fits | Yes | Yes | Yes | Yes | Yes | Yes |
| Admin overview: document width fits | Yes | Yes | Yes | Yes | Yes | Yes |

The admin measurement flagged table cells beyond the viewport at mobile/tablet widths; their table wrapper intentionally uses `overflow-x-auto`. It additionally flagged the back link at 768px, which screenshots confirmed is a real navigation-layout issue.

## Suggested implementation order

1. Repair report banner/card readability and tablet admin header clipping.
2. Correct shared image-overlay coordinates and short-landscape dialog sizing.
3. Replace the full-height mobile admin sidebar with compact navigation.
4. Improve dashboard label wrapping and photo-action touch sizing.
5. Repeat all six widths, both orientations and all admin tabs; then test real iOS Safari and Android Chrome, virtual keyboards, zoom and long content.

Related architecture and exact existing flows are documented in [FRONTEND_ANALYSIS.md](FRONTEND_ANALYSIS.md). This audit records current observations, not completed fixes.
