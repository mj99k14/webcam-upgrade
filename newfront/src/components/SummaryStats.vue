<template>
    <div class="summary-box" v-if="photos.length > 0">
      <h3>📊 전체 분석 리포트</h3>
      <div class="summary-graph-container">
        <!-- 도넛 그래프 -->
        <div class="donut-chart-box">
          <Doughnut :data="donutData" :options="donutOptions" />
        </div>
  
        <!-- 개선 추세 그래프 -->
        <div class="line-chart-box">
          <Line :data="lineData" :options="lineOptions" />
        </div>
      </div>
  
      <!-- 텍스트 요약 -->
      <div class="summary-text">
        <p>총 촬영 횟수: {{ total }}회</p>
        <p>거북목 의심 횟수: {{ neckWarnings }} ({{ neckRate }}%)</p>
        <p>어깨 기울기 이상 횟수: {{ shoulderWarnings }} ({{ shoulderRate }}%)</p>
        <p>최근 촬영: {{ lastTaken }}</p>
        <p>개선 필요도: {{ riskLevel }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { Doughnut, Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement)
  
  export default {
    name: 'SummaryStats',
    components: { Doughnut, Line },
    props: ['photos'],
    computed: {
      total() {
        return this.photos.length;
      },
      neckWarnings() {
        return this.photos.filter(p => p.neck_angle > 45).length;
      },
      shoulderWarnings() {
        return this.photos.filter(p => Math.abs(p.shoulder_angle) > 10).length;
      },
      neckRate() {
        return ((this.neckWarnings / this.total) * 100).toFixed(1);
      },
      shoulderRate() {
        return ((this.shoulderWarnings / this.total) * 100).toFixed(1);
      },
      lastTaken() {
        if (this.total === 0) return '없음';
        const last = new Date(this.photos[this.photos.length - 1].uploaded_at);
        const month = last.getMonth() + 1;
        const day = last.getDate();
        const hour = last.getHours().toString().padStart(2, '0');
        const minute = last.getMinutes().toString().padStart(2, '0');
        return `${month}월 ${day}일 ${hour}:${minute}`;
      },
      riskLevel() {
        const nw = this.neckWarnings / this.total;
        const sw = this.shoulderWarnings / this.total;
        if (nw >= 0.5 || sw >= 0.5) return '🔴 높음';
        else if (nw >= 0.2 || sw >= 0.2) return '🟡 중간';
        else return '🟢 양호';
      },
      donutData() {
        const normal = this.total - this.neckWarnings;
        return {
          labels: ['거북목 의심', '정상 자세'],
          datasets: [
            {
              data: [this.neckWarnings, normal],
              backgroundColor: ['#ff6384', '#36a2eb'],
            },
          ],
        };
      },
      donutOptions() {
        return {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
        };
      },
      lineData() {
        const grouped = {};
  
        this.photos.forEach(photo => {
          const date = new Date(photo.uploaded_at).toISOString().split('T')[0];
          const isBad = photo.neck_angle > 45 || Math.abs(photo.shoulder_angle) > 10;
          if (!grouped[date]) grouped[date] = 0;
          if (isBad) grouped[date]++;
        });
  
        const sortedDates = Object.keys(grouped).sort();
        return {
          labels: sortedDates,
          datasets: [
            {
              label: '비정상 자세 횟수',
              data: sortedDates.map(d => grouped[d]),
              borderColor: '#ff6384',
              backgroundColor: '#ffb6c1',
              tension: 0.3,
              fill: true
            }
          ]
        };
      },
      lineOptions() {
        return {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        };
      }
    }
  }
  </script>
  
  <style scoped>
  .summary-box {
    background-color: #f4fff4;
    border: 1px solid #bde5bd;
    padding: 20px;
    border-radius: 12px;
    margin-top: 20px;
  }
  
  .summary-graph-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 40px;
    margin-bottom: 20px;
  }
  
  .donut-chart-box,
  .line-chart-box {
    flex: 1;
    min-width: 300px;
    max-width: 500px;
    height: 300px;
  }
  
  .summary-text {
    font-size: 16px;
    color: #333;
    line-height: 1.6;
    text-align: center;
  }
  </style>
  