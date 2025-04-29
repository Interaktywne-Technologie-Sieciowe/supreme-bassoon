<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
    <div
      class="w-full max-w-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white space-y-6">
      <h2 class="text-3xl font-bold text-center">Panel administratora</h2>
      <div class="pt-8 border-t border-white/20">
        <h3 class="text-xl font-semibold mb-4">Import/Export konferencji</h3>

        <!-- Export Section -->
        <div class="flex items-center gap-2 mb-4">
          <input v-model="exportId" type="text" placeholder="ID konferencji do eksportu"
            class="flex-1 px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white" />
          <button @click="exportConference"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition disabled:opacity-50">
            Eksportuj
          </button>
        </div>

        <!-- Import Section -->
        <form @submit.prevent="importConference" class="space-y-2">
          <input type="file" accept="application/json" @change="handleFileChange" class="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4
      file:rounded-full file:border-0 file:text-sm file:font-semibold
      file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
          <button type="submit"
            class="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-semibold transition disabled:opacity-50">
            Importuj
          </button>
        </form>
      </div>

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
const exportId = ref('')
const importFile = ref<File | null>(null)

const exportConference = async () => {
  if (!exportId.value) return alert("Podaj ID konferencji")

  try {
    const response = await fetch(`http://localhost:3000/api/conferences/export/${exportId.value}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Błąd przy eksporcie konferencji')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `conference-${exportId.value}.json`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    alert("Nie udało się wyeksportować konferencji")
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  importFile.value = target.files?.[0] || null
}

const importConference = async () => {
  if (!importFile.value) return alert("Wybierz plik JSON")

  const formData = new FormData()
  formData.append('file', importFile.value)

  try {
    const response = await fetch('http://localhost:3000/api/conferences/import', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Błąd przy imporcie konferencji')

    alert('Import zakończony sukcesem ✅')
  } catch (error) {
    console.error(error)
    alert('Nie udało się zaimportować konferencji')
  }
}

</script>
