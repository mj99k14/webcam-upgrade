<template>
  <div class="right">
    <h2>사진 목록</h2>

    <div v-if="selectedPhoto">
      <h3>선택한 사진</h3>
      <img :src="`http://210.101.236.158:5000${selectedPhoto.photo_url}`" alt="선택한 사진" class="selected-photo" />
    </div>

    <div class="date-filter">
      <label for="filter-date">🗓️ 날짜 필터:</label>
      <input
        id="filter-date"
        type="date"
        :value="selectedDate"
        @input="$emit('update:selectedDate', $event.target.value)"
      />
    </div>

    <!-- Best Posture Photo -->
    <div v-if="bestPhoto">
      <h3>🟢 가장 좋은 자세</h3>
      <PhotoItem
        :photo="bestPhoto"
        :mainPhotoId="mainPhotoId"
        :formatTime="formatTime"
        @showPhoto="$emit('showPhoto', $event)"
        @deletePhoto="$emit('deletePhoto', $event)"
      />
    </div>

    <!-- Worst Posture Photo -->
    <div v-if="worstPhoto">
      <h3>🟠 가장 나쁜 자세</h3>
      <PhotoItem
        :photo="worstPhoto"
        :mainPhotoId="mainPhotoId"
        :formatTime="formatTime"
        @showPhoto="$emit('showPhoto', $event)"
        @deletePhoto="$emit('deletePhoto', $event)"
      />
    </div>

    <!-- Normal Photo List -->
    <h3>📸 일반 사진</h3>
    <p>총 {{ normalPhotos.length }}장</p>
    <ul>
      <PhotoItem
        v-for="photo in normalPhotos"
        :key="photo.id"
        :photo="photo"
        :mainPhotoId="mainPhotoId"
        :formatTime="formatTime"
        @showPhoto="$emit('showPhoto', $event)"
        @deletePhoto="$emit('deletePhoto', $event)"
      />
    </ul>
  </div>
</template>

<script>
import PhotoItem from './PhotoItem.vue';

export default {
  components: { PhotoItem },
  props: {
    filteredPhotos: Array,
    mainPhotoId: Number,
    selectedPhoto: Object,
    selectedDate: String,
    formatTime: Function
  },
  emits: ['showPhoto', 'deletePhoto', 'update:selectedDate'],
  computed: {
    bestPhoto() {
      return this.filteredPhotos.find(photo => photo.type === 'best');
    },
    worstPhoto() {
      return this.filteredPhotos.find(photo => photo.type === 'worst');
    },
    normalPhotos() {
      return this.filteredPhotos.filter(photo => photo.type !== 'best' && photo.type !== 'worst');
    }
  }
};
</script>

<style scoped>
.right {
  flex: 1;
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.selected-photo {
  width: 100%;
  height: 400px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #ccc;
  margin: 5px 0;
}

.photo-image {
  width: 100%;
  height: 400px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  background-color: white;
}

.date-filter {
  margin: 10px 0;
}
</style>
