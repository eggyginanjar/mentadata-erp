<!-- file: frontend/src/pages/production/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Produksi & Manufaktur</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Rencanakan Bill of Materials (BOM) dan laporkan hasil produksi aktual (Good/Waste).</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="orange-darken-3" prepend-icon="mdi-factory" rounded="pill" elevation="2" class="text-none font-weight-bold" @click="openDialog">
          Rencanakan BOM Baru
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Riwayat Produksi -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-orange-lighten-5">
          <tr>
            <th class="font-weight-bold text-orange-darken-4">No. BOM & Waktu</th>
            <th class="font-weight-bold text-orange-darken-4">Barang Target Produksi</th>
            <th class="font-weight-bold text-center text-orange-darken-4">Status & Qty</th>
            <th class="text-right font-weight-bold text-orange-darken-4">Total Biaya (HPP)</th>
            <th class="text-center font-weight-bold text-orange-darken-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in productions" :key="prod.id">
            <td>
              <div class="font-weight-bold text-blue-grey-darken-4">{{ prod.spk_number }}</div>
              <div class="text-caption text-blue-grey-darken-1">{{ formatWaktu(prod.created_at) }}</div>
            </td>
            <td class="font-weight-medium text-blue-grey-darken-3">{{ prod.output_name }}</td>
            <td class="text-center">
              <v-chip size="small" :color="prod.status === 'Selesai' ? 'teal-darken-3' : 'blue-grey-lighten-1'" variant="flat" class="font-weight-bold text-white text-uppercase px-3 mb-1">
                {{ prod.status || 'Menunggu' }}
              </v-chip>
              <!-- Jika Selesai, tampilkan hasil aktual -->
              <div v-if="prod.status === 'Selesai'">
                <div class="text-caption font-weight-bold text-teal-darken-3">Good: + {{ prod.actual_qty }} {{ prod.output_unit }}</div>
                <div v-if="prod.waste_qty > 0" class="text-caption text-error font-weight-medium">Waste: {{ prod.waste_qty }} {{ prod.output_unit }}</div>
              </div>
              <!-- Jika Menunggu, tampilkan estimasi -->
              <div v-else>
                <div class="text-caption text-grey">Est Target: {{ prod.output_qty }} {{ prod.output_unit }}</div>
              </div>
            </td>
            <td class="text-right font-weight-bold text-deep-orange-darken-3">
              {{ formatRupiah(prod.total_cost) }}
              <div class="text-caption text-grey">@ {{ formatRupiah(prod.unit_cost) }}</div>
            </td>
            <td class="text-center">
              <!-- Tombol Eksekusi Aktual -->
              <v-tooltip text="Lapor Hasil Aktual (Eksekusi)" location="top" v-if="prod.status !== 'Selesai'">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-hammer-wrench" color="teal-darken-3" variant="text" size="small" @click="openExecutionDialog(prod)"></v-btn>
                </template>
              </v-tooltip>
              
              <v-tooltip text="Cetak PDF BOM" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-printer" variant="text" color="blue-grey-darken-1" size="small" @click="printBOM(prod)"></v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
          <tr v-if="productions.length === 0">
            <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-robot-industrial-outline</v-icon>
              <p>Belum ada riwayat produksi atau Bill of Materials (BOM).</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- FASE 1: Dialog Perencanaan BOM -->
    <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
      <v-card rounded="xl" color="white" class="d-flex flex-column" max-height="90vh">
        <v-card-title class="pa-5 bg-orange-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>mdi-clipboard-text-play-outline</v-icon>
          <span class="font-weight-bold">Rencana Bill of Materials (BOM)</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto bg-grey-lighten-4">
          <!-- Bagian 1: Hasil Produksi (Output) -->
          <div class="pa-5 bg-white mb-2">
            <h3 class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3 mb-3">1. Target Perencanaan Produksi</h3>
            <v-row>
              <v-col cols="12" md="8">
                <v-autocomplete
                  v-model="outputProduct"
                  :items="finishedGoodsList"
                  :item-title="getProductTitle"
                  return-object
                  label="Pilih Barang Jadi / Setengah Jadi"
                  variant="outlined" density="comfortable" color="orange-darken-3" hide-details
                  prepend-inner-icon="mdi-package-variant-closed"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field 
                  v-model.number="outputQty" label="Estimasi Jumlah Hasil" type="number" 
                  :suffix="outputProduct?.unit || ''"
                  variant="outlined" density="comfortable" color="orange-darken-3" hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Bagian 2: Input Bahan Baku -->
          <div class="pa-5 bg-white mb-2">
            <h3 class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3 mb-3">2. Bahan Baku Dibutuhkan (Resep)</h3>
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="inputForm.product"
                  :items="rawMaterialsList"
                  :item-title="getRawMaterialTitle"
                  return-object
                  label="Pilih Bahan Baku / Setengah Jadi"
                  variant="outlined" density="compact" color="orange-darken-3" hide-details
                ></v-autocomplete>
              </v-col>
              <v-col cols="8" md="3">
                <v-text-field 
                  v-model.number="inputForm.qty" label="Jumlah Dibutuhkan" type="number" 
                  :suffix="inputForm.product?.unit || ''"
                  variant="outlined" density="compact" color="orange-darken-3" hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="4" md="3" class="text-right">
                <v-btn color="teal-darken-3" block variant="flat" class="text-none font-weight-bold" @click="addInputItem" :disabled="!inputForm.product || inputForm.qty <= 0">
                  + Tambah
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- Bagian 3: Daftar Pemotongan Bahan -->
          <div class="pa-5 bg-white">
            <v-table class="border rounded bg-white">
              <thead class="bg-blue-grey-lighten-5">
                <tr>
                  <th class="font-weight-bold text-blue-grey-darken-4">Bahan Baku</th>
                  <th class="font-weight-bold text-center text-blue-grey-darken-4">Qty Direncanakan</th>
                  <th class="font-weight-bold text-right text-blue-grey-darken-4">HPP Satuan</th>
                  <th class="font-weight-bold text-right text-blue-grey-darken-4">Subtotal Biaya</th>
                  <th class="text-center font-weight-bold text-blue-grey-darken-4" width="50">X</th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr v-for="(item, index) in inputList" :key="index">
                  <td class="font-weight-medium text-blue-grey-darken-4">{{ item.product_name }}</td>
                  <td class="text-center text-error font-weight-bold">- {{ item.qty }} <span class="text-caption">{{ item.unit }}</span></td>
                  <td class="text-right text-blue-grey-darken-1">{{ formatRupiah(item.hpp) }}</td>
                  <td class="text-right font-weight-bold text-blue-grey-darken-4">{{ formatRupiah(item.subtotal) }}</td>
                  <td class="text-center"><v-btn icon="mdi-close-circle" variant="text" color="error" size="small" @click="removeInputItem(index)"></v-btn></td>
                </tr>
                <tr v-if="inputList.length === 0">
                  <td colspan="5" class="text-center pa-4 text-grey">Belum ada bahan baku yang ditambahkan.</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-5 bg-white border-t d-flex align-center flex-shrink-0">
          <div>
            <div class="text-caption font-weight-bold text-blue-grey-lighten-1">ESTIMASI BIAYA PRODUKSI</div>
            <div class="text-h6 font-weight-black text-orange-darken-4">{{ formatRupiah(totalProductionCost) }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold mr-2" @click="closeDialog">Batal</v-btn>
          <v-btn color="orange-darken-3" variant="elevated" rounded="lg" size="large" class="px-8 font-weight-bold text-none" @click="savePlanBOM" :loading="isSaving" :disabled="inputList.length === 0 || !outputProduct || outputQty <= 0">
            Simpan Rencana BOM
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- FASE 2: Dialog Eksekusi Produksi (Lapor Hasil Aktual) -->
    <v-dialog v-model="executionDialog" max-width="600px" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>mdi-hammer-wrench</v-icon>
          <span class="font-weight-bold">Lapor Hasil Produksi Aktual</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="executionDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" class="mb-5" density="compact">
            Masukkan hasil fisik yang didapat. Bahan baku akan otomatis dipotong dan biaya produksi akan diserap ke dalam HPP Barang Bagus.
          </v-alert>

          <div class="mb-4">
            <div class="text-caption text-blue-grey-darken-1">Target Produksi:</div>
            <div class="text-h6 font-weight-bold text-blue-grey-darken-4">
              {{ executionData?.output_name }}
              <span class="text-body-2 font-weight-regular text-grey">(Rencana: {{ executionData?.output_qty }} {{ executionData?.output_unit }})</span>
            </div>
          </div>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="executionData.actual_qty" 
                label="Hasil Bagus (Good)" type="number" 
                :suffix="executionData?.output_unit || ''"
                variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                hint="Menambah stok gudang" persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="executionData.waste_qty" 
                label="Waste / Gagal / Susut" type="number" 
                :suffix="executionData?.output_unit || ''"
                variant="outlined" density="comfortable" color="error" hide-details="auto"
                hint="Menaikkan HPP satuan" persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="executionDialog = false">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="executeProduction" :loading="isSaving" :disabled="executionData?.actual_qty < 0">
            Konfirmasi & Potong Stok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top">
      <div class="d-flex align-center">
        <v-icon start>mdi-alert-circle-outline</v-icon>
        <span class="font-weight-bold">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, writeBatch, increment, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { authState } from '../../store/auth'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const dialog = ref(false)
const executionDialog = ref(false)
const isSaving = ref(false)
const productions = ref([])
const productList = ref([])

// Form State Perencanaan
const outputProduct = ref(null)
const outputQty = ref(1)
const inputList = ref([])
const inputForm = ref({ product: null, qty: 1 })

// Form State Eksekusi Aktual
const executionData = ref(null)

const snackbar = ref({ show: false, text: '', color: 'error' })

const finishedGoodsList = computed(() => productList.value.filter(p => p.tipe !== 'Bahan Baku'))
const rawMaterialsList = computed(() => 
  productList.value.filter(p => p.tipe === 'Bahan Baku' || p.tipe === 'Barang Setengah Jadi')
)

const getProductTitle = (item) => {
  if (!item) return '';
  return `${item.name} (${item.unit || '-'})`;
}

const getRawMaterialTitle = (item) => {
  if (!item) return '';
  return `${item.name} (${item.unit || '-'}) - Stok: ${item.stok || 0}`;
}

const totalProductionCost = computed(() => inputList.value.reduce((total, item) => total + item.subtotal, 0))

onMounted(() => {
  const tenantId = authState.value.tenantId

  const productsRef = collection(db, 'tenants', tenantId, 'products')
  onSnapshot(productsRef, (snapshot) => {
    productList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })

  const prodRef = query(collection(db, 'tenants', tenantId, 'productions'), orderBy('created_at', 'desc'))
  onSnapshot(prodRef, (snapshot) => {
    productions.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const openDialog = () => {
  outputProduct.value = null
  outputQty.value = 1
  inputList.value = []
  inputForm.value = { product: null, qty: 1 }
  dialog.value = true
}

const closeDialog = () => dialog.value = false

const addInputItem = () => {
  if (!inputForm.value.product || inputForm.value.qty <= 0) return
  
  const stokGudang = inputForm.value.product.stok || 0;
  if (inputForm.value.qty > stokGudang) {
    snackbar.value = { show: true, text: `Gagal! Stok ${inputForm.value.product.name} tidak cukup.`, color: 'error' }
    return;
  }

  const existIndex = inputList.value.findIndex(item => item.product_id === inputForm.value.product.id)
  if (existIndex !== -1) {
    if ((inputList.value[existIndex].qty + Number(inputForm.value.qty)) > stokGudang) {
      snackbar.value = { show: true, text: `Gagal! Akumulasi pemakaian melebihi batas stok.`, color: 'error' }
      return;
    }
  }

  const hpp = Number(inputForm.value.product.harga_modal) || 0
  
  if (existIndex !== -1) {
    inputList.value[existIndex].qty += Number(inputForm.value.qty)
    inputList.value[existIndex].subtotal = inputList.value[existIndex].qty * hpp
  } else {
    inputList.value.push({
      product_id: inputForm.value.product.id,
      product_name: inputForm.value.product.name,
      unit: inputForm.value.product.unit || 'Pcs',
      qty: Number(inputForm.value.qty),
      hpp: hpp,
      subtotal: Number(inputForm.value.qty) * hpp
    })
  }
  inputForm.value = { product: null, qty: 1 }
}
const removeInputItem = (index) => inputList.value.splice(index, 1)

// --- FASE 1: SIMPAN RENCANA (Belum Potong Stok) ---
const savePlanBOM = async () => {
  if (!outputProduct.value || outputQty.value <= 0 || inputList.value.length === 0) return
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const bomNumber = `BOM-${Date.now().toString().slice(-6)}`
    const unitCost = Math.round(totalProductionCost.value / outputQty.value) 

    const prodRef = doc(collection(db, 'tenants', tenantId, 'productions'))
    await writeBatch(db).set(prodRef, {
      spk_number: bomNumber, 
      status: 'Menunggu', // Status perencanaan
      output_id: outputProduct.value.id,
      output_name: outputProduct.value.name,
      output_unit: outputProduct.value.unit || 'Pcs',
      output_qty: outputQty.value, // Estimasi Good
      actual_qty: 0,
      waste_qty: 0,
      total_cost: totalProductionCost.value,
      unit_cost: unitCost,
      inputs: inputList.value,
      created_at: serverTimestamp(),
      operator: authState.value?.user?.name || authState.value?.user?.email || 'Admin Produksi'
    }).commit()

    closeDialog()
  } catch (error) {
    console.error(error)
    alert("Gagal merencanakan produksi.")
  } finally {
    isSaving.value = false
  }
}

// --- FASE 2: BUKA DIALOG PELAPORAN AKTUAL ---
const openExecutionDialog = (prod) => {
  executionData.value = JSON.parse(JSON.stringify(prod))
  // Defaultkan nilai aktual agar admin dapur lebih mudah
  executionData.value.actual_qty = prod.output_qty
  executionData.value.waste_qty = 0
  executionDialog.value = true
}

// --- FASE 3: EKSEKUSI (Potong Stok & Kalkulasi Ulang HPP) ---
const executeProduction = async () => {
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const batch = writeBatch(db)

    // Kalkulasi HPP Aktual. Biaya total (total_cost) dibagi hasil bagus (actual_qty). 
    // Waste otomatis diserap. Jika actual_qty = 0, unit_cost 0 untuk hindari Infinity.
    const finalActualQty = Number(executionData.value.actual_qty) || 0
    let finalUnitCost = 0
    if (finalActualQty > 0) {
      finalUnitCost = Math.round(executionData.value.total_cost / finalActualQty)
    }

    // 1. Update Dokumen Produksi
    const prodRef = doc(db, 'tenants', tenantId, 'productions', executionData.value.id)
    batch.update(prodRef, {
      status: 'Selesai',
      actual_qty: finalActualQty,
      waste_qty: Number(executionData.value.waste_qty) || 0,
      unit_cost: finalUnitCost,
      executed_at: serverTimestamp()
    })

    // 2. Tambah Stok & Update HPP Barang Jadi
    if (finalActualQty > 0) {
      const outputDocRef = doc(db, 'tenants', tenantId, 'products', executionData.value.output_id)
      const currentProduct = productList.value.find(p => p.id === executionData.value.output_id)
      const oldStok = currentProduct?.stok || 0
      const oldHpp = currentProduct?.harga_modal || 0
      
      let newHpp = finalUnitCost
      if (oldStok + finalActualQty > 0) {
        newHpp = Math.round(((oldStok * oldHpp) + executionData.value.total_cost) / (oldStok + finalActualQty))
      }

      batch.update(outputDocRef, {
        stok: increment(finalActualQty),
        harga_modal: newHpp
      })
    }

    // 3. Kurangi Stok Bahan Baku (Resep Final)
    executionData.value.inputs.forEach(item => {
      const inputDocRef = doc(db, 'tenants', tenantId, 'products', item.product_id)
      batch.update(inputDocRef, {
        stok: increment(-item.qty)
      })
    })

    await batch.commit()
    executionDialog.value = false
  } catch (error) {
    console.error(error)
    alert("Gagal mengeksekusi stok aktual.")
  } finally {
    isSaving.value = false
  }
}

// --- MESIN CETAK PDF BOM ---
const printBOM = (prod) => {
  const doc = new jsPDF()
  
  doc.setFontSize(22)
  doc.setTextColor(230, 81, 0)
  doc.setFont("helvetica", "bold")
  doc.text("BILL OF MATERIALS (BOM)", 14, 22)
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.setFont("helvetica", "normal")
  doc.text("Burayot Simadu (HQ) - Mentadata ERP", 14, 30)
  doc.text("Garut, Jawa Barat", 14, 35)

  doc.setFont("helvetica", "bold")
  doc.setTextColor(0)
  doc.text(`No: ${prod.spk_number}`, 140, 22)
  doc.setFont("helvetica", "normal")
  doc.text(`Tgl Rencana: ${formatWaktu(prod.created_at)}`, 140, 28)
  
  if(prod.status === 'Selesai') {
    doc.setTextColor(0, 105, 92) // Teal
    doc.setFont("helvetica", "bold")
    doc.text(`STATUS: SELESAI`, 140, 34)
  } else {
    doc.setTextColor(158, 158, 158) // Grey
    doc.text(`STATUS: MENUNGGU`, 140, 34)
  }

  doc.setDrawColor(200)
  doc.line(14, 42, 196, 42)
  
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(230, 81, 0)
  doc.text("Target Produksi:", 14, 52)
  
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text(`${prod.output_name}`, 14, 60)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  
  let startYTable = 72;
  
  // Tampilan Dinamis Berdasarkan Status
  if (prod.status === 'Selesai') {
    doc.text(`Hasil Aktual (Good): + ${prod.actual_qty} ${prod.output_unit}`, 14, 66)
    if (prod.waste_qty > 0) {
      doc.setTextColor(211, 47, 47) 
      doc.text(`Terdapat Susut / Waste: ${prod.waste_qty} ${prod.output_unit}`, 14, 72)
      doc.setTextColor(0) 
      doc.text(`HPP Satuan Final: ${formatRupiah(prod.unit_cost)}`, 14, 78)
      startYTable = 88;
    } else {
      doc.text(`HPP Satuan Final: ${formatRupiah(prod.unit_cost)}`, 14, 72)
      startYTable = 82;
    }
  } else {
    // Jika belum dieksekusi (Rencana)
    doc.text(`Estimasi Dihasilkan: ${prod.output_qty} ${prod.output_unit}`, 14, 66)
    doc.text(`Estimasi HPP Satuan: ${formatRupiah(prod.unit_cost)}`, 14, 72)
    startYTable = 82;
  }

  const tableData = prod.inputs.map((item, index) => [
    index + 1, 
    item.product_name, 
    `- ${item.qty} ${item.unit}`, 
    formatRupiah(item.hpp), 
    formatRupiah(item.subtotal)
  ])

  autoTable(doc, {
    startY: startYTable, 
    head: [['No', 'Kebutuhan Bahan Baku', 'Qty Dibutuhkan', 'HPP Satuan', 'Subtotal']], 
    body: tableData,
    theme: 'grid', 
    headStyles: { fillColor: [230, 81, 0], textColor: 255 }, 
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 
      0: { cellWidth: 16, halign: 'center' },
      2: { halign: 'center', textColor: [211, 47, 47], fontStyle: 'bold' },
      3: { halign: 'right' }, 
      4: { halign: 'right', fontStyle: 'bold' } 
    }
  })

  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("TOTAL BIAYA PRODUKSI:", 110, finalY)
  doc.setTextColor(230, 81, 0)
  doc.text(formatRupiah(prod.total_cost), 196, finalY, { align: 'right' })

  doc.setTextColor(0)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Dibuat Oleh,", 40, finalY + 30, { align: 'center' })
  doc.setFont("helvetica", "bold")
  doc.text(`( ${prod.operator || 'Admin Produksi'} )`, 40, finalY + 55, { align: 'center' })
  doc.setFont("helvetica", "normal")
  doc.text("Dilaporkan/Diperiksa Oleh,", 160, finalY + 30, { align: 'center' })
  doc.setFont("helvetica", "bold")
  doc.text("( Kepala Dapur )", 160, finalY + 55, { align: 'center' })

  doc.save(`${prod.spk_number}_BOM_${prod.output_name.replace(/\s+/g, '_')}.pdf`)
}

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
const formatWaktu = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}
</script>