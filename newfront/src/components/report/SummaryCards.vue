<template>
  <div class="summary-cards">
    <div class="card">
      📸 총 촬영일<br /><strong>{{ dailyStats.length }}</strong>일
    </div>
    <div class="card orange">
      ⚠️ 평균 목 각도<br /><strong>{{ overallAverage.toFixed(1) }}°</strong>
    </div>
    <div class="card orange">
      ⚠️ 거북목 비율<br /><strong>{{ highAngleRatio }}%</strong>
    </div>
    <div class="card blue">
      ↔️ 평균 어깨 기울기<br /><strong>{{ shoulderAvg.toFixed(1) }}px</strong>
    </div>
    <div class="card gray">
      🕒 최근 촬영일<br /><strong>{{ lastTaken }}</strong>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SummaryCards',
  props: ['dailyStats', 'overallAverage', 'highAngleRatio', 'shoulderAvg', 'lastTaken']
};
</script>

<style scoped>
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;   /* ✅ 양쪽 정렬로 넓게 */
  gap: 20px;
  margin-top: 24px;
  padding: 0 20px;                  /* ✅ 좌우 여백 추가 */
}

.card {
  flex: 1;
  min-width: 220px;                 /* ✅ 더 넓게 */
  background: #f8f9fa;
  border: 1px solid #ccc;
  padding: 18px 24px;               /* ✅ 여백 넉넉히 */
  border-radius: 12px;
  font-size: 17px;                  /* ✅ 텍스트도 조금 키움 */
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); /* ✅ 입체감 */
  transition: transform 0.2s ease;
}

.card:hover {
  transform: scale(1.02);          /* ✅ 살짝 확대 효과 */
}

/* 상태별 색상 강조 (선택적) */
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

strong {
  font-size: 20px;
  color: #1976d2;
}
</style>
