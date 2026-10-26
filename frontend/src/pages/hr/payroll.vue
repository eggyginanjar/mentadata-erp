<!-- file: frontend/src/pages/hr/payroll.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Kalkulasi Payroll & Penggajian</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Otomatisasi perhitungan gaji berdasarkan kehadiran, lembur (PP 35/2021 & Kustom), dan potongan.</p>
    </div>

    <!-- Filter Periode (Rentang Tanggal Dinamis) -->
    <v-card class="mb-5 pa-4 border-sm" elevation="0" rounded="xl" color="white">
      <v-row dense align="center">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.startDate"
            type="date"
            label="Tanggal Mulai (Cut-off Awal)"
            variant="outlined" density="comfortable" color="teal-darken-3" hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.endDate"
            type="date"
            label="Tanggal Akhir (Cut-off Akhir)"
            variant="outlined" density="comfortable" color="teal-darken-3" hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-end gap-2">
          <v-btn color="teal-darken-3" size="large" rounded="lg" class="text-none font-weight-bold px-6" prepend-icon="mdi-calculator" :loading="isLoading" @click="generatePayroll">
            Kalkulasi Gaji Periode Ini
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
              <div class="text-caption text-success" v-if="pay.total_tunjangan > 0">+ {{ formatRupiah(pay.total_tunjangan) }}</div>
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
              <p>Belum ada kalkulasi. Tentukan rentang tanggal dan klik tombol Kalkulasi.</p>
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
            <div class="text-caption text-grey-darken-1">Periode: {{ formatDate(filters.startDate) }} s/d {{ formatDate(filters.endDate) }}</div>
          </div>
          
          <v-divider class="mb-4"></v-divider>
          
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2">Gaji Pokok Dasar</span>
            <span class="font-weight-bold">{{ formatRupiah(selectedSlip.gaji_pokok) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2" v-if="selectedSlip.total_tunjangan > 0">
            <span class="text-body-2">Total Tunjangan</span>
            <span class="font-weight-bold text-success">+ {{ formatRupiah(selectedSlip.total_tunjangan) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2" v-if="selectedSlip.total_potongan > 0">
            <span class="text-body-2">Total Potongan</span>
            <span class="font-weight-bold text-error">- {{ formatRupiah(selectedSlip.total_potongan) }}</span>
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
import { ref } from 'vue'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { authState } from '../../store/auth'
import { calculateLembur } from '../../utils/payrollEngine' 

const isLoading = ref(false)
const payrollData = ref([])

const slipDialog = ref(false)
const selectedSlip = ref(null)

// Default: Tanggal 1 s.d Akhir Bulan Berjalan
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
const filters = ref({
  startDate: firstDay.toISOString().split('T')[0],
  endDate: lastDay.toISOString().split('T')[0]
})

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
}
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
}

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
  if (!filters.value.startDate || !filters.value.endDate) return alert('Pilih rentang tanggal terlebih dahulu.')
  
  isLoading.value = true
  payrollData.value = []

  try {
    const tenantId = authState.value.tenantId
    const startDate = filters.value.startDate
    const endDate = filters.value.endDate

    const usersSnap = await getDocs(collection(db, 'tenants', tenantId, 'users'))
    const shiftsSnap = await getDocs(collection(db, 'tenants', tenantId, 'master_shifts'))
    const patternsSnap = await getDocs(collection(db, 'tenants', tenantId, 'shift_patterns'))
    const componentsSnap = await getDocs(collection(db, 'tenants', tenantId, 'master_payroll_components'))
    
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const shifts = shiftsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const patterns = patternsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const masterComponents = componentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const qAtt = query(collection(db, 'tenants', tenantId, 'attendance'), where('tanggal', '>=', startDate), where('tanggal', '<=', endDate))
    const attSnap = await getDocs(qAtt)
    const attendances = attSnap.docs.map(d => d.data())

    const calculated = []
    
    for (const user of users) {
      if (!user.aktif || user.role === 'UMKM Owner') continue;

      let totalHariKerja = 0
      let totalTelatMenit = 0
      let totalMenitLembur = 0

      const userAtt = attendances.filter(a => a.email === user.email)
      const userPattern = patterns.find(p => p.id === user.shift_pattern_id)
      const anchorDate = user.anchor_date ? new Date(user.anchor_date) : null

      userAtt.forEach(att => {
        if (att.status === 'Hadir' && att.check_in && att.check_out) {
          totalHariKerja++
          
          let myShift = null
          if (userPattern && anchorDate) {
            const tglAtt = new Date(att.tanggal + 'T00:00:00Z')
            const tglAnchor = new Date(user.anchor_date + 'T00:00:00Z')
            const diffDays = Math.floor((tglAtt - tglAnchor) / (1000 * 60 * 60 * 24))
            
            if (diffDays >= 0) {
              const dayOfCycle = (diffDays % userPattern.siklus_hari) + 1
              const patternDay = userPattern.jadwal_harian.find(d => d.hari_ke === dayOfCycle)
              
              if (patternDay && !patternDay.is_libur) {
                myShift = shifts.find(s => s.id === patternDay.shift_id)
              }
            }
          }

          if (myShift) {
            const actIn = parseTime(att.check_in)
            let actOut = parseTime(att.check_out)
            const shIn = parseShiftTime(myShift.jam_masuk)
            let shOut = parseShiftTime(myShift.jam_pulang)
            
            if (myShift.lintas_hari) shOut += 24 * 60
            
            if (actOut < actIn) actOut += 24 * 60 

            if (actIn > (shIn + myShift.toleransi)) {
              totalTelatMenit += (actIn - shIn)
            }
            
            let lemburHarian = 0
            if (actIn < (shIn - 30)) {
              lemburHarian += (shIn - actIn)
            }
            if (actOut > (shOut + 30)) {
              lemburHarian += (actOut - shOut)
            }
            
            totalMenitLembur += lemburHarian
          }
        }
      })

      const totalJamLembur = Math.floor((totalMenitLembur / 60) * 10) / 10

      const isHarian = user.tipe_gaji === 'Harian'
      const isMingguan = user.tipe_gaji === 'Mingguan'
      
      let baseGajiPokok = user.gaji_pokok || 0
      if (isHarian) {
        baseGajiPokok = (user.gaji_pokok || 0) * totalHariKerja
      } else if (isMingguan) {
        baseGajiPokok = (user.gaji_pokok || 0) * 4 
      }

      let totalTunjanganTetap = 0
      let totalTunjanganTidakTetap = 0
      let totalPotongan = 0

      if (user.komponen_gaji && Array.isArray(user.komponen_gaji)) {
        user.komponen_gaji.forEach(kg => {
          const master = masterComponents.find(mc => mc.id === kg.id_komponen)
          if (master) {
            if (master.tipe === 'Pendapatan') {
              if (master.kategori.includes('Tidak Tetap')) {
                totalTunjanganTidakTetap += (kg.nominal * totalHariKerja)
              } else {
                totalTunjanganTetap += kg.nominal
              }
            } else if (master.tipe === 'Potongan') {
              totalPotongan += kg.nominal 
            }
          }
        })
      }

      const totalTunjangan = totalTunjanganTetap + totalTunjanganTidakTetap
      
      let upahLembur = 0
      let rincianLembur = []
      
      if (totalJamLembur > 0) {
        if (user.tipe_lembur === 'Nominal Kustom (Flat/Jam)') {
          const tarifKustom = user.lembur_kustom || 0
          upahLembur = totalJamLembur * tarifKustom
          rincianLembur.push(`Lembur Flat Kustom (${totalJamLembur} Jam x ${formatRupiah(tarifKustom)})`)
        } else {
          const basisUpahBulanan = isHarian 
            ? (((user.gaji_pokok || 0) * 26) + totalTunjanganTetap) 
            : (baseGajiPokok + totalTunjanganTetap)

          const hasilLembur = calculateLembur(basisUpahBulanan, totalJamLembur, false, 6)
          upahLembur = hasilLembur.totalUpahLembur
          rincianLembur = hasilLembur.rincianKalkulasi
        }
      }

      const takeHomePay = baseGajiPokok + totalTunjangan + upahLembur - totalPotongan

      calculated.push({
        user_id: user.id,
        nama: user.nama,
        role: user.role,
        gaji_pokok: baseGajiPokok,
        total_hari_kerja: totalHariKerja,
        total_telat_menit: totalTelatMenit,
        total_jam_lembur: totalJamLembur,
        total_tunjangan: totalTunjangan,
        total_potongan: totalPotongan,
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
</script>