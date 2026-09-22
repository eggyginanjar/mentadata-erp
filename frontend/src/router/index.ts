// file: frontend/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, collectionGroup, query, where, getDocs } from 'firebase/firestore'

import Dashboard from '../pages/index.vue'
import POS from '../pages/pos/index.vue'
import Products from '../pages/products/index.vue'
import Users from '../pages/users/index.vue'
import Settings from '../pages/settings/index.vue'
import Tenants from '../pages/tenants/index.vue'
import Procurement from '../pages/procurement/index.vue'
import Suppliers from '../pages/suppliers/index.vue'
import Production from '../pages/production/index.vue'
import Accounting from '../pages/accounting/index.vue'
import Cashflow from '../pages/cashflow/index.vue'
import Reports from '../pages/reports/profit-loss.vue'
import Login from '../pages/login.vue'

// 1. TENTUKAN META ATURAN BERDASARKAN ID MODUL
// KONSISTENSI: Semua rute wajib menggunakan meta { permission: 'id_modul' }
const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true, permission: 'dashboard' } },
  { path: '/pos', name: 'POS', component: POS, meta: { requiresAuth: true, permission: 'pos' } },
  { path: '/products', name: 'Products', component: Products, meta: { requiresAuth: true, permission: 'products' } },
  { path: '/users', name: 'Users', component: Users, meta: { requiresAuth: true, permission: 'users' } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true, permission: 'settings' } },
  { path: '/tenants', name: 'Tenants', component: Tenants, meta: { requiresAuth: true, permission: 'tenants' } },
  { path: '/procurement', component: Procurement, meta: { requiresAuth: true, permission: 'procurement' } },
  { path: '/production', component: Production, meta: { requiresAuth: true, permission: 'production' } },
  { path: '/accounting', component: Accounting, meta: { requiresAuth: true, permission: 'accounting' } },
  { path: '/cashflow', component: Cashflow, meta: { requiresAuth: true, permission: 'cashflow' } },
  { path: '/reports/profit-loss', name: 'LaporanLabaRugi', component: Reports, meta: { requiresAuth: true, permission: 'reports-profitloss' } },
  { 
    path: '/reports/neraca', 
    name: 'LaporanNeraca',
    component: () => import('../pages/reports/neraca.vue'), 
    meta: { requiresAuth: true, permission: 'reports-neraca' } // KUNCI KEAMANAN NERACA
  },
  { 
    path: '/inventory/transfer', 
    name: 'TransferStok',
    component: () => import('../pages/inventory/transfer.vue'), 
    meta: { requiresAuth: true, permission: 'inventory-transfer' } 
  },
  { 
    path: '/inventory/opname', 
    name: 'StockOpname',
    component: () => import('../pages/inventory/opname.vue'), 
    meta: { requiresAuth: true, permission: 'inventory-opname' } 
  },
  { 
    path: '/attendance', 
    name: 'Presensi', 
    component: () => import('../pages/attendance/index.vue'), 
    meta: { requiresAuth: true, permission: 'attendance' } 
  },
  { 
    path: '/hr/recap', 
    name: 'RekapHR',
    component: () => import('../pages/hr/recap.vue'), 
    meta: { requiresAuth: true, permission: 'hr-recap' } 
  },
  { 
    path: '/hr/shifts', 
    name: 'MasterShift',
    component: () => import('../pages/hr/shifts.vue'), 
    meta: { requiresAuth: true, permission: 'hr-shifts' } 
  },
  { 
    path: '/hr/payroll', 
    name: 'Payroll',
    component: () => import('../pages/hr/payroll.vue'), 
    meta: { requiresAuth: true, permission: 'hr-payroll' } 
  },
  { 
    path: '/hr/components', 
    name: 'PayrollComponents',
    component: () => import('../pages/hr/components.vue'), 
    meta: { requiresAuth: true, permission: 'hr-components' } 
  },
  { path: '/suppliers', component: Suppliers, meta: { requiresAuth: true, permission: 'suppliers' } },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 2. FUNGSI PEMBANTU: Membaca Izin Modul (Permissions) dari Database Terkini
const checkUserAccess = (): Promise<{ user: any; role: string | null; permissions: string[] }> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      
      if (!user) {
        resolve({ user: null, role: null, permissions: [] })
        return
      }

      try {
        const qUser = query(collectionGroup(db, 'users'), where('email', '==', user.email))
        const snapshotUser = await getDocs(qUser)
        
        if (snapshotUser.empty) {
          // SUPER ADMIN MENTADATA (Tidak ada di data tenant manapun)
          resolve({ user, role: 'Super Admin', permissions: ['dashboard', 'tenants', 'settings'] })
          return
        }

        const userData = snapshotUser.docs[0].data()
        const role = userData.role
        const tenantId = snapshotUser.docs[0].ref.parent.parent!.id

        // BACA SEMUA ROLE DARI DATABASE (TERMASUK UMKM OWNER YANG KINI PUNYA TIERING LANGGANAN)
        const rolesRef = collection(db, 'tenants', tenantId, 'roles')
        const qRole = query(rolesRef, where('nama_peran', '==', role))
        const snapshotRole = await getDocs(qRole)

        if (!snapshotRole.empty) {
          const roleData = snapshotRole.docs[0].data()
          resolve({ user, role, permissions: roleData.permissions || [] })
        } else {
          resolve({ user, role, permissions: [] })
        }

      } catch (error) {
        console.error("Gagal memeriksa akses:", error)
        resolve({ user, role: 'Unknown', permissions: [] })
      }
    })
  })
}

// 3. SATPAM RUTE UTAMA (Navigation Guard)
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    const { user, role, permissions } = await checkUserAccess()
    
    if (!user) {
      next('/login')
    } else {
      const requiredPermission = to.meta.permission as string
      
      // Jika rute butuh permission khusus, tapi user tidak punya...
      if (requiredPermission && !permissions.includes(requiredPermission)) {
        console.warn(`Akses ditolak! Jabatan [${role}] tidak punya izin masuk ke modul [${requiredPermission}]`)
        
        // Arahkan ke modul aman pertama yang mereka miliki
        if (permissions.includes('tenants')) next('/tenants')
        else if (permissions.includes('dashboard')) next('/')
        else if (permissions.includes('pos')) next('/pos')
        else next('/login') // Terkunci jika tidak punya izin apa-apa
      } else {
        next() // Bebas masuk
      }
    }
  } else if (to.path === '/login') {
    // Pencegahan agar user yang sudah login tidak bisa buka halaman login lagi
    const { user, permissions } = await checkUserAccess()
    if (user) {
      if (permissions.includes('tenants')) next('/tenants')
      else if (permissions.includes('dashboard')) next('/')
      else if (permissions.includes('pos')) next('/pos')
      else next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router