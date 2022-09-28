import { createRouter, createWebHistory } from 'vue-router'
import MainView from './views/MainView.vue'
import CaView from './views/CaView.vue'
import ServerView from './views/ServerView.vue'
import ClientView from './views/ClientView.vue'

const routes = [
  { path: '/', name: 'Main', component: MainView },
  { path: '/ca', name: 'CA', component: CaView },
  { path: '/server', name: 'Server', component: ServerView },
  { path: '/client', name: 'Client', component: ClientView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function jump (name: string) {
  router.push({ name })
}

export { router, jump }
