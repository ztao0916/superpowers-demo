import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CartQuantity from './CartQuantity.vue'

describe('CartQuantity', () => {
  it('does not decrease below zero', async () => {
    const wrapper = mount(CartQuantity, {
      props: {
        quantity: 0,
        stock: 3
      }
    })

    await wrapper.get('button[aria-label="Decrease quantity"]').trigger('click')

    expect(wrapper.emitted('update:quantity')).toBeUndefined()
  })

  it('allows increasing from zero when stock is available', async () => {
    const wrapper = mount(CartQuantity, {
      props: {
        quantity: 0,
        stock: 3
      }
    })

    const increase = wrapper.get('button[aria-label="Increase quantity"]')

    expect(increase.attributes('disabled')).toBeUndefined()

    await increase.trigger('click')

    expect(wrapper.emitted('update:quantity')).toEqual([[1]])
  })

  it('treats negative quantity as zero', async () => {
    const wrapper = mount(CartQuantity, {
      props: {
        quantity: -1,
        stock: 3
      }
    })

    expect(wrapper.get('[aria-label="Current quantity"]').text()).toBe('0')
    expect(wrapper.get('button[aria-label="Decrease quantity"]').attributes('disabled')).toBe('')

    const increase = wrapper.get('button[aria-label="Increase quantity"]')

    expect(increase.attributes('disabled')).toBeUndefined()

    await increase.trigger('click')

    expect(wrapper.emitted('update:quantity')).toEqual([[1]])
  })

  it('does not increase beyond available stock', async () => {
    const wrapper = mount(CartQuantity, {
      props: {
        quantity: 3,
        stock: 3
      }
    })

    await wrapper.get('button[aria-label="Increase quantity"]').trigger('click')

    expect(wrapper.emitted('update:quantity')).toBeUndefined()
  })
})
