<template>
  <div class="container mx-auto p-4 md:p-6 text-gray-800">
    <div class="bg-white shadow-lg rounded-xl p-5 md:p-6 space-y-8">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl font-bold text-gray-900">Panel Administratora</h2>
        <div class="flex items-center gap-3">
          <button @click="activeTab = 'users'"
            :class="['px-4 py-2 rounded-lg font-medium transition text-sm', activeTab === 'users' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
            Użytkownicy
          </button>
          <button @click="activeTab = 'conferences'"
            :class="['px-4 py-2 rounded-lg font-medium transition text-sm', activeTab === 'conferences' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
            Konferencje
          </button>
        </div>
      </div>

      <!-- USERS -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <form @submit.prevent="addUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input v-model="firstName" type="text" placeholder="Imię" required
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
            <input v-model="lastName" type="text" placeholder="Nazwisko" required
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
            <input v-model="email" type="email" placeholder="Email" required
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
          </div>
          <button :disabled="isAdding"
            class="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition shadow-sm">
            <span v-if="isAdding">Dodawanie...</span>
            <span v-else>Dodaj użytkownika</span>
          </button>
        </form>

        <p v-if="addSuccess" class="text-green-500 text-center font-medium text-sm">Użytkownik dodany pomyślnie</p>

        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">Lista użytkowników</h3>
            <span class="text-xs text-gray-500">{{ users.length || 0 }} użytkowników</span>
          </div>

          <div v-if="isFetching" class="italic text-gray-500 text-sm">Ładowanie użytkowników...</div>
          <ul v-else-if="users.length" class="space-y-1.5">
            <li v-for="(user, index) in users" :key="index"
              class="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 flex justify-between items-center shadow-sm hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-sm">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-gray-500 text-xs">{{ user.email }}</p>
              </div>
              <button @click="deleteUserFromDb(index, user.id)"
                class="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition">
                Usuń
              </button>
            </li>
          </ul>
          <div v-else class="italic text-gray-500 text-sm py-2">Brak użytkowników</div>
        </div>
      </div>

      <!-- CONFERENCES -->
      <div v-if="activeTab === 'conferences'" class="space-y-8">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">Lista konferencji</h3>
            <span class="text-xs text-gray-500">{{ conferences.length || 0 }} konferencji</span>
          </div>

          <div v-if="isLoadingConferences" class="italic text-gray-500 text-sm">Ładowanie konferencji...</div>
          <ul v-else-if="conferences.length" class="space-y-1.5">
            <li v-for="(conf, index) in conferences" :key="conf.id"
              class="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 flex justify-between items-center shadow-sm hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-sm">{{ conf.name || 'Konferencja' }}</p>
                <p class="text-gray-500 text-xs">ID: {{ conf.id }}</p>
              </div>
              <button @click="deleteConference(index, conf.id)"
                class="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition">
                Usuń
              </button>
            </li>
          </ul>
          <div v-else class="italic text-gray-500 text-sm py-2">Brak konferencji</div>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <h3 class="text-lg font-semibold mb-3 text-gray-900">Import / Export konferencji</h3>

          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <input v-model="exportId" type="text" placeholder="ID konferencji do eksportu"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
            <button @click="exportConference"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition text-sm whitespace-nowrap">
              Eksportuj
            </button>
          </div>

          <form @submit.prevent="importConference" class="flex flex-col sm:flex-row gap-3">
            <input type="file" accept="application/json" @change="handleFileChange" class="flex-1 block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3
                   file:rounded-lg file:border-0 file:text-sm file:font-medium
                   file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
            <button type="submit"
              class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition shadow-sm text-sm whitespace-nowrap">
              Importuj
            </button>
          </form>
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
    fetchConferences()
  } catch (error) {
    console.error(error)
    alert('Nie udało się zaimportować konferencji')
  }
}
const activeTab = ref('users')

</script>
