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

        <button type="submit" :disabled="isLoading"
          class="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition grid place-items-center">
          <span v-if="isLoading" class="spinner-border" role="status" aria-hidden="true"
            style="width: 2rem; height: 2rem;"></span>
          <span v-else>Zaloguj się</span>
        </button>

      </form>

      <p class="text-sm text-center text-white/80">
        Nie pamiętasz hasła?
        <a href="#" class="text-white hover:underline" @click.prevent="resetView">Zresetuj je!</a>
      </p>

      <p class="text-sm text-center text-white/80">
        <a href="#" class="text-white hover:underline" @click.prevent="guestLogin">
          Dostęp bez logowania
        </a>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const guestLogin = () => {
  const guestUser = {
    id: 'guest',
    name: 'Gość',
    surname: '',
    email: '',
    phone: '',
    created_at: '',
    last_login: '',
    role: 'guest',
  }

  authStore.setUser(guestUser)
  router.push('/') // Redirect to homepage
}

const login = async () => {
  isLoading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`Błąd logowania: ${response.statusText}`)
    }

    const data = await response.json()
    authStore.setUser(data.user)
    router.push('/') // Redirect to home after successful login
  } catch (error) {
    console.error('Błąd podczas logowania:', error)
  } finally {
    isLoading.value = false
  }
}

const resetView = () => {
  router.push('/PasswordForgot')
}

</script>
