<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import plLocale from '@fullcalendar/core/locales/pl'

const calendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: '100%',
  locale: plLocale
}
</script>

<template>
  <div class="calendar-container">
    <FullCalendar :options="calendarOptions" />
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
</style>
