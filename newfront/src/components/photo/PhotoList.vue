<template>
  <!-- 전체 카드 통일 -->
  <div class="white-card">
    <div class="section-title-wrapper">
      <h2 class="section-title"><span class="emoji">📸</span> 사진 목록</h2>
    </div>

    <!--  선택한 사진 -->
    <div class="selected-photo-card" @click="selectedPhoto && $emit('showPhoto', selectedPhoto)">
      <h3 class="card-title">
         선택한 사진
        <span class="badge" v-if="selectedPhoto">최근 촬영됨</span>
      </h3>

      <div class="photo-wrapper">
        <div class="photo-box">
          <img
            v-if="selectedPhoto"
            :src="`http://210.101.236.158:5000${selectedPhoto.photo_url}`"
            alt="선택한 사진"
            class="main-selected-photo"
          />
          <div v-else class="photo-placeholder-text">
             아직 사진이 선택되지 않았습니다.
          </div>
        </div>

        <p class="shoulder-status-text">
           어깨 상태:
          <span :class="selectedPhoto ? getShoulderClass(selectedPhoto.shoulder_status) : 'unknown'">
            {{ selectedPhoto ? selectedPhoto.shoulder_status || '정보 없음' : '사진을 선택해주세요.' }}
          </span>
        </p>
      </div>
    </div>

    <!--  날짜 필터 -->
    <div class="date-filter">
      <label for="filter-date" class="date-label"> 날짜 필터:</label>
      <input
        id="filter-date"
        type="date"
        :value="selectedDate"
        @input="onDateInput"
        class="date-input"
      />
    </div>

    <!--  자세 섹션 목록 -->
    <p class="mini-section-title"> 자세 분석 목록</p>
    <div class="posture-section-wrapper">
      <!--  가장 좋은 자세 -->
      <div class="section">
        <div class="section-header" @click="isBestOpen = !isBestOpen">
          <h3 class="accordion-title">
            <span>{{ isBestOpen ? '▼' : '▶' }}</span> 가장 좋은 자세 ({{ bestPhotos.length }}장)
          </h3>
          <button class="delete-all-btn" @click.stop="deleteAll('best')">전체 삭제</button>
        </div>
        <transition name="fade">
          <div class="scroll-block" v-show="isBestOpen">
            <div v-for="(photo, idx) in bestPhotos" :key="photo.id" class="photo-entry">
              <PhotoItem
                :photo="photo"
                :index="idx"
                :selectedPhoto="selectedPhoto"
                @click="$emit('showPhoto', photo)"
                @deletePhoto="$emit('deletePhoto', photo.id)"
              />
            </div>
          </div>
        </transition>
      </div>

      <!--  가장 나쁜 자세 -->
      <div class="section">
        <div class="section-header" @click="isWorstOpen = !isWorstOpen">
          <h3 class="accordion-title">
            <span>{{ isWorstOpen ? '▼' : '▶' }}</span> 가장 나쁜 자세 ({{ worstPhotos.length }}장)
          </h3>
          <button class="delete-all-btn" @click.stop="deleteAll('worst')">전체 삭제</button>
        </div>
        <transition name="fade">
          <div class="scroll-block" v-show="isWorstOpen">
            <div v-for="(photo, idx) in worstPhotos" :key="photo.id" class="photo-entry">
              <PhotoItem
                :photo="photo"
                :index="idx"
                :selectedPhoto="selectedPhoto"
                @click="$emit('showPhoto', photo)"
                @deletePhoto="$emit('deletePhoto', photo.id)"
              />
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed,ref } from 'vue'
import PhotoItem from './PhotoItem.vue'

const props = defineProps({
  filteredPhotos: Array,
  selectedPhoto: Object,
  selectedDate: String,
  formatTime: Function
})

const emit = defineEmits([
  'showPhoto',
  'deletePhoto',
  'update:selectedDate',
  'handlePhotoUploaded'
])

// 🔁 아코디언 상태
const isBestOpen = ref(true)
const isWorstOpen = ref(true)

const onDateInput = (event) => {
  emit('update:selectedDate', event.target.value)
}

// ✅ 필터링된 best 사진
const bestPhotos = computed(() => {
  return [...(props.filteredPhotos || [])]
    .filter(photo => photo.type === 'best')
    .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
})

// ✅ 필터링된 worst 사진
const worstPhotos = computed(() => {
  return [...(props.filteredPhotos || [])]
    .filter(photo => photo.type === 'worst')
    .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
})

// ❌ 전체 삭제 기능
const deleteAll = async (type) => {
  const confirmMsg = type === 'best'
    ? '가장 좋은 자세 사진을 모두 삭제하시겠습니까?'
    : '가장 나쁜 자세 사진을 모두 삭제하시겠습니까?'

  if (!confirm(confirmMsg)) return

  const targets = (props.filteredPhotos || []).filter(p => p.type === type)
  for (const photo of targets) {
    await emit('deletePhoto', photo.id)
  }
  emit('handlePhotoUploaded')
}

// 🦴 어깨 상태 색상 반환
const getShoulderClass = (status) => {
  if (!status || status.includes('없음')) return 'gray'
  if (status.includes('수평')) return 'green'
  return 'red'
}
</script>

<style scoped>
/* ✅ 전체 박스 통일 */
.white-card {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  max-width: 780px;     /* ✅ 오른쪽 카드 튀어나오지 않게 조정 */
  margin: 0 auto 32px;
  box-sizing: border-box;
}

/* ✅ 제목 스타일 */
.section-title-wrapper {
  display: flex;
  justify-content: center;
  margin: 4px 0 20px;  /* ✅ 위 여백 확 줄이기 */
}

.section-title {
  font-size: 30px;         /* ✅ 기존 28px → 30px */
  font-weight: 800;
  color: #1976d2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-bottom: 3px solid #42a5f5;
  padding-bottom: 4px;
}

.section-title .emoji {
  font-size: 24px;
  margin-bottom: 2px;
}

/* ✅ 선택된 사진 카드 */
.selected-photo-card {
  padding: 28px;
  border: 2px solid #42a5f5;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 720px;
  margin: 0 auto 24px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin-bottom: 16px;
}
.badge {
  background-color: #1976d2;
  color: #fff;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 8px;
  margin-left: 6px;
}

.photo-wrapper {
  position: relative;
}
.photo-box {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  aspect-ratio: 4 / 3; /* ✅ 항상 4:3 비율 유지 */
  background-color: #f9f9f9;
  border-radius: 16px;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
}

.main-selected-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.photo-placeholder-text {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 12px;
}

.photo-placeholder-text {
  color: #888;
  font-size: 16px;
}

.shoulder-status-text {
  font-weight: bold;
  font-size: 15px;
  margin-top: 8px;
}
.shoulder-status-text span {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}
.green {
  background-color: #e8f5e9;
  color: #388e3c;
}
.red {
  background-color: #ffebee;
  color: #c62828;
}
.gray,
.unknown {
  background-color: #eeeeee;
  color: #555;
}

/* ✅ 날짜 필터 */
.date-filter {
  display: flex;
  align-items: center; /* 수직 중앙 정렬 */
  gap: 12px;            /* 라벨과 인풋 사이 여백 */
  padding: 10px 16px;
  border: 1px solid #d0e2ff;
  border-radius: 12px;
  background-color: #f0f8ff;
  flex-wrap: nowrap;   /* ✅ 줄바꿈 방지 */
}

.date-label {
  font-size: 16px;
  white-space: nowrap; /* ✅ 줄바꿈 방지 */
}

.date-input {
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 200px;
  min-width: 160px;
}


.date-input:focus {
  border-color: #1976d2;
  outline: none;
}

/* ✅ 분석 목록 제목 */
.mini-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin: 16px 0 8px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ✅ 분석 목록 전체 */
.posture-section-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 720px;
  margin: 0 auto;
  gap: 24px;
}

/* ✅ 개별 섹션 박스 */
.section {
  width: 100%;
  max-width: 450px;           /* 🔽 더 슬림하게 */
  background-color: #fafafa;
  padding: 12px 16px;         /* 🔽 padding 줄임 */
  border-radius: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
}

.section.best {
  background-color: #f1fdf4;
  border-left: 6px solid #66bb6a;
}
.section.worst {
  background-color: #fff5f5;
  border-left: 6px solid #ef5350;
}
.section:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

/* ✅ 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
}
.accordion-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

/* ✅ 스크롤 영역 */
.scroll-block {
  max-height: 240px;
  overflow-y: auto;
  padding-right: 8px;
  margin-top: 8px;
  border-top: 1px solid #ccc;
  box-sizing: border-box;
}
.photo-entry {
  margin-bottom: 12px;
}

/* ✅ 전체 삭제 버튼 */
.delete-all-btn {
  background-color: #e53935;
  color: #fff;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
.delete-all-btn:hover {
  background-color: #c62828;
}

/* ✅ 전환 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}


</style>
