<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'


const auth = useAuthStore()

const userRole = computed(() => auth.user?.role ?? null)
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
          <RouterLink
            v-if="userRole === 'admin'"
            to="/AdminPanel"
            class="text-white hover:text-pink-200 transition"
            active-class="underline"
          >
            AdminPanel
          </RouterLink>
               <RouterLink to="/PasswordChange" class="text-white hover:text-pink-200 transition" active-class="underline">
            PasswordChange
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
</style>
