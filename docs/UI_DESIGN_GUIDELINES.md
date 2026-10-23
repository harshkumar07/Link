# UI Design Guidelines

These rules apply to every new screen and every meaningful redesign in Link. Read this file before implementing UI. Treat it as an engineering requirement, not optional inspiration.

Design reference: [Anthropic Claude Code — frontend-design skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md). This document distills project-specific guidance; consult the original for the full design process.

## 1. Start with the product and a design plan

Before writing UI code:

1. Identify the user, the job the screen needs to do, and its most important action.
2. Write a compact plan: named color tokens, typography, layout/alignment, interaction behavior, and the one distinctive visual idea.
3. Check that the concept fits Link and this screen rather than looking like a generic SaaS template. Revise generic choices before implementation.
4. Use realistic example content that demonstrates the product. Avoid empty sections, repetitive placeholder copy, and decorative elements with no purpose.

## 2. Visual design

- Make deliberate, cohesive choices for color, type, spacing, alignment, and component hierarchy.
- Typography should have a clear scale and purposeful weights. Use one or two complementary font families; keep body text readable and line lengths comfortable (usually under 80 characters).
- Use sentence case and plain, user-centered language. Avoid unnecessary all-caps eyebrow labels, decorative numbering, excessive metadata strings, and arrows appended to every CTA.
- Do not default automatically to cream-and-terracotta, black-and-neon, editorial hairlines, generic rounded-card grids, or gradient washes. These can be used only when justified by the specific design direction.
- Use borders, shadows, radii, labels, and dividers to communicate hierarchy or interaction—not as decoration. Avoid giving every element the same card, radius, and shadow treatment.
- Pick one memorable visual idea and keep surrounding UI disciplined. Remove ornament that does not help users understand or act.
- Keep copy concise, specific, active, and consistent. An action label and its confirmation should use the same verb (for example, “Publish” → “Published”).

## 3. Interaction and accessibility

- Every visible control must do what its label promises. Provide hover, active, disabled, loading, success, empty, and error states where relevant.
- Show clear keyboard focus. Use semantic elements, accessible names, sufficient contrast, and touch targets appropriate for mobile.
- Respect `prefers-reduced-motion`. Use motion sparingly; animation should communicate a change or provide useful feedback, not decorate every element.
- Explain what went wrong and how to recover. Empty states should point to the next useful action.
- Avoid CSS selector conflicts and unintended cascade overrides. Prefer component-scoped, purposeful class names and design tokens over accumulating conflicting patches.

## 4. Responsive implementation

- Build mobile-first where practical and verify narrow phones, typical mobile widths, tablets, and desktop layouts.
- Avoid fixed widths that overflow; use fluid containers, sensible max-widths, responsive grids, and content that wraps.
- Check real content, long names/URLs, zero-data states, and large/small link counts—not just the ideal screenshot.
- Review the finished screen visually at more than one viewport when tooling is available. Run typecheck, lint, tests, and build checks before declaring the work complete.

## 5. Link profile themes and live device preview

- Treat **page layout**, **color palette**, **link-button treatment**, and **device frame** as separate settings.
- A theme change must update the preview immediately and be reflected in the public profile. Do not style only the editor preview.
- Persist appearance settings deliberately. Browser-only storage is a local preview preference, not a substitute for account-level saved settings.
- Device frames are illustrative browser previews, not screenshots of a physical phone. Maintain accurate proportions and safe-area spacing; don't invent a device silhouette by setting arbitrary width and height.

### iPhone 17 Pro reference dimensions

Use these specifications for the iPhone 17 Pro preset:

- Display diagonal: **6.3 inches**.
- Logical viewport: **402 × 874 CSS points** (portrait).
- Native display resolution: **1206 × 2622 pixels**, at 3× scale.
- Physical device body: approximately **71.9 × 150.0 mm**.
- The display includes a Dynamic Island and rounded corners.

The preview is intentionally scaled to fit the editor; it must preserve the device's portrait proportions rather than render at literal 402-pixel width. Use the physical body ratio for the outer shell and the 402:874 ratio for the inner viewport. Content should scroll inside the simulated screen without stretching the device or pushing its frame taller. Provide distinct proportions for other device presets and a frameless option.

## 6. Definition of done for UI work

- [ ] Design plan is specific to the page and its users.
- [ ] Layout and content hierarchy are clear, with no unnecessary decoration.
- [ ] Responsive behavior is checked at mobile and desktop widths.
- [ ] Keyboard focus, contrast, semantic markup, and reduced-motion behavior are considered.
- [ ] Controls, empty states, loading states, errors, and confirmations behave correctly.
- [ ] Theme selections affect both the live preview and the actual public page.
- [ ] Phone frame proportions match the selected device and the content scrolls within the screen.
- [ ] Typecheck, lint, tests, and production build pass.
