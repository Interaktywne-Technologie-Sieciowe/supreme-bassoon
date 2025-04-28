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
    <div class="container mx-auto p-4 md:p-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <!-- Calendar -->
        <div class="lg:col-span-3 bg-white rounded-xl shadow-lg p-6 overflow-hidden border border-gray-100">
          <FullCalendar :options="calendarOptions" class="calendar-container" />
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-8">
          <!-- Instructions Panel -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 class="text-xl font-semibold text-indigo-600 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Calendar Guide
            </h3>
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-center">
                <span class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                <span>Click on any event to view details</span>
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                <span>Use the arrows to navigate between months</span>
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                <span>Switch between month and week views</span>
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                <span>Colors represent different conferences</span>
              </li>
            </ul>
          </div>

          <!-- Stats Panel -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 class="text-xl font-semibold text-indigo-600 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Calendar Stats
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl text-center shadow-sm">
                <p class="text-2xl font-bold text-indigo-600">{{ events.length }}</p>
                <p class="text-sm text-gray-500 font-medium">Total Events</p>
              </div>
              <div class="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl text-center shadow-sm">
                <p class="text-2xl font-bold text-indigo-600">{{ getUniqueConferenceCount() }}</p>
                <p class="text-sm text-gray-500 font-medium">Conferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="isModalOpen"
      class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div v-if="selectedEvent" class="space-y-5">
          <!-- View Mode -->
          <div v-if="!editMode" class="bg-gray-50 p-5 rounded shadow-inner border-1 border-slate-200">
            <h3 class="text-xl font-semibold mb-2">{{ selectedEvent.extendedProps.name }}</h3>
            <p class="text-indigo-600 font-medium mb-4">{{ selectedEvent.extendedProps.conferenceName }}</p>
            <div class="space-y-3 mt-5 text-gray-700">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-3" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <span class="font-medium">Start:</span>
                  <span class="ml-2">{{ formatDateTime(selectedEvent.startStr) }}</span>
                </div>
              </div>
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-3" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span class="font-medium">End:</span>
                  <span class="ml-2">{{ formatDateTime(selectedEvent.endStr) }}</span>
                </div>
              </div>
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-3" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <span class="font-medium">Location:</span>
                  <span class="ml-2">{{ selectedEvent.extendedProps.location }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-if="editMode" class="space-y-4">
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
              <input type="datetime-local" v-model="editableEvent.start"
                class="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Data zakończenia</label>
              <input type="datetime-local" v-model="editableEvent.end"
                class="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="!editMode" class="flex" v-show="user?.role === 'admin'">
            <button @click="editEvent"
              class="rounded m-1 flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium py-3 hover:from-indigo-700 hover:to-indigo-600 transition shadow-sm">
              Edit
            </button>
            <button @click="deleteEvent"
              class="rounded m-1 flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-3 hover:from-red-700 hover:to-red-600 transition shadow-sm">
              Delete
            </button>
          </div>

          <!-- Edit Mode Buttons -->
          <div v-if="editMode" class="flex gap-3 mt-6">
            <button @click="saveEvent"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium py-3 hover:from-indigo-700 hover:to-indigo-600 transition shadow-sm">
              Zapisz
            </button>
            <button @click="closeModal"
              class="flex-1 bg-gray-100 text-gray-700 font-medium py-3 hover:bg-gray-200 transition shadow-sm">
              Anuluj
            </button>
          </div>

          <!-- Close Button (View Mode) -->
          <button v-if="!editMode" @click="closeModal"
            class="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition border-1 border-slate-200">
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
  color: #6366f1;
  /* Indigo-500 */
  font-size: 1.5rem !important;
  font-weight: 600;
}

:deep(.fc-button) {
  background: linear-gradient(to right, #4f46e5, #4338ca) !important;
  margin: 0.1618rem;
  border-color: #4338ca !important;
  color: white !important;
  font-weight: 500;
  text-transform: capitalize;
  cursor: pointer;
}

:deep(.fc-daygrid-day) {
  transition: background-color 0.15s;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 100px;
}

:deep(.fc-col-header-cell) {
  background-color: #f3f4f6;
  /* Gray-100 */
  padding: 8px 0;
}

/* Events styling */
:deep(.fc-event) {
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0.125rem 0;
  border-left-width: 3px;
  transition: transform 0.2s, box-shadow 0.2s;
}

:deep(.fc-event:hover) {
  cursor: pointer;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* Fix more+ link */
:deep(.fc-daygrid-more-link) {
  color: #6366f1;
  /* Indigo-500 */
  font-weight: 500;
  background-color: rgba(99, 102, 241, 0.1);
  padding: 2px 5px;
  border-radius: 4px;
}

.calendar-container {
  min-height: 650px;
  height: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.75rem;
  }

  :deep(.fc-toolbar-title) {
    font-size: 1.25rem !important;
  }

  :deep(.fc-daygrid-day-frame) {
    min-height: 70px;
  }
}
</style>
