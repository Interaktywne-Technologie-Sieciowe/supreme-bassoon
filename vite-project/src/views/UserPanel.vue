<script setup lang="ts">
import type { User } from '@/types/user'
import { getBackendURL } from '@/services/configService'
import UserPanel from '../components/UserPanel.vue';
</script>

<template>
    <main>
        <UserPanel />
    </main>
</template>
