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
import Tenants from '../pages/tenants/index.vue' // <-- IMPOR HALAMAN BARU
import Procurement from '../pages/procurement/index.vue'
import Suppliers from '../pages/suppliers/index.vue'
import Production from '../pages/production/index.vue'
import Accounting from '../pages/accounting/index.vue'
import Cashflow from '../pages/cashflow/index.vue'
import Reports from '../pages/reports/profit-loss.vue'
//import Inventory from '../pages/inventory/transfer.vue'
//import Opname from '../pages/inventory/opname.vue'
import Login from '../pages/login.vue'

// 1. TENTUKAN META ATURAN BERDASARKAN ID MODUL
const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true, permission: 'dashboard' } },
  { path: '/pos', name: 'POS', component: POS, meta: { requiresAuth: true, permission: 'pos' } },
  { path: '/products', name: 'Products', component: Products, meta: { requiresAuth: true, permission: 'products' } },
  { path: '/users', name: 'Users', component: Users, meta: { requiresAuth: true, permission: 'users' } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true, permission: 'settings' } },
  { path: '/tenants', name: 'Tenants', component: Tenants, meta: { requiresAuth: true, permission: 'tenants' } }, // <-- RUTE SUPER ADMIN
  { path: '/procurement', component: Procurement, meta: { requiresAuth: true, requiredModule: 'products' } },
  { path: '/production', component: Production, meta: { requiresAuth: true, requiredModule: 'products' } },
  { path: '/accounting', component: Accounting, meta: { requiresAuth: true, requiredModule: 'accounting' } },
  { path: '/cashflow', component: Cashflow, meta: { requiresAuth: true, requiredModule: 'cashflow' } },
  { path: '/reports', component: Reports, meta: { requiresAuth: true, requiredModule: 'reports' } },
  //{ path: '/inventory', component: Inventory, meta: { requiresAuth: true, requiredModule: 'inventory' } },
  //{ path: '/inventory/opname', component: Opname, meta: { requiresAuth: true, requiredModule: 'inventory-opname' } },
  { 
    path: '/inventory/transfer', 
    name: 'TransferStok',
    component: () => import('../pages/inventory/transfer.vue'), 
    meta: { requiresAuth: true, requiredModule: 'inventory-transfer' } 
  },
  { 
    path: '/inventory/opname', 
    name: 'StockOpname',
    component: () => import('../pages/inventory/opname.vue'), 
    meta: { requiresAuth: true, requiredModule: 'inventory-opname' } 
  },
  { path: '/suppliers', component: Suppliers, meta: { requiresAuth: true, requiredModule: 'products' } },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 2. FUNGSI PEMBANTU: Membaca Izin Modul (Permissions)
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
          // JIKA TIDAK ADA DI DATABASE UMKM -> BERARTI DIA SUPER ADMIN MENTADATA!
          // Beri akses ke Tenants, bersihkan POS dan Products dari layarnya
          resolve({ user, role: 'Super Admin', permissions: ['dashboard', 'tenants', 'settings'] })
          return
        }

        const userData = snapshotUser.docs[0].data()
        const role = userData.role
        const tenantId = snapshotUser.docs[0].ref.parent.parent!.id

        if (role === 'UMKM Owner') {
          // JIKA DIA KLIEN UMKM -> BERARTI DIA DEWA DI PERUSAHAANNYA!
          // Beri akses ke semua modul UMKM, TAPI JANGAN beri akses ke 'tenants'
          resolve({ user, role, permissions: ['dashboard', 'pos', 'products', 'users', 'settings'] })
          return
        }

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

// 3. SATPAM RUTE UTAMA
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    const { user, role, permissions } = await checkUserAccess()
    
    if (!user) {
      next('/login')
    } else {
      const requiredPermission = to.meta.permission as string
      
      if (requiredPermission && !permissions.includes(requiredPermission)) {
        console.warn(`Akses ditolak! Jabatan [${role}] tidak punya izin masuk ke modul [${requiredPermission}]`)
        
        if (permissions.includes('tenants')) next('/tenants')
        else if (permissions.includes('pos')) next('/pos')
        else if (permissions.includes('dashboard')) next('/')
        else next('/login')
      } else {
        next()
      }
    }
  } else if (to.path === '/login') {
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