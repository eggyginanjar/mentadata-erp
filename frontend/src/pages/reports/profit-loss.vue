<!-- file: frontend/src/pages/reports/profit-loss.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman & Filter -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Laporan Laba / Rugi</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Analisis performa keuangan, pendapatan, dan beban operasional bisnis Anda.</p>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-md-end align-center gap-2">
        <v-select
          v-model="selectedMonth"
          :items="monthsList"
          item-title="title" item-value="value"
          variant="outlined" density="compact" color="teal-darken-3" hide-details
          prepend-inner-icon="mdi-calendar-month"
          style="max-width: 200px; background-color: white;"
          @update:modelValue="generateReport"
        ></v-select>
        <v-btn color="teal-darken-3" prepend-icon="mdi-refresh" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="generateReport" :loading="isLoading">
          Hitung Ulang
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</v-alert>

    <!-- KARTU RINGKASAN ATAS -->
    <v-row class="mb-4" v-if="!isLoading">
      <v-col cols="12" md="4">
        <v-card class="pa-5 border-sm" rounded="xl" elevation="0" color="white">
          <div class="text-caption text-blue-grey-darken-1 font-weight-bold text-uppercase mb-1">Total Pendapatan (POS)</div>
          <div class="text-h4 font-weight-black text-teal-darken-3">{{ formatRupiah(totalRevenue) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-5 border-sm" rounded="xl" elevation="0" color="white">
          <div class="text-caption text-blue-grey-darken-1 font-weight-bold text-uppercase mb-1">Total Beban & HPP</div>
          <div class="text-h4 font-weight-black text-error">{{ formatRupiah(totalCOGS + totalExpenses) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-5 border-sm" rounded="xl" elevation="0" :color="netProfit >= 0 ? 'teal-darken-4' : 'error'">
          <div class="text-caption text-white font-weight-medium text-uppercase mb-1">Laba Bersih (Net Profit)</div>
          <div class="text-h4 font-weight-black text-white">{{ formatRupiah(netProfit) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- LEMBAR LAPORAN KEUANGAN (GAYA AKUNTANSI) -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white" :loading="isLoading">
      <div class="pa-6 text-center border-b bg-blue-grey-lighten-5">
        <h3 class="text-h6 font-weight-black text-blue-grey-darken-4 text-uppercase">Laporan Laba / Rugi</h3>
        <div class="text-body-2 text-blue-grey-darken-1">Periode: {{ selectedMonthTitle }}</div>
      </div>

      <v-card-text class="pa-0">
        <!-- 1. PENDAPATAN -->
        <div class="pa-4 bg-teal-lighten-5 border-b font-weight-bold text-teal-darken-4">PENDAPATAN USAHA</div>
        <div class="d-flex justify-space-between pa-4 border-b hover-bg">
          <span class="text-blue-grey-darken-3 pl-4">Pendapatan Penjualan (Kasir/POS)</span>
          <span class="font-weight-medium">{{ formatRupiah(totalRevenue) }}</span>
        </div>
        <div class="d-flex justify-space-between pa-4 border-b bg-grey-lighten-4">
          <span class="font-weight-bold text-blue-grey-darken-4">TOTAL PENDAPATAN</span>
          <span class="font-weight-bold text-teal-darken-3">{{ formatRupiah(totalRevenue) }}</span>
        </div>

        <!-- 2. HARGA POKOK PENJUALAN (HPP) -->
        <div class="pa-4 bg-orange-lighten-5 border-b font-weight-bold text-orange-darken-4">HARGA POKOK PENJUALAN (HPP)</div>
        <div class="d-flex justify-space-between pa-4 border-b hover-bg">
          <span class="text-blue-grey-darken-3 pl-4">Beban Pokok Produksi & Bahan Baku Terjual</span>
          <span class="font-weight-medium text-error">( {{ formatRupiah(totalCOGS) }} )</span>
        </div>
        <div class="d-flex justify-space-between pa-4 border-b bg-grey-lighten-4">
          <span class="font-weight-bold text-blue-grey-darken-4">LABA KOTOR (GROSS PROFIT)</span>
          <span class="font-weight-bold text-blue-grey-darken-4">{{ formatRupiah(grossProfit) }}</span>
        </div>

        <!-- 3. BEBAN OPERASIONAL -->
        <div class="pa-4 bg-deep-purple-lighten-5 border-b font-weight-bold text-deep-purple-darken-3">BEBAN OPERASIONAL</div>
        <template v-if="expensesBreakdown.length > 0">
          <div v-for="(exp, index) in expensesBreakdown" :key="index" class="d-flex justify-space-between pa-4 border-b hover-bg">
            <span class="text-blue-grey-darken-3 pl-4">{{ exp.kategori }}</span>
            <span class="font-weight-medium text-error">( {{ formatRupiah(exp.nominal) }} )</span>
          </div>
        </template>
        <template v-else>
          <div class="pa-4 border-b text-center text-grey">Belum ada pengeluaran operasional di bulan ini.</div>
        </template>
        <div class="d-flex justify-space-between pa-4 border-b bg-grey-lighten-4">
          <span class="font-weight-bold text-blue-grey-darken-4">TOTAL BEBAN OPERASIONAL</span>
          <span class="font-weight-bold text-error">( {{ formatRupiah(totalExpenses) }} )</span>
        </div>

        <!-- 4. HASIL AKHIR (LABA BERSIH) -->
        <div class="d-flex justify-space-between pa-6" :class="netProfit >= 0 ? 'bg-teal-lighten-5' : 'bg-red-lighten-5'">
          <span class="text-h6 font-weight-black" :class="netProfit >= 0 ? 'text-teal-darken-4' : 'text-error'">LABA BERSIH (NET PROFIT)</span>
          <span class="text-h5 font-weight-black" :class="netProfit >= 0 ? 'text-teal-darken-4' : 'text-error'">{{ formatRupiah(netProfit) }}</span>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { authState } from '../../store/auth'

const isLoading = ref(false)
const errorMsg = ref('')

// Filter Bulan
const selectedMonth = ref('')
const monthsList = ref([])

// Angka Keuangan
const totalRevenue = ref(0)
const totalCOGS = ref(0)
const totalExpenses = ref(0)
const expensesBreakdown = ref([])

const grossProfit = computed(() => totalRevenue.value - totalCOGS.value)
const netProfit = computed(() => grossProfit.value - totalExpenses.value)
const selectedMonthTitle = computed(() => monthsList.value.find(m => m.value === selectedMonth.value)?.title || '-')

onMounted(() => {
  // Bangun daftar 6 bulan terakhir untuk filter
  const today = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthVal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthTitle = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d)
    monthsList.value.push({ title: monthTitle, value: monthVal })
  }
  selectedMonth.value = monthsList.value[0].value // Set ke bulan ini
  generateReport()
})

const generateReport = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  totalRevenue.value = 0
  totalCOGS.value = 0
  totalExpenses.value = 0
  expensesBreakdown.value = []

  try {
    const tenantId = authState.value.tenantId
    const [year, month] = selectedMonth.value.split('-')
    
    // Tentukan batas awal dan akhir bulan terpilih
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59) // Hari terakhir bulan tsb
    
    // Format string untuk query Buku Kas (karena formatnya YYYY-MM-DD)
    const startStr = `${year}-${month}-01`
    const endStr = `${year}-${month}-${String(endDate.getDate()).padStart(2, '0')}`

    // 1. TARIK DATA MASTER PRODUK (Untuk mendapatkan HPP / Harga Modal terbaru)
    const productsSnap = await getDocs(collection(db, 'tenants', tenantId, 'products'))
    const productHppMap = {}
    productsSnap.forEach(doc => {
      const data = doc.data()
      // Simpan HPP berdasarkan ID produk
      productHppMap[doc.id] = data.harga_modal || 0
    })

    // 2. TARIK DATA POS (PENDAPATAN & MENGHITUNG HPP TRANSAKSI)
    const posQuery = query(
      collection(db, 'tenants', tenantId, 'pos_transactions'),
      where('tanggal_transaksi', '>=', Timestamp.fromDate(startDate)),
      where('tanggal_transaksi', '<=', Timestamp.fromDate(endDate))
    )
    const posSnap = await getDocs(posQuery)
    
    let calcRevenue = 0
    let calcCOGS = 0
    
    posSnap.forEach(doc => {
      const trx = doc.data()
      // Tambahkan ke Total Pendapatan
      calcRevenue += trx.total_tagihan || 0
      
      // Hitung HPP dari barang yang terjual di keranjang (items)
      if (trx.items && Array.isArray(trx.items)) {
        trx.items.forEach(item => {
          const hppSatuan = productHppMap[item.id] || 0
          calcCOGS += (hppSatuan * item.qty)
        })
      }
    })
    
    totalRevenue.value = calcRevenue
    totalCOGS.value = calcCOGS

    // 3. TARIK DATA BUKU KAS (BEBAN OPERASIONAL)
    const cashQuery = query(
      collection(db, 'tenants', tenantId, 'jurnal_umum'),
      where('tanggal', '>=', startStr),
      where('tanggal', '<=', endStr),
      where('tipe', '==', 'KELUAR')
    )
    const cashSnap = await getDocs(cashQuery)
    
    let calcExpenses = 0
    const expMap = {} // Untuk mengelompokkan biaya yang sama
    
    cashSnap.forEach(doc => {
      const kas = doc.data()
      calcExpenses += kas.nominal || 0
      
      // Kelompokkan berdasarkan nama kategori
      if (expMap[kas.nama_kategori]) {
        expMap[kas.nama_kategori] += kas.nominal
      } else {
        expMap[kas.nama_kategori] = kas.nominal
      }
    })
    
    totalExpenses.value = calcExpenses
    expensesBreakdown.value = Object.keys(expMap).map(key => ({
      kategori: key,
      nominal: expMap[key]
    }))

  } catch (error) {
    console.error("Gagal menarik data Laporan Laba Rugi:", error)
    errorMsg.value = 'Gagal memproses kalkulasi laporan keuangan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
</script>

<style scoped>
.hover-bg:hover {
  background-color: #f5f5f5;
}
</style>