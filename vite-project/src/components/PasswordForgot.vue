<template>
  <div
    class="container d-flex align-items-center justify-content-center"
    style="min-height: 90vh;">
    <div
      class="w-100 max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-6 text-white">
      <h2 class="text-2xl font-bold text-center">Zresetuj hasło dla</h2>
      <p class="text">Wprowadź adres e-mail swojego konta użytkownika, a wyślemy Ci link do zresetowania hasła.</p>

      <form @submit.prevent="reset" class="space-y-6">
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium">Email</label>
          <input id="email" type="email" v-model="email" required
            class="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Twój email" />
        </div>

        <button type="submit"
          class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition">
          <span v-if="isLoading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
          <span>{{ isLoading ? 'Wysyłanie...' : 'Wyślij' }}</span>
        </button>
      </form>
    </div>

    <!-- Pop-upy -->
    <transition name="fade">
      <div
        v-if="error"
        class="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg z-50"
        role="alert">
        {{ error }}
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="success"
        class="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50"
        role="alert">
        {{ success }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)

const reset = async () => {
  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/users/resetPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Wystąpił błąd')
    }

    success.value = result.Successmessage || 'Link został wysłany na e-mail.'
    email.value = ''

    setTimeout(() => {
      success.value = ''
    }, 4000)

  } catch (err: any) {
    error.value = err.message || 'Nie udało się zresetować hasła.'

    setTimeout(() => {
      error.value = ''
    }, 4000)
  } finally {
    isLoading.value = false
  }
}
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
