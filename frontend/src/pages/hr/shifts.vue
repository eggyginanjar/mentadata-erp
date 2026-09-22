<!-- file: frontend/src/pages/hr/shifts.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <v-row class="mb-6" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Manajemen Jadwal & Shift</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Kelola template jam kerja dasar dan rangkai menjadi pola rotasi shift otomatis.</p>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="xl" class="border-sm bg-white overflow-hidden">
      <!-- Navigasi Tabs -->
      <v-tabs v-model="tab" color="teal-darken-3" bg-color="blue-grey-lighten-5">
        <v-tab value="master" class="font-weight-bold text-none"><v-icon start>mdi-clock-outline</v-icon> 1. Master Shift Dasar</v-tab>
        <v-tab value="patterns" class="font-weight-bold text-none"><v-icon start>mdi-calendar-sync</v-icon> 2. Pola Rotasi (Roster)</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- ======================================================= -->
        <!-- TAB 1: MASTER SHIFT                                     -->
        <!-- ======================================================= -->
        <v-window-item value="master">
          <div class="pa-4 d-flex justify-end bg-white">
            <v-btn color="teal-darken-3" prepend-icon="mdi-clock-plus-outline" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openAddDialog">
              Buat Template Shift Dasar
            </v-btn>
          </div>
          <v-divider></v-divider>
          
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
                  <v-icon start size="small" color="teal-lighten-2">mdi-briefcase-clock</v-icon> {{ shift.nama_shift }}
                </td>
                <td class="text-center"><div class="font-weight-bold text-blue-grey-darken-4">{{ shift.jam_masuk }} <span class="text-grey mx-1">s/d</span> {{ shift.jam_pulang }}</div></td>
                <td class="text-center"><v-chip size="small" color="orange-darken-3" variant="tonal" class="font-weight-bold">{{ shift.toleransi }} Menit</v-chip></td>
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
                  <v-icon size="48" class="mb-2">mdi-calendar-clock-outline</v-icon><p>Belum ada template shift. Buat jadwal pertama Anda!</p>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- ======================================================= -->
        <!-- TAB 2: POLA ROTASI (ROSTER)                             -->
        <!-- ======================================================= -->
        <v-window-item value="patterns">
          <div class="pa-4 d-flex justify-end bg-white">
            <v-btn color="indigo-darken-3" prepend-icon="mdi-calendar-plus" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openPatternDialog">
              Rakit Pola Rotasi Baru
            </v-btn>
          </div>
          <v-divider></v-divider>

          <v-table hover class="bg-white">
            <thead class="bg-blue-grey-lighten-5">
              <tr>
                <th class="font-weight-bold text-blue-grey-darken-3">Nama Pola (Roster)</th>
                <th class="font-weight-bold text-blue-grey-darken-3 text-center">Durasi Siklus</th>
                <th class="font-weight-bold text-blue-grey-darken-3">Pratinjau Siklus</th>
                <th class="text-center font-weight-bold text-blue-grey-darken-3" style="width: 120px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pattern in patternsList" :key="pattern.id">
                <td class="font-weight-bold text-indigo-darken-3 text-subtitle-2">
                  <v-icon start size="small" color="indigo-lighten-2">mdi-rotate-3d-variant</v-icon> {{ pattern.nama_pola }}
                </td>
                <td class="text-center font-weight-bold text-blue-grey-darken-4">
                  {{ pattern.siklus_hari }} Hari / Loop
                </td>
                <td>
                  <!-- Pratinjau Cepat Hari 1-3 -->
                  <div class="d-flex flex-wrap gap-1 py-2">
                    <v-chip v-for="day in pattern.jadwal_harian.slice(0, 5)" :key="day.hari_ke" size="x-small" :color="day.is_libur ? 'red-lighten-1' : 'teal-darken-1'" variant="flat" class="mr-1 mb-1 font-weight-bold">
                      H{{ day.hari_ke }}: {{ day.is_libur ? 'OFF' : getShiftCode(day.shift_id) }}
                    </v-chip>
                    <v-chip v-if="pattern.jadwal_harian.length > 5" size="x-small" color="grey" variant="outlined" class="mb-1">
                      +{{ pattern.jadwal_harian.length - 5 }} hari...
                    </v-chip>
                  </div>
                </td>
                <td class="text-center">
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editPattern(pattern)"></v-btn>
                  <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deletePattern(pattern.id)"></v-btn>
                </td>
              </tr>
              <tr v-if="patternsList.length === 0">
                <td colspan="4" class="text-center pa-8 text-blue-grey-lighten-2">
                  <v-icon size="48" class="mb-2">mdi-table-sync</v-icon><p>Belum ada pola rotasi. Klik 'Rakit Pola Rotasi Baru' untuk memulai.</p>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- ======================================================= -->
    <!-- DIALOG: MASTER SHIFT                                    -->
    <!-- ======================================================= -->
    <v-dialog v-model="dialog" max-width="550px" persistent scrollable>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>{{ isEditing ? 'mdi-clock-edit-outline' : 'mdi-clock-plus-outline' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Template Shift' : 'Buat Template Shift Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <!-- AUDITOR SHIFT -->
          <div class="mb-4" v-if="shiftAuditor.length > 0">
            <v-alert v-for="(warn, idx) in shiftAuditor" :key="idx" :type="warn.type" variant="tonal" density="compact" class="mb-2 text-caption font-weight-medium">
              {{ warn.text }}
            </v-alert>
          </div>

          <v-form @submit.prevent="saveShift">
            <v-text-field v-model="form.nama_shift" label="Nama Shift (Misal: Pagi, Malam, Part-Time)" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4" hide-details="auto"></v-text-field>
            <v-row>
              <v-col cols="6"><v-text-field v-model="form.jam_masuk" label="Jam Masuk" type="time" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="form.jam_pulang" label="Jam Pulang" type="time" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"></v-text-field></v-col>
            </v-row>
            <v-text-field v-model.number="form.toleransi" label="Toleransi Keterlambatan (Menit)" type="number" variant="outlined" density="comfortable" color="teal-darken-3" class="mt-4 mb-4" hint="Karyawan tidak akan tercatat terlambat jika absen di dalam rentang waktu toleransi ini." persistent-hint></v-text-field>
            <v-card variant="tonal" color="indigo-darken-3" class="pa-4 border" rounded="lg">
              <v-switch v-model="form.lintas_hari" label="Jadwal Lintas Hari (Shift Malam)" color="indigo-darken-3" hide-details density="compact" class="font-weight-bold"></v-switch>
              <div class="text-caption mt-1">Aktifkan opsi ini jika jam pulang melewati batas tengah malam agar sistem kalkulasi tanggal tidak bermasalah.</div>
            </v-card>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold text-none px-4" @click="closeDialog">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveShift" :loading="isSaving">Simpan Jadwal</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ======================================================= -->
    <!-- DIALOG: POLA ROTASI / ROSTER BUILDER                    -->
    <!-- ======================================================= -->
    <v-dialog v-model="patternDialog" max-width="800px" persistent scrollable>
      <v-card rounded="xl" color="white" max-height="90vh" class="d-flex flex-column">
        <v-card-title class="pa-5 bg-indigo-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>{{ isEditingPattern ? 'mdi-table-edit' : 'mdi-calendar-sync' }}</v-icon>
          <span class="font-weight-bold">{{ isEditingPattern ? 'Edit Pola Rotasi' : 'Rakit Pola Rotasi (Roster) Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closePatternDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 bg-grey-lighten-4 flex-grow-1 overflow-y-auto">
          <v-form @submit.prevent="savePattern">
            <v-card class="pa-4 mb-4 border-sm" elevation="0" color="white">
              <v-row dense>
                <v-col cols="12" md="8">
                  <v-text-field 
                    v-model="patternForm.nama_pola" label="Nama Pola Rotasi (Misal: Rotasi Satpam 14 Hari)" 
                    variant="outlined" density="comfortable" color="indigo-darken-3" hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field 
                    v-model.number="patternForm.siklus_hari" label="Durasi Siklus (Hari)" type="number" min="2" max="31"
                    variant="outlined" density="comfortable" color="indigo-darken-3" hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <div class="text-caption mt-2 text-grey-darken-1 font-italic">
                *Ubah durasi siklus untuk menambah atau mengurangi baris jadwal harian di bawah.
              </div>
            </v-card>

            <!-- AUDITOR POLA ROTASI -->
            <div class="mb-4" v-if="patternAuditor.length > 0">
              <v-alert v-for="(warn, idx) in patternAuditor" :key="idx" :type="warn.type" variant="tonal" density="compact" class="mb-2 text-caption font-weight-medium">
                {{ warn.text }}
              </v-alert>
            </div>

            <!-- BUILDER JADWAL HARIAN -->
            <div class="font-weight-bold text-indigo-darken-3 mb-2 d-flex align-center">
              <v-icon start size="small">mdi-calendar-range</v-icon> Susunan Jadwal Per Hari
            </div>
            <v-card class="border-sm" elevation="0" color="white">
              <v-table density="compact">
                <thead class="bg-blue-grey-lighten-5">
                  <tr>
                    <th class="font-weight-bold" style="width: 80px;">Hari Ke-</th>
                    <th class="font-weight-bold" style="width: 120px;">Status Kerja</th>
                    <th class="font-weight-bold">Pilih Shift Masuk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(day, index) in patternForm.jadwal_harian" :key="index" :class="day.is_libur ? 'bg-red-lighten-5' : ''">
                    <td class="font-weight-bold text-center">Hari {{ day.hari_ke }}</td>
                    <td>
                      <v-switch 
                        v-model="day.is_libur" 
                        :label="day.is_libur ? 'LIBUR' : 'KERJA'" 
                        :color="day.is_libur ? 'red-darken-1' : 'teal-darken-3'" 
                        hide-details density="compact" class="font-weight-bold"
                        @change="handleLiburChange(day)"
                      ></v-switch>
                    </td>
                    <td class="py-2">
                      <v-select
                        v-model="day.shift_id"
                        :items="shiftsList"
                        item-title="nama_shift"
                        item-value="id"
                        placeholder="-- Karyawan Libur --"
                        variant="outlined" density="compact" hide-details bg-color="white"
                        :disabled="day.is_libur"
                      >
                        <template v-slot:item="{ props, item }">
                          <v-list-item v-bind="props" :subtitle="item?.raw ? `${item.raw.jam_masuk} - ${item.raw.jam_pulang}` : ''"></v-list-item>
                        </template>
                      </v-select>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-white border-t flex-shrink-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold text-none px-4" @click="closePatternDialog">Batal</v-btn>
          <v-btn color="indigo-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="savePattern" :loading="isSavingPattern">
            Simpan Pola Rotasi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { authState } from '../../store/auth'

const tab = ref('master')

// ==========================================
// STATE: MASTER SHIFT
// ==========================================
const dialog = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const shiftsList = ref([])

const form = ref({ 
  nama_shift: '', jam_masuk: '08:00', jam_pulang: '16:00', toleransi: 15, lintas_hari: false 
})

// === SMART AUDITOR: MASTER SHIFT ===
const shiftAuditor = computed(() => {
  const warnings = []
  if (!form.value.jam_masuk || !form.value.jam_pulang) return warnings

  const [mH, mM] = form.value.jam_masuk.split(':').map(Number)
  const [pH, pM] = form.value.jam_pulang.split(':').map(Number)

  let masukMin = mH * 60 + mM
  let pulangMin = pH * 60 + pM

  if (form.value.lintas_hari || pulangMin < masukMin) pulangMin += 24 * 60

  const durasiJam = (pulangMin - masukMin) / 60

  // UU Istirahat
  if (durasiJam > 4) {
    warnings.push({ type: 'info', text: `Durasi Shift: ${durasiJam.toFixed(1)} Jam. Sesuai UU, wajib berikan waktu istirahat min. 30 menit (di luar jam kerja) setelah 4 jam bekerja terus-menerus.` })
  }

  // UU Perlindungan Pekerja Malam (Pukul 23:00 - 07:00)
  if (form.value.lintas_hari || mH >= 23 || mH < 7 || pH < 7 || (pH === 7 && pM === 0)) {
    warnings.push({ type: 'warning', text: 'Peringatan UU (Pasal 76): Shift Malam terdeteksi. Dilarang mempekerjakan perempuan hamil/di bawah 18 tahun, serta wajib sedia makan/minum bergizi jika menyentuh 23:00 - 05:00.' })
  }

  return warnings
})

// ==========================================
// STATE: POLA ROTASI (ROSTER)
// ==========================================
const patternDialog = ref(false)
const isSavingPattern = ref(false)
const isEditingPattern = ref(false)
const editPatternId = ref(null)
const patternsList = ref([])

const patternForm = ref({
  nama_pola: '',
  siklus_hari: 7, 
  jadwal_harian: []
})

watch(() => patternForm.value.siklus_hari, (newVal) => {
  if (!newVal || newVal < 1) return;
  const current = [...patternForm.value.jadwal_harian]
  if (newVal > current.length) {
    for (let i = current.length; i < newVal; i++) {
      current.push({ hari_ke: i + 1, shift_id: null, is_libur: false })
    }
  } else if (newVal < current.length) {
    current.length = newVal
  }
  patternForm.value.jadwal_harian = current
}, { immediate: true })

// === SMART AUDITOR: POLA ROTASI MINGGUAN ===
const patternAuditor = computed(() => {
  const warnings = []
  let totalMenitSiklus = 0
  let maxConsecutiveWork = 0
  let currentConsecutive = 0
  let isFullWork = true

  // Loop menghitung total durasi & hari berurutan
  patternForm.value.jadwal_harian.forEach(day => {
    if (day.is_libur) {
      currentConsecutive = 0
      isFullWork = false
    } else {
      currentConsecutive++
      if (currentConsecutive > maxConsecutiveWork) maxConsecutiveWork = currentConsecutive

      if (day.shift_id) {
        const shift = shiftsList.value.find(s => s.id === day.shift_id)
        if (shift) {
          const [mH, mM] = shift.jam_masuk.split(':').map(Number)
          const [pH, pM] = shift.jam_pulang.split(':').map(Number)
          let m = mH * 60 + mM
          let p = pH * 60 + pM
          if (shift.lintas_hari || p < m) p += 24 * 60
          
          // Pengurangan Istirahat Otomatis: Jika kerja > 4 jam, asumsikan potong istirahat 1 jam
          let durasi = p - m
          if (durasi > 4 * 60) durasi -= 60 
          
          totalMenitSiklus += durasi
        }
      }
    }
  })

  // Evaluasi Pelanggaran Hari Libur (Overlap Awal & Akhir Siklus)
  if (isFullWork) {
    warnings.push({ type: 'error', text: `Pelanggaran UU: Siklus tidak memiliki hari libur sama sekali.` })
  } else if (maxConsecutiveWork > 6) {
    warnings.push({ type: 'error', text: `Pelanggaran UU: Ditemukan ${maxConsecutiveWork} hari kerja berturut-turut. Pekerja wajib mendapat istirahat min. 1 hari setelah 6 hari kerja.` })
  } else {
    // Mengecek persilangan antar Loop (Akhir siklus kerja, Awal siklus kerja)
    let startWork = 0; let endWork = 0;
    for(let i=0; i<patternForm.value.jadwal_harian.length; i++) {
      if(!patternForm.value.jadwal_harian[i].is_libur) startWork++; else break;
    }
    for(let i=patternForm.value.jadwal_harian.length-1; i>=0; i--) {
      if(!patternForm.value.jadwal_harian[i].is_libur) endWork++; else break;
    }
    if (startWork + endWork > 6) {
      warnings.push({ type: 'error', text: `Pelanggaran UU: Saat siklus berulang (Looping), karyawan akan bekerja ${startWork + endWork} hari berturut-turut tanpa libur.` })
    }
  }

  // Evaluasi 40 Jam / Minggu
  // Rumus: (Total Jam Siklus / Jumlah Hari Siklus) * 7 Hari
  const avgMenitPerMinggu = (totalMenitSiklus / patternForm.value.siklus_hari) * 7
  const avgJamPerMinggu = avgMenitPerMinggu / 60

  if (avgJamPerMinggu > 40) {
    warnings.push({ type: 'error', text: `Pelanggaran UU (PP 35/2021): Rata-rata kerja ${avgJamPerMinggu.toFixed(1)} jam/minggu (Batas Maksimal 40 Jam/minggu). Kelebihan waktu dihitung sebagai waktu Lembur.` })
  } else if (avgJamPerMinggu > 0) {
    warnings.push({ type: 'success', text: `Kepatuhan Hukum: Rata-rata jam kerja ${avgJamPerMinggu.toFixed(1)} jam/minggu (Sesuai Standar < 40 Jam). Waktu istirahat otomatis dipotong 1 jam/hari.` })
  }

  return warnings
})


onMounted(() => {
  const tenantId = authState.value.tenantId
  
  onSnapshot(collection(db, 'tenants', tenantId, 'master_shifts'), (snapshot) => {
    const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    shiftsList.value = loaded.sort((a, b) => a.jam_masuk.localeCompare(b.jam_masuk))
  })

  onSnapshot(collection(db, 'tenants', tenantId, 'shift_patterns'), (snapshot) => {
    patternsList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

// ==========================================
// FUNGSI: MASTER SHIFT
// ==========================================
const openAddDialog = () => {
  isEditing.value = false; editId.value = null;
  form.value = { nama_shift: '', jam_masuk: '08:00', jam_pulang: '16:00', toleransi: 15, lintas_hari: false }
  dialog.value = true
}

const editShift = (shift) => {
  isEditing.value = true; editId.value = shift.id;
  form.value = { ...shift }
  dialog.value = true
}

const closeDialog = () => dialog.value = false

const saveShift = async () => {
  if (!form.value.nama_shift || !form.value.jam_masuk || !form.value.jam_pulang) {
    alert('Nama shift, jam masuk, dan jam pulang wajib diisi!'); return;
  }
  isSaving.value = true
  try {
    const tenantId = authState.value.tenantId
    const shiftData = {
      nama_shift: form.value.nama_shift, jam_masuk: form.value.jam_masuk, jam_pulang: form.value.jam_pulang,
      toleransi: Number(form.value.toleransi), lintas_hari: form.value.lintas_hari, updated_at: serverTimestamp()
    }
    if (isEditing.value) await updateDoc(doc(db, 'tenants', tenantId, 'master_shifts', editId.value), shiftData)
    else { shiftData.created_at = serverTimestamp(); await addDoc(collection(db, 'tenants', tenantId, 'master_shifts'), shiftData) }
    closeDialog()
  } catch (error) { alert("Terjadi kesalahan."); } finally { isSaving.value = false }
}

const deleteShift = async (id) => {
  if (confirm('Yakin ingin menghapus template shift ini?')) await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'master_shifts', id))
}

// ==========================================
// FUNGSI: POLA ROTASI (ROSTER)
// ==========================================
const openPatternDialog = () => {
  isEditingPattern.value = false; editPatternId.value = null;
  patternForm.value = { 
    nama_pola: '', siklus_hari: 7, 
    jadwal_harian: Array.from({length: 7}, (_, i) => ({ hari_ke: i + 1, shift_id: null, is_libur: false }))
  }
  patternDialog.value = true
}

const editPattern = (pattern) => {
  isEditingPattern.value = true; editPatternId.value = pattern.id;
  patternForm.value = {
    nama_pola: pattern.nama_pola,
    siklus_hari: pattern.siklus_hari,
    jadwal_harian: JSON.parse(JSON.stringify(pattern.jadwal_harian))
  }
  patternDialog.value = true
}

const closePatternDialog = () => patternDialog.value = false

const handleLiburChange = (day) => {
  if (day.is_libur) day.shift_id = null;
}

const savePattern = async () => {
  if (!patternForm.value.nama_pola) return alert('Nama Pola Rotasi wajib diisi!')
  
  const invalidDay = patternForm.value.jadwal_harian.find(d => !d.is_libur && !d.shift_id)
  if (invalidDay) return alert(`Hari ke-${invalidDay.hari_ke} tidak diatur sebagai libur, jadi wajib memilih Shift Masuk!`)

  isSavingPattern.value = true
  try {
    const tenantId = authState.value.tenantId
    const patternData = {
      nama_pola: patternForm.value.nama_pola,
      siklus_hari: Number(patternForm.value.siklus_hari),
      jadwal_harian: patternForm.value.jadwal_harian,
      updated_at: serverTimestamp()
    }
    if (isEditingPattern.value) await updateDoc(doc(db, 'tenants', tenantId, 'shift_patterns', editPatternId.value), patternData)
    else { patternData.created_at = serverTimestamp(); await addDoc(collection(db, 'tenants', tenantId, 'shift_patterns'), patternData) }
    closePatternDialog()
  } catch (error) { alert("Terjadi kesalahan jaringan."); } finally { isSavingPattern.value = false }
}

const deletePattern = async (id) => {
  if (confirm('Yakin ingin menghapus Pola Rotasi ini? Karyawan yang terikat pola ini harus diperbarui manual.')) {
    await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'shift_patterns', id))
  }
} 

const getShiftCode = (shiftId) => {
  if (!shiftId) return '-'
  const shift = shiftsList.value.find(s => s.id === shiftId)
  return shift ? shift.nama_shift.split(' ')[0] : 'Err'
}
</script>