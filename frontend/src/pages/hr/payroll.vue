<!-- file: frontend/src/pages/hr/payroll.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Kalkulasi Payroll & Penggajian</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Otomatisasi perhitungan gaji berdasarkan kehadiran, lembur (PP 35/2021), dan potongan.</p>
    </div>

    <!-- Filter Periode -->
    <v-card class="mb-5 pa-4 border-sm" elevation="0" rounded="xl" color="white">
      <v-row dense align="center">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filterMonth"
            type="month"
            label="Periode Penggajian"
            variant="outlined" density="comfortable" color="teal-darken-3" hide-details
            prepend-inner-icon="mdi-calendar-month"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="8" class="d-flex justify-end gap-2">
          <v-btn color="teal-darken-3" size="large" rounded="lg" class="text-none font-weight-bold px-6" prepend-icon="mdi-calculator" :loading="isLoading" @click="generatePayroll">
            Kalkulasi Gaji Bulan Ini
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabel Hasil Payroll -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3">Nama Karyawan</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Kehadiran</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-center">Lembur</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-right">Gaji Pokok & Tunj.</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-right">Upah Lembur</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-right">Gaji Bersih (THP)</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pay in payrollData" :key="pay.user_id">
            <td class="font-weight-bold text-blue-grey-darken-4 py-3">
              {{ pay.nama }}
              <div class="text-caption text-grey-darken-1">{{ pay.role }}</div>
            </td>
            <td class="text-center">
              <v-chip size="small" color="teal-darken-3" variant="tonal" class="font-weight-bold mb-1">{{ pay.total_hari_kerja }} Hari</v-chip>
              <div class="text-caption text-red-darken-2" v-if="pay.total_telat_menit > 0">Telat: {{ pay.total_telat_menit }} mnt</div>
            </td>
            <td class="text-center font-weight-bold text-orange-darken-3">
              {{ pay.total_jam_lembur > 0 ? `${pay.total_jam_lembur.toFixed(1)} Jam` : '-' }}
            </td>
            <td class="text-right">
              <div class="font-weight-bold text-blue-grey-darken-3">{{ formatRupiah(pay.gaji_pokok) }}</div>
              <div class="text-caption text-success">+ {{ formatRupiah(pay.total_tunjangan) }}</div>
            </td>
            <td class="text-right font-weight-bold text-orange-darken-3">
              {{ formatRupiah(pay.upah_lembur) }}
            </td>
            <td class="text-right font-weight-bold text-teal-darken-4 text-subtitle-1">
              {{ formatRupiah(pay.take_home_pay) }}
            </td>
            <td class="text-center">
              <v-btn icon="mdi-text-box-search-outline" variant="text" color="indigo-darken-2" size="small" @click="viewSlip(pay)"></v-btn>
            </td>
          </tr>
          <tr v-if="payrollData.length === 0">
            <td colspan="7" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-cash-register</v-icon>
              <p>Belum ada kalkulasi. Klik tombol 'Kalkulasi Gaji' di atas.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Pratinjau Slip Gaji -->
    <v-dialog v-model="slipDialog" max-width="500px" scrollable>
      <v-card rounded="xl" color="white" v-if="selectedSlip">
        <v-card-title class="pa-4 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>mdi-receipt-text-outline</v-icon>
          <span class="font-weight-bold">Rincian Slip Gaji</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="slipDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <h3 class="text-h6 font-weight-bold">{{ selectedSlip.nama }}</h3>
            <div class="text-caption text-grey-darken-1">Periode: {{ filterMonth }}</div>
          </div>
          
          <v-divider class="mb-4"></v-divider>
          
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2">Gaji Pokok Dasar</span>
            <span class="font-weight-bold">{{ formatRupiah(selectedSlip.gaji_pokok) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2">Tunj. Makan & Transport ({{ selectedSlip.total_hari_kerja }} Hari)</span>
            <span class="font-weight-bold text-success">+ {{ formatRupiah(selectedSlip.total_tunjangan) }}</span>
          </div>
          
          <div v-if="selectedSlip.upah_lembur > 0">
            <div class="d-flex justify-space-between mt-2 pt-2 border-t border-dashed">
              <span class="text-body-2 text-orange-darken-3">Uang Lembur ({{ selectedSlip.total_jam_lembur.toFixed(1) }} Jam)</span>
              <span class="font-weight-bold text-orange-darken-3">+ {{ formatRupiah(selectedSlip.upah_lembur) }}</span>
            </div>
            <div class="text-caption text-grey ml-2 mt-1" v-for="(rincian, i) in selectedSlip.rincian_lembur" :key="i">
              - {{ rincian }}
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between align-center bg-teal-lighten-5 pa-3 rounded-lg">
            <span class="text-subtitle-1 font-weight-bold text-teal-darken-4">TAKE HOME PAY</span>
            <span class="text-h6 font-weight-bold text-teal-darken-4">{{ formatRupiah(selectedSlip.take_home_pay) }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { authState } from '../../store/auth'
import { calculateLembur } from '../../utils/payrollEngine' // <-- IMPOR MESIN ANDA DI SINI

const filterMonth = ref('')
const isLoading = ref(false)
const payrollData = ref([])

const slipDialog = ref(false)
const selectedSlip = ref(null)

onMounted(() => {
  const today = new Date()
  filterMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
})

const parseTime = (isoString) => {
  const d = new Date(isoString)
  return d.getHours() * 60 + d.getMinutes()
}
const parseShiftTime = (timeStr) => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

const generatePayroll = async () => {
  if (!filterMonth.value) return
  isLoading.value = true
  payrollData.value = []

  try {
    const tenantId = authState.value.tenantId
    const startDate = `${filterMonth.value}-01`
    const endDate = `${filterMonth.value}-31`

    // 1. Tarik Data Karyawan & Master Shift
    const usersSnap = await getDocs(collection(db, 'tenants', tenantId, 'users'))
    const shiftsSnap = await getDocs(collection(db, 'tenants', tenantId, 'master_shifts'))
    
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const shifts = shiftsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // 2. Tarik Data Absensi Bulan Ini
    const qAtt = query(
      collection(db, 'tenants', tenantId, 'attendance'),
      where('tanggal', '>=', startDate),
      where('tanggal', '<=', endDate)
    )
    const attSnap = await getDocs(qAtt)
    const attendances = attSnap.docs.map(d => d.data())

    // 3. Kalkulasi per Karyawan (JEMBATAN ABSENSI -> PAYROLL)
    const calculated = []
    
    for (const user of users) {
      if (!user.aktif || user.role === 'UMKM Owner') continue;

      let totalHariKerja = 0
      let totalTelatMenit = 0
      let totalMenitLembur = 0

      // Filter absen spesifik milik user ini
      const userAtt = attendances.filter(a => a.email === user.email)

      userAtt.forEach(att => {
        if (att.status === 'Hadir' && att.check_in && att.check_out) {
          totalHariKerja++
          
          // Cari shift karyawan ini (Sebagai contoh, kita pakai Shift Default-nya)
          const myShift = shifts.find(s => s.id === user.shift_id)
          if (myShift) {
            const actIn = parseTime(att.check_in)
            const actOut = parseTime(att.check_out)
            const shIn = parseShiftTime(myShift.jam_masuk)
            let shOut = parseShiftTime(myShift.jam_pulang)
            if (myShift.lintas_hari) shOut += 24 * 60

            // Cek Keterlambatan
            if (actIn > (shIn + myShift.toleransi)) {
              totalTelatMenit += (actIn - shIn)
            }

            // Cek Lembur (Misal: Hitung lembur jika pulang > 30 menit dari jadwal)
            if (actOut > (shOut + 30)) {
              totalMenitLembur += (actOut - shOut)
            }
          }
        }
      })

      // Konversi total menit lembur sebulan menjadi Jam (pembulatan 1 desimal)
      const totalJamLembur = Math.floor((totalMenitLembur / 60) * 10) / 10

      // Hitung Tunjangan
      const totalTunjangan = ((user.uang_makan || 0) + (user.uang_transport || 0)) * totalHariKerja

      // Eksekusi Mesin Payroll (PP 35/2021)
      let upahLembur = 0
      let rincianLembur = []
      if (totalJamLembur > 0) {
        // Kita asumsikan hitungan standar (lembur hari kerja).
        // Untuk tingkat lanjut, hitungan ini bisa dipecah per hari.
        const hasilLembur = calculateLembur(user.gaji_pokok + totalTunjangan, totalJamLembur, false, 6)
        upahLembur = hasilLembur.totalUpahLembur
        rincianLembur = hasilLembur.rincianKalkulasi
      }

      // Finalisasi Take Home Pay
      const takeHomePay = (user.gaji_pokok || 0) + totalTunjangan + upahLembur

      calculated.push({
        user_id: user.id,
        nama: user.nama,
        role: user.role,
        gaji_pokok: user.gaji_pokok || 0,
        total_hari_kerja: totalHariKerja,
        total_telat_menit: totalTelatMenit,
        total_jam_lembur: totalJamLembur,
        total_tunjangan: totalTunjangan,
        upah_lembur: upahLembur,
        rincian_lembur: rincianLembur,
        take_home_pay: takeHomePay
      })
    }

    payrollData.value = calculated
  } catch (error) {
    console.error("Gagal kalkulasi payroll:", error)
    alert("Terjadi kesalahan saat mengkalkulasi data.")
  } finally {
    isLoading.value = false
  }
}

const viewSlip = (data) => {
  selectedSlip.value = data
  slipDialog.value = true
}

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
}
</script>