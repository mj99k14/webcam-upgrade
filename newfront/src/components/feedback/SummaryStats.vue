<template>
  <div class="white-card" v-if="dailyStats.length > 0">
    <div class="section-title-wrapper">
      <h2 class="section-title"><span class="emoji">📊</span> 자세 분석 요약</h2>
    </div>

    <div class="charts-row">
      <div class="chart-box">
        <NeckDonut :photos="photos" />
        <div class="analysis-text">
          <p>🐢 목 자세 분석: {{ dynamicNeckAnalysis }}</p>
        </div>
      </div>

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
import NeckDonut from './NeckDonut.vue'
import ShoulderDonut from './ShoulderDonut.vue'
import AnalysisComment from './AnalysisComment.vue'
import SummaryCards from './SummaryCards.vue'

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
      const grouped = {}
      this.photos.forEach(p => {
        const date = new Date(p.measured_at || p.uploaded_at).toISOString().split('T')[0]
        const angle = p.average_neck_angle ?? p.neck_angle
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(angle)
      })
      return Object.entries(grouped).map(([date, angles]) => {
        const avg = angles.reduce((sum, a) => sum + a, 0) / angles.length
        return { date, avg: avg.toFixed(1), count: angles.length }
      })
    },
    overallAverage() {
      const total = this.photos.reduce((sum, p) => sum + (p.average_neck_angle ?? p.neck_angle), 0)
      return this.photos.length ? total / this.photos.length : 0
    },
    shoulderAvg() {
      const diffs = this.photos.map(p => p.shoulder_diff).filter(d => d !== undefined)
      const total = diffs.reduce((sum, d) => sum + d, 0)
      return diffs.length ? total / diffs.length : 0
    },
    highAngleRatio() {
      const highCount = this.photos.filter(p => (p.average_neck_angle ?? p.neck_angle) >= 135).length
      return this.photos.length ? ((highCount / this.photos.length) * 100).toFixed(1) : 0
    },
    lastTaken() {
      if (!this.photos.length) return '없음'
      const last = new Date(this.photos[this.photos.length - 1].measured_at || this.photos[this.photos.length - 1].uploaded_at)
      const month = last.getMonth() + 1
      const day = last.getDate()
      const hour = last.getHours()
      const minute = String(last.getMinutes()).padStart(2, '0')
      return `${month}월 ${day}일 ${hour}:${minute}`
    },
    dynamicNeckAnalysis() {
      return this.highAngleRatio >= 50
        ? `${this.highAngleRatio}% 거북목 의심`
        : `${this.highAngleRatio}% 정상`
    },
    dynamicShoulderAnalysis() {
      return this.shoulderAvg > 30
        ? '어깨 기울기 심각'
        : '어깨 기울기 정상'
    }
  }
}
</script>
<style>
.white-card {
  background-color: #ffffff;
  padding: 48px 80px;
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 1600px; /* ✅ 최대 너비 확장 */
  margin: 0 auto 32px;
  box-sizing: border-box;
}

.section-title-wrapper {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 26px;
  font-weight: 800;
  color: #1976d2;
  padding-left: 4px;
  border-bottom: 3px solid #42a5f5;
}

.section-title .emoji {
  font-size: 24px;
  margin-bottom: 2px;
}

.charts-row {
  display: flex;
  justify-content: space-evenly; /* ✅ 균등하게 배치 */
  flex-wrap: wrap;
  gap: 48px;
  margin-bottom: 32px;
}

.chart-box {
  flex: 1;
  min-width: 520px;     /* ✅ 더 넓게 */
  max-width: 720px;     /* ✅ 더 크게 */
  background: #f8fbff;
  padding: 32px 40px;   /* ✅ 더 넉넉한 padding */
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.chart-box:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.analysis-text {
  margin-top: 20px;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

</style>
