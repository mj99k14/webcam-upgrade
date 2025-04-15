<template>
  <div class="calendar-wrapper">
    <!-- 요일 헤더 -->
    <div class="calendar-grid header">
      <div v-for="day in daysOfWeek" :key="day" class="calendar-cell header-cell">
        {{ day }}
      </div>
    </div>

    <!-- 날짜들 -->
    <div class="calendar-grid body">
      <div
        v-for="(date, index) in paddedDates"
        :key="index"
        class="calendar-cell"
        :class="{ empty: !date, selected: date === selectedDate }"
        @click="date && emit('dateSelected', fullDate(date))"
      >
        {{ date }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedDate: String,
})

const emit = defineEmits(['dateSelected'])

// ✅ 2025년 4월 기준
const year = 2025
const month = 3 // 3 = 4월 (0부터 시작)

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

// 📌 날짜 생성
const daysInMonth = new Date(year, month + 1, 0).getDate()
const firstDay = new Date(year, month, 1).getDay() // 4월 1일 요일 (0=일, 1=월 ...)

// 📌 앞에 빈 칸 + 날짜 배열
const paddedDates = computed(() => {
  const dates = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(i)
  }
  return dates
})

// ✅ 날짜를 '2025-04-03' 형식으로 포맷
function fullDate(day) {
  const m = (month + 1).toString().padStart(2, '0')
  const d = day.toString().padStart(2, '0')
  return `${year}-${m}-${d}`
}
</script>

<style scoped>
.calendar-wrapper {
  width: 100%;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
}

.calendar-cell {
  padding: 8px 0;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-weight: bold;
  cursor: pointer;
}

.calendar-cell.selected {
  background-color: #4caf50;
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
