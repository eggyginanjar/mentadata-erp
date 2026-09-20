<!-- file: frontend/src/pages/hr/shifts.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <v-row class="mb-6" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Master Shift & Jam Kerja</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Kelola template jadwal masuk, pulang, dan batas toleransi keterlambatan.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          color="teal-darken-3" prepend-icon="mdi-clock-plus-outline" 
          rounded="pill" elevation="2" class="text-none font-weight-bold" 
          @click="openAddDialog"
        >
          Buat Template Shift
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Daftar Shift -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3">Nama Shift</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Jam Kerja</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Toleransi Telat</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Lintas Hari (Malam)</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3" style="width: 120px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shift in shiftsList" :key="shift.id">
            <td class="font-weight-bold text-teal-darken-3 text-subtitle-2">
              <v-icon start size="small" color="teal-lighten-2">mdi-briefcase-clock</v-icon>
              {{ shift.nama_shift }}
            </td>
            <td class="text-center">
              <div class="font-weight-bold text-blue-grey-darken-4">
                {{ shift.jam_masuk }} <span class="text-grey mx-1">s/d</span> {{ shift.jam_pulang }}
              </div>
            </td>
            <td class="text-center">
              <v-chip size="small" color="orange-darken-3" variant="tonal" class="font-weight-bold">
                {{ shift.toleransi }} Menit
              </v-chip>
            </td>
            <td class="text-center">
              <v-chip size="small" :color="shift.lintas_hari ? 'indigo-darken-2' : 'blue-grey-lighten-2'" :variant="shift.lintas_hari ? 'flat' : 'outlined'" class="font-weight-bold">
                <v-icon start size="x-small" v-if="shift.lintas_hari">mdi-moon-waning-crescent</v-icon>
                {{ shift.lintas_hari ? 'Ya (Shift Malam)' : 'Tidak' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editShift(shift)"></v-btn>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteShift(shift.id)"></v-btn>
            </td>
          </tr>
          <tr v-if="shiftsList.length === 0">
            <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-calendar-clock-outline</v-icon>
              <p>Belum ada template shift. Buat jadwal pertama Anda!</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Form (Tambah & Edit) -->
    <v-dialog v-model="dialog" max-width="550px" persistent scrollable>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>{{ isEditing ? 'mdi-clock-edit-outline' : 'mdi-clock-plus-outline' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Template Shift' : 'Buat Template Shift Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveShift">
            <v-text-field 
              v-model="form.nama_shift" label="Nama Shift (Misal: Pagi, Malam, Part-Time)" 
              variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4" hide-details="auto"
            ></v-text-field>

            <v-row>
              <v-col cols="6">
                <v-text-field 
                  v-model="form.jam_masuk" label="Jam Masuk" type="time"
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field 
                  v-model="form.jam_pulang" label="Jam Pulang" type="time"
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field 
              v-model.number="form.toleransi" label="Toleransi Keterlambatan (Menit)" type="number"
              variant="outlined" density="comfortable" color="teal-darken-3" class="mt-4 mb-4" 
              hint="Karyawan tidak akan tercatat terlambat jika absen di dalam rentang waktu toleransi ini." persistent-hint
            ></v-text-field>

            <v-card variant="tonal" color="indigo-darken-3" class="pa-4 border" rounded="lg">
              <v-switch 
                v-model="form.lintas_hari" 
                label="Jadwal Lintas Hari (Shift Malam)" 
                color="indigo-darken-3" hide-details density="compact" class="font-weight-bold"
              ></v-switch>
              <div class="text-caption mt-1">
                Aktifkan opsi ini jika jam pulang melewati batas tengah malam (contoh: Masuk 22:00, Pulang 06:00 pagi keesokan harinya) agar sistem kalkulasi tanggal tidak bermasalah.
              </div>
            </v-card>

          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold text-none px-4" @click="closeDialog">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveShift" :loading="isSaving">
            Simpan Jadwal
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

const dialog = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const shiftsList = ref([])

const form = ref({ 
  nama_shift: '', 
  jam_masuk: '08:00', 
  jam_pulang: '16:00', 
  toleransi: 15, 
  lintas_hari: false 
})

onMounted(() => {
  const tenantId = authState.value.tenantId
  const shiftsRef = collection(db, 'tenants', tenantId, 'master_shifts')
  
  onSnapshot(shiftsRef, (snapshot) => {
    // Urutkan otomatis berdasarkan jam masuk agar rapi
    const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    shiftsList.value = loaded.sort((a, b) => a.jam_masuk.localeCompare(b.jam_masuk))
  })
})

const openAddDialog = () => {
  isEditing.value = false
  editId.value = null
  form.value = { nama_shift: '', jam_masuk: '08:00', jam_pulang: '16:00', toleransi: 15, lintas_hari: false }
  dialog.value = true
}

const editShift = (shift) => {
  isEditing.value = true
  editId.value = shift.id
  form.value = { ...shift }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const saveShift = async () => {
  if (!form.value.nama_shift || !form.value.jam_masuk || !form.value.jam_pulang) {
    alert('Nama shift, jam masuk, dan jam pulang wajib diisi!')
    return
  }

  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const shiftData = {
      nama_shift: form.value.nama_shift,
      jam_masuk: form.value.jam_masuk,
      jam_pulang: form.value.jam_pulang,
      toleransi: Number(form.value.toleransi),
      lintas_hari: form.value.lintas_hari,
      updated_at: serverTimestamp()
    }

    if (isEditing.value) {
      await updateDoc(doc(db, 'tenants', tenantId, 'master_shifts', editId.value), shiftData)
    } else {
      shiftData.created_at = serverTimestamp()
      await addDoc(collection(db, 'tenants', tenantId, 'master_shifts'), shiftData)
    }
    
    closeDialog()
  } catch (error) {
    console.error("Gagal menyimpan shift:", error)
    alert("Terjadi kesalahan jaringan.")
  } finally {
    isSaving.value = false
  }
}

const deleteShift = async (id) => {
  if (confirm('Yakin ingin menghapus template shift ini? Karyawan yang menggunakan shift ini harus diperbarui manual.')) {
    try {
      await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'master_shifts', id))
    } catch (error) {
      console.error("Gagal menghapus:", error)
      alert("Terjadi kesalahan.")
    }
  }
}
</script>