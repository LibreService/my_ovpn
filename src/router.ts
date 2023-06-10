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

function findBaseURL (entryPath: string) {
  return entryPath.substring(0, entryPath.lastIndexOf('/'))
}

const router = createRouter({
  history: createWebHistory(findBaseURL(window.location.pathname)),
  routes
})

function jump (name: string) {
  router.push({ name })
}

export { router, jump }
