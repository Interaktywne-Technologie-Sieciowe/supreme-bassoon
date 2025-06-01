<template>
  <header class="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <RouterLink to="/" class="text-white font-semibold text-xl tracking-wide hover:text-pink-200 transition">
        MeetMe
      </RouterLink>

      <nav class="flex items-center space-x-6">
        <RouterLink v-if="userRole === 'admin'" to="/AdminPanel"
          class="text-white hover:text-pink-200 transition" active-class="underline">
          Panel Administratora
        </RouterLink>

        <div class="relative inline-block">
          <span v-if="isLoggedIn"
                @click="toggleUserPanel"
                class="text-white italic cursor-pointer select-none">
            Witaj, {{ userName }}!
          </span>

              <div v-if="userRole === 'user' && showUserPanel"
        class="absolute bg-white text-black mt-2 right-0 shadow-md rounded w-40 z-50 transition-all duration-300">
      <router-link to="/UserPanel"
                  class="block px-4 py-2 hover:bg-gray-200 hover:rounded text-black select-none"
                  style="text-decoration: none;"
                  @click="showUserPanel = false">
        Panel użytkownika
      </router-link>
    </div>
        </div>
                  

        <button v-if="isLoggedIn" @click="auth.logout()" class="text-white hover:text-red-300 transition">
          Wyloguj
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped></style>


<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const userRole = computed(() => auth.user?.role ?? null)
const isLoggedIn = computed(() => auth.user !== null)
const userName = computed(() => auth.user?.name ?? '')

const showUserPanel = ref(false)
const toggleUserPanel = () => {
    showUserPanel.value = !showUserPanel.value
}
</script>
