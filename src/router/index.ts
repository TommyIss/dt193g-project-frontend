import LoginView from "@/views/LoginView.vue";
import ProfileView from "@/views/ProfileView.vue";
import StockView from "@/views/StockView.vue";
import ProductDetailsView from "@/views/ProductDetailsView.vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import UsersView from "@/views/UsersView.vue";

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile' , name: 'profile', component: ProfileView },
    { path: '/stock', name: 'stock', component: StockView },
    { path: '/product/:id', name: 'product-details', component: ProductDetailsView },
    { path: '/users', name: 'users', component: UsersView }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;