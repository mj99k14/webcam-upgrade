<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
</script>

<!-- ❌ scoped 제거 (중요) -->
<style>
/* ✅ 바깥 흰색 제거하고 파란 배경으로 전체 감싸기 */
body, #app {
  background-color: #eaf4ff;
  margin: 0;
  padding: 0;
}
</style>
