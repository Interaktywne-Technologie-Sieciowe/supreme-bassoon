<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <router-link to="/" class="nav-link">🏠 Strona Główna</router-link>
      <router-link to="/login" v-if="!userStore.user" class="nav-link">🔑 Zaloguj</router-link>
      <button @click="logout" v-if="userStore.user" class="logout-btn">
        🚪 Wyloguj ({{ userStore.user }})
      </button>
    </nav>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
}

.navbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  background: #42b883;
  color: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 18px;
  margin: 0 10px;
}

.nav-link:hover {
  text-decoration: underline;
}

.logout-btn {
  background: red;
  color: white;
  border: none;
  padding: 8px 12px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}

.logout-btn:hover {
  background: darkred;
}

.content {
  width: 90%;
  max-width: 800px;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
