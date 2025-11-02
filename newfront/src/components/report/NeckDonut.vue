<template>
  <div class="donut-wrapper">
    <!--  도넛 + 중앙 텍스트 -->
    <div class="chart-container">
      <canvas ref="neckChart"></canvas>
      <div class="center-text">
        <p class="main-text">{{ centralText }}</p>
        <p class="sub-text">{{ normalRatio }}%</p>
      </div>
    </div>

    <!--  요약 카드 -->
    <div class="summary-card" v-if="photos.length > 0">
      <p class="card-title"> 목 자세 분석</p>
      <p>• 평균 목 각도: {{ averageNeckAngle }}°</p>
      <p>• 정상 비율: {{ normalRatio }}%</p>
      <p>• {{ analysisText }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps(['photos'])
const neckChart = ref(null)

//  각도 기준으로 분석
const validPhotos = computed(() =>
  props.photos.filter(p => (p.average_neck_angle ?? p.neck_angle) !== null)
)

const averageNeckAngle = computed(() => {
  const angles = validPhotos.value.map(p => p.average_neck_angle ?? p.neck_angle)
  if (angles.length === 0) return 0
  const avg = angles.reduce((a, b) => a + b, 0) / angles.length
  return avg.toFixed(1)
})

const normalCount = computed(() =>
  validPhotos.value.filter(p => (p.average_neck_angle ?? p.neck_angle) < 135).length
)

const normalRatio = computed(() =>
  validPhotos.value.length
    ? Math.round((normalCount.value / validPhotos.value.length) * 100)
    : 0
)

const centralText = computed(() => {
  if (validPhotos.value.length === 0) return '측정 없음'
  if (normalRatio.value >= 50) return '정상 자세'
  return '거북목 의심'
})

const analysisText = computed(() => {
  if (validPhotos.value.length === 0) return '측정된 데이터가 없습니다.'
  if (normalRatio.value >= 50) return '정상적인 목 자세가 유지되고 있습니다.'
  return '거북목 증상이 의심됩니다. 자세 교정이 필요합니다.'
})

//  도넛 차트 렌더링
onMounted(() => {
  const normal = normalCount.value
  const bad = validPhotos.value.length - normal

  const ctx = neckChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['거북목 의심', '정상 자세'],
      datasets: [{
        data: [bad, normal],
        backgroundColor: ['#ff7a7a', '#42a5f5']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '70%' // 중앙 공간 확보
    }
  })
})
</script>

<style scoped>
.donut-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 340px;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  text-align: center;
}

.main-text {
  font-size: 20px;
  font-weight: bold;
  color: #222;
}

.sub-text {
  font-size: 14px;
  color: #666;
}

.summary-card {
  margin-top: 20px;
  padding: 16px;
  background: #f8fbff;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  text-align: left;
}

.card-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 22px;
}
</style>
