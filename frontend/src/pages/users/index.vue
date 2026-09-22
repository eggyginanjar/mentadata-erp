<!-- file: frontend/src/pages/users/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <v-row class="mb-6" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Kelola Karyawan (HRIS)</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Manajemen data personel, penugasan pola rotasi shift, dan struktur komponen gaji.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="teal-darken-3" prepend-icon="mdi-account-plus" rounded="pill" elevation="2" class="text-none font-weight-bold" @click="openAddDialog">
          Pekerjakan Karyawan Baru
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Daftar Karyawan -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3" style="width: 250px;">Nama Lengkap & NIK</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Jabatan & Penempatan</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Pola Rotasi Shift</th>
            <th class="font-weight-bold text-blue-grey-darken-3 text-right">Gaji Pokok</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3">Status</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3" style="width: 120px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersList" :key="user.id">
            <td class="font-weight-bold text-blue-grey-darken-4 py-3">
              <div class="d-flex align-center">
                <v-avatar size="36" :color="user.role === 'UMKM Owner' ? 'deep-purple-lighten-5' : 'teal-lighten-5'" class="mr-3 border">
                  <v-icon :color="user.role === 'UMKM Owner' ? 'deep-purple-darken-3' : 'teal-darken-3'">
                    {{ user.role === 'UMKM Owner' ? 'mdi-crown' : 'mdi-account' }}
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-1">{{ user.nama }}</div>
                  <div class="text-caption text-blue-grey-lighten-1 font-weight-mono">{{ user.nik || 'NIK Belum Diatur' }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="font-weight-medium text-teal-darken-3 mb-1">{{ user.role }}</div>
              <div class="text-caption text-blue-grey-darken-1"><v-icon start size="x-small">mdi-map-marker-outline</v-icon>{{ getBranchName(user.branch_id) }}</div>
            </td>
            <td>
              <div class="font-weight-bold text-indigo-darken-2 text-body-2">{{ getPatternName(user.shift_pattern_id) }}</div>
              <div class="text-caption text-grey-darken-1 mt-1" v-if="user.anchor_date">Mulai: {{ formatDate(user.anchor_date) }}</div>
            </td>
            <td class="text-right font-weight-bold text-blue-grey-darken-3">
              {{ formatRupiah(user.gaji_pokok || 0) }}
              <div class="text-caption text-grey mt-1">{{ user.komponen_gaji?.length || 0 }} Komponen Lain</div>
            </td>
            <td class="text-center">
              <v-chip size="small" :color="user.aktif ? 'success' : 'error'" variant="flat" class="font-weight-bold">
                {{ user.aktif ? 'Aktif' : 'Nonaktif' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editUser(user)"></v-btn>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteUser(user.id)" :disabled="user.role === 'UMKM Owner'"></v-btn>
            </td>
          </tr>
          <tr v-if="usersList.length === 0">
            <td colspan="6" class="text-center pa-8 text-blue-grey-lighten-2">
              <v-icon size="48" class="mb-2">mdi-account-group-outline</v-icon>
              <p>Belum ada data karyawan yang didaftarkan.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Form Karyawan -->
    <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
      <v-card rounded="xl" color="white" max-height="90vh" class="d-flex flex-column">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>{{ isEditing ? 'mdi-account-edit' : 'mdi-card-account-details-outline' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Profil Karyawan' : 'Pendaftaran Karyawan' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 flex-grow-1 overflow-y-auto bg-grey-lighten-4">
          <v-form @submit.prevent="saveUser">
            <!-- SEGMEN 1: DATA PERSONAL -->
            <v-card class="pa-5 mb-4 border-sm" elevation="0" rounded="lg" color="white">
              <div class="font-weight-bold text-teal-darken-3 mb-4 d-flex align-center">
                <v-icon start size="small">mdi-account-circle</v-icon> Data Personal & Akses Sistem
              </div>
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="form.nik" label="NIK / ID Karyawan" hint="Dihasilkan Otomatis" persistent-hint variant="outlined" density="comfortable" color="teal-darken-3" class="mb-3" bg-color="white"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="form.nama" label="Nama Lengkap" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-3" hide-details bg-color="white"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field v-model="form.email" label="Email (Untuk Login)" type="email" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-3" hide-details :disabled="isEditing" :class="isEditing ? 'text-grey-darken-1' : ''" :bg-color="isEditing ? 'grey-lighten-3' : 'white'"></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12" :sm="isBranchRole ? 6 : 12">
                  <v-select v-model="form.role" :items="roleOptions" label="Jabatan (Akses Menu)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details :disabled="form.role === 'UMKM Owner' && isEditing" :class="(form.role === 'UMKM Owner' && isEditing) ? 'text-grey-darken-1' : ''" :bg-color="(form.role === 'UMKM Owner' && isEditing) ? 'grey-lighten-3' : 'white'"></v-select>
                </v-col>
                <v-col cols="12" sm="6" v-if="isBranchRole">
                  <v-select v-model="form.branch_id" :items="branchesList" item-title="nama_cabang" item-value="id" label="Penempatan Cabang" variant="outlined" density="comfortable" color="teal-darken-3" hide-details bg-color="white"></v-select>
                </v-col>
              </v-row>
            </v-card>

            <!-- SEGMEN 2: WAKTU KERJA (Pola Rotasi Baru) -->
            <v-card class="pa-5 mb-4 border-sm" elevation="0" rounded="lg" color="white" v-if="form.role !== 'UMKM Owner'">
              <div class="font-weight-bold text-indigo-darken-3 mb-4 d-flex align-center">
                <v-icon start size="small">mdi-calendar-sync</v-icon> Penjadwalan & Rotasi Shift
              </div>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.shift_pattern_id" :items="patternsList" item-title="nama_pola" item-value="id"
                    label="Pilih Pola Rotasi (Roster)" variant="outlined" density="comfortable" color="indigo-darken-3" bg-color="white"
                    hint="Aturan jadwal berulang yang berlaku untuk karyawan ini." persistent-hint
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.anchor_date" label="Tanggal Mulai Berlaku (Jangkar Hari ke-1)" type="date"
                    variant="outlined" density="comfortable" color="indigo-darken-3" bg-color="white"
                    hint="Tanggal ini akan dihitung sebagai Hari ke-1 dalam siklus pola rotasi." persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card>

            <!-- SEGMEN 3: KOMPONEN GAJI DINAMIS (Payroll Baru) -->
            <v-card class="pa-5 mb-4 border-sm" elevation="0" rounded="lg" color="white">
              <div class="font-weight-bold text-orange-darken-3 mb-4 d-flex align-center">
                <v-icon start size="small">mdi-cash-multiple</v-icon> Struktur & Komponen Gaji
              </div>

              <!-- AUDITOR PP 36/2021 -->
              <v-alert v-if="auditorGaji.show" :type="auditorGaji.isSafe ? 'success' : 'error'" variant="tonal" density="compact" class="mb-4 text-caption font-weight-medium">
                {{ auditorGaji.message }}
              </v-alert>

              <v-row dense>
                <v-col cols="12" sm="4">
                  <v-select v-model="form.tipe_gaji" :items="['Bulanan', 'Harian', 'Mingguan']" label="Sistem Bayar" variant="outlined" density="comfortable" color="orange-darken-3" hide-details bg-color="white"></v-select>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-text-field v-model.number="form.gaji_pokok" label="Gaji Pokok Dasar (Wajib)" prefix="Rp" type="number" variant="outlined" density="comfortable" color="orange-darken-3" hide-details bg-color="white"></v-text-field>
                </v-col>
              </v-row>

              <!-- Builder Komponen Gaji Tambahan -->
              <div class="mt-5 mb-2 font-weight-bold text-blue-grey-darken-2 d-flex align-center justify-space-between">
                <span>Komponen Gaji Tambahan (Tunjangan/Potongan)</span>
                <v-btn color="orange-darken-3" size="small" variant="tonal" prepend-icon="mdi-plus" @click="addKomponen">Tambah</v-btn>
              </div>

              <div v-for="(item, index) in form.komponen_gaji" :key="index" class="d-flex align-center gap-2 mb-2">
                <v-select
                  v-model="item.id_komponen" :items="masterComponents" item-title="nama_komponen" item-value="id"
                  label="Pilih Komponen" variant="outlined" density="compact" hide-details bg-color="white" style="flex: 2;"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item?.raw?.kategori"></v-list-item>
                  </template>
                </v-select>
                <v-text-field
                  v-model.number="item.nominal" label="Nominal" prefix="Rp" type="number"
                  variant="outlined" density="compact" hide-details bg-color="white" style="flex: 1;"
                ></v-text-field>
                <v-btn icon="mdi-close" variant="text" color="error" size="small" @click="removeKomponen(index)"></v-btn>
              </div>
              <div v-if="form.komponen_gaji.length === 0" class="text-caption text-grey font-italic text-center py-2 border border-dashed rounded bg-grey-lighten-4">
                Belum ada tunjangan/potongan tambahan yang disematkan.
              </div>
            </v-card>

            <!-- SEGMEN 4: STATUS AKUN -->
            <v-card class="pa-5 border-sm" elevation="0" rounded="lg" color="white" v-if="isEditing && form.role !== 'UMKM Owner'">
              <v-switch v-model="form.aktif" :label="form.aktif ? 'Akun Aktif' : 'Karyawan Nonaktif (Resign/Diberhentikan)'" :color="form.aktif ? 'success' : 'error'" hide-details density="compact"></v-switch>
            </v-card>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-white border-t flex-shrink-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold text-none px-4" @click="closeDialog">Batal</v-btn>
          <!-- Tombol disable jika Auditor mendeteksi pelanggaran UU -->
          <v-btn 
            color="teal-darken-3" variant="elevated" rounded="lg" class="px-8 font-weight-bold text-none" 
            @click="saveUser" :loading="isSaving" :disabled="!auditorGaji.isSafe"
          >
            Simpan Data HR
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
const usersList = ref([])

const isEditing = ref(false)
const editId = ref(null)

const customRoles = ref([]) 
const branchesList = ref([])
const patternsList = ref([]) // Pola Rotasi Shift
const masterComponents = ref([]) // Master Komponen Gaji

const form = ref({ 
  nik: '', nama: '', email: '', role: 'Kasir', branch_id: null, aktif: true,
  shift_pattern_id: null, anchor_date: '',
  tipe_gaji: 'Bulanan', gaji_pokok: 0,
  komponen_gaji: [] // Format: [{ id_komponen: 'xx', nominal: 100000 }]
})

const roleOptions = computed(() => {
  const roles = ['UMKM Owner']
  customRoles.value.forEach(r => {
    if (r.nama_peran !== 'UMKM Owner') roles.push(r.nama_peran)
  })
  return roles
})

const isBranchRole = computed(() => {
  if (!form.value.role) return false
  if (form.value.role === 'UMKM Owner') return false
  // Pastikan pencarian case-insensitive jika perlu, atau sekadar perkuat pengecekan eksistensi
  const isCustom = customRoles.value.some(r => r.nama_peran === form.value.role)
  // Jika bukan owner, kita asumsikan butuh cabang (kecuali Anda punya logika spesifik lain)
  return isCustom || form.value.role !== 'UMKM Owner'
})

// === AUDITOR PP 36 TAHUN 2021 (Aturan 75% Upah Pokok) ===
const auditorGaji = computed(() => {
  if (form.value.role === 'UMKM Owner') return { show: false, isSafe: true }

  let totalTunjanganTetap = 0
  
  form.value.komponen_gaji.forEach(item => {
    if (item.id_komponen && item.nominal > 0) {
      const masterData = masterComponents.value.find(m => m.id === item.id_komponen)
      if (masterData && masterData.kategori === 'Tunjangan Tetap' && masterData.tipe === 'Pendapatan') {
        totalTunjanganTetap += Number(item.nominal)
      }
    }
  })

  const gapok = Number(form.value.gaji_pokok) || 0
  const totalUpahTetap = gapok + totalTunjanganTetap

  if (totalUpahTetap === 0) return { show: false, isSafe: true }

  const rasioGapok = (gapok / totalUpahTetap) * 100

  if (rasioGapok < 75) {
    return {
      show: true,
      isSafe: false,
      message: `Pelanggaran PP 36/2021: Gaji Pokok (Rp ${formatRupiah(gapok)}) hanya ${rasioGapok.toFixed(1)}% dari Total Upah Tetap. UU mewajibkan Gaji Pokok minimal 75%!`
    }
  } else {
    return {
      show: true,
      isSafe: true,
      message: `Kepatuhan Hukum Terpenuhi: Gaji Pokok sebesar ${rasioGapok.toFixed(1)}% dari Total Upah Tetap (Standar >= 75%).`
    }
  }
})


onMounted(() => {
  const tenantId = authState.value.tenantId

  onSnapshot(collection(db, 'tenants', tenantId, 'users'), (snapshot) => {
    usersList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.role === 'UMKM Owner' ? -1 : 1)
  })
  onSnapshot(collection(db, 'tenants', tenantId, 'roles'), (snapshot) => {
    customRoles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => {
    branchesList.value = snapshot.docs.map(doc => ({ id: doc.id, nama_cabang: doc.data().nama_cabang }))
  })
  // Load Pola Rotasi (Roster)
  onSnapshot(collection(db, 'tenants', tenantId, 'shift_patterns'), (snapshot) => {
    patternsList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
  // Load Master Komponen Gaji
  onSnapshot(collection(db, 'tenants', tenantId, 'master_payroll_components'), (snapshot) => {
    masterComponents.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const addKomponen = () => {
  form.value.komponen_gaji.push({ id_komponen: null, nominal: 0 })
}

const removeKomponen = (index) => {
  form.value.komponen_gaji.splice(index, 1)
}

const generateNIK = () => {
  const yy = String(new Date().getFullYear()).slice(-2) 
  const mm = String(new Date().getMonth() + 1).padStart(2, '0') 
  const prefix = `${yy}${mm}` 
  const existingSeqs = usersList.value.filter(u => u.nik && u.nik.startsWith(prefix)).map(u => parseInt(u.nik.slice(4))).filter(n => !isNaN(n))
  return `${prefix}${String((existingSeqs.length > 0 ? Math.max(...existingSeqs) : 0) + 1).padStart(4, '0')}`
}

const openAddDialog = () => {
  isEditing.value = false; editId.value = null;
  form.value = { 
    nik: generateNIK(), nama: '', email: '', role: 'Kasir', branch_id: null, aktif: true,
    shift_pattern_id: null, anchor_date: '', tipe_gaji: 'Bulanan', gaji_pokok: 0, komponen_gaji: []
  }
  dialog.value = true
}

const editUser = (user) => {
  isEditing.value = true; editId.value = user.id;
  
  // Amankan array komponen gaji
  let safeKomponen = []
  if (user.komponen_gaji && Array.isArray(user.komponen_gaji)) {
    safeKomponen = JSON.parse(JSON.stringify(user.komponen_gaji))
  }

  form.value = { 
    nik: user.nik || '', 
    nama: user.nama || '', 
    email: user.email || '', 
    role: user.role || 'Kasir', 
    branch_id: user.branch_id || null, 
    aktif: user.aktif !== undefined ? user.aktif : true,
    shift_pattern_id: user.shift_pattern_id || null, 
    anchor_date: user.anchor_date || '',
    tipe_gaji: user.tipe_gaji || 'Bulanan', 
    gaji_pokok: user.gaji_pokok || 0,
    komponen_gaji: safeKomponen
  }
  dialog.value = true
}

const closeDialog = () => dialog.value = false

const saveUser = async () => {
  if (!form.value.nama || !form.value.email) return alert('Nama dan Email wajib diisi!')
  if (!auditorGaji.value.isSafe) return alert('Perbaiki proporsi Gaji Pokok terlebih dahulu sesuai aturan undang-undang!')

  isSaving.value = true
  try {
    const userData = {
      nik: form.value.nik, nama: form.value.nama, email: form.value.email, role: form.value.role,
      branch_id: form.value.role === 'UMKM Owner' ? null : form.value.branch_id,
      aktif: form.value.aktif,
      shift_pattern_id: form.value.shift_pattern_id,
      anchor_date: form.value.anchor_date,
      tipe_gaji: form.value.tipe_gaji,
      gaji_pokok: Number(form.value.gaji_pokok),
      komponen_gaji: form.value.komponen_gaji.filter(k => k.id_komponen && k.nominal >= 0) // Bersihkan data kosong
    }

    if (isEditing.value) await updateDoc(doc(db, 'tenants', authState.value.tenantId, 'users', editId.value), { ...userData, updated_at: serverTimestamp() })
    else await addDoc(collection(db, 'tenants', authState.value.tenantId, 'users'), { ...userData, created_at: serverTimestamp() })
    
    closeDialog()
  } catch (error) { alert("Terjadi kesalahan jaringan."); } finally { isSaving.value = false }
}

const deleteUser = async (id) => {
  if (confirm('Yakin ingin menghapus data karyawan ini secara permanen?')) await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'users', id))
}

const getBranchName = (id) => id ? (branchesList.value.find(b => b.id === id)?.nama_cabang || 'HQ') : 'Kantor Pusat (HQ)'
const getPatternName = (id) => id ? (patternsList.value.find(p => p.id === id)?.nama_pola || 'Belum Diatur') : 'Belum Diatur'
const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num)
const formatDate = (dateStr) => {
  if(!dateStr) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
}
</script>