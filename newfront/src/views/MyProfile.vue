<template>
  <div class="container">
    <!-- ✅ 왼쪽: 유저 정보 -->
    <div class="card-wrapper user-card">
      <div class="card-inner">
        <UserInfo
          :user="user"
          :calendarStats="calendarStats"
          @logout="logout"
          @deleteAccount="deleteAccount"
        />
        <MiniCalendar
          :selectedDate="selectedDate"
          :stats="calendarStats" 
          @dateSelected="handleCalendarClick"
        />
       <UserSummary v-if="user.id":photos="photos":userId="user.id"/>
      </div>
    </div>

    <!-- ✅ 가운데: 측정 영역 -->
    <div class="card-wrapper">
      <div class="card-inner main">
        <MainPhotos
          :cameraActive="cameraActive"
          :bestPhoto="bestPhoto"
          :worstPhoto="worstPhoto"
          @startCamera="startCamera"
          @handlePhotoUploaded="handlePhotoUploaded"
          @openModal="openModal"
        />
        <button class="summary-btn" @click="showSummaryModal = true">
          📊 자세 분석 요약 보기
        </button>

      </div>
    </div>

    <!-- ✅ 오른쪽: 사진 목록 -->
    <div class="card-wrapper">
      <div class="card-inner">
      
        <PhotoList
        :filteredPhotos="filteredPhotos"
        :mainPhotoId="null"
        :selectedPhoto="selectedPhoto"
        :selectedDate="selectedDate" 
        @update:selectedDate="selectedDate = $event" 
        :formatTime="formatTime"
        @showPhoto="showPhoto"
        @deletePhoto="deletePhoto"
      />
      </div>
    </div>

    <!-- ✅ 분석 요약 모달 -->
    <SummaryStatsModal
      v-if="showSummaryModal"
      :photos="safePhotos"
      :visible="showSummaryModal"
      @close="showSummaryModal = false"
    />

    <!-- ✅ 사진 모달 -->
    <PhotoModal
      v-if="modalPhotoUrl"
      :photoUrl="modalPhotoUrl"
      @close="modalPhotoUrl = null"
    />
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";

// 🔹 컴포넌트 임포트
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
  props: {
  photos: {
    type: Array,
    required: false,
    default: () => []
  }
},
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
  setup(props) {
    const router = useRouter();
    const user = ref({});
    const selectedPhoto = ref(null);
    const cameraActive = ref(false);
    const selectedDate = ref("");
    const modalPhotoUrl = ref(null);
    const bestPhoto = ref(null);
    const worstPhoto = ref(null);
    const bestFrameUrl = ref(null);
    const worstFrameUrl = ref(null);
    const showSummaryModal = ref(false);


    // ✅ props.photos를 computed로 래핑
    const photos = ref([]);


    const openModal = (url) => modalPhotoUrl.value = url;

    const toKoreanDate = (datetime) => {
      const date = new Date(datetime);
      date.setHours(date.getHours() + 9);
      return date.toISOString().split("T")[0];
    };
    const safePhotos = computed(() => Array.isArray(photos.value) ? photos.value : []);


    const calendarStats = computed(() =>
      photos.value.map(p => ({
        date: toKoreanDate(p.measured_at || p.uploaded_at),
        status: (p.average_neck_angle || p.neck_angle) >= 135 ? 'bad' : 'good'
      }))
    );

    watch(selectedDate, (newDate) => {
      if (!newDate) return;
      const photosForDate = photos.value.filter(p => toKoreanDate(p.uploaded_at) === newDate);
      selectedPhoto.value = photosForDate.find(p => p.type === 'best') || photosForDate.find(p => p.type === 'worst') || photosForDate[0] || null;
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
        const res = await axios.get(`http://210.101.236.158:5000/api/user/me?email=${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          user.value = res.data.user;
          await fetchPhotos();
        }
      } catch (err) {
        console.error("❌ 사용자 정보 오류:", err);
      }
    };

    const fetchPhotos = async () => {
    if (!user.value.id) return;

    try {
      const res = await axios.get(`http://210.101.236.158:5000/api/photos?user_id=${user.value.id}`);
      photos.value = [...res.data];

      const today = toKoreanDate(new Date());

      // 📌 날짜별 그룹화
      const sortedPhotos = [...photos.value].sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
      const todayPhotos = sortedPhotos.filter(p => toKoreanDate(p.uploaded_at) === today);

      if (todayPhotos.length > 0) {
        selectedDate.value = today;
        selectedPhoto.value = todayPhotos[todayPhotos.length - 1]; // ✅ 오늘 마지막 사진
      } else if (sortedPhotos.length > 0) {
        const latestDate = toKoreanDate(sortedPhotos[sortedPhotos.length - 1].uploaded_at);
        const latestPhotos = sortedPhotos.filter(p => toKoreanDate(p.uploaded_at) === latestDate);

        selectedDate.value = latestDate;
        selectedPhoto.value = latestPhotos[latestPhotos.length - 1]; // ✅ 최신 날짜 마지막 사진
      } else {
        selectedPhoto.value = null;
      }

      // 📌 best / worst 사진 설정
      bestPhoto.value = photos.value.find(p => p.type === 'best') || null;
      worstPhoto.value = photos.value.find(p => p.type === 'worst') || null;

    } catch (err) {
      console.error("🚨 사진 목록 오류:", err);
    }
  };


    const handlePhotoUploaded = async () => {
      await fetchPhotos();
    };

    const deletePhoto = async (id) => {
      try {
        const res = await axios.delete(`http://210.101.236.158:5000/api/photos/${id}`);
        if (res.data.success) {
          // ✅ 우선 로컬 상태 초기화
          if (bestPhoto.value?.id === id) bestPhoto.value = null;
          if (worstPhoto.value?.id === id) worstPhoto.value = null;
          if (selectedPhoto.value?.id === id) selectedPhoto.value = null;

          // ✅ 사진 목록 완전히 반영된 후 fetchLatestPosture 실행
          await fetchPhotos(); // 먼저 갱신하고

          // ⏱️ 살짝 텀 두고 실행 (Vue 반응성 보장용)
          setTimeout(async () => {
            await fetchLatestPosture();

            const remainingIds = photos.value.map(p => p.id);
            if (!remainingIds.includes(bestPhoto.value?.id)) bestPhoto.value = null;
            if (!remainingIds.includes(worstPhoto.value?.id)) worstPhoto.value = null;
          }, 50);
        }
      } catch (err) {
        console.error("🚨 사진 삭제 오류:", err);
      }
    };

    const fetchLatestPosture = async () => {
      try {
        const res = await axios.get(`http://210.101.236.158:5000/api/posture/latest?user_id=${user.value.id}`);

        if (res.data.success && res.data.data) {
          const posture = res.data.data;
          const currentIds = photos.value.map(p => p.id);

          bestPhoto.value = currentIds.includes(posture.best_photo_id)
            ? photos.value.find(p => p.id === posture.best_photo_id)
            : null;

          worstPhoto.value = currentIds.includes(posture.worst_photo_id)
            ? photos.value.find(p => p.id === posture.worst_photo_id)
            : null;

          // ✅ 여기 꼭 추가해야 해!!
          bestFrameUrl.value = bestPhoto.value ? bestPhoto.value.photo_url : null;
          worstFrameUrl.value = worstPhoto.value ? worstPhoto.value.photo_url : null;
        } else {
          bestPhoto.value = null;
          worstPhoto.value = null;
          bestFrameUrl.value = null;
          worstFrameUrl.value = null;
        }
      } catch (err) {
        console.error("❌ 최신 자세 결과 불러오기 실패", err);
        bestPhoto.value = null;
        worstPhoto.value = null;
        bestFrameUrl.value = null;
        worstFrameUrl.value = null;
      }
    };

    const handleCalendarClick = (date) => {
      selectedDate.value = date;
    };

      
  const showPhoto = (photo, openModal = true) => {
    selectedPhoto.value = photo;
    if (openModal && photo?.photo_url) {
      modalPhotoUrl.value = `http://210.101.236.158:5000${photo.photo_url}`;
    }
  };


  const deleteAccount = async () => {
    if (confirm("정말 회원 탈퇴를 진행하시겠습니까?")) {
      try {
        const res = await axios.delete(`http://210.101.236.158:5000/api/user/delete/${user.value.id}`);
        if (res.data.success) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch {
        alert("회원 탈퇴 중 오류 발생");
      }
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
  safePhotos,
  bestPhoto,
  worstPhoto,
  selectedPhoto,
  deletePhoto,
  showPhoto,
  deleteAccount,
  logout,
  startCamera,
  cameraActive,
  handlePhotoUploaded,
  formatTime,
  selectedDate,
  filteredPhotos,
  modalPhotoUrl,
  openModal,
  calendarStats,
  fetchLatestPosture,
  bestFrameUrl,
  worstFrameUrl,
  showSummaryModal,
  handleCalendarClick,
};


  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  padding: 30px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f9f9f9;
  font-family: 'Segoe UI', sans-serif;
}

.card-wrapper {
  background-color: #eaf4ff;
  padding: 16px;
  border-radius: 24px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.02);
  flex: 1;
  max-width: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}

.card-inner.main {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.user-card {
  flex: none;
  max-width: 280px;
}

.container > .card-wrapper:nth-child(2) {
  flex: 2.5;
  min-height: 1000px;
  display: flex;
  flex-direction: column;
}

.container > .card-wrapper:nth-child(3) {
  flex: 1.2;
  padding: 24px 32px;
  box-sizing: border-box;
}


.container h2,
.container h3 {
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 6px;
  margin-bottom: 12px;
  font-weight: 600;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1976d2;
  display: inline-block;
  border-bottom: 3px solid #42a5f5;
  padding-bottom: 4px;
  margin-bottom: 20px;
}

.emoji {
  margin-right: 8px;
}
</style>

<style>
.section-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  color: #1976d2;
  border-bottom: 3px solid #42a5f5;
  padding-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.section-title .emoji {
  font-size: 24px;
  margin-bottom: 2px;
}
/* ✅ 파란 배경 박스 */
.summary-wrapper {
  width: 100%;
  background-color: #eaf4ff;
  padding: 48px 24px;
  box-sizing: border-box;
}

/* ✅ 흰색 안쪽 박스 */
.inner-white-card {
  max-width: 1800px;       /* ✅ 넓게 확장 */
  margin: 0 auto;
  padding: 40px 48px;
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.summary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  margin-top: 16px;
  border: none;
  border-radius: 8px;
  background-color: #1976d2; /* 파란색 배경 */
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.summary-btn:hover {
  background-color: #1565c0; /* hover 시 더 진한 파랑 */
  transform: translateY(-2px);
}

</style>