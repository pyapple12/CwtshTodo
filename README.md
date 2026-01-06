# CwtshTodo

![Version](https://img.shields.io/badge/version-0.04--beta-blue.svg)
![Node.js](https://img.shields.io/badge/node-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-beta-green.svg)

CwtshTodo 是一款面向**神经多样性人群（ADHD）**设计的**纯网页端可视化日程管理工具**，通过轻量化的前端交互设计，将抽象的时间管理转化为低认知负荷的可视化体验。

[English](#english) | 简体中文

---

## 核心定位

- **目标用户**：神经多样性人群（ADHD），兼顾普通网页端用户
- **核心价值**：轻量化、无 AI 依赖的可视化日程管理
- **平台支持**：PC / 移动端浏览器（Chrome / Firefox / Safari / Edge）

## 当前进度

### 已完成功能

| 模块 | 状态 | 说明 |
|------|------|------|
| 项目骨架 | ✅ | Vite + React 18 + TypeScript + Tailwind CSS |
| 侧边栏导航 | ✅ | 8个导航项 + 汉堡菜单（移动端） |
| 仪表板布局 | ✅ | 网格系统，左右双栏布局（响应式） |
| 进度图表 | ✅ | 渐变色进度条（绿→青→黄→橙→红→紫）+ 网格背景 |
| 分类列表 | ✅ | 动态分类数据 + 图标 + 颜色 |
| 日历卡片 | ✅ | Day/Week/Month 视图 + 任务显示 |
| 环形计时器 | ✅ | 彩虹渐变环 + 动态进度 |
| 数据持久化 | ✅ | IndexedDB 存储层 |
| 状态管理 | ✅ | Zustand 全局状态管理 |
| 任务 CRUD | ✅ | 添加/编辑/删除/完成任务 |
| 数据导入导出 | ✅ | JSON 格式备份与恢复 |
| 搜索功能 | ✅ | 任务标题搜索 + 下拉结果 |
| 拖拽排序 | ✅ | React DnD 实现 + 时间自动调整 |
| 重复任务设置 | ✅ | 日/周/月/年重复 + 自定义结束日期 |
| 温和提醒机制 | ✅ | 任务提醒开关 + 提前时间设置 |
| Schedule 页面 | ✅ | 时间轴视图 (6:00-22:00) |
| Tasks 页面 | ✅ | 全部任务列表 + 筛选 + 批量操作 |
| Focus 专注模式 | ✅ | 番茄钟计时器 + 专注统计 |
| Calendar 完整日历 | ✅ | 月视图 + 周视图 + 日期跳转 |
| PWA 支持 | ✅ | Service Worker + Manifest + 离线缓存 |
| 移动端适配 | ✅ | 响应式布局 + 底部导航 + 触摸优化 |

### 项目结构

```
CwtshTodo/
├── src/
│   ├── main.tsx              # 应用入口
│   ├── App.tsx               # 主组件（侧边栏 + 仪表板布局）
│   ├── index.css             # 全局样式 + Tailwind + 移动端优化
│   ├── types/index.ts        # 类型定义 (Task, Category, Reminder...)
│   ├── utils/db.ts           # IndexedDB 存储层
│   ├── store/index.ts        # Zustand 状态管理
│   └── components/
│       ├── Sidebar.tsx       # 左侧导航栏（桌面端）
│       ├── Dashboard.tsx     # 仪表板布局
│       ├── ProgressChart.tsx # 渐变进度条
│       ├── CategoryList.tsx  # 分类列表
│       ├── CategoryManage.tsx # 分类管理弹窗
│       ├── CalendarCard.tsx  # 月历组件
│       ├── RingTimer.tsx     # 环形计时器
│       ├── TaskList.tsx      # 任务列表
│       ├── TaskForm.tsx      # 任务表单
│       ├── SearchBox.tsx     # 搜索框
│       ├── Settings.tsx      # 设置页面
│       ├── DataManagement.tsx # 数据导入导出
│       ├── DnDProvider.tsx   # 拖拽上下文
│       ├── DraggableTaskCard.tsx # 可拖拽任务卡片
│       ├── ScheduleView.tsx  # Schedule 页面（时间轴视图）
│       ├── AllTasks.tsx      # Tasks 页面（全部任务列表）
│       ├── FocusMode.tsx     # Focus 专注模式（番茄钟）
│       ├── FullCalendar.tsx  # Calendar 完整日历
│       └── BottomNav.tsx     # 底部导航栏（移动端）
├── public/
│   └── icons/                # PWA 图标
├── scripts/
│   └── generate-icons.js     # 图标生成脚本
├── package.json
├── tsconfig.json
├── vite.config.ts            # Vite + PWA 配置
├── tailwind.config.js        # Tailwind 响应式配置
├── .gitignore
└── README.md
```

## 待完成任务

### 进行中

暂无

### 短期任务

暂无

### 中期任务

- [ ] **体验优化 (v0.05)**
  - 深色模式实现
  - 任务表单日期选择
  - 专注数据持久化
  - 快捷键与手势支持

### 长期任务

- [ ] **高级功能 (v0.06)**
  - 浏览器通知 API
  - 任务完成统计
  - 分类时间分布
  - 习惯追踪与打卡

- [ ] **云端同步（可选）**
  - Firebase 集成
  - 用户认证
  - 数据加密传输
  - 多设备同步

## 技术栈

| 类别 | 技术选型 |
|------|----------|
| 前端框架 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS（响应式） |
| 交互 | React DnD + Framer Motion |
| 存储 | IndexedDB (idb) |
| 状态管理 | Zustand |
| 时间处理 | dayjs |
| PWA | vite-plugin-pwa + Workbox |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 数据隐私

- 所有数据默认存储在本地（IndexedDB）
- 无后端依赖，数据完全由用户控制
- 无埋点、无广告、无用户行为追踪

## 许可证

MIT License

---

# CwtshTodo

CwtshTodo is a **pure web-based visual schedule management tool** designed for **neurodiverse individuals (ADHD)**. It transforms abstract time management into a low-cognitive-load visual experience through lightweight frontend interaction design.

## Current Progress

### Completed

| Module | Status | Description |
|--------|--------|-------------|
| Project Setup | ✅ | Vite + React 18 + TypeScript + Tailwind CSS |
| Sidebar Navigation | ✅ | 8 nav items + hamburger menu (mobile) |
| Dashboard Layout | ✅ | Grid system, responsive dual-column layout |
| Progress Chart | ✅ | Gradient progress bar + grid background |
| Category List | ✅ | Dynamic categories with icons and colors |
| Calendar Card | ✅ | Day/Week/Month views + task display |
| Ring Timer | ✅ | Rainbow gradient ring + dynamic progress |
| Data Persistence | ✅ | IndexedDB storage layer |
| State Management | ✅ | Zustand global state |
| Task CRUD | ✅ | Add/Edit/Delete/Complete tasks |
| Import/Export | ✅ | JSON backup and restore |
| Search Function | ✅ | Task title search + dropdown |
| Drag & Drop | ✅ | React DnD + auto time adjustment |
| Recurring Tasks | ✅ | Daily/Weekly/Monthly/Yearly + end date |
| Gentle Reminders | ✅ | Reminder toggle + advance time setting |
| Schedule Page | ✅ | Timeline view (6:00-22:00) |
| Tasks Page | ✅ | All tasks list + filter + batch operations |
| Focus Mode | ✅ | Pomodoro timer + focus statistics |
| Full Calendar | ✅ | Month view + Week view + date navigation |
| PWA Support | ✅ | Service Worker + Manifest + offline cache |
| Mobile Adaptation | ✅ | Responsive + bottom nav + touch optimization |

### Project Structure

```
CwtshTodo/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component
│   ├── index.css             # Global styles + Tailwind + mobile optimization
│   ├── types/index.ts        # TypeScript types
│   ├── utils/db.ts           # IndexedDB storage
│   ├── store/index.ts        # Zustand state management
│   └── components/
│       ├── Sidebar.tsx       # Left sidebar (desktop)
│       ├── Dashboard.tsx     # Dashboard layout
│       ├── ProgressChart.tsx # Gradient progress bar
│       ├── CategoryList.tsx  # Category list
│       ├── CategoryManage.tsx # Category management modal
│       ├── CalendarCard.tsx  # Calendar component
│       ├── RingTimer.tsx     # Ring timer
│       ├── TaskList.tsx      # Task list
│       ├── TaskForm.tsx      # Task form
│       ├── SearchBox.tsx     # Search box
│       ├── Settings.tsx      # Settings page
│       ├── DataManagement.tsx # Import/Export
│       ├── DnDProvider.tsx   # Drag & Drop context
│       ├── DraggableTaskCard.tsx # Draggable task card
│       ├── ScheduleView.tsx  # Schedule page (timeline view)
│       ├── AllTasks.tsx      # Tasks page (all tasks list)
│       ├── FocusMode.tsx     # Focus mode (Pomodoro)
│       ├── FullCalendar.tsx  # Full calendar
│       └── BottomNav.tsx     # Bottom navigation (mobile)
├── public/
│   └── icons/                # PWA icons
├── scripts/
│   └── generate-icons.js     # Icon generation script
├── package.json
├── tsconfig.json
├── vite.config.ts            # Vite + PWA config
├── tailwind.config.js        # Tailwind responsive config
├── .gitignore
└── README.md
```

## To-Do List

### In Progress

None

### Short-term

None

### Mid-term

- [ ] **Advanced Reminders**
  - Browser notification API
  - Task halfway reminder
  - Task ending soon reminder

### Long-term

- [ ] **Cloud Sync (Optional)**
  - Firebase integration
  - User authentication
  - Encrypted data transfer
  - Multi-device sync

- [ ] **Data Analysis**
  - Task completion statistics
  - Category time distribution
  - Focus duration report
  - Data visualization

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (responsive) |
| Interaction | React DnD + Framer Motion |
| Storage | IndexedDB (idb) |
| State Management | Zustand |
| Date Handling | dayjs |
| PWA | vite-plugin-pwa + Workbox |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Data Privacy

- All data stored locally by default (IndexedDB)
- No backend dependency, data fully controlled by user
- No tracking, no ads, no user behavior monitoring

## License

MIT License