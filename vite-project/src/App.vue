<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <Navbar />

    <!-- GLOBAL TOAST ALERT -->
    <transition name="fade">
      <div
        v-if="toast.message"
        :class="[
          'fixed top-4 right-4 text-white px-4 py-2 rounded-xl shadow-lg z-[100]',
          toast.type === 'error' && 'bg-red-600',
          toast.type === 'success' && 'bg-green-600',
          toast.type === 'warning' && 'bg-yellow-500 text-black'
        ]"
        role="alert"
      >
        {{ toast.message }}
      </div>
    </transition>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/DefaultNavbar.vue'
import { onMounted, reactive, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
onMounted(() => {
  authStore.initAuth()
})

const toast = reactive({
  message: '',
  type: '' as 'error' | 'success' | 'warning'
})

function showGlobalToast(message: string, type: 'error' | 'success' | 'warning') {
  toast.message = message
  toast.type = type
  setTimeout(() => {
    toast.message = ''
  }, 4000)
}

provide('showGlobalToast', showGlobalToast)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
