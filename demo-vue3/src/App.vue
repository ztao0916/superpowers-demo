<script setup>
import { ref } from 'vue'
import CartQuantity from './components/CartQuantity.vue'

const quantity = ref(0)
const stock = 5
</script>

<template>
  <main class="page-shell">
    <section class="cart-panel">
      <p class="eyebrow">Workshop demo</p>
      <h1>Cart Quantity Control</h1>
      <p class="lede">
        This tiny Vue 3 app contains one intentional boundary bug for a Codex debugging demo.
      </p>

      <CartQuantity v-model:quantity="quantity" :stock="stock" />

      <p class="summary">Selected quantity: {{ quantity }} / {{ stock }}</p>
    </section>
  </main>
</template>
