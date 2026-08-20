<!-- file: frontend/src/pages/inventory/transfer.vue -->
<template>
  <v-container fluid class="pa-0 hide-on-print">
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Transfer Stok (Mutasi)</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Distribusikan barang dari Gudang Pusat ke Cabang, atau antar Cabang.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="teal-darken-3" prepend-icon="mdi-truck-fast-outline" rounded="pill" elevation="2" class="text-none font-weight-bold" @click="openDialog">
          Buat Mutasi Baru
        </v-btn>
      </v-col>
    </v-row>

    <!-- ========================================== -->
    <!-- TAMPILAN MOBILE (CARDS) - Tampil di HP     -->
    <!-- ========================================== -->
    <div class="d-block d-md-none">
      <v-card v-for="trx in transferList" :key="'mob-'+trx.id" class="mb-4 border-sm bg-white" elevation="0" rounded="xl">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-start mb-2">
            <div>
              <div class="font-weight-black text-blue-grey-darken-4 text-subtitle-1">{{ trx.nomor_mutasi }}</div>
              <div class="text-caption text-blue-grey-darken-1">{{ formatWaktu(trx.created_at) }}</div>
            </div>
            <v-chip size="small" :color="trx.status === 'Diterima' ? 'teal-darken-3' : 'orange-darken-3'" variant="flat" class="font-weight-bold px-3 py-1" style="flex-shrink: 0;">
                <span class="text-white">{{ trx.status || 'Dalam Perjalanan' }}</span>
            </v-chip>
          </div>
          
          <v-divider class="my-2 border-dashed"></v-divider>
          
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-caption text-grey-darken-1">Asal:</span>
            <span class="font-weight-medium text-error"><v-icon start size="x-small">mdi-store-minus</v-icon>{{ getBranchName(trx.asal_id) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-caption text-grey-darken-1">Tujuan:</span>
            <span class="font-weight-medium text-success"><v-icon start size="x-small">mdi-store-plus</v-icon>{{ getBranchName(trx.tujuan_id) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-caption text-grey-darken-1">Total Muatan:</span>
            <span class="font-weight-bold text-blue-grey-darken-3">{{ trx.items?.length || 0 }} Jenis Barang</span>
          </div>

          <v-row density="compact">
            <v-col :cols="trx.status !== 'Diterima' && canReceive(trx) ? 9 : 12">
              <v-btn color="blue-grey-darken-3" variant="outlined" block class="font-weight-bold text-none rounded-lg" prepend-icon="mdi-printer" @click="printSuratJalan(trx)">
                Cetak Surat Jalan
              </v-btn>
            </v-col>
            <v-col cols="3" v-if="trx.status !== 'Diterima' && canReceive(trx)">
              <v-btn color="teal-darken-3" variant="elevated" block class="rounded-lg" @click="openReceiveDialog(trx)">
                <v-icon>mdi-clipboard-check-outline</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      
      <div v-if="transferList.length === 0" class="text-center pa-8 text-blue-grey-lighten-2">
        <v-icon size="48" class="mb-2">mdi-truck-check-outline</v-icon>
        <p>Belum ada riwayat mutasi stok.</p>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAMPILAN DESKTOP (TABEL) - Tampil di PC    -->
    <!-- ========================================== -->
    <v-card class="d-none d-md-block border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-4">No. Mutasi & Waktu</th>
            <th class="font-weight-bold text-blue-grey-darken-4">Asal (Origin)</th>
            <th class="font-weight-bold text-blue-grey-darken-4">Tujuan (Destination)</th>
            <th class="font-weight-bold text-center text-blue-grey-darken-4">Total Item</th>
            <th class="font-weight-bold text-center text-blue-grey-darken-4" width="180">Status & Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trx in transferList" :key="'desk-'+trx.id">
            <td>
              <div class="font-weight-bold text-blue-grey-darken-4">{{ trx.nomor_mutasi }}</div>
              <div class="text-caption text-blue-grey-darken-1">{{ formatWaktu(trx.created_at) }}</div>
            </td>
            <td class="font-weight-medium text-error"><v-icon start size="small">mdi-store-minus</v-icon> {{ getBranchName(trx.asal_id) }}</td>
            <td class="font-weight-medium text-success"><v-icon start size="small">mdi-store-plus</v-icon> {{ getBranchName(trx.tujuan_id) }}</td>
            <td class="text-center font-weight-bold text-blue-grey-darken-3">{{ trx.items?.length || 0 }} Jenis</td>
            <td class="text-center">
              <div class="d-flex flex-column align-center justify-center py-2">
                <v-chip v-if="trx.status === 'Diterima'" size="small" color="teal-darken-3" variant="flat" class="font-weight-bold px-3 py-1 mb-2">
                  Diterima
                </v-chip>
                <v-chip v-else size="small" color="orange-darken-3" variant="flat" class="font-weight-bold px-3 py-1 mb-2">
                  Dalam Perjalanan
                </v-chip>
                
                <div class="d-flex gap-2">
                  <v-btn icon="mdi-printer" variant="tonal" color="blue-grey-darken-2" size="small" rounded="lg" @click="printSuratJalan(trx)"></v-btn>
                  <v-btn 
                    v-if="trx.status !== 'Diterima' && canReceive(trx)" 
                    color="teal-darken-3" variant="elevated" size="small" class="font-weight-bold text-none rounded-lg px-3" 
                    prepend-icon="mdi-clipboard-check-outline"
                    @click="openReceiveDialog(trx)"
                  >
                    Terima
                  </v-btn>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="transferList.length === 0">
            <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-truck-check-outline</v-icon>
              <p>Belum ada riwayat distribusi atau transfer stok.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- ========================================== -->
    <!-- DIALOG FORM MUTASI (BUAT BARU)             -->
    <!-- ========================================== -->
    <v-dialog v-model="dialog" max-width="800px" persistent scrollable>
      <v-card rounded="xl" color="white" class="d-flex flex-column" max-height="90vh">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>mdi-truck-fast</v-icon>
          <span class="font-weight-bold">Formulir Mutasi Stok</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto bg-grey-lighten-4">
          <div class="pa-5 bg-white mb-2">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select v-model="form.asal_id" :items="locationOptions" item-title="name" item-value="id" label="Lokasi Asal (Kirim Dari)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details prepend-inner-icon="mdi-store-minus"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="form.tujuan_id" :items="locationOptions" item-title="name" item-value="id" label="Lokasi Tujuan (Kirim Ke)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details prepend-inner-icon="mdi-store-plus"></v-select>
              </v-col>
            </v-row>
          </div>
          <div class="pa-5 bg-white mb-2">
            <v-row align="center">
              <v-col cols="12" sm="7">
                <v-autocomplete v-model="inputItem.product" :items="productList" item-title="name" return-object label="Pilih Barang (Adonan / Produk Jadi)" variant="outlined" density="compact" color="teal-darken-3" hide-details></v-autocomplete>
              </v-col>
              <v-col cols="8" sm="3">
                <v-text-field v-model.number="inputItem.qty" label="Jumlah (Qty)" type="number" :suffix="inputItem.product?.unit || ''" variant="outlined" density="compact" color="teal-darken-3" hide-details></v-text-field>
              </v-col>
              <v-col cols="4" sm="2" class="text-right">
                <v-btn color="indigo-darken-3" block variant="flat" class="text-none font-weight-bold" @click="addItem" :disabled="!inputItem.product || inputItem.qty <= 0">Tambah</v-btn>
              </v-col>
            </v-row>
          </div>
          <div class="pa-5 bg-white">
            <div class="font-weight-bold text-blue-grey-darken-3 mb-3">Daftar Barang yang Akan Dikirim:</div>
            <v-table class="border rounded bg-white">
              <thead class="bg-blue-grey-lighten-5">
                <tr>
                  <th class="font-weight-bold text-blue-grey-darken-4">Nama Barang</th>
                  <th class="font-weight-bold text-center text-blue-grey-darken-4">Qty Dikirim</th>
                  <th class="text-center font-weight-bold text-blue-grey-darken-4" width="50">X</th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr v-for="(item, index) in form.items" :key="index">
                  <td class="font-weight-medium text-blue-grey-darken-4">{{ item.product_name }}</td>
                  <td class="text-center text-teal-darken-3 font-weight-bold">{{ item.qty }} <span class="text-caption">{{ item.unit }}</span></td>
                  <td class="text-center"><v-btn icon="mdi-close-circle" variant="text" color="error" size="small" @click="removeItem(index)"></v-btn></td>
                </tr>
                <tr v-if="form.items.length === 0"><td colspan="3" class="text-center pa-4 text-grey">Belum ada barang yang ditambahkan.</td></tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t flex-shrink-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold mr-2" @click="dialog = false">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" size="large" class="px-8 font-weight-bold text-none" @click="saveTransfer" :loading="isSaving" :disabled="form.items.length === 0 || !form.asal_id || !form.tujuan_id || form.asal_id === form.tujuan_id">Eksekusi Transfer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- DIALOG VALIDASI PENERIMAAN FISIK           -->
    <!-- ========================================== -->
    <!-- ... (Kode Dialog Receive sama persis) ... -->
    <v-dialog v-model="dialogReceive" max-width="600px" persistent scrollable>
      <v-card rounded="xl" color="white" class="d-flex flex-column" max-height="90vh">
        <v-card-title class="pa-5 bg-orange-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>mdi-clipboard-check</v-icon>
          <span class="font-weight-bold">Validasi Penerimaan Fisik</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogReceive = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto bg-grey-lighten-4">
          <v-alert type="info" variant="tonal" density="compact" class="ma-4 text-caption border">
            Pastikan fisik barang sesuai dengan surat jalan. Ubah nilai "Aktual Diterima" jika terdapat selisih atau barang rusak di jalan.
          </v-alert>
          <div class="pa-4 bg-white" v-if="selectedTransfer">
            <div class="font-weight-bold text-blue-grey-darken-3 mb-2">No. Mutasi: <span class="text-indigo-darken-3">{{ selectedTransfer.nomor_mutasi }}</span></div>
            <div v-for="(item, index) in selectedTransfer.items" :key="'rec-'+index" class="mb-4 p-3 border rounded bg-grey-lighten-5 pa-3">
              <div class="font-weight-bold text-blue-grey-darken-4 mb-2">{{ item.product_name }}</div>
              <v-row align="center" density="compact">
                <v-col cols="6">
                  <div class="text-caption text-grey-darken-1">Dikirim (Sistem):</div>
                  <div class="font-weight-black text-blue-grey-darken-3">{{ item.qty }} {{ item.unit }}</div>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model.number="item.qty_diterima" label="Aktual Diterima" type="number" min="0" :max="item.qty" :suffix="item.unit" variant="outlined" density="compact" color="orange-darken-3" hide-details></v-text-field>
                </v-col>
              </v-row>
              <div v-if="item.qty_diterima < item.qty" class="text-caption text-error mt-1 font-weight-medium">
                <v-icon size="x-small">mdi-alert-circle</v-icon> Terdapat selisih/kekurangan {{ item.qty - item.qty_diterima }} {{ item.unit }}.
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t flex-shrink-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold mr-2" @click="dialogReceive = false">Batal</v-btn>
          <v-btn color="orange-darken-3" variant="elevated" rounded="lg" size="large" class="px-6 font-weight-bold text-none" @click="confirmReceive" :loading="isSaving">
            Konfirmasi & Masukkan Stok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- SNACKBAR NOTIFIKASI                        -->
    <!-- ========================================== -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top right" rounded="pill" class="hide-on-print">
      <div class="font-weight-bold d-flex align-center">
        <v-icon start size="small">mdi-information-outline</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-container>

  
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, writeBatch, increment, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { authState } from '../../store/auth'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// State Umum
const dialog = ref(false)
const isSaving = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

// State Data
const transferList = ref([])
const branchesList = ref([])
const productList = ref([])

// State Form Mutasi
const form = ref({ asal_id: 'pusat', tujuan_id: null, items: [] })
const inputItem = ref({ product: null, qty: 1 })

// State Penerimaan Barang
const dialogReceive = ref(false)
const selectedTransfer = ref(null)

// State Cetak
const printData = ref(null)

const showMsg = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

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

const canReceive = (trx) => {
  return authState.value.branchId === trx.tujuan_id || (!authState.value.branchId && trx.tujuan_id === 'pusat')
}

onMounted(() => {
  const tenantId = authState.value.tenantId
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => { branchesList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) })
  onSnapshot(collection(db, 'tenants', tenantId, 'products'), (snapshot) => { productList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) })
  
  const transRef = query(collection(db, 'tenants', tenantId, 'stock_transfers'), orderBy('created_at', 'desc'))
  onSnapshot(transRef, (snapshot) => { transferList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) })
})

const openDialog = () => {
  form.value = { asal_id: 'pusat', tujuan_id: null, items: [] }
  inputItem.value = { product: null, qty: 1 }
  dialog.value = true
}

const addItem = () => {
  if (!inputItem.value.product || inputItem.value.qty <= 0) return
  const existIndex = form.value.items.findIndex(item => item.product_id === inputItem.value.product.id)
  if (existIndex !== -1) {
    form.value.items[existIndex].qty += Number(inputItem.value.qty)
  } else {
    form.value.items.push({
      product_id: inputItem.value.product.id,
      product_name: inputItem.value.product.name,
      unit: inputItem.value.product.unit || 'Pcs',
      qty: Number(inputItem.value.qty)
    })
  }
  inputItem.value = { product: null, qty: 1 }
}

const removeItem = (index) => form.value.items.splice(index, 1)

const saveTransfer = async () => {
  if (form.value.items.length === 0 || form.value.asal_id === form.value.tujuan_id) return
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const batch = writeBatch(db)
    const trxNumber = `MUT-${Date.now().toString().slice(-6)}`
    
    const transRef = doc(collection(db, 'tenants', tenantId, 'stock_transfers'))
    batch.set(transRef, {
      nomor_mutasi: trxNumber,
      asal_id: form.value.asal_id,
      tujuan_id: form.value.tujuan_id,
      items: form.value.items,
      status: 'Dalam Perjalanan',
      created_at: serverTimestamp(),
      operator: authState.value.nama
    })

    form.value.items.forEach(item => {
      const prodRef = doc(db, 'tenants', tenantId, 'products', item.product_id)
      batch.update(prodRef, {
        [`stok_cabang.${form.value.asal_id}`]: increment(-item.qty),
        ...(form.value.asal_id === 'pusat' && { stok: increment(-item.qty) })
      })
    })

    await batch.commit()
    showMsg('Surat jalan berhasil dibuat dan barang dalam status perjalanan.')
    dialog.value = false
  } catch (error) {
    console.error(error)
    showMsg('Terjadi kesalahan sistem saat memproses transfer.', 'error')
  } finally {
    isSaving.value = false
  }
}

const openReceiveDialog = (trx) => {
  const clonedItems = trx.items.map(item => ({
    ...item,
    qty_diterima: item.qty_diterima !== undefined ? item.qty_diterima : item.qty
  }))
  selectedTransfer.value = { ...trx, items: clonedItems }
  dialogReceive.value = true
}

const confirmReceive = async () => {
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const batch = writeBatch(db)
    const trxRef = doc(db, 'tenants', tenantId, 'stock_transfers', selectedTransfer.value.id)
    
    batch.update(trxRef, { 
      status: 'Diterima',
      items: selectedTransfer.value.items,
      received_at: serverTimestamp(),
      received_by: authState.value.nama
    })

    selectedTransfer.value.items.forEach(item => {
      if (item.qty_diterima > 0) {
        const prodRef = doc(db, 'tenants', tenantId, 'products', item.product_id)
        batch.update(prodRef, {
          [`stok_cabang.${selectedTransfer.value.tujuan_id}`]: increment(item.qty_diterima)
        })
      }
    })

    await batch.commit()
    showMsg('Barang berhasil divalidasi dan masuk ke inventaris!')
    dialogReceive.value = false
  } catch (error) {
    console.error(error)
    showMsg('Terjadi kesalahan sistem saat memvalidasi penerimaan barang.', 'error')
  } finally {
    isSaving.value = false
  }
}

const formatWaktu = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

// --- MESIN CETAK PDF SURAT JALAN ---
const printSuratJalan = (trx) => {
  const doc = new jsPDF()
  
  // Header Dokumen
  doc.setFontSize(20)
  doc.setTextColor(0, 105, 92) // Warna Teal-darken-3
  doc.setFont("helvetica", "bold")
  doc.text("SURAT JALAN / DELIVERY NOTE", 14, 22)
  
  // Info Perusahaan (Identitas UMKM)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.setFont("helvetica", "normal")
  doc.text("Burayot Simadu (HQ) - Mentadata ERP", 14, 30)
  doc.text("Garut, Jawa Barat", 14, 35)

  // Meta Data Dokumen
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0)
  doc.text(`No Mutasi: ${trx.nomor_mutasi}`, 130, 22)
  doc.setFont("helvetica", "normal")
  doc.text(`Tanggal: ${formatWaktu(trx.created_at)}`, 130, 28)
  
  // Status Pil
  if(trx.status === 'Diterima') {
    doc.setTextColor(0, 105, 92)
    doc.setFont("helvetica", "bold")
    doc.text(`STATUS: DITERIMA`, 130, 34)
  } else {
    doc.setTextColor(239, 108, 0) // Oranye
    doc.text(`STATUS: DALAM PERJALANAN`, 130, 34)
  }

  // Garis Pemisah
  doc.setDrawColor(200)
  doc.line(14, 42, 196, 42)
  
  // Rute Tujuan (Origin - Destination)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 105, 92)
  doc.text("PENGIRIM (ASAL):", 14, 52)
  doc.text("PENERIMA (TUJUAN):", 110, 52)
  
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text(getBranchName(trx.asal_id), 14, 60)
  doc.text(getBranchName(trx.tujuan_id), 110, 60)
  
  // Menyusun Data Tabel Mutasi
  const tableData = trx.items.map((item, index) => [
    index + 1, 
    item.product_name, 
    item.qty.toString(), 
    item.unit, 
    '' // Kolom kosong agar penerima bisa memberikan ceklis/catatan fisik
  ])

  // Merender Tabel
  autoTable(doc, {
    startY: 70, 
    head: [['No', 'Nama Barang (Produk / Adonan)', 'Qty', 'Satuan', 'Catatan Penerima']], 
    body: tableData,
    theme: 'grid', 
    headStyles: { fillColor: [0, 105, 92], textColor: 255 }, 
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 
      0: { cellWidth: 16, halign: 'center' },
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center' }, 
      4: { cellWidth: 50 } // Lebar kolom catatan
    }
  })

  // Blok Tanda Tangan (3 Kolom)
  const finalY = doc.lastAutoTable.finalY + 20
  
  doc.setTextColor(0)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  
  // TTD Kiri (Pembuat)
  doc.text("Dibuat Oleh,", 35, finalY, { align: 'center' })
  doc.setFont("helvetica", "bold")
  doc.text(`( ${trx.operator || 'Admin Gudang'} )`, 35, finalY + 25, { align: 'center' })
  doc.setFont("helvetica", "normal")
  doc.text("Pengirim", 35, finalY + 30, { align: 'center' })
  
  // TTD Tengah (Supir)
  doc.text("Dibawa Oleh,", 105, finalY, { align: 'center' })
  doc.setFont("helvetica", "bold")
  doc.text("( ________________ )", 105, finalY + 25, { align: 'center' })
  doc.setFont("helvetica", "normal")
  doc.text("Supir / Kurir", 105, finalY + 30, { align: 'center' })

  // TTD Kanan (Penerima)
  doc.text("Diterima Oleh,", 175, finalY, { align: 'center' })
  doc.setFont("helvetica", "bold")
  doc.text("( ________________ )", 175, finalY + 25, { align: 'center' })
  doc.setFont("helvetica", "normal")
  doc.text("Admin Cabang", 175, finalY + 30, { align: 'center' })

  // Simpan / Unduh PDF
  doc.save(`${trx.nomor_mutasi}_Surat_Jalan.pdf`)
}
</script>

