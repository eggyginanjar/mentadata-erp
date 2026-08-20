<template>
  <v-app>
    <!-- 1. NAVIGATION DRAWER (Sidebar Kiri) -->
    <v-navigation-drawer v-model="drawer" color="blue-grey-darken-4" theme="dark">
      <!-- Profil Info Perusahaan / Pengguna -->
      <v-list-item
        prepend-avatar="https://api.dicebear.com/7.x/initials/svg?seed=MD&backgroundColor=1976D2"
        title="Mentadata ERP"
        subtitle="Super Admin"
        class="py-4"
      ></v-list-item>

      <v-divider></v-divider>

      <!-- Menu Navigasi -->
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dasbor Utama" value="dashboard" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-cash-register" title="POS Kasir" value="pos" to="/pos"></v-list-item>
        <v-list-item prepend-icon="mdi-package-variant-closed" title="Master Produk" value="products" to="/products"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Kelola Karyawan" value="users" to="/users"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Pengaturan" value="settings" to="/settings"></v-list-item>
      </v-list>
      
      <!-- Tombol Logout di Bawah -->
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="error" variant="tonal" prepend-icon="mdi-logout">
            Keluar
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 2. APP BAR (Header Atas) -->
    <v-app-bar elevation="1" color="white">
      <!-- Tombol hamburger untuk buka/tutup sidebar di layar kecil -->
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title class="text-h6 font-weight-bold text-blue-grey-darken-3">
        Mentadata Workspace
      </v-app-bar-title>
      
      <v-spacer></v-spacer>

      <!-- Ikon Notifikasi -->
      <v-btn icon>
        <v-badge color="error" content="3">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
    </v-app-bar>

    <!-- 3. MAIN CONTENT (Area Dinamis Halaman) -->
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <!-- Komponen halaman akan muncul di sini -->
        <router-view />
      </v-container>
    </v-main>

  </v-app>
</template>

<script setup>
import { ref } from 'vue'

// State untuk mengatur buka/tutup sidebar
const drawer = ref(true)
</script>