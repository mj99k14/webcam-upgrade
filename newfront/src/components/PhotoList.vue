<template>
  <div class="right">
    <h2>사진 목록</h2>

    <!-- 📸 선택한 사진 표시 -->
    <div v-if="selectedPhoto">
      <h3>선택한 사진</h3>
      <img :src="`http://210.101.236.158:5000${selectedPhoto.photo_url}`" alt="선택한 사진" class="selected-photo" />
    </div>

    <!-- 🗓️ 날짜 필터 -->
    <div class="date-filter">
      <label for="filter-date">🗓️ 날짜 필터:</label>
      <input
        id="filter-date"
        type="date"
        :value="selectedDate"
        @input="$emit('update:selectedDate', $event.target.value)"
      />
    </div>

    <!-- 📦 날짜별 그룹 -->
    <div v-for="(group, date) in groupedPhotos" :key="date" class="photo-group">
      <h3>{{ formatDate(date) }}</h3>

      <!-- 여러 개의 "가장 좋은 자세" 사진 -->
      <div v-if="group.best.length">
        <h4>🟢 가장 좋은 자세</h4>
        <div v-for="photo in group.best" :key="photo.id">
          <PhotoItem
            :photo="photo"
            :mainPhotoId="mainPhotoId"
            :formatTime="formatTime"
            @showPhoto="$emit('showPhoto', $event)"
            @deletePhoto="$emit('deletePhoto', $event)"
          />
        </div>
      </div>

      <!-- 여러 개의 "가장 나쁜 자세" 사진 -->
      <div v-if="group.worst.length">
        <h4>🟠 가장 나쁜 자세</h4>
        <div v-for="photo in group.worst" :key="photo.id">
          <PhotoItem
            :photo="photo"
            :mainPhotoId="mainPhotoId"
            :formatTime="formatTime"
            @showPhoto="$emit('showPhoto', $event)"
            @deletePhoto="$emit('deletePhoto', $event)"
          />
        </div>
      </div>
    </div>
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
    groupedPhotos() {
      const groups = {};
      this.filteredPhotos.forEach(photo => {
        const date = photo.uploaded_at.split('T')[0];  // 날짜 부분만 추출
        if (!groups[date]) groups[date] = { best: [], worst: [] };
        if (photo.type === 'best') groups[date].best.push(photo);
        if (photo.type === 'worst') groups[date].worst.push(photo);
      });
      return groups;
    }
  },
  methods: {
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}월 ${d.getDate()}일`;
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

.date-filter {
  margin: 10px 0;
}

.photo-group {
  margin-top: 20px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  text-align: left;
}
</style>
