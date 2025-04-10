<template>
  <div class="mini-calendar">
    <div class="calendar-header">
      <button @click="prevMonth">◀️</button>
      <span>{{ year }}년 {{ month + 1 }}월</span>
      <button @click="nextMonth">▶️</button>
    </div>

    <div class="calendar-grid">
      <div
        class="day-label"
        v-for="label in ['일','월','화','수','목','금','토']"
        :key="label"
      >
        {{ label }}
      </div>

      <div
        v-for="(cell, index) in calendarCells"
        :key="index"
        class="day-cell-wrapper"
      >
        <div
          class="day-cell"
          :class="[
            cell.isCurrentMonth
              ? (cell.status === 'bad'
                  ? 'red'
                  : cell.status === 'good'
                  ? 'green'
                  : '')
              : 'disabled',
            getDayClass(index)
          ]"
          :title="cell.status ? `${cell.date} - ${cell.status === 'bad' ? '거북목' : '정상'}` : ''"
        >
          <span :class="{ today: cell.isToday }">{{ cell.day }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiniCalendar',
  props: {
    stats: Array,
    today: String // ❌ props 받아서 정확한 오늘 날짜 활용
  },
  data() {
    const now = this.getKoreaDate();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
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
      const startDayOfWeek = firstDay.getDay();
      const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
      const prevMonthDays = new Date(this.year, this.month, 0).getDate();

      const cells = [];

      // 이전 달
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(this.year, this.month - 1, prevMonthDays - i);
        cells.push({
          day: d.getDate(),
          date: this.formatDate(d),
          isCurrentMonth: false,
          isToday: false,
        });
      }

      // 이보다 달
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(this.year, this.month, i);
        const iso = this.formatDate(d);
        cells.push({
          day: i,
          date: iso,
          isCurrentMonth: true,
          isToday: iso === this.today,
          status: this.dateStatusMap[iso] || null,
        });
      }

      // 다음 달
      while (cells.length % 7 !== 0) {
        const d = new Date(this.year, this.month + 1, cells.length - daysInMonth - startDayOfWeek + 1);
        cells.push({
          day: d.getDate(),
          date: this.formatDate(d),
          isCurrentMonth: false,
          isToday: false,
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
    },
    formatDate(date) {
      const utc = date.getTime();
      const koreaOffset = 9 * 60 * 60 * 1000;
      const koreanDate = new Date(utc + koreaOffset);

      const y = koreanDate.getFullYear();
      const m = String(koreanDate.getMonth() + 1).padStart(2, '0');
      const d = String(koreanDate.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    getKoreaDate() {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset + 9 * 60 * 60 * 1000);
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

.day-cell-wrapper {
  position: relative;
}

.day-cell {
  height: 42px;
  border-radius: 8px;
  text-align: center;
  line-height: 40px;
  font-size: 13px;
  font-weight: bold;
  background-color: #fff;
  position: relative;
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

.today {
  display: inline-block;
  padding: 2px 6px;
  border: 2px solid #2563eb;
  border-radius: 50%;
  box-shadow: 0 0 4px #3b82f6;
  background-color: #fff;
  z-index: 2;
  position: relative;
}
</style>