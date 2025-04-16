<template>
  <div class="calendar-wrapper">
    <!-- 📅 월 이동 -->
    <div class="calendar-header">
      <button @click="prevMonth">〈</button>
      <span>{{ year }}년 {{ month + 1 }}월</span>
      <button @click="nextMonth">〉</button>
    </div>

    <!-- 요일 헤더 -->
    <div class="calendar-grid header">
      <div v-for="day in daysOfWeek" :key="day" class="calendar-cell header-cell">
        {{ day }}
      </div>
    </div>

    <!-- 날짜 셀 -->
    <div class="calendar-grid body">
      <div
        v-for="(date, index) in paddedDates"
        :key="index"
        class="calendar-cell"
        :class="getDateClass(date)"
        @click="date && emit('dateSelected', fullDate(date))"
      >
        {{ date }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  selectedDate: String,
  stats: Array // 📌 [{ date: '2025-04-16', status: 'bad' }, ...]
})

const emit = defineEmits(['dateSelected'])

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate())
const firstDay = computed(() => new Date(year.value, month.value, 1).getDay())

const paddedDates = computed(() => {
  const dates = Array(firstDay.value).fill(null)
  for (let i = 1; i <= daysInMonth.value; i++) {
    dates.push(i)
  }
  return dates
})

const fullDate = (day) => {
  if (!day) return ''
  const m = (month.value + 1).toString().padStart(2, '0')
  const d = day.toString().padStart(2, '0')
  return `${year.value}-${m}-${d}`
}

// 📌 날짜 상태 클래스 (선택됨, good/bad)
const getDateClass = (day) => {
  if (!day) return 'empty'
  const dateStr = fullDate(day)
  const isSelected = dateStr === props.selectedDate

  const statusItem = props.stats?.find(s => s.date === dateStr)
  const statusClass = statusItem ? (statusItem.status === 'bad' ? 'bad' : 'good') : ''

  return {
    selected: isSelected,
    [statusClass]: !!statusClass
  }
}

// 📌 월 이동 함수
const prevMonth = () => {
  if (month.value === 0) {
    month.value = 11
    year.value -= 1
  } else {
    month.value -= 1
  }
}

const nextMonth = () => {
  if (month.value === 11) {
    month.value = 0
    year.value += 1
  } else {
    month.value += 1
  }
}
</script>

<style scoped>
.calendar-wrapper {
  width: 100%;
  text-align: center;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: bold;
}

.calendar-header button {
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  padding: 8px 0;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-weight: bold;
  cursor: pointer;
}

.calendar-cell.selected {
  border: 2px solid #1976d2;
}

.calendar-cell.good {
  background-color: #81c784; /* 초록 */
  color: white;
}

.calendar-cell.bad {
  background-color: #e57373; /* 빨강 */
  color: white;
}

.calendar-cell.empty {
  background-color: transparent;
  cursor: default;
}

.header-cell {
  background-color: transparent;
  font-weight: 600;
  color: #555;
}
</style>
