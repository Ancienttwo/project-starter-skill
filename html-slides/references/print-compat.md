# Print/PDF Compatibility Reference

## PDF Unsupported CSS Effects

These CSS features render incorrectly or not at all when printing to PDF:

| Effect | Problem | Solution |
|--------|---------|----------|
| `box-shadow` | Renders as solid blocks | Use `border` instead |
| `backdrop-filter: blur()` | Not supported | Remove or use solid background |
| `text-shadow` | May not render | Remove for print |
| `-webkit-background-clip: text` | Shows background as rectangle | Use solid `color` |
| `linear-gradient` on backgrounds | May render as solid block | Use solid colors |
| `radial-gradient` | Often fails | Use solid colors |
| `filter: drop-shadow()` | May not render | Remove for print |
| `opacity` < 1 | Inconsistent | Use solid colors |

## Critical Print CSS Rules

### Page Setup

```css
@media print {
    @page {
        size: 297mm 167mm; /* 16:9 landscape */
        margin: 0;
    }
}
```

Common page sizes:
- 16:9 landscape: `297mm 167mm`
- 4:3 landscape: `297mm 223mm`
- A4 landscape: `297mm 210mm`
- Letter landscape: `279mm 216mm`

### Enable Multi-Page Printing

**Problem**: Only first page prints when using `height: 100vh` + `overflow: hidden`

**Solution**:
```css
@media print {
    html, body {
        overflow: visible !important;
        height: auto !important;
    }

    .slide {
        width: 297mm;
        height: 167mm;
        page-break-after: always;
        page-break-inside: avoid;
        break-after: page;
        break-inside: avoid;
        overflow: hidden;
    }

    .slide:last-child {
        page-break-after: auto;
    }
}
```

### Preserve Colors

```css
@media print {
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
}
```

### Disable Unsupported Effects

```css
@media print {
    * {
        box-shadow: none !important;
        text-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }
}
```

### Fix Gradient Text

**Problem**: `-webkit-background-clip: text` shows background as rectangle

**Solution**:
```css
@media print {
    .gradient-text {
        background: none !important;
        -webkit-background-clip: unset !important;
        background-clip: unset !important;
        -webkit-text-fill-color: #FF9500 !important;
        color: #FF9500 !important;
    }
}
```

### Replace Gradients with Solid Colors

```css
@media print {
    .card {
        background: #FFFFFF !important; /* Not linear-gradient(...) */
        border: 1px solid #E2E8F0 !important;
    }
}
```

## Print Typography

Use `pt` (points) for print font sizes, not `px` or `rem`:

```css
@media print {
    h1 { font-size: 26pt; }
    h2 { font-size: 20pt; }
    h3 { font-size: 12pt; }
    p, li { font-size: 9pt; }
    .small { font-size: 7pt; }
}
```

## Print Spacing

Use `mm` for print spacing:

```css
@media print {
    .slide { padding: 10mm 14mm; }
    .content { gap: 3mm; }
    .card { padding: 4mm; margin: 3mm 0; }
}
```

## Grid Layout for Print

**Problem**: `auto-fit` with `minmax()` creates unpredictable column counts

**Solution**: Use fixed column count
```css
@media print {
    .stat-grid {
        grid-template-columns: repeat(3, 1fr) !important;
    }
}
```

## Monospace Fonts for ASCII Art

**Problem**: Non-monospace fonts break ASCII diagrams alignment

**Solution**:
```css
.diagram {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
}
```

## Hide Interactive Elements

```css
@media print {
    .nav,
    .nav-dot,
    button,
    .interactive {
        display: none !important;
    }
}
```

## Browser Print Dialog Tips

1. **Safari** (macOS): Best PDF output, respects `@page size`
2. **Chrome**: May add headers/footers - disable in print dialog
3. **Firefox**: May not respect custom page sizes

**Recommended workflow**:
1. Open HTML in Safari
2. `Cmd + P` → Print
3. Select "Save as PDF"
4. Check "Background graphics" if colors missing
