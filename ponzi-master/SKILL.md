---
name: ponzi-master
description: |
  Web3项目设计与分析大师，基于Open Rug社会学理论框架。用于：(1) 分析现有Web3项目的盘型结构和套利逻辑，(2) 设计新项目的代币经济学和社区运营策略，(3) 评估项目风险和崩盘模型，(4) 制定冷启动和增长策略。当用户提到：分析项目、设计tokenomics、起盘策略、社区运营、崩盘风险、三盘理论、PVP、套利分析、Pump机制、空投策略、meme币设计、veToken、流动性设计、正向猜疑链、IQ50/150时触发此技能。
---

# Ponzi Master - Web3项目设计与分析框架

基于《开源镰刀 Open Rug》系列理论框架的项目分析与设计工具。

**知识库**：`references/` 目录下的所有文档

## 核心理论速查

### 三盘分类法

| 盘型 | 核心机制 | 崩盘条件 | 典型案例 |
|-----|---------|---------|---------|
| **分红盘** | 时间换收益，沉没成本锁定 | 拨出比>收入 | 矿币、质押、Kaito |
| **互助盘** | 资金错配，后金补前金 | 系统债务>可清算资产 | veToken贿选、OHM |
| **拆分盘** | 资产拆分吸引增量 | 拆分速率↓ 或 增量枯竭 | Pump.fun、NFT、公链生态 |

详细：读取 `00-ponzi-overview.md` 至 `03-split-ponzi.md`

### IQ分层模型

| 类型 | 特征 | 设计策略 |
|-----|-----|---------|
| **IQ50** | 无脑冲、决策秒级、不分析 | 简化符号、降低门槛、强FOMO |
| **IQ100** | 做研究、分析瘫痪、被信息绑架 | 提供"分析素材"让其自我说服 |
| **IQ150** | 看机制、问利益、想做庄 | 直接谈利益分配、设计共赢 |

> "币圈IQ50和IQ150才能赚钱，中间的大多亏钱"

详细：读取 `27-sociology.md`

### 套利三要素

- **套利来源**：我套谁的利？
- **套利机制**：套的什么利？（什么不对称）
- **套利空间**：空间有多大？

> 回答不了这三个问题？趁早歇逼。

详细：读取 `11-arbitrage.md` 和 `25-arbitrage-first.md`

### 五大成本

信任成本 → 开发成本 → 获客成本 → 做市成本 → 退出成本

详细：读取 `05-industrialization.md` 和 `23-ponzi-industrial.md`

## 工作流

### 工作流A：项目分析

当用户要求分析某个Web3项目时：

1. **盘型判断** → 读取 `00-ponzi-overview.md`
2. **套利识别** → 读取 `11-arbitrage.md`
3. **崩盘评估** → 读取 `01-dividend-ponzi.md` / `02-mutual-ponzi.md` / `03-split-ponzi.md`
4. **社会学解构** → 读取 `27-sociology.md`

**输出格式**：
```markdown
## [项目名] 分析报告

### 1. 盘型分类
- 主盘型：[分红/互助/拆分]
- 混合特征：[如有]
- 关键机制：[核心玩法]

### 2. 套利结构
- 套利来源：[谁的利]
- 套利机制：[什么不对称]
- 套利空间：[大小评估]
- 套利叙事：[门外汉能懂吗]

### 3. 崩盘风险
- 崩盘模型：[适用公式]
- 触发条件：[具体指标]
- 预警信号：[可观测数据]
- 当前状态：[离崩盘多远]

### 4. 受众与社会学
- 目标IQ层：[50/100/150]
- 阈值分布：[Degen比例]
- 符号系统：[Meme强度]
- 社会资本：[积累机制]
```

### 工作流B：项目设计

当用户要求设计新项目时：

1. **受众定位** → 明确IQ层和阈值分布
2. **盘型选择** → 读取 `04-audience-timing.md`
3. **成本规划** → 读取 `05-industrialization.md`
4. **空投设计** → 读取 `10-airdrop-design.md`
5. **代币设计** → 读取 `12-tokenomics.md`
6. **传播设计** → 读取 `13-attention-pricing.md`

**输出格式**：
```markdown
## [项目名] 设计方案

### 1. 定位
- 目标受众：[IQ层 + 阈值分布]
- 盘型选择：[类型 + 理由]
- 套利故事：[一句话版本]

### 2. 机制设计
- 发行机制：[怎么进]
- 交易机制：[怎么博弈]
- 做市机制：[谁决定胜负]

### 3. 成本预算
| 成本类型 | 预算 | 方案 |
|---------|-----|-----|
| 信任成本 | | |
| 开发成本 | | |
| 获客成本 | | |
| 做市成本 | | |
| 退出成本 | | |

### 4. 符号与叙事
- 核心Meme：[视觉符号]
- 套利叙事：[易懂故事]
- 区隔标签：[身份认同]

### 5. 生命周期规划
| 阶段 | 目标 | 策略 | 退出条件 |
|-----|-----|-----|---------|
| 冷启动 | | | |
| 增长期 | | | |
| 成熟期 | | | |
| 退出期 | | | |
```

### 工作流C：咨询引导

当用户类型不明确时，先识别用户类型：

| 用户类型 | 识别特征 | 推荐方法论 |
|---------|---------|----------|
| **项目方** | 问设计、问tokenomics、问怎么做 | 工业化框架 + 空投设计 + 代币设计 |
| **投资者** | 问值不值得买、问风险、问时机 | 三盘分析 + 崩盘模型 + 时机论 |
| **撸毛党** | 问怎么撸、问空投预期 | 空投设计 + 撸毛工会政治学 |
| **学习者** | 问原理、问为什么 | 从三盘概述开始系统学习 |

详细：读取 `21-consulting.md`

## 快速诊断命令

- **分析 [项目名]**：执行工作流A，输出分析报告
- **设计 [项目类型]**：执行工作流B，输出设计方案
- **[用户问题]**：执行工作流C，先识别再匹配

## 核心原则

1. **套利第一性** - 所有成功项目都是套利故事
2. **IQ两端赚钱** - 设计要么极简(IQ50)要么深度(IQ150)
3. **符号胜过功能** - Meme传播力 > 产品实用性
4. **成本工业化** - 持续低成本批量生产
5. **退出前置** - 起盘时就规划退出

## 知识库索引

### 核心理论 (00-09)
| 文档 | 内容 |
|-----|-----|
| `00-ponzi-overview.md` | 三盘定义、公式、崩盘条件 |
| `01-dividend-ponzi.md` | 矿机盘、防崩盘策略 |
| `02-mutual-ponzi.md` | 3M/OHM模型、清算机制 |
| `03-split-ponzi.md` | FT/公链分析、四大崩盘点 |
| `04-audience-timing.md` | 时机判断 |
| `05-industrialization.md` | 五大成本 |
| `06-composability.md` | 飞轮效应 |
| `07-liquidity.md` | AMM/Pump分析 |
| `08-analysis-template.md` | 五步分析法 |
| `09-glossary.md` | 核心术语定义 |

### 实用方法论 (10-21)
| 文档 | 内容 |
|-----|-----|
| `10-airdrop-design.md` | 空投三型、TGE公式 |
| `11-arbitrage.md` | 套利三要素 |
| `12-tokenomics.md` | 土耳其里拉模型 |
| `13-attention-pricing.md` | FOMO猜疑链、RWA |
| `14-narrative.md` | 受众扩展、DePIN案例 |
| `15-perp-dex.md` | CLOB vs AMM |
| `16-airdrop-politics.md` | YGG案例、维权武器 |
| `17-gamblefi-design.md` | Pump=Crash |
| `18-mass-admission.md` | 高频用户培养 |
| `19-sunk-cost.md` | 三种局面应对 |
| `20-chain-economics.md` | POW vs POS |
| `21-consulting.md` | 用户识别、决策树 |

### 专题理论 (22-27)
| 文档 | 内容 |
|-----|-----|
| `22-fomo-chain.md` | FOMO数学模型 |
| `23-ponzi-industrial.md` | 五大成本详解 |
| `24-pvp-gen.md` | GenZ特征 |
| `25-arbitrage-first.md` | 流动性/屏幕时间套利 |
| `26-gamblefi-theory.md` | 博彩三要素 |
| `27-sociology.md` | 10大理论+IQ分层 |

### 附录
| 文档 | 内容 |
|-----|-----|
| `A1-deep-research.md` | 社会/金融/人文视角 |
| `A2-timeline.md` | 重大事件梳理 |

## 工具脚本

### scripts/project_analyzer.py - 一键分析器（推荐）

**完整工作流**：自动获取数据 → 识别盘型 → 运行崩盘模型 → 生成报告

```python
from project_analyzer import quick_analyze

# 一键分析项目
report = quick_analyze("pepe")           # 通过代币名
report = quick_analyze("0x1234...")      # 通过合约地址
report = quick_analyze("UNI", chain="ethereum")  # 指定链
```

**输出示例**：
```markdown
# PEPE (PEPE) 分析报告

**链**: ethereum
**类别**: meme

---

## 1. 盘型判断

**判定**: split (置信度: 85%)

**判断依据**:
- Meme币典型拆分盘结构
- FDV/MC=1.5x，有拆分盘倾向
- 流动性深度低，拆分盘特征

---

## 2. 风险评估

| 指标 | 数值 |
|-----|------|
| 风险等级 | 🟡 WARNING |
| 风险分数 | 45.2/100 |
| 崩盘概率 | 45.2% |
| 预计崩盘 | 25天内 |

---

## 5. 建议

- 💡 存在风险信号，建议设置止损
- 💡 关注项目方动态和代币解锁时间
- 💡 流动性深度不足5%，大额交易将产生显著滑点
```

**自动获取的数据**：
| 数据 | 来源 | 自动? |
|-----|------|------|
| 价格/市值/FDV | CoinGecko | ✅ |
| 流动性/交易量 | DEXScreener | ✅ |
| 买卖单数/买家数 | DEXScreener | ✅ |
| TVL | DeFiLlama | ✅ |
| 解锁时间表 | - | ❌ 需补充 |
| 持仓分布 | - | ❌ 需补充 |

**补充缺失数据**：
```python
from project_analyzer import ProjectAnalyzer

analyzer = ProjectAnalyzer()
report = analyzer.analyze("pepe", user_params={
    'whale_holdings': 0.4,        # 手动补充大户持仓
    'token_unlock': 1000000,      # 手动补充日解锁量
})
```

---

### scripts/data_fetcher.py - 数据获取器

从公开 API 获取项目数据。

**支持的数据源**：
- CoinGecko: 价格、市值、交易量、供应量
- DEXScreener: DEX 流动性、交易数据、买卖单
- DeFiLlama: TVL、协议数据

**快速使用**：
```python
from data_fetcher import analyze_project, DataFetcher

# 快速获取项目数据
data = analyze_project("ethereum")
data = analyze_project("0x1234...", chain="bsc")

# 详细使用
fetcher = DataFetcher()

# 搜索代币
results = fetcher.search_token("pepe")

# 获取DEX数据
dex_data = fetcher.get_dex_data_by_address("0x1234...")

# 获取协议TVL
tvl_data = fetcher.get_protocol_tvl("uniswap")
```

**输出示例**：
```
项目数据: Pepe (PEPE)
============================================================

【价格与市值】
  价格: $0.000012
  市值: $5,234,567,890
  FDV: $7,851,851,835
  FDV/MC: 1.50x

【流动性】
  DEX流动性: $45,678,901
  流动性深度: 0.87%

【24h交易】
  交易量: $234,567,890
  买入量: $140,740,734
  卖出量: $93,827,156
  净流入: $46,913,578
  买单数: 12,345
  卖单数: 8,230

【数据来源】
  ✅ CoinGecko
  ✅ DEXScreener

【缺失数据】
  ❌ 解锁时间表 (需要TokenUnlocks API或手动输入)
  ❌ 持仓分布 (需要区块链浏览器API)
```

---

### scripts/tokenomics_calc.py - 代币经济学计算器

为崩盘模型提供输入参数。

**功能**：
- 解锁时间表计算 (Unlock Schedule)
- 通胀率计算 (Inflation Rate)
- FDV/MC 分析
- 抛压预测 (Sell Pressure Forecast)

**快速使用**：
```python
from tokenomics_calc import quick_analysis

calc = quick_analysis(
    total_supply=1_000_000_000,
    initial_price=0.10,
    token_name="EXAMPLE",
    allocations=[
        {"name": "Team", "tokens": 150_000_000, "tge": 0, "cliff": 12, "vesting": 36},
        {"name": "Investors", "tokens": 200_000_000, "tge": 10, "cliff": 6, "vesting": 24},
        {"name": "Community", "tokens": 250_000_000, "tge": 30, "cliff": 0, "vesting": 24},
        {"name": "Ecosystem", "tokens": 300_000_000, "tge": 5, "cliff": 0, "vesting": 48},
        {"name": "Treasury", "tokens": 100_000_000, "tge": 0, "cliff": 6, "vesting": 36},
    ]
)
calc.print_summary()
```

**输出示例**：
```
代币经济学分析报告: EXAMPLE
============================================================

【基础信息】
  总供应量: 1,000,000,000
  初始价格: $0.1000
  FDV: $100,000,000

【关键时间节点】
  月份   流通量          流通%     MC              FDV/MC
  0      95,000,000       9.5%  $9,500,000       10.53x
  6      207,500,000     20.8%  $20,750,000       4.82x
  12     345,833,333     34.6%  $34,583,333       2.89x
  24     670,833,333     67.1%  $67,083,333       1.49x

【抛压预测（未来12个月）】
  预计总抛压: $35,000,000
```

---

### scripts/collapse_model.py - 崩盘模型模拟器

基于三盘理论的崩盘预测与模拟。

**三种盘型的崩盘条件**：

| 盘型 | 崩盘条件 | 关键参数 |
|-----|---------|---------|
| **分红盘** | 拨出 > 新入金 + 流动性 | daily_payout, daily_inflow, liquidity |
| **互助盘** | 全局债务 > 可清算资产 + 外部流动性 | global_debt, liquidatable_assets |
| **拆分盘** | 新买盘 < 拆分需求 OR 存量抛售 | market_cap, liquidity, net_flow |

**快速使用**：

```python
from collapse_model import quick_split_analysis, quick_dividend_analysis, quick_mutual_analysis

# 分析Meme币（拆分盘）
quick_split_analysis(
    market_cap=5_000_000,       # 市值$500万
    liquidity=500_000,          # 底池$50万
    daily_buy_volume=200_000,   # 日买入$20万
    daily_sell_volume=300_000,  # 日卖出$30万
    new_buyers=50,              # 新买家50人
    whale_holdings=0.4,         # 大户持仓40%
    fdv_mc_ratio=5.0            # FDV/MC = 5x
)

# 分析质押项目（分红盘）
quick_dividend_analysis(
    daily_payout=100_000,       # 日分红$10万
    daily_inflow=80_000,        # 日新入金$8万
    available_liquidity=500_000 # 底池$50万
)

# 分析OHM Fork（互助盘）
quick_mutual_analysis(
    global_debt=10_000_000,     # 全局债务$1000万
    liquidatable_assets=8_000_000,
    external_liquidity=500_000,
    daily_interest_rate=0.02,   # 日息2%
    withdrawal_rate=0.08        # 日提现8%
)
```

**输出示例**：
```
崩盘风险分析 - 拆分盘
============================================================

【风险评估】
  风险等级: 🟠 DANGER
  风险分数: 65.3/100
  崩盘概率: 65.3%
  预计崩盘: 12 天内

【关键指标】
  market_cap: $5,000,000
  liquidity: $500,000
  liquidity_depth: 0.1000
  net_flow: -$100,000
  whale_holdings: 0.4000

【警告信号】
  ⚠️  净流出: $100,000
  ⚠️  新买家不足: 50
  ⚠️  大户集中度过高: 40.0%
```

**风险等级**：
- 🟢 SAFE (< 30%) - 安全
- 🟡 WARNING (30-60%) - 警告
- 🟠 DANGER (60-80%) - 危险
- 🔴 CRITICAL (> 80%) - 临界

---

### 联合使用示例

```python
from tokenomics_calc import TokenomicsCalculator, create_example_config
from collapse_model import quick_split_analysis

# 1. 先用tokenomics计算解锁抛压
config = create_example_config()
calc = TokenomicsCalculator(config)
forecast = calc.get_sell_pressure_forecast(12)

# 2. 将抛压数据输入崩盘模型
month_6 = forecast[5]  # 第6个月
quick_split_analysis(
    market_cap=50_000_000,
    liquidity=5_000_000,
    daily_buy_volume=500_000,
    daily_sell_volume=300_000,
    token_unlock=month_6['new_unlock'] / 30,  # 月解锁转日解锁
    price=0.10
)
```

## 警示

此技能用于**分析和教育目的**。理解机制是为了：
- 识别风险，保护自己
- 理解市场，做informed决策
- 学术研究，理解社会现象
