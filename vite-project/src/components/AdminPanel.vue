<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div class="w-full max-w-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white space-y-6">
        <h2 class="text-3xl font-bold text-center">Panel administratora</h2>
  
        <form @submit.prevent="addUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input v-model="firstName" type="text" placeholder="Imię" required
              class="px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white" />
            <input v-model="lastName" type="text" placeholder="Nazwisko" required
              class="px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white" />
            <input v-model="email" type="email" placeholder="Email" required
              class="px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white" />
          </div>
          <button type="submit"
            class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition">
            Dodaj użytkownika
          </button>
        </form>
  
        <div v-if="users.length > 0" class="pt-4">
          <h3 class="text-xl font-semibold mb-2">Lista użytkowników</h3>
          <ul class="space-y-2">
            <li v-for="(user, index) in users" :key="index"
                class="bg-white/20 rounded-xl px-4 py-2 flex justify-between items-center">
              <div>
                {{ user.firstName }} {{ user.lastName }} — <span class="text-white/80">{{ user.email }}</span>
              </div>
              <button @click="removeUser(index)"
                class="text-sm text-red-400 hover:text-red-200 transition">Usuń</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  const users = ref<{ firstName: string; lastName: string; email: string }[]>([])
  
  const addUser = async () => {
  const newUser = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
  }

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })

    if (!response.ok) {
      throw new Error('Nie udało się zapisać użytkownika')
    }

    users.value.push(newUser)
    firstName.value = ''
    lastName.value = ''
    email.value = ''
  } catch (error) {
    console.error(error)
    alert('Błąd przy dodawaniu użytkownika')
  }
}

  
  const removeUser = (index: number) => {
    users.value.splice(index, 1)
  }
  </script>
  