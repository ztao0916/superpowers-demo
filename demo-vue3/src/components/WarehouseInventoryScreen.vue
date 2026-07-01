<script setup>
import {
  inventorySummary,
  replenishmentSummary,
  riskLevelLabels,
  riskSkus,
  sevenDayTrend,
  warehouseRisks
} from '../data/warehouseInventory'

const kpis = [
  { label: '库存总件数', value: formatNumber(inventorySummary.totalUnits), tone: 'info' },
  { label: '缺货风险 SKU 数', value: inventorySummary.riskSkuCount, tone: 'danger' },
  { label: '严重缺货 SKU 数', value: inventorySummary.criticalSkuCount, tone: 'warning' },
  { label: '平均可售天数', value: inventorySummary.averageSellableDays, tone: 'watch' },
  { label: '受影响仓库数', value: inventorySummary.affectedWarehouseCount, tone: 'blue' }
]

const riskDistribution = [
  { label: '严重', value: riskSkus.filter((row) => row.riskLevel === 'critical').length, tone: 'critical' },
  { label: '预警', value: riskSkus.filter((row) => row.riskLevel === 'warning').length, tone: 'warning' },
  { label: '关注', value: riskSkus.filter((row) => row.riskLevel === 'watch').length, tone: 'watch' }
]

const trendSeries = [
  { key: 'riskSkuCount', label: '风险 SKU', color: '#67e8f9' },
  { key: 'warningSkuCount', label: '预警 SKU', color: '#facc15' },
  { key: 'criticalSkuCount', label: '严重 SKU', color: '#ef4444' }
]

function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function getTrendPoints(key) {
  const width = 300
  const height = 150
  const padding = 14
  const values = sevenDayTrend.map((row) => row[key])
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const xRange = values.length > 1 ? values.length - 1 : 1

  return values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / xRange
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}
</script>

<template>
  <main class="dashboard-screen">
    <header class="dashboard-header">
      <div>
        <p class="dashboard-eyebrow">Warehouse Inventory Monitor</p>
        <h1>多仓库存缺货风险监控大屏</h1>
        <p class="dashboard-subtitle">Multi-Warehouse Inventory Stockout Risk Monitor</p>
      </div>
      <div class="refresh-meta">
        <span>最后更新：{{ inventorySummary.lastUpdatedAt }}</span>
        <span>刷新频率：{{ inventorySummary.refreshFrequency }}</span>
      </div>
    </header>

    <section class="kpi-grid" aria-label="库存风险核心指标">
      <article v-for="kpi in kpis" :key="kpi.label" class="kpi-card" :class="`kpi-card--${kpi.tone}`" data-test="kpi-card">
        <span>{{ kpi.label }}</span>
        <strong>{{ kpi.value }}</strong>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel sku-panel">
        <div class="panel-heading">
          <h2>SKU 缺货风险清单</h2>
          <span>仅展示可售天数 ≤ 7 天</span>
        </div>

        <div class="risk-table">
          <div class="risk-table__head">
            <span>SKU 编码</span><span>商品名称</span><span>品类</span><span>风险仓库</span><span>库存</span><span>日销</span><span>可售天数</span><span>风险等级</span><span>建议补货量</span>
          </div>

          <div v-for="sku in riskSkus" :key="`${sku.skuCode}-${sku.warehouseName}`" class="risk-table__row" :class="`risk-table__row--${sku.riskLevel}`">
            <span>{{ sku.skuCode }}</span>
            <span>{{ sku.productName }}</span>
            <span>{{ sku.category }}</span>
            <span>{{ sku.warehouseName }}</span>
            <span>{{ sku.currentInventory }}</span>
            <span>{{ sku.averageDailySales }}</span>
            <span>{{ sku.sellableDays }}</span>
            <span class="risk-badge" :class="`risk-badge--${sku.riskLevel}`">{{ riskLevelLabels[sku.riskLevel] }}</span>
            <span>{{ sku.suggestedReplenishmentQty }}</span>
          </div>
        </div>
      </article>

      <div class="stacked-panels">
        <article class="panel">
          <div class="panel-heading">
            <h2>多仓库风险对比</h2>
            <span>按缺货风险 SKU 数排序</span>
          </div>

          <div class="warehouse-list">
            <div v-for="warehouse in warehouseRisks" :key="warehouse.warehouseName" class="warehouse-row">
              <div class="warehouse-row__meta">
                <span>{{ warehouse.warehouseName }}</span>
                <strong>{{ warehouse.riskSkuCount }}</strong>
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: `${warehouse.barPercent}%` }"></div>
              </div>
              <small>严重 {{ warehouse.criticalSkuCount }} 个</small>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-heading">
            <h2>风险等级分布</h2>
            <span>当前风险 SKU</span>
          </div>

          <div class="distribution-bars">
            <div v-for="item in riskDistribution" :key="item.label" class="distribution-bar" :class="`distribution-bar--${item.tone}`">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </article>
      </div>

      <div class="stacked-panels">
        <article class="panel">
          <div class="panel-heading">
            <h2>近 7 天缺货风险趋势</h2>
            <span>风险走势</span>
          </div>

          <svg class="trend-chart" viewBox="0 0 300 150" role="img" aria-label="近 7 天缺货风险趋势">
            <polyline v-for="series in trendSeries" :key="series.key" :points="getTrendPoints(series.key)" :stroke="series.color" />
          </svg>

          <div class="trend-legend">
            <span v-for="series in trendSeries" :key="series.key">
              <i :style="{ background: series.color }"></i>{{ series.label }}
            </span>
          </div>
        </article>

        <article class="panel">
          <div class="panel-heading">
            <h2>补货建议概览</h2>
            <span>经营行动信号</span>
          </div>

          <div class="replenishment-list">
            <p><strong>高优先级</strong>{{ replenishmentSummary.highPriorityCount }} 个 SKU 建议 24 小时内补货</p>
            <p><strong>中优先级</strong>{{ replenishmentSummary.mediumPriorityCount }} 个 SKU 建议 3 天内补货</p>
            <p><strong>调拨建议</strong>{{ replenishmentSummary.transferSuggestion }}</p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
