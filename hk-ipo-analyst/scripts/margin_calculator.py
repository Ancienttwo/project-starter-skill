#!/usr/bin/env python3
"""
HK IPO Margin Breakeven Calculator (孖展回本点计算器)

Calculate the minimum price increase needed to cover margin financing costs.
"""

import argparse
import sys
from dataclasses import dataclass


@dataclass
class MarginResult:
    """Result of margin breakeven calculation."""

    principal: float          # Subscription amount (HKD)
    margin_rate: float        # Annual interest rate (%)
    days_frozen: int          # Days capital is locked
    allotment_rate: float     # Expected allocation rate (%)
    interest_cost: float      # Total interest cost (HKD)
    fee_cost: float           # Trading fees (HKD)
    total_cost: float         # Interest + fees (HKD)
    allotment_value: float    # Value of allocated shares (HKD)
    breakeven_pct: float      # Required price increase (%)
    recommendation: str       # Action recommendation


def calculate_breakeven(
    principal: float,
    margin_rate: float,
    days_frozen: int = 7,
    allotment_rate: float = 10.0,
    fee_rate: float = 0.3
) -> MarginResult:
    """
    Calculate margin financing breakeven point.

    Args:
        principal: Total subscription amount in HKD
        margin_rate: Annual margin interest rate (e.g., 3.9 for 3.9%)
        days_frozen: Days capital is locked (typically 7)
        allotment_rate: Expected allocation percentage (e.g., 10 for 10%)
        fee_rate: Trading fees as percentage (default 0.3%)

    Returns:
        MarginResult with breakeven calculation details
    """
    # Calculate interest cost
    interest_cost = principal * (margin_rate / 100) * (days_frozen / 365)

    # Calculate expected allotment value
    allotment_value = principal * (allotment_rate / 100)

    # Calculate fee cost (on allotment value)
    fee_cost = allotment_value * (fee_rate / 100)

    # Total cost
    total_cost = interest_cost + fee_cost

    # Breakeven percentage
    if allotment_value > 0:
        breakeven_pct = (total_cost / allotment_value) * 100
    else:
        breakeven_pct = float('inf')

    # Generate recommendation
    if breakeven_pct < 3:
        recommendation = "FULL_MARGIN - Low breakeven, maximize margin"
    elif breakeven_pct < 8:
        recommendation = "CASH_ONLY - Moderate breakeven, use cash subscription"
    else:
        recommendation = "SKIP - High breakeven, not worth the risk"

    return MarginResult(
        principal=principal,
        margin_rate=margin_rate,
        days_frozen=days_frozen,
        allotment_rate=allotment_rate,
        interest_cost=round(interest_cost, 2),
        fee_cost=round(fee_cost, 2),
        total_cost=round(total_cost, 2),
        allotment_value=round(allotment_value, 2),
        breakeven_pct=round(breakeven_pct, 2),
        recommendation=recommendation
    )


def format_result(result: MarginResult) -> str:
    """Format calculation result for display."""
    return f"""
╔══════════════════════════════════════════════════════╗
║           HK IPO Margin Breakeven Calculator         ║
╠══════════════════════════════════════════════════════╣
║  Input Parameters                                    ║
║  ─────────────────────────────────────────────────── ║
║  Principal:        {result.principal:>15,.0f} HKD            ║
║  Margin Rate:      {result.margin_rate:>15.2f}%              ║
║  Days Frozen:      {result.days_frozen:>15d} days            ║
║  Allotment Rate:   {result.allotment_rate:>15.1f}%              ║
╠══════════════════════════════════════════════════════╣
║  Calculation                                         ║
║  ─────────────────────────────────────────────────── ║
║  Interest Cost:    {result.interest_cost:>15,.2f} HKD            ║
║  Fee Cost:         {result.fee_cost:>15,.2f} HKD            ║
║  Total Cost:       {result.total_cost:>15,.2f} HKD            ║
║  Allotment Value:  {result.allotment_value:>15,.2f} HKD            ║
╠══════════════════════════════════════════════════════╣
║  Result                                              ║
║  ─────────────────────────────────────────────────── ║
║  BREAKEVEN:        {result.breakeven_pct:>15.2f}%              ║
║                                                      ║
║  >>> {result.recommendation:<45} ║
╚══════════════════════════════════════════════════════╝
"""


def main():
    parser = argparse.ArgumentParser(
        description="Calculate HK IPO margin financing breakeven point",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic calculation with 50K HKD subscription
  python margin_calculator.py --principal 50000 --margin-rate 3.9

  # With custom allotment rate (hot stock, low allocation)
  python margin_calculator.py --principal 100000 --margin-rate 3.9 --allotment 5

  # With longer frozen period
  python margin_calculator.py --principal 50000 --margin-rate 2.9 --days 10
        """
    )

    parser.add_argument(
        "--principal", "-p",
        type=float,
        required=True,
        help="Subscription amount in HKD"
    )
    parser.add_argument(
        "--margin-rate", "-r",
        type=float,
        required=True,
        help="Annual margin interest rate (e.g., 3.9 for 3.9%%)"
    )
    parser.add_argument(
        "--days", "-d",
        type=int,
        default=7,
        help="Days capital is frozen (default: 7)"
    )
    parser.add_argument(
        "--allotment", "-a",
        type=float,
        default=10.0,
        help="Expected allotment rate in %% (default: 10)"
    )
    parser.add_argument(
        "--fee-rate", "-f",
        type=float,
        default=0.3,
        help="Trading fee rate in %% (default: 0.3)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output in JSON format"
    )

    args = parser.parse_args()

    result = calculate_breakeven(
        principal=args.principal,
        margin_rate=args.margin_rate,
        days_frozen=args.days,
        allotment_rate=args.allotment,
        fee_rate=args.fee_rate
    )

    if args.json:
        import json
        print(json.dumps({
            "principal": result.principal,
            "margin_rate": result.margin_rate,
            "days_frozen": result.days_frozen,
            "allotment_rate": result.allotment_rate,
            "interest_cost": result.interest_cost,
            "fee_cost": result.fee_cost,
            "total_cost": result.total_cost,
            "allotment_value": result.allotment_value,
            "breakeven_pct": result.breakeven_pct,
            "recommendation": result.recommendation
        }, indent=2))
    else:
        print(format_result(result))


if __name__ == "__main__":
    main()
