<!-- file: frontend/src/pages/procurement/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Purchase Order & Penerimaan</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Terbitkan PO ke Pemasok dan validasi penerimaan barang masuk ke gudang (Goods Receipt).</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="indigo-darken-3" prepend-icon="mdi-cart-plus" rounded="pill" elevation="2" class="text-none font-weight-bold" @click="openPoDialog">
          Buat PO Baru
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Riwayat PO & Status Penerimaan -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-indigo-lighten-5">
          <tr>
            <th class="font-weight-bold text-indigo-darken-4">Nomor PO & Waktu</th>
            <th class="font-weight-bold text-indigo-darken-4">Pemasok</th>
            <th class="font-weight-bold text-indigo-darken-4 text-center">Status</th>
            <th class="text-right font-weight-bold text-indigo-darken-4">Grand Total</th>
            <th class="text-center font-weight-bold text-indigo-darken-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="po in procurements" :key="po.id">
            <td>
              <div class="font-weight-bold text-blue-grey-darken-4">{{ po.po_number }}</div>
              <div class="text-caption text-blue-grey-darken-1">{{ formatWaktu(po.created_at) }}</div>
            </td>
            <td class="font-weight-medium text-blue-grey-darken-3">{{ po.supplier_name }}</td>
            <td class="text-center">
              <v-chip size="small" :color="getStatusColor(po.status)" variant="flat" class="font-weight-bold text-white text-uppercase px-3">
                {{ po.status || 'Menunggu' }}
              </v-chip>
            </td>
            <td class="text-right font-weight-bold text-error">
              <!-- Jika parsial, tampilkan total nilai aktual dari barang yang diterima -->
              {{ po.status === 'Selesai' || po.status === 'Parsial' ? formatRupiah(po.actual_grand_total) : formatRupiah(po.grand_total) }}
              <div v-if="po.status === 'Parsial'" class="text-caption text-grey">Est: {{ formatRupiah(po.grand_total) }}</div>
            </td>
            <td class="text-center">
              <!-- Tombol Validasi Penerimaan (Hanya muncul jika barang belum sepenuhnya diterima) -->
              <v-tooltip text="Validasi Barang Masuk" location="top" v-if="po.status !== 'Selesai'">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-clipboard-check" color="teal-darken-3" variant="text" size="small" @click="openReceiptDialog(po)"></v-btn>
                </template>
              </v-tooltip>
              
              <v-tooltip text="Cetak PDF PO" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-printer" variant="text" color="blue-grey-darken-1" size="small" @click="printPO(po)"></v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
          <tr v-if="procurements.length === 0">
            <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-text-box-search-outline</v-icon>
              <p>Belum ada dokumen Purchase Order (PO) yang diterbitkan.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- FASE 1: DIALOG BUAT PO (PEMESANAN SAJA) -->
    <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
      <v-card rounded="xl" color="white" class="d-flex flex-column" max-height="90vh">
        <v-card-title class="pa-5 bg-indigo-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>mdi-cart-arrow-down</v-icon>
          <span class="font-weight-bold">Terbitkan Purchase Order Baru</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto bg-grey-lighten-4">
          <div class="pa-5 bg-white mb-2">
            <h3 class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3 mb-3">1. Pilih Pemasok</h3>
            <v-autocomplete v-model="selectedSupplier" :items="suppliersList" item-title="nama_toko" return-object label="Cari dari Master Pemasok..." variant="outlined" density="comfortable" color="indigo-darken-3" hide-details prepend-inner-icon="mdi-storefront"></v-autocomplete>
          </div>

          <div class="pa-5 bg-white mb-2">
            <h3 class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3 mb-3">2. Tambahkan Item Pesanan</h3>
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-autocomplete v-model="cartInput.product" :items="productList" :item-title="getProductTitle" return-object label="Pilih Bahan Baku/Item" variant="outlined" density="compact" color="indigo-darken-3" hide-details></v-autocomplete>
              </v-col>
              <v-col cols="6" md="2">
                <v-text-field v-model.number="cartInput.qty" label="Qty Pesan" type="number" :suffix="cartInput.product?.unit || ''" variant="outlined" density="compact" color="indigo-darken-3" hide-details></v-text-field>
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="cartInput.price" label="Harga (Satuan)" prefix="Rp" type="number" variant="outlined" density="compact" color="indigo-darken-3" hide-details></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="text-right">
                <v-btn color="teal-darken-3" block variant="flat" class="text-none font-weight-bold" @click="addToCart" :disabled="!cartInput.product || cartInput.qty <= 0"> + Masukkan </v-btn>
              </v-col>
            </v-row>
          </div>

          <div class="pa-5 bg-white">
            <h3 class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3 mb-3">3. Daftar Estimasi Pesanan</h3>
            <v-table class="border rounded bg-white">
              <thead class="bg-blue-grey-lighten-5">
                <tr>
                  <th class="font-weight-bold text-blue-grey-darken-4">Item</th>
                  <th class="font-weight-bold text-center text-blue-grey-darken-4">Qty Pesan</th>
                  <th class="font-weight-bold text-right text-blue-grey-darken-4">Harga Satuan</th>
                  <th class="font-weight-bold text-right text-blue-grey-darken-4">Subtotal</th>
                  <th class="text-center font-weight-bold text-blue-grey-darken-4" width="50">Hapus</th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr v-for="(item, index) in cart" :key="index">
                  <td class="font-weight-bold text-blue-grey-darken-4">{{ item.product_name }}</td>
                  <td class="text-center text-blue-grey-darken-3 font-weight-medium">{{ item.qty }} <span class="text-caption text-blue-grey-lighten-1">{{ item.unit }}</span></td>
                  <td class="text-right text-blue-grey-darken-3">{{ formatRupiah(item.price) }}</td>
                  <td class="text-right font-weight-black text-indigo-darken-3">{{ formatRupiah(item.subtotal) }}</td>
                  <td class="text-center"><v-btn icon="mdi-close-circle" variant="text" color="error" size="small" @click="removeFromCart(index)"></v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-5 bg-white border-t d-flex align-center flex-shrink-0">
          <div>
            <div class="text-caption font-weight-bold text-blue-grey-lighten-1">ESTIMASI GRAND TOTAL</div>
            <div class="text-h5 font-weight-black text-error">{{ formatRupiah(grandTotal) }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold mr-2" @click="closeDialog">Batal</v-btn>
          <!-- Tombol hanya menyimpan PO, tidak menambah stok -->
          <v-btn color="indigo-darken-3" variant="elevated" rounded="lg" size="large" class="px-8 font-weight-bold text-none" @click="savePO" :loading="isSaving" :disabled="cart.length === 0 || !selectedSupplier">
            Terbitkan Dokumen PO
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- FASE 2: DIALOG PENERIMAAN BARANG (GOODS RECEIPT) -->
    <v-dialog v-model="receiptDialog" max-width="800px" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>mdi-clipboard-check-outline</v-icon>
          <span class="font-weight-bold">Validasi Penerimaan: {{ receiptData?.po_number }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="receiptDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6 bg-grey-lighten-4">
          <v-alert type="info" variant="tonal" class="mb-4" density="compact">
            Masukkan jumlah aktual barang yang tiba di gudang. Sistem akan otomatis menghitung ulang HPP dan memperbarui stok Master Produk.
          </v-alert>

          <v-table class="border rounded bg-white">
            <thead class="bg-teal-lighten-5">
              <tr>
                <th class="font-weight-bold text-teal-darken-4">Item Bahan Baku</th>
                <th class="font-weight-bold text-center text-teal-darken-4">Pesan</th>
                <th class="font-weight-bold text-center text-teal-darken-4" width="200">Aktual Diterima</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr v-for="(item, index) in receiptData?.items" :key="index">
                <td class="font-weight-medium text-blue-grey-darken-4">{{ item.product_name }}</td>
                <td class="text-center text-blue-grey-darken-1">
                  {{ item.qty }} <span class="text-caption">{{ item.unit }}</span>
                </td>
                <td class="pa-2">
                  <v-text-field
                    v-model.number="item.received_qty"
                    type="number"
                    variant="outlined" density="compact" color="teal-darken-3" hide-details
                    :suffix="item.unit"
                  ></v-text-field>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="pa-4 bg-white border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="receiptDialog = false">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveReceipt" :loading="isSaving">
            Konfirmasi & Tambah Stok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
const receiptDialog = ref(false)
const isSaving = ref(false)
const procurements = ref([])
const productList = ref([])
const suppliersList = ref([])

const selectedSupplier = ref(null)
const cart = ref([])
const cartInput = ref({ product: null, qty: 1, price: 0 })
const receiptData = ref(null)

onMounted(() => {
  const tenantId = authState.value.tenantId

  const productsRef = collection(db, 'tenants', tenantId, 'products')
  onSnapshot(productsRef, (snapshot) => {
    productList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })

  const suppliersRef = collection(db, 'tenants', tenantId, 'suppliers')
  onSnapshot(suppliersRef, (snapshot) => {
    suppliersList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })

  const procRef = query(collection(db, 'tenants', tenantId, 'procurements'), orderBy('created_at', 'desc'))
  onSnapshot(procRef, (snapshot) => {
    procurements.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const getStatusColor = (status) => {
  if (status === 'Selesai') return 'teal-darken-3'
  if (status === 'Parsial') return 'orange-darken-3'
  return 'blue-grey-lighten-1'
}

const openPoDialog = () => {
  selectedSupplier.value = null
  cart.value = []
  resetCartInput()
  dialog.value = true
}

const closeDialog = () => dialog.value = false
const resetCartInput = () => { cartInput.value = { product: null, qty: 1, price: 0 } }
// Fungsi aman untuk menyusun teks tanpa merusak reaktivitas Vuetify
const getProductTitle = (item) => {
  if (!item) return '';
  return `${item.name} (${item.unit || '-'})`;
}

const addToCart = () => {
  if (!cartInput.value.product || !cartInput.value.product.id || cartInput.value.qty <= 0) return
  const item = {
    product_id: cartInput.value.product.id,
    product_name: cartInput.value.product.name,
    unit: cartInput.value.product.unit || 'Pcs',
    qty: Number(cartInput.value.qty), 
    price: Number(cartInput.value.price),
    subtotal: Number(cartInput.value.qty) * Number(cartInput.value.price),
    received_qty: 0 // Inisialisasi awal penerimaan adalah 0
  }
  cart.value.push(item)
  resetCartInput()
}

const removeFromCart = (index) => cart.value.splice(index, 1)
const grandTotal = computed(() => cart.value.reduce((total, item) => total + item.subtotal, 0))

// --- FASE 1: MENYIMPAN DOKUMEN PO (TANPA MENAMBAH STOK) ---
const savePO = async () => {
  if (!selectedSupplier.value || cart.value.length === 0) return
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const newPoRef = doc(collection(db, 'tenants', tenantId, 'procurements'))
    
    await writeBatch(db).set(newPoRef, {
      po_number: `PO-${Date.now().toString().slice(-6)}`,
      supplier_id: selectedSupplier.value.id,
      supplier_name: selectedSupplier.value.nama_toko,
      status: 'Menunggu', // Status awal
      grand_total: grandTotal.value,
      actual_grand_total: 0,
      items: cart.value,
      created_at: serverTimestamp(),
      pembuat_po: authState.value?.user?.name || authState.value?.user?.email || 'Admin Sistem'
    }).commit()

    closeDialog()
  } catch (error) {
    console.error(error)
    alert("Gagal menerbitkan dokumen PO.")
  } finally {
    isSaving.value = false
  }
}

// --- FASE 2: MEMBUKA FORM VALIDASI FISIK ---
const openReceiptDialog = (po) => {
  // Salin data PO ke state receipt, dan set default received_qty sama dengan pesanan agar Admin Gudang lebih cepat menginput
  receiptData.value = JSON.parse(JSON.stringify(po))
  receiptData.value.items.forEach(item => {
    item.received_qty = item.received_qty === 0 ? item.qty : item.received_qty
  })
  receiptDialog.value = true
}

// --- FASE 3: EKSEKUSI PENERIMAAN (TAMBAH STOK & KALKULASI HPP) ---
const saveReceipt = async () => {
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const batch = writeBatch(db)
    
    let isPartial = false
    let totalActual = 0

    // 1. Loop Item: Eksekusi Update Master Produk
    receiptData.value.items.forEach(item => {
      const recQty = Number(item.received_qty) || 0
      if (recQty < item.qty) isPartial = true // Jika ada yang kurang, statusnya parsial
      
      totalActual += (recQty * item.price)

      if (recQty > 0) {
        const productRef = doc(db, 'tenants', tenantId, 'products', item.product_id)
        const currentProduct = productList.value.find(p => p.id === item.product_id)
        const oldStok = currentProduct?.stok || 0
        const oldHpp = currentProduct?.harga_modal || 0

        // Kalkulasi Moving Average (Rata-rata Tertimbang)
        let newHpp = item.price
        if (oldStok + recQty > 0) {
          newHpp = Math.round(((oldStok * oldHpp) + (recQty * item.price)) / (oldStok + recQty))
        }

        // Tembak Data ke Master Produk
        batch.update(productRef, {
          stok: increment(recQty),
          harga_modal: newHpp
        })
      }
    })

    // 2. Eksekusi Update Status Dokumen PO
    const poRef = doc(db, 'tenants', tenantId, 'procurements', receiptData.value.id)
    batch.update(poRef, {
      status: isPartial ? 'Parsial' : 'Selesai',
      items: receiptData.value.items,
      actual_grand_total: totalActual,
      received_at: serverTimestamp(),
      penerima_barang: authState.value?.user?.name || authState.value?.user?.email || 'Admin Gudang'
    })

    await batch.commit()
    receiptDialog.value = false
  } catch (error) {
    console.error(error)
    alert("Gagal melakukan validasi penerimaan.")
  } finally {
    isSaving.value = false
  }
}

// --- FITUR CETAK PDF (Tetap Sama) ---
const printPO = (po) => {
  const doc = new jsPDF()
  doc.setFontSize(22); doc.setTextColor(40, 53, 147); doc.setFont("helvetica", "bold")
  doc.text("PURCHASE ORDER", 14, 22)
  doc.setFontSize(10); doc.setTextColor(100); doc.setFont("helvetica", "normal")
  doc.text("Burayot Simadu (HQ) - Mentadata ERP", 14, 30)
  doc.text("Garut, Jawa Barat", 14, 35)
  doc.setFont("helvetica", "bold"); doc.setTextColor(0)
  doc.text(`No: ${po.po_number}`, 140, 22)
  doc.setFont("helvetica", "normal")
  doc.text(`Tanggal: ${formatWaktu(po.created_at)}`, 140, 28)
  doc.setDrawColor(200); doc.line(14, 42, 196, 42)
  
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(40, 53, 147)
  doc.text("Kepada Yth:", 14, 52)
  doc.setFontSize(12); doc.setTextColor(0); doc.text(po.supplier_name, 14, 60)

  const tableData = po.items.map((item, index) => [
    index + 1, item.product_name, `${item.qty} ${item.unit}`, formatRupiah(item.price), formatRupiah(item.qty * item.price)
  ])

  autoTable(doc, {
    startY: 70, head: [['No', 'Item / Bahan Baku', 'Jumlah Pesan', 'Harga Satuan', 'Subtotal']], body: tableData,
    theme: 'grid', headStyles: { fillColor: [40, 53, 147], textColor: 255 }, styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { cellWidth: 16, halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } }
  })

  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text("EST. GRAND TOTAL:", 110, finalY)
  doc.setTextColor(198, 40, 40); doc.text(formatRupiah(po.grand_total), 196, finalY, { align: 'right' })

  doc.setTextColor(0); doc.setFontSize(10); doc.setFont("helvetica", "normal")
  doc.text("Disetujui Oleh,", 40, finalY + 30, { align: 'center' })
  doc.setFont("helvetica", "bold"); doc.text("( Owner Burayot Simadu )", 40, finalY + 55, { align: 'center' })
  doc.setFont("helvetica", "normal"); doc.text("Pihak Pemasok,", 160, finalY + 30, { align: 'center' })
  doc.setFont("helvetica", "bold"); doc.text(`( ${po.supplier_name} )`, 160, finalY + 55, { align: 'center' })

  doc.save(`${po.po_number}_${po.supplier_name.replace(/\s+/g, '_')}.pdf`)
}

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
const formatWaktu = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}
</script>