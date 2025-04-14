<template>
  <div class="donut-wrapper">
    <!-- ✅ 도넛 그래프 + 중앙 텍스트 -->
    <div class="chart-container">
      <canvas ref="shoulderChart"></canvas>
      <div class="center-text">
        <p class="main-text">{{ directionLabel }}</p>
        <p class="sub-text" v-if="showAngle">{{ angleText }}</p>
      </div>
    </div>

    <!-- ✅ 분석 요약 카드 -->
    <div class="summary-card" v-if="photos.length > 0">
      <p class="card-title">📋 어깨 분석 결과</p>
      <p>• 평균 어깨 기울기: {{ avgDiff }}°</p>
      <p>• 수평 비율: {{ balancedRatio }}%</p>
      <p>• {{ analysisText }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps(['photos'])
const shoulderChart = ref(null)

// ✅ 데이터 정제
const diffs = computed(() =>
  props.photos
    .filter(p => p.shoulder_diff !== null && !isNaN(p.shoulder_diff))
    .map(p => Math.abs(p.shoulder_diff))
)

const avgDiff = computed(() =>
  diffs.value.length
    ? (diffs.value.reduce((a, b) => a + b, 0) / diffs.value.length).toFixed(1)
    : 0
)

const highRight = computed(() =>
  props.photos.filter(p => p.shoulder_status === 'right_high').length
)

const highLeft = computed(() =>
  props.photos.filter(p => p.shoulder_status === 'left_high').length
)

const balanced = computed(() =>
  props.photos.filter(p => p.shoulder_status === '어깨 수평').length
)

const balancedRatio = computed(() =>
  props.photos.length
    ? Math.round((balanced.value / props.photos.length) * 100)
    : 0
)


// ✅ 도넛 중앙 텍스트 - 세분화
const directionLabel = computed(() => {
  if (balancedRatio.value >= 50) return '수평 (정상)'
  if (highRight.value > highLeft.value) return '오른쪽 어깨↑'
  if (highLeft.value > highRight.value) return '왼쪽 어깨↑'
  return '기울기 있음 (양쪽 비슷)'
})

const angleText = computed(() => `${avgDiff.value}°`)
const showAngle = computed(() => balancedRatio.value < 50)


// ✅ 분석 텍스트 - 세분화
const analysisText = computed(() => {
  if (props.photos.length === 0) return '측정된 데이터가 없습니다.'
  if (balancedRatio.value >= 50) return '어깨 기울기 정상'
  if (highRight.value > highLeft.value) return `오른쪽 어깨가 평균 ${avgDiff.value}° 더 높습니다`
  if (highLeft.value > highRight.value) return `왼쪽 어깨가 평균 ${avgDiff.value}° 더 높습니다`
  return '어깨 기울기는 있지만 좌우 차이가 크지 않습니다'
})


// ✅ 도넛 그래프 생성
onMounted(() => {
  const ctx = shoulderChart.value.getContext('2d')
  const unbalanced = props.photos.length - balanced.value

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['어깨 불균형', '어깨 수평'],
      datasets: [{
        data: [unbalanced, balanced.value],
        backgroundColor: ['#ffa726', '#42a5f5']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed}장`
          }
        }
      },
      cutout: '70%' // 중앙 공간 확보
    }
  })
})
</script>

<style scoped>
.donut-wrapper {
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
