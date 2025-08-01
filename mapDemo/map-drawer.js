class MapDrawer {
  constructor() {
    this.map = null
    this.currentDrawMode = null
    this.drawnShapes = []
    this.isDrawing = false
    this.tempPoints = []
    this.tempShape = null
    this.tempMarkers = []

    // 点击坐标相关
    this.clickMode = false
    this.clickPoints = []
    this.clickMarkers = []

    this.initMap()
    this.bindEvents()
  }

  // 初始化地图
  initMap () {
    this.map = new AMap.Map('map', {
      zoom: 13,
      center: [112.967811, 28.164452], // 北京天安门
      mapStyle: 'amap://styles/normal'
    })

    // 正确加载控件（适配高德2.x）
    this.map.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.ControlBar'], () => {
      this.map.addControl(new AMap.ToolBar())
      this.map.addControl(new AMap.Scale())
      this.map.addControl(new AMap.ControlBar())
    })

    console.log('地图初始化完成')
  }

  // 绑定事件
  bindEvents () {
    console.log('开始绑定事件')

    // 绘制按钮事件
    document.getElementById('drawPolygon').addEventListener('click', (e) => {
      console.log('点击绘制多边形按钮')
      this.setDrawMode('polygon')
    })

    document.getElementById('drawRectangle').addEventListener('click', (e) => {
      console.log('点击绘制矩形按钮')
      this.setDrawMode('rectangle')
    })

    document.getElementById('drawCircle').addEventListener('click', (e) => {
      console.log('点击绘制圆形按钮')
      this.setDrawMode('circle')
    })

    // 新增：完成绘制按钮
    document.getElementById('finishDrawing').addEventListener('click', (e) => {
      console.log('点击完成绘制按钮')
      this.finishDrawing()
    })

    document.getElementById('clearAll').addEventListener('click', (e) => {
      console.log('点击清除所有按钮')
      this.clearAllShapes()
    })

    document.getElementById('getCoordinates').addEventListener('click', (e) => {
      console.log('点击获取绘制坐标按钮')
      this.getDrawCoordinates()
    })

    document.getElementById('exportData').addEventListener('click', (e) => {
      console.log('点击导出绘制数据按钮')
      this.exportDrawData()
    })

    // 点击坐标相关按钮
    document.getElementById('getClickCoordinates').addEventListener('click', (e) => {
      console.log('点击获取坐标按钮')
      this.toggleClickMode()
    })

    document.getElementById('clearClickPoints').addEventListener('click', (e) => {
      console.log('点击清除点击点按钮')
      this.clearClickPoints()
    })

    document.getElementById('exportClickData').addEventListener('click', (e) => {
      console.log('点击导出点击数据按钮')
      this.exportClickData()
    })

    // 撤销快捷键 Ctrl+Z
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        this.undoLastPoint()
      }
    })

    // 地图点击事件
    this.map.on('click', (e) => {
      console.log('地图被点击', e.lnglat)
      this.handleMapClick(e)
    })

    // 移除地图双击事件
    // this.map.on('dblclick', (e) => {
    //   e.originalEvent.preventDefault()
    //   console.log('地图被双击')
    //   this.finishDrawing()
    // })

    console.log('事件绑定完成')
  }

  // 切换点击获取坐标模式
  toggleClickMode () {
    this.clickMode = !this.clickMode
    const button = document.getElementById('getClickCoordinates')

    if (this.clickMode) {
      // 退出绘制模式
      this.clearDrawMode()
      button.textContent = '退出点击模式'
      button.classList.add('active')
      console.log('进入点击获取坐标模式')
    } else {
      // 退出点击模式
      button.textContent = '点击获取坐标'
      button.classList.remove('active')
      console.log('退出点击获取坐标模式')
    }
  }

  // 清除绘制模式
  clearDrawMode () {
    this.clearTempShape()
    this.currentDrawMode = null
    this.isDrawing = false
    this.tempPoints = []

    // 清除按钮状态
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.classList.remove('active')
    })
  }

  // 设置绘制模式
  setDrawMode (mode) {
    // 退出点击模式
    this.clickMode = false
    document.getElementById('getClickCoordinates').textContent = '点击获取坐标'
    document.getElementById('getClickCoordinates').classList.remove('active')

    // 清除之前的绘制状态
    this.clearTempShape()
    this.isDrawing = false
    this.tempPoints = []

    // 更新按钮状态
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.classList.remove('active')
    })

    this.currentDrawMode = mode

    // 激活当前按钮
    const activeButton = document.querySelector(`#draw${mode.charAt(0).toUpperCase() + mode.slice(1)}`)
    if (activeButton) {
      activeButton.classList.add('active')
    }

    console.log(`切换到${mode}绘制模式`)
  }

  // 处理地图点击
  handleMapClick (e) {
    const point = e.lnglat

    if (this.clickMode) {
      // 点击获取坐标模式
      this.addClickPoint(point)
    } else if (this.currentDrawMode) {
      // 绘制模式
      this.tempPoints.push(point)

      if (this.currentDrawMode === 'polygon') {
        this.drawPolygon(point)
      } else if (this.currentDrawMode === 'rectangle') {
        this.drawRectangle(point)
      } else if (this.currentDrawMode === 'circle') {
        this.drawCircle(point)
      }
    } else {
      alert('请先选择绘制模式或点击获取坐标模式！')
    }
  }

  // 添加点击点
  addClickPoint (point) {
    this.clickPoints.push(point)

    // 创建标记
    const marker = new AMap.Marker({
      position: point,
      icon: new AMap.Icon({
        size: new AMap.Size(12, 12),
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjYiIGZpbGw9IiNGRjk4MDAiLz4KPC9zdmc+',
        imageSize: new AMap.Size(12, 12)
      })
    })

    this.map.add(marker)
    this.clickMarkers.push(marker)

    // 更新显示
    this.updateClickCoordinatesDisplay()

    console.log(`添加点击点 ${this.clickPoints.length}:`, point)
  }

  // 更新点击坐标显示
  updateClickCoordinatesDisplay () {
    let html = ''
    this.clickPoints.forEach((point, index) => {
      html += `<div class="coordinate-item">
                <strong>点 ${index + 1}</strong><br>
                经度: ${point.lng.toFixed(6)}<br>
                纬度: ${point.lat.toFixed(6)}
            </div>`
    })

    if (this.clickPoints.length === 0) {
      html = '<p>点击"点击获取坐标"按钮，然后在地图上点击获取坐标</p>'
    }

    document.getElementById('clickCoordinatesDisplay').innerHTML = html
  }

  // 清除点击点
  clearClickPoints () {
    this.clickMarkers.forEach(marker => {
      this.map.remove(marker)
    })
    this.clickMarkers = []
    this.clickPoints = []
    this.updateClickCoordinatesDisplay()
    console.log('清除所有点击点')
  }

  // 导出点击数据
  exportClickData () {
    if (this.clickPoints.length === 0) {
      alert('请先点击获取坐标！')
      return
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      type: 'click_points',
      points: this.clickPoints.map((point, index) => ({
        index: index + 1,
        longitude: point.lng,
        latitude: point.lat,
        coordinates: [point.lng, point.lat]
      }))
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `click_points_${new Date().getTime()}.json`
    link.click()

    console.log('点击数据已导出：', exportData)
  }

  // 绘制多边形
  drawPolygon (point) {
    if (this.tempPoints.length === 1) {
      // 第一个点，创建多边形
      this.tempShape = new AMap.Polygon({
        path: this.tempPoints,
        strokeColor: '#FF0000',
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.3,
        strokeStyle: 'dashed',
        bubble: true,        // 允许事件冒泡
        clickable: false     // 不拦截点击
      })
      this.map.add(this.tempShape)
    } else {
      // 更新多边形路径
      this.tempShape.setPath(this.tempPoints)
    }

    // 添加临时标记点
    this.addTempMarker(point)
  }

  // 绘制矩形
  drawRectangle (point) {
    if (this.tempPoints.length === 1) {
      // 第一个点，创建矩形
      this.tempShape = new AMap.Rectangle({
        bounds: new AMap.Bounds(point, point),
        strokeColor: '#00FF00',
        strokeWeight: 2,
        fillColor: '#00FF00',
        fillOpacity: 0.3,
        strokeStyle: 'dashed'
      })
      this.map.add(this.tempShape)
    } else if (this.tempPoints.length === 2) {
      // 第二个点，完成矩形
      const bounds = new AMap.Bounds(this.tempPoints[0], this.tempPoints[1])
      this.tempShape.setBounds(bounds)
      this.finishDrawing()
    }

    // 添加临时标记点
    this.addTempMarker(point)
  }

  // 绘制圆形
  drawCircle (point) {
    if (this.tempPoints.length === 1) {
      // 第一个点，创建圆形
      this.tempShape = new AMap.Circle({
        center: point,
        radius: 0,
        strokeColor: '#0000FF',
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.3,
        strokeStyle: 'dashed'
      })
      this.map.add(this.tempShape)
    } else if (this.tempPoints.length === 2) {
      // 第二个点，计算半径并完成圆形
      const radius = this.tempPoints[0].distance(this.tempPoints[1])
      this.tempShape.setRadius(radius)
      this.finishDrawing()
    }

    // 添加临时标记点
    this.addTempMarker(point)
  }

  // 添加临时标记点
  addTempMarker (point) {
    const marker = new AMap.Marker({
      position: point,
      icon: new AMap.Icon({
        size: new AMap.Size(10, 10),
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjUiIGZpbGw9IiNGRjAwMDAiLz4KPC9zdmc+',
        imageSize: new AMap.Size(10, 10)
      })
    })
    this.map.add(marker)
    this.tempMarkers.push(marker)
  }

  // 完成绘制
  finishDrawing () {
    if (!this.tempShape || this.tempPoints.length < 2) {
      return
    }

    // 创建最终的图形
    let finalShape
    const shapeData = {
      type: this.currentDrawMode,
      points: [...this.tempPoints],
      coordinates: this.tempPoints.map(p => ({ lat: p.lat, lng: p.lng }))
    }

    if (this.currentDrawMode === 'polygon') {
      finalShape = new AMap.Polygon({
        path: this.tempPoints,
        strokeColor: '#FF0000',
        strokeWeight: 3,
        fillColor: '#FF0000',
        fillOpacity: 0.2
      })
    } else if (this.currentDrawMode === 'rectangle') {
      const bounds = new AMap.Bounds(this.tempPoints[0], this.tempPoints[1])
      finalShape = new AMap.Rectangle({
        bounds: bounds,
        strokeColor: '#00FF00',
        strokeWeight: 3,
        fillColor: '#00FF00',
        fillOpacity: 0.2
      })
      // 获取矩形的四个角点
      shapeData.coordinates = [
        { lng: bounds.getSouthWest().lng, lat: bounds.getSouthWest().lat },
        { lng: bounds.getNorthEast().lng, lat: bounds.getSouthWest().lat },
        { lng: bounds.getNorthEast().lng, lat: bounds.getNorthEast().lat },
        { lng: bounds.getSouthWest().lng, lat: bounds.getNorthEast().lat }
      ]
    } else if (this.currentDrawMode === 'circle') {
      const radius = this.tempPoints[0].distance(this.tempPoints[1])
      finalShape = new AMap.Circle({
        center: this.tempPoints[0],
        radius: radius,
        strokeColor: '#0000FF',
        strokeWeight: 3,
        fillColor: '#0000FF',
        fillOpacity: 0.2
      })
      // 计算圆形的边界点
      shapeData.coordinates = this.calculateCirclePoints(this.tempPoints[0], radius)
    }

    // 添加到地图和存储
    this.map.add(finalShape)
    this.drawnShapes.push({
      shape: finalShape,
      data: shapeData
    })
    console.log('当前drawnShapes:', this.drawnShapes)

    // 清除临时图形和标记
    this.clearTempShape()

    console.log(`完成绘制${this.currentDrawMode}，坐标：`, shapeData.coordinates)
  }

  // 计算圆形边界点
  calculateCirclePoints (center, radius) {
    const points = []
    const segments = 32 // 32个点近似圆形

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      const lat = center.lat + (radius / 111320) * Math.cos(angle)
      const lng = center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle)
      points.push({ lng, lat })
    }

    return points
  }

  // 清除临时图形
  clearTempShape () {
    if (this.tempShape) {
      this.map.remove(this.tempShape)
      this.tempShape = null
    }

    if (this.tempMarkers) {
      this.tempMarkers.forEach(marker => {
        this.map.remove(marker)
      })
      this.tempMarkers = []
    }

    this.tempPoints = []
    this.isDrawing = false
  }

  // 撤销上一个点
  undoLastPoint () {
    if (!this.currentDrawMode || this.tempPoints.length === 0) return
    this.tempPoints.pop()
    // 移除最后一个临时标记点
    if (this.tempMarkers && this.tempMarkers.length > 0) {
      const marker = this.tempMarkers.pop()
      this.map.remove(marker)
    }
    // 更新临时图形
    if (this.currentDrawMode === 'polygon' && this.tempShape) {
      if (this.tempPoints.length > 0) {
        this.tempShape.setPath(this.tempPoints)
      } else {
        this.map.remove(this.tempShape)
        this.tempShape = null
      }
    } else if (this.currentDrawMode === 'rectangle' && this.tempShape) {
      if (this.tempPoints.length === 1) {
        this.tempShape.setBounds(new AMap.Bounds(this.tempPoints[0], this.tempPoints[0]))
      } else if (this.tempPoints.length === 0) {
        this.map.remove(this.tempShape)
        this.tempShape = null
      }
    } else if (this.currentDrawMode === 'circle' && this.tempShape) {
      if (this.tempPoints.length === 1) {
        this.tempShape.setRadius(0)
      } else if (this.tempPoints.length === 0) {
        this.map.remove(this.tempShape)
        this.tempShape = null
      }
    }
  }

  // 清除所有图形
  clearAllShapes () {
    this.clearTempShape()

    this.drawnShapes.forEach(item => {
      this.map.remove(item.shape)
    })
    this.drawnShapes = []

    // 清除按钮状态
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.classList.remove('active')
    })

    this.currentDrawMode = null

    // 清空坐标显示
    document.getElementById('coordinatesDisplay').innerHTML =
      '<p>点击"获取绘制坐标"按钮查看绘制图形的坐标信息</p>'
  }

  // 获取绘制坐标信息
  getDrawCoordinates () {
    if (this.drawnShapes.length === 0) {
      alert('请先绘制图形！\n当前drawnShapes内容：' + JSON.stringify(this.drawnShapes))
      return
    }

    let html = ''
    this.drawnShapes.forEach((item, index) => {
      const data = item.data
      html += `<div class="coordinate-item">
                <strong>图形 ${index + 1} (${data.type})</strong><br>
                <strong>坐标点：</strong><br>`

      data.coordinates.forEach((coord, coordIndex) => {
        html += `点 ${coordIndex + 1}: lat: ${coord.lat}, lng: ${coord.lng}<br>`
      })

      html += '</div>'
    })

    document.getElementById('coordinatesDisplay').innerHTML = html
    console.log('获取绘制坐标，当前drawnShapes:', this.drawnShapes)
  }

  // 导出绘制数据
  exportDrawData () {
    if (this.drawnShapes.length === 0) {
      alert('请先绘制图形！')
      return
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      type: 'drawn_shapes',
      shapes: this.drawnShapes.map(item => item.data)
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `drawn_shapes_${new Date().getTime()}.json`
    link.click()

    console.log('绘制数据已导出：', exportData)
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('页面加载完成，开始初始化地图绘制工具')
  new MapDrawer()
}) 