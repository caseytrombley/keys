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
      path: "/chords/:key",
      name: "ChordKey",
      component: () => import("../views/ChordKeyView.vue"),
      props: true,
    },
    {
      path: "/chords/piano/:key/:id",
      name: "ChordDetail",
      component: () => import("../views/ChordDetailView.vue"),
      props: true,
    },
    {
      path: "/chord-player",
      name: "ChordPlayer",
      component: () => import("../views/ChordPlayerView.vue"),
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // If navigating between chord detail pages, don't scroll to top
    // The component will handle scrolling to the chord header
    if (from.name === 'ChordDetail' && to.name === 'ChordDetail') {
      return false; // Don't scroll
    }
    // Otherwise, scroll to top for new pages
    return { top: 0 };
  }
})

export default router
