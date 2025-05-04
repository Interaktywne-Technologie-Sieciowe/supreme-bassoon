<script setup lang="ts">
import Login from '../components/UserLogin.vue'
import CalendarView from '../components/EventCalendar.vue'
import CardView from './EventCardView.vue'
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted, watch } from 'vue'
import type { Event } from '@/types/event'
import type { User } from '@/types/user'
import { getBackendURL } from '@/services/configService'

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
const bookmarksLoaded = ref(false)

// Fetch all events without bookmarks initially
const fetchEvents = async () => {
  try {
    const eventsRes = await fetch(`${getBackendURL("http://localhost:3000")}/api/events`)
    const eventData = await eventsRes.json()

    // Initialize events without bookmark data first
    events.value = eventData.map((e: Event) => ({
      ...e,
      bookmarked: false
    }))

    return eventData
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

// Fetch bookmarks separately and update events
const fetchBookmarks = async () => {
  if (!isLoggedIn.value) {
    bookmarksLoaded.value = true
    return
  }

  try {
    const bookmarksRes = await fetch(`${getBackendURL("http://localhost:3000")}/api/bookmarks`, {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!bookmarksRes.ok) {
      throw new Error(`Bookmarks fetch failed with status: ${bookmarksRes.status}`)
    }

    const bookmarksData = await bookmarksRes.json()

    if (Array.isArray(bookmarksData)) {
      const bookmarkedIds = new Set(bookmarksData.map((b: any) => b.id))

      // Update existing events with bookmark information
      events.value = events.value.map((e: Event) => ({
        ...e,
        bookmarked: bookmarkedIds.has(e.id)
      }))

      bookmarksLoaded.value = true
    } else {
      console.warn('Bookmarks data is not an array:', bookmarksData)
      bookmarksLoaded.value = true
    }
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    bookmarksLoaded.value = true
  }
}

onMounted(async () => {
  loading.value = true
  await fetchEvents()
  await fetchBookmarks()
  loading.value = false
})

// Watch for auth changes and refetch bookmarks when user logs in
watch(() => auth.user, async (newUser) => {
  if (newUser) {
    loading.value = true
    await fetchBookmarks()
    loading.value = false
  } else {
    events.value = events.value.map(e => ({ ...e, bookmarked: false }))
    bookmarksLoaded.value = false
  }
}, { immediate: true })

async function deleteEvent(id: string) {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await fetch(`${getBackendURL("http://localhost:3000")}/api/events/${id}`, {
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
      await fetch(`${getBackendURL("http://localhost:3000")}/api/bookmarks/${event.id}`, {
        method: 'POST',
        credentials: 'include'
      })
    } else {
      await fetch(`${getBackendURL("http://localhost:3000")}/api/bookmarks/${event.id}`, {
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
