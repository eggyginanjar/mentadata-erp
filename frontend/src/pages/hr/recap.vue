<!-- file: frontend/src/pages/hr/recap.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <div class="mb-6 d-flex align-center justify-space-between">
      <div>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Rekap & Analisa Presensi</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Pantau agregasi kehadiran, ketidakhadiran (absen), lembur, dan input data manual.</p>
      </div>
      <v-btn color="orange-darken-3" prepend-icon="mdi-clipboard-account" rounded="pill" elevation="2" class="text-none font-weight-bold" @click="openManualDialog">
        Input Absen Manual
      </v-btn>
    </div>

    <!-- Panel Filter Rentang Tanggal & Cabang -->
    <v-card class="mb-5 pa-4 border-sm" elevation="0" rounded="xl" color="white">
      <v-row dense align="center">
        <v-col cols="12" md="3">
          <v-text-field v-model="filters.startDate" type="date" label="Tanggal Mulai" variant="outlined" density="comfortable" color="teal-darken-3" hide-details></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="filters.endDate" type="date" label="Tanggal Akhir" variant="outlined" density="comfortable" color="teal-darken-3" hide-details></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.branch"
            :items="[{id: 'all', nama_cabang: 'Semua Cabang'}, ...branchesList]"
            item-title="nama_cabang" item-value="id" label="Filter Cabang"
            variant="outlined" density="comfortable" color="teal-darken-3" hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3" class="d-flex justify-end">
          <v-btn color="teal-darken-3" size="large" rounded="lg" class="text-none font-weight-bold px-6 w-100" prepend-icon="mdi-magnify" :loading="isLoading" @click="generateRecap">
            Tarik Data
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabel Agregasi Karyawan -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3">Karyawan & Cabang</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Target Hari Kerja</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Aktual Hadir</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Absen / Mangkir</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Total Lembur</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center" style="width: 130px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="recap in aggregatedData" :key="recap.user.id">
            <td class="py-3">
              <div class="font-weight-bold text-blue-grey-darken-4">{{ recap.user.nama }}</div>
              <div class="text-caption text-teal-darken-3 font-weight-medium">
                <v-icon start size="x-small">mdi-map-marker-outline</v-icon>{{ getBranchName(recap.user.branch_id) }}
              </div>
            </td>
            <td class="text-center font-weight-bold text-blue-grey-darken-3">{{ recap.targetKerja }} Hari</td>
            <td class="text-center font-weight-bold text-success">{{ recap.aktualHadir }} Hari</td>
            <td class="text-center font-weight-bold text-error">
              <v-chip size="small" :color="recap.absenMangkir > 0 ? 'error' : 'grey-lighten-2'" :variant="recap.absenMangkir > 0 ? 'tonal' : 'flat'">
                {{ recap.absenMangkir }} Hari
              </v-chip>
            </td>
            <td class="text-center font-weight-bold text-orange-darken-3">{{ recap.totalLembur > 0 ? `${recap.totalLembur.toFixed(1)} Jam` : '-' }}</td>
            <td class="text-center">
              <v-btn color="indigo-darken-2" variant="tonal" size="small" class="text-none font-weight-bold" @click="openDetail(recap)">
                Lihat Detail
              </v-btn>
            </td>
          </tr>
          <tr v-if="aggregatedData.length === 0">
            <td colspan="6" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-account-search-outline</v-icon>
              <p>Tarik data untuk melihat agregasi kehadiran karyawan.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Detail Harian Karyawan -->
    <v-dialog v-model="detailDialog" max-width="900px" scrollable>
      <v-card rounded="xl" color="white" v-if="selectedRecap">
        <v-card-title class="pa-4 bg-indigo-darken-3 text-white d-flex align-center">
          <v-icon start>mdi-calendar-multiselect</v-icon>
          <span class="font-weight-bold">Rincian Kehadiran: {{ selectedRecap.user.nama }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="detailDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-table density="comfortable" hover>
            <thead class="bg-grey-lighten-4">
              <tr>
                <th class="font-weight-bold">Tanggal</th>
                <th class="font-weight-bold">Shift Target</th>
                <th class="font-weight-bold">Check-In</th>
                <th class="font-weight-bold">Check-Out</th>
                <th class="font-weight-bold">Lembur</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in selectedRecap.detailLogs" :key="log.id">
                <td class="font-weight-medium">{{ formatDate(log.tanggal) }}</td>
                <td class="text-caption text-grey-darken-1">{{ log.shiftName }}</td>
                <td>
                  <div class="d-flex align-center gap-2">
                    <v-avatar v-if="log.photo_in" size="32" rounded class="cursor-pointer border" @click="viewPhoto(log.photo_in, selectedRecap.user.nama, 'Check-In')">
                      <v-img :src="log.photo_in" cover></v-img>
                    </v-avatar>
                    <v-icon v-else-if="log.is_manual" color="orange-darken-3" size="small" class="mr-1">mdi-hand-pen</v-icon>
                    <div>
                      <div class="font-weight-bold">{{ formatTime(log.check_in) }}</div>
                      <div class="text-caption" :class="log.is_manual ? 'text-orange-darken-3 font-weight-bold' : 'text-success'">{{ log.is_manual ? 'Manual' : `Jarak: ${log.distance_in}m` }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div v-if="log.check_out" class="d-flex align-center gap-2">
                    <v-avatar v-if="log.photo_out" size="32" rounded class="cursor-pointer border" @click="viewPhoto(log.photo_out, selectedRecap.user.nama, 'Check-Out')">
                      <v-img :src="log.photo_out" cover></v-img>
                    </v-avatar>
                    <v-icon v-else-if="log.is_manual" color="orange-darken-3" size="small" class="mr-1">mdi-hand-pen</v-icon>
                    <div>
                      <div class="font-weight-bold">{{ formatTime(log.check_out) }}</div>
                      <div class="text-caption" :class="log.is_manual ? 'text-orange-darken-3 font-weight-bold' : 'text-success'">{{ log.is_manual ? 'Manual' : `Jarak: ${log.distance_out}m` }}</div>
                    </div>
                  </div>
                  <span v-else class="text-caption text-grey font-italic">Belum Pulang</span>
                </td>
                <td class="text-orange-darken-3 font-weight-bold">
                  <!-- Tampilkan nilai lembur jam yang sudah dibulatkan -->
                  {{ log.lemburJam > 0 ? `${log.lemburJam.toFixed(1)} Jam` : '-' }}
                </td>
              </tr>
              <tr v-if="selectedRecap.detailLogs.length === 0">
                <td colspan="5" class="text-center pa-4 text-grey">Tidak ada rekam jejak kehadiran pada periode ini.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog Input Manual -->
    <v-dialog v-model="manualDialog" max-width="500px" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-4 bg-orange-darken-3 text-white d-flex align-center">
          <v-icon start>mdi-clipboard-account</v-icon>
          <span class="font-weight-bold">Input Absen Manual</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="manualDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6 bg-grey-lighten-4">
          <v-form @submit.prevent="saveManual">
            <v-select v-model="manualForm.email" :items="usersList" item-title="nama" item-value="email" label="Pilih Karyawan" variant="outlined" density="comfortable" color="orange-darken-3" bg-color="white" class="mb-3"></v-select>
            <v-text-field v-model="manualForm.tanggal" type="date" label="Tanggal Kehadiran" variant="outlined" density="comfortable" color="orange-darken-3" bg-color="white" class="mb-3"></v-text-field>
            <v-row dense>
              <v-col cols="6"><v-text-field v-model="manualForm.in" type="time" label="Jam Masuk" variant="outlined" density="comfortable" color="orange-darken-3" bg-color="white" class="mb-3"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="manualForm.out" type="time" label="Jam Pulang" variant="outlined" density="comfortable" color="orange-darken-3" bg-color="white" class="mb-3"></v-text-field></v-col>
            </v-row>
            <v-textarea v-model="manualForm.note" label="Keterangan / Alasan Manual" variant="outlined" density="comfortable" color="orange-darken-3" bg-color="white" rows="2" hide-details></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 bg-white border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey-darken-1" class="font-weight-bold text-none" @click="manualDialog = false">Batal</v-btn>
          <v-btn color="orange-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveManual" :loading="isSavingManual">Simpan Kehadiran</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Pratinjau Foto -->
    <v-dialog v-model="photoDialog.show" max-width="400">
      <v-card rounded="xl" class="bg-black">
        <v-card-title class="pa-4 d-flex justify-space-between align-center text-white border-b border-white-10">
          <div class="text-subtitle-1 font-weight-bold">Bukti {{ photoDialog.type }}</div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="photoDialog.show = false"></v-btn>
        </v-card-title>
        <v-img :src="photoDialog.url" max-height="500" cover></v-img>
        <v-card-text class="pa-3 text-center text-white bg-grey-darken-4">
          Karyawan: <b>{{ photoDialog.employee }}</b>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, query, where, orderBy, getDocs, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { authState } from '../../store/auth'

const branchesList = ref([])
const usersList = ref([])
const shiftsList = ref([])
const patternsList = ref([])

const isLoading = ref(false)
const aggregatedData = ref([])
const detailDialog = ref(false)
const selectedRecap = ref(null)

const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
const filters = ref({
  startDate: firstDay.toISOString().split('T')[0],
  endDate: lastDay.toISOString().split('T')[0],
  branch: 'all'
})

const manualDialog = ref(false)
const isSavingManual = ref(false)
const manualForm = ref({ email: '', tanggal: '', in: '08:00', out: '17:00', note: '' })
const photoDialog = ref({ show: false, url: '', employee: '', type: '' })

const parseTime = (isoString) => {
  const d = new Date(isoString)
  return d.getHours() * 60 + d.getMinutes()
}
const parseShiftTime = (timeStr) => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

onMounted(() => {
  const tenantId = authState.value.tenantId
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snap) => { branchesList.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) })
  onSnapshot(collection(db, 'tenants', tenantId, 'users'), (snap) => { usersList.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) })
  onSnapshot(collection(db, 'tenants', tenantId, 'master_shifts'), (snap) => { shiftsList.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) })
  onSnapshot(collection(db, 'tenants', tenantId, 'shift_patterns'), (snap) => { patternsList.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) })
})

// === ENGINE TARGET KERJA ===
const calculateTargetKerja = (startStr, endStr, pattern, anchorStr) => {
  if (!pattern || !anchorStr) return 0
  let count = 0
  let curr = new Date(startStr + 'T00:00:00Z')
  const end = new Date(endStr + 'T00:00:00Z')
  const anchor = new Date(anchorStr + 'T00:00:00Z')
  
  while (curr <= end) {
    const diffTime = curr - anchor
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays >= 0) {
      const dayOfCycle = (diffDays % pattern.siklus_hari) + 1
      const patternDay = pattern.jadwal_harian.find(d => d.hari_ke === dayOfCycle)
      if (patternDay && !patternDay.is_libur) count++
    }
    curr.setDate(curr.getDate() + 1)
  }
  return count
}

const generateRecap = async () => {
  if (!filters.value.startDate || !filters.value.endDate) return alert('Pilih rentang tanggal terlebih dahulu.')
  isLoading.value = true
  aggregatedData.value = []

  try {
    const tenantId = authState.value.tenantId
    const qAtt = query(
      collection(db, 'tenants', tenantId, 'attendance'),
      where('tanggal', '>=', filters.value.startDate),
      where('tanggal', '<=', filters.value.endDate)
    )
    const attSnap = await getDocs(qAtt)
    const rawAttendances = attSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const result = []
    
    for (const user of usersList.value) {
      if (!user.aktif || user.role === 'UMKM Owner') continue
      if (filters.value.branch !== 'all' && user.branch_id !== filters.value.branch) continue

      const userPattern = patternsList.value.find(p => p.id === user.shift_pattern_id)
      const userAtt = rawAttendances.filter(a => a.email === user.email)
      const targetKerja = calculateTargetKerja(filters.value.startDate, filters.value.endDate, userPattern, user.anchor_date)
      
      let aktualHadir = 0
      let totalJamLembur = 0 // Ubah penampung menjadi totalJamLembur
      const detailLogs = []

      userAtt.forEach(att => {
        let lemburMenit = 0 
        let lemburJam = 0   // Penampung lembur jam setelah pembulatan
        let myShift = null
        
        if (att.status === 'Hadir' && att.check_in) {
          aktualHadir++
          
          if (userPattern && user.anchor_date) {
            const tglAtt = new Date(att.tanggal + 'T00:00:00Z')
            const tglAnchor = new Date(user.anchor_date + 'T00:00:00Z')
            const diffDays = Math.floor((tglAtt - tglAnchor) / (1000 * 60 * 60 * 24))
            
            if (diffDays >= 0) {
              const dayOfCycle = (diffDays % userPattern.siklus_hari) + 1
              const patternDay = userPattern.jadwal_harian.find(d => d.hari_ke === (diffDays % userPattern.siklus_hari) + 1)
              if (patternDay && !patternDay.is_libur) myShift = shiftsList.value.find(s => s.id === patternDay.shift_id)
            }
          }

          if (myShift && att.check_out) {
            const actIn = parseTime(att.check_in)
            let actOut = parseTime(att.check_out)
            
            const shIn = parseShiftTime(myShift.jam_masuk)
            let shOut = parseShiftTime(myShift.jam_pulang)
            
            if (myShift.lintas_hari) shOut += 24 * 60
            if (actOut < actIn) actOut += 24 * 60 

            // 1. HITUNG LEMBUR AWAL & AKHIR DALAM MENIT
            if (actIn < (shIn - 30)) {
              lemburMenit += (shIn - actIn)
            }
            if (actOut > (shOut + 30)) {
              lemburMenit += (actOut - shOut)
            }
            
            // 2. LAKUKAN PEMBULATAN KE 0.5 JAM TERDEKAT
            if (lemburMenit > 0) {
              lemburJam = Math.round((lemburMenit / 60) * 2) / 2
              totalJamLembur += lemburJam
            }
          }
        }
        
        // Simpan nilai yang sudah dibulatkan ke detail
        detailLogs.push({ ...att, shiftName: myShift ? myShift.nama_shift : 'Libur / Tidak Ditemukan', lemburJam })
      })

      let absenMangkir = targetKerja - aktualHadir
      if (absenMangkir < 0) absenMangkir = 0

      detailLogs.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))

      result.push({
        user, targetKerja, aktualHadir, absenMangkir,
        totalLembur: totalJamLembur, // Gunakan nilai total jam yang rapi
        detailLogs
      })
    }
    
    aggregatedData.value = result
  } catch (error) {
    alert("Gagal memuat rekap agregasi.")
  } finally {
    isLoading.value = false
  }
}

const openManualDialog = () => {
  manualForm.value = { email: '', tanggal: new Date().toISOString().split('T')[0], in: '08:00', out: '17:00', note: '' }
  manualDialog.value = true
}

const saveManual = async () => {
  if (!manualForm.value.email || !manualForm.value.tanggal || !manualForm.value.in) return alert("Lengkapi data form manual!")
  isSavingManual.value = true
  try {
    const user = usersList.value.find(u => u.email === manualForm.value.email)
    const checkInISO = new Date(`${manualForm.value.tanggal}T${manualForm.value.in}:00`).toISOString()
    const checkOutISO = manualForm.value.out ? new Date(`${manualForm.value.tanggal}T${manualForm.value.out}:00`).toISOString() : null
    
    const payload = {
      user_id: user.id, nama: user.nama, email: user.email, branch_id: user.branch_id,
      tanggal: manualForm.value.tanggal, status: 'Hadir',
      check_in: checkInISO, check_out: checkOutISO,
      is_manual: true, note_manual: manualForm.value.note, created_at: serverTimestamp()
    }
    
    await addDoc(collection(db, 'tenants', authState.value.tenantId, 'attendance'), payload)
    manualDialog.value = false
    alert("Absen manual berhasil disimpan! Silakan klik 'Tarik Data' untuk menyegarkan tabel.")
  } catch (err) { alert("Gagal menyimpan absen manual.") } finally { isSavingManual.value = false }
}

const openDetail = (recap) => { selectedRecap.value = recap; detailDialog.value = true }
const viewPhoto = (url, empName, type) => { if (!url) return; photoDialog.value = { show: true, url, employee: empName, type } }

const getBranchName = (branchId) => branchId ? (branchesList.value.find(b => b.id === branchId)?.nama_cabang || 'Kantor Pusat') : 'Kantor Pusat'
const formatDate = (dateStr) => dateStr ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr)) : '-'
const formatTime = (isoString) => isoString ? new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'
</script>