<!-- file: frontend/src/pages/attendance/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Presensi Karyawan</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Validasi kehadiran berbasis swafoto dan verifikasi radius titik cabang.</p>
    </div>

    <v-row justify="center">
      <!-- PANEL UTAMA PRESENSI -->
      <v-col cols="12" md="7" lg="6">
        <v-card elevation="0" rounded="xl" class="border-sm bg-white overflow-hidden">
          <v-card-title class="pa-4 bg-teal-darken-3 text-white d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon start>mdi-camera-account</v-icon>
              <span class="font-weight-bold text-subtitle-1">Kamera Verifikasi</span>
            </div>
            <v-chip color="white" variant="flat" size="small" class="text-teal-darken-4 font-weight-bold">
              {{ currentBranch?.nama_cabang || 'Memuat Cabang...' }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-5">
            <!-- BOX KAMERA / PRATINJAU FOTO -->
            <div class="camera-wrapper mb-4 rounded-xl overflow-hidden border position-relative bg-black d-flex align-center justify-center">
              <video 
                v-show="!capturedImage && isCameraActive" 
                ref="videoRef" 
                autoplay 
                playsinline 
                muted
                class="camera-stream"
              ></video>

              <v-img 
                v-if="capturedImage" 
                :src="capturedImage" 
                cover 
                class="camera-stream"
              ></v-img>

              <div v-if="!isCameraActive && !capturedImage" class="text-center pa-6 text-grey">
                <v-icon size="48" class="mb-2">mdi-camera-off</v-icon>
                <div class="text-caption">Kamera belum diaktifkan</div>
              </div>

              <!-- Overlay Jam Berjalan -->
              <div class="position-absolute time-overlay px-3 py-1 rounded-pill">
                <v-icon start size="x-small" color="white">mdi-clock-outline</v-icon>
                <span class="text-caption font-weight-bold text-white">{{ currentTime }}</span>
              </div>
            </div>

            <!-- KONTROL KAMERA -->
            <div class="d-flex justify-center gap-2 mb-4">
              <v-btn 
                v-if="!capturedImage" 
                color="teal-darken-3" 
                prepend-icon="mdi-camera" 
                rounded="pill" 
                class="text-none font-weight-bold"
                :disabled="!isCameraActive"
                @click="takeSnapshot"
              >
                Ambil Swafoto
              </v-btn>
              <v-btn 
                v-else 
                color="grey-darken-2" 
                variant="tonal" 
                prepend-icon="mdi-camera-retake" 
                rounded="pill" 
                class="text-none font-weight-bold"
                @click="retakeSnapshot"
              >
                Foto Ulang
              </v-btn>
            </div>

            <!-- STATUS LOKASI & GEOFENCE CHECKER -->
            <v-card variant="tonal" :color="isInsideRadius ? 'success' : 'error'" rounded="lg" class="pa-4 mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="font-weight-bold text-body-2 d-flex align-center">
                  <v-icon start size="small">{{ isInsideRadius ? 'mdi-map-marker-check' : 'mdi-map-marker-alert' }}</v-icon>
                  {{ isInsideRadius ? 'Lokasi Valid (Dalam Radius)' : 'Di Luar Radius Cabang' }}
                </div>
                <v-btn size="x-small" variant="text" icon="mdi-refresh" @click="detectLocation" :loading="isLocating"></v-btn>
              </div>
              <div class="text-caption">
                Jarak Anda ke cabang: <b>{{ currentDistance !== null ? `${currentDistance} meter` : 'Mendeteksi...' }}</b>
                (Toleransi: {{ currentBranch?.radius || 50 }} meter)
              </div>
            </v-card>

            <!-- TOMBOL CHECK-IN / CHECK-OUT -->
            <v-row dense>
              <v-col cols="6">
                <v-btn 
                  block 
                  color="teal-darken-3" 
                  size="large" 
                  rounded="lg" 
                  prepend-icon="mdi-login" 
                  class="text-none font-weight-bold"
                  :disabled="!canSubmit || alreadyCheckedIn"
                  :loading="isSubmitting"
                  @click="submitAttendance('IN')"
                >
                  Masuk (Check-In)
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn 
                  block 
                  color="deep-orange-darken-2" 
                  size="large" 
                  rounded="lg" 
                  prepend-icon="mdi-logout" 
                  class="text-none font-weight-bold"
                  :disabled="!canSubmit || !alreadyCheckedIn || alreadyCheckedOut"
                  :loading="isSubmitting"
                  @click="submitAttendance('OUT')"
                >
                  Pulang (Check-Out)
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIWAYAT PRESENSI HARI INI -->
      <v-col cols="12" md="5" lg="4">
        <v-card elevation="0" rounded="xl" class="border-sm bg-white h-100">
          <v-card-title class="pa-4 bg-blue-grey-lighten-5 text-blue-grey-darken-4 font-weight-bold text-subtitle-1 border-b d-flex align-center">
            <v-icon start color="teal-darken-3">mdi-calendar-check</v-icon> Status Hari Ini
          </v-card-title>
          
          <v-card-text class="pa-4">
            <div v-if="todayRecord" class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption text-blue-grey-darken-1">Jam Masuk:</span>
                <v-chip size="small" color="teal-darken-3" variant="flat" class="font-weight-bold">
                  {{ todayRecord.check_in ? formatTime(todayRecord.check_in) : '--:--' }}
                </v-chip>
              </div>
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption text-blue-grey-darken-1">Jam Pulang:</span>
                <v-chip size="small" color="deep-orange-darken-2" variant="flat" class="font-weight-bold">
                  {{ todayRecord.check_out ? formatTime(todayRecord.check_out) : '--:--' }}
                </v-chip>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-blue-grey-darken-1">Status Kehadiran:</span>
                <span class="font-weight-bold text-caption text-success">{{ todayRecord.status || 'Hadir' }}</span>
              </div>
            </div>

            <div v-else class="text-center py-8 text-blue-grey-lighten-2">
              <v-icon size="40" class="mb-2">mdi-history</v-icon>
              <p class="text-caption">Belum ada presensi untuk hari ini.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '../../firebase'
import { collection, doc, setDoc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { authState } from '../../store/auth'

const videoRef = ref(null)
const isCameraActive = ref(false)
const capturedImage = ref(null)
const mediaStream = ref(null)

const isLocating = ref(false)
const userCoords = ref({ lat: null, lng: null })
const currentBranch = ref(null)
const currentDistance = ref(null)

const isSubmitting = ref(false)
const currentTime = ref('')
let timerInterval = null

const todayRecord = ref(null)

// Format tanggal YYYY-MM-DD lokal
const todayDateStr = new Date().toISOString().split('T')[0]

// Haversine Formula: Menghitung jarak dua titik koordinat bumi (dalam satuan meter)
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // Radius bumi dalam meter
  const toRad = deg => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const isInsideRadius = computed(() => {
  if (currentDistance.value === null || !currentBranch.value) return false
  const tolerance = currentBranch.value.radius || 50
  return currentDistance.value <= tolerance
})

const canSubmit = computed(() => {
  return capturedImage.value && isInsideRadius.value && !isSubmitting.value
})

const alreadyCheckedIn = computed(() => !!todayRecord.value?.check_in)
const alreadyCheckedOut = computed(() => !!todayRecord.value?.check_out)

// Inisialisasi Kamera Depan
const initCamera = async () => {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      audio: false
    })
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream.value
      isCameraActive.value = true
    }
  } catch (err) {
    console.error("Gagal membuka kamera:", err)
    alert("Izin kamera ditolak atau perangkat kamera tidak ditemukan.")
  }
}

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
  isCameraActive.value = false
}

// Ambil Snapshot dari Video Stream ke DataURL
const takeSnapshot = () => {
  if (!videoRef.value) return
  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth || 480
  canvas.height = videoRef.value.videoHeight || 480
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
  capturedImage.value = canvas.toDataURL('image/jpeg', 0.7) // Kompresi 70%
  stopCamera()
}

const retakeSnapshot = () => {
  capturedImage.value = null
  initCamera()
}

// Deteksi GPS
const detectLocation = () => {
  isLocating.value = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        evaluateGeofence()
        isLocating.value = false
      },
      (err) => {
        console.error("Gagal GPS:", err)
        alert("Gagal membaca koordinat GPS. Pastikan izin lokasi aktif.")
        isLocating.value = false
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
}

// Evaluasi Jarak
const evaluateGeofence = () => {
  if (userCoords.value.lat && userCoords.value.lng && currentBranch.value?.latitude && currentBranch.value?.longitude) {
    currentDistance.value = calculateHaversine(
      userCoords.value.lat,
      userCoords.value.lng,
      currentBranch.value.latitude,
      currentBranch.value.longitude
    )
  }
}

// Tarik data profil penempatan cabang & catatan hari ini
const loadInitialData = async () => {
  const tenantId = authState.value.tenantId
  const branchId = authState.value.branchId

  if (branchId) {
    const branchDoc = await getDoc(doc(db, 'tenants', tenantId, 'branches', branchId))
    if (branchDoc.exists()) {
      currentBranch.value = branchDoc.data()
      evaluateGeofence()
    }
  } else {
    // Fallback jika login sebagai owner (tidak di-assign cabang tertentu)
    currentBranch.value = { nama_cabang: 'Kantor Pusat (HQ)', radius: 100000 }
    currentDistance.value = 0
  }

  // Cek absensi hari ini
  const attendanceId = `${authState.value.email}_${todayDateStr}`
  const attDoc = await getDoc(doc(db, 'tenants', tenantId, 'attendance', attendanceId))
  if (attDoc.exists()) {
    todayRecord.value = attDoc.data()
  }
}

// Submit Presensi
const submitAttendance = async (type) => {
  isSubmitting.value = true
  try {
    const tenantId = authState.value.tenantId
    const attendanceId = `${authState.value.email}_${todayDateStr}`
    const attRef = doc(db, 'tenants', tenantId, 'attendance', attendanceId)

    const payload = {
      email: authState.value.email,
      nama: authState.value.nama,
      branch_id: authState.value.branchId || null,
      tanggal: todayDateStr,
      updated_at: serverTimestamp()
    }

    if (type === 'IN') {
      payload.check_in = new Date().toISOString()
      payload.photo_in = capturedImage.value
      payload.distance_in = currentDistance.value
      payload.status = 'Hadir'
    } else {
      payload.check_out = new Date().toISOString()
      payload.photo_out = capturedImage.value
      payload.distance_out = currentDistance.value
    }

    await setDoc(attRef, payload, { merge: true })
    todayRecord.value = { ...(todayRecord.value || {}), ...payload }

    alert(`Presensi ${type === 'IN' ? 'Masuk' : 'Pulang'} berhasil dicatat!`)
    retakeSnapshot()
  } catch (e) {
    console.error("Gagal submit absen:", e)
    alert("Terjadi kesalahan saat menyimpan presensi.")
  } finally {
    isSubmitting.value = false
  }
}

const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  const d = new Date(isoString)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  initCamera()
  detectLocation()
  loadInitialData()

  timerInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 1000)
})

onUnmounted(() => {
  stopCamera()
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.camera-wrapper {
  width: 100%;
  height: 340px;
}
.camera-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Efek Cermin untuk selfie */
}
.time-overlay {
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.65);
}
</style>