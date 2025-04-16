<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import plLocale from '@fullcalendar/core/locales/pl'

const events = ref([])

const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/events')
    const data = await response.json()

    events.value = data.map((event: any) => ({
      id: event.id,
      title: `${event.name} (${event.conference_name})`,
      start: event.start_date,
      end: event.end_date,
      extendedProps: {
        location: event.location,
        conferenceId: event.conference_id,
      },
      backgroundColor: '#7c3aed', 
      borderColor: '#6d28d9',
      textColor: 'white',
    }))
  } catch (error) {
    console.error('Błąd podczas pobierania eventów:', error)
  }
}

onMounted(() => {
  fetchEvents()
})

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: '100%',
  locale: plLocale,
  events: events
})
</script>

<template>
  <div class="page-layout">
    <div class="left-column">
      <FullCalendar :options="calendarOptions" />
    </div>
    <div class="right-column">
      <div class="box">Box 1</div>
      <div class="box">Box 2</div>
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
