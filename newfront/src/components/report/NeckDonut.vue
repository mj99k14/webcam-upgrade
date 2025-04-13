<template>
  <div class="donut-wrapper">
    <canvas ref="neckChart"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const props = defineProps(['photos']);
const neckChart = ref(null);

onMounted(() => {
  const normalCount = props.photos.filter(p => (p.average_neck_angle ?? p.neck_angle) < 135).length;
  const badCount = props.photos.length - normalCount;

  const ctx = neckChart.value.getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['거북목 의심', '정상 자세'],
      datasets: [{
        data: [badCount, normalCount],
        backgroundColor: ['#ff7a7a', '#42a5f5']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // ❗ 이거 꼭 넣어야 크기 커짐
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
});
</script>

<style scoped>
.donut-wrapper {
  width: 100%;
  max-width: 600px;       /* ✅ 원하는 만큼 넓히기 */
  height: 340px;          /* ✅ 높이 설정 필수 */
  margin: 0 auto;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
