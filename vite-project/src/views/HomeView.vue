<script setup lang="ts">
import Login from '../components/UserLogin.vue'
import CalendarView from './CalendarView.vue' // lub odpowiednia ścieżka
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const auth = useAuthStore()

const isLoggedIn = computed(() => !!auth.user)
</script>

<template>
  <main>
    <!-- Jeśli nie zalogowany, pokaż login -->
    <Login v-if="!isLoggedIn" />

    <!-- Po zalogowaniu pokaż kalendarz -->
    <CalendarView v-else />
  </main>
</template>
