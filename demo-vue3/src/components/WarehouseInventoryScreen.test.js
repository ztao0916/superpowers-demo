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
  it('renders three trend lines with seven point pairs each', () => {
    const wrapper = mount(WarehouseInventoryScreen)
    const lines = wrapper.findAll('.trend-chart polyline')

    expect(lines).toHaveLength(3)

    lines.forEach((line) => {
      const pointPairs = line.attributes('points').split(' ')

      expect(pointPairs).toHaveLength(7)
      pointPairs.forEach((pointPair) => {
        expect(pointPair).toMatch(/^\d+(?:\.\d+)?,\d+(?:\.\d+)?$/)
      })
    })
  })
})
