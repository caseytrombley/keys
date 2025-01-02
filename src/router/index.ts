import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: "/chords/:key", // New route for viewing chords by key
      name: "ChordKey",
      component: () => import("../views/ChordKeyView.vue"), // Lazy-loaded
      props: true,
    },
    {
      path: "/chords/piano/:key/:id",
      name: "ChordDetail",
      component: () => import("../views/ChordDetailView.vue"),
      props: true,
    }
  ],
  scrollBehavior() {
    // Always scroll to the top when navigating
    return { top: 0 };
  }
})

export default router
