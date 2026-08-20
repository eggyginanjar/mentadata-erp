// file: frontend/src/store/modules.js
import { ref } from 'vue'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch, doc } from 'firebase/firestore'

// Ini adalah variabel global yang akan dibaca oleh App.vue dan Pengaturan
export const systemModules = ref([])

// Fungsi untuk mendengarkan perubahan modul dari Super Admin secara realtime
export const fetchSystemModules = () => {
  const q = query(collection(db, 'system_modules'), orderBy('order', 'asc'))
  onSnapshot(q, (snapshot) => {
    systemModules.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
}

// Fungsi satu kali jalan untuk mengisi database jika masih kosong (Auto-Seed)
export const seedSystemModulesIfEmpty = async () => {
  const snap = await getDocs(collection(db, 'system_modules'))
  
  // Jika database sudah memiliki isi, hentikan fungsi ini
  if (!snap.empty) return 

  console.log("Koleksi system_modules masih kosong. Memulai injeksi data awal...")
  const batch = writeBatch(db)
  
  // Cetak biru modul inti kita
  const defaultModules = [
    { id: 'dashboard', name: 'Dasbor Utama', icon: 'mdi-view-dashboard', route: '/', order: 1 },
    { id: 'pos', name: 'POS Kasir', icon: 'mdi-cash-register', route: '/pos', order: 2 },
    { id: 'products', name: 'Master Produk', icon: 'mdi-package-variant-closed', route: '/products', order: 3 },
    { id: 'suppliers', name: 'Master Pemasok', icon: 'mdi-store-outline', route: '/suppliers', order: 4 },
    { id: 'procurement', name: 'Pengadaan', icon: 'mdi-truck-delivery', route: '/procurement', order: 5 },
    { id: 'production', name: 'Manufaktur (BOM)', icon: 'mdi-robot-industrial-outline', route: '/production', order: 6 },
    { id: 'users', name: 'Kelola Karyawan', icon: 'mdi-account-group', route: '/users', order: 7 },
    { id: 'settings', name: 'Pengaturan Sistem', icon: 'mdi-cog', route: '/settings', order: 8 },
    { id: 'tenants', name: 'Kelola Pelanggan', icon: 'mdi-domain', route: '/tenants', order: 99 } // Hanya untuk Super Admin
  ]

  defaultModules.forEach(mod => {
    const docRef = doc(db, 'system_modules', mod.id)
    batch.set(docRef, mod)
  })

  await batch.commit()
  console.log("Injeksi data modul berhasil! Firestore Anda kini memiliki Registry Modul Global.")
}