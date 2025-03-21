import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref<string | null>(null)

  function login(username: string) {
    user.value = username
  }

  function logout() {
    user.value = null
  }

  return { user, login, logout }
})
