<template>
  <div class="photo-item" @click="openModal">
    <img :src="photoUrl" alt="사진" class="photo-img" />

    <div class="photo-info">
      <div class="info-header">
        <strong class="date-title">{{ index + 1 }}. {{ formattedDateTime }}</strong>
        <button class="delete-btn" @click.stop="$emit('deletePhoto', photo.id)">삭제</button>
      </div>

      <div class="stat-row">
        <span class="label"> 🐢목 각도:</span>
        <span>{{ formattedNeckAngle }}°</span>
      </div>
      <div class="stat-row">
        <span class="label"> 🤷어깨 상태:</span>
        <span>{{ photo.shoulder_status || '정보 없음' }}</span>
      </div>
    </div>

    <!-- 모달 컴포넌트 -->
    <PhotoModal v-if="modalOpen" :photoUrl="photoUrl" @close="closeModal" />
  </div>
</template>

<script>
import PhotoModal from './PhotoModal.vue'; // PhotoModal 컴포넌트 import

export default {
  props: {
    photo: { type: Object, required: true },
    index: { type: Number, default: 0 }
  },
  data() {
    return {
      modalOpen: false // 모달 상태
    };
  },
  computed: {
    photoUrl() {
      return `http://210.101.236.158:5000${this.photo.photo_url}`;
    },
    formattedDateTime() {
      const date = new Date(this.photo.uploaded_at);
      date.setHours(date.getHours() + 9); // 한국 시간 보정
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `${m}월 ${d}일 ${hh}:${mm}`;
    },
    formattedNeckAngle() {
      const angle = parseFloat(this.photo.neck_angle);
      return isNaN(angle) ? 'N/A' : angle.toFixed(2);
    }
  },
  methods: {
    openModal() {
      this.modalOpen = true; // 모달 열기
    },
    closeModal() {
      this.modalOpen = false; // 모달 닫기
    }
  },
  components: {
    PhotoModal // PhotoModal 컴포넌트 추가
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 */
.photo-item {
  display: flex;
  align-items: center;
  background: #f4f9ff;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.photo-item:hover {
  background-color: #e6f0ff;
}

.photo-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
}

.photo-info {
  flex: 1;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 4px;
}

.date-title {
  font-size: 14px;
  color: #222;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
}

.delete-btn:hover {
  color: red;
}

.stat-row {
  font-size: 13px;
  color: #333;
  margin-top: 2px;
  display: flex;
  gap: 6px;
}

.label {
  color: #777;
}
</style>
