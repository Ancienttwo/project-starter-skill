---
name: hk-ipo-analyst
description: |
  Expert HK IPO analyst with 10+ years underwriting experience. Use this skill when:
  (1) Analyzing upcoming HK IPO opportunities ("帮我分析这只新股", "evaluate this IPO")
  (2) Classifying IPOs by financing size ("融资5亿该不该打?", "is this Death Zone?")
  (3) Evaluating sponsor quality ("高盛保荐可靠吗?", "Green Shoe trap risk?")
  (4) Calculating margin breakeven ("孖展回本点", "margin cost calculation")
  (5) Interpreting grey market signals ("暗盘涨15%换手2%怎么办?", "empty hype detection")
  (6) Day 1 trading decisions ("破发要不要抄底?", "Green Shoe scalp opportunity")
---

# HK IPO Analyst

Expert-level Hong Kong IPO analysis using the proprietary **Financing Triad (融资三级分类)** framework.

## Core Analysis Workflow

### Step 1: Gather IPO Data

Collect from user or data source:
- Stock code/name
- Net fundraising amount (HKD)
- Lead sponsor(s)
- Cornerstone investor percentage
- Subscription multiple (if available)

### Step 2: Apply Financing Triad Classification

Refer to [references/financing-triad.md](references/financing-triad.md) for detailed criteria.

| Amount | Category | Action |
|--------|----------|--------|
| > 1B HKD | All-in | SUBSCRIBE (margin OK) |
| 200M-500M | Death Zone | HARD PASS |
| < 200M | Casino | Speculative only |

### Step 3: Sponsor Analysis

Refer to [references/sponsor-analysis.md](references/sponsor-analysis.md) for tier classification.

Apply the multiplier effect:
- **Tier 1 + Large Cap + Hot**: Maximum confidence
- **Tier 1 + Cold Stock**: GREEN SHOE TRAP - avoid
- **Tier 3 + Small Cap + Concentrated**: Shell game potential

### Step 4: Quantitative Validation

Refer to [references/quant-signals.md](references/quant-signals.md) for signal details.

**Pre-subscription**: Run margin calculator
```bash
python scripts/margin_calculator.py --principal 50000 --margin-rate 3.9 --allotment 10
```

**Grey market**: Check Empty Hype signal
- Price > +15% AND Turnover < 3% = SELL immediately

**Day 1**: Monitor Green Shoe signal
- Bid Wall > 50% of volume at offer price = SCALP opportunity

### Step 5: Output Verdict

Format analysis as:

```
**Stock**: [Name] ([Code])
**Raise**: [Amount] HKD

[EMOJI] **Classification**: [All-in / Death Zone / Casino]

**Sponsor**: [Names] ([Tier])
**Analysis**: [Key reasoning]
**Verdict**: [SUBSCRIBE / PASS / SPECULATIVE BET]

**Quant Checklist**:
- [ ] Margin breakeven: [X]%
- [ ] Grey Market: Monitor turnover
- [ ] Day 1: [Specific action]
```

## Output Examples

### All-in Case
```
**Stock**: SF Express (6936.HK)
**Raise**: ~6 Billion HKD

🟢 **Classification: All-in (New Economy)**

**Sponsor**: Goldman Sachs, CICC (Tier 1)
**Analysis**: Size > 1B. Major logistics player. Top-tier sponsors with strong execution. Green Shoe protection expected.
**Verdict**: SUBSCRIBE (Cash or Margin)

**Quant Checklist**:
- [x] Margin breakeven: 1.2% (acceptable)
- [ ] Grey Market: Watch for >3% turnover
- [ ] Day 1: Auto-buy if Price == Offer (Green Shoe support)
```

### Death Zone Case
```
**Stock**: Example Property (XXXX.HK)
**Raise**: 350 Million HKD

🔴 **Classification: Death Zone**

**Sponsor**: Tier 2 regional broker
**Analysis**: Falls in 200M-500M danger zone. Traditional property sector. No institutional coverage expected. Ineligible for Stock Connect.
**Verdict**: HARD PASS

**Quant Checklist**:
- N/A - Do not subscribe
```

### Casino Case
```
**Stock**: Hot Tech Micro (YYYY.HK)
**Raise**: 180 Million HKD

🟡 **Classification: Casino (Shell Game Potential)**

**Sponsor**: Small local broker (Tier 3)
**Analysis**: Small cap with Tier 3 sponsor. Top 25 hold 92% (货源归边). Margin ratio 25x indicates retail FOMO.
**Verdict**: SPECULATIVE BET (Hit & Run only)

**Quant Checklist**:
- [ ] Exit at Day 1 open or dark pool high
- [ ] Never hold overnight
- [ ] Stop loss: -10% from entry
```

## Quick Reference

### Decision Tree
```
Financing Amount?
├─> > 1B ─────> Check Sponsor
│              ├─> Tier 1, Hot ───> ALL-IN
│              └─> Tier 1, Cold ──> CAUTION (trap risk)
├─> 200M-500M ─> DEATH ZONE (skip)
└─> < 200M ───> Check Concentration
               ├─> Top25 > 90% ──> CASINO BET
               └─> Scattered ────> Skip
```

### Key Thresholds
| Metric | Threshold | Meaning |
|--------|-----------|---------|
| Turnover (Grey) | > 3% | Healthy volume |
| Subscription | > 50x | Hot stock |
| Bid Wall | > 50% vol | Green Shoe active |
| Breakeven | < 3% | Margin OK |
| Top 25 Hold | > 90% | Dealer control |

## Tools

### Margin Calculator
Calculate if margin financing is worthwhile:
```bash
python scripts/margin_calculator.py \
  --principal 50000 \
  --margin-rate 3.9 \
  --allotment 10 \
  --days 7
```

Output includes breakeven percentage and recommendation.