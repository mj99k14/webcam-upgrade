<template>
  <div class="container">
    <div class="user-info-block">
      <UserInfo :user="user" @logout="logout" @deleteAccount="deleteAccount" />
      <UserSummary :photos="photos" />
    </div>

    <MainPhotos
      :cameraActive="cameraActive"
      :bestPhoto="bestPhoto"
      :worstPhoto="worstPhoto"
      @startCamera="startCamera"
      @handlePhotoUploaded="handlePhotoUploaded"
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
    <!-- 📸 선택한 사진 모달 보기 -->
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
import SummaryStats from '../components/SummaryStats.vue';
import UserSummary from '../components/UserSummary.vue';
import PhotoModal from '../components/PhotoModal.vue'; // ✅ 추가!

export default {
  components: {
    UserInfo,
    PhotoList,
    MainPhotos,
    SummaryStats,
    UserSummary
  },
  setup() {
    const router = useRouter();
    const user = ref({});
    const photos = ref([]);
    const selectedPhoto = ref(null);
    const cameraActive = ref(false);
    const selectedDate = ref("");
    const modalPhotoUrl = ref(null);


// ✅ 그리고 나서 watch 설정
    watch(selectedDate, (newDate) => {
      if (!newDate) return;

      const photosForDate = photos.value.filter(photo => {
        const dateOnly = new Date(photo.uploaded_at).toISOString().split("T")[0];
        return dateOnly === newDate;
      });

      const best = photosForDate.find(p => p.type === 'best');
      const worst = photosForDate.find(p => p.type === 'worst');

      selectedPhoto.value = best || worst || photosForDate[0] || null;
    });

    const bestPhoto = ref(null);
    const worstPhoto = ref(null);

    // ✅ 날짜 필터 + 최신순 정렬
    const filteredPhotos = computed(() => {
      let list = photos.value;
      if (selectedDate.value) {
        list = list.filter(photo => {
          const dateOnly = new Date(photo.uploaded_at).toISOString().split("T")[0];
          return dateOnly === selectedDate.value;
        });
      }
      return list.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    });

    const formatTime = (datetime) => {
      const date = new Date(datetime);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}월 ${day}일 ${hours}:${minutes}`;
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const email = decodedToken.email;
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
        photos.value = res.data;

        // 최신 날짜 기준 설정
        const sorted = [...photos.value].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
        const latestDate = sorted[0]?.uploaded_at?.split("T")[0];
        if (latestDate) {
          selectedDate.value = latestDate;

          // ✅ 최신 날짜 중 첫 번째 사진을 자동 선택
          const latestPhotos = sorted.filter(p => p.uploaded_at.split('T')[0] === latestDate);
          selectedPhoto.value = latestPhotos[0] || null;
        }
      } catch (err) {
        console.error("🚨 사진 목록 오류:", err);
      }
    };


    const handlePhotoUploaded = () => {
      fetchPhotos();
    };

    const deletePhoto = async (id) => {
      try {
        const res = await axios.delete(`http://210.101.236.158:5000/api/photos/${id}`);
        if (res.data.success) {
          alert("사진이 삭제되었습니다.");
          if (selectedPhoto.value && selectedPhoto.value.id === id) {
            selectedPhoto.value = null;
          }
          fetchPhotos();
        }
      } catch (err) {
        console.error("🚨 사진 삭제 오류:", err);
      }
    };

    const showPhoto = (photo) => {
      selectedPhoto.value = photo;
      // 모달도 함께 열기
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

    const startCamera = () => {
      cameraActive.value = true;
    };

    onMounted(fetchUser);

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
