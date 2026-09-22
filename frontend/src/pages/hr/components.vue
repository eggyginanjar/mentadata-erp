<!-- file: frontend/src/pages/hr/components.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <v-row class="mb-6" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Master Komponen Gaji</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Kelola elemen pendapatan dan potongan untuk membentuk struktur gaji dinamis.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          color="teal-darken-3" prepend-icon="mdi-plus-circle-outline" 
          rounded="pill" elevation="2" class="text-none font-weight-bold" 
          @click="openAddDialog"
        >
          Buat Komponen Baru
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Daftar Komponen -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3">Nama Komponen</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Tipe</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Kategori (Sifat Pembayaran)</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Keterangan</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3" style="width: 120px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comp in componentsList" :key="comp.id">
            <td class="font-weight-bold text-blue-grey-darken-4 py-3">
              {{ comp.nama_komponen }}
            </td>
            <td class="text-center">
              <v-chip size="small" :color="comp.tipe === 'Pendapatan' ? 'success' : 'error'" variant="flat" class="font-weight-bold">
                <v-icon start size="x-small">{{ comp.tipe === 'Pendapatan' ? 'mdi-plus-thick' : 'mdi-minus-thick' }}</v-icon>
                {{ comp.tipe }}
              </v-chip>
            </td>
            <td>
              <div class="font-weight-medium text-teal-darken-3">{{ comp.kategori }}</div>
              <div class="text-caption text-grey-darken-1 mt-1">{{ getKategoriDescription(comp.kategori) }}</div>
            </td>
            <td class="text-body-2 text-blue-grey-darken-1">{{ comp.keterangan || '-' }}</td>
            <td class="text-center">
              <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editComponent(comp)"></v-btn>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteComponent(comp.id)"></v-btn>
            </td>
          </tr>
          <tr v-if="componentsList.length === 0">
            <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-shape-plus-outline</v-icon>
              <p>Belum ada komponen gaji yang didaftarkan.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Form (Tambah & Edit) -->
    <v-dialog v-model="dialog" max-width="600px" persistent scrollable>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>{{ isEditing ? 'mdi-pencil-box-outline' : 'mdi-plus-box-outline' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Komponen Gaji' : 'Buat Komponen Gaji Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 bg-grey-lighten-4">
          <v-form @submit.prevent="saveComponent">
            <v-card class="pa-5 mb-4 border-sm" elevation="0" rounded="lg" color="white">
              <v-text-field 
                v-model="form.nama_komponen" label="Nama Komponen (Misal: Tunjangan Jabatan)" 
                variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4" hide-details="auto" bg-color="white"
              ></v-text-field>

              <v-radio-group v-model="form.tipe" inline hide-details class="mb-4">
                <template v-slot:label><div class="font-weight-bold text-blue-grey-darken-3 mb-1">Tipe Komponen</div></template>
                <v-radio label="Pendapatan (+)" value="Pendapatan" color="success"></v-radio>
                <v-radio label="Potongan (-)" value="Potongan" color="error"></v-radio>
              </v-radio-group>

              <v-select
                v-model="form.kategori"
                :items="kategoriOptions"
                label="Kategori / Sifat Pembayaran"
                variant="outlined" density="comfortable" color="teal-darken-3" bg-color="white"
                hint="Sangat penting untuk menentukan cara sistem menghitung komponen ini." persistent-hint
              ></v-select>
            </v-card>

            <v-card class="pa-5 border-sm" elevation="0" rounded="lg" color="white">
              <v-textarea
                v-model="form.keterangan" label="Catatan / Keterangan (Opsional)"
                variant="outlined" density="comfortable" color="teal-darken-3" rows="2" hide-details bg-color="white"
              ></v-textarea>
            </v-card>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-white border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold text-none px-4" @click="closeDialog">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveComponent" :loading="isSaving">
            Simpan Komponen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { authState } from '../../store/auth'

const dialog = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const componentsList = ref([])

const form = ref({ 
  nama_komponen: '', 
  tipe: 'Pendapatan', 
  kategori: 'Tunjangan Tetap',
  keterangan: '' 
})

// Opsi Kategori dinamis bergantung pada tipe yang dipilih (Pendapatan / Potongan)
const kategoriOptions = computed(() => {
  if (form.value.tipe === 'Pendapatan') {
    return ['Tunjangan Tetap', 'Tunjangan Tidak Tetap (Berdasarkan Kehadiran)', 'Non-Upah (Bonus/THR)']
  } else {
    return ['Potongan Kehadiran / Keterlambatan', 'Potongan Kasbon / Pinjaman', 'Potongan Lainnya']
  }
})

// Penjelasan visual untuk HRD mengenai masing-masing kategori
const getKategoriDescription = (kat) => {
  const dict = {
    'Tunjangan Tetap': 'Diberikan penuh (100%) setiap bulan, tidak dipengaruhi kehadiran.',
    'Tunjangan Tidak Tetap (Berdasarkan Kehadiran)': 'Nilai dikalikan dengan jumlah hari kerja aktual (Misal: Uang Makan/Transport).',
    'Non-Upah (Bonus/THR)': 'Pendapatan ekstra di luar upah rutin.',
    'Potongan Kehadiran / Keterlambatan': 'Otomatis dihitung mesin absen (belum tersedia untuk manual).',
    'Potongan Kasbon / Pinjaman': 'Pemotongan tagihan/hutang karyawan.',
    'Potongan Lainnya': 'Potongan kustom.'
  }
  return dict[kat] || ''
}

onMounted(() => {
  const tenantId = authState.value.tenantId
  const compRef = collection(db, 'tenants', tenantId, 'master_payroll_components')
  
  onSnapshot(compRef, (snapshot) => {
    const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // Urutkan Pendapatan di atas, Potongan di bawah
    componentsList.value = loaded.sort((a, b) => b.tipe.localeCompare(a.tipe))
  })
})

const openAddDialog = () => {
  isEditing.value = false
  editId.value = null
  form.value = { nama_komponen: '', tipe: 'Pendapatan', kategori: 'Tunjangan Tetap', keterangan: '' }
  dialog.value = true
}

const editComponent = (comp) => {
  isEditing.value = true
  editId.value = comp.id
  form.value = { ...comp }
  dialog.value = true
}

const closeDialog = () => dialog.value = false

const saveComponent = async () => {
  if (!form.value.nama_komponen || !form.value.kategori) {
    alert('Nama Komponen dan Kategori wajib diisi!')
    return
  }

  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const dataPayload = {
      nama_komponen: form.value.nama_komponen,
      tipe: form.value.tipe,
      kategori: form.value.kategori,
      keterangan: form.value.keterangan,
      updated_at: serverTimestamp()
    }

    if (isEditing.value) {
      await updateDoc(doc(db, 'tenants', tenantId, 'master_payroll_components', editId.value), dataPayload)
    } else {
      dataPayload.created_at = serverTimestamp()
      await addDoc(collection(db, 'tenants', tenantId, 'master_payroll_components'), dataPayload)
    }
    
    closeDialog()
  } catch (error) {
    console.error("Gagal menyimpan komponen:", error)
    alert("Terjadi kesalahan jaringan.")
  } finally {
    isSaving.value = false
  }
}

const deleteComponent = async (id) => {
  if (confirm('Yakin ingin menghapus komponen ini? Komponen yang sudah terpasang di profil karyawan mungkin akan terpengaruh.')) {
    try {
      await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'master_payroll_components', id))
    } catch (error) {
      alert("Terjadi kesalahan.")
    }
  }
}
</script>