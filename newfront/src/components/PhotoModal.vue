<template>
  <div class="modal" @click="$emit('close')">
    <img :src="photoUrl" class="modal-image" />
  </div>
</template>
<script>
export default { props: ['photoUrl'] };
</script>
<style scoped>
.modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}
.modal-image {
  max-width: 90%; max-height: 90%; border-radius: 10px;
}
</style>