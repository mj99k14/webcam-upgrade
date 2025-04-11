<template>
    <div class="summary-cards">
      <div class="card">📸 총 촬영일 <strong>{{ dailyStats.length }}</strong>일</div>
      <div class="card">⚠️ 평균 목 각도 <strong>{{ overallAverage.toFixed(1) }}°</strong></div>
      <div class="card">⚠️ 거북목 비율 <strong>{{ highAngleRatio }}%</strong></div>
      <div class="card">↔️ 평균 어깨 기울기 <strong>{{ shoulderAvg.toFixed(1) }}px</strong></div>
      <div class="card">🕒 최근 촬영일 <strong>{{ lastTaken }}</strong></div>
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
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
  }
  .card {
    background: #f8f9fa;
    border: 1px solid #ccc;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 15px;
    min-width: 160px;
    text-align: center;
  }
  </style>