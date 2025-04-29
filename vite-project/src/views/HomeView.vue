<script setup lang="ts">
import Login from '../components/UserLogin.vue'
import CalendarView from '../components/EventCalendar.vue'
import CardView from './EventCardView.vue'
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted } from 'vue'
import type { Event } from '@/types/event'
import type { User } from '@/types/user'

const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.user)
const calendarMode = ref(true)
const showBookmarkedOnly = ref(false)
const filteredEvents = computed(() =>
  showBookmarkedOnly.value ? events.value.filter(e => e.bookmarked) : events.value
)

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

    if (Array.isArray(bookmarksData)) {
      const bookmarkedIds = new Set(bookmarksData.map((b: any) => b.id))
      events.value = eventData.map((e: Event) => ({
        ...e,
        bookmarked: bookmarkedIds.has(e.id)
      }))
    } else {
      // Handle case where bookmarksData is not an array (fallback logic if needed)
      console.warn('Bookmarks data is not an array. Defaulting to empty list.')
      events.value = eventData.map((e: Event) => ({
        ...e,
        bookmarked: false
      }))
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
})

async function deleteEvent(id: string) {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await fetch(`http://localhost:3000/api/events/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      events.value = events.value.filter(event => event.id !== id)
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }
}
function canBookmark(user: User | null) {
  return user && user.role !== 'guest';
}

async function toggleBookmark(event: Event) {
  if (!canBookmark(auth.user)) {
    alert("You must be logged in with a full account to like events!");
    return;
  }

  const isNowBookmarked = !event.bookmarked
  try {
    if (isNowBookmarked) {
      await fetch(`http://localhost:3000/api/bookmarks/${event.id}`, {
        method: 'POST',
        credentials: 'include'
      })
    } else {
      await fetch(`http://localhost:3000/api/bookmarks/${event.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    }

    event.bookmarked = isNowBookmarked
  } catch (error) {
    console.error('Failed to toggle bookmark:', error)
  }
}
</script>

<template>
  <main class="p-6">
    <Login v-if="!isLoggedIn" />
    <div v-else>
      <div class="flex flex-row justify-center gap-5">
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
        <!-- Bookmarked Filter Switch -->
        <div class="relative inline-flex items-center flex flex-col">
          <div class="w-14 h-7 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out cursor-pointer"
            :class="{ 'bg-green-200': showBookmarkedOnly }" @click="showBookmarkedOnly = !showBookmarkedOnly">
            <div class="bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out"
              :class="{ 'translate-x-7': showBookmarkedOnly }"></div>
          </div>
          <div class="mt-1 text-sm font-medium flex text-lg-center text-amber-50">
            {{ showBookmarkedOnly ? 'Ulubione' : 'Wszystkie' }}
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Content views -->
      <div v-else class="transition-opacity duration-300">
        <CalendarView v-if="calendarMode" :events="filteredEvents" @delete-event="deleteEvent"
          @toggle-bookmark="toggleBookmark" />
        <CardView v-else :events="filteredEvents" @delete-event="deleteEvent" @toggle-bookmark="toggleBookmark" />
      </div>
    </div>
  </main>
</template>
