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
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import UserInfo from '../components/UserInfo.vue';
import PhotoList from '../components/PhotoList.vue';
import MainPhotos from '../components/Mainphotos.vue';
import SummaryStats from '../components/SummaryStats.vue';
import UserSummary from '../components/UserSummary.vue';

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
    const bestPhoto = ref(null);
    const worstPhoto = ref(null);

    const filteredPhotos = computed(() => {
      if (!selectedDate.value) return photos.value;
      return photos.value.filter(photo => {
        const dateOnly = new Date(photo.uploaded_at).toISOString().split("T")[0];
        return dateOnly === selectedDate.value;
      });
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
      } catch (err) {
        console.error("🚨 사진 목록 오류:", err);
      }
    };

    const handlePhotoUploaded = () => {
      fetchPhotos();
    };

    const handleMeasurementFinished = async (frames) => {
      const formData = new FormData();
      const userId = user.value?.id;
      if (!userId) return;

      frames.forEach((dataUrl, index) => {
        const byteString = atob(dataUrl.split(',')[1]);
        const mime = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mime });
        formData.append("photos", blob, `frame_${index}.jpg`);
      });
      formData.append("user_id", userId);

      try {
        const res = await axios.post("http://210.101.236.158:5000/api/photos/batch", formData);
        if (res.data.success) {
          await fetchPhotos();
          bestPhoto.value = res.data.bestPhoto;
          worstPhoto.value = res.data.worstPhoto;
        }
      } catch (err) {
        console.error("❌ 업로드 오류:", err);
      }
    };

    const deletePhoto = async (id) => {
      try {
        const res = await axios.delete(`http://210.101.236.158:5000/api/photos/${id}`);
        if (res.data.success) {
          alert("사진이 삭제되었습니다.");
          fetchPhotos();
        }
      } catch (err) {
        console.error("🚨 사진 삭제 오류:", err);
      }
    };

    const showPhoto = (photo) => {
      selectedPhoto.value = photo;
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
      handleMeasurementFinished,
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

.photo-list-section {
  flex: 2;
  min-width: 380px;
}

.user-stats {
  margin-top: 20px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  background-color: #f8fbff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddeeff;
}
.user-stats hr {
  margin-bottom: 12px;
  border: none;
  border-top: 1px solid #ccc;
}
</style>
