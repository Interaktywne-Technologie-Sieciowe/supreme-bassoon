<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
    <div
      class="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-6 text-white">
      <h2 class="text-3xl font-bold text-center">Zmień hasło dla</h2>
            <h2 class="text-3xl font-bold text-center">EMAIL USERA ?</h2>

      <form @submit.prevent="" class="space-y-6">
      
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium">Nowe hasło</label>
          <input id="password" type="password" v-model="password" required
            class="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="hasło" />
        </div>

     
        <button type="submit"
        class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition">
          Zatwierdź zmiane hasła
      </button>

      </form>

    </div>
  </div>
</template>

