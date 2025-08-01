<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MapDrawer from './components/MapDrawer.vue';
import MapError from './components/MapError.vue';

const isMapLoaded = ref(false);
const hasMapError = ref(false);
const errorMessage = ref('');

// 检查地图API是否加载成功
onMounted(() => {
  // 给一个合理的时间等待地图加载
  setTimeout(() => {
    if (window.AMap) {
      isMapLoaded.value = true;
    } else {
      hasMapError.value = true;
      errorMessage.value = '无法加载高德地图API，请检查您的网络连接或API密钥配置。';
    }
  }, 2000);
});
</script>

<template>
  <MapDrawer v-if="isMapLoaded" />
  <MapError 
    v-if="hasMapError" 
    :message="errorMessage" 
  />
  <div v-if="!isMapLoaded && !hasMapError" class="loading">
    <div class="spinner"></div>
    <p>正在加载地图...</p>
  </div>
</template>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

#app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  max-width: none;
}

/* 加载动画 */
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f8f9fa;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  font-size: 18px;
  color: #666;
}
</style>
