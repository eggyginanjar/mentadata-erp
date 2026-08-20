// file: frontend/src/store/auth.js
import { ref } from 'vue'

export const authState = ref({
  isLoggedIn: false,
  uid: null,
  email: null,
  nama: 'Memuat...',
  tenantId: null,
  branchId: null,
  role: '',
  permissions: [] // <--- TAMBAHAN BARU: Brankas untuk menyimpan izin modul
})