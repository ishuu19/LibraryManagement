import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Search from '../views/Search.vue'
import BookDetail from '../views/BookDetail.vue'
import BooksList from '../views/BooksList.vue'
import AddBook from '../views/AddBook.vue'
import EditBook from '../views/EditBook.vue'
import Login from '../views/Login.vue'
import UserManagement from '../views/UserManagement.vue'
import CreateUser from '../views/CreateUser.vue'
import EditUser from '../views/EditUser.vue'

const isAuthenticated = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  const token = localStorage.getItem('token');
  return !!token;
};

const isAdmin = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user.role === 'admin';
  } catch {
    return false;
  }
};

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { requiresGuest: true }},
  { path: '/', name: 'Home', component: Home },
  { path: '/books', name: 'BooksList', component: BooksList, props: true },
  { path: '/search', name: 'Search', component: Search },
  { path: '/book/detail/:id', name: 'BookDetail', component: BookDetail, props: true },
  { path: '/book/add', name: 'AddBook', component: AddBook, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/book/edit/:id', name: 'EditBook', component: EditBook, props: true, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/users', name: 'UserManagement', component: UserManagement, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/users/create', name: 'CreateUser', component: CreateUser, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/users/edit/:id', name: 'EditUser', component: EditUser, props: true, meta: { requiresAuth: true, requiresAdmin: true } }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated();
  const admin = isAdmin();

  if (to.meta.requiresAuth && !authenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    });
    return;
  }

  if (to.meta.requiresAdmin && !admin) {
    if (!authenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      });
    } else {
      next({ name: 'Home' });
    }
    return;
  }

  if (to.meta.requiresGuest && authenticated) {
    next({ name: 'Home' });
    return;
  }

  next();
});

export default router;
