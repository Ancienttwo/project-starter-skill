#!/usr/bin/env python3
"""
Collapse Model - 崩盘模型模拟器
基于三盘理论的崩盘预测与模拟

三种盘型的崩盘条件：
1. 分红盘: 拨出 > 新入金 + 可用流动性
2. 互助盘: 全局债务 > 可清算资产 + 外部流动性
3. 拆分盘: 新买盘 < 拆分需求 OR 存量大幅抛售

依赖: tokenomics_calc.py 提供代币解锁数据
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Callable
from enum import Enum
from abc import ABC, abstractmethod
import math


class PonziType(Enum):
    """盘型分类"""
    DIVIDEND = "dividend"    # 分红盘
    MUTUAL = "mutual"        # 互助盘
    SPLIT = "split"          # 拆分盘


class CollapseRisk(Enum):
    """崩盘风险等级"""
    SAFE = "safe"            # 安全 (< 30%)
    WARNING = "warning"      # 警告 (30-60%)
    DANGER = "danger"        # 危险 (60-80%)
    CRITICAL = "critical"    # 临界 (> 80%)


@dataclass
class SimulationResult:
    """模拟结果"""
    day: int
    risk_level: CollapseRisk
    risk_score: float                    # 0-100
    collapse_probability: float          # 0-1
    days_to_collapse: Optional[int]      # 预计几天后崩盘
    metrics: Dict                        # 详细指标
    warnings: List[str] = field(default_factory=list)


class BasePonziModel(ABC):
    """盘型基类"""

    def __init__(self, name: str):
        self.name = name
        self.history: List[SimulationResult] = []

    @abstractmethod
    def simulate_day(self, day: int, params: Dict) -> SimulationResult:
        """模拟单日状态"""
        pass

    @abstractmethod
    def calculate_risk_score(self, params: Dict) -> float:
        """计算风险分数 (0-100)"""
        pass

    def get_risk_level(self, score: float) -> CollapseRisk:
        """风险分数转等级"""
        if score < 30:
            return CollapseRisk.SAFE
        elif score < 60:
            return CollapseRisk.WARNING
        elif score < 80:
            return CollapseRisk.DANGER
        else:
            return CollapseRisk.CRITICAL

    def run_simulation(self, days: int, params_func: Callable[[int], Dict]) -> List[SimulationResult]:
        """
        运行完整模拟

        params_func: 接受day参数，返回该天的参数Dict
        """
        self.history = []
        for day in range(days):
            params = params_func(day)
            result = self.simulate_day(day, params)
            self.history.append(result)

            # 如果已崩盘，停止模拟
            if result.risk_score >= 100:
                break

        return self.history


class DividendPonziModel(BasePonziModel):
    """
    分红盘模型

    特征：
    - 一次性投入资金，随时间线性分红
    - 典型：矿币、质押、Crypto Game

    崩盘条件：
    - 日拨出 > 日新入金 + 可用流动性
    - 筹码过度分散 + 上涨动能消失

    关键参数：
    - daily_payout: 日拨出量（分红）
    - daily_inflow: 日新入金
    - available_liquidity: 可用流动性（底池）
    - token_unlock: 当日解锁量（来自tokenomics）
    - sell_pressure: 抛压比例
    - chip_concentration: 筹码集中度 (0-1, 1=完全集中)
    """

    def __init__(self):
        super().__init__("分红盘")

    def simulate_day(self, day: int, params: Dict) -> SimulationResult:
        """模拟单日"""
        # 提取参数
        daily_payout = params.get('daily_payout', 0)
        daily_inflow = params.get('daily_inflow', 0)
        available_liquidity = params.get('available_liquidity', 0)
        token_unlock = params.get('token_unlock', 0)
        sell_pressure_ratio = params.get('sell_pressure_ratio', 0.5)
        chip_concentration = params.get('chip_concentration', 0.9)
        price = params.get('price', 1.0)

        # 计算实际抛压
        unlock_sell_pressure = token_unlock * sell_pressure_ratio * price
        total_outflow = daily_payout + unlock_sell_pressure

        # 计算净流动性缺口
        liquidity_gap = total_outflow - daily_inflow

        # 计算风险分数
        risk_score = self.calculate_risk_score({
            'liquidity_gap': liquidity_gap,
            'available_liquidity': available_liquidity,
            'chip_concentration': chip_concentration,
            'daily_payout': daily_payout,
            'daily_inflow': daily_inflow
        })

        # 生成警告
        warnings = []
        if liquidity_gap > 0:
            warnings.append(f"流动性缺口: ${liquidity_gap:,.0f}")
        if liquidity_gap > available_liquidity * 0.1:
            warnings.append("警告: 缺口超过流动性10%")
        if chip_concentration < 0.5:
            warnings.append("警告: 筹码过度分散")
        if daily_inflow < daily_payout * 0.5:
            warnings.append("警告: 新入金不足拨出的50%")

        # 预估崩盘时间
        days_to_collapse = None
        if liquidity_gap > 0 and available_liquidity > 0:
            days_to_collapse = int(available_liquidity / liquidity_gap)

        return SimulationResult(
            day=day,
            risk_level=self.get_risk_level(risk_score),
            risk_score=risk_score,
            collapse_probability=min(risk_score / 100, 1.0),
            days_to_collapse=days_to_collapse,
            metrics={
                'daily_payout': daily_payout,
                'daily_inflow': daily_inflow,
                'unlock_sell_pressure': unlock_sell_pressure,
                'total_outflow': total_outflow,
                'liquidity_gap': liquidity_gap,
                'available_liquidity': available_liquidity,
                'chip_concentration': chip_concentration,
                'net_flow': daily_inflow - total_outflow
            },
            warnings=warnings
        )

    def calculate_risk_score(self, params: Dict) -> float:
        """
        计算风险分数

        权重分配：
        - 流动性缺口/可用流动性比: 50%
        - 筹码分散度: 25%
        - 入金/拨出比: 25%
        """
        liquidity_gap = params.get('liquidity_gap', 0)
        available_liquidity = params.get('available_liquidity', 1)
        chip_concentration = params.get('chip_concentration', 0.9)
        daily_payout = params.get('daily_payout', 1)
        daily_inflow = params.get('daily_inflow', 0)

        # 流动性缺口风险 (0-100)
        if available_liquidity > 0:
            gap_ratio = max(0, liquidity_gap) / available_liquidity
            liquidity_risk = min(gap_ratio * 100, 100)
        else:
            liquidity_risk = 100 if liquidity_gap > 0 else 0

        # 筹码分散风险 (0-100)
        # 筹码越分散风险越高
        chip_risk = (1 - chip_concentration) * 100

        # 现金流风险 (0-100)
        if daily_payout > 0:
            inflow_ratio = daily_inflow / daily_payout
            if inflow_ratio >= 1:
                cashflow_risk = 0
            else:
                cashflow_risk = (1 - inflow_ratio) * 100
        else:
            cashflow_risk = 0

        # 加权计算
        risk_score = (
            liquidity_risk * 0.50 +
            chip_risk * 0.25 +
            cashflow_risk * 0.25
        )

        return min(risk_score, 100)


class MutualPonziModel(BasePonziModel):
    """
    互助盘模型

    特征：
    - 资金拆借形式，错配资金
    - 典型：3M、FOMO3D、OHM、算法稳定币

    崩盘条件：
    - 全局债务 > 可清算资产 + 外部流动性

    关键参数：
    - global_debt: 全局债务（系统欠用户的）
    - liquidatable_assets: 可清算资产
    - external_liquidity: 外部流动性
    - daily_interest_rate: 日利率
    - withdrawal_rate: 日提现比例
    - new_deposit: 新存入
    """

    def __init__(self):
        super().__init__("互助盘")

    def simulate_day(self, day: int, params: Dict) -> SimulationResult:
        """模拟单日"""
        global_debt = params.get('global_debt', 0)
        liquidatable_assets = params.get('liquidatable_assets', 0)
        external_liquidity = params.get('external_liquidity', 0)
        daily_interest_rate = params.get('daily_interest_rate', 0.01)  # 1%日息
        withdrawal_rate = params.get('withdrawal_rate', 0.05)  # 5%日提现
        new_deposit = params.get('new_deposit', 0)
        rake_rate = params.get('rake_rate', 0.1)  # 10%抽水

        # 计算今日利息增加的债务
        interest_accrued = global_debt * daily_interest_rate

        # 计算今日提现
        withdrawals = global_debt * withdrawal_rate

        # 更新债务
        # 新债务 = 旧债务 + 利息 - 提现 + 新存入*(1-抽水)
        new_debt = global_debt + interest_accrued - withdrawals + new_deposit * (1 - rake_rate)

        # 资产变化
        # 资产 = 旧资产 - 提现 + 新存入
        new_assets = liquidatable_assets - withdrawals + new_deposit

        # 偿付能力
        total_available = new_assets + external_liquidity
        solvency_ratio = total_available / new_debt if new_debt > 0 else float('inf')

        # 计算风险分数
        risk_score = self.calculate_risk_score({
            'global_debt': new_debt,
            'liquidatable_assets': new_assets,
            'external_liquidity': external_liquidity,
            'solvency_ratio': solvency_ratio,
            'withdrawal_rate': withdrawal_rate
        })

        # 生成警告
        warnings = []
        if solvency_ratio < 1:
            warnings.append(f"资不抵债! 偿付比: {solvency_ratio:.2%}")
        elif solvency_ratio < 1.2:
            warnings.append(f"偿付能力不足: {solvency_ratio:.2%}")
        if withdrawal_rate > 0.1:
            warnings.append(f"提现率过高: {withdrawal_rate:.1%}")
        if new_deposit < withdrawals:
            warnings.append("新存入不足以覆盖提现")

        # 预估崩盘时间
        days_to_collapse = None
        if new_deposit < withdrawals + interest_accrued:
            daily_drain = withdrawals + interest_accrued - new_deposit
            if daily_drain > 0:
                days_to_collapse = int(new_assets / daily_drain)

        return SimulationResult(
            day=day,
            risk_level=self.get_risk_level(risk_score),
            risk_score=risk_score,
            collapse_probability=min(risk_score / 100, 1.0),
            days_to_collapse=days_to_collapse,
            metrics={
                'global_debt': new_debt,
                'liquidatable_assets': new_assets,
                'external_liquidity': external_liquidity,
                'total_available': total_available,
                'solvency_ratio': solvency_ratio,
                'interest_accrued': interest_accrued,
                'withdrawals': withdrawals,
                'new_deposit': new_deposit,
                'net_flow': new_deposit - withdrawals - interest_accrued
            },
            warnings=warnings
        )

    def calculate_risk_score(self, params: Dict) -> float:
        """
        计算风险分数

        权重分配：
        - 偿付比 (债务/资产): 60%
        - 提现压力: 25%
        - 流动性缓冲: 15%
        """
        global_debt = params.get('global_debt', 0)
        liquidatable_assets = params.get('liquidatable_assets', 0)
        external_liquidity = params.get('external_liquidity', 0)
        solvency_ratio = params.get('solvency_ratio', 1)
        withdrawal_rate = params.get('withdrawal_rate', 0)

        # 偿付风险 (0-100)
        if solvency_ratio >= 2:
            solvency_risk = 0
        elif solvency_ratio >= 1:
            solvency_risk = (2 - solvency_ratio) * 50  # 1-2之间: 0-50
        else:
            solvency_risk = 50 + (1 - solvency_ratio) * 50  # <1: 50-100

        # 提现压力风险 (0-100)
        # 日提现率超过10%视为高风险
        withdrawal_risk = min(withdrawal_rate / 0.1 * 100, 100)

        # 流动性缓冲风险 (0-100)
        if global_debt > 0:
            buffer_ratio = external_liquidity / global_debt
            if buffer_ratio >= 0.2:
                buffer_risk = 0
            else:
                buffer_risk = (0.2 - buffer_ratio) / 0.2 * 100
        else:
            buffer_risk = 0

        # 加权计算
        risk_score = (
            solvency_risk * 0.60 +
            withdrawal_risk * 0.25 +
            buffer_risk * 0.15
        )

        return min(risk_score, 100)


class SplitPonziModel(BasePonziModel):
    """
    拆分盘模型

    特征：
    - 系统总资金不变时，倍增资产数量吸引后续资金
    - 典型：Pump.fun、FT、公链生态、NFT

    崩盘条件：
    - 新买盘 < 拆分需求
    - 存量大幅抛售
    - 拆分速率下降

    四大崩盘点（来自理论）：
    1. 存量抛售：大户/项目方抛售
    2. 增量枯竭：新买盘不足
    3. 拆分放缓：热度下降
    4. 流动性危机：底池枯竭

    关键参数：
    - market_cap: 市值
    - liquidity: 底池流动性
    - daily_volume: 日交易量
    - new_buyers: 新买家数/量
    - whale_holdings: 大户持仓比例
    - split_rate: 拆分/发射率（新项目数/新NFT数）
    - fdv_mc_ratio: FDV/MC比
    """

    def __init__(self):
        super().__init__("拆分盘")

    def simulate_day(self, day: int, params: Dict) -> SimulationResult:
        """模拟单日"""
        market_cap = params.get('market_cap', 0)
        liquidity = params.get('liquidity', 0)
        daily_buy_volume = params.get('daily_buy_volume', 0)
        daily_sell_volume = params.get('daily_sell_volume', 0)
        new_buyers = params.get('new_buyers', 0)
        whale_holdings = params.get('whale_holdings', 0.3)  # 大户持仓比例
        split_rate = params.get('split_rate', 1.0)  # 拆分速率
        fdv_mc_ratio = params.get('fdv_mc_ratio', 1.0)
        token_unlock = params.get('token_unlock', 0)
        price = params.get('price', 1.0)

        # 计算净买卖
        net_flow = daily_buy_volume - daily_sell_volume
        unlock_pressure = token_unlock * price * 0.5  # 假设50%抛售

        # 流动性深度比
        liquidity_depth = liquidity / market_cap if market_cap > 0 else 0

        # 计算风险分数
        risk_score = self.calculate_risk_score({
            'market_cap': market_cap,
            'liquidity': liquidity,
            'net_flow': net_flow,
            'unlock_pressure': unlock_pressure,
            'new_buyers': new_buyers,
            'whale_holdings': whale_holdings,
            'split_rate': split_rate,
            'fdv_mc_ratio': fdv_mc_ratio,
            'liquidity_depth': liquidity_depth
        })

        # 生成警告
        warnings = []
        if net_flow < 0:
            warnings.append(f"净流出: ${abs(net_flow):,.0f}")
        if new_buyers < 10:
            warnings.append(f"新买家不足: {new_buyers}")
        if whale_holdings > 0.5:
            warnings.append(f"大户集中度过高: {whale_holdings:.1%}")
        if split_rate < 0.5:
            warnings.append(f"拆分/热度衰减: {split_rate:.1%}")
        if fdv_mc_ratio > 10:
            warnings.append(f"FDV/MC过高: {fdv_mc_ratio:.1f}x")
        if liquidity_depth < 0.05:
            warnings.append(f"流动性深度不足: {liquidity_depth:.1%}")
        if unlock_pressure > daily_buy_volume * 0.5:
            warnings.append("解锁抛压超过买盘50%")

        # 预估崩盘时间
        days_to_collapse = None
        if net_flow < 0 and liquidity > 0:
            daily_drain = abs(net_flow) + unlock_pressure
            days_to_collapse = int(liquidity / daily_drain) if daily_drain > 0 else None

        return SimulationResult(
            day=day,
            risk_level=self.get_risk_level(risk_score),
            risk_score=risk_score,
            collapse_probability=min(risk_score / 100, 1.0),
            days_to_collapse=days_to_collapse,
            metrics={
                'market_cap': market_cap,
                'liquidity': liquidity,
                'liquidity_depth': liquidity_depth,
                'daily_buy_volume': daily_buy_volume,
                'daily_sell_volume': daily_sell_volume,
                'net_flow': net_flow,
                'unlock_pressure': unlock_pressure,
                'new_buyers': new_buyers,
                'whale_holdings': whale_holdings,
                'split_rate': split_rate,
                'fdv_mc_ratio': fdv_mc_ratio
            },
            warnings=warnings
        )

    def calculate_risk_score(self, params: Dict) -> float:
        """
        计算风险分数

        四大崩盘点权重：
        - 存量抛售风险 (净流出+大户): 30%
        - 增量枯竭风险 (新买家): 25%
        - 拆分放缓风险: 20%
        - 流动性危机风险: 25%
        """
        market_cap = params.get('market_cap', 1)
        liquidity = params.get('liquidity', 0)
        net_flow = params.get('net_flow', 0)
        unlock_pressure = params.get('unlock_pressure', 0)
        new_buyers = params.get('new_buyers', 0)
        whale_holdings = params.get('whale_holdings', 0)
        split_rate = params.get('split_rate', 1)
        fdv_mc_ratio = params.get('fdv_mc_ratio', 1)
        liquidity_depth = params.get('liquidity_depth', 0)

        # 1. 存量抛售风险 (0-100)
        outflow_risk = 0
        if net_flow < 0:
            outflow_ratio = abs(net_flow) / market_cap if market_cap > 0 else 1
            outflow_risk = min(outflow_ratio * 1000, 50)  # 0.1%日流出=50分
        whale_risk = whale_holdings * 100  # 大户持仓比例直接转风险
        selling_risk = outflow_risk * 0.6 + whale_risk * 0.4

        # 2. 增量枯竭风险 (0-100)
        # 假设每日需要100个新买家维持
        if new_buyers >= 100:
            buyer_risk = 0
        elif new_buyers >= 10:
            buyer_risk = (100 - new_buyers) / 90 * 50
        else:
            buyer_risk = 50 + (10 - new_buyers) / 10 * 50

        # 3. 拆分放缓风险 (0-100)
        # split_rate < 1 表示热度下降
        if split_rate >= 1:
            split_risk = 0
        else:
            split_risk = (1 - split_rate) * 100

        # 4. 流动性危机风险 (0-100)
        # 流动性深度<5%视为危险
        if liquidity_depth >= 0.1:
            liquidity_risk = 0
        elif liquidity_depth >= 0.05:
            liquidity_risk = (0.1 - liquidity_depth) / 0.05 * 50
        else:
            liquidity_risk = 50 + (0.05 - liquidity_depth) / 0.05 * 50

        # FDV/MC风险加成
        if fdv_mc_ratio > 10:
            fdv_penalty = min((fdv_mc_ratio - 10) * 2, 20)
        else:
            fdv_penalty = 0

        # 解锁压力加成
        unlock_penalty = 0
        if market_cap > 0:
            unlock_ratio = unlock_pressure / market_cap
            unlock_penalty = min(unlock_ratio * 500, 20)

        # 加权计算
        risk_score = (
            selling_risk * 0.30 +
            buyer_risk * 0.25 +
            split_risk * 0.20 +
            liquidity_risk * 0.25 +
            fdv_penalty +
            unlock_penalty
        )

        return min(risk_score, 100)


class CollapseAnalyzer:
    """
    崩盘分析器 - 整合三种盘型分析
    """

    def __init__(self):
        self.models = {
            PonziType.DIVIDEND: DividendPonziModel(),
            PonziType.MUTUAL: MutualPonziModel(),
            PonziType.SPLIT: SplitPonziModel()
        }

    def identify_ponzi_type(self, project_features: Dict) -> PonziType:
        """
        根据项目特征识别盘型

        features:
        - has_staking: 是否有质押
        - has_lending: 是否有借贷
        - has_token_split: 是否有代币拆分/发射
        - revenue_source: 收入来源类型
        """
        has_staking = project_features.get('has_staking', False)
        has_lending = project_features.get('has_lending', False)
        has_token_split = project_features.get('has_token_split', False)
        is_pump_style = project_features.get('is_pump_style', False)

        # 优先级判断
        if has_lending or project_features.get('is_ohm_fork', False):
            return PonziType.MUTUAL

        if is_pump_style or has_token_split:
            return PonziType.SPLIT

        if has_staking:
            return PonziType.DIVIDEND

        # 默认根据其他特征
        return PonziType.SPLIT  # 大多数项目是拆分盘

    def analyze(
        self,
        ponzi_type: PonziType,
        params: Dict
    ) -> SimulationResult:
        """单次分析"""
        model = self.models[ponzi_type]
        return model.simulate_day(0, params)

    def run_scenario(
        self,
        ponzi_type: PonziType,
        days: int,
        base_params: Dict,
        scenarios: Dict[str, Callable[[int, Dict], Dict]]
    ) -> Dict[str, List[SimulationResult]]:
        """
        运行多情景分析

        scenarios: {
            'base': lambda day, params: params,
            'bull': lambda day, params: {...},
            'bear': lambda day, params: {...}
        }
        """
        results = {}
        model = self.models[ponzi_type]

        for scenario_name, modifier in scenarios.items():
            def params_func(day, base=base_params, mod=modifier):
                return mod(day, base.copy())

            results[scenario_name] = model.run_simulation(days, params_func)

        return results

    def print_analysis(self, result: SimulationResult, ponzi_type: PonziType):
        """打印分析结果"""
        print(f"\n{'='*60}")
        print(f"崩盘风险分析 - {self.models[ponzi_type].name}")
        print(f"{'='*60}")

        # 风险等级颜色
        risk_colors = {
            CollapseRisk.SAFE: "🟢",
            CollapseRisk.WARNING: "🟡",
            CollapseRisk.DANGER: "🟠",
            CollapseRisk.CRITICAL: "🔴"
        }

        print(f"\n【风险评估】")
        print(f"  风险等级: {risk_colors[result.risk_level]} {result.risk_level.value.upper()}")
        print(f"  风险分数: {result.risk_score:.1f}/100")
        print(f"  崩盘概率: {result.collapse_probability:.1%}")
        if result.days_to_collapse:
            print(f"  预计崩盘: {result.days_to_collapse} 天内")

        print(f"\n【关键指标】")
        for key, value in result.metrics.items():
            if isinstance(value, float):
                if value > 1000000:
                    print(f"  {key}: ${value:,.0f}")
                elif value > 1:
                    print(f"  {key}: {value:,.2f}")
                else:
                    print(f"  {key}: {value:.4f}")
            else:
                print(f"  {key}: {value}")

        if result.warnings:
            print(f"\n【警告信号】")
            for warning in result.warnings:
                print(f"  ⚠️  {warning}")


def quick_dividend_analysis(
    daily_payout: float,
    daily_inflow: float,
    available_liquidity: float,
    token_unlock: float = 0,
    price: float = 1.0
) -> SimulationResult:
    """快速分红盘分析"""
    analyzer = CollapseAnalyzer()
    result = analyzer.analyze(PonziType.DIVIDEND, {
        'daily_payout': daily_payout,
        'daily_inflow': daily_inflow,
        'available_liquidity': available_liquidity,
        'token_unlock': token_unlock,
        'sell_pressure_ratio': 0.5,
        'chip_concentration': 0.8,
        'price': price
    })
    analyzer.print_analysis(result, PonziType.DIVIDEND)
    return result


def quick_mutual_analysis(
    global_debt: float,
    liquidatable_assets: float,
    external_liquidity: float,
    daily_interest_rate: float = 0.01,
    withdrawal_rate: float = 0.05,
    new_deposit: float = 0
) -> SimulationResult:
    """快速互助盘分析"""
    analyzer = CollapseAnalyzer()
    result = analyzer.analyze(PonziType.MUTUAL, {
        'global_debt': global_debt,
        'liquidatable_assets': liquidatable_assets,
        'external_liquidity': external_liquidity,
        'daily_interest_rate': daily_interest_rate,
        'withdrawal_rate': withdrawal_rate,
        'new_deposit': new_deposit,
        'rake_rate': 0.1
    })
    analyzer.print_analysis(result, PonziType.MUTUAL)
    return result


def quick_split_analysis(
    market_cap: float,
    liquidity: float,
    daily_buy_volume: float,
    daily_sell_volume: float,
    new_buyers: int = 100,
    whale_holdings: float = 0.3,
    fdv_mc_ratio: float = 1.0,
    token_unlock: float = 0,
    price: float = 1.0
) -> SimulationResult:
    """快速拆分盘分析"""
    analyzer = CollapseAnalyzer()
    result = analyzer.analyze(PonziType.SPLIT, {
        'market_cap': market_cap,
        'liquidity': liquidity,
        'daily_buy_volume': daily_buy_volume,
        'daily_sell_volume': daily_sell_volume,
        'new_buyers': new_buyers,
        'whale_holdings': whale_holdings,
        'split_rate': 1.0,
        'fdv_mc_ratio': fdv_mc_ratio,
        'token_unlock': token_unlock,
        'price': price
    })
    analyzer.print_analysis(result, PonziType.SPLIT)
    return result


if __name__ == "__main__":
    print("\n" + "="*60)
    print("崩盘模型模拟器 - 示例分析")
    print("="*60)

    # 示例1: 分红盘（矿币/质押项目）
    print("\n【示例1: 分红盘 - 质押项目】")
    quick_dividend_analysis(
        daily_payout=100000,       # 日分红$10万
        daily_inflow=80000,        # 日新入金$8万
        available_liquidity=500000, # 底池$50万
        token_unlock=50000,        # 日解锁5万个
        price=1.0                  # 价格$1
    )

    # 示例2: 互助盘（OHM类）
    print("\n【示例2: 互助盘 - OHM Fork】")
    quick_mutual_analysis(
        global_debt=10000000,      # 全局债务$1000万
        liquidatable_assets=8000000, # 可清算资产$800万
        external_liquidity=500000,  # 外部流动性$50万
        daily_interest_rate=0.02,  # 日息2%
        withdrawal_rate=0.08,      # 日提现8%
        new_deposit=500000         # 日新存入$50万
    )

    # 示例3: 拆分盘（Meme币）
    print("\n【示例3: 拆分盘 - Meme币】")
    quick_split_analysis(
        market_cap=5000000,        # 市值$500万
        liquidity=500000,          # 底池$50万
        daily_buy_volume=200000,   # 日买入$20万
        daily_sell_volume=300000,  # 日卖出$30万
        new_buyers=50,             # 新买家50人
        whale_holdings=0.4,        # 大户持仓40%
        fdv_mc_ratio=5.0,          # FDV/MC = 5x
        token_unlock=100000,       # 日解锁10万个
        price=0.01                 # 价格$0.01
    )
