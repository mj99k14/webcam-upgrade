<template>
  <div class="photo-item" @click="$emit('showPhoto', photo)">
    <img :src="`http://210.101.236.158:5000${photo.photo_url}`" alt="사진" />
    <div class="photo-info">
      <strong>{{ formattedDateTime }}</strong>
      <p class="neck-angle">거북목 각도: {{ formattedNeckAngle }}°</p>
    </div>
    <button class="delete-btn" @click.stop="$emit('deletePhoto', photo.id)">삭제</button>
  </div>
</template>

<script>
export default {
  props: {
    photo: Object,
    formatTime: Function
  },
  computed: {
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
.neck-angle {
  font-size: 13px;
  color: #888;
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
