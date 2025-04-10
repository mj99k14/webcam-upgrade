<template>
  <div class="photo-item" @click="$emit('photo-click', photo)">
    <img :src="photoUrl" alt="사진" />
    <div class="photo-info">
      <strong><span class="index">{{ index + 1 }}. </span>{{ formattedDateTime }}</strong>
      <p class="neck-angle">목 각도: {{ formattedNeckAngle }}°</p>
      <p class="shoulder-status">어깨 상태: {{ photo.shoulder_status || '정보 없음' }}</p>
    </div>
    <button class="delete-btn" @click.stop="$emit('deletePhoto', photo.id)">삭제</button>
  </div>
</template>


<script>
export default {
  props: {
    photo: { type: Object, required: true },
    formatTime: { type: Function, required: true } ,// 외부에서 시간 포맷팅 함수 받기
    index: { type: Number, required: false, default: 0 } // ← 여기 추가!
  },
  computed: {
    photoUrl() {
      return `http://210.101.236.158:5000${this.photo.photo_url}`;
    },
    formattedDateTime() {
      const date = new Date(this.photo.uploaded_at);
      date.setHours(date.getHours() + 9); // 한국 시간 보정
      const y = date.getFullYear();
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
.index {
  display: inline-block;
  width: 24px;
  text-align: right;
  margin-right: 4px;
  color: #444;
}


</style>
