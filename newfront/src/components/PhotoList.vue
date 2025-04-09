<template>
  <div class="right">
    <h2>사진 목록</h2>

    <!-- 날짜 필터 -->
    <div class="date-filter">
      <label for="filter-date">🗓️ 날짜 필터:</label>
      <input
        id="filter-date"
        type="date"
        :value="selectedDate"
        @input="$emit('update:selectedDate', $event.target.value)"
      />
    </div>

    <!-- 선택한 사진 -->
    <div v-if="selectedPhoto" class="preview-block" @click="$emit('photo-click', selectedPhoto)">
      <h3>선택한 사진</h3>
      <img :src="`http://210.101.236.158:5000${selectedPhoto.photo_url}`" alt="선택한 사진" class="selected-photo" />
      <p class="shoulder-status">📐 어깨 상태: {{ selectedPhoto.shoulder_status || '정보 없음' }}</p>
    </div>

    <!-- 🟢 가장 좋은 자세 목록 -->
    <div class="section">
      <div class="section-header">
        <h3>🟢 가장 좋은 자세 ({{ bestPhotos.length }}장)</h3>
        <button class="delete-all-btn" @click="deleteAll('best')">🗑 전체 삭제</button>
      </div>
      <div class="scroll-block">
        <div v-for="photo in bestPhotos" :key="photo.id" class="photo-entry">
          <PhotoItem
            :photo="photo"
            :formatTime="formatTime"
            @photo-click="$emit('showPhoto', photo)"
            @deletePhoto="$emit('deletePhoto', photo.id)"
          />
          <p class="shoulder-status-small">📐 {{ photo.shoulder_status || '어깨 정보 없음' }}</p>
        </div>
      </div>
    </div>

    <!-- 🟠 가장 나쁜 자세 목록 -->
    <div class="section">
      <div class="section-header">
        <h3>🟠 가장 나쁜 자세 ({{ worstPhotos.length }}장)</h3>
        <button class="delete-all-btn" @click="deleteAll('worst')">🗑 전체 삭제</button>
      </div>
      <div class="scroll-block">
        <div v-for="photo in worstPhotos" :key="photo.id" class="photo-entry">
          <PhotoItem
            :photo="photo"
            :formatTime="formatTime"
            @photo-click="$emit('showPhoto', photo)"
            @deletePhoto="$emit('deletePhoto', photo.id)"
          />
          <p class="shoulder-status-small">📐 {{ photo.shoulder_status || '어깨 정보 없음' }}</p>
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
    selectedPhoto: Object,
    selectedDate: String,
    formatTime: Function,
  },
  emits: ['showPhoto', 'deletePhoto', 'update:selectedDate', 'handlePhotoUploaded'],
  computed: {
    bestPhotos() {
      return this.filteredPhotos.filter(photo => photo.type === 'best');
    },
    worstPhotos() {
      return this.filteredPhotos.filter(photo => photo.type === 'worst');
    },
  },
  methods: {
    async deleteAll(type) {
      const confirmMsg = type === 'best' ? '가장 좋은 자세 사진을 모두 삭제하시겠습니까?' : '가장 나쁜 자세 사진을 모두 삭제하시겠습니까?';
      if (!confirm(confirmMsg)) return;

      const targets = this.filteredPhotos.filter(photo => photo.type === type);
      for (const photo of targets) {
        await this.$emit('deletePhoto', photo.id);
      }
      this.$emit('handlePhotoUploaded');
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

.date-filter {
  margin-bottom: 12px;
}

.preview-block {
  margin: 20px 0;
  cursor: pointer;
}
.selected-photo {
  width: 100%;
  height: 400px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #ccc;
}
.shoulder-status {
  margin-top: 8px;
  font-weight: bold;
  color: #007BFF;
}
.shoulder-status-small {
  font-size: 14px;
  color: #555;
  margin-top: 4px;
  text-align: left;
  padding-left: 8px;
}

.section {
  margin-top: 30px;
  text-align: left;
}

.scroll-block {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
  border-top: 1px solid #ddd;
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.photo-entry {
  margin-bottom: 12px;
}

.delete-all-btn {
  background-color: #e53935;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}
.delete-all-btn:hover {
  background-color: #c62828;
}
</style>
