import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CalendarView from '../views/CalendarView.vue'
import AdminPanel from '../components/AdminPanel.vue'
import PasswordChange from '../components/PasswordChange.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView,
    },
    {
      path: '/AdminPanel',
      name: 'Adminpanel',
      component: AdminPanel,
    },
    {
      path: '/PasswordChange',
      name: 'PasswordChange',
      component: PasswordChange,
    }
  ],
})

export default router
