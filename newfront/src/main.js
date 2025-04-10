import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Chart.js 전체 요소 등록
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
} from 'chart.js'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement
)

const app = createApp(App)
app.use(router)
app.mount('#app')
