<!-- file: frontend/src/pages/tenants/index.vue -->
<template>
  <v-container fluid class="pa-0">
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-blue-grey-darken-4">Pusat Kendali Super Admin</h2>
      <p class="text-body-2 text-blue-grey-lighten-1">Kelola pendaftaran klien UMKM (Tenant) dan konfigurasi Modul Global SaaS Anda.</p>
    </div>

    <v-card elevation="0" rounded="xl" class="border-sm bg-white overflow-hidden">
      <v-tabs v-model="tab" color="deep-purple-darken-3" bg-color="blue-grey-lighten-5">
        <v-tab value="tenants" class="font-weight-bold text-none"><v-icon start>mdi-domain</v-icon> Daftar Klien (UMKM)</v-tab>
        <v-tab value="modules" class="font-weight-bold text-none"><v-icon start>mdi-view-grid-plus</v-icon> Registry Modul Global</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- ========================================== -->
        <!-- TAB 1: KELOLA KLIEN UMKM (TENANT ONBOARDING) -->
        <!-- ========================================== -->
        <v-window-item value="tenants">
          <div class="pa-4 d-flex justify-end">
            <v-btn color="deep-purple-darken-3" prepend-icon="mdi-domain-plus" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openTenantDialog">
              Daftarkan UMKM Baru
            </v-btn>
          </div>
          <v-divider></v-divider>

          <v-table hover class="bg-white">
            <thead class="bg-blue-grey-lighten-5">
              <tr>
                <th class="font-weight-bold text-blue-grey-darken-3">Nama Perusahaan (UMKM)</th>
                <th class="font-weight-bold text-blue-grey-darken-3">Tenant ID (Database)</th>
                <th class="font-weight-bold text-blue-grey-darken-3">Nama Pemilik</th>
                <th class="font-weight-bold text-blue-grey-darken-3">Email Pemilik</th>
                <th class="text-center font-weight-bold text-blue-grey-darken-3">Status</th>
                <th class="text-center font-weight-bold text-blue-grey-darken-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tenant in tenantsList" :key="tenant.id">
                <td class="font-weight-bold text-blue-grey-darken-4">
                  <v-icon start color="blue-grey-lighten-2" size="small">mdi-storefront</v-icon>
                  {{ tenant.nama_perusahaan }}
                </td>
                <td class="text-blue-grey-darken-1 text-caption font-weight-mono">{{ tenant.id }}</td>
                <td class="text-blue-grey-darken-3 font-weight-medium">{{ tenant.nama_pemilik }}</td>
                <td class="text-deep-purple-darken-2">{{ tenant.email_pemilik }}</td>
                <td class="text-center">
                  <v-chip size="small" :color="tenant.aktif ? 'success' : 'error'" variant="flat" class="font-weight-bold">
                    {{ tenant.aktif ? 'Aktif' : 'Nonaktif / Suspend' }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" title="Edit Profil & Paket Langganan" @click="editTenant(tenant)"></v-btn>
                  <v-btn :icon="tenant.aktif ? 'mdi-lock-outline' : 'mdi-lock-open-outline'" variant="text" :color="tenant.aktif ? 'error' : 'success'" size="small" :title="tenant.aktif ? 'Nonaktifkan UMKM' : 'Aktifkan Kembali UMKM'" @click="toggleTenantStatus(tenant)"></v-btn>
                </td>
              </tr>
              <tr v-if="tenantsList.length === 0">
                <td colspan="6" class="text-center pa-8 text-blue-grey-lighten-2">
                  <v-icon size="48" class="mb-2">mdi-domain-off</v-icon>
                  <p>Belum ada UMKM yang terdaftar. Ayo cari klien pertama Anda!</p>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- ========================================== -->
        <!-- TAB 2: REGISTRY MODUL GLOBAL (SaaS CONFIG) -->
        <!-- ========================================== -->
        <!-- ... (Kode Tab Registry Modul tetap utuh) ... -->
        <v-window-item value="modules">
          <div class="pa-4 d-flex justify-end">
            <v-btn color="indigo-darken-3" prepend-icon="mdi-plus-box" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openModuleDialog">
              Daftarkan Modul Baru
            </v-btn>
          </div>
          <v-divider></v-divider>
          
          <v-table hover class="bg-white">
            <thead class="bg-indigo-lighten-5">
              <tr>
                <th class="font-weight-bold text-indigo-darken-4" width="80">Urutan</th>
                <th class="font-weight-bold text-indigo-darken-4">ID Modul (Key)</th>
                <th class="font-weight-bold text-indigo-darken-4">Folder Induk (Parent)</th>
                <th class="font-weight-bold text-indigo-darken-4">Nama Modul & Ikon</th>
                <th class="font-weight-bold text-indigo-darken-4">Route URL</th>
                <th class="font-weight-bold text-indigo-darken-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mod in sortedSystemModules" :key="mod.id">
                <td class="font-weight-black text-indigo-darken-2 text-center">{{ mod.urutan || mod.order }}</td>
                <td class="font-weight-bold text-blue-grey-darken-4">
                  <v-chip size="small" variant="tonal" color="blue-grey-darken-3">{{ mod.id }}</v-chip>
                </td>
                <td class="text-blue-grey-darken-2 font-weight-medium text-caption">
                  <v-icon start size="x-small" v-if="mod.parent_group">{{ mod.parent_icon || 'mdi-folder' }}</v-icon>
                  {{ mod.parent_group || 'Tanpa Parent (Flat)' }}
                </td>
                <td class="font-weight-bold text-indigo-darken-3">
                  <v-icon start size="small">{{ mod.icon }}</v-icon> {{ mod.name }}
                </td>
                <td class="text-blue-grey-darken-1 font-italic text-caption">{{ mod.route }}</td>
                <td class="text-center">
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editModule(mod)"></v-btn>
                  <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteModule(mod.id)" :disabled="mod.id === 'dashboard' || mod.id === 'tenants'"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- ========================================== -->
    <!-- DIALOG: PENDAFTARAN & EDIT KLIEN UMKM      -->
    <!-- ========================================== -->
    <v-dialog v-model="dialogTenant" max-width="700px" persistent scrollable>
      <v-card rounded="xl" color="white" max-height="90vh" class="d-flex flex-column">
        <v-card-title class="pa-5 bg-deep-purple-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>{{ isEditingTenant ? 'mdi-domain-edit' : 'mdi-rocket-launch' }}</v-icon>
          <span class="font-weight-bold">{{ isEditingTenant ? 'Edit Konfigurasi & Paket UMKM' : 'Onboarding Klien UMKM' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeTenantDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 flex-grow-1 overflow-y-auto bg-grey-lighten-4">
          <v-form @submit.prevent="saveTenant">
            <div class="pa-5 bg-white rounded border mb-4">
              <div class="font-weight-bold text-blue-grey-darken-3 mb-2">Profil Usaha & Owner</div>
              <v-text-field 
                v-model="formTenant.perusahaan" 
                label="Nama Perusahaan / Merek" 
                variant="outlined" density="comfortable" color="deep-purple-darken-3" class="mb-4" hide-details="auto"
                :readonly="isEditingTenant" :hint="isEditingTenant ? 'Nama perusahaan menjadi ID Database dan tidak bisa diubah.' : ''" persistent-hint
              ></v-text-field>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="formTenant.nama_pemilik" label="Nama Lengkap Owner" variant="outlined" density="comfortable" color="deep-purple-darken-3" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field 
                    v-model="formTenant.email_pemilik" 
                    label="Email Login Owner" type="email" 
                    variant="outlined" density="comfortable" color="deep-purple-darken-3" hide-details="auto"
                    :readonly="isEditingTenant" :class="isEditingTenant ? 'bg-grey-lighten-4 text-grey' : ''"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <div class="pa-5 bg-white rounded border">
              <div class="font-weight-bold text-deep-purple-darken-3 mb-1">Paket Langganan (Modul yang Diizinkan)</div>
              <p class="text-caption text-blue-grey-darken-1 mb-3">
                Ubah paket langganan dengan mencentang modul untuk membuka akses "UMKM Owner" di workspace ini.
              </p>
              
              <div v-if="isLoadingPermissions" class="d-flex justify-center py-4">
                <v-progress-circular indeterminate color="deep-purple-darken-3"></v-progress-circular>
              </div>
              
              <v-row dense v-else>
                <v-col cols="12" sm="6" v-for="modul in availableTenantModules" :key="modul.id" class="py-1">
                  <v-checkbox 
                    v-model="formTenant.modules" 
                    :value="modul.id" 
                    :label="modul.name" 
                    color="deep-purple-darken-3" 
                    density="compact" hide-details
                  ></v-checkbox>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t flex-shrink-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="closeTenantDialog">Batal</v-btn>
          <v-btn color="deep-purple-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveTenant" :loading="isSavingTenant" :disabled="!formTenant.perusahaan || !formTenant.email_pemilik">
            {{ isEditingTenant ? 'Simpan Perubahan' : 'Ciptakan Ruang Kerja' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- DIALOG: REGISTRASI MODUL GLOBAL            -->
    <!-- ========================================== -->
    <!-- ... (Kode Dialog Module & Icon Picker tetap persis sama) ... -->
    <v-dialog v-model="dialogModule" max-width="600px" persistent scrollable>
      <v-card rounded="xl" color="white" max-height="90vh" class="d-flex flex-column">
        <v-card-title class="pa-5 bg-indigo-darken-3 text-white d-flex align-center flex-shrink-0">
          <v-icon start>mdi-application-cog</v-icon>
          <span class="font-weight-bold">{{ isEditingModule ? 'Edit Konfigurasi Modul' : 'Registrasi Modul Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogModule = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 flex-grow-1 overflow-y-auto">
          <v-alert type="info" variant="tonal" density="compact" class="mb-5 text-caption">
            Mengatur Parent Folder secara otomatis akan mengelompokkan modul ke dalam menu bersarang (Nested Menu). Kosongkan jika ingin menu berdiri sendiri.
          </v-alert>

          <v-text-field 
            v-model="formModule.id" 
            label="ID Modul (Key Database)" 
            variant="outlined" density="comfortable" color="indigo-darken-3" class="mb-3"
            :readonly="isEditingModule" :hint="isEditingModule ? 'Key tidak bisa diubah' : 'Gunakan huruf kecil, contoh: hrd, payroll'" persistent-hint
          ></v-text-field>
          
          <v-divider class="mb-4 mt-2 border-dashed"></v-divider>
          <div class="text-caption font-weight-bold text-indigo-darken-3 mb-2">IDENTITAS MODUL</div>
          
          <v-text-field v-model="formModule.name" label="Nama Modul (Anak)" variant="outlined" density="comfortable" color="indigo-darken-3" class="mb-3" hide-details="auto"></v-text-field>

          <v-row class="mb-1 mt-1">
            <v-col cols="8">
              <v-text-field v-model="formModule.icon" label="Ikon Modul (MDI)" variant="outlined" density="comfortable" color="indigo-darken-3" hide-details="auto">
                <template v-slot:append-inner>
                  <v-btn icon="mdi-card-search-outline" variant="text" density="compact" color="indigo-darken-3" @click="openIconPicker('module')"></v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4" class="d-flex align-center justify-center bg-grey-lighten-4 rounded border">
              <v-icon size="32" color="indigo-darken-3">{{ formModule.icon || 'mdi-help-circle-outline' }}</v-icon>
            </v-col>
          </v-row>

          <v-divider class="mb-4 mt-4 border-dashed"></v-divider>
          <div class="text-caption font-weight-bold text-blue-grey-darken-2 mb-2">PENGATURAN FOLDER MENU (OPSIONAL)</div>

          <v-combobox
            v-model="formModule.parent_group"
            :items="existingParentGroups"
            label="Nama Folder Induk (Parent Menu)"
            hint="Kosongkan jika ingin menjadi menu utama" persistent-hint clearable
            variant="outlined" density="comfortable" color="blue-grey-darken-2" class="mb-3"
            @update:modelValue="handleParentGroupChange"
          ></v-combobox>

          <v-row class="mb-1 mt-1" v-if="formModule.parent_group">
            <v-col cols="8">
              <v-text-field 
                v-model="formModule.parent_icon" 
                label="Ikon Folder Induk" 
                variant="outlined" density="comfortable" color="blue-grey-darken-2" hide-details="auto"
                :readonly="isExistingParent"
                :class="isExistingParent ? 'bg-grey-lighten-4 text-grey-darken-2' : ''"
              >
                <template v-slot:append-inner v-if="!isExistingParent">
                  <v-btn icon="mdi-card-search-outline" variant="text" density="compact" color="blue-grey-darken-2" @click="openIconPicker('parent')"></v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4" class="d-flex align-center justify-center bg-grey-lighten-4 rounded border">
              <v-icon size="32" color="blue-grey-darken-2">{{ formModule.parent_icon || 'mdi-folder-outline' }}</v-icon>
            </v-col>
          </v-row>

          <v-divider class="mb-4 mt-4 border-dashed"></v-divider>
          
          <v-row>
            <v-col cols="8">
              <v-text-field v-model="formModule.route" label="Path URL (Dimulai dengan /)" variant="outlined" density="comfortable" color="indigo-darken-3" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number="formModule.urutan" label="Urutan" type="number" variant="outlined" density="comfortable" color="indigo-darken-3" hide-details="auto"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t flex-shrink-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="blue-grey-darken-1" class="font-weight-bold" @click="dialogModule = false">Batal</v-btn>
          <v-btn color="indigo-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveModule" :loading="isSavingModule" :disabled="!formModule.id || !formModule.name || !formModule.route">
            Simpan Konfigurasi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogIconPicker" max-width="500px" scrollable>
      <v-card rounded="xl">
        <v-card-title class="bg-indigo-lighten-5 text-indigo-darken-4 d-flex align-center pa-4">
          <v-icon start>mdi-emoticon-outline</v-icon>
          <span class="font-weight-bold">Pilih Ikon ERP</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialogIconPicker = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-4" style="height: 400px;">
          <v-text-field v-model="searchIcon" prepend-inner-icon="mdi-magnify" label="Cari ikon..." variant="outlined" density="compact" color="indigo-darken-3" hide-details class="mb-4" clearable></v-text-field>
          <v-row>
            <v-col cols="3" sm="2" v-for="icon in filteredIcons" :key="icon" class="text-center">
              <v-card hover flat class="pa-2 border bg-grey-lighten-5" @click="selectIcon(icon)">
                <v-icon size="32" color="blue-grey-darken-3">{{ icon }}</v-icon>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, onSnapshot, addDoc, setDoc, doc, updateDoc, serverTimestamp, deleteDoc, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { systemModules } from '../../store/modules'

const tab = ref('tenants')

// --- STATE: KELOLA KLIEN UMKM ---
const dialogTenant = ref(false)
const isSavingTenant = ref(false)
const isEditingTenant = ref(false)
const editTenantId = ref(null)
const isLoadingPermissions = ref(false)
const tenantsList = ref([])

const formTenant = ref({ perusahaan: '', nama_pemilik: '', email_pemilik: '', modules: [] })

const availableTenantModules = computed(() => {
  return systemModules.value.filter(m => m.id !== 'tenants')
})

// --- STATE: REGISTRY MODUL GLOBAL ---
const dialogModule = ref(false)
const isSavingModule = ref(false)
const isEditingModule = ref(false)
const formModule = ref({ id: '', name: '', icon: 'mdi-', route: '/', urutan: 0, parent_group: '', parent_icon: '' })

const sortedSystemModules = computed(() => [...systemModules.value].sort((a, b) => (a.urutan || 0) - (b.urutan || 0)))

const parentGroupMap = computed(() => {
  const groups = {}
  systemModules.value.forEach(mod => {
    if (mod.parent_group && !groups[mod.parent_group]) {
      groups[mod.parent_group] = mod.parent_icon || 'mdi-folder-outline'
    }
  })
  return groups
})

const existingParentGroups = computed(() => Object.keys(parentGroupMap.value))

const isExistingParent = computed(() => formModule.value.parent_group && parentGroupMap.value[formModule.value.parent_group])

const handleParentGroupChange = (val) => {
  if (val && parentGroupMap.value[val]) {
    formModule.value.parent_icon = parentGroupMap.value[val]
  } else if (!val) {
    formModule.value.parent_icon = ''
  }
}

// --- STATE: ICON PICKER ---
const dialogIconPicker = ref(false)
const searchIcon = ref('')
const activeIconTarget = ref('module') 

const mdiIcons = [
  'mdi-view-dashboard', 'mdi-cash-register', 'mdi-package-variant-closed', 'mdi-store-outline',
  'mdi-truck-delivery', 'mdi-robot-industrial-outline', 'mdi-account-group', 'mdi-cog', 'mdi-cog-outline',
  'mdi-domain', 'mdi-chart-line', 'mdi-chart-bar', 'mdi-chart-pie', 'mdi-finance',
  'mdi-wallet', 'mdi-bank', 'mdi-receipt', 'mdi-file-document-outline', 'mdi-truck',
  'mdi-store', 'mdi-cart', 'mdi-basket', 'mdi-tag', 'mdi-sale', 'mdi-account-tie',
  'mdi-account-cash', 'mdi-calculator', 'mdi-calendar-clock', 'mdi-clipboard-text', 'mdi-clipboard-check-multiple-outline',
  'mdi-database', 'mdi-database-outline', 'mdi-email', 'mdi-folder', 'mdi-folder-outline', 'mdi-home', 'mdi-lock', 'mdi-map-marker',
  'mdi-shield-check', 'mdi-star', 'mdi-wrench', 'mdi-book-open-page-variant', 'mdi-warehouse',
  'mdi-briefcase', 'mdi-bullhorn', 'mdi-cash-multiple', 'mdi-certificate', 'mdi-clipboard-check',
  'mdi-coffee', 'mdi-food-fork-drink', 'mdi-silverware', 'mdi-monitor-dashboard', 'mdi-point-of-sale'
]

const filteredIcons = computed(() => {
  if (!searchIcon.value) return mdiIcons
  const keyword = searchIcon.value.toLowerCase()
  return mdiIcons.filter(icon => icon.toLowerCase().includes(keyword))
})

const openIconPicker = (target) => {
  activeIconTarget.value = target; searchIcon.value = ''; dialogIconPicker.value = true
}

const selectIcon = (icon) => {
  if (activeIconTarget.value === 'module') formModule.value.icon = icon
  if (activeIconTarget.value === 'parent') formModule.value.parent_icon = icon
  dialogIconPicker.value = false
}

onMounted(() => {
  const tenantsRef = collection(db, 'tenants')
  onSnapshot(tenantsRef, (snapshot) => {
    tenantsList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

// ==========================================
// FUNGSI: KELOLA KLIEN UMKM (TENANT)
// ==========================================
const openTenantDialog = () => {
  isEditingTenant.value = false
  editTenantId.value = null
  formTenant.value = {
    perusahaan: '', nama_pemilik: '', email_pemilik: '',
    modules: availableTenantModules.value.map(m => m.id)
  }
  dialogTenant.value = true
}

const editTenant = async (tenant) => {
  isEditingTenant.value = true
  editTenantId.value = tenant.id
  isLoadingPermissions.value = true
  
  formTenant.value = {
    perusahaan: tenant.nama_perusahaan,
    nama_pemilik: tenant.nama_pemilik,
    email_pemilik: tenant.email_pemilik,
    modules: [] // Dikosongkan sementara menunggu data dari database
  }
  
  dialogTenant.value = true

  // Menarik paket langganan aktual dari database role UMKM Owner
  try {
    const rolesRef = collection(db, 'tenants', tenant.id, 'roles')
    const q = query(rolesRef, where('nama_peran', '==', 'UMKM Owner'))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      formTenant.value.modules = snapshot.docs[0].data().permissions || []
    }
  } catch (e) {
    console.error("Gagal menarik konfigurasi langganan:", e)
  } finally {
    isLoadingPermissions.value = false
  }
}

const toggleTenantStatus = async (tenant) => {
  const actionText = tenant.aktif ? 'MENONAKTIFKAN' : 'MENGAKTIFKAN KEMBALI'
  if (confirm(`Peringatan: Apakah Anda yakin ingin ${actionText} akses untuk seluruh pengguna di ruang kerja ${tenant.nama_perusahaan}?`)) {
    try {
      // 1. Ubah status aktif di profil tenant
      await updateDoc(doc(db, 'tenants', tenant.id), {
        aktif: !tenant.aktif,
        updated_at: serverTimestamp()
      })
      
      // 2. Ubah status aktif secara massal (batch) pada semua akun pengguna (users) di dalam tenant tersebut
      const usersRef = collection(db, 'tenants', tenant.id, 'users')
      const snapshot = await getDocs(usersRef)
      
      if (!snapshot.empty) {
        const batch = writeBatch(db)
        snapshot.docs.forEach(userDoc => {
          batch.update(doc(db, 'tenants', tenant.id, 'users', userDoc.id), {
            aktif: !tenant.aktif
          })
        })
        await batch.commit()
      }
    } catch (e) {
      console.error("Gagal mengubah status tenant:", e)
      alert("Terjadi kesalahan jaringan.")
    }
  }
}

const closeTenantDialog = () => {
  dialogTenant.value = false
}

const saveTenant = async () => {
  if (!formTenant.value.perusahaan || !formTenant.value.nama_pemilik || !formTenant.value.email_pemilik) {
    alert('Semua kolom wajib diisi!')
    return
  }

  isSavingTenant.value = true
  try {
    if (isEditingTenant.value) {
      // MENGEDIT TENANT & PAKET LANGGANAN
      const tenantId = editTenantId.value
      
      await updateDoc(doc(db, 'tenants', tenantId), {
        nama_pemilik: formTenant.value.nama_pemilik,
        updated_at: serverTimestamp()
      })

      const rolesRef = collection(db, 'tenants', tenantId, 'roles')
      const q = query(rolesRef, where('nama_peran', '==', 'UMKM Owner'))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const roleDocId = snapshot.docs[0].id
        await updateDoc(doc(db, 'tenants', tenantId, 'roles', roleDocId), {
          permissions: formTenant.value.modules,
          updated_at: serverTimestamp()
        })
      } else {
        // Fallback jika anehnya belum ada
        await addDoc(rolesRef, {
          nama_peran: 'UMKM Owner',
          permissions: formTenant.value.modules,
          created_at: serverTimestamp()
        })
      }
    } else {
      // MENDAFTARKAN TENANT BARU (Seperti sebelumnya)
      const randomNum = Math.floor(Math.random() * 1000)
      const tenantId = formTenant.value.perusahaan.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + randomNum

      await setDoc(doc(db, 'tenants', tenantId), {
        nama_perusahaan: formTenant.value.perusahaan,
        nama_pemilik: formTenant.value.nama_pemilik,
        email_pemilik: formTenant.value.email_pemilik,
        aktif: true,
        created_at: serverTimestamp()
      })

      const usersRef = collection(db, 'tenants', tenantId, 'users')
      await addDoc(usersRef, {
        nama: formTenant.value.nama_pemilik,
        email: formTenant.value.email_pemilik,
        role: 'UMKM Owner',
        branch_id: null,
        aktif: true,
        created_at: serverTimestamp()
      })

      const rolesRef = collection(db, 'tenants', tenantId, 'roles')
      await addDoc(rolesRef, {
        nama_peran: 'UMKM Owner',
        permissions: formTenant.value.modules,
        created_at: serverTimestamp()
      })
    }

    closeTenantDialog()
  } catch (error) {
    console.error("Gagal memproses data tenant:", error)
    alert("Terjadi kesalahan sistem saat menyimpan UMKM.")
  } finally {
    isSavingTenant.value = false
  }
}

// ==========================================
// FUNGSI: REGISTRY MODUL GLOBAL
// ==========================================
const openModuleDialog = () => {
  isEditingModule.value = false
  formModule.value = { id: '', name: '', icon: 'mdi-', route: '/', urutan: sortedSystemModules.value.length + 10, parent_group: '', parent_icon: '' }
  dialogModule.value = true
}

const editModule = (mod) => {
  isEditingModule.value = true
  formModule.value = { ...mod, urutan: mod.urutan || mod.order || 0, parent_group: mod.parent_group || '', parent_icon: mod.parent_icon || '' }
  dialogModule.value = true
}

const deleteModule = async (id) => {
  if (confirm(`PERINGATAN GLOBAL! Menghapus modul ini akan menghilangkannya dari seluruh klien UMKM Anda. Yakin hapus modul ${id}?`)) {
    try { await deleteDoc(doc(db, 'system_modules', id)) } catch (error) { console.error("Gagal menghapus modul:", error) }
  }
}

const saveModule = async () => {
  if (!formModule.value.id) return
  isSavingModule.value = true
  try {
    const modRef = doc(db, 'system_modules', formModule.value.id.toLowerCase().trim())
    await setDoc(modRef, {
      name: formModule.value.name, icon: formModule.value.icon, route: formModule.value.route, urutan: Number(formModule.value.urutan),
      parent_group: formModule.value.parent_group || '', parent_icon: formModule.value.parent_icon || ''
    }, { merge: true })
    dialogModule.value = false
  } catch (error) { console.error("Gagal menyimpan modul:", error) } finally { isSavingModule.value = false }
}
</script>