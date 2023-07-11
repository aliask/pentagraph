import { createRouter, createWebHistory } from 'vue-router'
import DecryptView from '../views/DecryptView.vue'
import EncryptView from '../views/EncryptView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/encrypt'
    },
    {
      path: '/encrypt',
      name: 'encrypt',
      component: EncryptView
    },
    {
      path: '/decrypt',
      name: 'decrypt',
      component: DecryptView
    }
  ]
})

export default router
