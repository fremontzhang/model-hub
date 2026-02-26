-- Model Hub 数据库初始化脚本
-- 创建时间: 2026-02-26

-- ========================================
-- 1. 模型厂商表
-- ========================================
CREATE TABLE IF NOT EXISTS model_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                     -- 厂商名称
  slug TEXT UNIQUE NOT NULL,              -- 厂商标识（唯一）
  logo_url TEXT,                          -- Logo URL
  access_type TEXT NOT NULL CHECK(access_type IN ('direct', 'proxy')), -- 接入类型
  proxy_name TEXT,                        -- 代理商名称
  api_base_url TEXT NOT NULL,             -- API Base URL
  api_key TEXT NOT NULL,                  -- API Key（加密存储）
  auth_type TEXT DEFAULT 'bearer' CHECK(auth_type IN ('bearer', 'api_key', 'custom')),
  custom_headers TEXT,                    -- JSON 格式自定义请求头
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'disabled', 'maintenance')),
  priority INTEGER DEFAULT 0,             -- 优先级（数字越大优先级越高）
  health_check_url TEXT,
  last_health_check DATETIME,
  is_healthy INTEGER DEFAULT 1,           -- 1=健康, 0=异常
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. 模型表
-- ========================================
CREATE TABLE IF NOT EXISTS models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  model_id TEXT NOT NULL,                 -- 模型ID（如 gpt-4-turbo-preview）
  display_name TEXT NOT NULL,             -- 显示名称
  model_type TEXT NOT NULL CHECK(model_type IN ('text', 'multimodal', 'embedding', 'image')),
  version TEXT,                           -- 版本号
  context_length INTEGER,                 -- 上下文长度
  supports_streaming INTEGER DEFAULT 1,   -- 支持流式输出
  supports_function_call INTEGER DEFAULT 0, -- 支持函数调用
  supports_vision INTEGER DEFAULT 0,      -- 支持视觉理解
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'disabled', 'deprecated')),
  avg_latency INTEGER,                    -- 平均响应时间（ms）
  max_concurrency INTEGER,                -- 最大并发数
  daily_quota INTEGER,                    -- 每日配额
  description TEXT,                       -- 模型描述
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES model_providers(id) ON DELETE CASCADE,
  UNIQUE(provider_id, model_id)
);

-- ========================================
-- 3. 计费规则表
-- ========================================
CREATE TABLE IF NOT EXISTS pricing_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id INTEGER NOT NULL,
  billing_type TEXT NOT NULL CHECK(billing_type IN ('token', 'per_call', 'hybrid')),
  input_price REAL DEFAULT 0,             -- Input Token 单价（元/1K tokens）
  output_price REAL DEFAULT 0,            -- Output Token 单价（元/1K tokens）
  fixed_price REAL DEFAULT 0,             -- 固定费用（按次）
  min_charge REAL DEFAULT 0,              -- 最低收费
  effective_date DATE NOT NULL,           -- 生效日期
  is_current INTEGER DEFAULT 1,           -- 是否当前有效（1=是, 0=否）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- ========================================
-- 4. 调用日志表
-- ========================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT UNIQUE NOT NULL,        -- 请求唯一标识
  provider_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  input_cost REAL DEFAULT 0,              -- Input Token 费用
  output_cost REAL DEFAULT 0,             -- Output Token 费用
  fixed_cost REAL DEFAULT 0,              -- 固定费用
  total_cost REAL DEFAULT 0,              -- 总费用
  latency INTEGER,                        -- 响应时间（ms）
  status TEXT NOT NULL CHECK(status IN ('success', 'error', 'timeout')),
  error_message TEXT,                     -- 错误信息
  error_type TEXT,                        -- 错误类型
  request_params TEXT,                    -- JSON 格式请求参数
  source TEXT,                            -- 调用来源
  user_id TEXT,                           -- 用户ID
  scenario TEXT,                          -- 业务场景
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES model_providers(id),
  FOREIGN KEY (model_id) REFERENCES models(id)
);

-- ========================================
-- 5. 模型切换记录表
-- ========================================
CREATE TABLE IF NOT EXISTS model_switches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_model_id INTEGER,                  -- 原模型ID（可为空，首次配置）
  to_model_id INTEGER NOT NULL,           -- 目标模型ID
  switch_type TEXT NOT NULL DEFAULT 'full' CHECK(switch_type IN ('full', 'canary')),
  reason TEXT NOT NULL,                   -- 切换原因
  operator TEXT NOT NULL,                 -- 操作人员
  scheduled_at DATETIME,                  -- 计划执行时间
  executed_at DATETIME,                   -- 实际执行时间
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed', 'rollback')),
  result_message TEXT,                    -- 执行结果信息
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_model_id) REFERENCES models(id),
  FOREIGN KEY (to_model_id) REFERENCES models(id)
);

-- ========================================
-- 6. 预算配置表
-- ========================================
CREATE TABLE IF NOT EXISTS budget_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                     -- 预算名称
  budget_type TEXT NOT NULL CHECK(budget_type IN ('monthly', 'daily', 'yearly')),
  budget_amount REAL NOT NULL,            -- 预算金额
  alert_threshold INTEGER DEFAULT 80,     -- 告警阈值百分比
  start_date DATE NOT NULL,
  end_date DATE,
  is_active INTEGER DEFAULT 1,            -- 是否启用
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 7. 当前激活模型配置表
-- ========================================
CREATE TABLE IF NOT EXISTS active_model_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario TEXT UNIQUE NOT NULL DEFAULT 'default', -- 场景标识
  model_id INTEGER NOT NULL,              -- 当前使用的模型ID
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id)
);

-- ========================================
-- 索引优化
-- ========================================
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_model_id ON usage_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_provider_id ON usage_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_status ON usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_models_provider_id ON models(provider_id);
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_model_id ON pricing_rules(model_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_is_current ON pricing_rules(is_current);
CREATE INDEX IF NOT EXISTS idx_model_switches_executed_at ON model_switches(executed_at);
CREATE INDEX IF NOT EXISTS idx_model_providers_status ON model_providers(status);
