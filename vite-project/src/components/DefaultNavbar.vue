<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const userRole = computed(() => auth.user?.role ?? null)
const isLoggedIn = computed(() => auth.user !== null)
const userName = computed(() => auth.user?.name ?? '')
</script>

<template>
  <header class="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- MeetMe jako link do strony głównej -->
      <RouterLink to="/" class="text-white font-semibold text-xl tracking-wide hover:text-pink-200 transition">
        MeetMe
      </RouterLink>

      <nav class="flex items-center space-x-6">
        <RouterLink v-if="userRole === 'admin'" to="/AdminPanel" class="text-white hover:text-pink-200 transition"
          active-class="underline">
          AdminPanel
        </RouterLink>
        <RouterLink v-if="isLoggedIn" to="/PasswordChange" class="text-white hover:text-pink-200 transition"
          active-class="underline">
          Zmień hasło
        </RouterLink>

        <!-- Informacja o użytkowniku -->
        <span v-if="isLoggedIn" class="text-white italic">
          Witaj, {{ userName }}!
        </span>

        <!-- Przycisk wylogowania -->
        <button v-if="isLoggedIn" @click="auth.logout()" class="text-white hover:text-red-300 transition">
          Wyloguj
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped></style>
