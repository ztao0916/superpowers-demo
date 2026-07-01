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
