<!-- file: frontend/src/pages/cashflow/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Buku Kas & Bank</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Catat arus kas masuk dan keluar untuk operasional harian bisnis Anda.</p>
      </v-col>
      <v-col cols="auto" class="d-flex gap-2">
        <v-btn color="error" prepend-icon="mdi-arrow-up-circle-outline" rounded="pill" elevation="2" class="text-none font-weight-bold mr-2" @click="openDialog('KELUAR')">
          Catat Pengeluaran
        </v-btn>
        <v-btn color="success" prepend-icon="mdi-arrow-down-circle-outline" rounded="pill" elevation="2" class="text-none font-weight-bold" @click="openDialog('MASUK')">
          Catat Pemasukan
        </v-btn>
      </v-col>
    </v-row>

    <!-- TABEL RIWAYAT KAS -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <div class="pa-4 bg-blue-grey-lighten-5 d-flex align-center border-b">
        <v-icon start color="blue-grey-darken-2">mdi-history</v-icon>
        <span class="font-weight-bold text-blue-grey-darken-3">Riwayat Transaksi Kas Terbaru</span>
      </div>
      
      <v-table hover class="bg-white">
        <thead class="bg-grey-lighten-4">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-4">Tanggal & No. Ref</th>
            <th class="font-weight-bold text-blue-grey-darken-4">Kategori Jurnal</th>
            <th class="font-weight-bold text-blue-grey-darken-4">Keterangan</th>
            <th class="font-weight-bold text-center text-blue-grey-darken-4" width="120">Arus</th>
            <th class="font-weight-bold text-right text-blue-grey-darken-4">Nominal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trx in cashflowList" :key="trx.id">
            <td>
              <div class="font-weight-bold text-blue-grey-darken-4">{{ formatTanggal(trx.tanggal) }}</div>
              <div class="text-caption text-blue-grey-lighten-1">{{ trx.nomor_transaksi }}</div>
            </td>
            <td class="font-weight-medium text-indigo-darken-3">{{ trx.nama_kategori }}</td>
            <td class="text-blue-grey-darken-2">{{ trx.keterangan || '-' }}</td>
            <td class="text-center">
              <v-chip size="small" :color="trx.tipe === 'MASUK' ? 'success' : 'error'" variant="flat" class="font-weight-bold">
                {{ trx.tipe === 'MASUK' ? 'MASUK' : 'KELUAR' }}
              </v-chip>
            </td>
            <td class="text-right font-weight-black" :class="trx.tipe === 'MASUK' ? 'text-success' : 'text-error'">
              {{ trx.tipe === 'MASUK' ? '+' : '-' }} {{ formatRupiah(trx.nominal) }}
            </td>
          </tr>
          <tr v-if="cashflowList.length === 0">
            <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-cash-remove</v-icon>
              <p>Belum ada catatan arus kas operasional.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- DIALOG INPUT KAS -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 text-white d-flex align-center" :class="form.tipe === 'MASUK' ? 'bg-success' : 'bg-error'">
          <v-icon start>{{ form.tipe === 'MASUK' ? 'mdi-cash-plus' : 'mdi-cash-minus' }}</v-icon>
          <span class="font-weight-bold">Catat {{ form.tipe === 'MASUK' ? 'Pemasukan' : 'Pengeluaran' }} Kas</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert v-if="filteredMapping.length === 0" type="warning" variant="tonal" density="compact" class="mb-4">
            Kategori pemetaan jurnal untuk arus kas {{ form.tipe }} belum tersedia. Silakan atur di menu Akuntansi & COA terlebih dahulu.
          </v-alert>

          <v-form @submit.prevent="saveTransaction">
            <v-text-field 
              v-model="form.tanggal" label="Tanggal Transaksi" type="date" 
              variant="outlined" density="comfortable" :color="form.tipe === 'MASUK' ? 'success' : 'error'" class="mb-4" hide-details="auto"
            ></v-text-field>

            <v-autocomplete
              v-model="form.kategori_id"
              :items="filteredMapping"
              item-title="nama_kategori" item-value="id"
              label="Pilih Kategori"
              variant="outlined" density="comfortable" :color="form.tipe === 'MASUK' ? 'success' : 'error'" class="mb-4" hide-details="auto"
              :disabled="filteredMapping.length === 0"
            ></v-autocomplete>

            <v-text-field 
              v-model.number="form.nominal" label="Nominal Uang (Rp)" type="number" 
              variant="outlined" density="comfortable" :color="form.tipe === 'MASUK' ? 'success' : 'error'" class="mb-4" hide-details="auto"
            ></v-text-field>

            <v-textarea 
              v-model="form.keterangan" label="Catatan / Keterangan Tambahan" 
              variant="outlined" :color="form.tipe === 'MASUK' ? 'success' : 'error'" rows="2" hide-details="auto"
            ></v-textarea>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="dialog = false">Batal</v-btn>
          <v-btn :color="form.tipe === 'MASUK' ? 'success' : 'error'" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveTransaction" :loading="isSaving" :disabled="!form.kategori_id || form.nominal <= 0">
            Simpan Transaksi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, setDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore'
import { authState } from '../../store/auth'

const dialog = ref(false)
const isSaving = ref(false)
const cashflowList = ref([])
const mappingList = ref([])

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const form = ref({ tipe: 'KELUAR', tanggal: getTodayDate(), kategori_id: null, nominal: 0, keterangan: '' })

onMounted(() => {
  const tenantId = authState.value.tenantId
  
  // 1. Tarik Data Mapping Jurnal
  const mapRef = collection(db, 'tenants', tenantId, 'mapping_jurnal')
  onSnapshot(mapRef, (snapshot) => {
    mappingList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })

  // 2. Tarik Riwayat Transaksi Kas
  const cfRef = query(collection(db, 'tenants', tenantId, 'jurnal_umum'), orderBy('created_at', 'desc'), limit(50))
  onSnapshot(cfRef, (snapshot) => {
    cashflowList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const filteredMapping = computed(() => {
  // Hanya tampilkan kategori yang sesuai dengan tombol (Masuk/Keluar) dan sembunyikan transaksi sistem POS
  return mappingList.value.filter(item => item.tipe === form.value.tipe && item.nama_kategori !== 'Penerimaan Penjualan (POS)')
})

const openDialog = (tipeTransaksi) => {
  form.value = { tipe: tipeTransaksi, tanggal: getTodayDate(), kategori_id: null, nominal: 0, keterangan: '' }
  dialog.value = true
}

const saveTransaction = async () => {
  if (!form.value.kategori_id || form.value.nominal <= 0) return
  isSaving.value = true
  
  try {
    const tenantId = authState.value.tenantId
    const selectedMap = mappingList.value.find(m => m.id === form.value.kategori_id)
    
    // Auto-generate Nomor Transaksi (Contoh: CSH-20260820-12345)
    const dateStr = form.value.tanggal.replace(/-/g, '')
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    const trxId = `CSH-${dateStr}-${randomNum}`
    
    const docRef = doc(db, 'tenants', tenantId, 'jurnal_umum', trxId)
    
    // Inilah letak ajaibnya: Kita menyimpan data kas sekaligus membungkusnya sebagai "Jurnal Umum"
    await setDoc(docRef, {
      nomor_transaksi: trxId,
      tanggal: form.value.tanggal,
      kategori_id: form.value.kategori_id,
      nama_kategori: selectedMap.nama_kategori,
      keterangan: form.value.keterangan,
      tipe: form.value.tipe,
      nominal: Number(form.value.nominal),
      
      // Data Akuntansi Siluman (Hidden Accounting Engine)
      akun_debit: selectedMap.akun_debit,
      akun_kredit: selectedMap.akun_kredit,
      
      operator: authState.value.nama,
      created_at: serverTimestamp()
    })

    dialog.value = false
  } catch (error) {
    console.error("Gagal menyimpan kas:", error)
    alert("Terjadi kesalahan saat menyimpan transaksi.")
  } finally {
    isSaving.value = false
  }
}

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
const formatTanggal = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
</script>