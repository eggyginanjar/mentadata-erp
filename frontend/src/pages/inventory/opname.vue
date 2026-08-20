<!-- file: frontend/src/pages/inventory/opname.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-4">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Penyesuaian Stok (Stock Opname)</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Sinkronkan angka di sistem dengan fisik barang aktual di gudang.</p>
    </div>

    <v-card elevation="0" rounded="xl" class="border-sm bg-white overflow-hidden">
      <!-- TABS -->
      <v-tabs v-model="tab" color="teal-darken-3" bg-color="blue-grey-lighten-5">
        <v-tab value="form" class="font-weight-bold text-none"><v-icon start>mdi-clipboard-text-outline</v-icon> Lakukan Opname</v-tab>
        <v-tab value="history" class="font-weight-bold text-none"><v-icon start>mdi-history</v-icon> Riwayat Penyesuaian</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- ========================================== -->
        <!-- TAB 1: FORM LAKUKAN OPNAME                 -->
        <!-- ========================================== -->
        <v-window-item value="form">
          <div class="pa-5 bg-white border-b">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedLocation"
                  :items="locationOptions"
                  item-title="name" item-value="id"
                  label="Pilih Lokasi Gudang/Cabang"
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details
                  prepend-inner-icon="mdi-map-marker-outline"
                  @update:modelValue="buildOpnameList"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchProduct"
                  prepend-inner-icon="mdi-magnify" placeholder="Cari Nama Barang..."
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4" class="text-right">
                <v-btn color="teal-darken-3" variant="elevated" rounded="lg" size="large" class="font-weight-bold text-none px-6" @click="saveOpname" :loading="isSaving" :disabled="!selectedLocation || hasNoChanges">
                  Simpan Penyesuaian
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- Peringatan belum pilih lokasi -->
          <div v-if="!selectedLocation" class="text-center pa-10 bg-grey-lighten-5">
            <v-icon size="60" color="blue-grey-lighten-3" class="mb-4">mdi-store-search-outline</v-icon>
            <h3 class="text-h6 font-weight-bold text-blue-grey-darken-2">Pilih Lokasi Terlebih Dahulu</h3>
            <p class="text-blue-grey-darken-1">Tentukan gudang pusat atau cabang mana yang ingin Anda hitung fisiknya.</p>
          </div>

          <!-- Tabel Kertas Kerja Opname -->
          <v-table hover class="bg-white" v-else>
            <thead class="bg-blue-grey-lighten-5">
              <tr>
                <th class="font-weight-bold text-blue-grey-darken-4" width="250">Nama Barang (Kategori)</th>
                <th class="font-weight-bold text-center text-blue-grey-darken-4" width="120">Stok Sistem</th>
                <th class="font-weight-bold text-center text-teal-darken-4" width="180">Fisik Aktual</th>
                <th class="font-weight-bold text-center text-blue-grey-darken-4" width="100">Selisih</th>
                <th class="font-weight-bold text-blue-grey-darken-4">Keterangan / Alasan (Wajib jika ada selisih)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredOpnameList" :key="item.product_id" :class="item.actual_qty !== item.system_qty ? 'bg-orange-lighten-5' : ''">
                <td>
                  <div class="font-weight-bold text-blue-grey-darken-4">{{ item.name }}</div>
                  <div class="text-caption text-blue-grey-darken-1">{{ item.tipe }}</div>
                </td>
                <td class="text-center font-weight-medium text-blue-grey-darken-2">
                  {{ item.system_qty }} <span class="text-caption">{{ item.unit }}</span>
                </td>
                <td class="text-center pa-2">
                  <v-text-field 
                    v-model.number="item.actual_qty" type="number" min="0"
                    variant="outlined" density="compact" color="teal-darken-3" hide-details
                    class="bg-white"
                  ></v-text-field>
                </td>
                <td class="text-center font-weight-black" :class="getVarianceColor(item.actual_qty - item.system_qty)">
                  {{ (item.actual_qty - item.system_qty) > 0 ? '+' : '' }}{{ item.actual_qty - item.system_qty }}
                </td>
                <td class="pa-2">
                  <v-text-field 
                    v-model="item.reason" placeholder="Contoh: 2 pcs rusak/basi"
                    variant="outlined" density="compact" color="orange-darken-3" hide-details
                    class="bg-white" :disabled="item.actual_qty === item.system_qty"
                  ></v-text-field>
                </td>
              </tr>
              <tr v-if="filteredOpnameList.length === 0">
                <td colspan="5" class="text-center pa-6 text-grey">Tidak ada barang yang ditemukan.</td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- ========================================== -->
        <!-- TAB 2: RIWAYAT PENYESUAIAN                 -->
        <!-- ========================================== -->
        <v-window-item value="history">
          <v-table hover class="bg-white">
            <thead class="bg-blue-grey-lighten-5">
              <tr>
                <th class="font-weight-bold text-blue-grey-darken-4">Waktu & Operator</th>
                <th class="font-weight-bold text-blue-grey-darken-4">Lokasi Gudang</th>
                <th class="font-weight-bold text-blue-grey-darken-4">Total Item Disesuaikan</th>
                <th class="font-weight-bold text-center text-blue-grey-darken-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in historyList" :key="log.id">
                <td>
                  <div class="font-weight-bold text-blue-grey-darken-4">{{ formatWaktu(log.created_at) }}</div>
                  <div class="text-caption text-blue-grey-darken-1"><v-icon start size="x-small">mdi-account-outline</v-icon> {{ log.operator }}</div>
                </td>
                <td class="font-weight-medium text-indigo-darken-3">{{ getBranchName(log.location_id) }}</td>
                <td class="font-weight-bold text-blue-grey-darken-3">{{ log.items?.length || 0 }} Barang Diubah</td>
                <td class="text-center">
                  <v-btn color="blue-grey-darken-2" variant="tonal" size="small" class="text-none font-weight-bold" @click="viewDetail(log)">Lihat Detail</v-btn>
                </td>
              </tr>
              <tr v-if="historyList.length === 0">
                <td colspan="4" class="text-center pa-8 text-grey">Belum ada riwayat stock opname.</td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- DIALOG DETAIL RIWAYAT -->
    <v-dialog v-model="dialogDetail" max-width="700px" scrollable>
      <v-card rounded="xl" color="white" max-height="90vh" class="d-flex flex-column">
        <v-card-title class="pa-5 bg-blue-grey-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>mdi-file-document-outline</v-icon>
          <span class="font-weight-bold">Detail Kertas Kerja Opname</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogDetail = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto">
          <div class="pa-4 bg-grey-lighten-4 border-b">
            <div class="font-weight-bold">Lokasi: <span class="text-indigo-darken-3">{{ selectedDetail?.location_name }}</span></div>
            <div class="text-caption">Waktu: {{ formatWaktu(selectedDetail?.created_at) }} | Oleh: {{ selectedDetail?.operator }}</div>
          </div>
          <v-table hover>
            <thead class="bg-white">
              <tr>
                <th class="font-weight-bold text-blue-grey-darken-4">Nama Barang</th>
                <th class="font-weight-bold text-center text-blue-grey-darken-4">Sistem -> Aktual</th>
                <th class="font-weight-bold text-blue-grey-darken-4">Alasan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in selectedDetail?.items" :key="idx">
                <td class="font-weight-medium">{{ item.name }}</td>
                <td class="text-center">
                  <span class="text-grey-darken-1 text-decoration-line-through">{{ item.system_qty }}</span> 
                  <v-icon size="small" class="mx-1">mdi-arrow-right</v-icon>
                  <span class="font-weight-bold text-teal-darken-4">{{ item.actual_qty }}</span>
                </td>
                <td class="text-caption text-orange-darken-4 font-italic">{{ item.reason }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top right" rounded="pill">
      <div class="font-weight-bold d-flex align-center">
        <v-icon start size="small">mdi-information-outline</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, writeBatch, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { authState } from '../../store/auth'

const tab = ref('form')
const isSaving = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const productsList = ref([])
const branchesList = ref([])
const historyList = ref([])
const opnameList = ref([]) // Kertas kerja dinamis

const selectedLocation = ref(null)
const searchProduct = ref('')

const dialogDetail = ref(false)
const selectedDetail = ref(null)

const showMsg = (text, color = 'success') => { snackbar.value = { show: true, text, color } }

// Opsi Lokasi: Gabungan "Pusat" dan daftar Cabang
const locationOptions = computed(() => {
  const options = [{ id: 'pusat', name: '🏢 Gudang Pusat (HQ)' }]
  branchesList.value.forEach(b => options.push({ id: b.id, name: `🏪 ${b.nama_cabang}` }))
  return options
})

const getBranchName = (id) => {
  if (id === 'pusat') return 'Gudang Pusat (HQ)'
  const branch = branchesList.value.find(b => b.id === id)
  return branch ? branch.nama_cabang : 'Tidak Diketahui'
}

onMounted(() => {
  const tenantId = authState.value.tenantId
  
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => { branchesList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) })
  onSnapshot(collection(db, 'tenants', tenantId, 'products'), (snapshot) => { productsList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) })
  
  const historyRef = query(collection(db, 'tenants', tenantId, 'stock_adjustments'), orderBy('created_at', 'desc'))
  onSnapshot(historyRef, (snapshot) => { historyList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) })
})

// Membangun Kertas Kerja (Form Dinamis) saat lokasi dipilih
const buildOpnameList = () => {
  if (!selectedLocation.value) return
  
  opnameList.value = productsList.value.map(prod => {
    // Ambil stok berdasarkan lokasi (Pusat atau Cabang)
    let currentStock = 0
    if (selectedLocation.value === 'pusat') {
      currentStock = prod.stok || 0
    } else {
      currentStock = (prod.stok_cabang && prod.stok_cabang[selectedLocation.value]) ? prod.stok_cabang[selectedLocation.value] : 0
    }

    return {
      product_id: prod.id,
      name: prod.name,
      tipe: prod.tipe,
      unit: prod.unit || 'Pcs',
      system_qty: currentStock,
      actual_qty: currentStock, // Default sama dengan sistem
      reason: ''
    }
  })
}

// Filter Pencarian di kerta kerja
const filteredOpnameList = computed(() => {
  if (!searchProduct.value) return opnameList.value
  const kw = searchProduct.value.toLowerCase()
  return opnameList.value.filter(item => item.name.toLowerCase().includes(kw) || item.tipe.toLowerCase().includes(kw))
})

// Cek apakah ada perubahan sama sekali
const hasNoChanges = computed(() => {
  return !opnameList.value.some(item => item.actual_qty !== item.system_qty)
})

const getVarianceColor = (diff) => {
  if (diff > 0) return 'text-success'
  if (diff < 0) return 'text-error'
  return 'text-blue-grey-lighten-2'
}

const saveOpname = async () => {
  // Filter HANYA item yang mengalami selisih (actual_qty != system_qty)
  const changedItems = opnameList.value.filter(item => item.actual_qty !== item.system_qty)
  
  if (changedItems.length === 0) return
  
  // Validasi: Wajib isi alasan
  const missingReason = changedItems.find(item => !item.reason || item.reason.trim() === '')
  if (missingReason) {
    showMsg(`Mohon isi alasan untuk barang: ${missingReason.name}`, 'error')
    return
  }

  if (!confirm(`Anda akan mengoreksi stok ${changedItems.length} item. Lanjutkan?`)) return

  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const batch = writeBatch(db)

    // 1. Simpan Log Riwayat Opname
    const logRef = doc(collection(db, 'tenants', tenantId, 'stock_adjustments'))
    batch.set(logRef, {
      location_id: selectedLocation.value,
      location_name: getBranchName(selectedLocation.value),
      items: changedItems,
      operator: authState.value.nama,
      created_at: serverTimestamp()
    })

    // 2. Overwrite / Ganti paksa stok di database Master Produk
    changedItems.forEach(item => {
      const prodRef = doc(db, 'tenants', tenantId, 'products', item.product_id)
      
      if (selectedLocation.value === 'pusat') {
        batch.update(prodRef, { stok: Number(item.actual_qty) })
      } else {
        batch.update(prodRef, { [`stok_cabang.${selectedLocation.value}`]: Number(item.actual_qty) })
      }
    })

    await batch.commit()
    showMsg('Stock Opname berhasil disimpan dan inventaris telah diperbarui.')
    
    // Refresh list agar system_qty sinkron kembali
    buildOpnameList()
    tab.value = 'history' // Pindah ke tab riwayat
  } catch (error) {
    console.error("Gagal menyimpan opname:", error)
    showMsg("Terjadi kesalahan sistem saat menyimpan data.", 'error')
  } finally {
    isSaving.value = false
  }
}

const viewDetail = (log) => {
  selectedDetail.value = log
  dialogDetail.value = true
}

const formatWaktu = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}
</script>