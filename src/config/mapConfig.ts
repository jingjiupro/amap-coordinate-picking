import type { MapConfig } from '../types/map';

// 高德地图配置
export const MAP_CONFIG: MapConfig = {
  // 请在此处填入您的高德地图API密钥
  // 获取地址：https://lbs.amap.com/
  API_KEY: 'YOUR_API_KEY',
  
  // 地图初始配置
  MAP_OPTIONS: {
    zoom: 13,
    center: [116.397428, 39.90923], // 北京天安门
    mapStyle: 'amap://styles/normal'
  },
  
  // 绘制样式配置
  DRAW_STYLES: {
    polygon: {
      strokeColor: '#FF0000',
      strokeWeight: 3,
      fillColor: '#FF0000',
      fillOpacity: 0.2
    },
    rectangle: {
      strokeColor: '#00FF00',
      strokeWeight: 3,
      fillColor: '#00FF00',
      fillOpacity: 0.2
    },
    circle: {
      strokeColor: '#0000FF',
      strokeWeight: 3,
      fillColor: '#0000FF',
      fillOpacity: 0.2
    },
    temp: {
      strokeStyle: 'dashed',
      fillOpacity: 0.3
    }
  },
  
  // 圆形绘制精度（点的数量）
  CIRCLE_SEGMENTS: 32,
  
  // 临时标记点大小
  MARKER_SIZE: 10
}; 