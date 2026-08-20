<!-- file: frontend/src/pages/products/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Master Item & Inventori</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Kelola data Bahan Baku, Barang Setengah Jadi, Barang Jadi, Perlengkapan, dan Peralatan.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="teal-darken-3" prepend-icon="mdi-plus" rounded="pill" elevation="2" class="text-none font-weight-bold" @click="openAddDialog">
          Tambah Item Baru
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Daftar Produk -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3" width="60">Ikon</th>
            <th class="text-left font-weight-bold text-blue-grey-darken-3">SKU / Kode</th>
            <th class="text-left font-weight-bold text-blue-grey-darken-3">Nama Item (Satuan)</th>
            <th class="text-left font-weight-bold text-blue-grey-darken-3">Tipe Item</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3">Stok Pusat</th>
            <th class="text-right font-weight-bold text-blue-grey-darken-3">HPP (Modal)</th>
            <th class="text-right font-weight-bold text-blue-grey-darken-3">Harga Jual</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in products" :key="item.id">
            <td>
              <v-avatar color="teal-lighten-5" size="36" rounded>
                <v-icon color="teal-darken-3" size="small">{{ getCategoryIcon(item.category) }}</v-icon>
              </v-avatar>
            </td>
            <td class="text-blue-grey-darken-1 font-weight-medium">{{ item.sku || '-' }}</td>
            <td class="font-weight-bold text-blue-grey-darken-4">
              {{ item.name }} 
              <span v-if="item.unit" class="text-caption text-blue-grey-lighten-1 font-weight-regular ml-1">({{ item.unit }})</span>
            </td>
            <td>
              <v-chip size="x-small" :color="getTypeColor(item.tipe)" variant="flat" class="font-weight-bold text-uppercase px-2">
                {{ item.tipe || 'Barang Jadi' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-chip size="small" color="blue-grey-darken-3" variant="tonal" class="font-weight-bold">
                {{ item.stok || 0 }}
              </v-chip>
            </td>
            <td class="text-right font-weight-bold text-deep-orange-darken-3">
              {{ formatRupiah(item.harga_modal) }}
            </td>
            <!-- Logika Pintar: Tampilkan '-' untuk barang yang dibeli (Bahan Baku, Perlengkapan, Peralatan) -->
            <td class="text-right font-weight-bold" :class="isPurchasedItem(item.tipe) ? 'text-grey-lighten-1' : 'text-teal-darken-3'">
              {{ isPurchasedItem(item.tipe) ? '-' : formatRupiah(item.price) }}
            </td>
            <td class="text-center">
              <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editProduct(item)"></v-btn>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteProduct(item.id)"></v-btn>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="8" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-database-plus-outline</v-icon>
              <p>Database inventori masih kosong. Mulai tambahkan bahan baku atau barang jadi Anda.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- DIALOG FORM (TAMBAH & EDIT) -->
    <v-dialog v-model="dialog" max-width="750px" persistent transition="dialog-bottom-transition">
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-shape-square-plus' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Data Item' : 'Registrasi Item Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveProduct">
            <v-row>
              <v-col cols="12" md="4">
                <!-- Penambahan Perlengkapan & Peralatan -->
                <v-select v-model="form.tipe" :items="['Bahan Baku', 'Barang Setengah Jadi', 'Barang Jadi', 'Perlengkapan', 'Peralatan']" label="Tipe Item" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-combobox v-model="form.category" :items="categoriesList" label="Kategori (Pilih/Ketik Baru)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto" clearable></v-combobox>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.sku" label="SKU / Kode (Opsional)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"></v-text-field>
              </v-col>
              
              <v-col cols="12" md="8">
                <v-text-field v-model="form.name" label="Nama Item Lengkap" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-combobox v-model="form.unit" :items="unitsList" label="Satuan (Kg, Pcs, dll)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto" clearable></v-combobox>
              </v-col>

              <v-col cols="12">
                <v-divider class="mb-2 mt-1"></v-divider>
                <div class="text-caption font-weight-bold text-blue-grey-darken-1 mb-3">INFORMASI HARGA KEUANGAN</div>
              </v-col>

              <v-col cols="12" :sm="isPurchasedItem(form.tipe) ? 12 : 4">
                <v-text-field 
                  v-model.number="form.harga_modal" 
                  :label="isPurchasedItem(form.tipe) ? 'HPP (Otomatis Dihitung dari PO)' : 'Harga Modal / HPP'" 
                  prefix="Rp" type="number" 
                  variant="outlined" density="comfortable" color="blue-grey" hide-details="auto"
                  :readonly="isPurchasedItem(form.tipe)"
                  :class="isPurchasedItem(form.tipe) ? 'bg-grey-lighten-4 text-grey-darken-2' : ''"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="4" v-if="!isPurchasedItem(form.tipe)">
                <v-text-field v-model.number="form.harga_mitra" label="Harga Mitra (Grosir)" prefix="Rp" type="number" variant="outlined" density="comfortable" color="indigo" hide-details="auto"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" v-if="!isPurchasedItem(form.tipe)">
                <v-text-field v-model.number="form.price" label="Harga Jual Umum (POS)" prefix="Rp" type="number" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="closeDialog">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveProduct" :loading="isSaving">
            Simpan ke Database
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { authState } from '../../store/auth'

const products = ref([])
const categoriesList = ref([])
const unitsList = ref([])
const dialog = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const form = ref({
  sku: '', name: '', category: '', unit: '', tipe: 'Bahan Baku', harga_modal: 0, harga_mitra: 0, price: 0
})

// Fungsi Helper untuk mengidentifikasi apakah barang didapat dari PO (tidak dijual)
const isPurchasedItem = (tipe) => {
  return ['Bahan Baku', 'Perlengkapan', 'Peralatan'].includes(tipe)
}

onMounted(() => {
  const tenantId = authState.value.tenantId

  const productsRef = collection(db, 'tenants', tenantId, 'products')
  onSnapshot(productsRef, (snapshot) => {
    products.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })

  const categoriesRef = collection(db, 'tenants', tenantId, 'categories')
  onSnapshot(categoriesRef, (snapshot) => {
    categoriesList.value = snapshot.docs.map(doc => doc.data().nama_kategori)
  })

  const unitsRef = collection(db, 'tenants', tenantId, 'units')
  onSnapshot(unitsRef, (snapshot) => {
    unitsList.value = snapshot.docs.map(doc => doc.data().nama_satuan)
  })
})

const getCategoryIcon = (category) => {
  if (category === 'Minuman') return 'mdi-cup-water'
  if (category === 'Makanan Ringan') return 'mdi-food-apple'
  if (category === 'Bahan Pokok') return 'mdi-sack'
  return 'mdi-package-variant-closed'
}

const getTypeColor = (tipe) => {
  if (tipe === 'Bahan Baku') return 'brown-darken-1'
  if (tipe === 'Barang Setengah Jadi') return 'blue-darken-2'
  if (tipe === 'Perlengkapan') return 'orange-darken-3'
  if (tipe === 'Peralatan') return 'deep-purple-darken-2'
  return 'teal-darken-3' // Barang Jadi
}

const openAddDialog = () => {
  isEditing.value = false
  editId.value = null
  form.value = { sku: '', name: '', category: '', unit: '', tipe: 'Bahan Baku', harga_modal: 0, harga_mitra: 0, price: 0 }
  dialog.value = true
}

const editProduct = (item) => {
  isEditing.value = true
  editId.value = item.id
  form.value = { 
    sku: item.sku || '', name: item.name, category: item.category || '', unit: item.unit || '', 
    tipe: item.tipe || 'Barang Jadi', 
    harga_modal: item.harga_modal || 0, 
    harga_mitra: item.harga_mitra || 0, price: item.price || 0
  }
  dialog.value = true
}

const closeDialog = () => dialog.value = false

const saveProduct = async () => {
  if (!form.value.name) return alert('Nama Item wajib diisi!')
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId

    if (form.value.category && !categoriesList.value.includes(form.value.category)) {
      await addDoc(collection(db, 'tenants', tenantId, 'categories'), { nama_kategori: form.value.category, created_at: serverTimestamp() })
    }
    if (form.value.unit && !unitsList.value.includes(form.value.unit)) {
      await addDoc(collection(db, 'tenants', tenantId, 'units'), { nama_satuan: form.value.unit, created_at: serverTimestamp() })
    }

    // Melindungi HPP untuk barang yang dibeli via PO agar tidak tereset saat diedit
    if (isPurchasedItem(form.value.tipe)) {
      form.value.harga_mitra = 0; 
      form.value.price = 0;
      if (!isEditing.value) form.value.harga_modal = 0; 
    }

    const productData = {
      sku: form.value.sku, name: form.value.name, category: form.value.category, unit: form.value.unit, 
      tipe: form.value.tipe, harga_modal: form.value.harga_modal, harga_mitra: form.value.harga_mitra, price: form.value.price
    }

    const productsRef = collection(db, 'tenants', tenantId, 'products')

    if (isEditing.value) {
      await updateDoc(doc(db, 'tenants', tenantId, 'products', editId.value), { ...productData, updated_at: serverTimestamp() })
    } else {
      await addDoc(productsRef, { ...productData, stok: 0, created_at: serverTimestamp() })
    }
    
    closeDialog()
  } catch (error) {
    console.error("Gagal menyimpan item:", error)
    alert('Terjadi kesalahan saat menyimpan item.')
  } finally {
    isSaving.value = false
  }
}

const deleteProduct = async (id) => {
  if (confirm('Yakin ingin menghapus item ini dari gudang?')) {
    try {
      await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'products', id))
    } catch (error) { console.error(error) }
  }
}

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
</script>