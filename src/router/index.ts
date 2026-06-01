import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import ComboSelectView from '@/views/ComboSelectView.vue';
import TrainingView from '@/views/TrainingView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/fighters/:character', name: 'combos', component: ComboSelectView, props: true },
    { path: '/train/:comboId', name: 'training', component: TrainingView, props: true },
  ],
});

export default router;
