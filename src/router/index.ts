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
  scrollBehavior() {
    return { top: 0 };
  }
})

export default router
