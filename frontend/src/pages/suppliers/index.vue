<!-- file: frontend/src/pages/suppliers/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Master Pemasok (Supplier)</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Buku kontak resmi mitra penyedia bahan baku dan operasional.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          color="teal-darken-3" prepend-icon="mdi-store-plus" 
          rounded="pill" elevation="2" class="text-none font-weight-bold"
          @click="openAddDialog"
        >
          Tambah Pemasok Baru
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Daftar Pemasok -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3">Nama Toko / Perusahaan</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Kontak Person</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Nomor Telepon/WA</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Alamat Lengkap</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in suppliers" :key="item.id">
            <td class="font-weight-bold text-blue-grey-darken-4">
              <v-icon start color="blue-grey-lighten-2" size="small">mdi-storefront-outline</v-icon>
              {{ item.nama_toko }}
            </td>
            <td class="text-blue-grey-darken-1">{{ item.kontak_person || '-' }}</td>
            <td>
              <v-chip size="small" color="success" variant="tonal" class="font-weight-medium" v-if="item.telepon">
                <v-icon start size="x-small">mdi-whatsapp</v-icon> {{ item.telepon }}
              </v-chip>
              <span v-else class="text-grey">-</span>
            </td>
            <td class="text-blue-grey-darken-1 text-caption">{{ item.alamat || 'Tidak ada alamat' }}</td>
            <td class="text-center">
              <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editSupplier(item)"></v-btn>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteSupplier(item.id)"></v-btn>
            </td>
          </tr>
          <tr v-if="suppliers.length === 0">
            <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-contacts-outline</v-icon>
              <p>Buku kontak pemasok masih kosong. Mulai daftarkan mitra bisnis Anda.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Form (Tambah & Edit) -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>{{ isEditing ? 'mdi-store-edit' : 'mdi-store-plus' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Data Pemasok' : 'Registrasi Pemasok Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveSupplier">
            <v-row>
              <v-col cols="12">
                <v-text-field 
                  v-model="form.nama_toko" label="Nama Toko / Perusahaan Pemasok" 
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                  placeholder="Misal: CV. Sembako Makmur / Toko Plastik Jaya"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field 
                  v-model="form.kontak_person" label="Nama Kontak Person (PIC)" 
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                  placeholder="Misal: Pak Budi"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field 
                  v-model="form.telepon" label="Nomor Telepon / WhatsApp" type="tel"
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                  placeholder="08123456789"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea 
                  v-model="form.alamat" label="Alamat Lengkap" 
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                  rows="2" auto-grow
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="closeDialog">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveSupplier" :loading="isSaving">
            Simpan Kontak
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

const suppliers = ref([])
const dialog = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const form = ref({
  nama_toko: '',
  kontak_person: '',
  telepon: '',
  alamat: ''
})

onMounted(() => {
  const tenantId = authState.value.tenantId
  const supplierRef = collection(db, 'tenants', tenantId, 'suppliers')
  onSnapshot(supplierRef, (snapshot) => {
    suppliers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const openAddDialog = () => {
  isEditing.value = false
  editId.value = null
  form.value = { nama_toko: '', kontak_person: '', telepon: '', alamat: '' }
  dialog.value = true
}

const editSupplier = (item) => {
  isEditing.value = true
  editId.value = item.id
  form.value = { 
    nama_toko: item.nama_toko, 
    kontak_person: item.kontak_person || '', 
    telepon: item.telepon || '', 
    alamat: item.alamat || ''
  }
  dialog.value = true
}

const closeDialog = () => dialog.value = false

const saveSupplier = async () => {
  if (!form.value.nama_toko) return alert('Nama Toko Pemasok wajib diisi!')

  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const supplierRef = collection(db, 'tenants', tenantId, 'suppliers')
    
    if (isEditing.value) {
      const docRef = doc(db, 'tenants', tenantId, 'suppliers', editId.value)
      await updateDoc(docRef, { ...form.value, updated_at: serverTimestamp() })
    } else {
      await addDoc(supplierRef, { ...form.value, created_at: serverTimestamp() })
    }
    
    closeDialog()
  } catch (error) {
    console.error("Gagal menyimpan pemasok:", error)
    alert('Terjadi kesalahan sistem saat menyimpan.')
  } finally {
    isSaving.value = false
  }
}

const deleteSupplier = async (id) => {
  if (confirm('Yakin ingin menghapus pemasok ini dari daftar kontak?')) {
    try {
      const docRef = doc(db, 'tenants', authState.value.tenantId, 'suppliers', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(error)
    }
  }
}
</script>