<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div class="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-6 text-white">
        <h2 class="text-3xl font-bold text-center mb-6">Panel użytkownika</h2>
  
        <div class="space-y-6 text-white/90">
          <div>
            <p class="text-sm text-white/70 mb-1">Imię</p>
            <p class="text-lg font-medium">{{ user?.name || 'Brak' }}</p>
          </div>
  
          <div>
            <p class="text-sm text-white/70 mb-1">Nazwisko</p>
            <p class="text-lg font-medium">{{ user?.surname || 'Brak' }}</p>
          </div>
  
          <div>
            <p class="text-sm text-white/70 mb-1">Email</p>
            <p class="text-lg font-medium break-words">{{ user?.email || 'Brak' }}</p>
          </div>
        </div>
  
        <div class="mt-8 flex flex-col gap-4">
          <button
            class="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition">
            Zmień hasło
          </button>
          <button
            class="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition">
            Zmień e-mail
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useAuthStore } from '@/stores/auth'
  
  const auth = useAuthStore()
  const user = auth.user
  </script>
  