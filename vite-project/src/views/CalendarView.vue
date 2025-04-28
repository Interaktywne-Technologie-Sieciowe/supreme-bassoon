<script setup lang="ts">
import Calendar from '@/components/EventCalendar.vue'
import type { Event } from '@/types/event'

defineProps<{
  events: Event[]
}>()
</script>

<template>
  <main>
    <Calendar :events="events" />
  </main>
</template>
