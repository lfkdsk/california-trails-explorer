# 加州徒步路线可视化应用

一个交互式Web应用，用于探索和发现加州的徒步路线。基于超过11,000条来自AllTrails的徒步路线数据，提供地图视图、详细信息、筛选功能和数据分析。

## 功能特点

- **地图视图**：在Google地图上显示所有徒步路线，支持标记聚类和详情查看
- **列表视图**：分页浏览所有徒步路线，支持多种排序选项
- **筛选功能**：按难度、长度、海拔增益、评分、路线类型和区域筛选
- **详情页**：查看单个路线的详细信息和地图位置
- **数据分析**：通过图表和可视化了解徒步路线的分布和特点
- **响应式设计**：适配桌面和移动设备

## 技术栈

- **前端框架**：React 18, TypeScript, Material UI, Tailwind CSS
- **地图与可视化**：Google Maps JavaScript API, Chart.js
- **数据存储**：sql.js (WebAssembly版SQLite)
- **构建工具**：Vite, ESLint, PostCSS

## 快速开始

### 前提条件

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本
- Google Maps API密钥

### 安装

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/california-trails-app.git
   cd california-trails-app
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   创建一个`.env.local`文件，添加你的Google Maps API密钥：
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. 复制数据库文件
   将`california_trails.db`文件复制到`public`目录下。

5. 启动开发服务器
   ```bash
   npm run dev
   ```

6. 构建生产版本
   ```bash
   npm run build
   ```

## 数据来源

本应用使用的数据来自AllTrails，包含了加州地区的11,129条徒步路线信息。数据收集于2024年5月，
包括路线名称、位置、长度、难度、海拔增益、评分、评论数量等详细信息。

原始数据来源：[AllTrails Data Exporter](https://github.com/Bhuemann/AllTrailsDataExporter)

## 项目结构

```
california-trails-app/
├── public/                  # 静态资源
│   ├── california_trails.db # SQLite数据库文件
│   └── favicon.svg         # 网站图标
├── src/                     # 源代码
│   ├── components/          # React组件
│   ├── contexts/            # React上下文
│   ├── hooks/               # 自定义钩子
│   ├── pages/               # 页面组件
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 入口文件
├── index.html               # HTML模板
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript配置
└── vite.config.ts           # Vite配置
```

## 许可证

MIT