<template>
  <div class="container">
    <!--  왼쪽: 유저 정보 -->
    <div class="card-wrapper user-card">
      <div class="card-inner">
        <UserInfo :user="user" :calendarStats="calendarStats" @logout="logout" @deleteAccount="deleteAccount" />
        <MiniCalendar :selectedDate="selectedDate" :stats="calendarStats" @dateSelected="handleCalendarClick" />
        <UserSummary v-if="user.id" :photos="photos" :userId="user.id" />
      </div>
    </div>

    <!-- 가운데: 측정 영역 -->
    <div class="card-wrapper">
      <div class="card-inner main">
        <MainPhotos :cameraActive="cameraActive" :bestPhoto="bestPhoto" :worstPhoto="worstPhoto"
          @startCamera="startCamera" @handlePhotoUploaded="handlePhotoUploaded" @openModal="openModal" />
        <button class="summary-btn" @click="showSummaryModal = true">
           자세 분석 요약 보기
        </button>

      </div>
    </div>

    <!--  오른쪽: 사진 목록 -->
    <div class="card-wrapper">
      <div class="card-inner">

        <PhotoList :filteredPhotos="filteredPhotos" :mainPhotoId="null" :selectedPhoto="selectedPhoto"
          :selectedDate="selectedDate" @update:selectedDate="selectedDate = $event" :formatTime="formatTime"
          @showPhoto="showPhoto" @deletePhoto="deletePhoto" />
      </div>
    </div>

    <!--  분석 요약 모달 -->
    <SummaryStatsModal v-if="showSummaryModal" :photos="safePhotos" :visible="showSummaryModal"
      @close="showSummaryModal = false" />

    <!-- 사진 모달 -->
    <PhotoModal v-if="modalPhotoUrl" :photoUrl="modalPhotoUrl" @close="modalPhotoUrl = null" />
  </div>
</template>
<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import API from "@/api"; // axios 인스턴스로 대체

import UserInfo from '../components/user/UserInfo.vue';
import UserSummary from '../components/user/UserSummary.vue';
import PhotoList from '../components/photo/PhotoList.vue';
import PhotoModal from '../components/photo/PhotoModal.vue';
import MainPhotos from '../components/measure/Mainphotos.vue';
import SummaryStats from '../components/report/SummaryStats.vue';
import SummaryCards from '../components/report/SummaryCards.vue';
import SummaryStatsModal from '../components/report/SummaryStatsModal.vue';
import MiniCalendar from '../components/calendar/MiniCalendar.vue';

export default {
  components: {
    UserInfo,
    PhotoList,
    MainPhotos,
    SummaryStats,
    UserSummary,
    PhotoModal,
    SummaryCards,
    SummaryStatsModal,
    MiniCalendar,
  },
  setup() {
    const router = useRouter();
    const user = ref({});
    const photos = ref([]);
    const selectedPhoto = ref(null);
    const selectedDate = ref("");
    const cameraActive = ref(false);
    const modalPhotoUrl = ref(null);
    const bestPhoto = ref(null);
    const worstPhoto = ref(null);
    const bestFrameUrl = ref(null);
    const worstFrameUrl = ref(null);
    const showSummaryModal = ref(false);
    const postureHistory = ref([]);

    const toKoreanDate = (datetime) => {
      const date = new Date(datetime);
      date.setHours(date.getHours() + 9);
      return date.toISOString().split("T")[0];
    };

    const safePhotos = computed(() => Array.isArray(photos.value) ? photos.value : []);

    const calendarStats = computed(() => {
      const map = new Map();
      photos.value.forEach(p => {
        const date = toKoreanDate(p.measured_at || p.uploaded_at);
        const status = (p.average_neck_angle || p.neck_angle) >= 135 ? 'bad' : 'good';
        if (!map.has(date) || map.get(date) !== 'bad') {
          map.set(date, status);
        }
      });
      return Array.from(map.entries()).map(([date, status]) => ({ date, status }));
    });

    const filteredPhotos = computed(() => {
      let list = photos.value;
      if (selectedDate.value) {
        list = list.filter(p => toKoreanDate(p.uploaded_at) === selectedDate.value);
      }
      return list.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    });

    const formatTime = (datetime) => {
      const date = new Date(datetime);
      date.setHours(date.getHours() + 9);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}월 ${date.getDate().toString().padStart(2, '0')}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const email = JSON.parse(atob(token.split(".")[1])).email;
        const res = await API.get("/user/me", { params: { email } });
        if (res.data.success) {
          user.value = res.data.user;
          await fetchPhotos();
          await fetchPostureHistory();
        }
      } catch (err) {
        console.error("❌ 사용자 정보 오류:", err);
      }
    };

    const fetchPhotos = async () => {
      try {
        const res = await API.get("/photos", {
          params: { user_id: user.value.id },
        });
        photos.value = [...res.data];

        const today = toKoreanDate(new Date());
        const sortedPhotos = [...photos.value].sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
        const todayPhotos = sortedPhotos.filter(p => toKoreanDate(p.uploaded_at) === today);

        if (todayPhotos.length > 0) {
          selectedDate.value = today;
          selectedPhoto.value = todayPhotos[todayPhotos.length - 1];
        } else if (sortedPhotos.length > 0) {
          const latestDate = toKoreanDate(sortedPhotos[sortedPhotos.length - 1].uploaded_at);
          const latestPhotos = sortedPhotos.filter(p => toKoreanDate(p.uploaded_at) === latestDate);
          selectedDate.value = latestDate;
          selectedPhoto.value = latestPhotos[latestPhotos.length - 1];
        } else {
          selectedPhoto.value = null;
        }

        bestPhoto.value = photos.value.find(p => p.type === 'best') || null;
        worstPhoto.value = photos.value.find(p => p.type === 'worst') || null;
      } catch (err) {
        console.error("🚨 사진 목록 오류:", err);
      }
    };

    const deletePhoto = async (id) => {
      try {
        const res = await API.delete(`/photos/${id}`);
        if (res.data.success) {
          if (bestPhoto.value?.id === id) bestPhoto.value = null;
          if (worstPhoto.value?.id === id) worstPhoto.value = null;
          if (selectedPhoto.value?.id === id) selectedPhoto.value = null;
          await fetchPhotos();
          setTimeout(async () => {
            await fetchLatestPosture();
          }, 50);
        }
      } catch (err) {
        console.error("🚨 사진 삭제 오류:", err);
      }
    };

    const fetchLatestPosture = async () => {
      try {
        const res = await API.get(`/posture/latest/${user.value.id}`);
        if (res.data.success && res.data.data) {
          const posture = res.data.data;
          const currentIds = photos.value.map(p => p.id);

          bestPhoto.value = currentIds.includes(posture.best_photo_id)
            ? photos.value.find(p => p.id === posture.best_photo_id)
            : null;

          worstPhoto.value = currentIds.includes(posture.worst_photo_id)
            ? photos.value.find(p => p.id === posture.worst_photo_id)
            : null;

          bestFrameUrl.value = bestPhoto.value?.photo_url || null;
          worstFrameUrl.value = worstPhoto.value?.photo_url || null;
        }
      } catch (err) {
        console.error("❌ 최신 자세 결과 오류:", err);
      }
    };

    const handlePhotoUploaded = async () => await fetchPhotos();
    const handleCalendarClick = (date) => selectedDate.value = date;

    const showPhoto = (photo, openModal = true) => {
      selectedPhoto.value = photo;
      if (openModal && photo?.photo_url) {
        modalPhotoUrl.value = `http://210.101.236.158:5000${photo.photo_url}`;
      }
    };

    const deleteAccount = async () => {
      if (confirm("정말 탈퇴하시겠습니까?")) {
        try {
          const res = await API.delete(`/user/delete/${user.value.id}`);
          if (res.data.success) {
            localStorage.removeItem("token");
            router.push("/login");
          }
        } catch {
          alert("탈퇴 중 오류 발생");
        }
      }
    };
    const fetchPostureHistory = async () => {
      try {
        const res = await API.get(`/posture/history`, {
          params: { user_id: user.value.id },
        });
        if (res.data.success) {
          postureHistory.value = res.data.data;
          console.log("📦 자세 이력:", postureHistory.value);
        } else {
          console.warn("⚠️ 자세 이력 없음:", res.data.message);
        }
      } catch (err) {
        console.error("🚨 자세 이력 불러오기 실패:", err);
      }
    };


    const logout = () => {
      localStorage.removeItem("token");
      router.push("/login");
    };

    const startCamera = () => cameraActive.value = true;

    onMounted(async () => {
      await fetchUser();
      selectedDate.value = toKoreanDate(new Date());
    });

    return {
      user,
      photos,
      bestPhoto,
      worstPhoto,
      selectedPhoto,
      modalPhotoUrl,
      showPhoto,
      deletePhoto,
      deleteAccount,
      logout,
      startCamera,
      cameraActive,
      handlePhotoUploaded,
      fetchLatestPosture,
      safePhotos,
      bestFrameUrl,
      worstFrameUrl,
      filteredPhotos,
      showSummaryModal,
      handleCalendarClick,
      formatTime,
      selectedDate,
      calendarStats,
      openModal: (url) => modalPhotoUrl.value = url,
    };
  }
};
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: row;
  /* 세로 → 가로 정렬 */
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  padding: 30px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f9f9f9;
  font-family: 'Segoe UI', sans-serif;
}

/* 카드 공통 스타일 */
.card-wrapper {
  background-color: #eaf4ff;
  padding: 16px;
  border-radius: 24px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  height: auto;
}

/* 왼쪽: 유저 정보 카드 */
.user-card {
  flex: 1;
  max-width: 300px;
}

/* 가운데: 측정 카드 */
.container>.card-wrapper:nth-child(2) {
  flex: 2.5;
  min-width: 600px;
  padding: 24px;
}

/* 오른쪽: 사진 목록 카드 */
.container>.card-wrapper:nth-child(3) {
  flex: 1.5;
  padding: 24px 32px;
  box-sizing: border-box;
}


.summary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #1976d2;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, transform 0.2s;
  margin: 24px auto;

}


.summary-btn:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
}

/* 자세 분석 요약 보기 중앙 배치*/
.card-inner.main {
  text-align: center;
}
</style>