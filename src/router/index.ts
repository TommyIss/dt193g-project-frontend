import LoginView from "@/views/LoginView.vue";
import ProfileView from "@/views/ProfileView.vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile' , name: 'profile', component: ProfileView}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;