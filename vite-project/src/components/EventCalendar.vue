<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Event } from '@/types/event'
import { useAuthStore } from '@/stores/auth'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import plLocale from '@fullcalendar/core/locales/pl'

const auth = useAuthStore()
const user = auth.user

const events = ref<any[]>([]) // FullCalendar uses a specific event shape
const selectedEvent = ref<any | null>(null)
const isModalOpen = ref(false)

// Define color palette outside the function to ensure it's available
const colorPalette = [
  { bg: '#8b5cf6', border: '#7c3aed' }, // Violet
  { bg: '#3b82f6', border: '#2563eb' }, // Blue
  { bg: '#10b981', border: '#059669' }, // Emerald
  { bg: '#f59e0b', border: '#d97706' }, // Amber
  { bg: '#ef4444', border: '#dc2626' }  // Red
];

// Function to get a consistent color based on conference ID
const getColorForConference = (id: number) => {
  // Ensure id is a number and use modulo to get index
  const numericId = typeof id === 'number' ? id : parseInt(String(id), 10) || 0;
  const index = Math.abs(numericId) % colorPalette.length;
  return colorPalette[index];
};

const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/events')
    const data: Event[] = await response.json()

    events.value = data.map((event) => {
      // Get colors based on conference ID
      const colorInfo = getColorForConference(event.conference_id);

      return {
        id: event.id,
        title: `${event.name} (${event.conference_name})`,
        start: event.start_date,
        end: event.end_date,
        extendedProps: {
          location: event.location,
          conferenceId: event.conference_id,
          name: event.name,
          conferenceName: event.conference_name,
        },
        backgroundColor: colorInfo.bg,
        borderColor: colorInfo.border,
        textColor: 'white',
      };
    });
  } catch (error) {
    console.error('Błąd podczas pobierania eventów:', error)
  }
}

onMounted(fetchEvents)

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: 'auto',
  locale: plLocale,
  events: events,
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

const closeModal = () => {
  isModalOpen.value = false
}

const formatDateTime = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pl-PL', options).format(date)
}

const editEvent = () => {
  // Implement edit functionality
  console.log("Editing event:", selectedEvent.value.id);
  // Here you would typically redirect to an edit page or open an edit modal
}

const deleteEvent = () => {
  // Implement delete functionality
  console.log("Deleting event:", selectedEvent.value.id);
  // Add confirmation dialog and API call to delete
}

// Function to calculate total unique conferences (safely)
const getUniqueConferenceCount = () => {
  if (!events.value || events.value.length === 0) return 0;
  const conferenceIds = events.value
    .map(e => e.extendedProps?.conferenceId)
    .filter(id => id !== undefined);
  return new Set(conferenceIds).size;
};
</script>

<template>
  <div class="bg-gray-900 min-h-screen text-gray-100">
    <div class="container mx-auto p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-indigo-300 mb-2">Event Calendar</h1>
        <p class="text-gray-400">Click on any event to view details</p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <!-- Calendar -->
        <div class="lg:col-span-3 bg-gray-800 rounded-xl shadow-xl p-4 overflow-hidden">
          <FullCalendar :options="calendarOptions" class="calendar-container" />
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Instructions Panel -->
          <div class="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700">
            <h3 class="text-xl font-semibold text-indigo-300 mb-3">
              <span class="mr-2">📋</span>Calendar Guide
            </h3>
            <ul class="space-y-2 text-gray-300">
              <li class="flex items-start">
                <span class="text-indigo-400 mr-2">•</span>
                <span>Click on any event to view details</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-400 mr-2">•</span>
                <span>Use the arrows to navigate between months</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-400 mr-2">•</span>
                <span>Switch between month and week views</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-400 mr-2">•</span>
                <span>Colors represent different conferences</span>
              </li>
            </ul>
          </div>

          <!-- Stats Panel -->
          <div class="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700">
            <h3 class="text-xl font-semibold text-indigo-300 mb-3">
              <span class="mr-2">📊</span>Calendar Stats
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-700 p-3 rounded-lg text-center">
                <p class="text-2xl font-bold text-indigo-300">{{ events.length }}</p>
                <p class="text-sm text-gray-400">Total Events</p>
              </div>
              <div class="bg-gray-700 p-3 rounded-lg text-center">
                <p class="text-2xl font-bold text-indigo-300">{{ getUniqueConferenceCount() }}</p>
                <p class="text-sm text-gray-400">Conferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="isModalOpen"
      class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-indigo-300">Event Details</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-white transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="selectedEvent" class="space-y-4">
          <div class="bg-gray-700 p-4 rounded-lg">
            <h3 class="text-xl font-semibold mb-2">{{ selectedEvent.extendedProps.name }}</h3>
            <p class="text-indigo-300 text-sm mb-2">{{ selectedEvent.extendedProps.conferenceName }}</p>

            <div class="space-y-2 mt-4">
              <div class="flex">
                <span class="text-gray-400 w-20">Start:</span>
                <span>{{ formatDateTime(selectedEvent.startStr) }}</span>
              </div>
              <div class="flex">
                <span class="text-gray-400 w-20">End:</span>
                <span>{{ formatDateTime(selectedEvent.endStr) }}</span>
              </div>
              <div class="flex">
                <span class="text-gray-400 w-20">Location:</span>
                <span>{{ selectedEvent.extendedProps.location }}</span>
              </div>
            </div>
          </div>

          <!-- Admin Actions -->
          <div v-if="user?.role === 'admin'" class="border-t border-gray-700 pt-4">
            <h4 class="text-lg font-medium text-indigo-300 mb-3">Admin Actions</h4>
            <div class="flex space-x-3">
              <button @click="editEvent"
                class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition duration-200 flex-1">
                Edit Event
              </button>
              <button @click="deleteEvent"
                class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200 flex-1">
                Delete
              </button>
            </div>
          </div>

          <button @click="closeModal"
            class="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition duration-200">
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

/* Calendar grid & cells */
:deep(.fc-scrollgrid) {
  border-color: #374151 !important;
  /* Gray-700 */
}

:deep(.fc-scrollgrid-section > td) {
  border-color: #374151 !important;
  /* Gray-700 */
}

:deep(.fc-col-header-cell) {
  background-color: #1f2937;
  /* Gray-800 */
  color: #9ca3af;
  /* Gray-400 */
  font-weight: 600;
  padding: 0.75rem 0;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border-color: #374151 !important;
  /* Gray-700 */
}

:deep(.fc-daygrid-day) {
  transition: background-color 0.15s;
}

:deep(.fc-daygrid-day:hover) {
  background-color: #1f2937;
  /* Gray-800 */
}

:deep(.fc-daygrid-day-number) {
  color: #d1d5db;
  /* Gray-300 */
  font-size: 0.875rem;
  padding: 0.5rem;
}

:deep(.fc-day-other .fc-daygrid-day-number) {
  color: #6b7280;
  /* Gray-500 */
}

/* Today highlight */
:deep(.fc-day-today) {
  background-color: rgba(79, 70, 229, 0.1) !important;
  /* Indigo with opacity */
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
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

:deep(.fc-daygrid-event-dot) {
  border-width: 5px;
}

/* Fix more+ link */
:deep(.fc-daygrid-more-link) {
  color: #93c5fd;
  /* Blue-300 */
  font-weight: 500;
}

/* For the current day */
:deep(.fc-day-today .fc-daygrid-day-frame) {
  border: 1px solid rgba(79, 70, 229, 0.5);
  /* Indigo with opacity */
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
