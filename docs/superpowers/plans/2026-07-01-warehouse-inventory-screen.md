# Warehouse Inventory Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 1920x1080 dark warehouse inventory stockout risk dashboard in the existing Vue 3 demo app using mock data.

**Architecture:** Add a focused dashboard feature beside the existing cart demo instead of expanding the cart component. Keep mock inventory data and pure derivation helpers in one module, render the dashboard in one Vue component, and keep global CSS responsible for page-level visual styling.

**Tech Stack:** Vue 3 single-file components, Vite, Vitest, Vue Test Utils, jsdom, plain CSS, inline SVG for simple charts.

---

## File Structure

- Create: `demo-vue3/src/data/warehouseInventory.js`
  - Owns mock inventory data, risk level constants, and pure derivation helpers.
  - Exports summary, risk SKU rows, warehouse comparison rows, seven-day trend rows, and replenishment summary data.

- Create: `demo-vue3/src/data/warehouseInventory.test.js`
  - Tests risk level boundaries, SKU filtering/sorting, and warehouse comparison sorting.
  - These tests do not depend on DOM rendering.

- Create: `demo-vue3/src/components/WarehouseInventoryScreen.vue`
  - Renders the complete 1920x1080 dashboard using data from `warehouseInventory.js`.
  - Contains markup only plus lightweight formatting helpers.
  - Uses inline SVG for the seven-day trend chart to avoid adding chart dependencies.

- Create: `demo-vue3/src/components/WarehouseInventoryScreen.test.js`
  - Verifies the dashboard renders the agreed title, five KPI cards, SKU table fields, risk labels, warehouse ranking, trend panel, and refresh label.

- Modify: `demo-vue3/src/App.vue`
  - Replaces the current cart demo landing content with the warehouse inventory dashboard.
  - The existing cart component and test stay in the repo because they are part of the original superpowers demo material.

- Modify: `demo-vue3/src/styles.css`
  - Replaces the current cart demo page styles with dashboard styles.
  - Defines the 1920x1080 screen shell, dark tech palette, KPI cards, panels, table, bars, badges, and SVG chart styling.

## Important Existing-Repo Note

The repo currently contains an intentional failing cart quantity test in `demo-vue3/src/components/CartQuantity.test.js`. That failure is unrelated to this warehouse dashboard requirement. During this plan, validate new behavior with targeted test commands for the new files first. A full `npm test` will still include the intentional cart bug until that separate demo bug is fixed.

### Task 1: Mock Data And Pure Inventory Rules

**Files:**
- Create: `demo-vue3/src/data/warehouseInventory.js`
- Create: `demo-vue3/src/data/warehouseInventory.test.js`

- [ ] **Step 1: Write the data helper tests**

Create `demo-vue3/src/data/warehouseInventory.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  getRiskLevel,
  getRiskSkus,
  getWarehouseRisks,
  inventorySummary,
  riskSkus,
  warehouseRisks
} from './warehouseInventory'

describe('warehouse inventory data rules', () => {
  it('classifies risk levels by sellable days', () => {
    expect(getRiskLevel(1.9)).toBe('critical')
    expect(getRiskLevel(2)).toBe('warning')
    expect(getRiskLevel(4.9)).toBe('warning')
    expect(getRiskLevel(5)).toBe('watch')
    expect(getRiskLevel(7)).toBe('watch')
    expect(getRiskLevel(7.1)).toBe('healthy')
  })

  it('keeps only risk SKUs and sorts by severity, sellable days, and sales velocity', () => {
    const rows = getRiskSkus([
      {
        skuCode: 'SKU-WATCH',
        productName: '关注商品',
        category: '耗材',
        warehouseName: '华北仓',
        currentInventory: 700,
        averageDailySales: 100,
        sellableDays: 7,
        suggestedReplenishmentQty: 0
      },
      {
        skuCode: 'SKU-HEALTHY',
        productName: '健康商品',
        category: '耗材',
        warehouseName: '华北仓',
        currentInventory: 900,
        averageDailySales: 100,
        sellableDays: 9,
        suggestedReplenishmentQty: 0
      },
      {
        skuCode: 'SKU-CRITICAL-SLOW',
        productName: '严重慢销商品',
        category: '设备',
        warehouseName: '华东仓',
        currentInventory: 20,
        averageDailySales: 10,
        sellableDays: 1.5,
        suggestedReplenishmentQty: 80
      },
      {
        skuCode: 'SKU-CRITICAL-FAST',
        productName: '严重快销商品',
        category: '设备',
        warehouseName: '华东仓',
        currentInventory: 30,
        averageDailySales: 30,
        sellableDays: 1.5,
        suggestedReplenishmentQty: 210
      }
    ])

    expect(rows.map((row) => row.skuCode)).toEqual([
      'SKU-CRITICAL-FAST',
      'SKU-CRITICAL-SLOW',
      'SKU-WATCH'
    ])
    expect(rows.map((row) => row.riskLevel)).toEqual(['critical', 'critical', 'watch'])
  })

  it('sorts warehouses by stockout risk SKU count', () => {
    const rows = getWarehouseRisks([
      { warehouseName: '华北仓', riskSkuCount: 14, criticalSkuCount: 2 },
      { warehouseName: '华东仓', riskSkuCount: 38, criticalSkuCount: 8 },
      { warehouseName: '华南仓', riskSkuCount: 27, criticalSkuCount: 5 }
    ])

    expect(rows.map((row) => row.warehouseName)).toEqual(['华东仓', '华南仓', '华北仓'])
    expect(rows[0].barPercent).toBe(100)
    expect(rows[2].barPercent).toBe(37)
  })

  it('exports complete mock data for the dashboard', () => {
    expect(inventorySummary.riskSkuCount).toBe(128)
    expect(riskSkus.length).toBeGreaterThanOrEqual(6)
    expect(warehouseRisks.length).toBeGreaterThanOrEqual(4)
  })
})
```

- [ ] **Step 2: Run the new failing tests**

Run:

```bash
cd demo-vue3
npm test -- src/data/warehouseInventory.test.js
```

Expected: FAIL because `src/data/warehouseInventory.js` does not exist yet.

- [ ] **Step 3: Create mock data and derivation helpers**

Create `demo-vue3/src/data/warehouseInventory.js`:

```js
const riskRank = {
  critical: 0,
  warning: 1,
  watch: 2,
  healthy: 3
}

export const riskLevelLabels = {
  critical: '严重',
  warning: '预警',
  watch: '关注',
  healthy: '健康'
}

export const inventorySummary = {
  totalUnits: 1284920,
  riskSkuCount: 128,
  criticalSkuCount: 18,
  averageSellableDays: 7.6,
  affectedWarehouseCount: 12,
  lastUpdatedAt: '2026-07-01 11:35',
  refreshFrequency: '1-5 分钟'
}

const rawRiskSkus = [
  {
    skuCode: 'SKU-A102',
    productName: '无线扫码枪',
    category: '设备',
    warehouseName: '华东仓',
    currentInventory: 42,
    averageDailySales: 31,
    sellableDays: 1.4,
    suggestedReplenishmentQty: 268
  },
  {
    skuCode: 'SKU-D219',
    productName: '智能货架灯',
    category: '设备',
    warehouseName: '华北仓',
    currentInventory: 16,
    averageDailySales: 12,
    sellableDays: 1.3,
    suggestedReplenishmentQty: 104
  },
  {
    skuCode: 'SKU-M884',
    productName: '周转箱 40L',
    category: '耗材',
    warehouseName: '华南仓',
    currentInventory: 128,
    averageDailySales: 44,
    sellableDays: 2.9,
    suggestedReplenishmentQty: 312
  },
  {
    skuCode: 'SKU-T508',
    productName: '手持终端电池',
    category: '配件',
    warehouseName: '华中仓',
    currentInventory: 88,
    averageDailySales: 26,
    sellableDays: 3.4,
    suggestedReplenishmentQty: 172
  },
  {
    skuCode: 'SKU-P310',
    productName: '封箱胶带',
    category: '包材',
    warehouseName: '西南仓',
    currentInventory: 620,
    averageDailySales: 96,
    sellableDays: 6.5,
    suggestedReplenishmentQty: 340
  },
  {
    skuCode: 'SKU-C776',
    productName: '防静电手套',
    category: '劳保',
    warehouseName: '华东仓',
    currentInventory: 510,
    averageDailySales: 82,
    sellableDays: 6.2,
    suggestedReplenishmentQty: 310
  },
  {
    skuCode: 'SKU-H901',
    productName: '货架标签纸',
    category: '耗材',
    warehouseName: '西北仓',
    currentInventory: 980,
    averageDailySales: 90,
    sellableDays: 10.9,
    suggestedReplenishmentQty: 0
  }
]

const rawWarehouseRisks = [
  { warehouseName: '华东仓', riskSkuCount: 38, criticalSkuCount: 8 },
  { warehouseName: '华南仓', riskSkuCount: 27, criticalSkuCount: 5 },
  { warehouseName: '华北仓', riskSkuCount: 21, criticalSkuCount: 4 },
  { warehouseName: '西南仓', riskSkuCount: 14, criticalSkuCount: 1 },
  { warehouseName: '华中仓', riskSkuCount: 12, criticalSkuCount: 0 }
]

export const sevenDayTrend = [
  { date: '06-25', riskSkuCount: 92, warningSkuCount: 64, criticalSkuCount: 11 },
  { date: '06-26', riskSkuCount: 98, warningSkuCount: 68, criticalSkuCount: 12 },
  { date: '06-27', riskSkuCount: 96, warningSkuCount: 66, criticalSkuCount: 13 },
  { date: '06-28', riskSkuCount: 111, warningSkuCount: 74, criticalSkuCount: 15 },
  { date: '06-29', riskSkuCount: 116, warningSkuCount: 78, criticalSkuCount: 16 },
  { date: '06-30', riskSkuCount: 121, warningSkuCount: 82, criticalSkuCount: 17 },
  { date: '07-01', riskSkuCount: 128, warningSkuCount: 86, criticalSkuCount: 18 }
]

export const replenishmentSummary = {
  highPriorityCount: 18,
  mediumPriorityCount: 46,
  transferSuggestion: '华北仓可调拨 8 个 SKU 至华东仓'
}

export function getRiskLevel(sellableDays) {
  if (sellableDays < 2) return 'critical'
  if (sellableDays < 5) return 'warning'
  if (sellableDays <= 7) return 'watch'
  return 'healthy'
}

export function getRiskSkus(rows = rawRiskSkus) {
  return rows
    .map((row) => ({
      ...row,
      riskLevel: getRiskLevel(row.sellableDays)
    }))
    .filter((row) => row.riskLevel !== 'healthy')
    .sort((a, b) => {
      if (riskRank[a.riskLevel] !== riskRank[b.riskLevel]) {
        return riskRank[a.riskLevel] - riskRank[b.riskLevel]
      }

      if (a.sellableDays !== b.sellableDays) {
        return a.sellableDays - b.sellableDays
      }

      return b.averageDailySales - a.averageDailySales
    })
}

export function getWarehouseRisks(rows = rawWarehouseRisks) {
  const maxRiskCount = Math.max(...rows.map((row) => row.riskSkuCount))

  return [...rows]
    .sort((a, b) => b.riskSkuCount - a.riskSkuCount)
    .map((row) => ({
      ...row,
      barPercent: Math.round((row.riskSkuCount / maxRiskCount) * 100)
    }))
}

export const riskSkus = getRiskSkus()
export const warehouseRisks = getWarehouseRisks()
```

- [ ] **Step 4: Run the data tests**

Run:

```bash
cd demo-vue3
npm test -- src/data/warehouseInventory.test.js
```

Expected: PASS for `warehouseInventory.test.js`.

- [ ] **Step 5: Commit Task 1**

```bash
git add demo-vue3/src/data/warehouseInventory.js demo-vue3/src/data/warehouseInventory.test.js
git commit -m "feat: add warehouse inventory mock data"
```

### Task 2: Dashboard Component Rendering Tests

**Files:**
- Create: `demo-vue3/src/components/WarehouseInventoryScreen.test.js`
- Create later in Task 3: `demo-vue3/src/components/WarehouseInventoryScreen.vue`

- [ ] **Step 1: Write the failing component tests**

Create `demo-vue3/src/components/WarehouseInventoryScreen.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WarehouseInventoryScreen from './WarehouseInventoryScreen.vue'

describe('WarehouseInventoryScreen', () => {
  it('renders the dashboard header and refresh metadata', () => {
    const wrapper = mount(WarehouseInventoryScreen)

    expect(wrapper.text()).toContain('多仓库存缺货风险监控大屏')
    expect(wrapper.text()).toContain('Multi-Warehouse Inventory Stockout Risk Monitor')
    expect(wrapper.text()).toContain('最后更新：2026-07-01 11:35')
    expect(wrapper.text()).toContain('刷新频率：1-5 分钟')
  })

  it('renders the five agreed KPI cards', () => {
    const wrapper = mount(WarehouseInventoryScreen)
    const cards = wrapper.findAll('[data-test="kpi-card"]')

    expect(cards).toHaveLength(5)
    expect(wrapper.text()).toContain('库存总件数')
    expect(wrapper.text()).toContain('缺货风险 SKU 数')
    expect(wrapper.text()).toContain('严重缺货 SKU 数')
    expect(wrapper.text()).toContain('平均可售天数')
    expect(wrapper.text()).toContain('受影响仓库数')
  })

  it('renders the SKU risk table with the agreed fields and labels', () => {
    const wrapper = mount(WarehouseInventoryScreen)

    expect(wrapper.text()).toContain('SKU 缺货风险清单')
    expect(wrapper.text()).toContain('SKU 编码')
    expect(wrapper.text()).toContain('商品名称')
    expect(wrapper.text()).toContain('风险仓库')
    expect(wrapper.text()).toContain('建议补货量')
    expect(wrapper.text()).toContain('SKU-A102')
    expect(wrapper.text()).toContain('无线扫码枪')
    expect(wrapper.text()).toContain('严重')
  })

  it('renders warehouse comparison, risk distribution, trend, and replenishment panels', () => {
    const wrapper = mount(WarehouseInventoryScreen)

    expect(wrapper.text()).toContain('多仓库风险对比')
    expect(wrapper.text()).toContain('按缺货风险 SKU 数排序')
    expect(wrapper.text()).toContain('风险等级分布')
    expect(wrapper.text()).toContain('近 7 天缺货风险趋势')
    expect(wrapper.text()).toContain('补货建议概览')
    expect(wrapper.text()).toContain('华东仓')
    expect(wrapper.text()).toContain('华北仓可调拨 8 个 SKU 至华东仓')
  })
})
```

- [ ] **Step 2: Run the component tests to verify they fail**

Run:

```bash
cd demo-vue3
npm test -- src/components/WarehouseInventoryScreen.test.js
```

Expected: FAIL because `WarehouseInventoryScreen.vue` does not exist yet.

- [ ] **Step 3: Commit the failing tests**

```bash
git add demo-vue3/src/components/WarehouseInventoryScreen.test.js
git commit -m "test: define warehouse inventory screen rendering"
```

### Task 3: Dashboard Component And Styles

**Files:**
- Create: `demo-vue3/src/components/WarehouseInventoryScreen.vue`
- Modify: `demo-vue3/src/styles.css`

- [ ] **Step 1: Implement the dashboard component**

Create `demo-vue3/src/components/WarehouseInventoryScreen.vue`:

```vue
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
  {
    label: '库存总件数',
    value: formatNumber(inventorySummary.totalUnits),
    tone: 'info'
  },
  {
    label: '缺货风险 SKU 数',
    value: inventorySummary.riskSkuCount,
    tone: 'danger'
  },
  {
    label: '严重缺货 SKU 数',
    value: inventorySummary.criticalSkuCount,
    tone: 'warning'
  },
  {
    label: '平均可售天数',
    value: inventorySummary.averageSellableDays,
    tone: 'watch'
  },
  {
    label: '受影响仓库数',
    value: inventorySummary.affectedWarehouseCount,
    tone: 'blue'
  }
]

const riskDistribution = [
  {
    label: '严重',
    value: riskSkus.filter((row) => row.riskLevel === 'critical').length,
    tone: 'critical'
  },
  {
    label: '预警',
    value: riskSkus.filter((row) => row.riskLevel === 'warning').length,
    tone: 'warning'
  },
  {
    label: '关注',
    value: riskSkus.filter((row) => row.riskLevel === 'watch').length,
    tone: 'watch'
  }
]

const trendSeries = [
  {
    key: 'riskSkuCount',
    label: '风险 SKU',
    color: '#67e8f9'
  },
  {
    key: 'warningSkuCount',
    label: '预警 SKU',
    color: '#facc15'
  },
  {
    key: 'criticalSkuCount',
    label: '严重 SKU',
    color: '#ef4444'
  }
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

  return values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / (values.length - 1)
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
      <article
        v-for="kpi in kpis"
        :key="kpi.label"
        class="kpi-card"
        :class="`kpi-card--${kpi.tone}`"
        data-test="kpi-card"
      >
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
            <span>SKU 编码</span>
            <span>商品名称</span>
            <span>品类</span>
            <span>风险仓库</span>
            <span>库存</span>
            <span>日销</span>
            <span>可售天数</span>
            <span>风险等级</span>
            <span>建议补货量</span>
          </div>

          <div
            v-for="sku in riskSkus"
            :key="`${sku.skuCode}-${sku.warehouseName}`"
            class="risk-table__row"
            :class="`risk-table__row--${sku.riskLevel}`"
          >
            <span>{{ sku.skuCode }}</span>
            <span>{{ sku.productName }}</span>
            <span>{{ sku.category }}</span>
            <span>{{ sku.warehouseName }}</span>
            <span>{{ sku.currentInventory }}</span>
            <span>{{ sku.averageDailySales }}</span>
            <span>{{ sku.sellableDays }}</span>
            <span class="risk-badge" :class="`risk-badge--${sku.riskLevel}`">
              {{ riskLevelLabels[sku.riskLevel] }}
            </span>
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
            <div
              v-for="item in riskDistribution"
              :key="item.label"
              class="distribution-bar"
              :class="`distribution-bar--${item.tone}`"
            >
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
            <polyline
              v-for="series in trendSeries"
              :key="series.key"
              :points="getTrendPoints(series.key)"
              :stroke="series.color"
            />
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
```

- [ ] **Step 2: Replace page styles with dashboard styles**

Replace `demo-vue3/src/styles.css` with:

```css
:root {
  color: #dbeafe;
  background: #04101f;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 1280px;
  background: #04101f;
}

button {
  font: inherit;
}

.dashboard-screen {
  width: 100vw;
  min-height: 100vh;
  padding: 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 12%, rgba(56, 189, 248, 0.18), transparent 28%),
    radial-gradient(circle at 82% 20%, rgba(30, 64, 175, 0.26), transparent 24%),
    linear-gradient(135deg, #06101f 0%, #081525 52%, #030712 100%);
}

.dashboard-header {
  height: 104px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.dashboard-eyebrow {
  margin: 0 0 6px;
  color: #67e8f9;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  color: #ffffff;
  font-size: 2.25rem;
  line-height: 1.1;
}

h2 {
  color: #ffffff;
  font-size: 1rem;
}

.dashboard-subtitle {
  margin-top: 8px;
  color: #93c5fd;
}

.refresh-meta {
  display: grid;
  gap: 6px;
  color: #bfdbfe;
  font-size: 0.85rem;
  text-align: right;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  height: 116px;
}

.kpi-card,
.panel {
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 8px;
  background: rgba(8, 24, 45, 0.86);
  box-shadow: inset 0 0 32px rgba(14, 165, 233, 0.08), 0 18px 44px rgba(0, 0, 0, 0.22);
}

.kpi-card {
  display: grid;
  align-content: center;
  gap: 8px;
  padding: 18px;
}

.kpi-card span {
  color: #93c5fd;
  font-size: 0.86rem;
}

.kpi-card strong {
  font-size: 2rem;
  line-height: 1;
}

.kpi-card--info strong,
.kpi-card--blue strong {
  color: #67e8f9;
}

.kpi-card--danger strong {
  color: #f87171;
}

.kpi-card--warning strong {
  color: #fb923c;
}

.kpi-card--watch strong {
  color: #facc15;
}

.dashboard-grid {
  height: calc(100vh - 168px);
  min-height: 620px;
  display: grid;
  grid-template-columns: minmax(620px, 1.35fr) minmax(360px, 0.85fr) minmax(380px, 0.9fr);
  gap: 14px;
  margin-top: 14px;
}

.panel {
  min-height: 0;
  padding: 16px;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-heading span {
  color: #94a3b8;
  font-size: 0.78rem;
}

.sku-panel {
  overflow: hidden;
}

.risk-table {
  display: grid;
  gap: 8px;
  font-size: 0.78rem;
}

.risk-table__head,
.risk-table__row {
  display: grid;
  grid-template-columns: 0.9fr 1.15fr 0.68fr 0.8fr 0.58fr 0.58fr 0.7fr 0.7fr 0.88fr;
  gap: 8px;
  align-items: center;
}

.risk-table__head {
  color: #93c5fd;
  border-bottom: 1px solid rgba(56, 189, 248, 0.22);
  padding-bottom: 8px;
  font-weight: 800;
}

.risk-table__row {
  min-height: 48px;
  padding: 8px;
  border-left: 3px solid #38bdf8;
  background: rgba(15, 35, 62, 0.9);
  color: #dbeafe;
}

.risk-table__row--critical {
  border-left-color: #ef4444;
}

.risk-table__row--warning {
  border-left-color: #f97316;
}

.risk-table__row--watch {
  border-left-color: #facc15;
}

.risk-badge {
  display: inline-flex;
  width: 48px;
  min-height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 800;
}

.risk-badge--critical {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.18);
}

.risk-badge--warning {
  color: #fed7aa;
  background: rgba(249, 115, 22, 0.18);
}

.risk-badge--watch {
  color: #fef08a;
  background: rgba(250, 204, 21, 0.16);
}

.stacked-panels {
  min-height: 0;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 14px;
}

.warehouse-list {
  display: grid;
  gap: 12px;
}

.warehouse-row__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #dbeafe;
  font-size: 0.88rem;
}

.warehouse-row__meta strong {
  color: #f87171;
}

.bar-track {
  height: 9px;
  margin: 7px 0 4px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(30, 64, 175, 0.36);
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #ef4444);
}

.warehouse-row small {
  color: #94a3b8;
}

.distribution-bars {
  height: 150px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  gap: 18px;
  padding-top: 12px;
}

.distribution-bar {
  min-height: 64px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  border-radius: 8px 8px 4px 4px;
}

.distribution-bar strong {
  color: #ffffff;
  font-size: 1.4rem;
}

.distribution-bar span {
  color: #dbeafe;
  font-size: 0.78rem;
}

.distribution-bar--critical {
  height: 132px;
  background: rgba(239, 68, 68, 0.74);
}

.distribution-bar--warning {
  height: 96px;
  background: rgba(249, 115, 22, 0.74);
}

.distribution-bar--watch {
  height: 76px;
  background: rgba(250, 204, 21, 0.7);
}

.trend-chart {
  width: 100%;
  height: 172px;
}

.trend-chart polyline {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trend-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #bfdbfe;
  font-size: 0.78rem;
}

.trend-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.trend-legend i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.replenishment-list {
  display: grid;
  gap: 12px;
  color: #dbeafe;
  font-size: 0.9rem;
  line-height: 1.5;
}

.replenishment-list p {
  padding: 10px;
  border: 1px solid rgba(56, 189, 248, 0.18);
  border-radius: 8px;
  background: rgba(15, 35, 62, 0.72);
}

.replenishment-list strong {
  display: inline-block;
  min-width: 82px;
  color: #67e8f9;
}
```

- [ ] **Step 3: Run the component tests**

Run:

```bash
cd demo-vue3
npm test -- src/components/WarehouseInventoryScreen.test.js
```

Expected: PASS for `WarehouseInventoryScreen.test.js`.

- [ ] **Step 4: Run the data tests again**

Run:

```bash
cd demo-vue3
npm test -- src/data/warehouseInventory.test.js
```

Expected: PASS for `warehouseInventory.test.js`.

- [ ] **Step 5: Commit Task 3**

```bash
git add demo-vue3/src/components/WarehouseInventoryScreen.vue demo-vue3/src/styles.css
git commit -m "feat: build warehouse inventory dashboard"
```

### Task 4: App Integration And Verification

**Files:**
- Modify: `demo-vue3/src/App.vue`

- [ ] **Step 1: Replace the app entry view**

Replace `demo-vue3/src/App.vue` with:

```vue
<script setup>
import WarehouseInventoryScreen from './components/WarehouseInventoryScreen.vue'
</script>

<template>
  <WarehouseInventoryScreen />
</template>
```

- [ ] **Step 2: Run targeted tests**

Run:

```bash
cd demo-vue3
npm test -- src/data/warehouseInventory.test.js src/components/WarehouseInventoryScreen.test.js
```

Expected: PASS for the new dashboard data and component tests.

- [ ] **Step 3: Run the full test suite and document known unrelated failure**

Run:

```bash
cd demo-vue3
npm test
```

Expected today: the new dashboard tests PASS, but the existing `CartQuantity.test.js` may still FAIL because the repo intentionally contains the cart boundary bug for the superpowers debugging demo. Do not fix that bug as part of this task unless the user explicitly asks.

- [ ] **Step 4: Start the dev server for visual review**

Run:

```bash
cd demo-vue3
npm run dev
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`. Open that URL and visually verify:

- The dashboard title and subtitle are visible.
- The five KPI cards fit on one row.
- The SKU risk table is readable.
- The middle column shows warehouse comparison and risk distribution.
- The right column shows the seven-day trend and replenishment summary.
- The core dashboard fits on a 1920x1080 viewport without requiring vertical scrolling.

- [ ] **Step 5: Commit Task 4**

```bash
git add demo-vue3/src/App.vue
git commit -m "feat: show warehouse dashboard in app"
```

## Plan Self-Review

- Spec coverage:
  - 1920x1080 dark dashboard: Task 3 styles and Task 4 visual review.
  - Mock data: Task 1.
  - Five KPI cards: Task 2 and Task 3.
  - SKU risk table fields and risk rules: Task 1, Task 2, Task 3.
  - Warehouse comparison sorted by risk SKU count: Task 1 and Task 3.
  - Risk distribution: Task 2 and Task 3.
  - Seven-day trend: Task 1 and Task 3.
  - Replenishment summary: Task 1 and Task 3.
  - No real polling or backend dependency: Task 1 and Task 3 keep data local.

- Placeholder scan:
  - No unresolved placeholder markers are intentionally left.
  - The known unrelated `CartQuantity.test.js` failure is explicitly called out so execution does not accidentally expand scope.

- Type consistency:
  - `riskLevel` values are `critical`, `warning`, `watch`, and `healthy` across tests, data helpers, and Vue classes.
  - Data field names match the approved spec and component usage.
