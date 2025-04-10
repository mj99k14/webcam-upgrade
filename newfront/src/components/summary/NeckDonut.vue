<template>
    <div class="chart-box">
      <h3 class="chart-title">🐢 목 자세 분석</h3>
      <Doughnut :data="donutData" :options="donutOptions" />
      <div class="legend">
        <span class="legend-item"><span class="dot red"></span> 거북목 의심</span>
        <span class="legend-item"><span class="dot blue"></span> 정상 자세</span>
      </div>
    </div>
  </template>
  
  <script>
  import { Doughnut } from 'vue-chartjs';
  
  export default {
    name: 'NeckDonut',
    components: { Doughnut },
    props: ['photos'],
    computed: {
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
            legend: { display: false }
          }
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .chart-title {
    text-align: center;
    font-size: 17px;
    margin-bottom: 10px;
  }
  .legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 13px;
    margin-top: 8px;
  }
  .legend-item {
    display: flex;
    align-items: center;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
  }
  .red { background: #ff6b6b; }
  .blue { background: #1e90ff; }
  </style>