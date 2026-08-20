<!-- file: frontend/src/pages/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Dasbor -->
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Dasbor Utama</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Ringkasan performa bisnis dan aktivitas transaksi hari ini.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="teal-darken-3" variant="tonal" rounded="pill" prepend-icon="mdi-refresh" class="font-weight-bold text-none">
          Perbarui Data
        </v-btn>
      </v-col>
    </v-row>

    <!-- Kartu Ringkasan (Summary Cards) -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card class="pa-5 border-sm bg-teal-darken-3" rounded="xl" elevation="2">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-teal-lighten-4 font-weight-bold text-uppercase mb-1">Total Pendapatan</div>
              <div class="text-h4 font-weight-black text-white">{{ formatRupiah(totalRevenue) }}</div>
            </div>
            <v-avatar color="teal-darken-4" size="56" rounded="lg">
              <v-icon size="32" color="teal-lighten-3">mdi-cash-multiple</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="4">
        <v-card class="pa-5 border-sm bg-indigo-darken-3" rounded="xl" elevation="2">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-indigo-lighten-4 font-weight-bold text-uppercase mb-1">Total Transaksi</div>
              <div class="text-h4 font-weight-black text-white">{{ totalTransactions }} <span class="text-h6 font-weight-medium">Struk</span></div>
            </div>
            <v-avatar color="indigo-darken-4" size="56" rounded="lg">
              <v-icon size="32" color="indigo-lighten-3">mdi-receipt-text-check</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="pa-5 border-sm bg-white" rounded="xl" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-blue-grey-lighten-1 font-weight-bold text-uppercase mb-1">Katalog Produk</div>
              <div class="text-h4 font-weight-black text-blue-grey-darken-4">{{ totalProducts }} <span class="text-h6 font-weight-medium">Item</span></div>
            </div>
            <v-avatar color="blue-grey-lighten-5" size="56" rounded="lg">
              <v-icon size="32" color="blue-grey-darken-1">mdi-package-variant-closed</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- GRAFIK PENDAPATAN PER CABANG -->
      <v-col cols="12" md="7">
        <v-card class="border-sm h-100" elevation="0" rounded="xl" color="white">
          <v-card-title class="pa-5 pb-0 d-flex align-center">
            <v-icon start color="teal-darken-3">mdi-chart-bar</v-icon>
            <span class="font-weight-bold text-blue-grey-darken-4">Pendapatan per Cabang</span>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="branchRevenues.length === 0" class="text-center pa-10 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-3">mdi-store-off-outline</v-icon>
              <p>Belum ada data penjualan dari cabang mana pun.</p>
            </div>
            
            <div v-for="(branch, index) in branchRevenues" :key="branch.id" class="mb-5">
              <div class="d-flex justify-space-between align-end mb-1">
                <span class="font-weight-bold text-blue-grey-darken-3">{{ branch.name }}</span>
                <span class="font-weight-black text-teal-darken-3">{{ formatRupiah(branch.revenue) }}</span>
              </div>
              <v-progress-linear 
                :model-value="branch.percentage" 
                color="teal-darken-2" 
                height="12" 
                rounded
                bg-color="blue-grey-lighten-5"
              ></v-progress-linear>
              <div class="text-caption text-blue-grey-lighten-1 mt-1 text-right">
                {{ branch.percentage.toFixed(1) }}% dari total pendapatan
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIWAYAT TRANSAKSI TERAKHIR -->
      <v-col cols="12" md="5">
        <v-card class="border-sm h-100" elevation="0" rounded="xl" color="white">
          <v-card-title class="pa-5 pb-0 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon start color="indigo-darken-3">mdi-history</v-icon>
              <span class="font-weight-bold text-blue-grey-darken-4">5 Transaksi Terakhir</span>
            </div>
            <v-btn variant="text" size="small" color="teal-darken-3" class="font-weight-bold" to="/pos">Ke POS</v-btn>
          </v-card-title>
          
          <v-card-text class="pa-0 mt-3">
            <v-list lines="two" class="bg-transparent">
              <template v-for="(trx, index) in recentTransactions" :key="trx.id">
                <v-list-item class="px-5">
                  <template v-slot:prepend>
                    <v-avatar color="indigo-lighten-5" class="mr-3" size="40">
                      <v-icon color="indigo-darken-2" size="small">mdi-receipt</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-blue-grey-darken-4 text-body-2">
                    {{ trx.nomor_struk || trx.id }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption text-blue-grey-darken-1 mt-1">
                    {{ getBranchName(trx.branch_id) }} • {{ trx.kasir_nama }}
                  </v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <div class="text-right">
                      <div class="font-weight-bold text-teal-darken-3 text-body-2">{{ formatRupiah(trx.total_tagihan) }}</div>
                      <div class="text-caption text-grey">{{ formatWaktuSingkat(trx.tanggal_transaksi) }}</div>
                    </div>
                  </template>
                </v-list-item>
                <v-divider v-if="index < recentTransactions.length - 1" class="mx-5 my-1" color="blue-grey-lighten-4"></v-divider>
              </template>

              <div v-if="recentTransactions.length === 0" class="text-center pa-8 text-blue-grey-lighten-2">
                <p>Belum ada transaksi.</p>
              </div>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { authState } from '../store/auth'

const totalRevenue = ref(0)
const totalTransactions = ref(0)
const totalProducts = ref(0)

const branchesMap = ref({}) // Menyimpan kamus ID Cabang -> Nama Cabang
const branchRevenues = ref([]) // Array untuk merender grafik
const recentTransactions = ref([])

onMounted(() => {
  const tenantId = authState.value.tenantId
  if (!tenantId) return

  // 1. Ambil Kamus Cabang (Untuk menerjemahkan ID menjadi Nama)
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => {
    const tempMap = {}
    snapshot.docs.forEach(doc => {
      tempMap[doc.id] = doc.data().nama_cabang
    })
    branchesMap.value = tempMap
  })

  // 2. Ambil Total Produk
  onSnapshot(collection(db, 'tenants', tenantId, 'products'), (snapshot) => {
    totalProducts.value = snapshot.size
  })

  // 3. Kalkulasi Pendapatan dan Buat Grafik Cabang
  onSnapshot(collection(db, 'tenants', tenantId, 'pos_transactions'), (snapshot) => {
    let tempRevenue = 0
    let tempTrxCount = 0
    const branchTotals = {}

    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const amount = data.total_tagihan || 0
      const bId = data.branch_id || 'HQ' // Jika null, berarti transaksi dari pusat

      tempRevenue += amount
      tempTrxCount++

      // Akumulasi pendapatan ke masing-masing cabang
      if (!branchTotals[bId]) branchTotals[bId] = 0
      branchTotals[bId] += amount
    })

    totalRevenue.value = tempRevenue
    totalTransactions.value = tempTrxCount

    // Ubah format objek menjadi Array agar bisa di-loop di Vue (v-for)
    const chartData = Object.keys(branchTotals).map(key => {
      return {
        id: key,
        name: key === 'HQ' ? 'Kantor Pusat (HQ)' : (branchesMap.value[key] || 'Cabang Tidak Dikenal'),
        revenue: branchTotals[key],
        // Hitung persentase untuk panjang garis progress bar
        percentage: tempRevenue > 0 ? (branchTotals[key] / tempRevenue) * 100 : 0
      }
    })

    // Urutkan dari pendapatan tertinggi ke terendah
    chartData.sort((a, b) => b.revenue - a.revenue)
    branchRevenues.value = chartData
  })

  // 4. Ambil 5 Transaksi Terakhir Secara Khusus
  const qRecent = query(collection(db, 'tenants', tenantId, 'pos_transactions'), orderBy('tanggal_transaksi', 'desc'), limit(5))
  onSnapshot(qRecent, (snapshot) => {
    recentTransactions.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

// Utilitas Penerjemah Nama Cabang
const getBranchName = (branchId) => {
  if (!branchId || branchId === 'HQ') return 'Kantor Pusat (HQ)'
  return branchesMap.value[branchId] || 'Cabang Terhapus'
}

// Utilitas Format Uang & Waktu
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
}
const formatWaktuSingkat = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date)
}
</script>