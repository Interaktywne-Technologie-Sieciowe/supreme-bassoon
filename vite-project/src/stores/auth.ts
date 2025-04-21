// stores/auth.ts
import { defineStore } from "pinia";

type User = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  created_at: string;
  last_login: string;
  role: string;
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    logout() {
      this.user = null;
      // Clear the token cookie when logging out
      document.cookie = "token=; Max-Age=0; path=/";
    },
    async initAuth() {
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          this.user = data.user;
        } else {
          this.user = null;
        }
      } catch (e) {
        console.error("Session check failed", e);
        this.user = null;
      }
    },
  },
});
