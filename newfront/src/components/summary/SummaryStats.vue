<template>
  <div class="summary-box" v-if="dailyStats.length > 0">
    <h3>📊 자세 분석 요약</h3>

    <div class="charts">
      <NeckDonut :photos="photos" />
      <ShoulderDonut :photos="photos" />
    </div>

    <AnalysisComment
      :highAngleRatio="highAngleRatio"
      :shoulderAvg="overallShoulderAvg"
    />

    <SummaryCards
      :dailyStats="dailyStats"
      :overallAverage="overallAverage"
      :highAngleRatio="highAngleRatio"
      :shoulderAvg="overallShoulderAvg"
      :lastTaken="lastTaken"
    />
  </div>
</template>

<script>
import NeckDonut from './NeckDonut.vue';
import ShoulderDonut from './ShoulderDonut.vue';
import AnalysisComment from './AnalysisComment.vue';

import SummaryCards from './SummaryCards.vue';

export default {
  name: 'SummaryStats',
  components: {
    NeckDonut,
    ShoulderDonut,
    AnalysisComment,
    SummaryCards
  },
  props: ['photos'],
  computed: {
    dailyStats() {
      const grouped = {};
      this.photos.forEach(p => {
        const date = new Date(p.measured_at || p.uploaded_at).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(p.average_neck_angle || p.neck_angle);
      });
      return Object.entries(grouped).map(([date, angles]) => {
        const avg = angles.reduce((sum, a) => sum + a, 0) / angles.length;
        return { date, avg: avg.toFixed(1), count: angles.length };
      });
    },
    overallAverage() {
      const total = this.photos.reduce((sum, p) => sum + (p.average_neck_angle || p.neck_angle), 0);
      return total / this.photos.length;
    },
    overallShoulderAvg() {
      const diffs = this.photos.map(p => p.shoulder_diff).filter(Boolean);
      const total = diffs.reduce((sum, d) => sum + d, 0);
      return diffs.length ? total / diffs.length : 0;
    },
    highAngleRatio() {
      const high = this.photos.filter(p => (p.average_neck_angle || p.neck_angle) >= 135).length;
      return ((high / this.photos.length) * 100).toFixed(1);
    },
    lastTaken() {
      if (this.photos.length === 0) return '없음';
      const last = new Date(this.photos[this.photos.length - 1].measured_at || this.photos[this.photos.length - 1].uploaded_at);
      return `${last.getMonth() + 1}월 ${last.getDate()}일 ${last.getHours()}:${last.getMinutes().toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.summary-box {
  background: #fefefe;
  border: 1px solid #d1e7dd;
  padding: 24px;
  border-radius: 14px;
  margin-top: 20px;
}
.charts {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 20px;
  margin-bottom: 24px;
}
</style>