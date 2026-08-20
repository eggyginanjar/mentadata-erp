<!-- file: frontend/src/App.vue -->
<template>
  <v-app>
    <!-- 1. NAVIGATION DRAWER -->
    <v-navigation-drawer v-if="route.name !== 'Login'" v-model="drawer" color="blue-grey-darken-4" theme="dark">
      <v-list-item
        :prepend-avatar="`https://api.dicebear.com/7.x/initials/svg?seed=${authState.nama}&backgroundColor=004D40`"
        :title="authState.nama"
        :subtitle="authState.role" 
        class="py-4"
      ></v-list-item>
      <v-divider></v-divider>

      <!-- MENU NAVIGASI DINAMIS (NESTED / PARENT-CHILD) -->
      <v-list v-model:opened="openGroups" density="compact" nav>
        <template v-for="menu in menuLayout" :key="menu.id || menu.name">
          
          <!-- JIKA MENU BERDIRI SENDIRI (FLAT) -->
          <v-list-item
            v-if="menu.type === 'item'"
            :prepend-icon="menu.icon"
            :title="menu.name"
            :to="menu.route"
            color="teal-lighten-4"
            class="mb-1 rounded-r-pill font-weight-medium"
          ></v-list-item>

          <!-- JIKA MENU MEMILIKI SUB-MENU (GROUPED) -->
          <v-list-group v-else :value="menu.name">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="menu.icon"
                :title="menu.name"
                class="mb-1 rounded-r-pill font-weight-medium"
                active-color="teal-lighten-4"
              ></v-list-item>
            </template>

            <!-- DAFTAR ANAK (CHILD ITEMS) -->
            <v-list-item
              v-for="child in menu.items"
              :key="child.id"
              :prepend-icon="child.icon"
              :title="child.name"
              :to="child.route"
              color="teal-lighten-4"
              class="mb-1 rounded-r-pill ml-2"
              density="compact"
            ></v-list-item>
          </v-list-group>

        </template>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-4">
          <v-btn block color="error" variant="tonal" prepend-icon="mdi-logout" @click="handleLogout">
            Keluar
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 2. APP BAR -->
    <v-app-bar v-if="route.name !== 'Login'" elevation="1" color="white">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title class="text-h6 font-weight-bold text-blue-grey-darken-3">Mentadata Workspace</v-app-bar-title>
      <v-spacer></v-spacer>
      
      <span class="mr-4 text-body-2 font-weight-medium text-blue-grey-darken-2 d-none d-sm-flex">
        Halo, {{ authState.nama }}
      </span>

      <v-btn icon>
        <v-badge color="error" content="3">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
    </v-app-bar>

    <!-- 3. MAIN CONTENT -->
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from './firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, collectionGroup, query, where, getDocs } from 'firebase/firestore'
import { authState } from './store/auth'
import { systemModules, fetchSystemModules, seedSystemModulesIfEmpty } from './store/modules'

const route = useRoute()
const router = useRouter()
const drawer = ref(true)
const openGroups = ref([]) // Menyimpan state folder menu yang sedang terbuka

// 1. FILTER DASAR: Hanya ambil modul yang diizinkan untuk pengguna ini
const visibleMenus = computed(() => {
  return systemModules.value.filter(item => authState.value.permissions.includes(item.id))
})

// 2. MESIN PENGELOMPOKAN (DYNAMIC GROUPING ENGINE)
const menuLayout = computed(() => {
  const layout = []
  const groups = {}

  // Pastikan visibleMenus sudah diurutkan berdasarkan field 'urutan' dari database
  const sortedMenus = [...visibleMenus.value].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))

  sortedMenus.forEach(item => {
    // Jika modul TIDAK memiliki parent_group, jadikan menu utama (berdiri sendiri)
    if (!item.parent_group || item.parent_group === '' || item.parent_group === 'Tanpa Parent') {
      layout.push({ type: 'item', ...item })
    } 
    // Jika modul MEMILIKI parent_group, gabungkan ke dalam folder
    else {
      if (!groups[item.parent_group]) {
        // Buat folder baru jika belum ada
        groups[item.parent_group] = {
          type: 'group',
          name: item.parent_group,
          icon: item.parent_icon || 'mdi-folder-outline', // Default ikon folder
          items: []
        }
        layout.push(groups[item.parent_group])
      }
      // Masukkan menu anak ke dalam folder tersebut
      groups[item.parent_group].items.push(item)
    }
  })

  return layout
})

onMounted(() => {
  seedSystemModulesIfEmpty()
    .then(() => fetchSystemModules())
    .catch(err => console.error("Gagal menarik konfigurasi modul:", err))

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authState.value.isLoggedIn = true
      authState.value.uid = user.uid
      authState.value.email = user.email

      try {
        const q = query(collectionGroup(db, 'users'), where('email', '==', user.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          const tenantId = querySnapshot.docs[0].ref.parent.parent.id

          authState.value.nama = userData.nama
          authState.value.role = userData.role
          authState.value.tenantId = tenantId
          authState.value.branchId = userData.branch_id || null

          // LOGIKA BARU: Tarik hak akses langsung dari tabel Roles (berlaku untuk Owner maupun Karyawan)
          const rolesRef = collection(db, 'tenants', tenantId, 'roles')
          const qRole = query(rolesRef, where('nama_peran', '==', userData.role))
          const snapshotRole = await getDocs(qRole)
          
          if (!snapshotRole.empty) {
            authState.value.permissions = snapshotRole.docs[0].data().permissions || []
          } else {
            // FALLBACK AMAN: Jika dokumen 'UMKM Owner' belum dibuat di database
            if (userData.role === 'UMKM Owner') {
              authState.value.permissions = systemModules.value.filter(m => m.id !== 'tenants').map(m => m.id)
            } else {
              authState.value.permissions = []
            }
          }
          
        } else {
          // SUPER ADMIN
          authState.value.nama = user.email.split('@')[0]
          authState.value.role = 'Super Admin'
          authState.value.tenantId = 'MENTADATA-HQ'
          authState.value.branchId = null
          authState.value.permissions = ['dashboard', 'tenants', 'settings']
        }
      } catch (error) {
        console.error("Gagal menarik profil pengguna:", error)
      }

    } else {
      authState.value.isLoggedIn = false
      authState.value.uid = null
      authState.value.email = null
      authState.value.nama = ''
      authState.value.role = ''
      authState.value.permissions = []
    }
  })
})

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error("Gagal saat mencoba keluar:", error)
  }
}
</script>