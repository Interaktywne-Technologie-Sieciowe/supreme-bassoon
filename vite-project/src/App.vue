<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Zmienna przechowująca rolę użytkownika
const userRole = ref<string | null>(null)

onMounted(() => {
  const savedRole = localStorage.getItem('userRole')  // Pobieramy rolę z localStorage
  if (savedRole) {
    userRole.value = savedRole  // Ustawiamy rolę użytkownika
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <header class="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 class="text-white font-semibold text-xl tracking-wide">MeetMe</h1>
        <nav class="flex space-x-6">
          <RouterLink to="/" class="text-white hover:text-pink-200 transition" active-class="underline">
            Home
          </RouterLink>
          <RouterLink to="/calendar" class="text-white hover:text-pink-200 transition" active-class="underline">
            Calendar
          </RouterLink>
          <!-- Warunkowe renderowanie przycisku AdminPanel tylko dla roli 'Admin' -->
          <RouterLink v-if="userRole === 'a'" to="/AdminPanel" class="text-white hover:text-pink-200 transition" active-class="underline">
            AdminPanel
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="pt-20">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Dodatkowe style */
</style>
