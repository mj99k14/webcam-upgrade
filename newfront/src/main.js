import { createApp } from "vue"; //vue 앱생성 함수 불러오기
import App from "./App.vue";
import router from "./router"; // Vue Router 가져오기

const app = createApp(App);

app.use(router); // Vue 앱에 Router 추가

app.mount("#app");
