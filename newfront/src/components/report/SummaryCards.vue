<template>
  <div class="summary-cards">
    <div class="card">
      📸 총 촬영일<br /><strong>{{ dailyStats.length }}</strong>일
    </div>

    <div class="card orange">
      ⚠️ 평균 목 각도<br /><strong>{{ Number(overallAverage).toFixed(1) }}°</strong>
    </div>

    <div class="card orange">
      ⚠️ 거북목 비율<br /><strong>{{ highAngleRatio }}%</strong>
    </div>

    <div class="card blue">
      ↔️ 평균 어꺠 기울기<br /><strong>{{ Number(shoulderAvg).toFixed(1) }}px</strong>
    </div>

    <div class="card gray">
      🕒 최근 촬영일<br /><strong>{{ lastTaken }}</strong>
    </div>

    <div class="card green">
      📀 최대 목 각도<br /><strong>{{ Number(maxNeckAngle).toFixed(1) }}°</strong>
    </div>

    <div class="card purple">
      🧭 어깨 비대칭<br />
      <template v-if="shoulderRatio.left + shoulderRatio.right > 0">
        <strong>좌: {{ shoulderRatio.left }}%</strong> / <strong>우: {{ shoulderRatio.right }}%</strong>
      </template>
      <template v-else>
        <strong>기울기 없음</strong>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SummaryCards',
  props: [
    'dailyStats',
    'overallAverage',
    'highAngleRatio',
    'shoulderAvg',
    'lastTaken',
    'maxNeckAngle',
    'shoulderRatio'
  ]
};
</script>

<style scoped>
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  margin-top: 24px;
  padding: 0 20px;
}

.card {
  flex: 1;
  min-width: 220px;
  background: #f8f9fa;
  border: 1px solid #ccc;
  padding: 18px 24px;
  border-radius: 12px;
  font-size: 17px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: scale(1.02);
}

.card.orange {
  background-color: #fff8e1;
  border-color: #ffcc80;
}

.card.blue {
  background-color: #e3f2fd;
  border-color: #90caf9;
}

.card.gray {
  background-color: #f5f5f5;
  border-color: #cfd8dc;
}

.card.green {
  background-color: #e8f5e9;
  border-color: #81c784;
}

.card.purple {
  background-color: #f3e5f5;
  border-color: #ce93d8;
}

strong {
  font-size: 20px;
  color: #1976d2;
}
</style>
