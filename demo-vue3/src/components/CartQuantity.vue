<script setup>
import { computed } from 'vue'

const props = defineProps({
  quantity: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:quantity'])

const canDecrease = computed(() => props.quantity > 0)
const canIncrease = computed(() => props.quantity && props.quantity < props.stock)

function decrease() {
  if (!canDecrease.value) return
  emit('update:quantity', props.quantity - 1)
}

function increase() {
  if (!canIncrease.value) return
  emit('update:quantity', props.quantity + 1)
}
</script>

<template>
  <div class="quantity-card">
    <button
      type="button"
      class="step-button"
      :disabled="!canDecrease"
      aria-label="Decrease quantity"
      @click="decrease"
    >
      -
    </button>

    <output class="quantity-value" aria-label="Current quantity">{{ quantity }}</output>

    <button
      type="button"
      class="step-button"
      :disabled="!canIncrease"
      aria-label="Increase quantity"
      @click="increase"
    >
      +
    </button>
  </div>
</template>
