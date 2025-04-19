<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
    <div
      class="w-full max-w-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white space-y-6">
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
        <button :disabled="isAdding"
          class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50">
          <span v-if="isAdding">Dodawanie...</span>
          <span v-else>Dodaj użytkownika</span>
        </button>
      </form>

      <p v-if="addSuccess" class="text-green-300 text-center">Użytkownik dodany pomyślnie ✅</p>

      <div class="pt-4">
        <h3 class="text-xl font-semibold mb-2">Lista użytkowników</h3>

        <div v-if="isFetching" class="text-white/80 italic">
          Ładowanie użytkowników...
        </div>

        <div v-else-if="users.length > 0">
          <ul class="space-y-2">
            <li v-for="(user, index) in users" :key="index"
              class="bg-white/20 rounded-xl px-4 py-2 flex justify-between items-center">
              <div>
                {{ user.firstName }} {{ user.lastName }} — <span class="text-white/80">{{ user.email }}</span>
              </div>
              <button @click="deleteUserFromDb(index, user.id)"
                class="text-sm text-red-400 hover:text-red-200 transition">
                Usuń
              </button>
            </li>

          </ul>
        </div>

        <div v-else class="text-white/70 italic">
          Brak użytkowników (nie powinno się zdarzyć 🙃)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const users = ref<{ id: string; firstName: string; lastName: string; email: string }[]>([])

const isFetching = ref(false)
const isAdding = ref(false)
const addSuccess = ref(false)

const fetchUsers = async () => {
  isFetching.value = true
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Błąd przy pobieraniu użytkowników')
    }
    const data = await response.json()
    users.value = data
  } catch (error) {
    console.error(error)
    alert('Nie udało się pobrać listy użytkowników')
  } finally {
    isFetching.value = false
  }
}

const addUser = async () => {
  isAdding.value = true
  addSuccess.value = false

  const newUser = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
  }

  try {
    const response = await fetch('http://localhost:3000/api/users/createUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newUser)
    })

    if (!response.ok) {
      throw new Error('Nie udało się zapisać użytkownika')
    }

    const savedUser = await response.json()
    users.value.push(savedUser)

    // Reset form
    firstName.value = ''
    lastName.value = ''
    email.value = ''

    // Show success
    addSuccess.value = true
    setTimeout(() => {
      addSuccess.value = false
    }, 2000)

  } catch (error) {
    console.error(error)
    alert('Błąd przy dodawaniu użytkownika')
  } finally {
    isAdding.value = false
  }
}

const deleteUserFromDb = async (index: number, userId: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Błąd przy usuwaniu użytkownika');
    }

    users.value.splice(index, 1);
  } catch (error) {
    console.error(error);
    alert('Nie udało się usunąć użytkownika');
  }
};


onMounted(fetchUsers)
</script>
