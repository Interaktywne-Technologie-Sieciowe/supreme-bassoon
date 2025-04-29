<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-8 text-gray-800 space-y-8">
      <h2 class="text-3xl font-bold text-center">Panel administratora</h2>

      <!-- Switch Panel -->
      <div class="flex justify-center gap-6">
        <button @click="activeTab = 'users'" :class="buttonTabClass('users')">
          Użytkownicy
        </button>
        <button @click="activeTab = 'conferences'" :class="buttonTabClass('conferences')">
          Konferencje
        </button>
      </div>

      <!-- Conferences -->
      <div v-if="activeTab === 'conferences'" class="space-y-6">
        <!-- Conference List -->
        <div>
          <h3 class="text-xl font-semibold mb-2">Lista konferencji</h3>
          <div v-if="isLoadingConferences" class="text-gray-500 italic">Ładowanie konferencji...</div>
          <div v-else-if="conferences.length">
            <ul class="space-y-2">
              <li v-for="(conf, index) in conferences" :key="conf.id"
                class="bg-white shadow rounded-xl px-4 py-3 flex justify-between items-center border border-gray-200">
                <div>
                  <p class="font-semibold">{{ conf.name || 'Konferencja' }}</p>
                  <p class="text-gray-500 text-sm">ID: {{ conf.id }}</p>
                </div>
                <button @click="handleDeleteConference(index, conf.id)"
                  class="text-sm text-red-500 hover:text-red-700 transition">
                  Usuń
                </button>
              </li>
            </ul>
          </div>
          <div v-else class="text-gray-500 italic">Brak konferencji</div>
        </div>

        <!-- Export Section -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Import/Export konferencji</h3>
          <div class="flex items-center gap-2">
            <input v-model="exportId" type="text" placeholder="ID konferencji do eksportu"
              class="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400" />
            <button @click="exportConference"
              class="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition">
              Eksportuj
            </button>
          </div>

          <form @submit.prevent="importConference" class="space-y-2">
            <input type="file" accept="application/json" @change="handleFileChange" class="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
              file:rounded-xl file:border-0 file:text-sm file:font-semibold
              file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" />
            <button type="submit"
              class="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition">
              Importuj
            </button>
          </form>
        </div>
      </div>

      <!-- Users -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <form @submit.prevent="addUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input v-model="firstName" type="text" placeholder="Imię" required
              class="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400" />
            <input v-model="lastName" type="text" placeholder="Nazwisko" required
              class="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400" />
            <input v-model="email" type="email" placeholder="Email" required
              class="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400" />
          </div>
          <button :disabled="isAdding"
            class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50">
            <span v-if="isAdding">Dodawanie...</span>
            <span v-else>Dodaj użytkownika</span>
          </button>
        </form>

        <p v-if="addSuccess" class="text-green-600 text-center">Użytkownik dodany pomyślnie ✅</p>

        <div>
          <h3 class="text-xl font-semibold mb-2">Lista użytkowników</h3>
          <div v-if="isFetching" class="text-gray-500 italic">Ładowanie użytkowników...</div>
          <div v-else-if="users.length">
            <ul class="space-y-2">
              <li v-for="(user, index) in users" :key="index"
                class="bg-white shadow rounded-xl px-4 py-3 flex justify-between items-center border border-gray-200">
                <div>
                  {{ user.firstName }} {{ user.lastName }} —
                  <span class="text-gray-500">{{ user.email }}</span>
                </div>
                <button @click="deleteUserFromDb(index, user.id)"
                  class="text-sm text-red-500 hover:text-red-700 transition">
                  Usuń
                </button>
              </li>
            </ul>
          </div>
          <div v-else class="text-gray-500 italic">Brak użytkowników</div>
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
const conferences = ref<{ id: string; name?: string }[]>([])
const isLoadingConferences = ref(false)

const fetchConferences = async () => {
  isLoadingConferences.value = true
  try {
    const response = await fetch('http://localhost:3000/api/conferences', {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Błąd przy pobieraniu konferencji')

    const data = await response.json()
    conferences.value = data
  } catch (error) {
    console.error(error)
    alert('Nie udało się pobrać konferencji')
  } finally {
    isLoadingConferences.value = false
  }
}

const deleteConference = async (index: number, id: string) => {
  const confirmDelete = confirm('Czy na pewno chcesz usunąć tę konferencję?')
  if (!confirmDelete) return

  try {
    const response = await fetch(`http://localhost:3000/api/conferences/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Błąd przy usuwaniu konferencji')

    conferences.value.splice(index, 1)
  } catch (error) {
    console.error(error)
    alert('Nie udało się usunąć konferencji')
  }
}

onMounted(() => {
  fetchUsers()
  fetchConferences()
})

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
const activeTab = ref('users')

const buttonTabClass = (tab: any) =>
  `px-6 py-2 rounded-full font-semibold transition ${activeTab.value === tab
    ? 'bg-white text-indigo-600 shadow'
    : 'bg-indigo-100 text-indigo-700 hover:bg-white hover:shadow'
  }`

// Example wrapper for refreshing after deletion
async function handleDeleteConference(index: number, id: string) {
  await deleteConference(index, id)
  await fetchConferences() // Refresh list
}
</script>
