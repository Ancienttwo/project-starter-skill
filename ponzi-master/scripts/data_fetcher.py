#!/usr/bin/env python3
"""
Data Fetcher - Web3项目数据自动获取
从公开API获取项目数据，为崩盘模型提供输入

数据源:
- CoinGecko: 价格、市值、交易量、历史数据
- DeFiLlama: TVL、协议数据
- DEXScreener: DEX流动性、交易数据
- TokenUnlocks: 解锁时间表（需付费API，这里用模拟）
- Etherscan/区块链浏览器: 持仓分布（需API key）

使用:
    fetcher = DataFetcher()
    data = fetcher.fetch_all("ethereum")  # 输入代币ID或地址
"""

import json
import time
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from urllib.parse import quote
import ssl


# 禁用SSL验证（某些环境需要）
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE


@dataclass
class TokenData:
    """代币基础数据"""
    id: str
    symbol: str
    name: str
    price: float
    market_cap: float
    fdv: float
    volume_24h: float
    price_change_24h: float
    price_change_7d: float
    circulating_supply: float
    total_supply: float
    max_supply: Optional[float]
    ath: float
    ath_date: str
    atl: float
    atl_date: str
    last_updated: str


@dataclass
class DexData:
    """DEX交易数据"""
    pair_address: str
    base_token: str
    quote_token: str
    price_usd: float
    liquidity_usd: float
    volume_24h: float
    volume_6h: float
    volume_1h: float
    price_change_24h: float
    price_change_6h: float
    price_change_1h: float
    buys_24h: int
    sells_24h: int
    buyers_24h: int
    sellers_24h: int
    txns_24h: int
    fdv: float
    market_cap: float
    created_at: Optional[str]
    dex_id: str
    chain: str


@dataclass
class ProtocolData:
    """协议TVL数据"""
    id: str
    name: str
    symbol: str
    chain: str
    tvl: float
    tvl_change_1d: float
    tvl_change_7d: float
    mcap_tvl: Optional[float]
    category: str
    chains: List[str]


@dataclass
class UnlockEvent:
    """解锁事件"""
    date: str
    amount: float
    percent_of_total: float
    category: str  # team, investor, community等
    cliff_end: bool


@dataclass
class UnlockSchedule:
    """解锁时间表"""
    token: str
    total_supply: float
    circulating_supply: float
    locked_supply: float
    next_unlock_date: Optional[str]
    next_unlock_amount: Optional[float]
    events: List[UnlockEvent] = field(default_factory=list)


@dataclass
class HolderData:
    """持仓分布数据"""
    address: str
    balance: float
    percent: float
    is_contract: bool
    label: Optional[str]  # exchange, team, etc.


@dataclass
class ProjectData:
    """项目完整数据"""
    # 基础信息
    token_id: str
    symbol: str
    name: str

    # 价格数据
    price: float = 0.0
    market_cap: float = 0.0
    fdv: float = 0.0
    volume_24h: float = 0.0

    # 供应数据
    circulating_supply: float = 0.0
    total_supply: float = 0.0
    fdv_mc_ratio: float = 1.0

    # 流动性数据
    liquidity_usd: float = 0.0
    liquidity_depth: float = 0.0  # liquidity / market_cap

    # 交易数据
    buys_24h: int = 0
    sells_24h: int = 0
    buyers_24h: int = 0
    sellers_24h: int = 0
    buy_volume_24h: float = 0.0
    sell_volume_24h: float = 0.0
    net_flow_24h: float = 0.0

    # TVL数据（DeFi项目）
    tvl: float = 0.0
    mcap_tvl: Optional[float] = None

    # 解锁数据
    unlock_schedule: Optional[UnlockSchedule] = None
    next_unlock_days: Optional[int] = None
    next_unlock_percent: Optional[float] = None

    # 持仓分布
    top_holders: List[HolderData] = field(default_factory=list)
    whale_holdings: float = 0.0  # top 10 holders %

    # 元数据
    chain: str = "unknown"
    category: str = "unknown"
    data_sources: List[str] = field(default_factory=list)
    missing_data: List[str] = field(default_factory=list)
    fetch_time: str = ""

    def to_collapse_params(self, ponzi_type: str = "split") -> Dict:
        """转换为崩盘模型参数"""
        if ponzi_type == "split":
            return {
                'market_cap': self.market_cap,
                'liquidity': self.liquidity_usd,
                'daily_buy_volume': self.buy_volume_24h,
                'daily_sell_volume': self.sell_volume_24h,
                'new_buyers': self.buyers_24h,
                'whale_holdings': self.whale_holdings,
                'fdv_mc_ratio': self.fdv_mc_ratio,
                'token_unlock': 0,  # 需要从unlock_schedule计算
                'price': self.price
            }
        elif ponzi_type == "dividend":
            # 分红盘需要更多自定义参数
            return {
                'daily_payout': 0,  # 需要用户输入
                'daily_inflow': self.buy_volume_24h,
                'available_liquidity': self.liquidity_usd,
                'token_unlock': 0,
                'price': self.price
            }
        elif ponzi_type == "mutual":
            return {
                'global_debt': self.tvl,  # TVL近似债务
                'liquidatable_assets': self.tvl * 0.8,  # 假设80%可清算
                'external_liquidity': self.liquidity_usd,
                'daily_interest_rate': 0.01,  # 需要用户输入
                'withdrawal_rate': 0.05,  # 需要用户输入
                'new_deposit': self.buy_volume_24h
            }
        return {}


class DataFetcher:
    """数据获取器"""

    # API endpoints
    COINGECKO_API = "https://api.coingecko.com/api/v3"
    DEFILLAMA_API = "https://api.llama.fi"
    DEXSCREENER_API = "https://api.dexscreener.com/latest"

    def __init__(self, cache_ttl: int = 300):
        """
        初始化

        cache_ttl: 缓存有效期（秒）
        """
        self.cache: Dict[str, Tuple[Any, float]] = {}
        self.cache_ttl = cache_ttl
        self.rate_limit_delay = 1.0  # 请求间隔（秒）
        self.last_request_time = 0.0

    def _rate_limit(self):
        """限速"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - elapsed)
        self.last_request_time = time.time()

    def _get_cache(self, key: str) -> Optional[Any]:
        """获取缓存"""
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.cache_ttl:
                return data
        return None

    def _set_cache(self, key: str, data: Any):
        """设置缓存"""
        self.cache[key] = (data, time.time())

    def _fetch_json(self, url: str, headers: Optional[Dict] = None) -> Optional[Dict]:
        """获取JSON数据"""
        cache_key = url
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        self._rate_limit()

        try:
            req_headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
            if headers:
                req_headers.update(headers)

            request = Request(url, headers=req_headers)
            with urlopen(request, timeout=30, context=ssl_context) as response:
                data = json.loads(response.read().decode('utf-8'))
                self._set_cache(cache_key, data)
                return data
        except HTTPError as e:
            print(f"HTTP Error {e.code}: {url}")
            if e.code == 429:
                print("Rate limited, waiting 60s...")
                time.sleep(60)
            return None
        except URLError as e:
            print(f"URL Error: {e.reason}")
            return None
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    # ==================== CoinGecko API ====================

    def search_token(self, query: str) -> List[Dict]:
        """
        搜索代币
        返回匹配的代币列表
        """
        url = f"{self.COINGECKO_API}/search?query={quote(query)}"
        data = self._fetch_json(url)

        if not data or 'coins' not in data:
            return []

        return data['coins'][:10]  # 返回前10个结果

    def get_token_by_id(self, token_id: str) -> Optional[TokenData]:
        """
        通过CoinGecko ID获取代币数据
        """
        url = f"{self.COINGECKO_API}/coins/{token_id}"
        data = self._fetch_json(url)

        if not data:
            return None

        try:
            market_data = data.get('market_data', {})
            return TokenData(
                id=data.get('id', ''),
                symbol=data.get('symbol', '').upper(),
                name=data.get('name', ''),
                price=market_data.get('current_price', {}).get('usd', 0),
                market_cap=market_data.get('market_cap', {}).get('usd', 0),
                fdv=market_data.get('fully_diluted_valuation', {}).get('usd', 0) or 0,
                volume_24h=market_data.get('total_volume', {}).get('usd', 0),
                price_change_24h=market_data.get('price_change_percentage_24h', 0) or 0,
                price_change_7d=market_data.get('price_change_percentage_7d', 0) or 0,
                circulating_supply=market_data.get('circulating_supply', 0) or 0,
                total_supply=market_data.get('total_supply', 0) or 0,
                max_supply=market_data.get('max_supply'),
                ath=market_data.get('ath', {}).get('usd', 0),
                ath_date=market_data.get('ath_date', {}).get('usd', ''),
                atl=market_data.get('atl', {}).get('usd', 0),
                atl_date=market_data.get('atl_date', {}).get('usd', ''),
                last_updated=data.get('last_updated', '')
            )
        except Exception as e:
            print(f"Error parsing CoinGecko data: {e}")
            return None

    def get_token_by_contract(self, chain: str, address: str) -> Optional[TokenData]:
        """
        通过合约地址获取代币数据

        chain: ethereum, binance-smart-chain, polygon-pos, arbitrum-one, etc.
        """
        url = f"{self.COINGECKO_API}/coins/{chain}/contract/{address}"
        data = self._fetch_json(url)

        if not data:
            return None

        # 复用get_token_by_id的解析逻辑
        try:
            market_data = data.get('market_data', {})
            return TokenData(
                id=data.get('id', ''),
                symbol=data.get('symbol', '').upper(),
                name=data.get('name', ''),
                price=market_data.get('current_price', {}).get('usd', 0),
                market_cap=market_data.get('market_cap', {}).get('usd', 0),
                fdv=market_data.get('fully_diluted_valuation', {}).get('usd', 0) or 0,
                volume_24h=market_data.get('total_volume', {}).get('usd', 0),
                price_change_24h=market_data.get('price_change_percentage_24h', 0) or 0,
                price_change_7d=market_data.get('price_change_percentage_7d', 0) or 0,
                circulating_supply=market_data.get('circulating_supply', 0) or 0,
                total_supply=market_data.get('total_supply', 0) or 0,
                max_supply=market_data.get('max_supply'),
                ath=market_data.get('ath', {}).get('usd', 0),
                ath_date=market_data.get('ath_date', {}).get('usd', ''),
                atl=market_data.get('atl', {}).get('usd', 0),
                atl_date=market_data.get('atl_date', {}).get('usd', ''),
                last_updated=data.get('last_updated', '')
            )
        except Exception as e:
            print(f"Error parsing contract data: {e}")
            return None

    # ==================== DEXScreener API ====================

    def get_dex_data_by_address(self, address: str) -> List[DexData]:
        """
        通过代币地址获取DEX数据
        支持多链自动识别
        """
        url = f"{self.DEXSCREENER_API}/dex/tokens/{address}"
        data = self._fetch_json(url)

        if not data or 'pairs' not in data:
            return []

        results = []
        for pair in data['pairs'][:5]:  # 取流动性最高的5个交易对
            try:
                txns = pair.get('txns', {}).get('h24', {})
                results.append(DexData(
                    pair_address=pair.get('pairAddress', ''),
                    base_token=pair.get('baseToken', {}).get('symbol', ''),
                    quote_token=pair.get('quoteToken', {}).get('symbol', ''),
                    price_usd=float(pair.get('priceUsd', 0) or 0),
                    liquidity_usd=pair.get('liquidity', {}).get('usd', 0) or 0,
                    volume_24h=pair.get('volume', {}).get('h24', 0) or 0,
                    volume_6h=pair.get('volume', {}).get('h6', 0) or 0,
                    volume_1h=pair.get('volume', {}).get('h1', 0) or 0,
                    price_change_24h=pair.get('priceChange', {}).get('h24', 0) or 0,
                    price_change_6h=pair.get('priceChange', {}).get('h6', 0) or 0,
                    price_change_1h=pair.get('priceChange', {}).get('h1', 0) or 0,
                    buys_24h=txns.get('buys', 0),
                    sells_24h=txns.get('sells', 0),
                    buyers_24h=pair.get('txns', {}).get('h24', {}).get('buyers', 0) or txns.get('buys', 0),
                    sellers_24h=pair.get('txns', {}).get('h24', {}).get('sellers', 0) or txns.get('sells', 0),
                    txns_24h=txns.get('buys', 0) + txns.get('sells', 0),
                    fdv=pair.get('fdv', 0) or 0,
                    market_cap=pair.get('marketCap', 0) or 0,
                    created_at=pair.get('pairCreatedAt'),
                    dex_id=pair.get('dexId', ''),
                    chain=pair.get('chainId', '')
                ))
            except Exception as e:
                print(f"Error parsing DEX pair: {e}")
                continue

        return results

    def search_dex_pairs(self, query: str) -> List[DexData]:
        """
        搜索DEX交易对
        """
        url = f"{self.DEXSCREENER_API}/dex/search?q={quote(query)}"
        data = self._fetch_json(url)

        if not data or 'pairs' not in data:
            return []

        results = []
        for pair in data['pairs'][:10]:
            try:
                txns = pair.get('txns', {}).get('h24', {})
                results.append(DexData(
                    pair_address=pair.get('pairAddress', ''),
                    base_token=pair.get('baseToken', {}).get('symbol', ''),
                    quote_token=pair.get('quoteToken', {}).get('symbol', ''),
                    price_usd=float(pair.get('priceUsd', 0) or 0),
                    liquidity_usd=pair.get('liquidity', {}).get('usd', 0) or 0,
                    volume_24h=pair.get('volume', {}).get('h24', 0) or 0,
                    volume_6h=pair.get('volume', {}).get('h6', 0) or 0,
                    volume_1h=pair.get('volume', {}).get('h1', 0) or 0,
                    price_change_24h=pair.get('priceChange', {}).get('h24', 0) or 0,
                    price_change_6h=pair.get('priceChange', {}).get('h6', 0) or 0,
                    price_change_1h=pair.get('priceChange', {}).get('h1', 0) or 0,
                    buys_24h=txns.get('buys', 0),
                    sells_24h=txns.get('sells', 0),
                    buyers_24h=txns.get('buys', 0),
                    sellers_24h=txns.get('sells', 0),
                    txns_24h=txns.get('buys', 0) + txns.get('sells', 0),
                    fdv=pair.get('fdv', 0) or 0,
                    market_cap=pair.get('marketCap', 0) or 0,
                    created_at=pair.get('pairCreatedAt'),
                    dex_id=pair.get('dexId', ''),
                    chain=pair.get('chainId', '')
                ))
            except Exception as e:
                continue

        return results

    # ==================== DeFiLlama API ====================

    def get_protocol_tvl(self, protocol: str) -> Optional[ProtocolData]:
        """
        获取协议TVL数据

        protocol: 协议名称或slug (如 'aave', 'uniswap')
        """
        url = f"{self.DEFILLAMA_API}/protocol/{protocol}"
        data = self._fetch_json(url)

        if not data:
            return None

        try:
            # 计算TVL变化
            tvl_history = data.get('tvl', [])
            current_tvl = tvl_history[-1].get('totalLiquidityUSD', 0) if tvl_history else 0

            tvl_1d_ago = 0
            tvl_7d_ago = 0
            if len(tvl_history) > 1:
                tvl_1d_ago = tvl_history[-2].get('totalLiquidityUSD', 0)
            if len(tvl_history) > 7:
                tvl_7d_ago = tvl_history[-8].get('totalLiquidityUSD', 0)

            tvl_change_1d = ((current_tvl - tvl_1d_ago) / tvl_1d_ago * 100) if tvl_1d_ago > 0 else 0
            tvl_change_7d = ((current_tvl - tvl_7d_ago) / tvl_7d_ago * 100) if tvl_7d_ago > 0 else 0

            return ProtocolData(
                id=data.get('id', ''),
                name=data.get('name', ''),
                symbol=data.get('symbol', ''),
                chain=data.get('chain', ''),
                tvl=current_tvl,
                tvl_change_1d=tvl_change_1d,
                tvl_change_7d=tvl_change_7d,
                mcap_tvl=data.get('mcap', 0) / current_tvl if current_tvl > 0 else None,
                category=data.get('category', ''),
                chains=data.get('chains', [])
            )
        except Exception as e:
            print(f"Error parsing DeFiLlama data: {e}")
            return None

    def search_protocols(self, query: str) -> List[Dict]:
        """
        搜索协议
        """
        url = f"{self.DEFILLAMA_API}/protocols"
        data = self._fetch_json(url)

        if not data:
            return []

        query_lower = query.lower()
        results = []
        for protocol in data:
            name = protocol.get('name', '').lower()
            symbol = protocol.get('symbol', '').lower()
            if query_lower in name or query_lower in symbol:
                results.append({
                    'id': protocol.get('slug', ''),
                    'name': protocol.get('name', ''),
                    'symbol': protocol.get('symbol', ''),
                    'tvl': protocol.get('tvl', 0),
                    'category': protocol.get('category', ''),
                    'chains': protocol.get('chains', [])
                })

        return sorted(results, key=lambda x: x['tvl'], reverse=True)[:10]

    # ==================== 综合获取 ====================

    def fetch_all(self, query: str, chain: Optional[str] = None) -> ProjectData:
        """
        综合获取项目数据

        query: 代币ID、符号、合约地址或项目名
        chain: 可选，指定链（ethereum, bsc, polygon等）

        返回: ProjectData 包含所有可获取的数据
        """
        project = ProjectData(
            token_id=query,
            symbol="",
            name="",
            fetch_time=datetime.now().isoformat()
        )

        missing = []
        sources = []

        # 1. 判断输入类型
        is_address = query.startswith('0x') and len(query) == 42

        # 2. 获取基础代币数据 (CoinGecko)
        token_data = None
        if is_address:
            # 尝试常见链
            chains_to_try = [chain] if chain else ['ethereum', 'binance-smart-chain', 'polygon-pos', 'arbitrum-one', 'base']
            for c in chains_to_try:
                if c:
                    token_data = self.get_token_by_contract(c, query)
                    if token_data:
                        project.chain = c
                        break
        else:
            # 先搜索
            search_results = self.search_token(query)
            if search_results:
                # 取第一个匹配
                token_id = search_results[0].get('id')
                token_data = self.get_token_by_id(token_id)

        if token_data:
            sources.append("CoinGecko")
            project.token_id = token_data.id
            project.symbol = token_data.symbol
            project.name = token_data.name
            project.price = token_data.price
            project.market_cap = token_data.market_cap
            project.fdv = token_data.fdv
            project.volume_24h = token_data.volume_24h
            project.circulating_supply = token_data.circulating_supply
            project.total_supply = token_data.total_supply
            project.fdv_mc_ratio = token_data.fdv / token_data.market_cap if token_data.market_cap > 0 else 1
        else:
            missing.append("基础代币数据 (CoinGecko)")

        # 3. 获取DEX数据
        dex_data_list = []
        if is_address:
            dex_data_list = self.get_dex_data_by_address(query)
        elif project.symbol:
            dex_data_list = self.search_dex_pairs(project.symbol)

        if dex_data_list:
            sources.append("DEXScreener")
            # 聚合多个交易对的数据
            total_liquidity = sum(d.liquidity_usd for d in dex_data_list)
            total_volume = sum(d.volume_24h for d in dex_data_list)
            total_buys = sum(d.buys_24h for d in dex_data_list)
            total_sells = sum(d.sells_24h for d in dex_data_list)

            project.liquidity_usd = total_liquidity
            project.buys_24h = total_buys
            project.sells_24h = total_sells
            project.buyers_24h = sum(d.buyers_24h for d in dex_data_list)
            project.sellers_24h = sum(d.sellers_24h for d in dex_data_list)

            # 估算买卖量（假设买卖数量比例等于交易量比例）
            if total_buys + total_sells > 0:
                buy_ratio = total_buys / (total_buys + total_sells)
                project.buy_volume_24h = total_volume * buy_ratio
                project.sell_volume_24h = total_volume * (1 - buy_ratio)
            project.net_flow_24h = project.buy_volume_24h - project.sell_volume_24h

            # 流动性深度
            if project.market_cap > 0:
                project.liquidity_depth = project.liquidity_usd / project.market_cap

            # 使用第一个交易对的链信息
            if dex_data_list and not project.chain:
                project.chain = dex_data_list[0].chain
        else:
            missing.append("DEX流动性数据")

        # 4. 获取TVL数据（DeFi项目）
        protocol_data = self.get_protocol_tvl(project.token_id)
        if not protocol_data and project.name:
            # 尝试用名字搜索
            protocol_results = self.search_protocols(project.name)
            if protocol_results:
                protocol_data = self.get_protocol_tvl(protocol_results[0]['id'])

        if protocol_data:
            sources.append("DeFiLlama")
            project.tvl = protocol_data.tvl
            project.mcap_tvl = protocol_data.mcap_tvl
            project.category = protocol_data.category
        else:
            missing.append("TVL数据 (如果是DeFi项目)")

        # 5. 标记缺失数据
        missing.append("解锁时间表 (需要TokenUnlocks API或手动输入)")
        missing.append("持仓分布 (需要区块链浏览器API)")

        project.data_sources = sources
        project.missing_data = missing

        return project

    def print_project_summary(self, project: ProjectData):
        """打印项目数据摘要"""
        print(f"\n{'='*60}")
        print(f"项目数据: {project.name} ({project.symbol})")
        print(f"{'='*60}")

        print(f"\n【基础信息】")
        print(f"  Token ID: {project.token_id}")
        print(f"  Chain: {project.chain}")
        print(f"  Category: {project.category}")

        print(f"\n【价格与市值】")
        print(f"  价格: ${project.price:.6f}")
        print(f"  市值: ${project.market_cap:,.0f}")
        print(f"  FDV: ${project.fdv:,.0f}")
        print(f"  FDV/MC: {project.fdv_mc_ratio:.2f}x")

        print(f"\n【供应量】")
        print(f"  流通量: {project.circulating_supply:,.0f}")
        print(f"  总供应: {project.total_supply:,.0f}")
        print(f"  流通率: {project.circulating_supply/project.total_supply*100:.1f}%" if project.total_supply > 0 else "  流通率: N/A")

        print(f"\n【流动性】")
        print(f"  DEX流动性: ${project.liquidity_usd:,.0f}")
        print(f"  流动性深度: {project.liquidity_depth:.2%}")

        print(f"\n【24h交易】")
        print(f"  交易量: ${project.volume_24h:,.0f}")
        print(f"  买入量: ${project.buy_volume_24h:,.0f}")
        print(f"  卖出量: ${project.sell_volume_24h:,.0f}")
        print(f"  净流入: ${project.net_flow_24h:,.0f}")
        print(f"  买单数: {project.buys_24h}")
        print(f"  卖单数: {project.sells_24h}")
        print(f"  买家数: {project.buyers_24h}")
        print(f"  卖家数: {project.sellers_24h}")

        if project.tvl > 0:
            print(f"\n【TVL】")
            print(f"  TVL: ${project.tvl:,.0f}")
            if project.mcap_tvl:
                print(f"  MC/TVL: {project.mcap_tvl:.2f}")

        print(f"\n【数据来源】")
        for source in project.data_sources:
            print(f"  ✅ {source}")

        print(f"\n【缺失数据】")
        for missing in project.missing_data:
            print(f"  ❌ {missing}")

        print(f"\n【获取时间】")
        print(f"  {project.fetch_time}")


def analyze_project(query: str, chain: Optional[str] = None) -> ProjectData:
    """
    快速分析项目

    用法:
        data = analyze_project("ethereum")
        data = analyze_project("0x1234...")
        data = analyze_project("PEPE", chain="ethereum")
    """
    fetcher = DataFetcher()
    project = fetcher.fetch_all(query, chain)
    fetcher.print_project_summary(project)
    return project


if __name__ == "__main__":
    print("\n" + "="*60)
    print("数据获取器 - 示例")
    print("="*60)

    # 示例1: 通过代币ID获取
    print("\n【示例1: 获取 Ethereum 数据】")
    data = analyze_project("ethereum")

    # 示例2: 通过符号搜索
    print("\n【示例2: 搜索 PEPE】")
    data = analyze_project("pepe")

    # 打印崩盘模型参数
    print("\n【转换为崩盘模型参数】")
    params = data.to_collapse_params("split")
    for k, v in params.items():
        print(f"  {k}: {v}")
