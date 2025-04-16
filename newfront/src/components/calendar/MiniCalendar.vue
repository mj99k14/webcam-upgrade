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
import { computed, ref } from 'vue'

const props = defineProps({
  selectedDate: String,
  stats: Array
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
  max-width: 320px;
  margin: 20px auto; /* 위아래 여백 추가 */
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  margin: 12px 0 16px;
  color: #2c3e50;
}

.calendar-header button {
  background-color: transparent;
  border: none;
  font-size: 22px;
  color: #1976d2;
  cursor: pointer;
  transition: 0.2s ease;
}
.calendar-header button:hover {
  transform: scale(1.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px; /* 간격 조금 줄임 */
}

.calendar-cell {
  height: 36px;               /* ✅ 고정 높이 */
  line-height: 36px;          /* ✅ 수직 가운데 정렬 */
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  background-color: #f9f9f9;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  font-size: 14px;
}

.calendar-cell:hover {
  background-color: #e3f2fd;
}

/* ✅ 선택된 날짜 */
.calendar-cell.selected {
  border: 2px solid #1976d2;
  background-color: #bbdefb;
  box-shadow: 0 0 0 1px white inset;
}

/* ✅ 상태 표시 */
.calendar-cell.good {
  background-color: #81c784; /* 연초록 */
  color: white;
}
.calendar-cell.bad {
  background-color: #e57373; /* 연빨강 */
  color: white;
}

/* ✅ 비어있는 셀 */
.calendar-cell.empty {
  background-color: transparent;
  cursor: default;
  pointer-events: none;
}

/* ✅ 요일 헤더 셀 */
.header-cell {
  background-color: transparent;
  font-weight: bold;
  color: #455a64;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}
</style>
