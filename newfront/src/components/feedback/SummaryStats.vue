<template>
  <div class="summary-wrapper" v-if="dailyStats.length > 0">
    <h3>📊 자세 분석 요약</h3>

    <div class="charts-row">
      <!-- 🦒 목 분석 도넛 차트 -->
      <div class="chart-box">
        <NeckDonut :photos="photos" />
        <div class="analysis-text">
          <p>🐢 목 자세 분석: {{ dynamicNeckAnalysis }}</p>
        </div>
      </div>

      <!-- 🤷 어깨 분석 도넛 차트 -->
      <div class="chart-box">
        <ShoulderDonut :photos="photos" />
        <div class="analysis-text">
          <p>🤷 어깨 분석: {{ dynamicShoulderAnalysis }}</p>
        </div>
      </div>
    </div>

    <AnalysisComment
      :highAngleRatio="highAngleRatio"
      :shoulderAvg="shoulderAvg"
    />

    <SummaryCards
      :dailyStats="dailyStats"
      :overallAverage="overallAverage"
      :highAngleRatio="highAngleRatio"
      :shoulderAvg="shoulderAvg"
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
        const angle = p.average_neck_angle ?? p.neck_angle;
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(angle);
      });

      return Object.entries(grouped).map(([date, angles]) => {
        const avg = angles.reduce((sum, a) => sum + a, 0) / angles.length;
        return { date, avg: avg.toFixed(1), count: angles.length };
      });
    },

    overallAverage() {
      const total = this.photos.reduce((sum, p) => sum + (p.average_neck_angle ?? p.neck_angle), 0);
      return this.photos.length ? total / this.photos.length : 0;
    },

    shoulderAvg() {
      const diffs = this.photos.map(p => p.shoulder_diff).filter(d => d !== undefined);
      const total = diffs.reduce((sum, d) => sum + d, 0);
      return diffs.length ? total / diffs.length : 0;
    },

    highAngleRatio() {
      const highCount = this.photos.filter(p => (p.average_neck_angle ?? p.neck_angle) >= 135).length;
      return this.photos.length ? ((highCount / this.photos.length) * 100).toFixed(1) : 0;
    },

    lastTaken() {
      if (!this.photos.length) return '없음';
      const last = new Date(this.photos[this.photos.length - 1].measured_at || this.photos[this.photos.length - 1].uploaded_at);
      const month = last.getMonth() + 1;
      const day = last.getDate();
      const hour = last.getHours();
      const minute = String(last.getMinutes()).padStart(2, '0');
      return `${month}월 ${day}일 ${hour}:${minute}`;
    },

    dynamicNeckAnalysis() {
      return this.highAngleRatio >= 50
        ? `${this.highAngleRatio}% 거북목 의심`
        : `${this.highAngleRatio}% 정상`;
    },

    dynamicShoulderAnalysis() {
      return this.shoulderAvg > 30
        ? '어깨 기울기 심각'
        : '어깨 기울기 정상';
    }
  }
};
</script>

<style scoped>
:root {
  --main-bg: #eaf4ff;
  --main-border: #cce0f5;
  --chart-bg: #f8fbff;
  --text-color: #333;
}

.summary-wrapper {
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: none;
  max-width: none !important;
}



.charts-row {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 32px;
}

.chart-box {
  flex: 1;
  min-width: 280px;
  max-width: 360px;
  background: var(--chart-bg);
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.chart-box:hover {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1);
}

.analysis-text {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
}
</style>
