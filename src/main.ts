import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { MAP_CONFIG } from './config/mapConfig'

// 声明全局类型
declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string;
    };
  }
}

// 设置高德地图安全密钥
const setAMapSecurity = () => {
  window._AMapSecurityConfig = {
    securityJsCode: MAP_CONFIG.securityJsCode,
  };
}

// 创建高德地图API加载脚本
const loadAMapScript = () => {
  return new Promise<void>((resolve, reject) => {
    // 先设置安全配置
    setAMapSecurity();
    
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${MAP_CONFIG.API_KEY}&plugin=AMap.PlaceSearch`
    
    script.onerror = reject
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

// 加载地图API后再挂载应用
loadAMapScript()
  .then(() => {
    createApp(App).mount('#app')
    console.log('高德地图API加载成功')
  })
  .catch(error => {
    console.error('高德地图API加载失败:', error)
    // 即使API加载失败也挂载应用，以便显示错误信息
    createApp(App).mount('#app')
  })
