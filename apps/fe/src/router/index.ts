import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'board',
      component: () => import('@/views/board/BoardPage.vue'),
      meta: { title: 'Boards', nav: true, breadcrumbSelf: true },
    },
    {
      path: '/board/:boardId',
      name: 'board-detail',
      component: () => import('@/views/board/BoardDetailPage.vue'),
      meta: {
        title: 'Board',
        breadcrumbParent: 'board',
        breadcrumbDynamic: true,
        breadcrumbSelf: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'board' },
    },
  ],
})

export default router
