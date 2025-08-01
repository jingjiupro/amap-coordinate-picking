import type { MapConfig } from '../types/map';

// 高德地图配置
export const MAP_CONFIG: MapConfig = {
  // 请在此处填入您的高德地图API密钥
  // 获取地址：https://lbs.amap.com/
  // 
  // 重要提示：
  // 1. 请确保使用 "Web端(JS API)" 类型的密钥，不是移动端密钥
  // 2. 在高德开放平台的应用管理中，需要配置正确的域名白名单
  // 3. 本地开发时，请添加 localhost 和 127.0.0.1 到白名单
  // 4. 如果部署到服务器，请添加您的域名到白名单
  //
  // 如果遇到 USERKEY_PLAT_NOMATCH 错误，请检查：
  // - 密钥类型是否正确（必须是Web端JS API）
  // - 域名白名单是否包含当前访问域名
  // - 密钥是否有效且未过期
  API_KEY: 'Your API Key',
  securityJsCode: 'Your Security JS Code',
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