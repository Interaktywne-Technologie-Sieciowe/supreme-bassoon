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
const editMode = ref(false)
const editableEvent = ref<any | null>(null)
// Define color palette outside the function to ensure it's available
const colorPalette = [
  { bg: '#8b5cf6', border: '#7c3aed' }, // Violet
  { bg: '#3b82f6', border: '#2563eb' }, // Blue
  { bg: '#10b981', border: '#059669' }, // Emerald
  { bg: '#f59e0b', border: '#d97706' }, // Amber
  { bg: '#ef4444', border: '#dc2626' }  // Red
];

const diverseHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1_000_000; // Use a prime multiplier and large modulus
  }
  return Math.abs(hash); // Ensure the hash is positive
};

// Function to get a consistent color based on conference UUID with more diversity
const getColorForConference = (id: string) => {
  const index = diverseHash(id) % colorPalette.length;
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

const deleteEvent = async () => {
  if (confirm("Are you sure you want to delete this event?")) {
    try {
      await fetch(`http://localhost:3000/api/events/${selectedEvent.value.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      await fetchEvents(); // Refresh calendar
      closeModal();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  }
};


// Function to calculate total unique conferences (safely)
const getUniqueConferenceCount = () => {
  if (!events.value || events.value.length === 0) return 0;
  const conferenceIds = events.value
    .map(e => e.extendedProps?.conferenceId)
    .filter(id => id !== undefined);
  return new Set(conferenceIds).size;
};




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
    start: selectedEvent.value.start.toISOString().slice(0, 16), // 'YYYY-MM-DDTHH:MM'
    end: selectedEvent.value.end.toISOString().slice(0, 16),
    location: selectedEvent.value.extendedProps.location
  }
}

async function saveEvent() {
  try {
    console.log("Submitting updated dates:", editableEvent.value.start, editableEvent.value.end);
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
    });

    const result = await response.json();
    const updated = result.event;

    const colorInfo = getColorForConference(updated.conference_id);

    const updatedEvent = {
      id: updated.id,
      title: `${updated.name} (${selectedEvent.value.extendedProps.conferenceName})`,
      start: updated.start_date,
      end: updated.end_date,
      extendedProps: {
        name: updated.name,
        location: updated.location,
        conferenceId: updated.conference_id,
        conferenceName: selectedEvent.value.extendedProps.conferenceName
      },
      backgroundColor: colorInfo.bg,
      borderColor: colorInfo.border,
      textColor: 'white'
    };

    // Replace event in list
    const index = events.value.findIndex(e => e.id === updated.id);
    if (index !== -1) {
      events.value[index] = updatedEvent;
    }

    // Update FullCalendar instance directly
    selectedEvent.value.setStart(new Date(updated.start_date));
    selectedEvent.value.setEnd(new Date(updated.end_date));
    selectedEvent.value.setExtendedProp('name', updated.name);
    selectedEvent.value.setExtendedProp('location', updated.location);
    selectedEvent.value.setProp('title', updatedEvent.title);
    selectedEvent.value.setProp('backgroundColor', updatedEvent.backgroundColor);
    selectedEvent.value.setProp('borderColor', updatedEvent.borderColor);

    editMode.value = false;

  } catch (err) {
    console.error("Error updating event:", err);
  }
}


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
          <div class="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700">
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
          <div class="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700">
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
            <div v-if="editMode">
              <input v-model="editableEvent.name"
                class="w-full mb-2 p-2 rounded bg-gray-800 border border-gray-600 text-white" />
              <input v-model="editableEvent.conferenceName"
                class="w-full mb-2 p-2 rounded bg-gray-800 border border-gray-600 text-white" />
              <input type="datetime-local" v-model="editableEvent.start"
                class="w-full mb-2 p-2 rounded bg-gray-800 border border-gray-600 text-white" />
              <input type="datetime-local" v-model="editableEvent.end"
                class="w-full mb-2 p-2 rounded bg-gray-800 border border-gray-600 text-white" />
              <input v-model="editableEvent.location"
                class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
            </div>
            <div v-else>
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
          </div>

          <!-- Admin Actions -->
          <div class="flex space-x-2">
            <button v-show="!editMode" @click="editEvent"
              class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition duration-200 flex-1 mx-1">
              Edit Event
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
            class="w-full mt-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition duration-200">
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
  cursor: pointer;
  transform: translateY(-2px);
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
