<!-- file: frontend/src/pages/users/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Halaman -->
    <v-row class="mb-6" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Kelola Karyawan</h2>
        <p class="text-body-2 text-blue-grey-lighten-1">Manajemen akses akun HQ dan Cabang untuk Tenant.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          color="teal-darken-3" prepend-icon="mdi-account-plus" 
          rounded="pill" elevation="2" class="text-none font-weight-bold" 
          @click="openAddDialog"
        >
          Tambah Karyawan
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabel Daftar Karyawan -->
    <v-card class="border-sm" elevation="0" rounded="xl" color="white">
      <v-table hover class="bg-white">
        <thead class="bg-blue-grey-lighten-5">
          <tr>
            <th class="font-weight-bold text-blue-grey-darken-3">Nama Lengkap</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Email Akses</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Peran (Role)</th>
            <th class="font-weight-bold text-blue-grey-darken-3">Penempatan</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3">Status</th>
            <th class="text-center font-weight-bold text-blue-grey-darken-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersList" :key="user.id">
            <td class="font-weight-bold text-blue-grey-darken-4">{{ user.nama }}</td>
            <td class="text-blue-grey-darken-1">{{ user.email }}</td>
            <td>
              <v-chip size="small" :color="getRoleColor(user.role)" variant="tonal" class="font-weight-bold">
                {{ user.role }}
              </v-chip>
            </td>
            <td class="text-blue-grey-darken-1 font-weight-medium">
              {{ getBranchName(user.branch_id) }}
            </td>
            <td class="text-center">
              <v-chip size="small" :color="user.aktif ? 'success' : 'error'" variant="flat" class="font-weight-bold">
                {{ user.aktif ? 'Aktif' : 'Nonaktif' }}
              </v-chip>
            </td>
            <td class="text-center">
              <!-- Tombol Edit dan Hapus -->
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

    <!-- Dialog Form (Tambah & Edit) -->
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card rounded="xl" color="white">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>{{ isEditing ? 'mdi-account-edit' : 'mdi-shield-account' }}</v-icon>
          <span class="font-weight-bold">{{ isEditing ? 'Edit Profil Karyawan' : 'Pendaftaran Akun Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveUser">
            <v-row>
              <!-- Baris 1: Nama & Email -->
              <v-col cols="12" sm="6">
                <v-text-field 
                  v-model="form.nama" label="Nama Lengkap" 
                  variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <!-- Email dikunci saat edit agar tidak putus sinkronisasi dengan Firebase Auth -->
                <v-text-field 
                  v-model="form.email" label="Alamat Email (Untuk Login)" 
                  type="email" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                  :disabled="isEditing" :hint="isEditing ? 'Email login tidak dapat diubah' : ''" persistent-hint
                ></v-text-field>
              </v-col>
              
              <!-- Baris 2: Role & Cabang (Kondisional) -->
              <v-col cols="12" :sm="isBranchRole ? 6 : 12">
                <v-select 
                  v-model="form.role" :items="roleOptions" 
                  label="Kewenangan (Role)" variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                  :disabled="form.role === 'UMKM Owner' && isEditing"
                ></v-select>
              </v-col>
              
              <v-col cols="12" sm="6" v-if="isBranchRole">
                <v-select 
                v-model="form.branch_id" 
                :items="branchesList" 
                item-title="nama_cabang"
                item-value="id"
                label="Penempatan Cabang" 
                variant="outlined" density="comfortable" color="teal-darken-3" hide-details="auto"
                ></v-select>
              </v-col>

              <!-- Baris 3: Status (Hanya muncul saat edit) -->
              <v-col cols="12" v-if="isEditing && form.role !== 'UMKM Owner'">
                <v-switch 
                  v-model="form.aktif" 
                  :label="form.aktif ? 'Akun Aktif (Dapat Login)' : 'Akun Dibekukan (Akses Ditutup)'" 
                  color="teal-darken-3" hide-details density="compact" class="mt-2"
                ></v-switch>
              </v-col>

            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="closeDialog">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveUser" :loading="isSaving">
            Simpan Data
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
// Tambahkan fungsi doc, updateDoc, dan deleteDoc
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { authState } from '../../store/auth'

const dialog = ref(false)
const isSaving = ref(false)
const usersList = ref([])

// State untuk Edit
const isEditing = ref(false)
const editId = ref(null)

const customRoles = ref([]) 
const form = ref({ nama: '', email: '', role: 'Kasir', branch_id: null, aktif: true }) // Default diubah ke Kasir

const roleOptions = computed(() => {
  const roles = ['UMKM Owner']
  customRoles.value.forEach(r => roles.push(r.nama_peran))
  return roles
})

const isBranchRole = computed(() => {
  if (form.value.role === 'UMKM Owner') return false
  const selectedRoleData = customRoles.value.find(r => r.nama_peran === form.value.role)
  return selectedRoleData && selectedRoleData.permissions && selectedRoleData.permissions.includes('pos')
})

const branchesList = ref([])

onMounted(() => {
  const tenantId = authState.value.tenantId

  onSnapshot(collection(db, 'tenants', tenantId, 'users'), (snapshot) => {
    usersList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })

  onSnapshot(collection(db, 'tenants', tenantId, 'roles'), (snapshot) => {
    customRoles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
  
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => {
    branchesList.value = snapshot.docs.map(doc => ({ id: doc.id, nama_cabang: doc.data().nama_cabang }))
  })
})

// Fungsi Buka Form Tambah
const openAddDialog = () => {
  isEditing.value = false
  editId.value = null
  form.value = { nama: '', email: '', role: 'Kasir', branch_id: null, aktif: true }
  dialog.value = true
}

// Fungsi Buka Form Edit
const editUser = (user) => {
  isEditing.value = true
  editId.value = user.id
  form.value = { 
    nama: user.nama, 
    email: user.email, 
    role: user.role, 
    branch_id: user.branch_id, 
    aktif: user.aktif 
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

// Simpan Data (Menyatukan Add & Update)
const saveUser = async () => {
  if (!form.value.nama || !form.value.email) {
    alert('Nama dan Email wajib diisi!')
    return
  }
  if (isBranchRole.value && !form.value.branch_id) {
    alert('Penempatan Cabang wajib dipilih untuk posisi ini!')
    return
  }

  isSaving.value = true
  try {
    const userData = {
      nama: form.value.nama,
      email: form.value.email,
      role: form.value.role,
      branch_id: isBranchRole.value ? form.value.branch_id : null,
      aktif: form.value.aktif
    }

    if (isEditing.value) {
      // MODE PERBARUI DATA
      const docRef = doc(db, 'tenants', authState.value.tenantId, 'users', editId.value)
      await updateDoc(docRef, { ...userData, updated_at: serverTimestamp() })
    } else {
      // MODE TAMBAH BARU
      const usersRef = collection(db, 'tenants', authState.value.tenantId, 'users')
      await addDoc(usersRef, { ...userData, created_at: serverTimestamp() })
    }
    closeDialog()
  } catch (error) {
    console.error("Gagal menyimpan akun:", error)
    alert("Terjadi kesalahan jaringan saat menyimpan data.")
  } finally {
    isSaving.value = false
  }
}

// Fungsi Menghapus Karyawan
const deleteUser = async (id) => {
  if (confirm('Yakin ingin menghapus akun ini secara permanen?')) {
    try {
      const docRef = doc(db, 'tenants', authState.value.tenantId, 'users', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Gagal menghapus akun:", error)
      alert("Terjadi kesalahan saat menghapus data.")
    }
  }
}

const getRoleColor = (role) => {
  if (role === 'UMKM Owner') return 'deep-purple-darken-2'
  return 'teal-darken-3' 
}

const getBranchName = (branchId) => {
  if (!branchId) return 'Kantor Pusat (HQ)'
  const branch = branchesList.value.find(b => b.id === branchId)
  return branch ? branch.nama_cabang : 'Cabang Tidak Dikenal'
}
</script>