<template>
  <div class="container">
    <div class="sidebar">
      <h2>地图绘制工具</h2>
      <div class="control-panel">
        <h3>绘制模式</h3>
        <button id="drawPolygon" class="btn btn-primary" :class="{ active: currentDrawMode === 'polygon' }" @click="setDrawMode('polygon')">绘制多边形</button>
        <button id="drawRectangle" class="btn btn-primary" :class="{ active: currentDrawMode === 'rectangle' }" @click="setDrawMode('rectangle')">绘制矩形</button>
        <button id="drawCircle" class="btn btn-primary" :class="{ active: currentDrawMode === 'circle' }" @click="setDrawMode('circle')">绘制圆形</button>
        <button id="finishDrawing" class="btn btn-warning" @click="finishDrawing">完成绘制</button>
        <button id="clearAll" class="btn btn-danger" @click="clearAllShapes">清除所有</button>
        
        <h3>坐标获取</h3>
        <button id="getClickCoordinates" class="btn btn-warning" :class="{ active: clickMode }" @click="toggleClickMode">{{ clickMode ? '退出点击模式' : '点击获取坐标' }}</button>
        <button id="clearClickPoints" class="btn btn-secondary" @click="clearClickPoints">清除点击点</button>
        <button id="exportClickData" class="btn btn-secondary" @click="exportClickData">导出点击数据</button>
        
        <h3>操作</h3>
        <button id="getCoordinates" class="btn btn-success" @click="getDrawCoordinates">获取绘制坐标</button>
        <button id="exportData" class="btn btn-info" @click="exportDrawData">导出绘制数据</button>
      </div>
      
      <div class="coordinates-panel">
        <h3>点击坐标列表</h3>
        <div id="clickCoordinatesDisplay" class="coordinates-display">
          <p v-if="clickPoints.length === 0">点击"点击获取坐标"按钮，然后在地图上点击获取坐标</p>
          <div v-else v-for="(point, index) in clickPoints" :key="index" class="coordinate-item">
            <strong>点 {{ index + 1 }}</strong><br>
            经度: {{ point.lng.toFixed(6) }}<br>
            纬度: {{ point.lat.toFixed(6) }}
          </div>
        </div>
        
        <h3>绘制图形坐标</h3>
        <div id="coordinatesDisplay" class="coordinates-display">
          <p v-if="!coordinatesDisplayHtml">点击"获取绘制坐标"按钮查看绘制图形的坐标信息</p>
          <div v-else v-html="coordinatesDisplayHtml"></div>
        </div>
      </div>
    </div>
    
    <div class="map-container">
      <AddressSearch @location-selected="handleLocationSelected" />
      <div id="map" class="map"></div>
      <div class="map-info">
        <p>提示：选择绘制模式后在地图上点击来绘制图形，或选择点击获取坐标模式</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';
import { MAP_CONFIG } from '../config/mapConfig';
import type { DrawMode, Coordinate, DrawnShape, ShapeData } from '../types/map';
import AddressSearch from './AddressSearch.vue';

// 声明AMap全局变量
declare global {
  interface Window {
    AMap: any;
  }
}

export default defineComponent({
  name: 'MapDrawer',
  components: {
    AddressSearch
  },
  setup() {
    // 状态变量
    const map = ref<any>(null);
    const currentDrawMode = ref<DrawMode>(null);
    const drawnShapes = ref<DrawnShape[]>([]);
    const isDrawing = ref(false);
    const tempPoints = ref<any[]>([]);
    const tempShape = ref<any>(null);
    const tempMarkers = ref<any[]>([]);
    const clickMode = ref(false);
    const clickPoints = ref<any[]>([]);
    const clickMarkers = ref<any[]>([]);
    const coordinatesDisplayHtml = ref<string>('');

    // 初始化地图
    const initMap = () => {
      map.value = new window.AMap.Map('map', {
        zoom: MAP_CONFIG.MAP_OPTIONS.zoom,
        center: MAP_CONFIG.MAP_OPTIONS.center,
        mapStyle: MAP_CONFIG.MAP_OPTIONS.mapStyle
      });

      // 正确加载控件（适配高德2.x）
      map.value.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.ControlBar'], () => {
        map.value.addControl(new window.AMap.ToolBar());
        map.value.addControl(new window.AMap.Scale());
        map.value.addControl(new window.AMap.ControlBar());
      });

      console.log('地图初始化完成');

      // 地图点击事件
      map.value.on('click', (e: any) => {
        console.log('地图被点击', e.lnglat);
        handleMapClick(e);
      });
    };

    // 处理位置选择（从地址搜索组件）
    const handleLocationSelected = (location: { lng: number; lat: number }) => {
      if (!map.value) return;
      
      // 平滑移动到选择的位置
      map.value.setZoomAndCenter(16, [location.lng, location.lat], false, 800);
      
      // 添加临时标记
      const marker = new window.AMap.Marker({
        position: [location.lng, location.lat],
        animation: 'AMAP_ANIMATION_DROP',
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(25, 34),
          imageSize: new window.AMap.Size(25, 34),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
        })
      });
      
      map.value.add(marker);
      
      // 3秒后移除标记
      setTimeout(() => {
        map.value.remove(marker);
      }, 3000);
    };

    // 切换点击获取坐标模式
    const toggleClickMode = () => {
      clickMode.value = !clickMode.value;

      if (clickMode.value) {
        // 退出绘制模式
        clearDrawMode();
        console.log('进入点击获取坐标模式');
      } else {
        console.log('退出点击获取坐标模式');
      }
    };

    // 清除绘制模式
    const clearDrawMode = () => {
      clearTempShape();
      currentDrawMode.value = null;
      isDrawing.value = false;
      tempPoints.value = [];
    };

    // 设置绘制模式
    const setDrawMode = (mode: DrawMode) => {
      // 退出点击模式
      clickMode.value = false;

      // 清除之前的绘制状态
      clearTempShape();
      isDrawing.value = false;
      tempPoints.value = [];

      currentDrawMode.value = mode;

      console.log(`切换到${mode}绘制模式`);
    };

    // 处理地图点击
    const handleMapClick = (e: any) => {
      const point = e.lnglat;

      if (clickMode.value) {
        // 点击获取坐标模式
        addClickPoint(point);
      } else if (currentDrawMode.value) {
        // 绘制模式
        tempPoints.value.push(point);

        if (currentDrawMode.value === 'polygon') {
          drawPolygon(point);
        } else if (currentDrawMode.value === 'rectangle') {
          drawRectangle(point);
        } else if (currentDrawMode.value === 'circle') {
          drawCircle(point);
        }
      } else {
        alert('请先选择绘制模式或点击获取坐标模式！');
      }
    };

    // 添加点击点
    const addClickPoint = (point: any) => {
      clickPoints.value.push(point);

      // 创建标记
      const marker = new window.AMap.Marker({
        position: point,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(12, 12),
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjYiIGZpbGw9IiNGRjk4MDAiLz4KPC9zdmc+',
          imageSize: new window.AMap.Size(12, 12)
        })
      });

      map.value.add(marker);
      clickMarkers.value.push(marker);

      console.log(`添加点击点 ${clickPoints.value.length}:`, point);
    };

    // 清除点击点
    const clearClickPoints = () => {
      clickMarkers.value.forEach(marker => {
        map.value.remove(marker);
      });
      clickMarkers.value = [];
      clickPoints.value = [];
      console.log('清除所有点击点');
    };

    // 导出点击数据
    const exportClickData = () => {
      if (clickPoints.value.length === 0) {
        alert('请先点击获取坐标！');
        return;
      }

      const exportData = {
        timestamp: new Date().toISOString(),
        type: 'click_points',
        points: clickPoints.value.map((point, index) => ({
          index: index + 1,
          longitude: point.lng,
          latitude: point.lat,
          coordinates: [point.lng, point.lat]
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `click_points_${new Date().getTime()}.json`;
      link.click();

      console.log('点击数据已导出：', exportData);
    };

    // 绘制多边形
    const drawPolygon = (point: any) => {
      if (tempPoints.value.length === 1) {
        // 第一个点，创建多边形
        tempShape.value = new window.AMap.Polygon({
          path: tempPoints.value,
          strokeColor: MAP_CONFIG.DRAW_STYLES.polygon.strokeColor,
          strokeWeight: MAP_CONFIG.DRAW_STYLES.polygon.strokeWeight,
          fillColor: MAP_CONFIG.DRAW_STYLES.polygon.fillColor,
          fillOpacity: MAP_CONFIG.DRAW_STYLES.temp.fillOpacity,
          strokeStyle: MAP_CONFIG.DRAW_STYLES.temp.strokeStyle,
          bubble: true,        // 允许事件冒泡
          clickable: false     // 不拦截点击
        });
        map.value.add(tempShape.value);
      } else {
        // 更新多边形路径
        tempShape.value.setPath(tempPoints.value);
      }

      // 添加临时标记点
      addTempMarker(point);
    };

    // 绘制矩形
    const drawRectangle = (point: any) => {
      if (tempPoints.value.length === 1) {
        // 第一个点，创建矩形
        tempShape.value = new window.AMap.Rectangle({
          bounds: new window.AMap.Bounds(point, point),
          strokeColor: MAP_CONFIG.DRAW_STYLES.rectangle.strokeColor,
          strokeWeight: MAP_CONFIG.DRAW_STYLES.rectangle.strokeWeight,
          fillColor: MAP_CONFIG.DRAW_STYLES.rectangle.fillColor,
          fillOpacity: MAP_CONFIG.DRAW_STYLES.temp.fillOpacity,
          strokeStyle: MAP_CONFIG.DRAW_STYLES.temp.strokeStyle
        });
        map.value.add(tempShape.value);
      } else if (tempPoints.value.length === 2) {
        // 第二个点，完成矩形
        const bounds = new window.AMap.Bounds(tempPoints.value[0], tempPoints.value[1]);
        tempShape.value.setBounds(bounds);
        finishDrawing();
      }

      // 添加临时标记点
      addTempMarker(point);
    };

    // 绘制圆形
    const drawCircle = (point: any) => {
      if (tempPoints.value.length === 1) {
        // 第一个点，创建圆形
        tempShape.value = new window.AMap.Circle({
          center: point,
          radius: 0,
          strokeColor: MAP_CONFIG.DRAW_STYLES.circle.strokeColor,
          strokeWeight: MAP_CONFIG.DRAW_STYLES.circle.strokeWeight,
          fillColor: MAP_CONFIG.DRAW_STYLES.circle.fillColor,
          fillOpacity: MAP_CONFIG.DRAW_STYLES.temp.fillOpacity,
          strokeStyle: MAP_CONFIG.DRAW_STYLES.temp.strokeStyle
        });
        map.value.add(tempShape.value);
      } else if (tempPoints.value.length === 2) {
        // 第二个点，计算半径并完成圆形
        const radius = tempPoints.value[0].distance(tempPoints.value[1]);
        tempShape.value.setRadius(radius);
        finishDrawing();
      }

      // 添加临时标记点
      addTempMarker(point);
    };

    // 添加临时标记点
    const addTempMarker = (point: any) => {
      const marker = new window.AMap.Marker({
        position: point,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(10, 10),
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjUiIGZpbGw9IiNGRjAwMDAiLz4KPC9zdmc+',
          imageSize: new window.AMap.Size(10, 10)
        })
      });
      map.value.add(marker);
      tempMarkers.value.push(marker);
    };

    // 完成绘制
    const finishDrawing = () => {
      if (!tempShape.value || tempPoints.value.length < 2) {
        return;
      }

      // 创建最终的图形
      let finalShape;
      const shapeData: ShapeData = {
        type: currentDrawMode.value as string,
        points: [...tempPoints.value],
        coordinates: tempPoints.value.map(p => ({ lat: p.lat, lng: p.lng }))
      };

      if (currentDrawMode.value === 'polygon') {
        finalShape = new window.AMap.Polygon({
          path: tempPoints.value,
          strokeColor: MAP_CONFIG.DRAW_STYLES.polygon.strokeColor,
          strokeWeight: MAP_CONFIG.DRAW_STYLES.polygon.strokeWeight,
          fillColor: MAP_CONFIG.DRAW_STYLES.polygon.fillColor,
          fillOpacity: MAP_CONFIG.DRAW_STYLES.polygon.fillOpacity
        });
      } else if (currentDrawMode.value === 'rectangle') {
        const bounds = new window.AMap.Bounds(tempPoints.value[0], tempPoints.value[1]);
        finalShape = new window.AMap.Rectangle({
          bounds: bounds,
          strokeColor: MAP_CONFIG.DRAW_STYLES.rectangle.strokeColor,
          strokeWeight: MAP_CONFIG.DRAW_STYLES.rectangle.strokeWeight,
          fillColor: MAP_CONFIG.DRAW_STYLES.rectangle.fillColor,
          fillOpacity: MAP_CONFIG.DRAW_STYLES.rectangle.fillOpacity
        });
        
        // 获取矩形的四个角点
        shapeData.coordinates = [
          { lng: bounds.getSouthWest().lng, lat: bounds.getSouthWest().lat },
          { lng: bounds.getNorthEast().lng, lat: bounds.getSouthWest().lat },
          { lng: bounds.getNorthEast().lng, lat: bounds.getNorthEast().lat },
          { lng: bounds.getSouthWest().lng, lat: bounds.getNorthEast().lat }
        ];
      } else if (currentDrawMode.value === 'circle') {
        const radius = tempPoints.value[0].distance(tempPoints.value[1]);
        finalShape = new window.AMap.Circle({
          center: tempPoints.value[0],
          radius: radius,
          strokeColor: MAP_CONFIG.DRAW_STYLES.circle.strokeColor,
          strokeWeight: MAP_CONFIG.DRAW_STYLES.circle.strokeWeight,
          fillColor: MAP_CONFIG.DRAW_STYLES.circle.fillColor,
          fillOpacity: MAP_CONFIG.DRAW_STYLES.circle.fillOpacity
        });
        // 计算圆形的边界点
        shapeData.coordinates = calculateCirclePoints(tempPoints.value[0], radius);
      }

      // 添加到地图和存储
      map.value.add(finalShape);
      drawnShapes.value.push({
        shape: finalShape,
        data: shapeData
      });
      console.log('当前drawnShapes:', drawnShapes.value);

      // 清除临时图形和标记
      clearTempShape();

      console.log(`完成绘制${currentDrawMode.value}，坐标：`, shapeData.coordinates);
    };

    // 计算圆形边界点
    const calculateCirclePoints = (center: any, radius: number): Coordinate[] => {
      const points: Coordinate[] = [];
      const segments = MAP_CONFIG.CIRCLE_SEGMENTS; // 32个点近似圆形

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const lat = center.lat + (radius / 111320) * Math.cos(angle);
        const lng = center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
        points.push({ lng, lat });
      }

      return points;
    };

    // 清除临时图形
    const clearTempShape = () => {
      if (tempShape.value) {
        map.value.remove(tempShape.value);
        tempShape.value = null;
      }

      if (tempMarkers.value.length > 0) {
        tempMarkers.value.forEach(marker => {
          map.value.remove(marker);
        });
        tempMarkers.value = [];
      }

      tempPoints.value = [];
      isDrawing.value = false;
    };

    // 撤销上一个点
    const undoLastPoint = () => {
      if (!currentDrawMode.value || tempPoints.value.length === 0) return;
      tempPoints.value.pop();
      // 移除最后一个临时标记点
      if (tempMarkers.value.length > 0) {
        const marker = tempMarkers.value.pop();
        map.value.remove(marker);
      }
      // 更新临时图形
      if (currentDrawMode.value === 'polygon' && tempShape.value) {
        if (tempPoints.value.length > 0) {
          tempShape.value.setPath(tempPoints.value);
        } else {
          map.value.remove(tempShape.value);
          tempShape.value = null;
        }
      } else if (currentDrawMode.value === 'rectangle' && tempShape.value) {
        if (tempPoints.value.length === 1) {
          tempShape.value.setBounds(new window.AMap.Bounds(tempPoints.value[0], tempPoints.value[0]));
        } else if (tempPoints.value.length === 0) {
          map.value.remove(tempShape.value);
          tempShape.value = null;
        }
      } else if (currentDrawMode.value === 'circle' && tempShape.value) {
        if (tempPoints.value.length === 1) {
          tempShape.value.setRadius(0);
        } else if (tempPoints.value.length === 0) {
          map.value.remove(tempShape.value);
          tempShape.value = null;
        }
      }
    };

    // 清除所有图形
    const clearAllShapes = () => {
      clearTempShape();

      drawnShapes.value.forEach(item => {
        map.value.remove(item.shape);
      });
      drawnShapes.value = [];

      currentDrawMode.value = null;

      // 清空坐标显示
      coordinatesDisplayHtml.value = '';
    };

    // 获取绘制坐标信息
    const getDrawCoordinates = () => {
      if (drawnShapes.value.length === 0) {
        alert('请先绘制图形！');
        return;
      }

      let html = '';
      drawnShapes.value.forEach((item, index) => {
        const data = item.data;
        html += `<div class="coordinate-item">
                  <strong>图形 ${index + 1} (${data.type})</strong><br>
                  <strong>坐标点：</strong><br>`;

        data.coordinates.forEach((coord, coordIndex) => {
          html += `点 ${coordIndex + 1}: lat: ${coord.lat}, lng: ${coord.lng}<br>`;
        });

        html += '</div>';
      });

      coordinatesDisplayHtml.value = html;
      console.log('获取绘制坐标，当前drawnShapes:', drawnShapes.value);
    };

    // 导出绘制数据
    const exportDrawData = () => {
      if (drawnShapes.value.length === 0) {
        alert('请先绘制图形！');
        return;
      }

      const exportData = {
        timestamp: new Date().toISOString(),
        type: 'drawn_shapes',
        shapes: drawnShapes.value.map(item => item.data)
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `drawn_shapes_${new Date().getTime()}.json`;
      link.click();

      console.log('绘制数据已导出：', exportData);
    };

    // 键盘事件处理
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        undoLastPoint();
      }
    };

    // 生命周期钩子
    onMounted(() => {
      console.log('页面加载完成，开始初始化地图绘制工具');
      // 确保AMap已加载
      if (window.AMap) {
        initMap();
      } else {
        console.error('AMap未加载，请确保引入了高德地图API');
      }

      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeyDown);
    });

    onBeforeUnmount(() => {
      // 清理事件监听
      document.removeEventListener('keydown', handleKeyDown);
      
      // 清理地图实例
      if (map.value) {
        map.value.destroy();
      }
    });

    return {
      currentDrawMode,
      clickMode,
      clickPoints,
      coordinatesDisplayHtml,
      setDrawMode,
      toggleClickMode,
      clearClickPoints,
      exportClickData,
      finishDrawing,
      clearAllShapes,
      getDrawCoordinates,
      exportDrawData,
      handleLocationSelected
    };
  }
});
</script>

<style scoped>
@import '../assets/map-styles.css';
</style> 