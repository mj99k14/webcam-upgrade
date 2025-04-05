<template>
    <div class="mini-calendar">
      <div class="calendar-header">
        <button @click="prevMonth">◀️</button>
        <span>{{ year }}년 {{ month + 1 }}월</span>
        <button @click="nextMonth">▶️</button>
      </div>
  
      <div class="calendar-grid">
        <div class="day-label" v-for="label in ['일','월','화','수','목','금','토']" :key="label">
          {{ label }}
        </div>
  
        <div
          v-for="(cell, index) in calendarCells"
          :key="index"
          class="day-cell"
          :class="[
            cell.isCurrentMonth ? (cell.status === 'bad' ? 'red' : cell.status === 'good' ? 'green' : '') : 'disabled',
            getDayClass(index)
          ]"
          :title="cell.status ? `${cell.date} - ${cell.status === 'bad' ? '거북목' : '정상'}` : ''"
        >
          {{ cell.day }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MiniCalendar',
    props: ['stats'], // [{ date: '2025-04-06', status: 'bad' }, ...]
    data() {
      const today = new Date();
      return {
        year: today.getFullYear(),
        month: today.getMonth()
      };
    },
    computed: {
      dateStatusMap() {
        const map = {};
        this.stats?.forEach(s => {
          map[s.date] = s.status;
        });
        return map;
      },
      calendarCells() {
        const firstDay = new Date(this.year, this.month, 1);
        const startDayOfWeek = firstDay.getDay(); // 0 (일) ~ 6 (토)
  
        const daysInMonth = new Date(this.year, this.month + 1, 0).getDate(); // 현재 달
        const prevMonthDays = new Date(this.year, this.month, 0).getDate(); // 이전 달
  
        const cells = [];
  
        // 앞 빈 칸 (이전 달 날짜 표시)
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
          const d = new Date(this.year, this.month - 1, prevMonthDays - i);
          cells.push({
            day: d.getDate(),
            date: d.toISOString().split('T')[0],
            isCurrentMonth: false,
          });
        }
  
        // 현재 달 날짜
        for (let i = 1; i <= daysInMonth; i++) {
          const d = new Date(this.year, this.month, i);
          const iso = d.toISOString().split('T')[0];
          cells.push({
            day: i,
            date: iso,
            isCurrentMonth: true,
            status: this.dateStatusMap[iso] || null
          });
        }
  
        // 뒷 빈 칸 (다음 달 날짜 표시)
        while (cells.length % 7 !== 0) {
          const d = new Date(this.year, this.month + 1, cells.length - daysInMonth - startDayOfWeek + 1);
          cells.push({
            day: d.getDate(),
            date: d.toISOString().split('T')[0],
            isCurrentMonth: false,
          });
        }
  
        return cells;
      }
    },
    methods: {
      prevMonth() {
        if (this.month === 0) {
          this.year--;
          this.month = 11;
        } else {
          this.month--;
        }
      },
      nextMonth() {
        if (this.month === 11) {
          this.year++;
          this.month = 0;
        } else {
          this.month++;
        }
      },
      getDayClass(index) {
        const dayOfWeek = index % 7;
        return dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : '';
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
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
  }
  
  .calendar-header button {
    background-color: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }
  
  .day-label {
    font-weight: bold;
    text-align: center;
    color: #555;
    font-size: 13px;
  }
  
  .day-cell {
    height: 42px;
    border-radius: 8px;
    text-align: center;
    line-height: 40px;
    font-size: 13px;
    font-weight: bold;
    background-color: #fff;
  }
  
  .red {
    background-color: #ff9e9e;
    color: #fff;
  }
  
  .green {
    background-color: #86efac;
    color: #000;
  }
  
  .disabled {
    opacity: 0.3;
  }
  
  .weekend {
    font-style: italic;
  }
  </style>
  