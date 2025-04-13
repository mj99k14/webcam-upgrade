<template>
  <div class="donut-wrapper">
    <canvas ref="shoulderChart"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps(['photos'])
const shoulderChart = ref(null)

onMounted(() => {
  const balanced = props.photos.filter(p => p.shoulder_status === '어깨 수평').length
  const unbalanced = props.photos.length - balanced

  const ctx = shoulderChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['어깨 불균형', '어깨 수평'],
      datasets: [{
        data: [unbalanced, balanced],
        backgroundColor: ['#ffa726', '#42a5f5']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // ✅ 크기 확대 필수
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
})
</script>

<style scoped>
.donut-wrapper {
  width: 100%;
  max-width: 600px;     /* ✅ 너비 확장 */
  height: 340px;        /* ✅ 높이 확장 */
  margin: 0 auto;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
