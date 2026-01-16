---
name: html-slides
description: |
  Create print-ready HTML slide presentations that export cleanly to PDF.
  Use when: (1) Creating pitch decks, presentations, or slide shows
  (2) User asks for "PPT", "slides", "presentation", or "deck"
  (3) Need HTML that prints as multi-page PDF without layout issues
  Outputs single HTML file with embedded CSS, scroll-snap navigation, and print-optimized styles.
---

# HTML Slides

Create HTML presentations that display in browser and print to PDF.

## Quick Start

1. Copy template from `assets/template.html`
2. Replace `{{PLACEHOLDERS}}` with content
3. Add slides following the patterns below
4. Test print with `Cmd+P` → "Save as PDF"

## Slide Structure

```html
<section class="slide" id="slideN">
    <div class="content">
        <h2>Title</h2>
        <h3>Subtitle</h3>
        <!-- content -->
    </div>
    <div class="slide-number">N / TOTAL</div>
</section>
```

Cover slide uses `class="slide cover"` without `.content` wrapper.

## Available Components

| Component | Class | Use For |
|-----------|-------|---------|
| Stat Grid | `.stat-grid` > `.stat-card` | 2×3 metrics display |
| Two Column | `.two-column` | Side-by-side content |
| Comparison | `.comparison` > `.comparison-card.bad/.good` | Before/after, pros/cons |
| Quote | `.quote` > `.quote-author` | Testimonials, citations |
| Table | `<table>` | Data tables |
| Code Block | `.flow-diagram` or `.architecture` | ASCII diagrams, code |
| Highlight | `.highlight` | Emphasized inline text |
| Pill | `.pill` | Tags, labels |
| CTA Button | `.cta-button` | Call-to-action |

## Component Examples

### Stat Grid (2×3)
```html
<div class="stat-grid">
    <div class="stat-card">
        <span class="stat-number">50%</span>
        <span class="stat-label">Description</span>
    </div>
    <!-- 5 more stat-cards -->
</div>
```

### Comparison Cards
```html
<div class="comparison">
    <div class="comparison-card bad">
        <h3>Problem</h3>
        <ul><li>Issue 1</li></ul>
    </div>
    <div class="comparison-card good">
        <h3>Solution</h3>
        <ul><li>Benefit 1</li></ul>
    </div>
</div>
```

### Quote
```html
<div class="quote">
    "Quote text here."
    <div class="quote-author">— Name, Title</div>
</div>
```

## Print Compatibility Rules

**CRITICAL**: PDF does not support these CSS effects:

| Avoid | Use Instead |
|-------|-------------|
| `box-shadow` | `border` |
| `backdrop-filter` | solid background |
| `-webkit-background-clip: text` | solid `color` |
| `linear-gradient` backgrounds | solid colors |
| `filter: drop-shadow()` | remove |

Template includes `@media print` rules that handle these automatically.

For detailed print CSS patterns, see [references/print-compat.md](references/print-compat.md).

## Color Customization

Edit CSS variables in `:root`:
```css
--primary: #FF9500;      /* Brand color */
--primary-light: #FFB84D;
--primary-soft: #FFF4E6; /* Light tint */
--bg-warm: #FFFBF7;      /* Slide background */
```

## Print Workflow

1. Open HTML in **Safari** (best PDF support)
2. `Cmd + P`
3. Destination: "Save as PDF"
4. Check "Background graphics" if colors missing
5. Should show correct page count (one per slide)

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Only 1 page prints | `overflow:hidden` on body | Template handles this |
| Gradient shows as rectangle | `-webkit-background-clip:text` | Use solid color in print |
| Colors missing | Print setting | Enable "Background graphics" |
| Stat grid wrong columns | `auto-fit` grid | Template uses fixed `repeat(3,1fr)` |
| ASCII diagram misaligned | Non-monospace font | Use `.flow-diagram` class |
