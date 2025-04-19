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

const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/events')
    const data: Event[] = await response.json()

    events.value = data.map((event) => ({
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
      backgroundColor: '#7c3aed',
      borderColor: '#6d28d9',
      textColor: 'white',
    }))
  } catch (error) {
    console.error('Błąd podczas pobierania eventów:', error)
  }
}

onMounted(fetchEvents)

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: '100%',
  locale: plLocale,
  events: events,
  eventClick: (info: any) => {
    selectedEvent.value = info.event
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

</script>


<template>
  <div class="page-layout">
    <div class="left-column">
      <FullCalendar :options="calendarOptions" />
    </div>

    <div class="right-column">
      <div v-if="selectedEvent" class="box">
        <h3>{{ selectedEvent.title }}</h3>
        <p><strong>Start:</strong> {{ formatDateTime(selectedEvent.startStr) }}</p>
        <p><strong>End:</strong> {{ formatDateTime(selectedEvent.endStr) }}</p>
        <p><strong>Location:</strong> {{ selectedEvent.extendedProps.location }}</p>
        <p><strong>Conference:</strong> {{ selectedEvent.extendedProps.conferenceName }}</p>
      </div>

      <div v-if="selectedEvent && user?.role === 'admin'" class="box">
        <h3>Admin Panel</h3>
        <button>Edit Event</button>
      </div>

      <div v-else class="box">
        <h3>How to Use the Calendar</h3>
        <ul>
          <li>📅 Click on any event to view details here.</li>
          <li>➡️ Use the arrows to switch between months.</li>
          <li>🎨 Colored events represent different conferences.</li>
          <li>👤 Admins can edit events after selecting one.</li>
        </ul>
      </div>
    </div>
  </div>

</template>


<style scoped>
.calendar-container {
  max-width: 100%;
  overflow: auto;
  color: white;
}

:deep(.fc) {
  color: white;
  font-family: inherit;
}

:deep(.fc-event),
:deep(.fc-daygrid-event) {
  text-decoration: none !important;
  color: white !important;
  cursor: pointer;
}

:deep(.fc-event:hover) {
  opacity: 0.9;
}

:deep(.fc-scrollgrid),
:deep(.fc-theme-standard .fc-scrollgrid) {
  background-color: #22222271;
}

:deep(.fc-next-button) {
  margin-right: 30px;
}

:deep(#fc-dom-1) {
  margin-left: 30px;
}

.page-layout {
  display: flex;
  height: calc(100vh - 5rem);
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
}

.left-column {
  flex: 0 0 60%;
  max-width: 60%;
  min-width: 600px;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.box {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  color: white;
  height: 50%;
}
</style>
