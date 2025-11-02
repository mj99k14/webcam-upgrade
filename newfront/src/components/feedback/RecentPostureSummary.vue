<template>
  <div class="recent-summary-wrapper" v-if="hasData">
    <h3>📈 최근 자세 변화</h3>

    <div class="summary-cards">
      <div class="summary-card good">
        <p class="label"> 가장 좋은 날</p>
        <p class="value">{{ bestDay.date }}</p>
        <p>{{ bestDay.neckAngle }}°, {{ bestDay.shoulderStatus }}</p>
      </div>
      <div class="summary-card bad">
        <p class="label"> 가장 나쁜 날</p>
        <p class="value">{{ worstDay.date }}</p>
        <p>{{ worstDay.neckAngle }}°, {{ worstDay.shoulderStatus }}</p>
      </div>
    </div>

    <div class="text-feedback">
      <p v-if="worstDay.neckAngle > 140">
         최근 목 각도가 조금 높아졌어요. 거북목 주의!
      </p>
      <p v-else> 최근에는 목 자세가 안정적인 편이에요.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecentPostureSummary',
  props: {
    recentPostures: {
      type: Array,
      required: true,
    },
  },
  computed: {
    hasData() {
      return Array.isArray(this.recentPostures) && this.recentPostures.length > 0;
    },
    bestDay() {
      if (!this.hasData) return {};
      return this.recentPostures.reduce((a, b) => (a.neckAngle < b.neckAngle ? a : b));
    },
    worstDay() {
      if (!this.hasData) return {};
      return this.recentPostures.reduce((a, b) => (a.neckAngle > b.neckAngle ? a : b));
    },
  },
};
</script>

<style scoped>
.recent-summary-wrapper {
  margin-top: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  max-width: 700px;
}

.summary-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  flex: 1;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-weight: 500;
}

.summary-card.good {
  background-color: #e8f5e9;
  border-left: 6px solid #4caf50;
}
.summary-card.bad {
  background-color: #ffebee;
  border-left: 6px solid #f44336;
}

.label {
  font-size: 15px;
  color: #555;
}
.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 4px;
  margin-bottom: 4px;
}

.text-feedback {
  font-size: 15px;
  color: #333;
}
</style>
