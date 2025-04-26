import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AdminPanel from "../components/AdminPanel.vue";
import PasswordChange from "../components/PasswordChange.vue";
import PasswordForgot from "../components/PasswordForgot.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/AdminPanel",
      name: "Adminpanel",
      component: AdminPanel,
    },
    {
      path: "/PasswordChange",
      name: "PasswordChange",
      component: PasswordChange,
    },
    {
      path: "/PasswordForgot",
      name: "PasswordForgot",
      component: PasswordForgot,
    },
  ],
});

export default router;
