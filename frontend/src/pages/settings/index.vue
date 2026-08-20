<!-- file: frontend/src/pages/settings/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Pengaturan Sistem</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Kelola infrastruktur operasional dan keamanan akses perusahaan Anda.</p>
    </div>

    <v-card elevation="0" rounded="xl" class="border-sm bg-white overflow-hidden">
      <v-tabs v-model="tab" color="teal-darken-3" bg-color="blue-grey-lighten-5">
        <v-tab value="roles" class="font-weight-bold text-none"><v-icon start>mdi-shield-account</v-icon> Jabatan & Akses</v-tab>
        <v-tab value="branches" class="font-weight-bold text-none"><v-icon start>mdi-store-marker-outline</v-icon> Lokasi Cabang</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- TAB 1: JABATAN & AKSES -->
        <v-window-item value="roles">
            <div class="pa-4 d-flex justify-end">
                <v-btn color="teal-darken-3" prepend-icon="mdi-shield-plus" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openAddRoleDialog">
                Buat Jabatan Baru
                </v-btn>
            </div>
            <v-divider></v-divider>
            
            <v-table hover class="bg-white">
                <thead class="bg-blue-grey-lighten-5">
                <tr>
                    <th class="font-weight-bold text-blue-grey-darken-3" style="width: 250px;">Nama Jabatan</th>
                    <th class="font-weight-bold text-blue-grey-darken-3">Izin Modul (Hak Akses)</th>
                    <th class="font-weight-bold text-blue-grey-darken-3 text-center" style="width: 120px;">Aksi</th>
                </tr>
                </thead>
                <tbody>
              <tr v-for="role in rolesList" :key="role.id" :class="role.nama_peran === 'UMKM Owner' ? 'bg-deep-purple-lighten-5' : ''">
                <td class="font-weight-bold" :class="role.nama_peran === 'UMKM Owner' ? 'text-deep-purple-darken-3' : 'text-blue-grey-darken-4'">
                  <v-icon v-if="role.nama_peran === 'UMKM Owner'" start size="small" color="deep-purple-darken-3">mdi-crown</v-icon> 
                  {{ role.nama_peran }}
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-2 py-2">
                    <v-chip v-for="perm in role.permissions" :key="perm" size="small" :color="role.nama_peran === 'UMKM Owner' ? 'deep-purple-darken-2' : 'teal-darken-3'" variant="tonal" class="font-weight-bold mr-1 mb-1">
                      {{ getModuleName(perm) }}
                    </v-chip>
                  </div>
                </td>
                <td class="text-center">
                  <!-- Boleh diedit, tapi UMKM Owner tidak boleh Dihapus -->
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editRole(role)"></v-btn>
                  <v-btn v-if="role.nama_peran !== 'UMKM Owner'" icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteRole(role.id)"></v-btn>
                  <v-btn v-else icon="mdi-shield-lock-outline" variant="text" color="grey" size="small" title="Jabatan Inti tidak bisa dihapus"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- TAB 2: LOKASI CABANG -->
        <v-window-item value="branches">
            <div class="pa-4 d-flex justify-end">
                <v-btn color="teal-darken-3" prepend-icon="mdi-store-plus" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="dialogBranch = true">
                Tambah Cabang
                </v-btn>
            </div>
            <v-divider></v-divider>
            
            <v-table hover class="bg-white">
                <thead class="bg-blue-grey-lighten-5">
                <tr>
                    <th class="font-weight-bold text-blue-grey-darken-3">Nama Cabang / Titik</th>
                    <th class="font-weight-bold text-blue-grey-darken-3">Alamat Lengkap</th>
                </tr>
                </thead>
                <tbody>
              <tr v-for="branch in branchesList" :key="branch.id">
                <td class="font-weight-bold text-blue-grey-darken-4"><v-icon start color="teal-darken-3" size="small">mdi-storefront</v-icon>{{ branch.nama_cabang }}</td>
                <td class="text-blue-grey-darken-1">{{ branch.alamat }}</td>
              </tr>
              <tr v-if="branchesList.length === 0">
                <td colspan="2" class="text-center pa-8 text-blue-grey-lighten-2">
                  <v-icon size="48" class="mb-2">mdi-store-off-outline</v-icon>
                  <p>Belum ada data cabang. Tambahkan cabang pertama Anda!</p>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Dialog Buat/Edit Jabatan -->
    <v-dialog v-model="dialogRole" max-width="600px" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 text-white d-flex align-center" :class="formRole.nama_peran === 'UMKM Owner' ? 'bg-deep-purple-darken-3' : 'bg-teal-darken-3'">
          <span class="font-weight-bold">{{ isEditingRole ? 'Edit Akses Jabatan' : 'Rakit Jabatan Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogRole = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-text-field 
            v-model="formRole.nama_peran" 
            label="Nama Jabatan" 
            variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4"
            :readonly="formRole.nama_peran === 'UMKM Owner'"
            :hint="formRole.nama_peran === 'UMKM Owner' ? 'Nama jabatan inti tidak bisa diubah' : ''" persistent-hint
          ></v-text-field>
          <div class="font-weight-bold text-blue-grey-darken-3 mb-2">Pilih Modul:</div>
          <v-row>
            <v-col cols="12" sm="6" v-for="modul in availableModules" :key="modul.id" class="py-1">
              <v-checkbox v-model="formRole.permissions" :value="modul.id" :label="modul.name" color="teal-darken-3" density="compact" hide-details></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn :color="formRole.nama_peran === 'UMKM Owner' ? 'deep-purple-darken-3' : 'teal-darken-3'" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveRole" :loading="isSavingRole">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Tambah Cabang -->
    <v-dialog v-model="dialogBranch" max-width="500px" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <span class="font-weight-bold">Tambah Lokasi Cabang</span><v-spacer></v-spacer><v-btn icon="mdi-close" variant="text" color="white" @click="dialogBranch = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-text-field v-model="formBranch.nama_cabang" label="Nama Cabang (Misal: Cabang Utama, Gudang Timur)" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4" hide-details="auto"></v-text-field>
          <v-textarea v-model="formBranch.alamat" label="Alamat Lengkap" variant="outlined" color="teal-darken-3" rows="3" hide-details="auto"></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveBranch" :loading="isSavingBranch">Simpan Cabang</v-btn>
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
import { systemModules } from '../../store/modules'

const tab = ref('roles')

// State Roles
const dialogRole = ref(false)
const isSavingRole = ref(false)
const isEditingRole = ref(false)
const editRoleId = ref(null)
const rolesList = ref([])
const formRole = ref({ nama_peran: '', permissions: [] })

// State Branches
const dialogBranch = ref(false)
const isSavingBranch = ref(false)
const branchesList = ref([])
const formBranch = ref({ nama_cabang: '', alamat: '' })

const availableModules = computed(() => {
  return systemModules.value.filter(m => m.id !== 'tenants')
})

const getModuleName = (id) => systemModules.value.find(m => m.id === id)?.name || id

onMounted(() => {
  const tenantId = authState.value.tenantId
  
  // Tarik Data Roles & Seed Auto UMKM Owner
  onSnapshot(collection(db, 'tenants', tenantId, 'roles'), (snapshot) => {
    const loadedRoles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Sort agar UMKM Owner selalu berada di posisi paling atas tabel
    rolesList.value = loadedRoles.sort((a, b) => {
      if (a.nama_peran === 'UMKM Owner') return -1;
      if (b.nama_peran === 'UMKM Owner') return 1;
      return 0;
    })

    // AUTO-SEED: Buat dokumen UMKM Owner otomatis di database jika belum ada
    const ownerExists = loadedRoles.some(r => r.nama_peran === 'UMKM Owner')
    if (!ownerExists && systemModules.value.length > 0) {
      const allModIds = systemModules.value.filter(m => m.id !== 'tenants').map(m => m.id)
      addDoc(collection(db, 'tenants', tenantId, 'roles'), {
        nama_peran: 'UMKM Owner',
        permissions: allModIds,
        created_at: serverTimestamp()
      })
    }
  })
  
  // Tarik Data Branches
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => {
    branchesList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const openAddRoleDialog = () => {
  isEditingRole.value = false
  editRoleId.value = null
  formRole.value = { nama_peran: '', permissions: [] }
  dialogRole.value = true
}

const editRole = (role) => {
  isEditingRole.value = true
  editRoleId.value = role.id
  formRole.value = {
    nama_peran: role.nama_peran,
    permissions: [...(role.permissions || [])]
  }
  dialogRole.value = true
}

const deleteRole = async (id) => {
  if(confirm('Apakah Anda yakin ingin menghapus hak akses jabatan ini secara permanen?')) {
    try {
      await deleteDoc(doc(db, 'tenants', authState.value.tenantId, 'roles', id))
    } catch(e) { console.error("Gagal menghapus", e) }
  }
}

const saveRole = async () => {
  if (!formRole.value.nama_peran) return alert('Nama jabatan wajib diisi!')
  isSavingRole.value = true
  try {
    const roleData = {
      nama_peran: formRole.value.nama_peran,
      permissions: formRole.value.permissions,
      updated_at: serverTimestamp()
    }

    if (isEditingRole.value) {
      await updateDoc(doc(db, 'tenants', authState.value.tenantId, 'roles', editRoleId.value), roleData)
    } else {
      await addDoc(collection(db, 'tenants', authState.value.tenantId, 'roles'), {
        ...roleData,
        created_at: serverTimestamp()
      })
    }
    
    dialogRole.value = false; 
    formRole.value = { nama_peran: '', permissions: [] }
  } catch (error) { 
    console.error(error) 
  } finally { 
    isSavingRole.value = false 
  }
}

const saveBranch = async () => {
  if (!formBranch.value.nama_cabang) return alert('Nama cabang wajib diisi!')
  isSavingBranch.value = true
  try {
    await addDoc(collection(db, 'tenants', authState.value.tenantId, 'branches'), {
      nama_cabang: formBranch.value.nama_cabang,
      alamat: formBranch.value.alamat,
      created_at: serverTimestamp()
    })
    dialogBranch.value = false; formBranch.value = { nama_cabang: '', alamat: '' }
  } catch (error) { console.error(error) } finally { isSavingBranch.value = false }
}
</script>