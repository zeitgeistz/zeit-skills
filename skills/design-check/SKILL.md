---
name: design-check
description: Review an existing web or app UI for usability, accessibility and AI-generated "slop" patterns (generic gradients, card grids, filler copy), then list ranked fixes. Use for /zeit:design-check. Reports by default; applies small fixes only if asked.
argument-hint: <path-to-page-or-component> [optional: "fix"]
disable-model-invocation: true
---

# zeit:design-check

Judge the UI as a user would see it. Be specific. A good review names the element, the problem, and the exact fix.

## 1. Look at it

- Read the page or component code and every stylesheet or token file it imports.
- If a dev server is running or easy to start (use the project's `dev`/`start` script), take screenshots at 375px (phone) and 1280px (desktop). Check the layout visually when you can. If you cannot run it, say the review is code-only.

## 2. Anti-slop check

Flag each pattern that appears. These are the usual signs of unreviewed AI output:

**Color and surfaces**
- Purple, indigo, or blue-to-pink gradient as the main background or button color, with no brand reason.
- Gradient text on headings.
- Glassmorphism (blurred translucent cards) or glowing blur blobs in the background without a clear purpose.
- More than 3 accent colors on one screen.
- Pure black `#000` text on pure white, or light gray text below 4.5:1 contrast.

**Layout**
- Hero, then a row of 3 identical feature cards with icon, title, and one line, then a CTA, then a footer. Copy the structure only if the content really needs it.
- Everything centered. Left-aligned text is easier to scan.
- Every section the same height and padding (no rhythm, no focal point).
- Rounded corners, shadows, and borders on everything. Pick one radius and one shadow level.
- Nested cards inside cards.

**Type**
- One font weight everywhere, or five weights with no pattern.
- Body text under 16px on mobile, or line length over about 80 characters.
- All-caps labels on every element.
- No clear heading scale (every heading looks the same size).

**Icons and images**
- Emoji used as UI icons.
- Stock-style abstract blobs or generic 3D shapes with no link to the product.
- Placeholder images left in (gray boxes, `placehold.co`, Unsplash links with no subject).

**Copy**
- Lorem ipsum or "Lorem" anywhere.
- Filler headings: "Unlock the power of...", "Seamless experience", "Next-level", "Revolutionize your workflow", "Elevate your".
- Fake numbers or testimonials with no source ("10,000+ happy users").
- Three-word tagline pattern used for every heading.
- Multiple "Get started" or "Learn more" buttons competing with each other.

**Structure**
- No empty, loading, or error state in any component that fetches data.
- Buttons with no visible focus state.
- Icon-only buttons with no label.

## 3. Usability and accessibility check

- **Hierarchy**: one clear primary action per screen. Can you tell what to do in 3 seconds?
- **Spacing**: uses a consistent scale (e.g., 4/8/12/16/24/32). Flag random values like 13px or 37px.
- **Contrast**: text meets WCAG AA (4.5:1 normal, 3:1 large). Check tokens, not just one screen.
- **Touch targets**: at least 44×44px on mobile.
- **Keyboard**: every control reachable with Tab, and focus is visible.
- **Labels**: every input has a label, not just a placeholder.
- **Mobile**: no horizontal scroll at 375px. Text does not overflow or overlap.
- **Motion**: animations respect `prefers-reduced-motion`.

## 4. Report

```
Summary: 4 slop patterns, 2 usability issues. Biggest problem: no primary action on the hero.

1. [High] Hero has 3 equal-weight buttons - src/Hero.tsx:24
   Problem: user cannot tell what to do first.
   Fix: keep one filled button ("Start free trial"), make the other a text link.

2. [Medium] Purple-to-pink gradient background - src/styles/hero.css:6
   Problem: generic AI look, no brand link.
   Fix: use the brand color token `--color-primary` on a flat background.

3. [Medium] Body text 14px on mobile - src/styles/base.css:12
   Fix: set 16px minimum for body text.

Not checked: live rendering (no dev server). Code-only review.
Next: say "fix 1-3" and I'll apply them as small diffs.
```

Rules:
- Rank by user impact, not by how many patterns appear.
- Max 10 findings. Group the rest as one line: "5 more minor items: ..."
- Do not praise the design. Say what is wrong and how to fix it.
- Do not suggest a full redesign unless the page has a serious usability failure.

## 5. Fix mode (only if the user says "fix")

- Apply only the listed fixes, as small diffs, one file at a time.
- Keep the brand colors, fonts, and copy unless the fix is about copy.
- Do not add new components, animations, or libraries.
- Run the project's build after the changes. Report the result.
- Show a before/after for each visual change.
