import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 여기에 추가
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

const app = createApp(App)
app.use(router)
app.mount('#app')
