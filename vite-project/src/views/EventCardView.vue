<script setup lang="ts">
import { MapPin, Calendar, Landmark, Pencil, Trash2 } from 'lucide-vue-next'
import type { Event } from '@/types/event'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth' // << Import your auth store
import { Heart, HeartOff } from 'lucide-vue-next'

const auth = useAuthStore()
const user = auth.user
const props = defineProps<{
  events: Event[]
}>()

const eventsList = ref([...props.events])

const isModalOpen = ref(false)
const editMode = ref(false)
const selectedEvent = ref<Event | null>(null)
const editableEvent = ref({
  name: '',
  location: '',
  start_date: '',
  end_date: ''
})

function openModal(event: Event) {
  selectedEvent.value = event
  isModalOpen.value = true
  editMode.value = true

  editableEvent.value = {
    name: event.name,
    location: event.location,
    start_date: event.start_date.slice(0, 16), // format for datetime-local input
    end_date: event.end_date.slice(0, 16)
  }
}

function closeModal() {
  isModalOpen.value = false
  selectedEvent.value = null
}

async function saveEvent() {
  if (!selectedEvent.value) return

  try {
    const response = await fetch(`http://localhost:3000/api/events/${selectedEvent.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: editableEvent.value.name,
        location: editableEvent.value.location,
        start_date: editableEvent.value.start_date,
        end_date: editableEvent.value.end_date
      })
    })

    const result = await response.json()
    const updated = result.event

    // Update the event locally in the array
    const idx = eventsList.value.findIndex(e => e.id === selectedEvent.value!.id)
    if (idx !== -1) {
      eventsList.value[idx] = { ...eventsList.value[idx], ...updated }
    }

    closeModal()
  } catch (err) {
    console.error('Error updating event:', err)
  }
}

async function deleteEvent(id: string) {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await fetch(`http://localhost:3000/api/events/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      eventsList.value = eventsList.value.filter(event => event.id !== id)
      closeModal()
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }
}

const formatDate = (startStr: string, endStr: string) => {
  const startDate = new Date(startStr)
  const endDate = new Date(endStr)

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }

  // If start and end are the same day
  if (startDate.toDateString() === endDate.toDateString()) {
    return new Intl.DateTimeFormat('pl-PL', dateOptions).format(startDate)
  } else {
    const startDateFormatted = new Intl.DateTimeFormat('pl-PL', dateOptions).format(startDate)
    const endDateFormatted = new Intl.DateTimeFormat('pl-PL', dateOptions).format(endDate)
    return `${startDateFormatted} - ${endDateFormatted}`
  }
}
async function toggleBookmark(event: Event) {
  const isNowBookmarked = !event.bookmarked

  try {
    if (isNowBookmarked) {
      await fetch(`http://localhost:3000/api/bookmarks/${event.id}`, {
        method: 'POST',
        credentials: 'include'
      })
    } else {
      await fetch(`http://localhost:3000/api/bookmarks/${event.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    }

    event.bookmarked = isNowBookmarked
  } catch (error) {
    console.error('Failed to toggle bookmark:', error)
  }
}

</script>

<template>
  <div class="container mx-auto p-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="event in eventsList" :key="event.id"
        class="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col transition duration-300 hover:shadow-xl hover:translate-y-1 relative">

        <!-- Bookmark button - redesigned as an elegant ribbon style -->
        <button @click="toggleBookmark(event)" class="absolute top-0 right-5 z-10 transition-all duration-300 transform"
          :class="[event.bookmarked ? 'text-red-500' : 'text-gray-400']">
          <div class="relative">
            <div class="w-8 h-10 overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-full bg-white shadow-md"
                :class="[event.bookmarked ? 'bg-red-50' : 'bg-gray-50']"
                style="clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);">
              </div>
            </div>
            <Heart class="absolute top-2 left-1.5 w-5 h-5 transition-all duration-300"
              :class="[event.bookmarked ? 'fill-current' : 'stroke-current fill-transparent']"
              :strokeWidth="event.bookmarked ? 0 : 2" />
          </div>
        </button>

        <div class="p-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
          <h4 class="font-semibold text-lg">{{ event.name }}</h4>
        </div>

        <div class="p-5 flex flex-col gap-4 text-gray-700">
          <div class="flex items-center gap-3">
            <Landmark class="w-5 h-5 text-indigo-500" />
            <span class="text-sm font-medium">{{ event.conference_name }}</span>
          </div>
          <div class="flex items-center gap-3">
            <MapPin class="w-5 h-5 text-emerald-500" />
            <span class="text-sm font-medium">{{ event.location }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Calendar class="w-5 h-5 text-sky-500" />
            <span class="text-sm font-medium">{{ formatDate(event.start_date, event.end_date) }}</span>
          </div>

          <!-- Admin Buttons -->
          <div v-show="user?.role === 'admin'" class="mt-2 flex justify-center gap-3">
            <button @click="openModal(event)"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Pencil class="w-4 h-4" /> Edytuj
            </button>
            <button @click="deleteEvent(event.id)"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 class="w-4 h-4" /> Usuń
            </button>
          </div>
          <!-- End Admin Buttons -->

        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen"
      class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Edytuj wydarzenie</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Nazwa wydarzenia</label>
            <input v-model="editableEvent.name"
              class="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Nazwa wydarzenia" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Lokalizacja</label>
            <input v-model="editableEvent.location"
              class="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Lokalizacja" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Data rozpoczęcia</label>
            <input type="datetime-local" v-model="editableEvent.start_date"
              class="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Data zakończenia</label>
            <input type="datetime-local" v-model="editableEvent.end_date"
              class="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="saveEvent"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-lg py-3 hover:from-indigo-700 hover:to-indigo-600 transition shadow-sm">
              Zapisz
            </button>
            <button @click="closeModal"
              class="flex-1 bg-gray-100 text-gray-700 font-medium rounded-lg py-3 hover:bg-gray-200 transition shadow-sm">
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
