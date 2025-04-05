<!-- src/components/MiniCalendar.vue -->
<template>
    <div class="mini-calendar">
      <h4>📅 자세 캘린더</h4>
      <div class="calendar-grid">
        <div
          v-for="day in days"
          :key="day.date"
          class="day"
          :class="[
            day.status === 'bad' ? 'red' : 'green',
            getDayOfWeek(day.date) === '일' || getDayOfWeek(day.date) === '토' ? 'weekend' : ''
          ]"
          :title="`${day.date} (${getDayOfWeek(day.date)}) - ${day.status === 'bad' ? '거북목' : '정상'}`"
        >
          <div class="day-number">{{ formatDate(day.date) }}</div>
          <div class="day-name">{{ getDayOfWeek(day.date) }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MiniCalendar',
    props: ['stats'], // [{ date: '2025-04-06', status: 'bad' }, ...]
    computed: {
      days() {
        return this.stats?.slice(-14) || [];
      }
    },
    methods: {
      formatDate(dateStr) {
        const d = new Date(dateStr);
        const month = d.getMonth() + 1;
        const day = d.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
      },
      getDayOfWeek(dateStr) {
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        return dayNames[new Date(dateStr).getDay()];
      }
    }
  };
  </script>
  
  <style scoped>
  .mini-calendar {
    background: #f4f8ff;
    border-radius: 10px;
    padding: 12px;
    margin-top: 20px;
    font-size: 14px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    margin-top: 10px;
  }
  
  .day {
    padding: 6px 4px;
    border-radius: 8px;
    text-align: center;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    line-height: 1.2;
  }
  
  .day-number {
    font-size: 13px;
  }
  
  .day-name {
    font-size: 11px;
    opacity: 0.7;
  }
  
  .red {
    background-color: #ff9e9e;
    color: #fff;
  }
  
  .green {
    background-color: #86efac;
    color: #000;
  }
  
  .weekend {
    opacity: 0.85;
    font-style: italic;
  }
  </style>
  