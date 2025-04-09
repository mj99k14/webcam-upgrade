<template>
  <div class="photo-item" @click="$emit('photo-click', photo)">
    <img :src="photoUrl" alt="사진" />
    <div class="photo-info">
      <strong>{{ formattedDateTime }}</strong>
      <p class="neck-angle">📏 목 각도: {{ formattedNeckAngle }}°</p>
      <p class="shoulder-status">📐 어깨 상태: {{ photo.shoulder_status || '정보 없음' }}</p>
    </div>
    <button class="delete-btn" @click.stop="$emit('deletePhoto', photo.id)">삭제</button>
  </div>
</template>

<script>
export default {
  props: {
    photo: { type: Object, required: true },
    formatTime: { type: Function, required: true }
  },
  computed: {
    photoUrl() {
      return `http://210.101.236.158:5000${this.photo.photo_url}`;
    },
    formattedDateTime() {
      const date = new Date(this.photo.uploaded_at);
      return `${date.getMonth() + 1}월 ${date.getDate()}일 ${this.formatTime(date)}`;
    },
    formattedNeckAngle() {
      const angle = parseFloat(this.photo.neck_angle);
      return isNaN(angle) ? "N/A" : angle.toFixed(2);
    }
  }
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
  position: relative;
  transition: background-color 0.2s;
}
.photo-item:hover {
  background-color: #e6f0ff;
}

.photo-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 10px;
}

.photo-info {
  flex-grow: 1;
}

.neck-angle,
.shoulder-status {
  font-size: 13px;
  color: #555;
  margin-top: 2px;
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  background: transparent;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
}

.delete-btn:hover {
  color: red;
}
</style>
