<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div class="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-6 text-white">
        <h2 class="text-3xl font-bold text-center">Zaloguj się</h2>
  
        <form @submit.prevent="login" class="space-y-6">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              class="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Twój email"
            />
          </div>
  
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium">Hasło</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              class="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Twoje hasło"
            />
          </div>
  
          <button
            type="submit"
            class="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"
          >
            Zaloguj się
          </button>
        </form>
  
        <p class="text-sm text-center text-white/80">
          Nie masz konta?
          <a href="#" class="text-white hover:underline">Zarejestruj się</a>
        </p>
        <p class="text-sm text-center text-white/80">
          <a href="#" class="text-white hover:underline">Dostęp bez logowania</a>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const email = ref('')
  const password = ref('')
  
  const login = async () => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password.value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const dane = {
    email: email.value,
    password: hashHex,
  }

  console.log('JSON:', JSON.stringify(dane))
}

  </script>
  