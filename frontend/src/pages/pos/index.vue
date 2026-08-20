<!-- file: frontend/src/pages/pos/index.vue -->
<template>
  <div>
    <!-- TATA LETAK UTAMA (PRODUK & KERANJANG) -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-4 h-100 border-sm" rounded="xl" elevation="0" color="white">
          <div class="d-flex align-center mb-6">
            <v-text-field
              prepend-inner-icon="mdi-magnify" placeholder="Cari nama produk atau SKU..."
              variant="solo-filled" flat bg-color="blue-grey-lighten-5" density="comfortable"
              color="teal-darken-2" hide-details rounded="lg" class="mr-3"
            ></v-text-field>
            
            <v-tooltip text="Riwayat Transaksi" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props" color="blue-grey-darken-3" variant="tonal" 
                  icon="mdi-receipt-text-clock" rounded="lg" height="48" width="48"
                  @click="historyDialog = true"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>

          <v-row>
            <v-col cols="6" sm="4" md="4" v-for="product in products" :key="product.id">
              <v-card 
                color="blue-grey-lighten-5" hover flat 
                class="text-center pa-4 cursor-pointer border-sm transition-swing" 
                rounded="xl" @click="addToCart(product)"
              >
                <v-icon size="42" color="teal-lighten-1">{{ product.icon }}</v-icon>
                <div class="mt-3 font-weight-bold text-blue-grey-darken-4 text-body-2 text-md-body-1 line-clamp-1">{{ product.name }}</div>
                <div class="text-teal-darken-3 font-weight-black mt-1 text-caption text-md-body-2">{{ formatRupiah(product.price) }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="d-none d-md-flex">
        <v-card class="pa-5 d-flex flex-column h-100 border-sm" rounded="xl" elevation="0" color="white" width="100%">
          <CartContent 
            :cart="cart" :totalAmount="totalAmount" 
            @remove="removeFromCart" @clear="clearCart" @checkout="openPaymentDialog" 
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- TOMBOL & DIALOG KERANJANG MOBILE -->
    <v-btn
      class="d-md-none position-fixed text-none font-weight-bold"
      color="teal-darken-3" size="x-large" elevation="4" rounded="pill"
      style="bottom: 24px; right: 24px; z-index: 100;"
      @click="mobileCartDialog = true"
    >
      <v-badge color="error" :content="cartTotalItems" :model-value="cartTotalItems > 0">
        <v-icon start>mdi-cart-outline</v-icon>
      </v-badge>
      Lihat Keranjang
    </v-btn>

    <v-dialog v-model="mobileCartDialog" fullscreen transition="dialog-bottom-transition">
      <v-card color="white">
        <v-toolbar color="white" elevation="1">
          <v-btn icon="mdi-close" @click="mobileCartDialog = false"></v-btn>
          <v-toolbar-title class="font-weight-bold text-blue-grey-darken-4">Keranjang Pesanan</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-4 bg-grey-lighten-4 h-100">
          <v-card class="pa-4 h-100 d-flex flex-column border-sm" rounded="xl" elevation="0" color="white">
            <CartContent 
              :cart="cart" :totalAmount="totalAmount" 
              @remove="removeFromCart" @clear="clearCart" @checkout="openPaymentDialog" 
            />
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- DIALOG PEMBAYARAN -->
    <v-dialog v-model="paymentDialog" max-width="450" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="bg-teal-darken-3 text-white pa-4 d-flex align-center">
          <v-icon start>mdi-cash-register</v-icon>
          <span class="font-weight-bold">Proses Pembayaran</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="paymentDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-5">
          <div class="text-center mb-6">
            <div class="text-body-2 text-blue-grey-darken-1 mb-1">Total Tagihan</div>
            <div class="text-h3 font-weight-black text-teal-darken-3">{{ formatRupiah(totalAmount) }}</div>
          </div>
          <v-select v-model="paymentMethod" :items="['Tunai', 'Transfer Bank', 'QRIS']" label="Metode Pembayaran" variant="outlined" density="comfortable" color="teal-darken-3" prepend-inner-icon="mdi-wallet-outline"></v-select>
          <v-expand-transition>
            <div v-if="paymentMethod === 'Tunai'">
              <v-text-field v-model.number="cashGiven" label="Nominal Uang Diterima" prefix="Rp" type="number" variant="outlined" color="teal-darken-3" class="mb-2" hide-details></v-text-field>
              <div class="d-flex gap-2 mb-6 mt-2 overflow-x-auto pb-2">
                <v-btn size="small" variant="tonal" color="teal-darken-3" @click="cashGiven = totalAmount" class="mr-2">Uang Pas</v-btn>
                <v-btn size="small" variant="tonal" color="teal-darken-3" @click="cashGiven = 50000" class="mr-2">50k</v-btn>
                <v-btn size="small" variant="tonal" color="teal-darken-3" @click="cashGiven = 100000">100k</v-btn>
              </div>
              <v-divider class="mb-4"></v-divider>
              <div class="d-flex justify-space-between align-center">
                <span class="text-h6 font-weight-bold text-blue-grey-darken-3">Kembalian:</span>
                <span class="text-h5 font-weight-black" :class="change < 0 ? 'text-error' : 'text-orange-darken-3'">{{ formatRupiah(change) }}</span>
              </div>
            </div>
          </v-expand-transition>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="teal-darken-3" variant="elevated" size="large" rounded="lg" class="px-6 font-weight-bold text-none flex-grow-0 flex-shrink-0" @click="confirmPayment" :disabled="paymentMethod === 'Tunai' && change < 0" :loading="isProcessing">
            Konfirmasi & Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG RIWAYAT TRANSAKSI -->
    <v-dialog v-model="historyDialog" max-width="600" scrollable>
      <v-card rounded="xl" color="white">
        <v-card-title class="bg-blue-grey-darken-4 text-white pa-4 d-flex align-center">
          <v-icon start>mdi-receipt-text-clock</v-icon>
          <span class="font-weight-bold">Riwayat Transaksi Terbaru</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="historyDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-0" style="height: 450px;">
          <v-list lines="two" class="bg-transparent">
            <template v-for="(trx, index) in transactionsHistory" :key="trx.id">
              <!-- MODIFIKASI: Menambahkan event klik untuk membuka detail struk -->
              <v-list-item @click="openReceiptDetail(trx)" class="cursor-pointer" hover>
                <template v-slot:prepend>
                  <v-avatar color="blue-grey-lighten-5" class="mr-3">
                    <v-icon color="teal-darken-2">mdi-check-decagram</v-icon>
                  </v-avatar>
                </template>
                <!-- Menampilkan ID fallback jika nomor struk kosong -->
                <v-list-item-title class="font-weight-bold text-blue-grey-darken-4">{{ trx.nomor_struk || trx.id }}</v-list-item-title>
                <v-list-item-subtitle class="text-blue-grey-darken-1 mt-1">
                  {{ formatWaktu(trx.tanggal_transaksi) }} • {{ trx.metode_pembayaran || 'Tunai' }}
                </v-list-item-subtitle>
                
                <template v-slot:append>
                  <span class="font-weight-bold text-teal-darken-3 text-body-1">{{ formatRupiah(trx.total_tagihan) }}</span>
                </template>
              </v-list-item>
              <v-divider v-if="index < transactionsHistory.length - 1" class="mx-4"></v-divider>
            </template>

            <div v-if="transactionsHistory.length === 0" class="h-100 d-flex flex-column justify-center align-center pa-10 text-center">
              <v-icon size="64" color="blue-grey-lighten-3" class="mb-4">mdi-receipt-outline</v-icon>
              <p class="text-blue-grey-darken-1 font-weight-medium">Belum ada transaksi yang tercatat.</p>
            </div>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- FITUR BARU 4: DIALOG DETAIL STRUK -->
    <v-dialog v-model="receiptDialog" max-width="400">
      <v-card rounded="xl" color="white" v-if="selectedTrx">
        <v-card-title class="bg-blue-grey-lighten-5 text-blue-grey-darken-4 pa-4 d-flex align-center">
          <v-icon start color="teal-darken-3">mdi-receipt</v-icon>
          <span class="font-weight-bold">Detail Transaksi</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="receiptDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="text-center mb-5">
            <h3 class="text-h5 font-weight-black text-blue-grey-darken-4 mb-1">Mentadata ERP</h3>
            <div class="text-body-2 text-blue-grey-darken-1">{{ selectedTrx.nomor_struk || selectedTrx.id }}</div>
            <div class="text-caption text-blue-grey-lighten-1">{{ formatWaktu(selectedTrx.tanggal_transaksi) }}</div>
          </div>
          
          <v-divider class="mb-4" style="border-style: dashed;"></v-divider>
          
          <!-- Looping daftar barang yang dibeli -->
          <div v-for="(item, idx) in selectedTrx.items" :key="idx" class="d-flex justify-space-between mb-3">
            <div>
              <div class="font-weight-bold text-body-2 text-blue-grey-darken-4">{{ item.name }}</div>
              <div class="text-caption text-blue-grey-darken-1">{{ item.qty }} x {{ formatRupiah(item.price) }}</div>
            </div>
            <div class="font-weight-bold text-blue-grey-darken-4">{{ formatRupiah(item.qty * item.price) }}</div>
          </div>
          
          <v-divider class="my-4" style="border-style: dashed;"></v-divider>
          
          <!-- Ringkasan Angka -->
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-blue-grey-darken-1">Total Tagihan:</span>
            <span class="font-weight-bold text-teal-darken-3">{{ formatRupiah(selectedTrx.total_tagihan) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-blue-grey-darken-1">Tunai / Bayar:</span>
            <span class="font-weight-medium">{{ formatRupiah(selectedTrx.uang_diterima || selectedTrx.total_tagihan) }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-body-2 text-blue-grey-darken-1">Kembalian:</span>
            <span class="font-weight-medium">{{ formatRupiah(selectedTrx.kembalian || 0) }}</span>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-grey-lighten-4 justify-center">
          <v-btn color="teal-darken-3" variant="tonal" rounded="pill" prepend-icon="mdi-printer" class="px-6 font-weight-bold" @click="printReceipt">
            Cetak Struk
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" color="teal-darken-3" rounded="pill" elevation="4" timeout="3000">
      <div class="d-flex align-center font-weight-bold">
        <v-icon start>mdi-check-circle</v-icon> Transaksi Berhasil Disimpan!
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CartContent from './CartContent.vue'
import { db } from '../../firebase'
// Tambahkan impor 'where' untuk menyaring data cabang
import { collection, onSnapshot, doc, setDoc, serverTimestamp, query, orderBy, limit, where } from 'firebase/firestore'
import { authState } from '../../store/auth'

const mobileCartDialog = ref(false)
const products = ref([])
const cart = ref([])

const paymentDialog = ref(false)
const paymentMethod = ref('Tunai')
const cashGiven = ref(0)
const snackbar = ref(false)
const isProcessing = ref(false)

const historyDialog = ref(false)
const transactionsHistory = ref([])

const receiptDialog = ref(false)
const selectedTrx = ref(null)

onMounted(() => {
  // 1. TARIK KATALOG PRODUK (KHUSUS BARANG JADI)
  const productsRef = collection(db, 'tenants', authState.value.tenantId, 'products')
  // Menerapkan filter di tingkat database agar kasir hanya menerima data siap jual
  const qProducts = query(productsRef, where('tipe', '==', 'Barang Jadi'))
  
  onSnapshot(qProducts, (snapshot) => {
    products.value = snapshot.docs.map(doc => {
      const data = doc.data()
      let itemIcon = 'mdi-package-variant-closed'
      if (data.category === 'Minuman') itemIcon = 'mdi-cup-water'
      if (data.category === 'Makanan Ringan') itemIcon = 'mdi-food-apple'
      if (data.category === 'Bahan Pokok') itemIcon = 'mdi-sack'
      return { id: doc.id, sku: data.sku, name: data.name, price: data.price, icon: itemIcon }
    })
  })

  // 2. TARIK RIWAYAT TRANSAKSI (DENGAN KACAMATA KUDA CABANG)
  const trxRef = collection(db, 'tenants', authState.value.tenantId, 'pos_transactions')
  let qTrx;
  
  if (authState.value.branchId) {
    // Jika yang login punya ID Cabang (Kasir), hanya tampilkan transaksi cabangnya saja
    qTrx = query(trxRef, where('branch_id', '==', authState.value.branchId), orderBy('tanggal_transaksi', 'desc'), limit(25))
  } else {
    // Jika yang login tidak punya ID Cabang (Owner / Pusat), tampilkan semua
    qTrx = query(trxRef, orderBy('tanggal_transaksi', 'desc'), limit(25))
  }

  onSnapshot(qTrx, (snapshot) => {
    transactionsHistory.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const addToCart = (product) => {
  const existingItem = cart.value.find(item => item.id === product.id)
  if (existingItem) existingItem.qty++
  else cart.value.push({ ...product, qty: 1 })
}
const removeFromCart = (index) => {
  if (cart.value[index].qty > 1) cart.value[index].qty--
  else cart.value.splice(index, 1)
}
const clearCart = () => cart.value = []

const totalAmount = computed(() => cart.value.reduce((total, item) => total + (item.price * item.qty), 0))
const cartTotalItems = computed(() => cart.value.reduce((total, item) => total + item.qty, 0))
const change = computed(() => cashGiven.value - totalAmount.value)

const openPaymentDialog = () => {
  cashGiven.value = totalAmount.value
  paymentMethod.value = 'Tunai'
  paymentDialog.value = true
}

const confirmPayment = async () => {
  isProcessing.value = true
  try {
    const now = new Date()
    const dateStr = now.toISOString().slice(0,10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0,8).replace(/:/g, '')
    const trxId = `TRX-${dateStr}-${timeStr}`
    const trxRef = doc(db, 'tenants', authState.value.tenantId, 'pos_transactions', trxId)
    
    // 3. INJEKSI IDENTITAS CABANG KE DALAM STRUK
    await setDoc(trxRef, {
      nomor_struk: trxId,
      tanggal_transaksi: serverTimestamp(),
      kasir_nama: authState.value.nama,
      branch_id: authState.value.branchId || 'Kantor Pusat', // <--- DNA CABANG DI TANAM DI SINI
      items: cart.value,
      total_tagihan: totalAmount.value,
      metode_pembayaran: paymentMethod.value,
      uang_diterima: paymentMethod.value === 'Tunai' ? cashGiven.value : totalAmount.value,
      kembalian: paymentMethod.value === 'Tunai' ? change.value : 0,
      status: 'Lunas'
    })

    paymentDialog.value = false
    mobileCartDialog.value = false
    snackbar.value = true
    clearCart()
  } catch (error) {
    console.error("Gagal memproses transaksi:", error)
    alert('Terjadi kesalahan jaringan. Gagal menyimpan.')
  } finally {
    isProcessing.value = false
  }
}

const openReceiptDetail = (trx) => {
  selectedTrx.value = trx
  receiptDialog.value = true
}

const printReceipt = () => {
  alert('Fitur ini akan dihubungkan ke printer thermal Bluetooth nanti!')
}

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number)
}
const formatWaktu = (timestamp) => {
  if (!timestamp) return 'Menunggu...'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
</style>