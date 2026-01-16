#!/usr/bin/env python3
"""
Tokenomics Calculator - 代币经济学计算器
为崩盘模型提供输入参数

功能：
1. 解锁时间表计算 (Unlock Schedule)
2. 通胀率计算 (Inflation Rate)
3. FDV/MC 分析 (Valuation Metrics)
4. 抛压预测 (Sell Pressure Forecast)
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from enum import Enum
import math


class VestingType(Enum):
    """解锁类型"""
    LINEAR = "linear"           # 线性释放
    CLIFF = "cliff"             # 悬崖解锁（一次性）
    CLIFF_LINEAR = "cliff_linear"  # 悬崖+线性
    MONTHLY = "monthly"         # 按月释放
    QUARTERLY = "quarterly"     # 按季度释放


@dataclass
class VestingSchedule:
    """单个解锁计划"""
    name: str                   # 分配名称（如 Team, Investors, Community）
    total_tokens: float         # 总代币数量
    tge_percent: float          # TGE解锁比例 (0-100)
    cliff_months: int           # 悬崖期（月）
    vesting_months: int         # 释放期（月）
    vesting_type: VestingType = VestingType.LINEAR
    start_date: Optional[datetime] = None

    def get_unlocked_at_month(self, month: int) -> float:
        """计算第N个月的累计解锁量"""
        if month < 0:
            return 0.0

        # TGE解锁
        tge_amount = self.total_tokens * (self.tge_percent / 100)

        if month == 0:
            return tge_amount

        # 悬崖期内只有TGE
        if month < self.cliff_months:
            return tge_amount

        # 剩余待释放量
        remaining = self.total_tokens - tge_amount

        # 释放期已过的月数
        months_vesting = month - self.cliff_months

        if self.vesting_type == VestingType.CLIFF:
            # 悬崖解锁：到期一次性全部解锁
            if months_vesting >= self.vesting_months:
                return self.total_tokens
            return tge_amount

        elif self.vesting_type in [VestingType.LINEAR, VestingType.CLIFF_LINEAR]:
            # 线性释放
            if self.vesting_months == 0:
                return self.total_tokens
            vested_ratio = min(months_vesting / self.vesting_months, 1.0)
            return tge_amount + remaining * vested_ratio

        elif self.vesting_type == VestingType.MONTHLY:
            # 按月释放
            if self.vesting_months == 0:
                return self.total_tokens
            monthly_amount = remaining / self.vesting_months
            vested_months = min(months_vesting, self.vesting_months)
            return tge_amount + monthly_amount * vested_months

        elif self.vesting_type == VestingType.QUARTERLY:
            # 按季度释放
            if self.vesting_months == 0:
                return self.total_tokens
            quarters = self.vesting_months // 3
            if quarters == 0:
                return self.total_tokens
            quarterly_amount = remaining / quarters
            vested_quarters = min(months_vesting // 3, quarters)
            return tge_amount + quarterly_amount * vested_quarters

        return tge_amount

    def get_unlock_at_month(self, month: int) -> float:
        """计算第N个月的新增解锁量（非累计）"""
        if month <= 0:
            return self.get_unlocked_at_month(0)
        return self.get_unlocked_at_month(month) - self.get_unlocked_at_month(month - 1)


@dataclass
class TokenomicsConfig:
    """代币经济学配置"""
    token_name: str
    total_supply: float                           # 总供应量
    initial_price: float                          # 初始价格 (USD)
    schedules: List[VestingSchedule] = field(default_factory=list)
    tge_date: Optional[datetime] = None

    # 通胀参数（如果有挖矿/质押奖励）
    has_inflation: bool = False
    annual_inflation_rate: float = 0.0            # 年通胀率 (%)
    inflation_decay_rate: float = 0.0             # 通胀衰减率 (每年减少%)

    def add_schedule(self, schedule: VestingSchedule):
        """添加解锁计划"""
        self.schedules.append(schedule)

    def validate(self) -> Tuple[bool, str]:
        """验证配置合理性"""
        total_allocated = sum(s.total_tokens for s in self.schedules)
        if abs(total_allocated - self.total_supply) > 0.01 * self.total_supply:
            return False, f"分配总量 ({total_allocated:,.0f}) 与总供应量 ({self.total_supply:,.0f}) 不符"
        return True, "配置有效"


class TokenomicsCalculator:
    """代币经济学计算器"""

    def __init__(self, config: TokenomicsConfig):
        self.config = config
        self._validate_config()

    def _validate_config(self):
        """验证配置"""
        valid, msg = self.config.validate()
        if not valid:
            print(f"警告: {msg}")

    def get_circulating_supply(self, month: int) -> float:
        """
        计算第N个月的流通量
        流通量 = 所有解锁计划的累计解锁量 + 通胀产出
        """
        # 解锁释放
        unlocked = sum(s.get_unlocked_at_month(month) for s in self.config.schedules)

        # 通胀产出
        if self.config.has_inflation and month > 0:
            inflation_tokens = self._calculate_inflation_tokens(month)
            unlocked += inflation_tokens

        return min(unlocked, self.config.total_supply)

    def _calculate_inflation_tokens(self, month: int) -> float:
        """计算通胀产出的代币量"""
        if not self.config.has_inflation:
            return 0.0

        total_inflation = 0.0
        annual_rate = self.config.annual_inflation_rate / 100
        decay_rate = self.config.inflation_decay_rate / 100

        for m in range(1, month + 1):
            year = (m - 1) // 12
            # 当年的通胀率（考虑衰减）
            current_rate = annual_rate * ((1 - decay_rate) ** year)
            # 月通胀量
            monthly_inflation = (self.config.total_supply * current_rate) / 12
            total_inflation += monthly_inflation

        return total_inflation

    def get_unlock_schedule(self, months: int = 48) -> Dict[int, Dict]:
        """
        生成完整解锁时间表
        返回每个月的详细数据
        """
        schedule = {}

        for month in range(months + 1):
            circulating = self.get_circulating_supply(month)
            new_unlock = circulating - self.get_circulating_supply(month - 1) if month > 0 else circulating

            # 按类别统计
            by_category = {}
            for s in self.config.schedules:
                by_category[s.name] = {
                    'unlocked': s.get_unlocked_at_month(month),
                    'new_unlock': s.get_unlock_at_month(month),
                    'percent_unlocked': (s.get_unlocked_at_month(month) / s.total_tokens * 100) if s.total_tokens > 0 else 0
                }

            schedule[month] = {
                'month': month,
                'circulating_supply': circulating,
                'circulating_percent': (circulating / self.config.total_supply) * 100,
                'new_unlock': new_unlock,
                'new_unlock_percent': (new_unlock / self.config.total_supply) * 100,
                'mc': circulating * self.config.initial_price,
                'fdv': self.config.total_supply * self.config.initial_price,
                'mc_fdv_ratio': circulating / self.config.total_supply,
                'by_category': by_category
            }

        return schedule

    def get_inflation_rate(self, month: int) -> float:
        """计算第N个月的年化通胀率"""
        if month <= 0:
            return 0.0

        supply_now = self.get_circulating_supply(month)
        supply_before = self.get_circulating_supply(max(0, month - 12))

        if supply_before == 0:
            return float('inf')

        return ((supply_now - supply_before) / supply_before) * 100

    def get_fdv_mc_ratio(self, month: int) -> float:
        """计算FDV/MC比率"""
        circulating = self.get_circulating_supply(month)
        if circulating == 0:
            return float('inf')
        return self.config.total_supply / circulating

    def get_sell_pressure_forecast(self, months: int = 12) -> List[Dict]:
        """
        预测未来N个月的抛压
        返回每月的新增解锁量和潜在抛压
        """
        forecast = []

        for month in range(1, months + 1):
            new_unlock = sum(s.get_unlock_at_month(month) for s in self.config.schedules)

            # 按来源分类抛压（不同来源抛售倾向不同）
            pressure_by_source = {}
            total_pressure = 0

            for s in self.config.schedules:
                unlock = s.get_unlock_at_month(month)
                # 估算抛售比例（启发式）
                sell_ratio = self._estimate_sell_ratio(s.name)
                pressure = unlock * sell_ratio
                pressure_by_source[s.name] = {
                    'unlock': unlock,
                    'sell_ratio': sell_ratio,
                    'pressure': pressure
                }
                total_pressure += pressure

            forecast.append({
                'month': month,
                'new_unlock': new_unlock,
                'new_unlock_usd': new_unlock * self.config.initial_price,
                'estimated_sell_pressure': total_pressure,
                'estimated_sell_pressure_usd': total_pressure * self.config.initial_price,
                'by_source': pressure_by_source
            })

        return forecast

    def _estimate_sell_ratio(self, category_name: str) -> float:
        """
        估算各类别的抛售倾向
        基于经验值，可根据实际情况调整
        """
        name_lower = category_name.lower()

        # 高抛售倾向
        if any(x in name_lower for x in ['investor', 'vc', 'private', 'seed', '投资', '私募']):
            return 0.7  # 70% 抛售

        # 中等抛售倾向
        if any(x in name_lower for x in ['team', 'advisor', 'founder', '团队', '顾问']):
            return 0.3  # 30% 抛售（通常有锁仓承诺）

        # 低抛售倾向
        if any(x in name_lower for x in ['community', 'ecosystem', 'treasury', '社区', '生态', '国库']):
            return 0.2  # 20% 抛售

        # 空投/激励 - 高抛售
        if any(x in name_lower for x in ['airdrop', 'incentive', 'reward', '空投', '激励', '奖励']):
            return 0.8  # 80% 抛售

        # 默认中等
        return 0.5

    def print_summary(self, months: int = 24):
        """打印摘要报告"""
        print(f"\n{'='*60}")
        print(f"代币经济学分析报告: {self.config.token_name}")
        print(f"{'='*60}")

        print(f"\n【基础信息】")
        print(f"  总供应量: {self.config.total_supply:,.0f}")
        print(f"  初始价格: ${self.config.initial_price:.4f}")
        print(f"  FDV: ${self.config.total_supply * self.config.initial_price:,.0f}")

        print(f"\n【分配结构】")
        for s in self.config.schedules:
            pct = (s.total_tokens / self.config.total_supply) * 100
            print(f"  {s.name}: {s.total_tokens:,.0f} ({pct:.1f}%)")
            print(f"    - TGE: {s.tge_percent}%, 悬崖: {s.cliff_months}月, 释放: {s.vesting_months}月")

        print(f"\n【关键时间节点】")
        schedule = self.get_unlock_schedule(months)
        key_months = [0, 1, 3, 6, 12, 18, 24]
        key_months = [m for m in key_months if m <= months]

        print(f"  {'月份':<6} {'流通量':<15} {'流通%':<10} {'MC':<15} {'FDV/MC':<10}")
        print(f"  {'-'*56}")
        for m in key_months:
            if m in schedule:
                d = schedule[m]
                print(f"  {m:<6} {d['circulating_supply']:>14,.0f} {d['circulating_percent']:>9.1f}% ${d['mc']:>13,.0f} {d['mc_fdv_ratio']:>9.2f}x")

        print(f"\n【抛压预测（未来12个月）】")
        forecast = self.get_sell_pressure_forecast(12)
        total_pressure = sum(f['estimated_sell_pressure_usd'] for f in forecast)
        print(f"  预计总抛压: ${total_pressure:,.0f}")

        # 找出抛压最大的月份
        max_pressure_month = max(forecast, key=lambda x: x['estimated_sell_pressure'])
        print(f"  最大抛压月份: 第{max_pressure_month['month']}个月")
        print(f"    - 新增解锁: {max_pressure_month['new_unlock']:,.0f} (${max_pressure_month['new_unlock_usd']:,.0f})")
        print(f"    - 预计抛压: ${max_pressure_month['estimated_sell_pressure_usd']:,.0f}")


def create_example_config() -> TokenomicsConfig:
    """创建示例配置（典型VC币）"""
    config = TokenomicsConfig(
        token_name="EXAMPLE",
        total_supply=1_000_000_000,  # 10亿
        initial_price=0.10,          # $0.10
        has_inflation=False
    )

    # 典型分配
    config.add_schedule(VestingSchedule(
        name="Team",
        total_tokens=150_000_000,    # 15%
        tge_percent=0,
        cliff_months=12,
        vesting_months=36,
        vesting_type=VestingType.LINEAR
    ))

    config.add_schedule(VestingSchedule(
        name="Investors",
        total_tokens=200_000_000,    # 20%
        tge_percent=10,
        cliff_months=6,
        vesting_months=24,
        vesting_type=VestingType.LINEAR
    ))

    config.add_schedule(VestingSchedule(
        name="Community/Airdrop",
        total_tokens=250_000_000,    # 25%
        tge_percent=30,
        cliff_months=0,
        vesting_months=24,
        vesting_type=VestingType.LINEAR
    ))

    config.add_schedule(VestingSchedule(
        name="Ecosystem",
        total_tokens=300_000_000,    # 30%
        tge_percent=5,
        cliff_months=0,
        vesting_months=48,
        vesting_type=VestingType.LINEAR
    ))

    config.add_schedule(VestingSchedule(
        name="Treasury",
        total_tokens=100_000_000,    # 10%
        tge_percent=0,
        cliff_months=6,
        vesting_months=36,
        vesting_type=VestingType.QUARTERLY
    ))

    return config


# 便捷函数
def quick_analysis(
    total_supply: float,
    initial_price: float,
    allocations: List[Dict],
    token_name: str = "TOKEN"
) -> TokenomicsCalculator:
    """
    快速分析函数

    allocations格式:
    [
        {"name": "Team", "tokens": 150_000_000, "tge": 0, "cliff": 12, "vesting": 36},
        {"name": "Investors", "tokens": 200_000_000, "tge": 10, "cliff": 6, "vesting": 24},
        ...
    ]
    """
    config = TokenomicsConfig(
        token_name=token_name,
        total_supply=total_supply,
        initial_price=initial_price
    )

    for alloc in allocations:
        config.add_schedule(VestingSchedule(
            name=alloc.get("name", "Unknown"),
            total_tokens=alloc.get("tokens", 0),
            tge_percent=alloc.get("tge", 0),
            cliff_months=alloc.get("cliff", 0),
            vesting_months=alloc.get("vesting", 12),
            vesting_type=VestingType(alloc.get("type", "linear"))
        ))

    return TokenomicsCalculator(config)


if __name__ == "__main__":
    # 示例运行
    config = create_example_config()
    calc = TokenomicsCalculator(config)
    calc.print_summary()

    print("\n" + "="*60)
    print("自定义分析示例")
    print("="*60)

    # 快速分析
    calc2 = quick_analysis(
        total_supply=100_000_000,
        initial_price=1.0,
        token_name="MEME",
        allocations=[
            {"name": "公平发射", "tokens": 80_000_000, "tge": 100, "cliff": 0, "vesting": 0},
            {"name": "团队", "tokens": 10_000_000, "tge": 0, "cliff": 6, "vesting": 12},
            {"name": "LP", "tokens": 10_000_000, "tge": 100, "cliff": 0, "vesting": 0},
        ]
    )
    calc2.print_summary(months=12)
