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
</script>


<template>
  <div class="page-layout">
    <div class="left-column">
      <FullCalendar :options="calendarOptions" />
    </div>

    <div class="right-column" v-if="selectedEvent">
      <div class="box">
        <h3>{{ selectedEvent.title }}</h3>
        <p><strong>Start:</strong> {{ selectedEvent.startStr }}</p>
        <p><strong>End:</strong> {{ selectedEvent.endStr }}</p>
        <p><strong>Location:</strong> {{ selectedEvent.extendedProps.location }}</p>
        <p><strong>Conference:</strong> {{ selectedEvent.extendedProps.conferenceName }}</p>
      </div>

      <!-- Show only if user is admin -->
      <div class="box" v-if="user?.role === 'admin'">
        <h3>Admin Panel</h3>
        <button>Edit Event</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.calendar-container {
  height: calc(100vh - 5rem);
  max-width: 100%;
  overflow: auto;
  color: white;
}

:deep(.fc) {
  color: white;
}

:deep(.fc .fc-scrollgrid) {
  width: 100%;
}

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
}

.right-column {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.left-column {
  flex: 1;
  overflow: auto;
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
