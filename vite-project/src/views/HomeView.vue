<script setup lang="ts">
import Login from '../components/UserLogin.vue'
import CalendarView from './CalendarView.vue'
import CardView from './EventCardView.vue'
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted } from 'vue'
import type { Event } from '@/types/event'

const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.user)
const calendarMode = ref(true)

// Fetch events
const events = ref<Event[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [eventsRes, bookmarksRes] = await Promise.all([
      fetch('http://localhost:3000/api/events'),
      fetch('http://localhost:3000/api/bookmarks', { credentials: 'include' })
    ])
    const [eventData, bookmarksData] = await Promise.all([
      eventsRes.json(),
      bookmarksRes.json()
    ])

    const bookmarkedIds = new Set(bookmarksData.map((b: any) => b.id))
    events.value = eventData.map((e: Event) => ({
      ...e,
      bookmarked: bookmarkedIds.has(e.id)
    }))
  } catch (error) {
    console.error('Failed to load events or bookmarks:', error)
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <main class="p-6">
    <Login v-if="!isLoggedIn" />
    <div v-else>
      <div class="flex justify-center items-center gap-3">
        <!-- Modern Toggle Switch -->
        <div class="relative inline-flex items-center flex flex-col">
          <div class="w-14 h-7 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out cursor-pointer"
            :class="{ 'bg-indigo-100': calendarMode }" @click="calendarMode = !calendarMode">
            <div class="bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out"
              :class="{ 'translate-x-7': calendarMode }"></div>
          </div>

          <div class="mt-1 text-sm font-medium flex text-lg-center text-amber-50">
            {{ calendarMode ? 'Kalendarz' : 'Karty' }}
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Content views -->
      <div v-else class="transition-opacity duration-300">
        <CalendarView v-if="calendarMode" :events="events" />
        <CardView v-else :events="events" />
      </div>
    </div>
  </main>
</template>
