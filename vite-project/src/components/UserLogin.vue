<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
    <div
      class="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-6 text-white">
      <h2 class="text-3xl font-bold text-center">Zaloguj się</h2>

      <form @submit.prevent="login" class="space-y-6">
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium">Email</label>
          <input id="email" type="email" v-model="email" required
            class="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Twój email" />
        </div>

        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium">Hasło</label>
          <input id="password" type="password" v-model="password" required
            class="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Twoje hasło" />
        </div>

        <button type="submit"
          class="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition">
          Zaloguj się
        </button>
      </form>

      <button
        @click="sendTestEmail"
        class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition"
          
      >Wyślij testowego maila
      </button>


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
import { useAuthStore } from '@/stores/auth' // Import the Pinia store

const email = ref('')
const password = ref('')
const authStore = useAuthStore()

const login = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // need for cookies
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`Błąd logowania: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Sukces logowania:', data)
    authStore.setUser(data.user)

  } catch (error) {
    console.error('Błąd podczas logowania:', error)
  }
}

const sendTestEmail = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/login/send-test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nemizvgueksxpuiamq@ytnhy.com', // 10minute jakby co to jest
      }),
    });

    if (!response.ok) {
      throw new Error('Błąd podczas wysyłania maila');
    }

    const data = await response.json();
    console.log('Mail wysłany:', data);
    alert('Mail testowy wysłany!');

  } catch (error) {
    console.error('Błąd wysyłania maila:', error);
    alert('Coś poszło nie tak');
  }
};
</script>
