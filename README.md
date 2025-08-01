# 高德地图坐标拾取器 (Vue3 + TypeScript)

这是一个基于Vue3和TypeScript的高德地图坐标拾取器，可以在地图上绘制多边形、矩形和圆形，并获取图形的角点坐标。

## 功能特性

- 🗺️ 基于高德地图API的地图显示
- ✏️ 支持绘制多边形、矩形、圆形
- 📍 实时显示绘制点的坐标
- 📊 获取图形角点的经纬度坐标
- 🖱️ 点击获取坐标功能，支持批量获取多个坐标点
- 🔍 地址搜索功能，支持POI搜索和坐标定位
- 💾 导出绘制数据和点击坐标数据为JSON格式
- 🎨 现代化的用户界面设计
- 📱 响应式设计，支持移动端
- 🔄 Vue3 + TypeScript实现，代码更规范、可维护性更强

## 技术栈

- **前端框架**: Vue 3
- **开发语言**: TypeScript
- **构建工具**: Vite
- **地图API**: 高德地图 JavaScript API 2.0
- **样式**: 现代化CSS设计，支持响应式布局

## 安装与运行

### 1. 获取高德地图API密钥

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册账号并创建应用
3. 获取JavaScript API的密钥（Key）

### 2. 配置API密钥

在 `src/config/mapConfig.ts` 文件中，将 `YOUR_AMAP_KEY` 替换为您的实际API密钥：

```typescript
export const MAP_CONFIG: MapConfig = {
  API_KEY: 'YOUR_AMAP_KEY',
  // ... 其他配置
};
```

### 3. 安装依赖

```bash
npm install
# 或
yarn
# 或
pnpm install
```

### 4. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 5. 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 使用说明

### 地址搜索

在页面顶部的搜索框中，您可以：
- 输入地址、地点名称或POI进行搜索
- 输入经纬度坐标（格式：经度,纬度）直接定位
- 点击搜索结果跳转到对应位置

### 绘制图形

1. **绘制多边形**：
   - 点击"绘制多边形"按钮
   - 在地图上依次点击多个点
   - 点击"完成绘制"按钮结束绘制

2. **绘制矩形**：
   - 点击"绘制矩形"按钮
   - 在地图上点击两个对角点
   - 自动完成绘制

3. **绘制圆形**：
   - 点击"绘制圆形"按钮
   - 点击圆心位置
   - 点击第二个点确定半径
   - 自动完成绘制

### 获取坐标

- 点击"获取绘制坐标"按钮查看所有绘制图形的角点坐标
- 点击"点击获取坐标"按钮进入点击模式，在地图上点击获取坐标
- 支持导出坐标数据为JSON格式

## 项目结构

```
amap-coordinate-picking/
├── public/             # 静态资源
├── src/
│   ├── assets/         # 样式和资源文件
│   ├── components/     # Vue组件
│   │   ├── MapDrawer.vue     # 地图绘制主组件
│   │   ├── AddressSearch.vue # 地址搜索组件
│   │   └── MapError.vue      # 错误提示组件
│   ├── config/         # 配置文件
│   │   └── mapConfig.ts     # 高德地图配置
│   ├── types/          # TypeScript类型定义
│   │   └── map.ts           # 地图相关类型定义
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── vite-env.d.ts   # 类型声明
├── index.html          # HTML模板
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript配置
└── vite.config.ts      # Vite配置
```

## 注意事项

1. 需要有效的网络连接以加载高德地图
2. API密钥需要在高德开放平台进行域名白名单配置
3. 建议在HTTPS环境下使用以确保安全性

## 许可证

MIT License
