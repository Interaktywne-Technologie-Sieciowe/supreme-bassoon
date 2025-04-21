<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
    <div
      class="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-6 text-white">
      <h2 class="text-2xl font-bold text-center">Zmień hasło dla</h2>
      <h2 class="text-xl font-semibold text-center text-yellow-200">{{ email || '...' }}</h2>

      <form @submit.prevent="submitReset" class="space-y-6">
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium">Nowe hasło</label>
          <input id="password" v-model="password" type="password" required
            class="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="hasło" />
        </div>

        <button type="submit"
          class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition">
          Zatwierdź zmianę hasła
        </button>
      </form>

      <div v-if="error" class="text-red-300 text-sm text-center">{{ error }}</div>
      <div v-if="success" class="text-green-300 text-sm text-center">{{ success }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { jwtDecode } from 'jwt-decode';

const token = new URLSearchParams(window.location.search).get('token');
const email = ref('');
const password = ref('');
const error = ref('');
const success = ref('');

onMounted(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token);
      email.value = decoded.email;
    } catch (err) {
      error.value = 'This token has expired or is invalid';
    }
  } else {
    error.value = 'No token in URL';
  }
});

const submitReset = async () => {
  error.value = '';
  success.value = '';

  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // dla cookies, jeśli kiedyś potrzebne
      body: JSON.stringify({
        token,
        newPassword: password.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.status}`);
    }

    const data = await response.json();
    success.value = data.message || 'Hasło zmienione pomyślnie!';
  } catch (err) {
    error.value = err.message || 'Wystąpił błąd przy zmianie hasła.';
  }
};
</script>
