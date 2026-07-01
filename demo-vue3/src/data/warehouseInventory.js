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
  { skuCode: 'SKU-A102', productName: '无线扫码枪', category: '设备', warehouseName: '华东仓', currentInventory: 42, averageDailySales: 31, sellableDays: 1.4, suggestedReplenishmentQty: 268 },
  { skuCode: 'SKU-D219', productName: '智能货架灯', category: '设备', warehouseName: '华北仓', currentInventory: 16, averageDailySales: 12, sellableDays: 1.3, suggestedReplenishmentQty: 104 },
  { skuCode: 'SKU-M884', productName: '周转箱 40L', category: '耗材', warehouseName: '华南仓', currentInventory: 128, averageDailySales: 44, sellableDays: 2.9, suggestedReplenishmentQty: 312 },
  { skuCode: 'SKU-T508', productName: '手持终端电池', category: '配件', warehouseName: '华中仓', currentInventory: 88, averageDailySales: 26, sellableDays: 3.4, suggestedReplenishmentQty: 172 },
  { skuCode: 'SKU-P310', productName: '封箱胶带', category: '包材', warehouseName: '西南仓', currentInventory: 620, averageDailySales: 96, sellableDays: 6.5, suggestedReplenishmentQty: 340 },
  { skuCode: 'SKU-C776', productName: '防静电手套', category: '劳保', warehouseName: '华东仓', currentInventory: 510, averageDailySales: 82, sellableDays: 6.2, suggestedReplenishmentQty: 310 },
  { skuCode: 'SKU-H901', productName: '货架标签纸', category: '耗材', warehouseName: '西北仓', currentInventory: 980, averageDailySales: 90, sellableDays: 10.9, suggestedReplenishmentQty: 0 }
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
    .map((row) => ({ ...row, riskLevel: getRiskLevel(row.sellableDays) }))
    .filter((row) => row.riskLevel !== 'healthy')
    .sort((a, b) => {
      if (riskRank[a.riskLevel] !== riskRank[b.riskLevel]) return riskRank[a.riskLevel] - riskRank[b.riskLevel]
      if (a.sellableDays !== b.sellableDays) return a.sellableDays - b.sellableDays
      return b.averageDailySales - a.averageDailySales
    })
}

export function getWarehouseRisks(rows = rawWarehouseRisks) {
  const maxRiskCount = Math.max(...rows.map((row) => row.riskSkuCount))

  return [...rows]
    .sort((a, b) => b.riskSkuCount - a.riskSkuCount)
    .map((row) => ({
      ...row,
      barPercent: maxRiskCount === 0 ? 0 : Math.round((row.riskSkuCount / maxRiskCount) * 100)
    }))
}

export const riskSkus = getRiskSkus()
export const warehouseRisks = getWarehouseRisks()
