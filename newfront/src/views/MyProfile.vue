<template>
  <div class="container">
    <div class="user-info-block">
      <UserInfo
        :user="user"
        :calendarStats="calendarStats"
        @logout="logout"
        @deleteAccount="deleteAccount"
      />
      <UserSummary :photos="photos" />
    </div>

    <MainPhotos
      :cameraActive="cameraActive"
      :bestPhoto="bestPhoto"
      :worstPhoto="worstPhoto"
      @startCamera="startCamera"
      @handlePhotoUploaded="handlePhotoUploaded"
      @openModal="openModal"
    />

    <div class="photo-list-section">
      <PhotoList
        :filteredPhotos="filteredPhotos"
        :mainPhotoId="null"
        :selectedPhoto="selectedPhoto"
        v-model:selectedDate="selectedDate"
        :formatTime="formatTime"
        @showPhoto="showPhoto"
        @deletePhoto="deletePhoto"
      />
    </div>

    <div class="full-width">
      <SummaryStats :photos="photos" />
    </div>

    <PhotoModal v-if="modalPhotoUrl" :photoUrl="modalPhotoUrl" @close="modalPhotoUrl = null" />
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import UserInfo from '../components/UserInfo.vue';
import PhotoList from '../components/PhotoList.vue';
import MainPhotos from '../components/Mainphotos.vue';
import SummaryStats from '../components/summary/SummaryStats.vue';
import UserSummary from '../components/UserSummary.vue';
import PhotoModal from '../components/PhotoModal.vue';
import MiniCalendar from '../components/MiniCalendar.vue';

export default {
  components: {
    UserInfo,
    PhotoList,
    MainPhotos,
    SummaryStats,
    UserSummary,
    PhotoModal,
    MiniCalendar
  },
  setup() {
    const router = useRouter();
    const user = ref({});
    const photos = ref([]);
    const selectedPhoto = ref(null);
    const cameraActive = ref(false);
    const selectedDate = ref("");
    const modalPhotoUrl = ref(null);
    const bestPhoto = ref(null);
    const worstPhoto = ref(null);

    const openModal = (url) => modalPhotoUrl.value = url;

    const toKoreanDate = (datetime) => {
      const date = new Date(datetime);
      date.setHours(date.getHours() + 9);
      return date.toISOString().split("T")[0];
    };

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
        const todayPhotos = photos.value.filter(p => toKoreanDate(p.uploaded_at) === today);

        if (todayPhotos.length > 0) {
          selectedDate.value = today;
          selectedPhoto.value = todayPhotos.find(p => p.type === 'best') || todayPhotos.find(p => p.type === 'worst') || todayPhotos[0] || null;
        } else {
          const sorted = [...photos.value].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
          const latestDate = toKoreanDate(sorted[0]?.uploaded_at);
          if (latestDate) {
            selectedDate.value = latestDate;
            const latestPhotos = sorted.filter(p => toKoreanDate(p.uploaded_at) === latestDate);
            selectedPhoto.value = latestPhotos[0] || null;
          }
        }

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
          if (bestPhoto.value?.id === id) bestPhoto.value = null;
          if (worstPhoto.value?.id === id) worstPhoto.value = null;
          if (selectedPhoto.value?.id === id) selectedPhoto.value = null;
          await fetchPhotos();
        }
      } catch (err) {
        console.error("🚨 사진 삭제 오류:", err);
      }
    };

    const showPhoto = (photo) => {
      selectedPhoto.value = photo;
      if (photo?.photo_url) {
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
      calendarStats
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

.container > * {
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.user-info-block {
  max-width: 280px;
  flex: none;
  background-color: #e6f2ff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.container > :nth-child(2) {
  flex: 2;
  background-color: #fffbea;
}

.container > :nth-child(3) {
  flex: 2;
  background-color: #ffffff;
}

.container > .full-width {
  flex-basis: 100%;
  width: 100%;
  background-color: #f4fff4;
  border: 1px solid #bde5bd;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
}

.container h2, .container h3 {
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 6px;
  margin-bottom: 12px;
  font-weight: 600;
}

@media (max-width: 1000px) {
  .container {
    flex-direction: column;
  }
  .container > * {
    max-width: 100%;
  }
}

.photo-list-section {
  flex: 2;
  min-width: 380px;
}

.full-width {
  flex-basis: 100%;
  width: 100%;
  margin-top: 20px;
  background-color: #f4fff4;
  border: 1px solid #bde5bd;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}


</style>