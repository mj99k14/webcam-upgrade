<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <img :src="photoUrl" alt="사진" />
        <button class="close-btn" @click="$emit('close')">닫기 ✖</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      photoUrl: String
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .modal-content {
    position: relative;
    background: white;
    padding: 10px;
    border-radius: 10px;
  }
  .modal-content img {
    max-width: 90vw;
    max-height: 80vh;
    border-radius: 8px;
  }
  .close-btn {
    position: absolute;
    top: 8px;
    right: 10px;
    background: crimson;
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
  }
  </style>
  