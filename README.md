# CwtshTodo

![Version](https://img.shields.io/badge/version-0.01--tech--preview-blue.svg)
![Node.js](https://img.shields.io/badge/node-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-technical%20preview-orange.svg)

CwtshTodo 是一款面向**神经多样性人群（ADHD）**设计的**纯网页端可视化日程管理工具**，通过轻量化的前端交互设计，将抽象的时间管理转化为低认知负荷的可视化体验。

[English](#english) | 简体中文

---

## 核心定位

- **目标用户**：神经多样性人群（ADHD），兼顾普通网页端用户
- **核心价值**：轻量化、无 AI 依赖的可视化日程管理
- **平台支持**：PC / 移动端浏览器（Chrome / Firefox / Safari / Edge）

## 功能特性

### 可视化日程引擎
- 色彩编码时间轴，直观展示每日安排
- 拖拽式任务编排，轻松调整时间
- 视觉计时器，温和的任务提醒

### 基础日程管理
- 任务创建、编辑、删除
- 分类管理（图标 + 色彩）
- 重复任务设置
- 日/周/月多视图切换

### 跨端适配
- 响应式布局，适配 PC / 平板 / 手机
- PWA 支持，离线使用
- 数据导入导出（JSON 格式）

## 技术栈

| 类别 | 技术选型 |
|------|----------|
| 前端框架 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS |
| 交互 | React DnD + Framer Motion |
| 存储 | localStorage / IndexedDB |
| 时间处理 | dayjs + date-fns |

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
```

## 数据隐私

- 所有数据默认存储在本地（localStorage / IndexedDB）
- 可选 Firebase 云端同步（用户自愿开启）
- 无埋点、无广告、无用户行为追踪

## 许可证

MIT License

---

# CwtshTodo

CwtshTodo is a **pure web-based visual schedule management tool** designed for **neurodiverse individuals (ADHD)**. It transforms abstract time management into a low-cognitive-load visual experience through lightweight frontend interaction design.

## Core Position

- **Target Users**: Neurodiverse individuals (ADHD),兼顾普通网页端用户
- **Core Value**: Lightweight, AI-free visual schedule management
- **Platform**: PC / Mobile browsers (Chrome / Firefox / Safari / Edge)

## Features

### Visual Schedule Engine
- Color-coded timeline for daily planning
- Drag-and-drop task arrangement
- Visual timer with gentle reminders

### Task Management
- Create, edit, and delete tasks
- Category management (icons + colors)
- Recurring task settings
- Day / Week / Month views

### Cross-platform Support
- Responsive design (PC / Tablet / Mobile)
- PWA support for offline use
- Import/Export data (JSON format)

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Interaction | React DnD + Framer Motion |
| Storage | localStorage / IndexedDB |
| Date Handling | dayjs + date-fns |

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
```

## Data Privacy

- All data stored locally by default (localStorage / IndexedDB)
- Optional Firebase cloud sync (user-initiated)
- No tracking, no ads, no user behavior monitoring

## License

MIT License
