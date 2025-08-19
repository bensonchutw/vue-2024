import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../views/CalendarView.vue'
import DiscussionView from '../views/DiscussionView.vue'
import MapView from '../views/MapView.vue'

const routes = [
  {
    path: '/',
    redirect: '/calendar'
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarView
  },
  {
    path: '/discussion',
    name: 'Discussion',
    component: DiscussionView
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router