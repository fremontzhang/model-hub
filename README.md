# Model Hub - AI 模型接入管理平台

## 📊 项目概述

**Model Hub** 是一个专业的 AI 模型接入管理平台，为内容变现分发平台提供统一的模型厂商管理、调用统计、费用分析和模型切换功能。

### 核心特性

- 🏢 **多厂商接入管理** - 支持直连原厂和代理商两种接入方式
- 🤖 **模型统一管理** - 集中管理所有 AI 模型的配置和状态
- 📈 **实时监控看板** - 可视化展示调用量、费用、性能等关键指标
- 💰 **费用计费分析** - 按 Token 计费和混合计费，支持多维度费用统计
- 🔄 **智能模型切换** - 支持应用场景维度的模型切换（全局/客服/内容生成等）
- 📋 **调用日志追踪** - 详细记录每次模型调用的完整信息

### ✨ 最新更新 (v1.1)

**UI 优化**：
- ✅ 修复厂商图标显示问题（添加错误处理）
- ✅ 统一代理商和直连厂商卡片布局（4行信息对齐）
- ✅ 优化统计图表高度，避免过长显示

**功能增强**：
- ✅ **应用场景维度切换** - 支持为不同业务场景配置独立模型
  - 🌍 全局默认（所有应用）
  - 💬 客户服务
  - ✍️ 内容生成
  - 🌏 翻译服务
  - 📊 数据分析
  - 📑 文本摘要
- ✅ **切换原因下拉菜单** - 预设常用切换原因
  - ⚡ 性能优化
  - 💰 成本优化
  - 🚀 功能扩展
  - ⚠️ 故障转移
  - 🧪 测试验证
  - 📝 其他原因
- ✅ **改进切换交互** - 新的模态框设计，更清晰的操作流程
- ✅ **切换历史展示** - 显示场景标签，便于追踪

## 🌐 在线访问

- **开发环境**: https://3000-id365cg9s6w6j5eu9rzey-b237eb32.sandbox.novita.ai
- **API 端点**: https://3000-id365cg9s6w6j5eu9rzey-b237eb32.sandbox.novita.ai/api

## 🎨 界面预览

Model Hub 采用**科技简洁风格**设计：

- **紫色渐变背景** - 现代科技感
- **玻璃态卡片** - 半透明效果，高级感十足
- **响应式布局** - 完美适配各种屏幕尺寸
- **动态图表** - 使用 Chart.js 实现数据可视化
- **流畅交互** - 平滑过渡动画，提升用户体验

## 📦 技术栈

### 后端
- **Hono** - 轻量级 Web 框架
- **Cloudflare D1** - 全球分布式 SQLite 数据库
- **TypeScript** - 类型安全

### 前端
- **Vanilla JavaScript** - 原生 JS，无框架依赖
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Chart.js** - 数据可视化图表库
- **Font Awesome** - 图标库

### 部署
- **Cloudflare Pages** - 边缘计算平台
- **Wrangler** - Cloudflare 开发工具

## 🗄️ 数据库设计

### 核心数据表

1. **model_providers** - 模型厂商表
   - 厂商基本信息（名称、Logo、接入类型）
   - API 配置（Base URL、API Key、认证方式）
   - 状态管理（启用/禁用/维护中）

2. **models** - 模型表
   - 模型信息（ID、名称、类型、版本）
   - 能力标识（流式输出、函数调用、视觉理解）
   - 性能参数（上下文长度、响应时间）

3. **pricing_rules** - 计费规则表
   - 计费方式（Token 计费/按次计费/混合计费）
   - 价格配置（Input/Output Token 单价）
   - 历史价格记录

4. **usage_logs** - 调用日志表
   - 请求详情（Token 消耗、响应时间、状态）
   - 费用明细（Input/Output/总费用）
   - 业务信息（来源、场景）

5. **model_switches** - 模型切换记录表
   - 切换信息（原模型 → 目标模型）
   - 切换原因和操作人员
   - 执行结果

6. **active_model_config** - 当前激活模型配置表
   - 场景映射（不同场景使用不同模型）

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone <repository-url>
cd model-hub

# 2. 安装依赖
npm install

# 3. 初始化数据库
npm run db:migrate:local
npm run db:seed

# 4. 构建项目
npm run build

# 5. 启动开发服务器
npm run dev:sandbox

# 或使用 PM2 启动
pm2 start ecosystem.config.cjs
```

### 访问应用

- 浏览器访问: http://localhost:3000
- API 测试: http://localhost:3000/api/dashboard/overview

## 📊 功能模块

### 1. 仪表盘（Dashboard）

实时监控看板，展示关键业务指标：

- **今日概览**: 总调用次数、Token 消耗、总费用、成功率
- **厂商分布**: 各厂商调用占比饼图
- **热门模型**: Top 5 热门模型排行
- **性能指标**: 平均响应时间、Token 比例

**API 端点**: `GET /api/dashboard/overview`

### 2. 接入管理（Providers）

管理所有模型厂商：

- 查看厂商列表（卡片式展示）
- 添加/编辑/删除厂商
- 查看厂商下的模型列表
- 区分直连原厂和代理商

**API 端点**:
- `GET /api/providers` - 获取厂商列表
- `POST /api/providers` - 创建厂商
- `PUT /api/providers/:id` - 更新厂商
- `DELETE /api/providers/:id` - 删除厂商

### 3. 模型列表（Models）

管理所有 AI 模型：

- 表格式展示所有模型
- 显示模型类型、计费方式、状态
- 查看模型详情
- 编辑模型配置

**API 端点**:
- `GET /api/models` - 获取模型列表
- `POST /api/models` - 创建模型
- `PUT /api/models/:id` - 更新模型
- `DELETE /api/models/:id` - 删除模型

### 4. 统计分析（Stats）

多维度数据分析：

- **历史趋势**: 最近 7 天调用量和费用趋势图（折线图）
- **费用排行**: 按厂商/模型统计费用（支持 30 天查询）
- **Token 消耗**: Input/Output Token 详细统计

**API 端点**:
- `GET /api/stats/history?days=7` - 历史统计
- `GET /api/stats/costs?group_by=provider&days=30` - 费用统计

### 5. 调用日志（Logs）

详细的调用记录追踪：

- 时间、模型、厂商
- Token 消耗（Input/Output）
- 费用明细
- 响应时间、状态
- 调用来源和场景

**API 端点**: `GET /api/logs?page=1&limit=50`

### 6. 模型切换（Switch）

手动切换当前使用的模型：

- 显示当前激活模型
- 选择目标模型（显示计费对比）
- 填写切换原因和操作人员
- 查看切换历史记录

**API 端点**:
- `GET /api/active-model` - 获取当前激活模型
- `POST /api/switch-model` - 执行模型切换
- `GET /api/switch-history` - 切换历史

## 📝 示例数据

项目预置了丰富的示例数据：

### 厂商（7个）
- OpenAI（直连）
- Anthropic（直连）
- 讯飞星火（直连）
- 智谱AI（直连）
- 硅基流动（代理商）
- API2D（代理商，已禁用）
- 阿里云百炼（维护中）

### 模型（13个）
- GPT-4 Turbo、GPT-4、GPT-3.5 Turbo
- Claude 3 Opus、Sonnet、Haiku
- 星火 v3.5、v3.0
- GLM-4、GLM-3 Turbo
- 以及代理商渠道的模型

### 调用日志（30+条）
- 最近 7 天的模拟调用数据
- 包含成功和失败记录
- 涵盖不同场景（客服、内容生成、分析等）

## 🔧 开发指南

### 添加新厂商

1. 在接入管理页面点击"添加厂商"
2. 填写厂商信息：
   - 名称、标识（slug）
   - Logo URL
   - 接入类型（直连/代理）
   - API 配置（Base URL、API Key）
   - 优先级

### 添加新模型

1. 在模型列表页面点击"添加模型"
2. 填写模型信息：
   - 选择所属厂商
   - 模型 ID 和显示名称
   - 模型类型（文本/多模态/嵌入/图像）
   - 计费规则（Token 价格）

### 执行模型切换

1. 进入模型切换页面
2. 点击"切换模型"按钮
3. 选择目标模型
4. 填写切换原因和操作人员
5. 确认切换

## 📈 性能优化

- **数据库索引**: 为常用查询字段建立索引
- **API 响应缓存**: 使用 Cloudflare Cache API（待实现）
- **分页加载**: 日志查询支持分页
- **CDN 加速**: 静态资源通过 Cloudflare CDN 分发

## 🔐 安全考虑

- **API Key 加密存储**: 敏感信息不明文存储（生产环境需实现）
- **CORS 配置**: 仅允许 API 路由跨域
- **SQL 注入防护**: 使用参数化查询
- **XSS 防护**: 前端数据渲染做转义处理

## 🚧 待实现功能

### 第二阶段功能
- [ ] 用户权限管理（超级管理员/运维/开发）
- [ ] 自动故障转移
- [ ] 灰度切换
- [ ] 预算告警通知
- [ ] 健康检查自动化
- [ ] API 密钥管理（加密存储）
- [ ] 导出报表（Excel/PDF）
- [ ] Webhook 通知

### 高级功能
- [ ] 自动成本优化建议
- [ ] 模型性能对比分析
- [ ] A/B 测试支持
- [ ] 多场景配置（客服、内容生成等）
- [ ] 实时监控告警
- [ ] 自定义仪表盘

## 📦 项目结构

```
model-hub/
├── src/
│   └── index.tsx              # 后端 API 入口
├── public/
│   └── static/
│       └── app.js             # 前端 JavaScript
├── migrations/
│   └── 0001_init_schema.sql  # 数据库初始化脚本
├── seed.sql                   # 示例数据
├── wrangler.jsonc             # Cloudflare 配置
├── ecosystem.config.cjs       # PM2 配置
├── package.json               # 项目依赖
└── README.md                  # 项目文档
```

## 🛠️ 常用命令

```bash
# 数据库管理
npm run db:migrate:local     # 本地数据库迁移
npm run db:migrate:prod      # 生产数据库迁移
npm run db:seed              # 插入示例数据
npm run db:reset             # 重置本地数据库

# 开发和构建
npm run dev                  # Vite 开发服务器
npm run dev:sandbox          # Wrangler 本地开发
npm run build                # 构建生产版本
npm run preview              # 预览生产构建

# 部署
npm run deploy               # 部署到 Cloudflare Pages
npm run deploy:prod          # 部署到生产环境

# PM2 管理
pm2 start ecosystem.config.cjs    # 启动服务
pm2 logs model-hub --nostream     # 查看日志
pm2 restart model-hub             # 重启服务
pm2 stop model-hub                # 停止服务
pm2 delete model-hub              # 删除服务
```

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：

- **Issue**: 提交 GitHub Issue
- **Email**: [你的邮箱]
- **文档**: [项目文档链接]

## 📄 许可证

[MIT License](LICENSE)

---

**Built with ❤️ using Hono + Cloudflare Pages**

最后更新: 2026-02-26 (v1.1 - 应用场景维度支持)
