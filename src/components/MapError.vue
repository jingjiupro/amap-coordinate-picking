<template>
  <div class="map-error">
    <div class="error-container">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" fill="currentColor"/>
        </svg>
      </div>
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="actions">
        <button @click="reload" class="reload-btn">重新加载</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MapError',
  props: {
    title: {
      type: String,
      default: '地图加载失败'
    },
    message: {
      type: String,
      default: '无法加载高德地图API，请检查您的网络连接或API密钥配置。'
    }
  },
  setup() {
    const reload = () => {
      window.location.reload();
    };

    return {
      reload
    };
  }
});
</script>

<style scoped>
.map-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f8f9fa;
}

.error-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  max-width: 400px;
}

.error-icon {
  color: #f44336;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.actions {
  margin-top: 1.5rem;
}

.reload-btn {
  background: linear-gradient(45deg, #2196F3, #1976D2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reload-btn:hover {
  background: linear-gradient(45deg, #1976D2, #2196F3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style> 