<template>
  <div class="summary-box" v-if="dailyStats.length > 0">
    <h3>📊 자세 분석 요약</h3>

    <div class="charts">
      <!-- 도넛 차트 -->
      <div class="chart-box">
        <Doughnut :data="donutData" :options="donutOptions" />
        <p class="risk-level-text">📌 개선 필요도: <span :class="riskLevelClass">{{ riskLevel }}</span></p>
      </div>

      <!-- 날짜별 평균 목 각도 변화 -->
      <div class="chart-box">
        <Line :data="trendData" :options="trendOptions" />
        <p class="caption">📈 날짜별 평균 목 각도</p>
      </div>
    </div>

    <!-- 요약 -->
    <div class="summary-text">
      <p>총 촬영일 수: <strong>{{ dailyStats.length }}</strong>일</p>
      <p>평균 목 각도: <strong>{{ overallAverage.toFixed(1) }}</strong>°</p>
      <p>거북목 비율(135° 이상): <strong>{{ highAngleRatio }}%</strong></p>
      <p>🗓️ 최근 촬영일: {{ lastTaken }}</p>
    </div>

    <button class="calendar-btn" @click="goToCalendar">📅 자세 캘린더 보기</button>
  </div>
</template>

<script>
import { Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, ArcElement,
  CategoryScale, LinearScale, PointElement, LineElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement);

export default {
  name: 'SummaryStats',
  components: { Doughnut, Line },
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
      if (this.photos.length === 0) return 0;
      const total = this.photos.reduce((sum, p) => sum + (p.average_neck_angle || p.neck_angle), 0);
      return total / this.photos.length;
    },
    highAngleRatio() {
      const high = this.photos.filter(p => (p.average_neck_angle || p.neck_angle) >= 135).length;
      return ((high / this.photos.length) * 100).toFixed(1);
    },
    lastTaken() {
      if (this.photos.length === 0) return '없음';
      const last = new Date(this.photos[this.photos.length - 1].measured_at || this.photos[this.photos.length - 1].uploaded_at);
      return `${last.getMonth() + 1}월 ${last.getDate()}일 ${last.getHours()}:${last.getMinutes().toString().padStart(2, '0')}`;
    },
    riskLevel() {
      const rate = this.highAngleRatio;
      if (rate >= 50) return '🔴 높음';
      if (rate >= 20) return '🟡 중간';
      return '🟢 양호';
    },
    riskLevelClass() {
      const r = this.riskLevel;
      if (r.includes('🔴')) return 'high';
      if (r.includes('🟡')) return 'medium';
      return 'low';
    },
    donutData() {
      const total = this.photos.length;
      const bad = this.photos.filter(p => (p.average_neck_angle || p.neck_angle) >= 135).length;
      const good = total - bad;
      return {
        labels: ['거북목 의심', '정상 자세'],
        datasets: [{
          data: [bad, good],
          backgroundColor: ['#ff6b6b', '#1e90ff'],
        }]
      };
    },
    donutOptions() {
      return {
        cutout: '65%',
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      };
    },
    trendData() {
      const labels = this.dailyStats.map(d => d.date);
      const values = this.dailyStats.map(d => d.avg);
      return {
        labels,
        datasets: [{
          label: '평균 목 각도',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: '#bfdbfe',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
        }]
      };
    },
    trendOptions() {
      return {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: 90,
            suggestedMax: 160
          }
        }
      };
    }
  },
  methods: {
    goToCalendar() {
      this.$router.push('/calendar');
    }
  }
};
</script>

<style scoped>
.summary-box {
  background: #f0fff0;
  border: 1px solid #b2e2b2;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}

.charts {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  margin-bottom: 20px;
}

.chart-box {
  flex: 1;
  min-width: 300px;
  max-width: 450px;
  height: 300px;
  position: relative;
}

.summary-text {
  text-align: center;
  font-size: 15px;
  color: #333;
  line-height: 1.7;
}

.caption {
  text-align: center;
  font-size: 13px;
  margin-top: 10px;
  color: #666;
}

.risk-level-text {
  text-align: center;
  margin-top: 10px;
  font-size: 16px;
}

.risk-level-text .high {
  color: red;
}
.risk-level-text .medium {
  color: orange;
}
.risk-level-text .low {
  color: green;
}

.calendar-btn {
  margin-top: 20px;
  background: #1976d2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.calendar-btn:hover {
  background: #1565c0;
}
</style>