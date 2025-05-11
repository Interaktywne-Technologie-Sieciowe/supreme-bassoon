<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div class="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-6 text-white">
        <h2 class="text-3xl font-bold text-center mb-6">Panel użytkownika</h2>
  
        <div class="space-y-6 text-white/90">
          <div>
            <p class="text-sm text-white/70 mb-1">Imię</p>
            <p class="text-lg font-medium">{{ userName}}</p>
          </div>
  
          <div>
            <p class="text-sm text-white/70 mb-1">Nazwisko</p>
            <p class="text-lg font-medium">{{ userLast }}</p>
          </div>
  
          <div>
            <p class="text-sm text-white/70 mb-1">Email</p>
            <p class="text-lg font-medium break-words">{{ userMail}}</p>
          </div>
        </div>
  
        <div class="mt-8 flex flex-col gap-4">
          <button
            class="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"  @click="passwordModal = true">
            Zmień hasło
          </button>
          <button
            class="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"  @click="emailModal = true">
            Zmień e-mail
          </button>

          <Teleport to="body">
          <div v-if="passwordModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white rounded-lg shadow-xl0 p-6 w-full max-w-md text-black">
    <h3 class="text-xl font-bold mb-4">Zmień hasło</h3>

    <form @submit.prevent="submitPasswordChange">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nowe hasło</label>
          <input v-model="newPassword" type="password" required class="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Powtórz nowe hasło</label>
          <input v-model="confirmPassword" type="password" required class="w-full mt-1 p-2 border rounded"
          />
        </div>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-600 text-sm">{{ success }}</p>
        <div v-if="PasswordMatchError" class=" text-sm text-center bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg z-50" role="alert">{{ PasswordMatchError }}</div>

      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button type="button" @click="passwordModal = false" class="btn btn-secondary">Zamknij</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Zapisz</button>
      </div>
    </form>
  </div>
</div>

<div v-if="emailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white rounded-lg shadow-xl0 p-6 w-full max-w-md text-black">
    <h3 class="text-xl font-bold mb-4">Zmień email</h3>

    <form @submit.prevent="submitEmailChange">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nowy email</label>
          <input v-model="newEmail" type="email" required class="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Powtórz nowy email</label>
          <input v-model="confirmEmail" type="email" required class="w-full mt-1 p-2 border rounded"
          />
        </div>

        <p v-if="errorM" class="text-red-600 text-sm">{{ errorM }}</p>
        <p v-if="successM" class="text-green-600 text-sm">{{ successM }}</p>
        <div v-if="EmailMatchError" class=" text-sm text-center bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg z-50" role="alert">{{ EmailMatchError }}</div>

      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button type="button" @click="emailModal= false" class="btn btn-secondary">Zamknij</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Zapisz</button>
      </div>
    </form>
  </div>
</div>
</Teleport>

        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
import { ref, computed} from 'vue'
import { useAuthStore } from '@/stores/auth'
  
const auth = useAuthStore();
const userName = computed(() => auth.user?.name ?? '')
const userLast = computed(() => auth.user?.surname ?? '')
const userMail = computed(() => auth.user?.email ?? '')


const passwordModal = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const PasswordMatchError=ref('')
const EmailMatchError=ref('')
const emailModal = ref(false)
const newEmail = ref('')
const confirmEmail = ref('')
const errorM = ref('')
const successM = ref('')


async function submitPasswordChange() {

  error.value = '';
  success.value = '';
  PasswordMatchError.value='';

  if (newPassword.value !== confirmPassword.value) {
    PasswordMatchError.value = 'Hasła nie pasują!';
    return;
  }

  try {

    const response = await fetch('http://localhost:3000/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMail: userMail.value,
        newPassword: newPassword.value,
    }),
  });

  const data = await response.json();
  success.value = data.message || 'Hasło zmienione pomyślnie!';

  } catch (err) {
    error.value = 'Wystąpił błąd przy zmianie hasła.';
  }
}








async function submitEmailChange() {
 
  errorM.value = '';
  successM.value = '';
  EmailMatchError.value='';

  if (newEmail.value !== confirmEmail.value) {
    EmailMatchError.value = 'Adresy email nie pasują!';
    return;
  }
  try {

const response = await fetch('http://localhost:3000/api/auth/change-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userMail: userMail.value,
   newEmail: newEmail.value,
}),
});

const data = await response.json();
successM.value = data.message || 'Email zmienione pomyślnie!';

} catch (err) {
errorM.value = 'Wystąpił błąd przy zmianie email.';
}
}
  </script>
  