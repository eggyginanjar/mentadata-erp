<!-- file: frontend/src/pages/pos/CartContent.vue -->
<template>
  <div class="d-flex flex-column h-100">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6 font-weight-bold text-blue-grey-darken-4">Pesanan Saat Ini</h3>
      <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="$emit('clear')"></v-btn>
    </div>
    
    <v-divider class="mb-4"></v-divider>

    <!-- Area Item Keranjang -->
    <div class="flex-grow-1 overflow-y-auto" style="min-height: 200px;">
      <div v-if="cart.length === 0" class="h-100 d-flex justify-center align-center">
        <div class="text-center text-blue-grey-lighten-2">
          <v-icon size="48" class="mb-2">mdi-cart-outline</v-icon>
          <p class="font-weight-medium">Keranjang masih kosong</p>
        </div>
      </div>

      <v-list v-else lines="two" class="bg-transparent">
        <v-list-item v-for="(item, index) in cart" :key="index" class="px-0">
          <v-list-item-title class="font-weight-bold text-body-2 text-blue-grey-darken-4">{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle class="text-teal-darken-3 font-weight-medium">{{ formatRupiah(item.price) }} x {{ item.qty }}</v-list-item-subtitle>
          
          <template v-slot:append>
            <div class="d-flex align-center">
              <span class="font-weight-bold mr-2 text-blue-grey-darken-4">{{ formatRupiah(item.price * item.qty) }}</span>
              <v-btn icon="mdi-minus-circle" variant="text" color="error" size="small" @click="$emit('remove', index)"></v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <v-divider class="mt-4 mb-4"></v-divider>

    <!-- Area Total & Pembayaran -->
    <div class="d-flex justify-space-between align-center mb-6">
      <span class="text-body-1 font-weight-bold text-blue-grey-darken-3">Total Tagihan:</span>
      <span class="text-h5 font-weight-black text-teal-darken-3">{{ formatRupiah(totalAmount) }}</span>
    </div>

    <v-btn 
      block 
      color="teal-darken-3" 
      size="x-large" 
      rounded="xl" 
      class="text-none font-weight-bold flex-grow-0 flex-shrink-0" 
      elevation="2"
      prepend-icon="mdi-cash"
      :disabled="cart.length === 0"
      @click="$emit('checkout')"
    >
      Proses Pembayaran
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  cart: Array,
  totalAmount: Number
})
defineEmits(['remove', 'clear', 'checkout'])

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number)
}
</script>