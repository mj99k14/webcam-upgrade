import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";//로그인 
import MyProfile from "@/views/MyProfile.vue";//마이페이지
import AuthCallback from "@/views/AuthCallback.vue"; // 구글 로그인 후 처리

const routes = [
    { path: "/", redirect: "/login" },  //  기본 경로를 로그인 페이지로 변경
    { path: "/login", component: Login },
    { path: "/myprofile", component: MyProfile },
    { path: "/auth/callback", component: AuthCallback },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
