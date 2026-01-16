#!/usr/bin/env python3
"""
Project Analyzer - 项目分析编排器
整合数据获取、代币经济学分析、崩盘模型

工作流:
1. 自动获取项目数据 (data_fetcher)
2. 识别盘型
3. 补充缺失参数
4. 运行崩盘模型 (collapse_model)
5. 生成分析报告

用法:
    analyzer = ProjectAnalyzer()
    report = analyzer.analyze("$PEPE")
    report = analyzer.analyze("0x1234...", chain="ethereum")
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
import json

# 导入本地模块
from data_fetcher import DataFetcher, ProjectData, analyze_project
from collapse_model import (
    CollapseAnalyzer, PonziType, CollapseRisk, SimulationResult,
    quick_split_analysis, quick_dividend_analysis, quick_mutual_analysis
)
from tokenomics_calc import TokenomicsCalculator, TokenomicsConfig, VestingSchedule, VestingType


class ProjectCategory(Enum):
    """项目分类"""
    MEME = "meme"              # Meme币
    DEFI = "defi"              # DeFi协议
    GAMEFI = "gamefi"          # GameFi
    NFT = "nft"                # NFT项目
    L1 = "l1"                  # Layer 1公链
    L2 = "l2"                  # Layer 2
    INFRA = "infra"            # 基础设施
    AI = "ai"                  # AI代币
    UNKNOWN = "unknown"


@dataclass
class MissingParam:
    """缺失参数"""
    name: str
    description: str
    default_value: Any
    required: bool = False
    options: Optional[List[Any]] = None


@dataclass
class AnalysisReport:
    """分析报告"""
    # 项目信息
    project_name: str
    symbol: str
    chain: str
    category: ProjectCategory

    # 盘型判断
    ponzi_type: PonziType
    ponzi_type_confidence: float  # 0-1
    ponzi_type_reasons: List[str]

    # 风险评估
    risk_level: CollapseRisk
    risk_score: float
    collapse_probability: float
    days_to_collapse: Optional[int]

    # 关键指标
    metrics: Dict[str, Any]

    # 警告信号
    warnings: List[str]

    # 建议
    recommendations: List[str]

    # 数据质量
    data_completeness: float  # 0-1
    missing_data: List[str]
    assumptions: List[str]

    # 元数据
    analysis_time: str
    data_sources: List[str]

    def to_markdown(self) -> str:
        """生成Markdown报告"""
        risk_emoji = {
            CollapseRisk.SAFE: "🟢",
            CollapseRisk.WARNING: "🟡",
            CollapseRisk.DANGER: "🟠",
            CollapseRisk.CRITICAL: "🔴"
        }

        md = f"""# {self.project_name} ({self.symbol}) 分析报告

**分析时间**: {self.analysis_time}
**链**: {self.chain}
**类别**: {self.category.value}

---

## 1. 盘型判断

**判定**: {self.ponzi_type.value} (置信度: {self.ponzi_type_confidence:.0%})

**判断依据**:
"""
        for reason in self.ponzi_type_reasons:
            md += f"- {reason}\n"

        md += f"""
---

## 2. 风险评估

| 指标 | 数值 |
|-----|------|
| 风险等级 | {risk_emoji[self.risk_level]} {self.risk_level.value.upper()} |
| 风险分数 | {self.risk_score:.1f}/100 |
| 崩盘概率 | {self.collapse_probability:.1%} |
| 预计崩盘 | {f'{self.days_to_collapse}天内' if self.days_to_collapse else 'N/A'} |

---

## 3. 关键指标

| 指标 | 数值 |
|-----|------|
"""
        for k, v in self.metrics.items():
            if isinstance(v, float):
                if v > 1000000:
                    md += f"| {k} | ${v:,.0f} |\n"
                elif v > 1:
                    md += f"| {k} | {v:,.2f} |\n"
                else:
                    md += f"| {k} | {v:.4f} |\n"
            else:
                md += f"| {k} | {v} |\n"

        if self.warnings:
            md += "\n---\n\n## 4. 警告信号\n\n"
            for w in self.warnings:
                md += f"- ⚠️ {w}\n"

        if self.recommendations:
            md += "\n---\n\n## 5. 建议\n\n"
            for r in self.recommendations:
                md += f"- 💡 {r}\n"

        md += f"""
---

## 6. 数据质量

**完整度**: {self.data_completeness:.0%}

**数据来源**: {', '.join(self.data_sources)}

**缺失数据**:
"""
        for m in self.missing_data:
            md += f"- ❌ {m}\n"

        if self.assumptions:
            md += "\n**分析假设**:\n"
            for a in self.assumptions:
                md += f"- 📝 {a}\n"

        md += f"""
---

*本报告基于公开数据生成，仅供参考，不构成投资建议。*
"""
        return md

    def print_report(self):
        """打印报告"""
        print(self.to_markdown())


class ProjectAnalyzer:
    """项目分析器"""

    def __init__(self):
        self.fetcher = DataFetcher()
        self.collapse_analyzer = CollapseAnalyzer()

    def analyze(
        self,
        query: str,
        chain: Optional[str] = None,
        user_params: Optional[Dict] = None,
        ponzi_type_override: Optional[PonziType] = None
    ) -> AnalysisReport:
        """
        分析项目

        query: 代币ID、符号或合约地址
        chain: 可选，指定链
        user_params: 用户提供的额外参数
        ponzi_type_override: 强制指定盘型
        """
        user_params = user_params or {}

        # 1. 获取项目数据
        print(f"\n📊 正在获取 {query} 的数据...")
        project_data = self.fetcher.fetch_all(query, chain)

        if not project_data.symbol:
            # 尝试从DEXScreener搜索
            dex_results = self.fetcher.search_dex_pairs(query)
            if dex_results:
                project_data.symbol = dex_results[0].base_token
                project_data.name = dex_results[0].base_token
                project_data.price = dex_results[0].price_usd
                project_data.market_cap = dex_results[0].market_cap
                project_data.fdv = dex_results[0].fdv
                project_data.liquidity_usd = dex_results[0].liquidity_usd
                project_data.chain = dex_results[0].chain

        # 2. 识别项目类别
        category = self._identify_category(project_data)

        # 3. 判断盘型
        if ponzi_type_override:
            ponzi_type = ponzi_type_override
            confidence = 1.0
            reasons = ["用户指定"]
        else:
            ponzi_type, confidence, reasons = self._identify_ponzi_type(project_data, category)

        # 4. 准备崩盘模型参数
        params, assumptions = self._prepare_params(project_data, ponzi_type, user_params)

        # 5. 运行崩盘模型
        print(f"\n🔍 运行{ponzi_type.value}崩盘模型...")
        result = self.collapse_analyzer.analyze(ponzi_type, params)

        # 6. 生成建议
        recommendations = self._generate_recommendations(
            project_data, ponzi_type, result, params
        )

        # 7. 计算数据完整度
        completeness = self._calculate_completeness(project_data)

        # 8. 生成报告
        report = AnalysisReport(
            project_name=project_data.name or query,
            symbol=project_data.symbol or query.upper(),
            chain=project_data.chain,
            category=category,
            ponzi_type=ponzi_type,
            ponzi_type_confidence=confidence,
            ponzi_type_reasons=reasons,
            risk_level=result.risk_level,
            risk_score=result.risk_score,
            collapse_probability=result.collapse_probability,
            days_to_collapse=result.days_to_collapse,
            metrics=result.metrics,
            warnings=result.warnings,
            recommendations=recommendations,
            data_completeness=completeness,
            missing_data=project_data.missing_data,
            assumptions=assumptions,
            analysis_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            data_sources=project_data.data_sources
        )

        return report

    def _identify_category(self, data: ProjectData) -> ProjectCategory:
        """识别项目类别"""
        name_lower = data.name.lower() if data.name else ""
        symbol_lower = data.symbol.lower() if data.symbol else ""
        category_lower = data.category.lower() if data.category else ""

        # 基于名称/符号的关键词判断
        meme_keywords = ['pepe', 'doge', 'shib', 'floki', 'wojak', 'bonk', 'meme', 'inu', 'cat', 'frog']
        ai_keywords = ['ai', 'gpt', 'agent', 'neural', 'bot']
        gamefi_keywords = ['game', 'play', 'nft', 'meta', 'verse', 'land']

        for kw in meme_keywords:
            if kw in name_lower or kw in symbol_lower:
                return ProjectCategory.MEME

        for kw in ai_keywords:
            if kw in name_lower or kw in symbol_lower:
                return ProjectCategory.AI

        for kw in gamefi_keywords:
            if kw in name_lower or kw in symbol_lower:
                return ProjectCategory.GAMEFI

        # 基于DeFiLlama分类
        if category_lower:
            if 'dex' in category_lower or 'lending' in category_lower or 'yield' in category_lower:
                return ProjectCategory.DEFI
            if 'bridge' in category_lower or 'oracle' in category_lower:
                return ProjectCategory.INFRA

        # 基于TVL判断DeFi
        if data.tvl > 0:
            return ProjectCategory.DEFI

        # 基于市值判断L1/L2
        if data.market_cap > 1_000_000_000:  # >10亿可能是公链
            return ProjectCategory.L1

        return ProjectCategory.UNKNOWN

    def _identify_ponzi_type(
        self,
        data: ProjectData,
        category: ProjectCategory
    ) -> tuple[PonziType, float, List[str]]:
        """
        判断盘型

        返回: (盘型, 置信度, 判断理由)
        """
        reasons = []
        scores = {
            PonziType.SPLIT: 0,
            PonziType.DIVIDEND: 0,
            PonziType.MUTUAL: 0
        }

        # 1. 基于类别的初步判断
        if category == ProjectCategory.MEME:
            scores[PonziType.SPLIT] += 3
            reasons.append("Meme币典型拆分盘结构")

        if category == ProjectCategory.DEFI:
            if data.tvl > 0 and data.tvl > data.market_cap * 0.5:
                scores[PonziType.MUTUAL] += 2
                reasons.append("TVL > 50% 市值，疑似互助盘")
            else:
                scores[PonziType.DIVIDEND] += 2
                reasons.append("DeFi协议可能是分红盘")

        if category == ProjectCategory.GAMEFI:
            scores[PonziType.DIVIDEND] += 2
            reasons.append("GameFi通常是分红盘结构")

        # 2. 基于FDV/MC判断
        if data.fdv_mc_ratio > 5:
            scores[PonziType.SPLIT] += 2
            reasons.append(f"FDV/MC={data.fdv_mc_ratio:.1f}x，大量代币未解锁，拆分盘特征")
        elif data.fdv_mc_ratio > 2:
            scores[PonziType.SPLIT] += 1
            reasons.append(f"FDV/MC={data.fdv_mc_ratio:.1f}x，有拆分盘倾向")
        else:
            scores[PonziType.DIVIDEND] += 1
            reasons.append("FDV接近MC，可能是分红盘")

        # 3. 基于流动性判断
        if data.liquidity_depth < 0.05:
            scores[PonziType.SPLIT] += 1
            reasons.append("流动性深度低，拆分盘特征")

        # 4. 基于买卖比判断
        if data.buys_24h > 0 and data.sells_24h > 0:
            buy_sell_ratio = data.buys_24h / data.sells_24h
            if buy_sell_ratio < 0.5:
                scores[PonziType.SPLIT] += 1
                reasons.append("卖单远多于买单，拆分盘末期特征")

        # 5. 确定盘型
        max_type = max(scores, key=scores.get)
        max_score = scores[max_type]
        total_score = sum(scores.values())
        confidence = max_score / total_score if total_score > 0 else 0.5

        # 默认拆分盘（大多数项目）
        if max_score == 0:
            max_type = PonziType.SPLIT
            confidence = 0.6
            reasons.append("默认判定为拆分盘")

        return max_type, confidence, reasons

    def _prepare_params(
        self,
        data: ProjectData,
        ponzi_type: PonziType,
        user_params: Dict
    ) -> tuple[Dict, List[str]]:
        """准备崩盘模型参数"""
        assumptions = []

        if ponzi_type == PonziType.SPLIT:
            params = {
                'market_cap': data.market_cap or user_params.get('market_cap', 1000000),
                'liquidity': data.liquidity_usd or user_params.get('liquidity', 100000),
                'daily_buy_volume': data.buy_volume_24h or user_params.get('daily_buy_volume', 50000),
                'daily_sell_volume': data.sell_volume_24h or user_params.get('daily_sell_volume', 50000),
                'new_buyers': data.buyers_24h or user_params.get('new_buyers', 100),
                'whale_holdings': user_params.get('whale_holdings', 0.3),
                'split_rate': user_params.get('split_rate', 1.0),
                'fdv_mc_ratio': data.fdv_mc_ratio or user_params.get('fdv_mc_ratio', 1.0),
                'token_unlock': user_params.get('token_unlock', 0),
                'price': data.price or user_params.get('price', 1.0)
            }

            if not data.buy_volume_24h:
                assumptions.append("买卖量基于交易量按买卖单数比例估算")
            if 'whale_holdings' not in user_params:
                assumptions.append("大户持仓假设为30%（无链上数据）")

        elif ponzi_type == PonziType.DIVIDEND:
            params = {
                'daily_payout': user_params.get('daily_payout', data.volume_24h * 0.01),  # 假设1%
                'daily_inflow': data.buy_volume_24h or user_params.get('daily_inflow', 50000),
                'available_liquidity': data.liquidity_usd or user_params.get('available_liquidity', 100000),
                'token_unlock': user_params.get('token_unlock', 0),
                'sell_pressure_ratio': user_params.get('sell_pressure_ratio', 0.5),
                'chip_concentration': user_params.get('chip_concentration', 0.8),
                'price': data.price or user_params.get('price', 1.0)
            }

            if 'daily_payout' not in user_params:
                assumptions.append("日拨出假设为交易量的1%")

        elif ponzi_type == PonziType.MUTUAL:
            params = {
                'global_debt': data.tvl or user_params.get('global_debt', data.market_cap),
                'liquidatable_assets': user_params.get('liquidatable_assets', (data.tvl or data.market_cap) * 0.8),
                'external_liquidity': data.liquidity_usd or user_params.get('external_liquidity', 100000),
                'daily_interest_rate': user_params.get('daily_interest_rate', 0.01),
                'withdrawal_rate': user_params.get('withdrawal_rate', 0.05),
                'new_deposit': data.buy_volume_24h or user_params.get('new_deposit', 50000),
                'rake_rate': user_params.get('rake_rate', 0.1)
            }

            if 'daily_interest_rate' not in user_params:
                assumptions.append("日利率假设为1%")
            if 'withdrawal_rate' not in user_params:
                assumptions.append("日提现率假设为5%")

        else:
            params = data.to_collapse_params("split")

        return params, assumptions

    def _generate_recommendations(
        self,
        data: ProjectData,
        ponzi_type: PonziType,
        result: SimulationResult,
        params: Dict
    ) -> List[str]:
        """生成建议"""
        recommendations = []

        # 基于风险等级的通用建议
        if result.risk_level == CollapseRisk.CRITICAL:
            recommendations.append("风险极高，建议立即止损或避免参与")
            recommendations.append("如已持仓，考虑分批减仓")
        elif result.risk_level == CollapseRisk.DANGER:
            recommendations.append("风险较高，建议谨慎参与或降低仓位")
            recommendations.append("密切关注流动性和大户动向")
        elif result.risk_level == CollapseRisk.WARNING:
            recommendations.append("存在风险信号，建议设置止损")
            recommendations.append("关注项目方动态和代币解锁时间")
        else:
            recommendations.append("当前风险可控，但仍需保持警惕")

        # 基于盘型的特定建议
        if ponzi_type == PonziType.SPLIT:
            if data.fdv_mc_ratio > 5:
                recommendations.append(f"FDV/MC高达{data.fdv_mc_ratio:.1f}x，注意未来解锁抛压")
            if data.liquidity_depth < 0.05:
                recommendations.append("流动性深度不足5%，大额交易将产生显著滑点")
            if params.get('new_buyers', 0) < 50:
                recommendations.append("新买家数量偏低，增量枯竭风险增加")

        elif ponzi_type == PonziType.DIVIDEND:
            recommendations.append("分红盘需关注日拨出与入金比例")
            recommendations.append("筹码过度分散时风险急剧上升")

        elif ponzi_type == PonziType.MUTUAL:
            recommendations.append("互助盘需关注偿付比(资产/债务)")
            recommendations.append("日提现率超过10%时风险极高")

        # 基于具体指标的建议
        if result.days_to_collapse and result.days_to_collapse < 30:
            recommendations.append(f"模型预测{result.days_to_collapse}天内可能崩盘，需高度警惕")

        return recommendations

    def _calculate_completeness(self, data: ProjectData) -> float:
        """计算数据完整度"""
        fields = [
            ('price', data.price > 0),
            ('market_cap', data.market_cap > 0),
            ('fdv', data.fdv > 0),
            ('volume_24h', data.volume_24h > 0),
            ('liquidity', data.liquidity_usd > 0),
            ('buy_sell_data', data.buys_24h > 0),
            ('tvl', data.tvl > 0 or data.category == "unknown"),  # 非DeFi可以没有TVL
            ('circulating_supply', data.circulating_supply > 0),
        ]

        complete = sum(1 for _, is_complete in fields if is_complete)
        return complete / len(fields)

    def get_missing_params(self, ponzi_type: PonziType) -> List[MissingParam]:
        """获取需要用户补充的参数"""
        if ponzi_type == PonziType.SPLIT:
            return [
                MissingParam(
                    name="whale_holdings",
                    description="大户持仓比例 (Top 10 holders %)",
                    default_value=0.3,
                    required=False
                ),
                MissingParam(
                    name="token_unlock",
                    description="日解锁量 (tokens)",
                    default_value=0,
                    required=False
                )
            ]
        elif ponzi_type == PonziType.DIVIDEND:
            return [
                MissingParam(
                    name="daily_payout",
                    description="日拨出/分红金额 ($)",
                    default_value=0,
                    required=True
                ),
                MissingParam(
                    name="chip_concentration",
                    description="筹码集中度 (0-1)",
                    default_value=0.8,
                    required=False
                )
            ]
        elif ponzi_type == PonziType.MUTUAL:
            return [
                MissingParam(
                    name="daily_interest_rate",
                    description="日利率 (如 0.01 = 1%)",
                    default_value=0.01,
                    required=True
                ),
                MissingParam(
                    name="withdrawal_rate",
                    description="日提现率 (如 0.05 = 5%)",
                    default_value=0.05,
                    required=True
                )
            ]
        return []


def quick_analyze(query: str, chain: Optional[str] = None) -> AnalysisReport:
    """
    快速分析项目

    用法:
        report = quick_analyze("pepe")
        report = quick_analyze("0x1234...", chain="ethereum")
    """
    analyzer = ProjectAnalyzer()
    report = analyzer.analyze(query, chain)
    report.print_report()
    return report


if __name__ == "__main__":
    print("\n" + "="*60)
    print("项目分析器 - 示例")
    print("="*60)

    # 分析示例项目
    report = quick_analyze("pepe")
