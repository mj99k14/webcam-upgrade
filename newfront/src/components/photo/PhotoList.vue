<template>
    <h2>📸 사진 목록</h2>
     <!-- ✅ 선택한 사진 카드 -->
     <div v-if="selectedPhoto" class="selected-photo-card" @click="$emit('showPhoto', selectedPhoto)">
      <h3 class="card-title">📌 선택한 사진</h3>
      <div class="photo-wrapper">
        <img
          :src="`http://210.101.236.158:5000${selectedPhoto.photo_url}`"
          alt="선택한 사진"
          class="main-selected-photo"
        />
        <p class="shoulder-status-text">
          🦴 어깨 상태:
          <span :class="getShoulderClass(selectedPhoto.shoulder_status)">
            {{ selectedPhoto.shoulder_status || '정보 없음' }}
          </span>
        </p>
      </div>
    </div>

    <!-- 📅 날짜 필터 -->
    <div class="date-filter">
      <label for="filter-date" class="date-label">날짜 필터:</label>
      <input
        id="filter-date"
        type="date"
        :value="selectedDate"
        class="date-input"
        @input="$emit('update:selectedDate', $event.target.value)"
      />
    </div>
    <!-- ▶️ 가장 좋은 자세 -->
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

    <!-- ▶️ 가장 나쁜 자세 -->
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
  data() {
    return {
      isBestOpen: true,
      isWorstOpen: true,
    };
  },
  computed: {
    bestPhotos() {
      return [...this.filteredPhotos]
        .filter(photo => photo.type === 'best')
        .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    },
    worstPhotos() {
      return [...this.filteredPhotos]
        .filter(photo => photo.type === 'worst')
        .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    },
  },
  methods: {
    async deleteAll(type) {
      const confirmMsg =
        type === 'best'
          ? '가장 좋은 자세 사진을 모두 삭제하시겠습니까?'
          : '가장 나쁜 자세 사진을 모두 삭제하시겠습니까?';
      if (!confirm(confirmMsg)) return;

      const targets = this.filteredPhotos.filter(photo => photo.type === type);
      for (const photo of targets) {
        await this.$emit('deletePhoto', photo.id);
      }
      this.$emit('handlePhotoUploaded');
    },
    getShoulderClass(status) {
      if (!status || status.includes('없음')) return 'gray';
      if (status.includes('수평')) return 'green';
      return 'red';
    }
  },
};
</script>

<style scoped>
.right {
  text-align: center;
}

/* 날짜 필터 */
.date-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  margin: 0 auto 24px;
  background: #f1f8ff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #cce4ff;
  max-width: 600px;
}

.date-label {
  font-weight: bold;
  font-size: 16px;
}

.date-input {
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  min-width: 180px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease;
}
.date-input:focus {
  border-color: #1976d2;
  outline: none;
}

/* 선택한 사진 */
.selected-photo-card {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 30px auto;
  text-align: center;
  max-width: 600px;
}

.card-title {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: bold;
  color: #222;
  text-align: center;
}

.photo-wrapper {
  position: relative;
}

.main-selected-photo {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.shoulder-status-text {
  margin-top: 12px;
  font-weight: bold;
  font-size: 15px;
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
.gray {
  background-color: #eeeeee;
  color: #555;
}

/* 사진 리스트 */
.section {
  margin-top: 30px;
  text-align: left;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px 20px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;
}
.section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
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
  font-size: 18px;
  font-weight: bold;
}
.scroll-block {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
  margin-top: 8px;
  border-top: 1px solid #ccc;
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

/* 전환 효과 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
}

</style>