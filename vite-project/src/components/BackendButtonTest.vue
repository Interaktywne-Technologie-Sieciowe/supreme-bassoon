<script setup lang="ts">
import { ref } from 'vue';
import { getBackendURL } from "@/services/configService"

const message = ref('');
const timestamp = ref('')
const loading = ref(false);
const backendURL = getBackendURL();
const backendHost = ref('null');

const fetchMessage = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${backendURL}/api/message`, {
      method: 'GET',
      credentials: 'include', // Ensure cookies are sent if needed
    });
    const data = await response.json();
    message.value = data.message
    timestamp.value = data.timestamp
    backendHost.value = data.hostname
  } catch (error) {
    console.error('Error fetching data:', error);
    message.value = 'Failed to fetch message';
  }
  loading.value = false;
};
</script>

<template>
  <div>
    <h1>Vue + Express Example</h1>
    <h2>Backend URL:</h2>
    <p class="urlb"> {{ backendURL }}</p>
    <h2>Backend HOST:</h2>
    <p class="urlb"> {{ backendHost }}</p>
    <button @click="fetchMessage" :disabled="loading">
      {{ loading ? "Loading..." : "Fetch Message" }}
    </button>
    <p v-if="message">{{ message }} <br /> {{ timestamp }}</p>
  </div>
</template>

<style>
.urlb {
  font-size: 14px;
  color: #003a7c;
  background-color: chartreuse;
}

button {
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
