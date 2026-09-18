<!-- file: frontend/src/pages/reports/neraca.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-6 d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center">
      <div>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Laporan Neraca Keuangan</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Potret posisi Harta (Aktiva), Utang, dan Modal (Pasiva) perusahaan.</p>
      </div>
      <div class="mt-4 mt-sm-0 d-flex gap-2">
        <v-text-field
          v-model="periodeTanggal"
          type="date"
          label="Per Tanggal"
          variant="outlined"
          density="compact"
          color="teal-darken-3"
          hide-details
          class="bg-white"
          style="width: 200px;"
          @change="hitungNeraca"
        ></v-text-field>
        <v-btn color="teal-darken-3" prepend-icon="mdi-printer" class="ml-2 text-none font-weight-bold" elevation="1" height="40">
          Cetak PDF
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="teal-darken-3" size="64"></v-progress-circular>
    </div>

    <!-- Laporan Layout -->
    <v-row v-else>
      <!-- KOLOM KIRI: AKTIVA (HARTA) -->
      <v-col cols="12" md="6">
        <v-card elevation="0" rounded="xl" class="border-sm bg-white h-100 d-flex flex-column">
          <v-card-title class="pa-4 bg-teal-lighten-5 text-teal-darken-4 font-weight-bold border-b d-flex align-center">
            <v-icon start color="teal-darken-3">mdi-bank</v-icon> AKTIVA (HARTA)
          </v-card-title>
          
          <v-card-text class="pa-0 flex-grow-1">
            <v-table density="compact" hover>
              <tbody>
                <!-- HARTA LANCAR -->
                <tr class="bg-grey-lighten-4">
                  <td colspan="2" class="font-weight-bold text-blue-grey-darken-3">Harta Lancar</td>
                </tr>
                <tr v-for="akun in aktivaLancar" :key="akun.kode_akun">
                  <td class="pl-6 text-blue-grey-darken-2">{{ akun.kode_akun }} - {{ akun.nama_akun }}</td>
                  <td class="text-right font-weight-medium">{{ formatRupiah(akun.saldo) }}</td>
                </tr>
                <tr v-if="aktivaLancar.length === 0">
                  <td colspan="2" class="text-caption text-center text-grey font-italic py-2">Tidak ada data</td>
                </tr>
                <tr>
                  <td class="pl-6 font-weight-bold text-teal-darken-3 text-right">Total Harta Lancar</td>
                  <td class="text-right font-weight-bold text-teal-darken-3">{{ formatRupiah(totalAktivaLancar) }}</td>
                </tr>

                <!-- HARTA TETAP -->
                <tr class="bg-grey-lighten-4">
                  <td colspan="2" class="font-weight-bold text-blue-grey-darken-3 mt-4">Harta Tetap</td>
                </tr>
                <tr v-for="akun in aktivaTetap" :key="akun.kode_akun">
                  <td class="pl-6 text-blue-grey-darken-2">{{ akun.kode_akun }} - {{ akun.nama_akun }}</td>
                  <td class="text-right font-weight-medium">{{ formatRupiah(akun.saldo) }}</td>
                </tr>
                <tr v-if="aktivaTetap.length === 0">
                  <td colspan="2" class="text-caption text-center text-grey font-italic py-2">Tidak ada data</td>
                </tr>
                <tr>
                  <td class="pl-6 font-weight-bold text-teal-darken-3 text-right">Total Harta Tetap</td>
                  <td class="text-right font-weight-bold text-teal-darken-3">{{ formatRupiah(totalAktivaTetap) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>

          <!-- TOTAL AKTIVA -->
          <v-card-actions class="pa-4 bg-teal-darken-3 text-white">
            <span class="text-h6 font-weight-bold">TOTAL AKTIVA</span>
            <v-spacer></v-spacer>
            <span class="text-h6 font-weight-black">{{ formatRupiah(totalAktiva) }}</span>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- KOLOM KANAN: PASIVA (KEWAJIBAN & MODAL) -->
      <v-col cols="12" md="6">
        <v-card elevation="0" rounded="xl" class="border-sm bg-white h-100 d-flex flex-column">
          <v-card-title class="pa-4 bg-deep-purple-lighten-5 text-deep-purple-darken-4 font-weight-bold border-b d-flex align-center">
            <v-icon start color="deep-purple-darken-3">mdi-scale-balance</v-icon> PASIVA (KEWAJIBAN & MODAL)
          </v-card-title>
          
          <v-card-text class="pa-0 flex-grow-1">
            <v-table density="compact" hover>
              <tbody>
                <!-- KEWAJIBAN (UTANG) -->
                <tr class="bg-grey-lighten-4">
                  <td colspan="2" class="font-weight-bold text-blue-grey-darken-3">Kewajiban (Utang)</td>
                </tr>
                <tr v-for="akun in kewajiban" :key="akun.kode_akun">
                  <td class="pl-6 text-blue-grey-darken-2">{{ akun.kode_akun }} - {{ akun.nama_akun }}</td>
                  <td class="text-right font-weight-medium">{{ formatRupiah(akun.saldo) }}</td>
                </tr>
                <tr v-if="kewajiban.length === 0">
                  <td colspan="2" class="text-caption text-center text-grey font-italic py-2">Tidak ada data</td>
                </tr>
                <tr>
                  <td class="pl-6 font-weight-bold text-deep-purple-darken-3 text-right">Total Kewajiban</td>
                  <td class="text-right font-weight-bold text-deep-purple-darken-3">{{ formatRupiah(totalKewajiban) }}</td>
                </tr>

                <!-- EKUITAS (MODAL) -->
                <tr class="bg-grey-lighten-4">
                  <td colspan="2" class="font-weight-bold text-blue-grey-darken-3 mt-4">Ekuitas (Modal)</td>
                </tr>
                <tr v-for="akun in ekuitas" :key="akun.kode_akun">
                  <td class="pl-6 text-blue-grey-darken-2">{{ akun.kode_akun }} - {{ akun.nama_akun }}</td>
                  <td class="text-right font-weight-medium">{{ formatRupiah(akun.saldo) }}</td>
                </tr>
                <!-- Injeksi Otomatis Laba Berjalan -->
                <tr class="bg-orange-lighten-5">
                  <td class="pl-6 text-orange-darken-4 font-weight-medium font-italic">
                    <v-icon start size="x-small">mdi-chart-line-variant</v-icon> Laba (Rugi) Tahun Berjalan
                  </td>
                  <td class="text-right font-weight-bold text-orange-darken-4">{{ formatRupiah(labaBerjalan) }}</td>
                </tr>
                <tr>
                  <td class="pl-6 font-weight-bold text-deep-purple-darken-3 text-right">Total Modal</td>
                  <td class="text-right font-weight-bold text-deep-purple-darken-3">{{ formatRupiah(totalEkuitas) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>

          <!-- TOTAL PASIVA -->
          <v-card-actions class="pa-4 bg-deep-purple-darken-3 text-white">
            <span class="text-h6 font-weight-bold">TOTAL PASIVA</span>
            <v-spacer></v-spacer>
            <span class="text-h6 font-weight-black">{{ formatRupiah(totalPasiva) }}</span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pengecekan Keseimbangan (Balance Checker) -->
    <v-alert v-if="!isLoading && isRendered" :type="isBalanced ? 'success' : 'error'" variant="tonal" class="mt-6 border" rounded="lg">
      <div class="d-flex align-center justify-space-between w-100">
        <div class="font-weight-bold">
          <v-icon start>{{ isBalanced ? 'mdi-check-decagram' : 'mdi-alert-circle' }}</v-icon>
          Status Neraca: {{ isBalanced ? 'SEIMBANG (BALANCED)' : 'TIDAK SEIMBANG (UNBALANCED)' }}
        </div>
        <div class="font-weight-black text-h6">
          Selisih: {{ formatRupiah(Math.abs(totalAktiva - totalPasiva)) }}
        </div>
      </div>
    </v-alert>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { authState } from '../../store/auth'

const isLoading = ref(true)
const isRendered = ref(false)

// Tanggal hari ini sebagai default (Format YYYY-MM-DD)
const today = new Date()
const periodeTanggal = ref(today.toISOString().split('T')[0])

// State Pengelompokan Akun
const aktivaLancar = ref([])
const aktivaTetap = ref([])
const kewajiban = ref([])
const ekuitas = ref([])
const labaBerjalan = ref(0)

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0)
}

// Computed Totals
const totalAktivaLancar = computed(() => aktivaLancar.value.reduce((sum, item) => sum + item.saldo, 0))
const totalAktivaTetap = computed(() => aktivaTetap.value.reduce((sum, item) => sum + item.saldo, 0))
const totalAktiva = computed(() => totalAktivaLancar.value + totalAktivaTetap.value)

const totalKewajiban = computed(() => kewajiban.value.reduce((sum, item) => sum + item.saldo, 0))
const sumAkunEkuitas = computed(() => ekuitas.value.reduce((sum, item) => sum + item.saldo, 0))
const totalEkuitas = computed(() => sumAkunEkuitas.value + labaBerjalan.value)
const totalPasiva = computed(() => totalKewajiban.value + totalEkuitas.value)

// Toleransi selisih 1 rupiah karena pembulatan desimal
const isBalanced = computed(() => Math.abs(totalAktiva.value - totalPasiva.value) <= 1)

// Engine Penghitung Neraca
const hitungNeraca = async () => {
  isLoading.value = true
  isRendered.value = false
  
  try {
    const tenantId = authState.value.tenantId
    if (!tenantId) return

    // 1. Tarik Data Master COA (Chart of Accounts)
    const coaRef = collection(db, 'tenants', tenantId, 'coa')
    const coaSnapshot = await getDocs(query(coaRef, orderBy('kode_akun')))
    
    let akunList = coaSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      saldo: doc.data().saldo_awal || 0 // Default diisi saldo awal
    }))

    // 2. Tarik Data Transaksi Jurnal (Simulasi)
    // Di aplikasi nyata, Anda menarik data dari koleksi 'journals' atau 'transactions'
    // yang tanggalnya <= periodeTanggal.value
    const journalRef = collection(db, 'tenants', tenantId, 'journals')
    const journalSnapshot = await getDocs(query(journalRef, where('tanggal', '<=', periodeTanggal.value)))

    // 3. Kalkulasi Saldo Mutasi Jurnal
    journalSnapshot.forEach(doc => {
      const jurnal = doc.data()
      if (jurnal.detail && Array.isArray(jurnal.detail)) {
        jurnal.detail.forEach(baris => {
          const targetAkun = akunList.find(a => a.kode_akun === baris.kode_akun)
          if (targetAkun) {
            // Logika Debit/Kredit standar Akuntansi
            const isAssetOrExpense = targetAkun.kode_akun.startsWith('1') || targetAkun.kode_akun.startsWith('5')
            
            if (isAssetOrExpense) {
              // Untuk Harta & Beban: Debit menambah, Kredit mengurangi
              targetAkun.saldo += (Number(baris.debit || 0) - Number(baris.kredit || 0))
            } else {
              // Untuk Utang, Modal & Pendapatan: Kredit menambah, Debit mengurangi
              targetAkun.saldo += (Number(baris.kredit || 0) - Number(baris.debit || 0))
            }
          }
        })
      }
    })

    // 4. Distribusi Akun ke Kategori Masing-masing berdasarkan Prefix Kode Akun
    aktivaLancar.value = []
    aktivaTetap.value = []
    kewajiban.value = []
    ekuitas.value = []
    let totalPendapatan = 0
    let totalBeban = 0

    akunList.forEach(akun => {
      const kode = akun.kode_akun.toString()
      
      // Mengabaikan akun dengan saldo 0 agar laporan bersih
      if (akun.saldo === 0) return

      if (kode.startsWith('11')) {
        aktivaLancar.value.push(akun) // Kas, Bank, Piutang, Persediaan
      } else if (kode.startsWith('12') || kode.startsWith('13')) {
        aktivaTetap.value.push(akun) // Peralatan, Mesin, Kendaraan
      } else if (kode.startsWith('2')) {
        kewajiban.value.push(akun) // Utang Usaha, Utang Bank
      } else if (kode.startsWith('3')) {
        ekuitas.value.push(akun) // Modal Pribadi, Laba Ditahan. Termasuk kode 307
      } else if (kode.startsWith('4')) {
        totalPendapatan += akun.saldo // Pendapatan
      } else if (kode.startsWith('5') || kode.startsWith('6')) {
        totalBeban += akun.saldo // HPP & Beban Operasional
      }
    })

    // 5. Ekstrak Laba Tahun Berjalan
    labaBerjalan.value = totalPendapatan - totalBeban

  } catch (error) {
    console.error("Gagal menghitung neraca:", error)
  } finally {
    isLoading.value = false
    isRendered.value = true
  }
}

onMounted(() => {
  hitungNeraca()
})
</script>