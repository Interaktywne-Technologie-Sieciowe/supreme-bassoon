<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const login = () => {
  if (username.value === 'admin' && password.value === 'password') {
    userStore.login(username.value)
    router.push('/')
  } else {
    errorMessage.value = 'Nieprawidłowy login lub hasło!'
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Logowanie</h2>
    <form @submit.prevent="login">
      <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
      <input v-model="password" type="password" placeholder="Hasło" required />
      <button type="submit">Zaloguj</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}
input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
