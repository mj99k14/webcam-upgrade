<template>
    <li :key="photo.id" style="display: flex; align-items: center; margin-bottom: 10px;">
      <img
        :src="`http://210.101.236.158:5000${photo.photo_url}`"
        alt="썸네일"
        style="width: 80px; height: auto; margin-right: 10px; cursor: pointer;"
        @click="$emit('showPhoto', photo)"
      />
      <div style="flex: 1; text-align: left;">
        <span @click="$emit('showPhoto', photo)" style="cursor: pointer;">
          {{ formatTime(photo.uploaded_at) }}
        </span>
        <div v-if="photo.neck_angle !== null || photo.shoulder_angle !== null" style="font-size: 12px; color: #666;">
          <div v-if="photo.neck_angle !== null">거북목 각도: {{ photo.neck_angle }}°</div>
          <div v-if="photo.shoulder_angle !== null">어깨 기울기: {{ photo.shoulder_angle }}°</div>
        </div>
      </div>
      <button v-if="photo.id !== mainPhotoId" @click="$emit('deletePhoto', photo.id)">삭제</button>
    </li>
  </template>
  
  <script>
  export default { 
    name: 'PhotoItem',
    props: {
      photo: Object,
      mainPhotoId: Number,
    },
    emits: ['showPhoto', 'deletePhoto'], // ✅ 이벤트 이름 등록
    methods: {
      formatTime(datetime) {
        const date = new Date(datetime);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month}월 ${day}일 ${hours}:${minutes}`;
      }
    }
  };
  </script>
  