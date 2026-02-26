# Model Hub 产品需求文档 (PRD)

**文档版本**：v1.2  
**创建日期**：2026-02-26  
**产品负责人**：Frank  
**业务场景**：内容变现分发平台  

---

## 📋 文档目录

1. [产品概述](#产品概述)
2. [需求背景](#需求背景)
3. [用户角色](#用户角色)
4. [核心功能需求](#核心功能需求)
5. [数据模型设计](#数据模型设计)
6. [页面与交互设计](#页面与交互设计)
7. [API 接口设计](#api-接口设计)
8. [非功能性需求](#非功能性需求)
9. [产品路线图](#产品路线图)
10. [附录](#附录)

---

## 📖 产品概述

### 产品定位

**Model Hub** 是一款面向内容变现分发平台的 AI 模型接入管理系统，为平台管理员、开发人员和运维人员提供统一的模型厂商管理、调用监控、费用分析和智能切换能力。

### 核心价值

- **统一管理**：集中管理所有 AI 模型厂商和模型配置
- **成本优化**：实时监控模型调用费用，支持多维度成本分析
- **灵活切换**：按业务场景配置不同模型，支持快速手动切换
- **数据透明**：详细的调用日志和统计分析，辅助决策

### 产品目标

1. **降低成本**：通过费用监控和对比分析，优化模型选择，降低 15-30% 的 AI 调用成本
2. **提升效率**：简化模型接入流程，减少 80% 的手动配置时间
3. **保障稳定**：实时监控模型状态，快速定位问题，提升系统可用性至 99.9%

---

## 🎯 需求背景

### 业务痛点

#### 1. 多厂商接入复杂
- **问题描述**：平台需要对接多个 AI 模型厂商（OpenAI、Anthropic、国产大模型等），每个厂商有不同的 API 协议、认证方式、计费规则
- **影响范围**：开发团队需要维护多套接入代码，配置分散，管理成本高
- **期望效果**：统一管理所有厂商接入配置，标准化接入流程

#### 2. 费用管控困难
- **问题描述**：AI 模型调用费用按 Token 计费，不同模型价格差异大（GPT-4 vs GPT-3.5 相差 15 倍），缺乏实时费用监控
- **影响范围**：月度 AI 成本不可控，预算超支风险高，无法精确归因到业务场景
- **期望效果**：实时费用统计，按厂商/模型/场景多维度分析，支持预算告警

#### 3. 模型切换低效
- **问题描述**：需要根据业务需求（成本优化、性能提升、功能测试）切换模型，目前需要修改代码、重新部署
- **影响范围**：切换周期长（2-3 天），无法快速响应业务变化，缺乏切换记录追踪
- **期望效果**：支持页面化快速切换，按场景配置不同模型，完整的切换审计日志

#### 4. 调用数据不透明
- **问题描述**：缺乏统一的调用日志和性能监控，无法分析模型使用情况、性能瓶颈
- **影响范围**：故障排查困难，无法基于数据优化模型选择
- **期望效果**：详细的调用日志、可视化统计分析、性能监控仪表盘

### 业务场景

#### 场景 1：直连原厂模型
- **描述**：直接对接 OpenAI、Anthropic、Google 等国际大厂的官方 API
- **优势**：服务稳定性高、功能完整、技术支持好
- **劣势**：价格较高、国内访问可能受限

#### 场景 2：通过代理商接入
- **描述**：通过硅基流动、API2D 等国内代理商使用国际模型
- **优势**：国内访问稳定、支付便捷、价格可能有优惠
- **劣势**：多一层中间商、协议可能不完全兼容

#### 场景 3：多场景差异化配置
- **描述**：不同业务场景使用不同模型
  - **客服场景**：使用 GPT-3.5（成本低、响应快）
  - **内容生成**：使用 GPT-4（质量高）
  - **翻译场景**：使用 Claude 3（多语言能力强）
  - **数据分析**：使用 GLM-4（结构化数据处理好）

---

## 👥 用户角色

### 1. 超级管理员
- **角色定位**：平台负责人、技术总监
- **权限**：完全访问权限，所有功能可用
- **核心需求**：
  - 查看整体运营数据（调用量、费用趋势）
  - 管理厂商和模型配置
  - 审批重要的模型切换操作
  - 导出成本报表
- **典型场景**：每周查看费用报表，决策是否调整模型配置

### 2. 运维人员
- **角色定位**：DevOps 工程师、系统运维
- **权限**：监控、切换、配置权限（不含删除敏感数据）
- **核心需求**：
  - 实时监控模型调用状态和性能
  - 执行模型切换操作（手动/应急）
  - 处理故障告警
  - 查看调用日志定位问题
- **典型场景**：某模型出现大面积超时，紧急切换到备用模型

### 3. 开发人员
- **角色定位**：后端工程师、算法工程师
- **权限**：只读权限（查看配置、日志、统计数据）
- **核心需求**：
  - 查看模型配置和 API 参数
  - 分析调用日志，调试接口问题
  - 测试新模型的性能表现
  - 获取 Token 消耗和费用数据
- **典型场景**：新功能上线前，测试不同模型的效果和性能

---

## 🔧 核心功能需求

### MVP 功能（v1.0 已实现）

#### 1. 仪表盘（Dashboard）

**功能描述**：实时展示关键业务指标和运营数据

**核心指标**：
- **今日概览**（4 个关键指标卡片）
  - 总调用次数
  - Token 消耗总量（Input + Output）
  - 总费用（精确到分）
  - 平均响应时间
  - 成功率（成功次数 / 总次数）

- **厂商分布图**（饼图）
  - 显示 Top 5 厂商的调用占比
  - 点击厂商可跳转到该厂商的详细统计

- **热门模型排行**（表格）
  - Top 5 热门模型
  - 显示调用次数、Token 消耗、总费用
  - 按调用次数降序排列

**技术实现**：
- API 端点：`GET /api/dashboard/overview`
- 数据来源：`usage_logs` 表，实时聚合当天数据
- 前端：Chart.js 饼图 + 卡片式统计

**交互细节**：
- 页面自动刷新（可选，30 秒/次）
- 数字动画效果（数字递增动画）
- 支持日期筛选（今日/近 7 日/近 30 日）

---

#### 2. 接入管理（Providers）

**功能描述**：管理所有 AI 模型厂商的接入配置

##### 2.1 厂商列表

**展示形式**：卡片式布局（每行 3 个卡片）

**单个厂商卡片包含**：
- **Logo**：厂商图标（支持自定义 URL，默认占位图）
- **厂商名称**：显示名称（如 "OpenAI"）
- **接入类型**：
  - 绿色徽章 🔗 **直连原厂**
  - 蓝色徽章 🔀 **代理商**（显示代理商名称）
- **状态徽章**：
  - 🟢 **运行中** (active)
  - 🔴 **已禁用** (disabled)
  - 🟡 **维护中** (maintenance)
- **模型数量**：该厂商下的模型总数
- **优先级**：数字，越大越优先
- **操作按钮**：
  - **查看模型**：跳转到该厂商的模型列表（带 `provider_id` 参数）
  - **编辑**：修改厂商配置
  - **删除**：删除厂商（二次确认）

**筛选和排序**：
- 按接入类型筛选（全部/直连/代理）
- 按状态筛选（全部/运行中/已禁用/维护中）
- 按优先级排序
- 按创建时间排序

##### 2.2 添加厂商（v1.2 完善）

**功能描述**：通过表单创建新的厂商接入配置

**表单字段**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 厂商名称 | 文本 | ✅ | 如 "OpenAI"，用于显示 |
| 厂商标识 (Slug) | 文本 | ✅ | 如 "openai"，唯一标识，仅英文小写+连字符 |
| Logo URL | 文本 | ❌ | 图标地址，支持 https://cdn.simpleicons.org/ |
| 接入类型 | 单选 | ✅ | 直连原厂 / 代理商 |
| 代理商名称 | 文本 | 条件 | 仅当接入类型为"代理商"时显示和必填 |
| API Base URL | 文本 | ✅ | 如 https://api.openai.com/v1 |
| API Key | 密码 | ✅ | 密钥（加密存储，显示时遮蔽） |
| 认证方式 | 下拉 | ❌ | Bearer Token（默认）/ API Key / 自定义 |
| 自定义请求头 | 文本域 | ❌ | JSON 格式，如 `{"X-Custom": "value"}` |
| 优先级 | 数字 | ❌ | 默认 0，数字越大优先级越高 |

**表单验证规则**：
- **厂商名称**：2-50 字符
- **Slug**：3-30 字符，只能包含小写字母、数字、连字符，必须唯一
- **Logo URL**：必须是合法的 URL（https://）
- **API Base URL**：必须是合法的 URL，以 https:// 开头
- **API Key**：最少 16 字符
- **自定义请求头**：必须是合法的 JSON（可选）
- **优先级**：0-100 的整数

**交互流程**：
1. 点击"添加厂商"按钮 → 弹出模态框
2. 填写表单 → 实时验证
3. 选择"代理商"接入类型 → 自动显示"代理商名称"字段
4. 点击"提交" → 验证通过 → 发送 POST 请求
5. 成功 → 显示绿色提示条（3 秒后自动消失）→ 自动刷新厂商列表
6. 失败 → 显示错误提示

**API 端点**：`POST /api/providers`

**成功示例**：
```json
{
  "success": true,
  "data": {
    "id": 8,
    "message": "厂商创建成功"
  }
}
```

---

#### 3. 模型列表（Models）

**功能描述**：管理所有 AI 模型的配置信息

##### 3.1 模型列表展示

**展示形式**：表格布局

**表格列**：

| 列名 | 宽度 | 说明 |
|------|------|------|
| 模型 | 20% | 显示名称 + 模型 ID（小字） |
| 厂商 | 15% | 所属厂商名称 |
| **接入类型** (v1.2) | 10% | 🔗 直连 / 🔀 代理商 |
| 类型 | 10% | 文本/多模态/嵌入/图像 |
| 上下文长度 | 10% | 如 128K |
| 计费方式 | 15% | Token 计费 / 按次计费 / 混合计费 |
| 状态 | 10% | 运行中/已禁用/已弃用 |
| 操作 | 10% | 查看详情/编辑 |

**筛选功能**（v1.2 新增）：
- **按厂商过滤**：从接入管理点击"查看模型" → 只显示该厂商的模型
  - URL 参数：`?provider_id=1`
  - 显示面包屑：「模型列表」>「OpenAI」
  - 显示"返回厂商列表"按钮
- 按模型类型筛选（文本/多模态/嵌入/图像）
- 按状态筛选（运行中/已禁用）
- 搜索模型名称

**操作按钮**：
- **添加模型**（右上角）：创建新模型
- **查看详情**：显示完整配置信息
- **编辑**：修改模型配置
- **删除**：删除模型（二次确认）

##### 3.2 添加模型

**表单字段**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 所属厂商 | 下拉 | ✅ | 从已有厂商中选择 |
| 模型 ID | 文本 | ✅ | 如 "gpt-4-turbo-preview" |
| 显示名称 | 文本 | ✅ | 如 "GPT-4 Turbo" |
| 模型类型 | 单选 | ✅ | 文本/多模态/嵌入/图像 |
| 版本号 | 文本 | ❌ | 如 "0125" |
| 上下文长度 | 数字 | ❌ | 如 128000 |
| **能力标识**（多选）| 复选框 | ❌ | |
| ├─ 支持流式输出 | - | - | 默认勾选 |
| ├─ 支持函数调用 | - | - | - |
| └─ 支持视觉理解 | - | - | - |
| **计费配置** | - | - | - |
| 计费方式 | 单选 | ✅ | Token 计费 / 按次计费 / 混合计费 |
| Input Token 单价 | 数字 | 条件 | Token 计费时必填，元/1K tokens |
| Output Token 单价 | 数字 | 条件 | Token 计费时必填 |
| 固定费用 | 数字 | 条件 | 按次计费时必填，元/次 |
| 模型描述 | 文本域 | ❌ | 备注信息 |

**动态显示逻辑**：
- 选择"Token 计费" → 显示 Input/Output 单价字段
- 选择"按次计费" → 显示固定费用字段
- 选择"混合计费" → 显示全部费用字段

**API 端点**：`POST /api/models`

---

#### 4. 统计分析（Stats）v1.2 重构

**功能描述**：多维度数据分析，支持成本统计和调用日志两个视图

##### 4.1 Tab 结构（v1.2 新增）

**Tab 1：成本统计**

**子模块 1：历史趋势图（7 天）**
- **图表类型**：折线图（双 Y 轴）
- **X 轴**：日期（最近 7 天）
- **Y 轴左**：调用次数（条形图）
- **Y 轴右**：费用金额（折线图，元）
- **数据点**：每天的调用量和费用
- **交互**：鼠标悬停显示详细数据

**子模块 2：按业务场景拆解（v1.2 新增）**

**展示形式**：6 个场景卡片（2 行 3 列）

**场景列表**：
1. 🌐 **全局默认** (default)
2. 💬 **客服对话** (customer-service)
3. ✍️ **内容生成** (content-generation)
4. 🌍 **翻译** (translation)
5. 📊 **数据分析** (analysis)
6. 📝 **摘要总结** (summarization)

**每个场景卡片显示**：
- **场景图标和名称**
- **调用次数**：最近 30 天
- **总费用**：精确到分
- **Input Token**：格式化显示（如 1.2K）
- **Output Token**
- **平均响应时间**：毫秒
- **费用占比**：进度条（该场景费用 / 总费用）

**数据来源**：
- API：`GET /api/stats/by-scenario?days=30`
- 从 `usage_logs` 表按 `scenario` 字段分组统计

**子模块 3：按厂商费用统计（30 天）**

**展示形式**：卡片列表（Top 5 厂商）

**每个厂商卡片**：
- **厂商 Logo 和名称**
- **接入类型**：直连/代理商徽章
- **调用次数**
- **Input/Output Token**：分别显示
- **总费用**：大字号，精确到分
- **费用占比**：进度条
- **成本趋势**：小型折线图（可选）

---

**Tab 2：调用日志**（v1.2 从独立菜单移入）

**展示形式**：表格（最近 30 条记录）

**表格列**：

| 列名 | 宽度 | 说明 |
|------|------|------|
| 时间 | 12% | 精确到秒 |
| **场景** (v1.2) | 10% | 业务场景徽章 |
| 模型 | 15% | 模型名称 + 厂商 |
| Token | 12% | Input/Output/Total |
| 费用 | 10% | 精确到分，¥0.12 |
| 响应时间 | 8% | 毫秒 |
| 状态 | 8% | 成功/失败/超时 |
| 来源 | 10% | 调用来源 |
| 操作 | 5% | 查看详情 |

**筛选功能**：
- 时间范围筛选（今日/近 7 天/近 30 天/自定义）
- 按场景筛选（6 个场景 + 全部）
- 按厂商筛选
- 按模型筛选
- 按状态筛选（成功/失败/超时）

**分页**：
- 每页 20 条记录
- 支持跳转到指定页

**API 端点**：`GET /api/logs?page=1&limit=20`

---

#### 5. 场景路由（Model Switch）v1.2 重构

**功能描述**：按业务场景配置和切换 AI 模型

##### 5.1 场景路由页面（v1.2 全新设计）

**展示形式**：6 个场景卡片（3 行 2 列或 2 行 3 列）

**每个场景卡片包含**：

**顶部区域**：
- **场景图标**：大号彩色图标
- **场景名称**：中文名称（如"客服对话"）
- **场景标识**：英文 ID（如 customer-service）

**中间区域（当前配置）**：
- **当前模型**：
  - 厂商 Logo（32x32）
  - 模型名称（GPT-3.5 Turbo）
  - **接入类型徽章**：🔗 直连 / 🔀 代理商
- **计费信息**：
  - Input：$0.0005/1K tokens
  - Output：$0.0015/1K tokens
- **最后更新时间**：相对时间（如"2 小时前"）

**底部操作按钮**：
- **切换模型**（主按钮）：打开模型选择模态框
- **配置**（次按钮）：如果该场景未配置模型

**空状态**：
- 显示"未配置模型"占位图
- 显示"立即配置"按钮

##### 5.2 切换模型流程（v1.2 优化）

**Step 1：点击"切换模型"**
- 打开模态框，标题显示当前场景名称（如"切换模型 - 客服对话"）

**Step 2：选择目标模型**

**模型列表展示**：
- **表格布局**，每行一个模型
- **列信息**：
  - 复选框（单选）
  - 厂商 Logo
  - 模型名称 + 接入类型徽章
  - 模型类型（文本/多模态）
  - 计费信息（Input/Output 单价）
  - 上下文长度
- **当前模型高亮**：带"当前使用"标签，禁用选择
- **点击行可选中**

**Step 3：填写切换信息**

**切换原因**（v1.2 改为下拉菜单）：
- **性能优化**：提升响应速度或处理能力
- **成本优化**：降低调用费用
- **功能升级**：使用新功能（如视觉理解）
- **故障转移**：原模型异常，切换到备用
- **测试验证**：新模型效果测试
- **其他**：显示文本输入框，手动填写原因

**操作人员**（v1.2 新增）：
- 文本输入框
- 必填，记录操作人姓名或工号
- 用于审计追踪

**Step 4：确认切换**
- 显示切换信息摘要：
  - 当前模型：[模型 A]
  - 目标模型：[模型 B]
  - 场景：[客服对话]
  - 原因：[成本优化]
  - 操作人：[张三]
- 点击"确认切换"按钮
- 显示 Loading 状态
- 成功 → 绿色 Toast 提示"切换成功"
- **自动刷新场景卡片**（v1.2 新增）：显示最新配置的模型

**API 端点**：
```
POST /api/switch-model
Body: {
  "scenario": "customer-service",
  "to_model_id": 5,
  "reason": "成本优化",
  "operator": "张三"
}
```

##### 5.3 切换历史

**展示位置**：场景路由页面底部

**展示形式**：时间线列表（最近 20 条记录）

**每条记录包含**：
- **时间**：精确到秒
- **场景标签**：彩色徽章（如 💬 客服对话）
- **切换内容**：[原模型] → [目标模型]
- **状态徽章**：成功/失败/回滚
- **操作人**：姓名
- **原因**：切换原因文本

**筛选功能**：
- 按场景筛选
- 按操作人筛选
- 按日期范围筛选

**API 端点**：`GET /api/switch-history`

---

### 待实现功能（Roadmap）

#### Phase 2：权限与安全（v2.0）

##### 功能 1：用户权限管理

**角色权限矩阵**：

| 功能模块 | 超级管理员 | 运维人员 | 开发人员 |
|----------|-----------|---------|---------|
| 仪表盘 | ✅ 完整访问 | ✅ 完整访问 | ✅ 只读 |
| 接入管理 - 查看 | ✅ | ✅ | ✅ |
| 接入管理 - 添加/编辑 | ✅ | ✅ | ❌ |
| 接入管理 - 删除 | ✅ | ❌ | ❌ |
| 模型列表 - 查看 | ✅ | ✅ | ✅ |
| 模型列表 - 添加/编辑 | ✅ | ✅ | ❌ |
| 模型列表 - 删除 | ✅ | ❌ | ❌ |
| 统计分析 | ✅ | ✅ | ✅ 只读 |
| 调用日志 | ✅ | ✅ | ✅ 只读 |
| 场景路由 - 查看 | ✅ | ✅ | ✅ |
| 场景路由 - 切换模型 | ✅ | ✅ | ❌ |
| 导出报表 | ✅ | ✅ | ❌ |

**实现要点**：
- 基于 JWT 的身份认证
- RBAC（基于角色的访问控制）
- 前端路由守卫 + 后端接口鉴权
- 操作日志审计

##### 功能 2：API 密钥安全管理

**需求描述**：
- API Key 加密存储（AES-256）
- 密钥轮换机制（定期更新）
- 密钥版本管理
- 密钥泄露告警

**实现方案**：
- 使用 Cloudflare Secrets 存储加密密钥
- 密钥展示时脱敏（显示前 4 位+后 4 位）
- 支持密钥到期提醒

---

#### Phase 3：智能优化（v3.0）

##### 功能 1：自动故障转移

**触发条件**：
- 模型连续失败率 > 50%（5 分钟内）
- 平均响应时间 > 设定阈值（如 10 秒）
- 厂商维护通知

**转移策略**：
- **按优先级**：自动切换到同场景的备用模型（按优先级从高到低尝试）
- **按成本**：选择成本最低的可用模型
- **按性能**：选择响应时间最快的模型

**转移流程**：
1. 检测到故障
2. 发送告警通知（Webhook、邮件、短信）
3. 自动执行切换
4. 记录切换日志（标记为"自动故障转移"）
5. 通知管理员

**回滚机制**：
- 原模型恢复正常后，自动回滚（可配置）
- 手动强制回滚

##### 功能 2：灰度切换

**功能描述**：新模型上线时，先分配 10% 流量测试，逐步提升到 100%

**配置参数**：
- **灰度比例**：10% → 30% → 50% → 100%
- **观察时长**：每个阶段持续时间（如 30 分钟）
- **自动提升**：满足条件自动提升（或手动）
- **中止条件**：错误率 > 阈值，自动中止并回滚

**实现方案**：
- 在 `active_model_config` 表增加 `canary_model_id` 和 `canary_ratio` 字段
- API 网关根据比例分流请求
- 实时监控两个模型的性能对比

##### 功能 3：成本优化建议

**AI 分析引擎**（基于历史数据）：
- **分析维度**：
  - 各场景的调用特征（Token 长度、频率）
  - 不同模型的成本 vs 性能对比
  - 高成本调用场景识别
- **优化建议**：
  - 建议切换到性价比更高的模型
  - 识别可缓存的重复请求
  - 预测月度成本趋势

**展示形式**：
- 仪表盘顶部显示"智能建议"卡片
- 每条建议包含：
  - 优化场景（如"客服对话"）
  - 当前模型（GPT-4）
  - 建议模型（GPT-3.5）
  - 预计节省（30% 成本，每月节省 ¥1,200）
  - 风险评估（响应质量可能略有下降）
- 一键应用建议（执行切换）

---

#### Phase 4：高级功能（v4.0）

##### 功能 1：预算管理与告警

**预算配置**：
- **预算类型**：日预算、月预算、年预算
- **预算金额**：设定金额上限
- **告警阈值**：达到预算的 80%、90%、100% 时告警
- **超预算策略**：
  - 仅告警（继续运行）
  - 自动降级（切换到低成本模型）
  - 暂停服务（停止调用）

**告警通知**：
- **通知方式**：站内消息、邮件、Webhook、企业微信/钉钉
- **通知频率**：即时、每日汇总、每周汇总
- **通知内容**：
  - 当前费用 / 预算
  - 超预算原因分析（哪个场景/模型费用激增）
  - 优化建议

##### 功能 2：健康检查自动化

**定时检查**：
- 每 5 分钟检查一次所有启用的厂商
- 检查方式：调用 `/health` 或 `/ping` 接口（或实际调用一次）

**健康指标**：
- **可用性**：能否正常响应
- **响应时间**：平均延迟
- **错误率**：近 5 分钟的失败率

**健康状态**：
- 🟢 **健康**：响应正常，延迟 < 2 秒，错误率 < 5%
- 🟡 **预警**：延迟 2-5 秒或错误率 5-20%
- 🔴 **异常**：无法响应或延迟 > 5 秒或错误率 > 20%

**自动处理**：
- 状态变为"异常" → 发送告警
- 持续异常 > 10 分钟 → 触发自动故障转移
- 恢复健康 → 发送恢复通知

##### 功能 3：报表导出

**支持格式**：
- **Excel**（.xlsx）：适合数据分析
- **PDF**：适合打印和归档
- **CSV**：适合二次加工

**报表类型**：
1. **费用报表**
   - 按日/周/月汇总
   - 按厂商、模型、场景分组
   - 包含趋势图和占比图
   
2. **调用报表**
   - 调用明细（时间、模型、Token、费用、状态）
   - 支持筛选条件（时间范围、场景、状态）
   
3. **性能报表**
   - 各模型的平均响应时间
   - 成功率统计
   - 异常日志汇总

**导出功能**：
- 统计分析页面右上角"导出报表"按钮
- 选择报表类型、时间范围、格式
- 后台生成（大数据量时异步）
- 下载链接（24 小时有效）

##### 功能 4：A/B 测试支持

**功能描述**：在同一场景下，对比两个模型的效果

**配置参数**：
- **测试模型 A**：当前模型
- **测试模型 B**：新模型
- **流量分配**：A:B = 80:20 或 50:50
- **测试时长**：如 7 天
- **对比维度**：
  - 响应质量（需业务方打分）
  - 响应时间
  - 成本
  - 成功率

**数据分析**：
- 实时对比看板
- 显著性检验（统计学分析）
- 综合评分（加权多指标）

**结论输出**：
- 推荐模型（自动或手动决策）
- 一键切换到优胜模型

---

## 📊 数据模型设计

### 数据库表结构

#### 1. model_providers（模型厂商表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| name | TEXT | NOT NULL | 厂商名称 |
| slug | TEXT | UNIQUE NOT NULL | 厂商标识（唯一） |
| logo_url | TEXT | - | Logo URL |
| access_type | TEXT | NOT NULL | 接入类型（direct/proxy） |
| proxy_name | TEXT | - | 代理商名称 |
| api_base_url | TEXT | NOT NULL | API Base URL |
| api_key | TEXT | NOT NULL | API Key（加密存储） |
| auth_type | TEXT | DEFAULT 'bearer' | 认证方式 |
| custom_headers | TEXT | - | 自定义请求头（JSON） |
| status | TEXT | DEFAULT 'active' | 状态（active/disabled/maintenance） |
| priority | INTEGER | DEFAULT 0 | 优先级 |
| health_check_url | TEXT | - | 健康检查 URL |
| last_health_check | DATETIME | - | 上次检查时间 |
| is_healthy | INTEGER | DEFAULT 1 | 是否健康（1=是，0=否） |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |

**索引**：
- `idx_providers_status` ON (status)
- `idx_providers_priority` ON (priority DESC)

---

#### 2. models（模型表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| provider_id | INTEGER | NOT NULL, FK | 所属厂商 ID |
| model_id | TEXT | NOT NULL | 模型 ID（如 gpt-4） |
| display_name | TEXT | NOT NULL | 显示名称 |
| model_type | TEXT | NOT NULL | 模型类型（text/multimodal/embedding/image） |
| version | TEXT | - | 版本号 |
| context_length | INTEGER | - | 上下文长度 |
| supports_streaming | INTEGER | DEFAULT 1 | 支持流式输出（1=是，0=否） |
| supports_function_call | INTEGER | DEFAULT 0 | 支持函数调用 |
| supports_vision | INTEGER | DEFAULT 0 | 支持视觉理解 |
| status | TEXT | DEFAULT 'active' | 状态（active/disabled/deprecated） |
| avg_latency | INTEGER | - | 平均响应时间（ms） |
| max_concurrency | INTEGER | - | 最大并发数 |
| daily_quota | INTEGER | - | 每日配额 |
| description | TEXT | - | 模型描述 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |

**索引**：
- `idx_models_provider` ON (provider_id)
- `idx_models_status` ON (status)

**唯一约束**：
- UNIQUE (provider_id, model_id)

---

#### 3. pricing_rules（计费规则表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| model_id | INTEGER | NOT NULL, FK | 模型 ID |
| billing_type | TEXT | NOT NULL | 计费方式（token/per_call/hybrid） |
| input_price | REAL | DEFAULT 0 | Input Token 单价（元/1K tokens） |
| output_price | REAL | DEFAULT 0 | Output Token 单价 |
| fixed_price | REAL | DEFAULT 0 | 固定费用（按次） |
| min_charge | REAL | DEFAULT 0 | 最低收费 |
| effective_date | DATE | NOT NULL | 生效日期 |
| is_current | INTEGER | DEFAULT 1 | 是否当前有效（1=是，0=否） |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

**索引**：
- `idx_pricing_model` ON (model_id)
- `idx_pricing_current` ON (is_current)

---

#### 4. usage_logs（调用日志表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| request_id | TEXT | UNIQUE NOT NULL | 请求唯一标识 |
| provider_id | INTEGER | NOT NULL, FK | 厂商 ID |
| model_id | INTEGER | NOT NULL, FK | 模型 ID |
| input_tokens | INTEGER | DEFAULT 0 | Input Token 数 |
| output_tokens | INTEGER | DEFAULT 0 | Output Token 数 |
| total_tokens | INTEGER | DEFAULT 0 | 总 Token 数 |
| input_cost | REAL | DEFAULT 0 | Input Token 费用 |
| output_cost | REAL | DEFAULT 0 | Output Token 费用 |
| fixed_cost | REAL | DEFAULT 0 | 固定费用 |
| total_cost | REAL | DEFAULT 0 | 总费用 |
| latency | INTEGER | - | 响应时间（ms） |
| status | TEXT | NOT NULL | 状态（success/error/timeout） |
| error_message | TEXT | - | 错误信息 |
| error_type | TEXT | - | 错误类型 |
| request_params | TEXT | - | 请求参数（JSON） |
| source | TEXT | - | 调用来源 |
| user_id | TEXT | - | 用户 ID |
| scenario | TEXT | - | 业务场景 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

**索引**：
- `idx_logs_created` ON (created_at)
- `idx_logs_model` ON (model_id)
- `idx_logs_provider` ON (provider_id)
- `idx_logs_status` ON (status)
- `idx_logs_scenario` ON (scenario)

---

#### 5. model_switches（模型切换记录表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| from_model_id | INTEGER | FK | 原模型 ID（可为空） |
| to_model_id | INTEGER | NOT NULL, FK | 目标模型 ID |
| switch_type | TEXT | DEFAULT 'full' | 切换类型（full/canary） |
| reason | TEXT | NOT NULL | 切换原因 |
| operator | TEXT | NOT NULL | 操作人员 |
| scenario | TEXT | NOT NULL | 业务场景 |
| scheduled_at | DATETIME | - | 计划执行时间 |
| executed_at | DATETIME | - | 实际执行时间 |
| status | TEXT | DEFAULT 'pending' | 状态（pending/success/failed/rollback） |
| result_message | TEXT | - | 执行结果信息 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

**索引**：
- `idx_switches_executed` ON (executed_at)
- `idx_switches_scenario` ON (scenario)

---

#### 6. active_model_config（当前激活模型配置表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| scenario | TEXT | UNIQUE NOT NULL | 场景标识 |
| model_id | INTEGER | NOT NULL, FK | 当前使用的模型 ID |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |

**唯一约束**：
- UNIQUE (scenario)

---

#### 7. budget_configs（预算配置表）v2.0

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| name | TEXT | NOT NULL | 预算名称 |
| budget_type | TEXT | NOT NULL | 预算类型（monthly/daily/yearly） |
| budget_amount | REAL | NOT NULL | 预算金额 |
| alert_threshold | INTEGER | DEFAULT 80 | 告警阈值百分比 |
| start_date | DATE | NOT NULL | 开始日期 |
| end_date | DATE | - | 结束日期 |
| is_active | INTEGER | DEFAULT 1 | 是否启用 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |

---

### 数据关系图

```
┌─────────────────┐
│ model_providers │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐       ┌─────────────────┐
│     models      ├───N───┤  pricing_rules  │
└────────┬────────┘       └─────────────────┘
         │ 1
         │
         │ N
┌────────▼────────┐       ┌─────────────────────┐
│   usage_logs    │       │  model_switches     │
└─────────────────┘       └─────────────────────┘
                          
                          ┌─────────────────────┐
                          │ active_model_config │
                          └─────────────────────┘
```

---

## 🎨 页面与交互设计

### UI 设计规范

#### 设计风格：科技简洁风

**颜色方案**：
- **主色调**：紫色渐变 (#667eea → #764ba2)
- **辅助色**：
  - 蓝色 (#3b82f6)：信息提示、链接
  - 绿色 (#10b981)：成功、运行中
  - 橙色 (#f59e0b)：警告、维护中
  - 红色 (#ef4444)：错误、禁用
- **中性色**：
  - 深灰 (#1f2937)：主要文本
  - 中灰 (#6b7280)：次要文本
  - 浅灰 (#f3f4f6)：背景
  - 白色 (#ffffff)：卡片背景

**卡片样式**：
- **玻璃态效果**（Glass Morphism）
  - 半透明白色背景：`rgba(255, 255, 255, 0.95)`
  - 背景模糊：`backdrop-filter: blur(10px)`
  - 边框：`1px solid rgba(255, 255, 255, 0.3)`
  - 圆角：`border-radius: 16px`
- **阴影**：`box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1)`
- **悬停效果**：
  - 向上平移 5px：`transform: translateY(-5px)`
  - 加强阴影：`box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15)`

**字体**：
- **主字体**：-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
- **代码字体**：Menlo, Monaco, Consolas, "Courier New", monospace
- **字号**：
  - 标题 H1：30px / 2rem
  - 标题 H2：24px / 1.5rem
  - 正文：16px / 1rem
  - 小字：14px / 0.875rem

**图标库**：Font Awesome 6.4.0

**图表库**：Chart.js 4.4.0

---

### 响应式布局

**断点设置**：
- **桌面端**（≥1024px）：3 列网格布局
- **平板端**（768px - 1023px）：2 列网格布局
- **移动端**（<768px）：单列堆叠布局

**导航栏**：
- 桌面端：左侧固定侧边栏（宽度 240px）
- 移动端：顶部折叠菜单（汉堡图标）

---

### 交互动画

**页面切换**：
- 淡入效果：`fade-in 0.3s ease-in-out`
- 内容从下向上滑入：`slide-up 0.4s ease-out`

**按钮交互**：
- 悬停：背景色加深 10%
- 点击：缩放至 95%（`transform: scale(0.95)`）
- Loading 状态：显示旋转 Spinner

**数据加载**：
- 骨架屏（Skeleton Screen）：灰色占位块闪烁动画
- 加载完成：淡入显示真实内容

**数字动画**：
- 仪表盘数字：从 0 递增到目标值（CountUp 效果）
- 持续时间：1 秒

---

## 🔌 API 接口设计

### 接口规范

**Base URL**：`/api`

**请求格式**：`application/json`

**响应格式**：
```json
{
  "success": true,
  "data": { /* 业务数据 */ },
  "message": "操作成功",
  "error": null,
  "timestamp": "2026-02-26T10:30:00Z"
}
```

**错误响应**：
```json
{
  "success": false,
  "data": null,
  "message": "错误描述",
  "error": {
    "code": "INVALID_PARAMETER",
    "details": "具体错误信息"
  },
  "timestamp": "2026-02-26T10:30:00Z"
}
```

**HTTP 状态码**：
- `200 OK`：成功
- `201 Created`：创建成功
- `400 Bad Request`：请求参数错误
- `401 Unauthorized`：未授权
- `403 Forbidden`：无权限
- `404 Not Found`：资源不存在
- `500 Internal Server Error`：服务器错误

---

### 接口列表

#### 1. 厂商管理接口

**1.1 获取厂商列表**
```
GET /api/providers

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "OpenAI",
      "slug": "openai",
      "logo_url": "https://cdn.simpleicons.org/openai",
      "access_type": "direct",
      "status": "active",
      "model_count": 3,
      "active_model_count": 3,
      "priority": 10
    }
  ]
}
```

**1.2 创建厂商**
```
POST /api/providers

Request Body:
{
  "name": "OpenAI",
  "slug": "openai",
  "logo_url": "https://cdn.simpleicons.org/openai",
  "access_type": "direct",
  "api_base_url": "https://api.openai.com/v1",
  "api_key": "sk-xxxxx",
  "auth_type": "bearer",
  "priority": 10
}

Response:
{
  "success": true,
  "data": {
    "id": 8
  },
  "message": "厂商创建成功"
}
```

**1.3 更新厂商**
```
PUT /api/providers/:id

Request Body: (同创建接口)

Response:
{
  "success": true,
  "message": "厂商更新成功"
}
```

**1.4 删除厂商**
```
DELETE /api/providers/:id

Response:
{
  "success": true,
  "message": "厂商删除成功"
}
```

---

#### 2. 模型管理接口

**2.1 获取模型列表**
```
GET /api/models?provider_id=1

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "provider_id": 1,
      "provider_name": "OpenAI",
      "access_type": "direct",
      "model_id": "gpt-4-turbo-preview",
      "display_name": "GPT-4 Turbo",
      "model_type": "text",
      "context_length": 128000,
      "status": "active",
      "input_price": 0.01,
      "output_price": 0.03,
      "billing_type": "token"
    }
  ]
}
```

**2.2 创建模型**
```
POST /api/models

Request Body:
{
  "provider_id": 1,
  "model_id": "gpt-4-turbo-preview",
  "display_name": "GPT-4 Turbo",
  "model_type": "text",
  "context_length": 128000,
  "supports_streaming": true,
  "billing_type": "token",
  "input_price": 0.01,
  "output_price": 0.03
}

Response:
{
  "success": true,
  "data": {
    "id": 14
  },
  "message": "模型创建成功"
}
```

**2.3 更新模型**
```
PUT /api/models/:id

Request Body: (同创建接口，可选字段)

Response:
{
  "success": true,
  "message": "模型更新成功"
}
```

**2.4 删除模型**
```
DELETE /api/models/:id

Response:
{
  "success": true,
  "message": "模型删除成功"
}
```

---

#### 3. 统计分析接口

**3.1 仪表盘概览**
```
GET /api/dashboard/overview

Response:
{
  "success": true,
  "data": {
    "today": {
      "total_calls": 156,
      "total_tokens": 45230,
      "total_cost": 1.26,
      "avg_latency": 1245,
      "success_rate": 98.7
    },
    "providers": [
      {
        "provider_name": "OpenAI",
        "logo_url": "...",
        "call_count": 100,
        "total_cost": 0.89
      }
    ],
    "topModels": [
      {
        "display_name": "GPT-3.5 Turbo",
        "provider_name": "OpenAI",
        "call_count": 80,
        "total_tokens": 25000,
        "total_cost": 0.50
      }
    ]
  }
}
```

**3.2 历史趋势统计**
```
GET /api/stats/history?days=7

Response:
{
  "success": true,
  "data": [
    {
      "date": "2026-02-20",
      "call_count": 120,
      "total_cost": 3.45,
      "avg_latency": 1234,
      "success_rate": 99.2
    }
  ]
}
```

**3.3 费用统计**
```
GET /api/stats/costs?group_by=provider&days=30

Response:
{
  "success": true,
  "data": [
    {
      "name": "OpenAI",
      "call_count": 3000,
      "total_cost": 89.50,
      "input_tokens": 1500000,
      "output_tokens": 750000
    }
  ]
}
```

**3.4 按场景统计**
```
GET /api/stats/by-scenario?days=30

Response:
{
  "success": true,
  "data": [
    {
      "scenario": "customer-service",
      "call_count": 1500,
      "total_cost": 45.30,
      "input_tokens": 800000,
      "output_tokens": 400000,
      "avg_latency": 1200
    }
  ]
}
```

**3.5 调用日志**
```
GET /api/logs?page=1&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "request_id": "req_xxx",
      "created_at": "2026-02-26 10:30:15",
      "scenario": "customer-service",
      "model_name": "GPT-3.5 Turbo",
      "provider_name": "OpenAI",
      "input_tokens": 150,
      "output_tokens": 200,
      "total_cost": 0.08,
      "latency": 1234,
      "status": "success"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500
  }
}
```

---

#### 4. 模型切换接口

**4.1 获取所有场景的激活模型**
```
GET /api/active-models/all

Response:
{
  "success": true,
  "data": [
    {
      "scenario": "default",
      "model_id": 3,
      "display_name": "GPT-3.5 Turbo",
      "provider_name": "OpenAI",
      "access_type": "direct",
      "input_price": 0.0005,
      "output_price": 0.0015,
      "updated_at": "2026-02-26 10:00:00"
    }
  ]
}
```

**4.2 执行模型切换**
```
POST /api/switch-model

Request Body:
{
  "scenario": "customer-service",
  "to_model_id": 5,
  "reason": "成本优化",
  "operator": "张三"
}

Response:
{
  "success": true,
  "message": "模型切换成功"
}
```

**4.3 获取切换历史**
```
GET /api/switch-history

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "scenario": "customer-service",
      "from_model_name": "GPT-4",
      "to_model_name": "GPT-3.5 Turbo",
      "reason": "成本优化",
      "operator": "张三",
      "executed_at": "2026-02-26 10:30:00",
      "status": "success"
    }
  ]
}
```

---

## 🚀 非功能性需求

### 性能要求

**响应时间**：
- API 接口响应时间 < 500ms（90 分位）
- 页面首屏加载时间 < 2 秒
- 大数据量查询（如日志）支持分页，单页加载 < 1 秒

**并发支持**：
- 支持 100+ 并发用户同时访问
- 数据库连接池配置：最小 5，最大 50

**数据量**：
- 调用日志表支持百万级数据查询
- 历史数据保留 90 天（可配置）

---

### 可用性要求

**系统可用性**：≥ 99.9%（每月停机时间 < 43 分钟）

**容错机制**：
- API 请求失败自动重试（最多 3 次）
- 数据库连接失败自动重连
- 前端请求超时提示（30 秒）

**降级策略**：
- 统计分析页面数据加载失败时，显示缓存数据
- 图表渲染失败时，降级为表格展示

---

### 安全要求

**身份认证**（v2.0）：
- 基于 JWT 的无状态认证
- Token 有效期：7 天
- 支持刷新 Token

**数据安全**：
- API Key 加密存储（AES-256）
- 敏感字段（如密钥）脱敏显示
- 防止 SQL 注入（参数化查询）
- 防止 XSS 攻击（输入过滤 + 输出转义）

**操作审计**：
- 所有关键操作记录日志（创建/修改/删除/切换）
- 日志包含：操作人、操作时间、操作内容、IP 地址

---

### 兼容性要求

**浏览器支持**：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**移动端支持**：
- iOS 14+ Safari
- Android 10+ Chrome

**数据库**：
- Cloudflare D1（SQLite 兼容）
- 支持本地 SQLite 开发环境

---

### 可维护性要求

**代码规范**：
- 前端：ESLint + Prettier
- 后端：TypeScript 严格模式
- 代码注释覆盖率 > 30%

**文档完善**：
- API 接口文档（本 PRD）
- 数据库设计文档
- 部署运维文档

**日志记录**：
- 应用日志：记录关键操作和错误
- 访问日志：记录所有 API 请求
- 性能日志：记录慢查询（> 1 秒）

---

## 📅 产品路线图

### v1.0（已完成）- 2026-02-25
- ✅ 基础架构搭建（Hono + Cloudflare D1）
- ✅ 仪表盘（实时监控）
- ✅ 接入管理（厂商 CRUD）
- ✅ 模型列表（模型 CRUD）
- ✅ 统计分析（历史趋势、费用统计）
- ✅ 调用日志（分页查询）
- ✅ 模型切换（手动切换、切换历史）
- ✅ 示例数据（7 厂商 + 13 模型 + 30+ 日志）

### v1.1（已完成）- 2026-02-26 上午
- ✅ UI 优化（厂商图标、卡片布局、图表高度）
- ✅ 应用场景维度切换（6 个场景）
- ✅ 切换原因下拉菜单（预设选项）
- ✅ 改进切换交互（新模态框设计）
- ✅ 切换历史展示场景标签

### v1.2（已完成）- 2026-02-26 下午
- ✅ 模型列表按厂商过滤
- ✅ 新增"接入类型"列
- ✅ 完善"添加厂商"功能（表单验证、动态字段）
- ✅ 统计分析 Tab 结构（成本统计 + 调用日志）
- ✅ 按业务场景拆解统计
- ✅ 场景路由页面重构（卡片式展示）
- ✅ 真正的模型切换（切换后自动刷新）
- ✅ 导航优化（移除独立日志菜单）

### v2.0（计划中）- 2026-03-15
- ⏳ 用户权限管理（超级管理员/运维/开发）
- ⏳ API 密钥安全管理（加密存储、轮换机制）
- ⏳ 预算管理与告警（月度预算、阈值告警）
- ⏳ 健康检查自动化（定时检测、状态监控）
- ⏳ Webhook 通知（告警、切换通知）
- ⏳ 报表导出（Excel/PDF）

### v3.0（规划中）- 2026-Q2
- ⏳ 自动故障转移（基于健康检查）
- ⏳ 灰度切换（流量逐步迁移）
- ⏳ 成本优化建议（AI 分析引擎）
- ⏳ 模型性能对比分析
- ⏳ A/B 测试支持

### v4.0（长期规划）- 2026-Q3
- ⏳ 自定义仪表盘（拖拽配置）
- ⏳ 实时监控告警（大屏展示）
- ⏳ 多租户支持（企业版）
- ⏳ API 网关集成（统一入口）
- ⏳ 智能路由（基于负载、成本自动选择模型）

---

## 📚 附录

### A. 业务场景映射表

| 场景标识 | 中文名称 | 英文标识 | 推荐模型类型 | 典型用例 |
|---------|---------|---------|------------|---------|
| default | 全局默认 | default | 文本/多模态 | 未指定场景的调用 |
| customer-service | 客服对话 | customer-service | 文本 | 在线客服、FAQ 问答 |
| content-generation | 内容生成 | content-generation | 文本/多模态 | 文章生成、营销文案 |
| translation | 翻译 | translation | 文本 | 多语言翻译 |
| analysis | 数据分析 | analysis | 文本 | 数据解读、趋势分析 |
| summarization | 摘要总结 | summarization | 文本 | 长文总结、提取关键信息 |

---

### B. 模型类型说明

| 类型 | 英文标识 | 说明 | 典型模型 |
|-----|---------|------|---------|
| 文本 | text | 纯文本输入输出 | GPT-3.5, GPT-4, Claude 3 |
| 多模态 | multimodal | 支持文本+图像输入 | GPT-4V, Claude 3 Opus |
| 嵌入 | embedding | 文本向量化 | text-embedding-3-small |
| 图像 | image | 文本生成图像 | DALL-E 3, Midjourney |

---

### C. 状态码定义

**厂商状态（status）**：
- `active`：运行中（绿色）
- `disabled`：已禁用（红色）
- `maintenance`：维护中（黄色）

**模型状态（status）**：
- `active`：运行中
- `disabled`：已禁用
- `deprecated`：已弃用（旧版本）

**调用状态（status）**：
- `success`：成功
- `error`：错误（API 返回错误）
- `timeout`：超时（响应时间 > 30 秒）

**切换状态（status）**：
- `pending`：待执行（计划切换）
- `success`：成功
- `failed`：失败
- `rollback`：已回滚

---

### D. 计费方式说明

**Token 计费（token）**：
- 按 Input Token 和 Output Token 分别计费
- 价格单位：元/1K tokens
- 计算公式：
  ```
  Input 费用 = (Input Tokens / 1000) × Input 单价
  Output 费用 = (Output Tokens / 1000) × Output 单价
  总费用 = Input 费用 + Output 费用
  ```

**按次计费（per_call）**：
- 每次调用固定费用
- 不论 Token 数量多少
- 适用于嵌入模型、图像生成

**混合计费（hybrid）**：
- 基础费用 + Token 费用
- 适用于特殊模型

---

### E. 技术栈清单

**后端**：
- Hono 4.12.2（Web 框架）
- Cloudflare D1（数据库）
- TypeScript 5.x（类型系统）
- Wrangler 4.4.0（开发工具）

**前端**：
- Vanilla JavaScript（无框架）
- Tailwind CSS（CSS 框架）
- Chart.js 4.4.0（图表库）
- Font Awesome 6.4.0（图标库）

**部署**：
- Cloudflare Pages（边缘计算平台）
- PM2（进程管理，本地开发）

**开发工具**：
- Vite 6.3.5（构建工具）
- Git（版本控制）
- GitHub（代码托管）

---

### F. 术语表

| 术语 | 英文 | 说明 |
|-----|------|------|
| 厂商 | Provider | AI 模型提供商（如 OpenAI） |
| 模型 | Model | 具体的 AI 模型（如 GPT-4） |
| Token | Token | 文本单元（约 0.75 个英文单词或 0.5 个中文字符） |
| 接入类型 | Access Type | 直连原厂（direct）或代理商（proxy） |
| 场景 | Scenario | 业务场景（如客服、内容生成） |
| 切换 | Switch | 更换当前使用的模型 |
| 灰度 | Canary | 逐步切换流量的策略 |
| 故障转移 | Failover | 模型异常时自动切换到备用模型 |

---

### G. 参考资料

**官方文档**：
- [Hono 框架文档](https://hono.dev/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

**API 文档**：
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Anthropic API 文档](https://docs.anthropic.com/claude/reference)

**设计资源**：
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [Font Awesome](https://fontawesome.com/)

---

## 📝 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.2 | 2026-02-26 | 新增：模型按厂商过滤、接入类型列、完善添加厂商、统计分析 Tab 结构、场景拆解统计、场景路由重构、真正的模型切换 |
| v1.1 | 2026-02-26 | 新增：应用场景维度切换、切换原因下拉、UI 优化 |
| v1.0 | 2026-02-25 | 初始版本：基础功能实现 |

---

## 👤 文档维护

**负责人**：Frank  
**联系方式**：[你的联系方式]  
**最后更新**：2026-02-26  

---

**文档状态**：✅ 最新版本  
**审批状态**：待审批  
**下次评审日期**：2026-03-01  

