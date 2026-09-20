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
        <!-- ========================================== -->
        <!-- TAB 1: JABATAN & AKSES (TETAP UTUH)          -->
        <!-- ========================================== -->
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
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editRole(role)"></v-btn>
                  <v-btn v-if="role.nama_peran !== 'UMKM Owner'" icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="deleteRole(role.id)"></v-btn>
                  <v-btn v-else icon="mdi-shield-lock-outline" variant="text" color="grey" size="small" title="Jabatan Inti tidak bisa dihapus"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- ========================================== -->
        <!-- TAB 2: LOKASI CABANG (DIPERBARUI)            -->
        <!-- ========================================== -->
        <v-window-item value="branches">
            <div class="pa-4 d-flex justify-end">
                <v-btn color="teal-darken-3" prepend-icon="mdi-store-plus" rounded="lg" elevation="1" class="text-none font-weight-bold" @click="openAddBranchDialog">
                Tambah Cabang
                </v-btn>
            </div>
            <v-divider></v-divider>
            
            <v-table hover class="bg-white">
                <thead class="bg-blue-grey-lighten-5">
                <tr>
                    <th class="font-weight-bold text-blue-grey-darken-3">Nama Cabang / Titik</th>
                    <th class="font-weight-bold text-blue-grey-darken-3">Alamat Lengkap</th>
                    <th class="font-weight-bold text-blue-grey-darken-3">Geofence (Radius)</th>
                    <th class="font-weight-bold text-blue-grey-darken-3 text-center">Status</th>
                    <th class="font-weight-bold text-blue-grey-darken-3 text-center">Aksi</th>
                </tr>
                </thead>
                <tbody>
              <tr v-for="branch in branchesList" :key="branch.id" :class="!branch.aktif && branch.aktif !== undefined ? 'bg-grey-lighten-4 opacity-70' : ''">
                <td class="font-weight-bold text-blue-grey-darken-4">
                  <v-icon start :color="branch.aktif === false ? 'grey' : 'teal-darken-3'" size="small">mdi-storefront</v-icon>
                  {{ branch.nama_cabang }}
                </td>
                <td class="text-blue-grey-darken-1 text-caption">{{ branch.alamat }}</td>
                <td class="text-blue-grey-darken-1 text-caption font-weight-mono">
                  <div v-if="branch.latitude && branch.longitude">
                    Lat: {{ branch.latitude }}<br>Lon: {{ branch.longitude }}<br>
                    <v-chip size="x-small" color="blue-grey" variant="flat" class="mt-1"><v-icon start>mdi-radius-outline</v-icon> {{ branch.radius || 50 }} meter</v-chip>
                  </div>
                  <div v-else class="font-italic text-error">Belum disetel</div>
                </td>
                <td class="text-center">
                  <v-chip size="small" :color="branch.aktif === false ? 'grey' : 'success'" variant="flat" class="font-weight-bold">
                    {{ branch.aktif === false ? 'Nonaktif' : 'Aktif' }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <v-btn icon="mdi-pencil-outline" variant="text" color="blue-darken-2" size="small" class="mr-1" @click="editBranch(branch)" title="Edit Data"></v-btn>
                  <v-btn 
                    :icon="branch.aktif === false ? 'mdi-archive-arrow-up-outline' : 'mdi-archive-arrow-down-outline'" 
                    variant="text" 
                    :color="branch.aktif === false ? 'success' : 'warning'" 
                    size="small" 
                    :title="branch.aktif === false ? 'Aktifkan Kembali' : 'Nonaktifkan Cabang'"
                    @click="toggleBranchStatus(branch)"
                  ></v-btn>
                </td>
              </tr>
              <tr v-if="branchesList.length === 0">
                <td colspan="5" class="text-center pa-8 text-blue-grey-lighten-2">
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
    <v-dialog v-model="dialogRole" max-width="600px" persistent scrollable>
      <v-card rounded="xl">
        <v-card-title class="pa-5 text-white d-flex align-center" :class="formRole.nama_peran === 'UMKM Owner' ? 'bg-deep-purple-darken-3' : 'bg-teal-darken-3'">
          <span class="font-weight-bold">{{ isEditingRole ? 'Edit Akses Jabatan' : 'Rakit Jabatan Baru' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogRole = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6" style="max-height: 60vh;">
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

    <!-- Dialog Tambah/Edit Cabang -->
    <v-dialog v-model="dialogBranch" max-width="600px" persistent scrollable>
      <v-card rounded="xl">
        <v-card-title class="pa-5 bg-teal-darken-3 text-white d-flex align-center">
          <v-icon start>mdi-store-marker-outline</v-icon>
          <span class="font-weight-bold">{{ isEditingBranch ? 'Edit Data Cabang' : 'Tambah Lokasi Cabang' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogBranch = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6" style="max-height: 65vh;">
          <v-text-field v-model="formBranch.nama_cabang" label="Nama Cabang (Misal: Cabang Utama, Gudang Timur)" variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4" hide-details></v-text-field>
          
          <v-divider class="mb-4 border-dashed"></v-divider>
          <div class="font-weight-bold text-teal-darken-3 mb-3"><v-icon start>mdi-map-marker-radius</v-icon> Pengaturan Geofencing (Absensi HR)</div>
          
          <!-- Tombol Peta Terintegrasi -->
          <v-text-field 
            :model-value="(formBranch.latitude && formBranch.longitude) ? `${formBranch.latitude}, ${formBranch.longitude}` : ''"
            label="Titik Lokasi (Koordinat Peta)" 
            readonly variant="outlined" density="comfortable" color="teal-darken-3" class="mb-4" 
            placeholder="Klik Set Peta untuk menentukan koordinat" hide-details
          >
            <template v-slot:append>
              <v-btn type="button" color="teal-darken-3" variant="tonal" prepend-icon="mdi-map-marker-radius" @click="openMapDialog" class="text-none font-weight-bold" height="48" style="margin-top: -8px;">
                Set Peta
              </v-btn>
            </template>
          </v-text-field>

          <v-textarea v-model="formBranch.alamat" label="Alamat Lengkap (Terisi Otomatis via Peta)" variant="outlined" color="teal-darken-3" rows="2" class="mb-4" hide-details></v-textarea>
          <v-text-field v-model.number="formBranch.radius" label="Radius Toleransi Absen (Meter)" type="number" variant="outlined" density="comfortable" color="teal-darken-3" hint="Jarak maksimal karyawan bisa melakukan absen dari titik pusat (Disarankan: 50 - 100 meter)" persistent-hint></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="blue-grey-darken-1" variant="text" class="font-weight-bold text-none" @click="dialogBranch = false">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" class="px-6 font-weight-bold text-none" @click="saveBranch" :loading="isSavingBranch">Simpan Data</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Map Google Maps (Dari Bogalink) -->
    <v-dialog v-model="mapDialog" max-width="550" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-4 bg-blue-grey-darken-4 text-white d-flex align-center">
          <v-icon start>mdi-google-maps</v-icon>
          <span class="font-weight-bold">Tentukan Lokasi Cabang</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="mapDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-btn block color="teal-darken-3" prepend-icon="mdi-crosshairs-gps" @click="getAutoGPS" :loading="isLoadingGps" class="mb-4 text-none font-weight-bold" rounded="lg" variant="tonal">
            Gunakan GPS Perangkat Saat Ini
          </v-btn>

          <div class="text-caption font-weight-bold mb-1 text-blue-grey-darken-1">Pratinjau Koordinat:</div>
          <v-text-field v-model="tempLokasi" variant="outlined" density="compact" class="mb-3" color="teal-darken-3" hide-details readonly></v-text-field>

          <v-card height="250" variant="outlined" class="bg-grey-lighten-2 d-flex align-center justify-center overflow-hidden border">
            <GoogleMap :api-key="GOOGLE_MAPS_API_KEY" style="width: 100%; height: 100%" :center="mapCenter" :zoom="16" @click="onMapClick">
              <Marker :options="{ position: markerPosition, draggable: true }" @dragend="onMarkerDragEnd" />
            </GoogleMap>            
          </v-card>
          <div class="text-caption text-grey-darken-1 mt-2 font-italic">
            *Anda bisa menggeser pin merah atau mengklik area peta untuk mengatur lokasi.
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="blue-grey-darken-1" variant="text" @click="mapDialog = false" class="text-none font-weight-bold">Batal</v-btn>
          <v-btn color="teal-darken-3" variant="elevated" rounded="lg" @click="saveLokasi" :disabled="!tempLokasi" :loading="isFetchingAddress" class="text-none font-weight-bold px-6">Konfirmasi Lokasi</v-btn>
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

// Impor komponen peta Google
import { GoogleMap, Marker } from 'vue3-google-map'

const tab = ref('roles')

// Konfigurasi Peta
const GOOGLE_MAPS_API_KEY = "AIzaSyD8TZaEr95t_kdfKf-R4IekQSUMErAg-Fs" // Key Peta dari Bogalink
const mapDialog = ref(false)
const tempLokasi = ref('')
const tempLat = ref(0)
const tempLng = ref(0)
const isLoadingGps = ref(false)
const isFetchingAddress = ref(false)
const mapCenter = ref({ lat: -7.213688, lng: 107.912136 }) // Koordinat Default (Garut)
const markerPosition = ref({ lat: -7.213688, lng: 107.912136 })

// State Roles (TETAP UTUH)
const dialogRole = ref(false)
const isSavingRole = ref(false)
const isEditingRole = ref(false)
const editRoleId = ref(null)
const rolesList = ref([])
const formRole = ref({ nama_peran: '', permissions: [] })

// State Branches (DIPERBARUI)
const dialogBranch = ref(false)
const isSavingBranch = ref(false)
const isEditingBranch = ref(false)
const editBranchId = ref(null)
const branchesList = ref([])

// Form bawaan disetel dengan radius default 50 meter
const formBranch = ref({ nama_cabang: '', alamat: '', latitude: '', longitude: '', radius: 50 })

const availableModules = computed(() => {
  return systemModules.value.filter(m => m.id !== 'tenants')
})

const getModuleName = (id) => systemModules.value.find(m => m.id === id)?.name || id

onMounted(() => {
  const tenantId = authState.value.tenantId
  
  onSnapshot(collection(db, 'tenants', tenantId, 'roles'), (snapshot) => {
    const loadedRoles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    rolesList.value = loadedRoles.sort((a, b) => {
      if (a.nama_peran === 'UMKM Owner') return -1;
      if (b.nama_peran === 'UMKM Owner') return 1;
      return 0;
    })

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
  
  onSnapshot(collection(db, 'tenants', tenantId, 'branches'), (snapshot) => {
    const loadedBranches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    branchesList.value = loadedBranches.sort((a, b) => {
      const aAktif = a.aktif === false ? 0 : 1
      const bAktif = b.aktif === false ? 0 : 1
      return bAktif - aAktif
    })
  })
})

// ==========================================
// ENGINE GOOGLE MAPS
// ==========================================
const updateTempLokasi = (lat, lng) => {
  tempLat.value = lat; 
  tempLng.value = lng;
  tempLokasi.value = `${lat}, ${lng}`;
  mapCenter.value = { lat, lng }; 
  markerPosition.value = { lat, lng };
}

const openMapDialog = () => {
  if (formBranch.value.latitude && formBranch.value.longitude) {
    updateTempLokasi(formBranch.value.latitude, formBranch.value.longitude);
  } else {
    // Pusat Default (Garut) jika cabang baru
    updateTempLokasi(-7.213688, 107.912136); 
  }
  mapDialog.value = true
}

const getAutoGPS = () => {
  isLoadingGps.value = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => { 
        updateTempLokasi(pos.coords.latitude, pos.coords.longitude); 
        isLoadingGps.value = false; 
      },
      (err) => { 
        alert('Gagal mendapatkan koordinat GPS. Pastikan peramban diizinkan mengakses lokasi.'); 
        isLoadingGps.value = false; 
      },
      { enableHighAccuracy: true }
    )
  } else {
    alert("Browser Anda tidak mendukung fitur Lokasi GPS.");
    isLoadingGps.value = false;
  }
}

const onMarkerDragEnd = (event) => updateTempLokasi(event.latLng.lat(), event.latLng.lng())
const onMapClick = (event) => updateTempLokasi(event.latLng.lat(), event.latLng.lng())

const saveLokasi = async () => {
  formBranch.value.latitude = tempLat.value; 
  formBranch.value.longitude = tempLng.value;
  
  isFetchingAddress.value = true;
  try {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(tempLat.value), lng: parseFloat(tempLng.value) };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        formBranch.value.alamat = results[0].formatted_address; // Auto-fill alamat
      }
      isFetchingAddress.value = false; 
      mapDialog.value = false; 
    });
  } catch (error) {
    isFetchingAddress.value = false; 
    mapDialog.value = false;
  }
}

// ==========================================
// FUNGSI JABATAN (ROLES)
// ==========================================
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

// ==========================================
// FUNGSI CABANG (BRANCHES)
// ==========================================
const openAddBranchDialog = () => {
  isEditingBranch.value = false
  editBranchId.value = null
  formBranch.value = { nama_cabang: '', alamat: '', latitude: '', longitude: '', radius: 50 }
  dialogBranch.value = true
}

const editBranch = (branch) => {
  isEditingBranch.value = true
  editBranchId.value = branch.id
  formBranch.value = {
    nama_cabang: branch.nama_cabang,
    alamat: branch.alamat,
    latitude: branch.latitude || '',
    longitude: branch.longitude || '',
    radius: branch.radius || 50
  }
  dialogBranch.value = true
}

const toggleBranchStatus = async (branch) => {
  const currentStatus = branch.aktif === false ? false : true
  const actionText = currentStatus ? 'MENONAKTIFKAN' : 'MENGAKTIFKAN KEMBALI'
  
  if(confirm(`Apakah Anda yakin ingin ${actionText} cabang ${branch.nama_cabang}? (Data riwayat tetap aman)`)) {
    try {
      await updateDoc(doc(db, 'tenants', authState.value.tenantId, 'branches', branch.id), {
        aktif: !currentStatus,
        updated_at: serverTimestamp()
      })
    } catch(e) { console.error("Gagal mengubah status cabang:", e) }
  }
}

const saveBranch = async () => {
  if (!formBranch.value.nama_cabang) return alert('Nama cabang wajib diisi!')
  
  isSavingBranch.value = true
  try {
    const branchData = {
      nama_cabang: formBranch.value.nama_cabang,
      alamat: formBranch.value.alamat,
      latitude: formBranch.value.latitude ? parseFloat(formBranch.value.latitude) : null,
      longitude: formBranch.value.longitude ? parseFloat(formBranch.value.longitude) : null,
      radius: formBranch.value.radius ? parseInt(formBranch.value.radius) : 50,
      updated_at: serverTimestamp()
    }

    if (isEditingBranch.value) {
      await updateDoc(doc(db, 'tenants', authState.value.tenantId, 'branches', editBranchId.value), branchData)
    } else {
      await addDoc(collection(db, 'tenants', authState.value.tenantId, 'branches'), {
        ...branchData,
        aktif: true,
        created_at: serverTimestamp()
      })
    }
    
    dialogBranch.value = false; 
  } catch (error) { 
    console.error(error) 
  } finally { 
    isSavingBranch.value = false 
  }
}
</script>