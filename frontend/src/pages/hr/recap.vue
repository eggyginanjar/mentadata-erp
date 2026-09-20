<!-- file: frontend/src/pages/hr/recap.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Rekap Presensi Karyawan</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Pantau riwayat kehadiran, verifikasi foto, dan jam kerja karyawan.</p>
    </div>

    <!-- Panel Filter -->
    <v-card class="mb-5 pa-4 border-sm" elevation="0" rounded="xl" color="white">
      <v-row dense align="center">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filterMonth"
            type="month"
            label="Bulan Presensi"
            variant="outlined"
            density="comfortable"
            color="teal-darken-3"
            hide-details
            prepend-inner-icon="mdi-calendar-month"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filterBranch"
            :items="[{id: 'all', nama_cabang: 'Semua Cabang'}, ...branchesList]"
            item-title="nama_cabang"
            item-value="id"
            label="Filter Penempatan / Cabang"
            variant="outlined"
            density="comfortable"
            color="teal-darken-3"
            hide-details
            prepend-inner-icon="mdi-store-marker-outline"
          ></v-select>
        </v-col>
        <v-col cols="12" md="5" class="d-flex justify-end">
          <v-btn 
            color="teal-darken-3" 
            size="large" 
            rounded="lg" 
            class="text-none font-weight-bold px-6" 
            prepend-icon="mdi-magnify"
            :loading="isLoading"
            @click="fetchAttendance"
          >
            Tarik Data
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabel Data Kehadiran -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3">Tanggal</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Karyawan</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Cabang</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Check-In</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Check-Out</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td class="font-weight-bold text-teal-darken-3">
              {{ formatDate(record.tanggal) }}
            </td>
            <td>
              <div class="font-weight-bold text-blue-grey-darken-4">{{ record.nama }}</div>
              <div class="text-caption text-blue-grey-darken-1">{{ record.email }}</div>
            </td>
            <td class="text-blue-grey-darken-2 font-weight-medium">
              <v-icon start size="x-small">mdi-map-marker-outline</v-icon>
              {{ getBranchName(record.branch_id) }}
            </td>
            <td>
              <div v-if="record.check_in" class="d-flex align-center">
                <v-avatar size="40" rounded class="mr-3 cursor-pointer border border-white-10" @click="viewPhoto(record.photo_in, record.nama, 'Check-In')">
                  <v-img :src="record.photo_in" cover></v-img>
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-2">{{ formatTime(record.check_in) }}</div>
                  <div class="text-caption text-success font-weight-medium">
                    Jarak: {{ record.distance_in }}m
                  </div>
                </div>
              </div>
              <span v-else class="text-caption text-grey font-italic">- Belum Masuk -</span>
            </td>
            <td>
              <div v-if="record.check_out" class="d-flex align-center">
                <v-avatar size="40" rounded class="mr-3 cursor-pointer border border-white-10" @click="viewPhoto(record.photo_out, record.nama, 'Check-Out')">
                  <v-img :src="record.photo_out" cover></v-img>
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-2">{{ formatTime(record.check_out) }}</div>
                  <div class="text-caption text-success font-weight-medium">
                    Jarak: {{ record.distance_out }}m
                  </div>
                </div>
              </div>
              <span v-else class="text-caption text-grey font-italic">- Belum Pulang -</span>
            </td>
            <td class="text-center">
              <v-chip size="small" color="success" variant="flat" class="font-weight-bold">
                {{ record.status || 'Hadir' }}
              </v-chip>
            </td>
          </tr>
          <tr v-if="filteredRecords.length === 0">
            <td colspan="6" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-clipboard-text-search-outline</v-icon>
              <p>Tidak ada data absensi untuk periode/cabang yang dipilih.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

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
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore'
import { authState } from '../../store/auth'

const isLoading = ref(false)
const rawRecords = ref([])
const branchesList = ref([])

// Default ke bulan berjalan (Format: YYYY-MM)
const today = new Date()
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const filterMonth = ref(currentMonth)
const filterBranch = ref('all')

const photoDialog = ref({ show: false, url: '', employee: '', type: '' })

onMounted(() => {
  const tenantId = authState.value.tenantId

  // Tarik data cabang untuk dropdown
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => {
    branchesList.value = snapshot.docs.map(doc => ({ id: doc.id, nama_cabang: doc.data().nama_cabang }))
  })

  // Tarik otomatis data bulan ini saat halaman dimuat
  fetchAttendance()
})

const fetchAttendance = async () => {
  if (!filterMonth.value) return

  isLoading.value = true
  rawRecords.value = []

  try {
    const tenantId = authState.value.tenantId
    const startDate = `${filterMonth.value}-01`
    const endDate = `${filterMonth.value}-31`

    // Strategi Query: Menggunakan operator string untuk meraup data dalam 1 bulan
    const q = query(
      collection(db, 'tenants', tenantId, 'attendance'),
      where('tanggal', '>=', startDate),
      where('tanggal', '<=', endDate),
      orderBy('tanggal', 'desc')
    )

    const snapshot = await getDocs(q)
    rawRecords.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Gagal menarik data absensi:", error)
    alert("Terjadi kesalahan saat memuat rekap presensi.")
  } finally {
    isLoading.value = false
  }
}

// Komputasi penyaringan berbasis Cabang
const filteredRecords = computed(() => {
  if (filterBranch.value === 'all') {
    return rawRecords.value
  }
  return rawRecords.value.filter(record => record.branch_id === filterBranch.value)
})

const viewPhoto = (url, empName, type) => {
  if (!url) return
  photoDialog.value = { show: true, url, employee: empName, type }
}

const getBranchName = (branchId) => {
  if (!branchId) return 'Kantor Pusat (HQ)'
  const branch = branchesList.value.find(b => b.id === branchId)
  return branch ? branch.nama_cabang : 'Cabang Tidak Dikenal'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
}

const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  const d = new Date(isoString)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>