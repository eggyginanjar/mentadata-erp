<!-- file: frontend/src/pages/login.vue -->
<template>
  <v-container fluid class="fill-height bg-blue-grey-lighten-5">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-8 border-sm" rounded="xl" elevation="4" color="white">
          
          <div class="text-center mb-8">
            <!-- Logo Sederhana -->
            <v-avatar color="teal-lighten-5" size="80" class="mb-4">
              <v-icon size="48" color="teal-darken-3">mdi-hexagon-multiple</v-icon>
            </v-avatar>
            <h2 class="text-h4 font-weight-black text-blue-grey-darken-4">Mentadata ERP</h2>
            <p class="text-body-2 text-blue-grey-darken-1 mt-2">Silakan masuk ke ruang kerja Anda</p>
          </div>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Alamat Email"
              variant="outlined"
              density="comfortable"
              color="teal-darken-3"
              prepend-inner-icon="mdi-email-outline"
              class="mb-2"
              required
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Kata Sandi"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              color="teal-darken-3"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              class="mb-6"
              required
            ></v-text-field>

            <v-btn
              type="submit"
              block
              color="teal-darken-3"
              size="x-large"
              rounded="lg"
              class="text-none font-weight-bold mb-4"
              elevation="2"
              :loading="isLoading"
            >
              Masuk Sistem
            </v-btn>
            
            <!-- Pesan Error -->
            <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="text-body-2">
              {{ errorMessage }}
            </v-alert>
          </v-form>
          
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// Impor auth dari firebase.js dan fungsi signIn dari Firebase
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = '' // Reset pesan error
  
  try {
    // Mencoba login ke server Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user
    
    console.log("Login Berhasil! UID:", user.uid)
    
    // Jika berhasil, arahkan ke halaman Dasbor
    router.push('/')
  } catch (error) {
    console.error("Gagal login:", error.code)
    
    // Menerjemahkan error Firebase menjadi bahasa manusia
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage.value = 'Email atau kata sandi tidak valid.'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage.value = 'Format email tidak benar.'
    } else {
      errorMessage.value = 'Terjadi kesalahan saat mencoba masuk.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>