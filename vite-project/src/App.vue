<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <Navbar />
    <main class="pt-16"> <!-- Add padding top to account for the fixed navbar -->
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/DefaultNavbar.vue'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>

<style>
body {
  overflow: hidden;
}
</style>