// 高德地图配置类型
export interface MapConfig {
  API_KEY: string;
  MAP_OPTIONS: {
    zoom: number;
    center: [number, number];
    mapStyle: string;
  };
  DRAW_STYLES: {
    polygon: {
      strokeColor: string;
      strokeWeight: number;
      fillColor: string;
      fillOpacity: number;
    };
    rectangle: {
      strokeColor: string;
      strokeWeight: number;
      fillColor: string;
      fillOpacity: number;
    };
    circle: {
      strokeColor: string;
      strokeWeight: number;
      fillColor: string;
      fillOpacity: number;
    };
    temp: {
      strokeStyle: string;
      fillOpacity: number;
    };
  };
  CIRCLE_SEGMENTS: number;
  MARKER_SIZE: number;
}

// 坐标点类型
export interface Coordinate {
  lng: number;
  lat: number;
}

// 绘制图形类型
export type DrawMode = 'polygon' | 'rectangle' | 'circle' | null;

// 绘制图形数据类型
export interface ShapeData {
  type: string;
  points: any[]; // AMap.LngLat[] 类型
  coordinates: Coordinate[];
}

// 绘制图形对象类型
export interface DrawnShape {
  shape: any; // AMap.Polygon | AMap.Rectangle | AMap.Circle
  data: ShapeData;
}

// 导出数据类型
export interface ExportData {
  timestamp: string;
  type: string;
  shapes?: ShapeData[];
  points?: {
    index: number;
    longitude: number;
    latitude: number;
    coordinates: [number, number];
  }[];
} 