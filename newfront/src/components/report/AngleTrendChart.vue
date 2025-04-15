<!-- AngleTrendChart.vue -->
<template>
  <canvas ref="canvasRef" class="chart-canvas"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, Title, CategoryScale, Tooltip, Legend
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend)

const props = defineProps(['data'])
const canvasRef = ref(null)
let chartInstance = null

function renderChart(data) {
  if (!canvasRef.value || !data || !data.times?.length || !data.neckAngles?.length) {
    console.warn('⛔️ 차트 데이터 부족', data)
    return
  }

  const ctx = canvasRef.value.getContext('2d')
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.times,
      datasets: [{
        label: '📈 목 각도 변화',
        data: data.neckAngles,
        borderWidth: 2,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        pointRadius: 4,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '시간별 목각도 추이'
        },
        tooltip: { enabled: true },
        legend: { display: false }
      },
      scales: {
        x: { title: { display: true, text: '시간' }},
        y: {
          title: { display: true, text: '목각도 (°)' },
          min: 0, max: 180
        }
      }
    }
  })
}

watch(() => props.data, (val) => renderChart(val))
onMounted(() => renderChart(props.data))
</script>

<style scoped>
.chart-canvas {
  width: 100%;
  height: 300px;
}
</style>
