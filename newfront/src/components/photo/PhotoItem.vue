<template>
  <div class="photo-item" @click="openModal">
    <img :src="photoUrl" alt="사진" class="photo-img" />

    <div class="photo-info">
      <div class="info-header">
        <strong class="date-title">{{ index + 1 }}. {{ formattedDateTime }}</strong>
        <button class="delete-btn" @click.stop="$emit('deletePhoto', photo.id)">삭제</button>
      </div>

      <div class="stat-row">
        <span class="label">🐢 목 각도:</span>
        <span>{{ formattedNeckAngle }}°</span>
      </div>
      <div class="stat-row">
        <span class="label">🤷 어깨 상태:</span>
        <span>{{ photo.shoulder_status || '정보 없음' }}</span>
      </div>
    </div>

    <PhotoModal v-if="modalOpen" :photoUrl="photoUrl" @close="closeModal" />
  </div>
</template>

<script>
import PhotoModal from './PhotoModal.vue';

export default {
  props: {
    photo: { type: Object, required: true },
    index: { type: Number, default: 0 }
  },
  data() {
    return {
      modalOpen: false
    };
  },
  computed: {
    photoUrl() {
      return `http://210.101.236.158:5000${this.photo.photo_url}`;
    },
    formattedDateTime() {
      return this.formatToKoreanTime(this.photo.uploaded_at);
    },
    formattedNeckAngle() {
      const angle = parseFloat(this.photo.neck_angle);
      return isNaN(angle) ? 'N/A' : angle.toFixed(2);
    }
  },
  methods: {
    openModal() {
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
    formatToKoreanTime(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: 'Asia/Seoul'
      }).format(date).replace(/\. /g, '월 ').replace(/\./, '일');
    }
  },
  components: { PhotoModal }
};
</script>

<style scoped>
.photo-item {
  display: flex;
  align-items: center;
  background: #f4f9ff;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 10px;
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