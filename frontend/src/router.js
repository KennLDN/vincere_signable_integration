import { createRouter, createWebHistory } from 'vue-router';
import References from './components/References.vue';
import Compliance from './components/Compliance.vue';
import Monitor from './components/Monitor.vue';

const routes = [
  { path: '/admin', redirect: '/admin/references' },
  { path: '/', redirect: '/admin/references' },
  { path: '/admin/references', component: References },
  { path: '/admin/compliance', component: Compliance },
  { path: '/admin/monitor', component: Monitor }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
