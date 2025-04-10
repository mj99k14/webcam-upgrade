<template>
    <div class="chart-box">
      <h3 class="chart-title"> 🤷어깨 균형 분석</h3>
      <Doughnut :data="donutData" :options="donutOptions" />
      <div class="legend">
        <span class="legend-item"><span class="dot orange"></span> 어깨 불균형</span>
        <span class="legend-item"><span class="dot blue"></span> 어깨 수평</span>
      </div>
    </div>
  </template>
  
  <script>
  import { Doughnut } from 'vue-chartjs';
  
  export default {
    name: 'ShoulderDonut',
    components: { Doughnut },
    props: ['photos'],
    computed: {
      donutData() {
        const total = this.photos.length;
        const unbalanced = this.photos.filter(p => p.shoulder_diff && p.shoulder_diff > 10).length;
        const balanced = total - unbalanced;
        return {
          labels: ['어깨 불균형', '어깨 수평'],
          datasets: [{
            data: [unbalanced, balanced],
            backgroundColor: ['#ffa726', '#42a5f5']
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
  .orange { background: #ffa726; }
  .blue { background: #1e90ff; }
  </style>