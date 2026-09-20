<!-- file: frontend/src/pages/users/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <v-row class="mb-6" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Kelola Karyawan (HRIS)</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Manajemen data personel, hak akses sistem, dan parameter komponen gaji.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          color="teal-darken-3" prepend-icon="mdi-account-plus" 
          rounded="pill" elevation="2" class="text-none font-weight-bold" 
          @click="openAddDialog"
        >
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
            <th class="font-weight-bold text-blue-grey-darken-3">Tipe Gaji</th>
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
              <v-chip size="x-small" color="blue-grey-darken-1" variant="outlined" class="font-weight-bold">
                {{ user.tipe_gaji || 'Bulanan' }}
              </v-chip>
            </td>
            <td class="text-right font-weight-bold text-blue-grey-darken-3">
              {{ formatRupiah(user.gaji_pokok || 0) }}
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

    <!-- Dialog Form (HR Master Data) -->
    <v-dialog v-model="dialog" max-width="800px" persistent scrollable>
      <v-card rounded="xl" color="white" max-height="90vh" class="d-flex flex-column">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>{{ isEditing ? 'mdi-account-edit' : 'mdi-card-account-details-outline' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Profil Karyawan' : 'Form Pendaftaran Karyawan' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto bg-grey-lighten-4">
          <v-form @submit.prevent="saveUser">
            <!-- SEGMEN 1: DATA PERSONAL & SISTEM -->
            <div class="pa-5 bg-white mb-3">
              <div class="font-weight-bold text-teal-darken-3 mb-4 d-flex align-center">
                <v-icon start size="small">mdi-account-circle</v-icon> Data Personal & Akses Sistem
              </div>
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="form.nik" label="NIK / ID Karyawan" placeholder="Misal: EMP-001" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-3" hide-details></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="form.nama" label="Nama Lengkap" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-3" hide-details></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field 
                    v-model="form.email" label="Email (Untuk Login)" type="email" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-3" hide-details
                    :disabled="isEditing" :class="isEditing ? 'bg-grey-lighten-4' : ''"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-row dense>
                <v-col cols="12" :sm="isBranchRole ? 6 : 12">
                  <v-select 
                    v-model="form.role" :items="roleOptions" label="Jabatan (Akses Menu)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details
                    :disabled="form.role === 'UMKM Owner' && isEditing" :class="(form.role === 'UMKM Owner' && isEditing) ? 'bg-grey-lighten-4' : ''"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" v-if="isBranchRole">
                  <v-select 
                    v-model="form.branch_id" :items="branchesList" item-title="nama_cabang" item-value="id" label="Penempatan Cabang" variant="outlined" density="comfortable" color="teal-darken-3" hide-details
                  ></v-select>
                </v-col>
              </v-row>
            </div>

            <!-- SEGMEN 2: KOMPONEN GAJI (PAYROLL) -->
            <div class="pa-5 bg-white mb-3">
              <div class="font-weight-bold text-orange-darken-3 mb-4 d-flex align-center">
                <v-icon start size="small">mdi-cash-multiple</v-icon> Komponen Gaji (Payroll)
              </div>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-select 
                    v-model="form.tipe_gaji" :items="['Bulanan', 'Harian', 'Mingguan']" label="Sistem Pembayaran" variant="outlined" density="comfortable" color="orange-darken-3" class="mb-3" hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model.number="form.gaji_pokok" label="Gaji Pokok Dasar" prefix="Rp" type="number" variant="outlined" density="comfortable" color="orange-darken-3" class="mb-3" hide-details></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model.number="form.uang_makan" label="Uang Makan Harian (Opsional)" prefix="Rp" type="number" variant="outlined" density="comfortable" color="orange-darken-3" class="mb-3" hide-details></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model.number="form.uang_transport" label="Uang Transport Harian (Opsional)" prefix="Rp" type="number" variant="outlined" density="comfortable" color="orange-darken-3" class="mb-3" hide-details></v-text-field>
                </v-col>
              </v-row>
            </div>

            <!-- SEGMEN 3: STATUS AKUN -->
            <div class="pa-5 bg-white" v-if="isEditing && form.role !== 'UMKM Owner'">
              <v-switch 
                v-model="form.aktif" 
                :label="form.aktif ? 'Akun & Status HR Aktif' : 'Karyawan Dinonaktifkan (Resign/Diberhentikan)'" 
                :color="form.aktif ? 'success' : 'error'" hide-details density="compact"
              ></v-switch>
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-white border-t flex-shrink-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold text-none px-4" @click="closeDialog">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-8 font-weight-bold text-none" @click="saveUser" :loading="isSaving">
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

// State untuk Edit
const isEditing = ref(false)
const editId = ref(null)

const customRoles = ref([]) 
const branchesList = ref([])

// Form diperluas dengan field HR
const form = ref({ 
  nik: '', 
  nama: '', 
  email: '', 
  role: 'Kasir', 
  branch_id: null, 
  aktif: true,
  tipe_gaji: 'Bulanan',
  gaji_pokok: 0,
  uang_makan: 0,
  uang_transport: 0
})

const roleOptions = computed(() => {
  const roles = ['UMKM Owner']
  customRoles.value.forEach(r => {
    // Hanya tambahkan jika bukan UMKM Owner agar tidak dobel
    if (r.nama_peran !== 'UMKM Owner') {
      roles.push(r.nama_peran)
    }
  })
  return roles
})

const isBranchRole = computed(() => {
  if (form.value.role === 'UMKM Owner') return false
  const selectedRoleData = customRoles.value.find(r => r.nama_peran === form.value.role)
  return selectedRoleData ? true : false
})

onMounted(() => {
  const tenantId = authState.value.tenantId

  onSnapshot(collection(db, 'tenants', tenantId, 'users'), (snapshot) => {
    // Sortir agar Owner tetap di atas
    const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    usersList.value = loaded.sort((a, b) => {
      if (a.role === 'UMKM Owner') return -1;
      if (b.role === 'UMKM Owner') return 1;
      return 0;
    })
  })

  onSnapshot(collection(db, 'tenants', tenantId, 'roles'), (snapshot) => {
    customRoles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
  
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => {
    branchesList.value = snapshot.docs.map(doc => ({ id: doc.id, nama_cabang: doc.data().nama_cabang }))
  })
})

// ==========================================
// ENGINE PEMBUAT NIK OTOMATIS (Aman Multi-Tenant)
// ==========================================
const generateNIK = () => {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2) // Ambil 2 digit tahun (26)
  const mm = String(now.getMonth() + 1).padStart(2, '0') // Bulan (09)
  const prefix = `${yy}${mm}` // Contoh: 2609

  // 1. Filter hanya karyawan di tenant ini yang NIK-nya berawalan 2609
  // 2. Ekstrak 4 digit terakhirnya, ubah jadi angka
  const existingSeqs = usersList.value
    .filter(u => u.nik && u.nik.startsWith(prefix))
    .map(u => parseInt(u.nik.slice(4)))
    .filter(n => !isNaN(n))

  // Cari angka terbesar, lalu tambah 1
  let nextSeq = 1
  if (existingSeqs.length > 0) {
    nextSeq = Math.max(...existingSeqs) + 1
  }

  // Gabungkan prefix dengan urutan baru (format 4 digit pakai padStart)
  return `${prefix}${String(nextSeq).padStart(4, '0')}`
}

const openAddDialog = () => {
  isEditing.value = false
  editId.value = null
  
  form.value = { 
    nik: generateNIK(), // <--- INJEKSI NIK OTOMATIS DI SINI
    nama: '', email: '', role: 'Kasir', branch_id: null, aktif: true,
    tipe_gaji: 'Bulanan', gaji_pokok: 0, uang_makan: 0, uang_transport: 0
  }
  dialog.value = true
}

const editUser = (user) => {
  isEditing.value = true
  editId.value = user.id
  form.value = { 
    nik: user.nik || '',
    nama: user.nama, 
    email: user.email, 
    role: user.role, 
    branch_id: user.branch_id || null, 
    aktif: user.aktif !== undefined ? user.aktif : true,
    tipe_gaji: user.tipe_gaji || 'Bulanan',
    gaji_pokok: user.gaji_pokok || 0,
    uang_makan: user.uang_makan || 0,
    uang_transport: user.uang_transport || 0
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const saveUser = async () => {
  if (!form.value.nama || !form.value.email) {
    alert('Nama dan Email wajib diisi!')
    return
  }
  // isBranchRole memastikan bahwa role staff/kasir tidak dibiarkan menggantung tanpa cabang
  if (isBranchRole.value && !form.value.branch_id && form.value.role !== 'UMKM Owner') {
    alert('Penempatan Cabang wajib dipilih untuk posisi ini!')
    return
  }

  isSaving.value = true
  try {
    const userData = {
      nik: form.value.nik,
      nama: form.value.nama,
      email: form.value.email,
      role: form.value.role,
      branch_id: form.value.role === 'UMKM Owner' ? null : form.value.branch_id,
      aktif: form.value.aktif,
      tipe_gaji: form.value.tipe_gaji,
      gaji_pokok: Number(form.value.gaji_pokok),
      uang_makan: Number(form.value.uang_makan),
      uang_transport: Number(form.value.uang_transport),
    }

    if (isEditing.value) {
      const docRef = doc(db, 'tenants', authState.value.tenantId, 'users', editId.value)
      await updateDoc(docRef, { ...userData, updated_at: serverTimestamp() })
    } else {
      const usersRef = collection(db, 'tenants', authState.value.tenantId, 'users')
      await addDoc(usersRef, { ...userData, created_at: serverTimestamp() })
    }
    closeDialog()
  } catch (error) {
    console.error("Gagal menyimpan data HR:", error)
    alert("Terjadi kesalahan jaringan saat menyimpan data.")
  } finally {
    isSaving.value = false
  }
}

const deleteUser = async (id) => {
  if (confirm('Yakin ingin menghapus data karyawan ini secara permanen? Seluruh riwayat akan hilang.')) {
    try {
      const docRef = doc(db, 'tenants', authState.value.tenantId, 'users', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Gagal menghapus data HR:", error)
      alert("Terjadi kesalahan saat menghapus data.")
    }
  }
}

const getBranchName = (branchId) => {
  if (!branchId) return 'Kantor Pusat (HQ)'
  const branch = branchesList.value.find(b => b.id === branchId)
  return branch ? branch.nama_cabang : 'Kantor Pusat (HQ)'
}

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number)
}
</script>