# Quantitative Signals (量化信号)

> "手动打新看情绪，量化打新看数据。"

Three core signals to upgrade IPO strategy from 75% to 90%+ win rate.

---

## Signal A: Empty Hype Trap (暗盘陷阱)

**Phase**: Grey Market (16:15 - 18:30 pre-listing)

**Problem**: Is the grey market rally retail FOMO or institutional accumulation?

### The Rule

```
IF Price > +15% AND Turnover < 3%
THEN → HIGH PROBABILITY OF DAY 1 REVERSAL
ACTION → SELL at Grey Market Close
```

### Metrics

| Metric | Formula | Threshold |
|--------|---------|-----------|
| Turnover Ratio | Volume / Float Cap | > 3% = healthy |
| Smart Money Flow | Large blocks (>500k HKD) | Present = bullish |
| Buy/Sell Ratio | Active buys / Active sells | > 1.5 = accumulation |

### Case Studies

**Negative Case**: 茶百道 (2555.HK)
- Grey Market: +10% with thin volume (<10M HKD)
- Turnover: < 1% (散户自嗨)
- Day 1: **-26%** crash

**Positive Case**: Institutional Accumulation Pattern
- Grey Market: +10% with heavy blocks
- Turnover: > 5%
- Day 1: Continued uptrend

### Implementation

```python
def detect_empty_hype(price_change_pct: float, turnover_ratio: float) -> str:
    if price_change_pct > 15 and turnover_ratio < 3:
        return "SELL_IMMEDIATELY"
    elif price_change_pct > 10 and turnover_ratio > 5:
        return "HOLD_STRONG"
    else:
        return "MONITOR"
```

---

## Signal B: Margin Flush (孖展撤单)

**Phase**: Subscription Period (T-3 to T-0)

**Problem**: Fake hot stocks see margin cancellations on deadline day.

### The Rule

```
IF Margin Cancelled > 30% on Deadline Day
THEN → Market consensus breaking
ACTION → ABORT subscription
```

### Metrics

| Metric | Formula | Alert |
|--------|---------|-------|
| Margin Slope | Day-over-Day growth | Flattening = warning |
| Cancellation Rate | Cancelled / Peak | > 30% = abort |
| Final Multiple | Subscribed / Available | < 15x = cold |

### Monitoring Schedule

| Day | Action |
|-----|--------|
| T-3 | Record initial margin pool |
| T-2 | Check slope (should be growing) |
| T-1 | Final decision window |
| T-0 | If cancellation spike → ABORT |

---

## Signal C: Green Shoe Scalp (绿鞋抄底)

**Phase**: Listing Day (Day 1)

**Problem**: Don't know when to bottom-fish on broken IPOs.

### The Rule

```
IF Price == Offer Price
AND Bid Wall > 50% of Day Volume
THEN → Green Shoe protection active
ACTION → SCALP LONG (stop loss = Offer - 2 ticks)
```

### Metrics

| Metric | Description | Threshold |
|--------|-------------|-----------|
| Bid Size at Offer | Level-2 queue depth | > 10M shares |
| Bid/Volume Ratio | Bid size / Day volume | > 50% = "Iron Floor" |
| Iceberg Detection | Hidden large orders | Confirms support |

### Risk/Reward Profile

- **Entry**: Offer Price or Offer + 1 tick
- **Stop Loss**: Offer Price - 2 ticks (~0.5%)
- **Target**: +3% to +5% rebound
- **Win Rate**: > 80% when Bid Wall confirmed

### Implementation Logic

```python
def detect_green_shoe(
    current_price: float,
    offer_price: float,
    bid_size_at_offer: int,
    day_volume: int
) -> dict:
    at_offer = abs(current_price - offer_price) / offer_price < 0.005
    bid_ratio = bid_size_at_offer / day_volume if day_volume > 0 else 0

    if at_offer and bid_ratio > 0.5:
        return {
            "signal": "SCALP_LONG",
            "confidence": "HIGH",
            "stop_loss": offer_price * 0.995,
            "target": offer_price * 1.03
        }
    return {"signal": "NO_SIGNAL", "confidence": "N/A"}
```

---

## Breakeven Calculator (回本点)

**Problem**: "赢了面子，输了里子" - gains don't cover margin interest.

### Formula

```
Breakeven % = (Interest + Fees) / (Allotment Value)

Where:
- Interest = Principal × Rate × Days / 365
- Fees = Brokerage + Trading Fee + Stamp Duty (~0.3%)
- Allotment Value = Offer Price × Shares Allocated
```

### Decision Matrix

| Breakeven % | Recommendation |
|-------------|----------------|
| < 3% | Full margin (乙组) |
| 3% - 8% | Cash subscription |
| > 8% | SKIP or 现金一手 only |

### Quick Reference

| Margin Rate | 7-day Frozen | Breakeven |
|-------------|--------------|-----------|
| 2.9% | 7 days | ~0.6% |
| 3.9% | 7 days | ~0.8% |
| 5.0% | 7 days | ~1.0% |

*Add ~0.3% for fees to get total breakeven.*

---

## Signal Priority

| Phase | Signal | Priority |
|-------|--------|----------|
| Pre-Sub | Margin Calculator | 1 |
| Subscription | Margin Flush | 2 |
| Grey Market | Empty Hype Trap | 3 |
| Day 1 | Green Shoe Scalp | 4 |
