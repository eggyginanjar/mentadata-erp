<!-- file: frontend/src/pages/accounting/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Akuntansi & Pemetaan Jurnal</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Kelola Bagan Akun (COA) dan mesin otomatisasi jurnal *double-entry* Anda.</p>
    </div>

    <v-card elevation="0" rounded="xl" class="border-sm bg-white overflow-hidden">
      <!-- TABS -->
      <v-tabs v-model="tab" color="teal-darken-3" bg-color="blue-grey-lighten-5">
        <v-tab value="coa" class="font-weight-bold text-none"><v-icon start>mdi-format-list-numbered</v-icon> Bagan Akun (COA)</v-tab>
        <v-tab value="mapping" class="font-weight-bold text-none"><v-icon start>mdi-transit-connection-variant</v-icon> Mapping Kategori & Jurnal</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- ========================================== -->
        <!-- TAB 1: BAGAN AKUN (COA)                    -->
        <!-- ========================================== -->
        <v-window-item value="coa">
          <div class="pa-4 d-flex align-center bg-white border-b">
            <v-select
              v-model="filterKelompok"
              :items="kelompokAkun"
              label="Filter Kelompok"
              variant="outlined" density="compact" color="teal-darken-3" hide-details
              style="max-width: 250px;" clearable class="mr-3"
            ></v-select>
            <v-text-field
              v-model="searchCOA"
              prepend-inner-icon="mdi-magnify" placeholder="Cari Kode / Nama..."
              variant="outlined" density="compact" color="teal-darken-3" hide-details
              style="max-width: 300px;"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn v-if="coaList.length > 0" color="teal-darken-3" prepend-icon="mdi-plus" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openAddDialog">
              Tambah Akun
            </v-btn>
          </div>

          <!-- STATE KOSONG COA -->
          <div v-if="coaList.length === 0 && !isLoading" class="text-center pa-10 bg-white">
            <v-icon size="80" color="blue-grey-lighten-4" class="mb-4">mdi-book-account-outline</v-icon>
            <h3 class="text-h6 font-weight-bold text-blue-grey-darken-3 mb-2">Bagan Akun Masih Kosong</h3>
            <p class="text-blue-grey-darken-1 mb-6 max-w-md mx-auto">Sistem dapat membuatkan templat standar akun keuangan khusus UMKM.</p>
            <v-btn color="indigo-darken-3" size="large" rounded="pill" prepend-icon="mdi-magic-staff" class="text-none font-weight-bold px-8" @click="generateDefaultCOA" :loading="isGenerating">
              Generate Default COA
            </v-btn>
          </div>

          <!-- TABEL COA -->
          <v-table hover class="bg-white" v-else>
            <thead class="bg-blue-grey-lighten-5">
              <tr>
                <th class="font-weight-bold text-blue-grey-darken-4" width="100">Kode</th>
                <th class="font-weight-bold text-blue-grey-darken-4">Nama Akun</th>
                <th class="font-weight-bold text-blue-grey-darken-4">Kelompok</th>
                <th class="font-weight-bold text-center text-blue-grey-darken-4" width="150">Saldo Normal</th>
                <th class="text-center font-weight-bold text-blue-grey-darken-4" width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="akun in filteredCOA" :key="akun.id">
                <td class="font-weight-black text-indigo-darken-3">{{ akun.kode }}</td>
                <td class="font-weight-bold text-blue-grey-darken-3">{{ akun.nama_akun }}</td>
                <td class="text-blue-grey-darken-1 text-caption font-weight-medium">{{ akun.kelompok }}</td>
                <td class="text-center">
                  <v-chip size="small" :color="akun.saldo_normal === 'DEBIT' ? 'teal-darken-3' : 'deep-purple-darken-2'" variant="tonal" class="font-weight-bold">
                    {{ akun.saldo_normal === 'DEBIT' ? 'DEBIT (D)' : 'KREDIT (K)' }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" @click="editAkun(akun)"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- ========================================== -->
        <!-- TAB 2: MAPPING KATEGORI & JURNAL           -->
        <!-- ========================================== -->
        <v-window-item value="mapping">
          <div class="pa-4 d-flex align-center bg-white border-b">
            <v-select
              v-model="filterTipeMapping"
              :items="['Semua Tipe', 'MASUK', 'KELUAR']"
              label="Tipe Transaksi"
              variant="outlined" density="compact" color="teal-darken-3" hide-details
              style="max-width: 200px;" class="mr-3"
            ></v-select>
            <v-text-field
              v-model="searchMapping"
              prepend-inner-icon="mdi-magnify" placeholder="Cari Kategori Tampil..."
              variant="outlined" density="compact" color="teal-darken-3" hide-details
              style="max-width: 300px;"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn v-if="mappingList.length > 0" color="teal-darken-3" prepend-icon="mdi-plus" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openMappingDialog">
              Tambah Kategori
            </v-btn>
          </div>

          <!-- STATE KOSONG MAPPING -->
          <div v-if="mappingList.length === 0 && !isLoadingMapping" class="text-center pa-10 bg-white">
            <v-icon size="80" color="blue-grey-lighten-4" class="mb-4">mdi-transit-connection-variant</v-icon>
            <h3 class="text-h6 font-weight-bold text-blue-grey-darken-3 mb-2">Pemetaan Jurnal Belum Tersedia</h3>
            <p class="text-blue-grey-darken-1 mb-6 max-w-md mx-auto">Buat fondasi kategori pengeluaran dan pemasukan untuk digunakan di aplikasi kasir/admin.</p>
            <v-btn color="indigo-darken-3" size="large" rounded="pill" prepend-icon="mdi-magic-staff" class="text-none font-weight-bold px-8" @click="generateDefaultMapping" :loading="isGeneratingMapping" :disabled="coaList.length === 0">
              Generate Mapping Default
            </v-btn>
            <p v-if="coaList.length === 0" class="text-caption text-error mt-2">Mohon Generate COA terlebih dahulu di tab sebelumnya.</p>
          </div>

          <!-- TABEL MAPPING -->
          <v-table hover class="bg-white" v-else>
            <thead class="bg-blue-grey-lighten-5">
              <tr>
                <th class="font-weight-bold text-blue-grey-darken-4">Kategori Tampil (UI)</th>
                <th class="font-weight-bold text-center text-blue-grey-darken-4" width="120">Tipe Arus</th>
                <th class="font-weight-bold text-blue-grey-darken-4" width="300">Mapping Jurnal (D/K)</th>
                <th class="text-center font-weight-bold text-blue-grey-darken-4" width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="map in filteredMapping" :key="map.id">
                <td class="font-weight-bold text-blue-grey-darken-3">{{ map.nama_kategori }}</td>
                <td class="text-center">
                  <v-chip size="small" :color="map.tipe === 'MASUK' ? 'success' : 'error'" variant="flat" class="font-weight-bold">
                    {{ map.tipe }}
                  </v-chip>
                </td>
                <td>
                  <div class="d-flex align-center gap-2 mb-1 mt-1">
                    <v-chip size="x-small" color="teal-darken-3" class="font-weight-black" variant="flat">D : {{ map.akun_debit }}</v-chip>
                    <span class="text-caption text-grey-darken-1 text-truncate" style="max-width:180px">{{ getCoaName(map.akun_debit) }}</span>
                  </div>
                  <div class="d-flex align-center gap-2 mb-1">
                    <v-chip size="x-small" color="deep-purple-darken-2" class="font-weight-black" variant="flat">K : {{ map.akun_kredit }}</v-chip>
                    <span class="text-caption text-grey-darken-1 text-truncate" style="max-width:180px">{{ getCoaName(map.akun_kredit) }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editMapping(map)"></v-btn>
                  <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteMapping(map.id)"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- ========================================== -->
    <!-- DIALOG FORM COA                            -->
    <!-- ========================================== -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-plus-box' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Akun' : 'Tambah Akun Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-select v-model="form.kelompok" :items="kelompokAkun" label="Kelompok Akun" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-3" hide-details="auto"></v-select>
          <v-row>
            <v-col cols="4">
              <v-text-field v-model="form.kode" label="Kode Akun" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto" :disabled="isEditing"></v-text-field>
            </v-col>
            <v-col cols="8">
              <v-text-field v-model="form.nama_akun" label="Nama Akun" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"></v-text-field>
            </v-col>
          </v-row>
          <v-radio-group v-model="form.saldo_normal" inline label="Saldo Normal" color="teal-darken-3" class="mt-4 font-weight-medium">
            <v-radio label="Debit (D)" value="DEBIT"></v-radio>
            <v-radio label="Kredit (K)" value="KREDIT"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="dialog = false">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveAkun" :loading="isSaving">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- DIALOG FORM MAPPING                        -->
    <!-- ========================================== -->
    <v-dialog v-model="dialogMapping" max-width="600px" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-indigo-darken-3 text-white d-flex align-center">
          <v-icon start>mdi-transit-connection-variant</v-icon>
          <span class="font-weight-bold">{{ isEditingMapping ? 'Edit Mapping Jurnal' : 'Tambah Mapping Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogMapping = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="8">
              <v-text-field v-model="formMapping.nama_kategori" label="Nama Kategori (Tampil di Aplikasi)" placeholder="Contoh: Biaya Gaji dan Upah" variant="outlined" density="comfortable" color="indigo-darken-3" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="formMapping.tipe" :items="['MASUK', 'KELUAR']" label="Tipe Arus" variant="outlined" density="comfortable" color="indigo-darken-3" hide-details="auto"></v-select>
            </v-col>
          </v-row>
          
          <v-divider class="my-5 border-dashed"></v-divider>
          <div class="font-weight-bold text-blue-grey-darken-3 mb-3">Target Jurnal Berpasangan</div>
          
          <v-autocomplete
            v-model="formMapping.akun_debit"
            :items="coaOptions"
            item-title="title" item-value="value"
            label="Akun Debit (D)"
            variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4"
            prepend-inner-icon="mdi-plus-circle"
          ></v-autocomplete>
          
          <v-autocomplete
            v-model="formMapping.akun_kredit"
            :items="coaOptions"
            item-title="title" item-value="value"
            label="Akun Kredit (K)"
            variant="outlined" density="comfortable" color="deep-purple-darken-2"
            prepend-inner-icon="mdi-minus-circle"
          ></v-autocomplete>

        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="dialogMapping = false">Batal</v-btn>
          <v-btn color="indigo-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveMapping" :loading="isSavingMapping">Simpan Mapping</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, writeBatch, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { authState } from '../../store/auth'

const tab = ref('coa')

// --- STATE: COA ---
const coaList = ref([])
const isLoading = ref(true)
const isGenerating = ref(false)
const isSaving = ref(false)
const dialog = ref(false)
const isEditing = ref(false)
const filterKelompok = ref(null)
const searchCOA = ref('')

const kelompokAkun = [
  '1 - ASET / HARTA', '2 - KEWAJIBAN / UTANG', '3 - EKUITAS / MODAL', '4 - PENDAPATAN',
  '5 - HPP (HARGA POKOK PENJUALAN)', '6 - BEBAN / BIAYA OPERASIONAL', '7 - PENDAPATAN LAIN-LAIN', '8 - BIAYA DI LUAR USAHA'
]
const form = ref({ kelompok: '', kode: '', nama_akun: '', saldo_normal: 'DEBIT' })

// --- STATE: MAPPING ---
const mappingList = ref([])
const isLoadingMapping = ref(true)
const isGeneratingMapping = ref(false)
const isSavingMapping = ref(false)
const dialogMapping = ref(false)
const isEditingMapping = ref(false)
const editMappingId = ref(null)
const filterTipeMapping = ref('Semua Tipe')
const searchMapping = ref('')

const formMapping = ref({ nama_kategori: '', tipe: 'KELUAR', akun_debit: null, akun_kredit: null })

// Computed Options untuk Autocomplete Mapping
const coaOptions = computed(() => {
  return coaList.value.map(akun => ({
    title: `${akun.kode} - ${akun.nama_akun}`,
    value: akun.kode
  }))
})
const getCoaName = (kode) => {
  const akun = coaList.value.find(a => a.kode === kode)
  return akun ? akun.nama_akun : 'Akun Tidak Ditemukan'
}

onMounted(() => {
  const tenantId = authState.value.tenantId
  
  // Fetch COA
  const coaRef = query(collection(db, 'tenants', tenantId, 'coa'), orderBy('kode', 'asc'))
  onSnapshot(coaRef, (snapshot) => {
    coaList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    isLoading.value = false
  })

  // Fetch Mapping
  const mapRef = query(collection(db, 'tenants', tenantId, 'mapping_jurnal'), orderBy('created_at', 'desc'))
  onSnapshot(mapRef, (snapshot) => {
    mappingList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    isLoadingMapping.value = false
  })
})

// ==========================================
// LOGIKA COA
// ==========================================
const filteredCOA = computed(() => {
  let result = coaList.value
  if (filterKelompok.value) result = result.filter(item => item.kelompok === filterKelompok.value)
  if (searchCOA.value) {
    const keyword = searchCOA.value.toLowerCase()
    result = result.filter(item => item.kode.toLowerCase().includes(keyword) || item.nama_akun.toLowerCase().includes(keyword))
  }
  return result
})

const openAddDialog = () => {
  isEditing.value = false
  form.value = { kelompok: kelompokAkun[0], kode: '', nama_akun: '', saldo_normal: 'DEBIT' }
  dialog.value = true
}

const editAkun = (akun) => {
  isEditing.value = true
  form.value = { ...akun }
  dialog.value = true
}

const saveAkun = async () => {
  if (!form.value.kode || !form.value.nama_akun || !form.value.kelompok) return
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const docId = form.value.kode.toString() 
    await setDoc(doc(db, 'tenants', tenantId, 'coa', docId), {
      kode: form.value.kode,
      nama_akun: form.value.nama_akun,
      kelompok: form.value.kelompok,
      saldo_normal: form.value.saldo_normal,
      updated_at: serverTimestamp()
    }, { merge: true })
    dialog.value = false
  } catch (error) { alert("Gagal menyimpan akun."); console.error(error) } finally { isSaving.value = false }
}

const generateDefaultCOA = async () => {
  isGenerating.value = true
  try {
    const batch = writeBatch(db)
    const defaultAccounts = [
      { kode: '101', nama_akun: 'Kas Utama', kelompok: '1 - ASET / HARTA', saldo_normal: 'DEBIT' },
      { kode: '102', nama_akun: 'Bank', kelompok: '1 - ASET / HARTA', saldo_normal: 'DEBIT' },
      { kode: '105', nama_akun: 'Piutang Usaha', kelompok: '1 - ASET / HARTA', saldo_normal: 'DEBIT' },
      { kode: '106', nama_akun: 'Persediaan Bahan Baku', kelompok: '1 - ASET / HARTA', saldo_normal: 'DEBIT' },
      { kode: '107', nama_akun: 'Persediaan Barang Jadi', kelompok: '1 - ASET / HARTA', saldo_normal: 'DEBIT' },
      { kode: '201', nama_akun: 'Utang Usaha', kelompok: '2 - KEWAJIBAN / UTANG', saldo_normal: 'KREDIT' },
      { kode: '301', nama_akun: 'Modal Awal', kelompok: '3 - EKUITAS / MODAL', saldo_normal: 'KREDIT' },
      { kode: '307', nama_akun: 'Modal Tambahan (Investor)', kelompok: '3 - EKUITAS / MODAL', saldo_normal: 'KREDIT' },
      { kode: '401', nama_akun: 'Pendapatan Penjualan', kelompok: '4 - PENDAPATAN', saldo_normal: 'KREDIT' },
      { kode: '501', nama_akun: 'Harga Pokok Penjualan', kelompok: '5 - HPP (HARGA POKOK PENJUALAN)', saldo_normal: 'DEBIT' },
      { kode: '601', nama_akun: 'Biaya Gaji dan Upah', kelompok: '6 - BEBAN / BIAYA OPERASIONAL', saldo_normal: 'DEBIT' },
      { kode: '603', nama_akun: 'Biaya Transportasi', kelompok: '6 - BEBAN / BIAYA OPERASIONAL', saldo_normal: 'DEBIT' },
      { kode: '606', nama_akun: 'Biaya Operasional Lainnya', kelompok: '6 - BEBAN / BIAYA OPERASIONAL', saldo_normal: 'DEBIT' },
      { kode: '701', nama_akun: 'Pendapatan Lain-lain', kelompok: '7 - PENDAPATAN LAIN-LAIN', saldo_normal: 'KREDIT' },
      { kode: '801', nama_akun: 'Biaya Administrasi Bank', kelompok: '8 - BIAYA DI LUAR USAHA', saldo_normal: 'DEBIT' }
    ]
    defaultAccounts.forEach(akun => {
      batch.set(doc(db, 'tenants', authState.value.tenantId, 'coa', akun.kode), { ...akun, created_at: serverTimestamp() })
    })
    await batch.commit()
  } catch (error) { alert("Gagal generate COA."); console.error(error) } finally { isGenerating.value = false }
}

// ==========================================
// LOGIKA MAPPING JURNAL
// ==========================================
const filteredMapping = computed(() => {
  let result = mappingList.value
  if (filterTipeMapping.value && filterTipeMapping.value !== 'Semua Tipe') {
    result = result.filter(item => item.tipe === filterTipeMapping.value)
  }
  if (searchMapping.value) {
    const kw = searchMapping.value.toLowerCase()
    result = result.filter(item => item.nama_kategori.toLowerCase().includes(kw))
  }
  return result
})

const openMappingDialog = () => {
  isEditingMapping.value = false
  editMappingId.value = null
  formMapping.value = { nama_kategori: '', tipe: 'KELUAR', akun_debit: null, akun_kredit: null }
  dialogMapping.value = true
}

const editMapping = (map) => {
  isEditingMapping.value = true
  editMappingId.value = map.id
  formMapping.value = { ...map }
  dialogMapping.value = true
}

const deleteMapping = async (id) => {
  if (confirm('Yakin menghapus mapping ini? Laporan ke depan untuk kategori ini akan terputus.')) {
    try { await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'mapping_jurnal', id)) }
    catch (e) { console.error(e) }
  }
}

const saveMapping = async () => {
  if (!formMapping.value.nama_kategori || !formMapping.value.akun_debit || !formMapping.value.akun_kredit) return
  isSavingMapping.value = true
  try {
    const refDoc = isEditingMapping.value 
      ? doc(db, 'tenants', authState.value.tenantId, 'mapping_jurnal', editMappingId.value)
      : doc(collection(db, 'tenants', authState.value.tenantId, 'mapping_jurnal'))
    
    await setDoc(refDoc, {
      nama_kategori: formMapping.value.nama_kategori,
      tipe: formMapping.value.tipe,
      akun_debit: formMapping.value.akun_debit,
      akun_kredit: formMapping.value.akun_kredit,
      updated_at: serverTimestamp(),
      ...( !isEditingMapping.value && { created_at: serverTimestamp() } )
    }, { merge: true })
    dialogMapping.value = false
  } catch (error) { alert("Gagal menyimpan mapping."); console.error(error) } finally { isSavingMapping.value = false }
}

const generateDefaultMapping = async () => {
  isGeneratingMapping.value = true
  try {
    const batch = writeBatch(db)
    const defaults = [
      { id: 'CAT001', nama_kategori: 'Penerimaan Penjualan (POS)', tipe: 'MASUK', akun_debit: '101', akun_kredit: '401' },
      { id: 'CAT002', nama_kategori: 'Penerimaan Modal Investor', tipe: 'MASUK', akun_debit: '102', akun_kredit: '307' },
      { id: 'CAT003', nama_kategori: 'Biaya Gaji dan Upah', tipe: 'KELUAR', akun_debit: '601', akun_kredit: '101' },
      { id: 'CAT004', nama_kategori: 'Biaya Transportasi', tipe: 'KELUAR', akun_debit: '603', akun_kredit: '101' },
      { id: 'CAT005', nama_kategori: 'Biaya Operasional Lain', tipe: 'KELUAR', akun_debit: '606', akun_kredit: '101' }
    ]
    defaults.forEach(map => {
      batch.set(doc(db, 'tenants', authState.value.tenantId, 'mapping_jurnal', map.id), { ...map, created_at: serverTimestamp() })
    })
    await batch.commit()
  } catch (error) { alert("Gagal generate mapping."); console.error(error) } finally { isGeneratingMapping.value = false }
}
</script>