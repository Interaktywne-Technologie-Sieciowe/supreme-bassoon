<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Event } from '@/types/event'
import { useAuthStore } from '@/stores/auth'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import plLocale from '@fullcalendar/core/locales/pl'

const props = defineProps<{
  events: Event[]
}>()

const auth = useAuthStore()
const user = auth.user
const selectedEvent = ref<any | null>(null)
const isModalOpen = ref(false)
const editMode = ref(false)
const editableEvent = ref<any | null>(null)

const colorPalette = [
  { bg: '#8b5cf6', border: '#7c3aed' },
  { bg: '#3b82f6', border: '#2563eb' },
  { bg: '#10b981', border: '#059669' },
  { bg: '#f59e0b', border: '#d97706' },
  { bg: '#ef4444', border: '#dc2626' }
]

const diverseHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1_000_000
  }
  return Math.abs(hash)
}

const getColorForConference = (id: string) => {
  const index = diverseHash(id) % colorPalette.length
  return colorPalette[index]
}

// Map backend events to FullCalendar events
const mapEvents = (events: Event[]) => {
  return events.map(event => {
    const colorInfo = getColorForConference(event.conference_id)
    return {
      id: event.id,
      title: `${event.name} (${event.conference_name})`,
      start: event.start_date,
      end: event.end_date,
      extendedProps: {
        location: event.location,
        conferenceId: event.conference_id,
        name: event.name,
        conferenceName: event.conference_name
      },
      backgroundColor: colorInfo.bg,
      borderColor: colorInfo.border,
      textColor: 'white'
    }
  })
}

const calendarOptions = ref<any>({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: 'auto',
  locale: plLocale,
  events: mapEvents(props.events),
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek'
  },
  buttonText: {
    today: 'Dzisiaj',
    month: 'Miesiąc',
    week: 'Tydzień'
  },
  eventClick: (info: any) => {
    selectedEvent.value = info.event
    isModalOpen.value = true
  }
})

// Watch if props.events change
watch(() => props.events, (newEvents) => {
  calendarOptions.value.events = mapEvents(newEvents)
})

const formatDateTime = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pl-PL', options).format(date)
}

function closeModal() {
  isModalOpen.value = false
  editMode.value = false
  selectedEvent.value = null
  editableEvent.value = {}
}

function editEvent() {
  editMode.value = true
  editableEvent.value = {
    name: selectedEvent.value.extendedProps.name,
    conferenceName: selectedEvent.value.extendedProps.conferenceName,
    start: selectedEvent.value.start.toISOString().slice(0, 16),
    end: selectedEvent.value.end.toISOString().slice(0, 16),
    location: selectedEvent.value.extendedProps.location
  }
}

// Function to calculate total unique conferences (safely)
const getUniqueConferenceCount = () => {
  if (!props.events.length || props.events.length === 0) return 0;
  const conferenceIds = props.events
    .map(e => e.conference_id)
    .filter(id => id !== undefined);
  return new Set(conferenceIds).size;
};

async function saveEvent() {
  try {
    const response = await fetch(`http://localhost:3000/api/events/${selectedEvent.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: editableEvent.value.name,
        start_date: editableEvent.value.start,
        end_date: editableEvent.value.end,
        location: editableEvent.value.location
      })
    })

    const result = await response.json()
    const updated = result.event
    const colorInfo = getColorForConference(updated.conference_id)

    selectedEvent.value.setStart(new Date(updated.start_date))
    selectedEvent.value.setEnd(new Date(updated.end_date))
    selectedEvent.value.setExtendedProp('name', updated.name)
    selectedEvent.value.setExtendedProp('location', updated.location)
    selectedEvent.value.setProp('title', `${updated.name} (${selectedEvent.value.extendedProps.conferenceName})`)
    selectedEvent.value.setProp('backgroundColor', colorInfo.bg)
    selectedEvent.value.setProp('borderColor', colorInfo.border)

    editMode.value = false
  } catch (err) {
    console.error('Error updating event:', err)
  }
}

async function deleteEvent() {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await fetch(`http://localhost:3000/api/events/${selectedEvent.value.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      // Remove event from calendar manually
      selectedEvent.value.remove()
      closeModal()
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }
}
</script>


<template>
  <div>
    <div class="container mx-auto p-4 md:p-6">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <!-- Calendar -->
        <div class="lg:col-span-3 bg-white rounded shadow-lg p-4 overflow-hidden border border-gray-200">
          <FullCalendar :options="calendarOptions" class="calendar-container" />
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Instructions Panel -->
          <div class="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <h3 class="text-xl font-semibold text-indigo-600 mb-3">
              <span class="mr-2">📋</span>Calendar Guide
            </h3>
            <ul class="space-y-2 text-gray-700 text-sm">
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>Click on any event to view details</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>Use the arrows to navigate between months</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>Switch between month and week views</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>Colors represent different conferences</span>
              </li>
            </ul>
          </div>

          <!-- Stats Panel -->
          <div class="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <h3 class="text-xl font-semibold text-indigo-600 mb-3">
              <span class="mr-2">📊</span>Calendar Stats
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-100 p-3 rounded-lg text-center">
                <p class="text-2xl font-bold text-indigo-600">{{ events.length }}</p>
                <p class="text-sm text-gray-500">Total Events</p>
              </div>
              <div class="bg-gray-100 p-3 rounded-lg text-center">
                <p class="text-2xl font-bold text-indigo-600">{{ getUniqueConferenceCount() }}</p>
                <p class="text-sm text-gray-500">Conferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="isModalOpen"
      class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-indigo-600">Event Details</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="selectedEvent" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div v-if="editMode">
              <input v-model="editableEvent.name"
                class="w-full mb-2 p-2 rounded bg-white border border-gray-300 text-gray-800" />
              <input v-model="editableEvent.conferenceName"
                class="w-full mb-2 p-2 rounded bg-white border border-gray-300 text-gray-800" />
              <input type="datetime-local" v-model="editableEvent.start"
                class="w-full mb-2 p-2 rounded bg-white border border-gray-300 text-gray-800" />
              <input type="datetime-local" v-model="editableEvent.end"
                class="w-full mb-2 p-2 rounded bg-white border border-gray-300 text-gray-800" />
              <input v-model="editableEvent.location"
                class="w-full p-2 rounded bg-white border border-gray-300 text-gray-800" />
            </div>
            <div v-else>
              <h3 class="text-xl font-semibold mb-2">{{ selectedEvent.extendedProps.name }}</h3>
              <p class="text-indigo-600 text-sm mb-2">{{ selectedEvent.extendedProps.conferenceName }}</p>
              <div class="space-y-2 mt-4 text-gray-700">
                <div class="flex">
                  <span class="font-semibold w-20">Start:</span>
                  <span>{{ formatDateTime(selectedEvent.startStr) }}</span>
                </div>
                <div class="flex">
                  <span class="font-semibold w-20">End:</span>
                  <span>{{ formatDateTime(selectedEvent.endStr) }}</span>
                </div>
                <div class="flex">
                  <span class="font-semibold w-20">Location:</span>
                  <span>{{ selectedEvent.extendedProps.location }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Actions -->
          <div class="flex space-x-2" v-show="user?.role === 'admin'">
            <button v-show="!editMode" @click="editEvent"
              class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition duration-200 flex-1 mx-1">
              Edit
            </button>
            <button v-show="editMode" @click="saveEvent"
              class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition duration-200 flex-1 mx-1">
              Save
            </button>
            <button @click="deleteEvent"
              class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200 flex-1 mx-1">
              Delete
            </button>
          </div>

          <button @click="closeModal"
            class="w-full mt-2 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition duration-200">
            Close
          </button>
        </div>

      </div>
    </div>
  </div>
</template>


<style scoped>
/* Base styles for FullCalendar */
:deep(.fc) {
  font-family: inherit;
  cursor: default;
  text-decoration: none;
}

:deep(.fc-theme-standard) {
  background-color: transparent;
}

:deep(.fc-toolbar-title) {
  color: #c4b5fd;
  /* Indigo-300 */
  font-size: 1.25rem !important;
  font-weight: 600;
}

:deep(.fc-button) {
  background-color: #4f46e5 !important;
  /* Indigo-600 */
  border-color: #4338ca !important;
  /* Indigo-700 */
  color: white !important;
  font-weight: 500;
  text-transform: capitalize;
  padding: 0.375rem 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
}

:deep(.fc-button:hover) {
  background-color: #4338ca !important;
  /* Indigo-700 */
  border-color: #3730a3 !important;
  /* Indigo-800 */
}

:deep(.fc-button-active) {
  background-color: #3730a3 !important;
  /* Indigo-800 */
  border-color: #312e81 !important;
  /* Indigo-900 */
}

:deep(.fc-daygrid-day) {
  transition: background-color 0.15s;
}

/* Events styling */
:deep(.fc-event) {
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0.125rem 0;
  border-left-width: 3px;
  transition: transform 0.2s, opacity 0.2s;
}

:deep(.fc-event:hover) {
  cursor: pointer;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}


/* Fix more+ link */
:deep(.fc-daygrid-more-link) {
  color: #93c5fd;
  /* Blue-300 */
  font-weight: 500;
}

.calendar-container {
  min-height: 600px;
  height: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }

  :deep(.fc-toolbar-title) {
    font-size: 1rem !important;
  }
}
</style>
