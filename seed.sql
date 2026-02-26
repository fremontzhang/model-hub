-- Model Hub 示例数据
-- 用于开发和测试

-- ========================================
-- 1. 插入模型厂商数据
-- ========================================

-- OpenAI 直连
INSERT OR IGNORE INTO model_providers (id, name, slug, logo_url, access_type, api_base_url, api_key, auth_type, status, priority) VALUES
(1, 'OpenAI', 'openai', 'https://cdn.simpleicons.org/openai', 'direct', 'https://api.openai.com/v1', 'sk-test-xxxxxxxxxxxxx', 'bearer', 'active', 100);

-- Anthropic 直连
INSERT OR IGNORE INTO model_providers (id, name, slug, logo_url, access_type, api_base_url, api_key, auth_type, status, priority) VALUES
(2, 'Anthropic', 'anthropic', 'https://cdn.simpleicons.org/anthropic', 'direct', 'https://api.anthropic.com/v1', 'sk-ant-xxxxxxxxxxxxx', 'custom', 'active', 95);

-- 讯飞星火 直连
INSERT OR IGNORE INTO model_providers (id, name, slug, logo_url, access_type, api_base_url, api_key, auth_type, status, priority) VALUES
(3, '讯飞星火', 'xfyun', 'https://www.xfyun.cn/favicon.ico', 'direct', 'https://spark-api.xf-yun.com/v1', 'api-key-xxxxxxxxxxxxx', 'api_key', 'active', 85);

-- 智谱AI 直连
INSERT OR IGNORE INTO model_providers (id, name, slug, logo_url, access_type, api_base_url, api_key, auth_type, status, priority) VALUES
(4, '智谱AI', 'zhipu', 'https://open.bigmodel.cn/favicon.ico', 'direct', 'https://open.bigmodel.cn/api/paas/v4', 'glm-xxxxxxxxxxxxx', 'bearer', 'active', 80);

-- 硅基流动（代理商）
INSERT OR IGNORE INTO model_providers (id, name, slug, logo_url, access_type, proxy_name, api_base_url, api_key, auth_type, status, priority) VALUES
(5, 'OpenAI (硅基流动)', 'openai-siliconflow', 'https://cdn.simpleicons.org/openai', 'proxy', '硅基流动', 'https://api.siliconflow.cn/v1', 'sk-sf-xxxxxxxxxxxxx', 'bearer', 'active', 90);

-- API2D（代理商）
INSERT OR IGNORE INTO model_providers (id, name, slug, logo_url, access_type, proxy_name, api_base_url, api_key, auth_type, status, priority) VALUES
(6, 'OpenAI (API2D)', 'openai-api2d', 'https://cdn.simpleicons.org/openai', 'proxy', 'API2D', 'https://api.api2d.com/v1', 'fk-xxxxxxxxxxxxx', 'bearer', 'disabled', 70);

-- 阿里云百炼 直连
INSERT OR IGNORE INTO model_providers (id, name, slug, logo_url, access_type, api_base_url, api_key, auth_type, status, priority) VALUES
(7, '阿里云百炼', 'aliyun-bailian', 'https://img.alicdn.com/favicon.ico', 'direct', 'https://dashscope.aliyuncs.com/api/v1', 'sk-aliyun-xxxxxxxxxxxxx', 'bearer', 'maintenance', 75);

-- ========================================
-- 2. 插入模型数据
-- ========================================

-- OpenAI 模型
INSERT OR IGNORE INTO models (id, provider_id, model_id, display_name, model_type, version, context_length, supports_streaming, supports_function_call, supports_vision, status, avg_latency, description) VALUES
(1, 1, 'gpt-4-turbo', 'GPT-4 Turbo', 'multimodal', '2024-04-09', 128000, 1, 1, 1, 'active', 2500, '最强大的多模态模型，支持视觉理解和函数调用'),
(2, 1, 'gpt-4', 'GPT-4', 'text', '0613', 8192, 1, 1, 0, 'active', 3000, '经典GPT-4模型，适合复杂推理任务'),
(3, 1, 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'text', '0125', 16385, 1, 1, 0, 'active', 800, '性价比最高的模型，适合常规对话'),
(4, 1, 'text-embedding-3-large', 'Embedding 3 Large', 'embedding', '3', 8191, 0, 0, 0, 'active', 200, '最新嵌入模型，3072维度');

-- Anthropic 模型
INSERT OR IGNORE INTO models (id, provider_id, model_id, display_name, model_type, version, context_length, supports_streaming, supports_function_call, supports_vision, status, avg_latency, description) VALUES
(5, 2, 'claude-3-opus-20240229', 'Claude 3 Opus', 'multimodal', '20240229', 200000, 1, 1, 1, 'active', 3500, 'Claude 3 系列最强模型，适合复杂任务'),
(6, 2, 'claude-3-sonnet-20240229', 'Claude 3 Sonnet', 'multimodal', '20240229', 200000, 1, 1, 1, 'active', 2000, '平衡性能和成本的选择'),
(7, 2, 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'text', '20240307', 200000, 1, 0, 0, 'active', 1000, '最快速且经济的 Claude 模型');

-- 讯飞星火模型
INSERT OR IGNORE INTO models (id, provider_id, model_id, display_name, model_type, version, context_length, supports_streaming, supports_function_call, supports_vision, status, avg_latency, description) VALUES
(8, 3, 'spark-v3.5', '星火 v3.5', 'text', '3.5', 8000, 1, 0, 0, 'active', 1500, '讯飞星火认知大模型 v3.5'),
(9, 3, 'spark-v3.0', '星火 v3.0', 'text', '3.0', 8000, 1, 0, 0, 'active', 1200, '星火 v3.0 通用模型');

-- 智谱AI 模型
INSERT OR IGNORE INTO models (id, provider_id, model_id, display_name, model_type, version, context_length, supports_streaming, supports_function_call, supports_vision, status, avg_latency, description) VALUES
(10, 4, 'glm-4', 'GLM-4', 'text', '4', 128000, 1, 1, 0, 'active', 2000, '智谱第四代语言模型'),
(11, 4, 'glm-3-turbo', 'GLM-3 Turbo', 'text', '3', 128000, 1, 0, 0, 'active', 1000, '高性价比的推理模型');

-- 硅基流动代理的 OpenAI 模型
INSERT OR IGNORE INTO models (id, provider_id, model_id, display_name, model_type, version, context_length, supports_streaming, supports_function_call, supports_vision, status, avg_latency, description) VALUES
(12, 5, 'gpt-4-turbo', 'GPT-4 Turbo (硅基)', 'multimodal', '2024-04-09', 128000, 1, 1, 1, 'active', 2800, '通过硅基流动代理的 GPT-4 Turbo'),
(13, 5, 'gpt-3.5-turbo', 'GPT-3.5 Turbo (硅基)', 'text', '0125', 16385, 1, 1, 0, 'active', 900, '通过硅基流动代理的 GPT-3.5');

-- ========================================
-- 3. 插入计费规则
-- ========================================

-- OpenAI 计费规则
INSERT OR IGNORE INTO pricing_rules (model_id, billing_type, input_price, output_price, effective_date, is_current) VALUES
(1, 'token', 0.01, 0.03, '2024-01-01', 1),    -- GPT-4 Turbo
(2, 'token', 0.03, 0.06, '2024-01-01', 1),    -- GPT-4
(3, 'token', 0.0005, 0.0015, '2024-01-01', 1), -- GPT-3.5 Turbo
(4, 'token', 0.00013, 0, '2024-01-01', 1);    -- Embedding

-- Anthropic 计费规则
INSERT OR IGNORE INTO pricing_rules (model_id, billing_type, input_price, output_price, effective_date, is_current) VALUES
(5, 'token', 0.015, 0.075, '2024-02-01', 1),  -- Claude 3 Opus
(6, 'token', 0.003, 0.015, '2024-02-01', 1),  -- Claude 3 Sonnet
(7, 'token', 0.00025, 0.00125, '2024-02-01', 1); -- Claude 3 Haiku

-- 讯飞星火计费规则
INSERT OR IGNORE INTO pricing_rules (model_id, billing_type, input_price, output_price, effective_date, is_current) VALUES
(8, 'token', 0.0035, 0.0035, '2024-01-01', 1), -- 星火 v3.5
(9, 'token', 0.0018, 0.0018, '2024-01-01', 1); -- 星火 v3.0

-- 智谱AI 计费规则
INSERT OR IGNORE INTO pricing_rules (model_id, billing_type, input_price, output_price, effective_date, is_current) VALUES
(10, 'token', 0.01, 0.01, '2024-01-01', 1),    -- GLM-4
(11, 'token', 0.0005, 0.0005, '2024-01-01', 1); -- GLM-3 Turbo

-- 硅基流动（代理商费率比直连略高）
INSERT OR IGNORE INTO pricing_rules (model_id, billing_type, input_price, output_price, effective_date, is_current) VALUES
(12, 'token', 0.012, 0.035, '2024-01-01', 1),   -- GPT-4 Turbo (代理)
(13, 'token', 0.0008, 0.002, '2024-01-01', 1);  -- GPT-3.5 Turbo (代理)

-- ========================================
-- 4. 插入模拟调用日志（最近7天的数据）
-- ========================================

-- 今天的日志（成功）
INSERT OR IGNORE INTO usage_logs (request_id, provider_id, model_id, input_tokens, output_tokens, total_tokens, input_cost, output_cost, total_cost, latency, status, source, scenario, created_at) VALUES
('req_001', 1, 3, 1200, 800, 2000, 0.0006, 0.0012, 0.0018, 850, 'success', 'api-server', 'customer-service', datetime('now', '-2 hours')),
('req_002', 1, 3, 850, 450, 1300, 0.000425, 0.000675, 0.0011, 720, 'success', 'web-chat', 'customer-service', datetime('now', '-1 hours')),
('req_003', 2, 6, 2500, 1800, 4300, 0.0075, 0.027, 0.0345, 2100, 'success', 'api-server', 'content-generation', datetime('now', '-30 minutes')),
('req_004', 1, 1, 3200, 2100, 5300, 0.032, 0.063, 0.095, 2600, 'success', 'api-server', 'analysis', datetime('now', '-15 minutes')),
('req_005', 3, 8, 1500, 1200, 2700, 0.00525, 0.0042, 0.00945, 1450, 'success', 'mobile-app', 'qa', datetime('now', '-5 minutes'));

-- 昨天的日志
INSERT OR IGNORE INTO usage_logs (request_id, provider_id, model_id, input_tokens, output_tokens, total_tokens, input_cost, output_cost, total_cost, latency, status, source, scenario, created_at) VALUES
('req_101', 1, 3, 1100, 750, 1850, 0.00055, 0.001125, 0.001675, 800, 'success', 'api-server', 'customer-service', datetime('now', '-1 day', '-10 hours')),
('req_102', 1, 3, 950, 600, 1550, 0.000475, 0.0009, 0.001375, 780, 'success', 'web-chat', 'customer-service', datetime('now', '-1 day', '-8 hours')),
('req_103', 2, 7, 800, 500, 1300, 0.0002, 0.000625, 0.000825, 950, 'success', 'api-server', 'summarization', datetime('now', '-1 day', '-6 hours')),
('req_104', 1, 2, 4500, 3200, 7700, 0.135, 0.192, 0.327, 3200, 'success', 'api-server', 'research', datetime('now', '-1 day', '-4 hours')),
('req_105', 4, 10, 2200, 1800, 4000, 0.022, 0.018, 0.04, 1950, 'success', 'api-server', 'content-generation', datetime('now', '-1 day', '-2 hours')),
('req_106', 1, 3, 1300, 900, 2200, 0.00065, 0.00135, 0.002, 820, 'error', 'web-chat', 'customer-service', datetime('now', '-1 day', '-1 hours'));

-- 前天的日志
INSERT OR IGNORE INTO usage_logs (request_id, provider_id, model_id, input_tokens, output_tokens, total_tokens, input_cost, output_cost, total_cost, latency, status, source, scenario, created_at) VALUES
('req_201', 1, 3, 1050, 700, 1750, 0.000525, 0.00105, 0.001575, 790, 'success', 'api-server', 'customer-service', datetime('now', '-2 days', '-12 hours')),
('req_202', 2, 6, 2800, 2000, 4800, 0.0084, 0.03, 0.0384, 2050, 'success', 'api-server', 'content-generation', datetime('now', '-2 days', '-10 hours')),
('req_203', 5, 13, 1200, 800, 2000, 0.00096, 0.0016, 0.00256, 920, 'success', 'api-server', 'translation', datetime('now', '-2 days', '-8 hours')),
('req_204', 3, 9, 1400, 1100, 2500, 0.00252, 0.00198, 0.0045, 1150, 'success', 'mobile-app', 'qa', datetime('now', '-2 days', '-6 hours')),
('req_205', 1, 1, 3500, 2400, 5900, 0.035, 0.072, 0.107, 2700, 'success', 'api-server', 'vision-analysis', datetime('now', '-2 days', '-4 hours'));

-- 3天前的日志
INSERT OR IGNORE INTO usage_logs (request_id, provider_id, model_id, input_tokens, output_tokens, total_tokens, input_cost, output_cost, total_cost, latency, status, source, scenario, created_at) VALUES
('req_301', 1, 3, 980, 650, 1630, 0.00049, 0.000975, 0.001465, 770, 'success', 'web-chat', 'customer-service', datetime('now', '-3 days', '-14 hours')),
('req_302', 2, 5, 5000, 3500, 8500, 0.075, 0.2625, 0.3375, 3600, 'success', 'api-server', 'complex-analysis', datetime('now', '-3 days', '-11 hours')),
('req_303', 4, 11, 1100, 900, 2000, 0.00055, 0.00045, 0.001, 980, 'success', 'api-server', 'classification', datetime('now', '-3 days', '-8 hours')),
('req_304', 1, 3, 1250, 850, 2100, 0.000625, 0.001275, 0.0019, 830, 'success', 'api-server', 'customer-service', datetime('now', '-3 days', '-5 hours'));

-- 更早的日志（4-7天前）添加更多样本
INSERT OR IGNORE INTO usage_logs (request_id, provider_id, model_id, input_tokens, output_tokens, total_tokens, input_cost, output_cost, total_cost, latency, status, source, scenario, created_at) VALUES
('req_401', 1, 3, 1150, 750, 1900, 0.000575, 0.001125, 0.0017, 810, 'success', 'api-server', 'customer-service', datetime('now', '-4 days', '-10 hours')),
('req_402', 5, 12, 3100, 2200, 5300, 0.0372, 0.077, 0.1142, 2850, 'success', 'api-server', 'report-generation', datetime('now', '-4 days', '-6 hours')),
('req_501', 2, 7, 850, 550, 1400, 0.0002125, 0.0006875, 0.0009, 970, 'success', 'api-server', 'summarization', datetime('now', '-5 days', '-9 hours')),
('req_502', 3, 8, 1600, 1300, 2900, 0.0056, 0.00455, 0.01015, 1480, 'success', 'mobile-app', 'qa', datetime('now', '-5 days', '-5 hours')),
('req_601', 1, 2, 4200, 3000, 7200, 0.126, 0.18, 0.306, 3100, 'success', 'api-server', 'deep-analysis', datetime('now', '-6 days', '-7 hours')),
('req_602', 4, 10, 2400, 1900, 4300, 0.024, 0.019, 0.043, 2000, 'success', 'api-server', 'content-generation', datetime('now', '-6 days', '-3 hours')),
('req_701', 1, 3, 1080, 720, 1800, 0.00054, 0.00108, 0.00162, 800, 'success', 'web-chat', 'customer-service', datetime('now', '-7 days', '-11 hours')),
('req_702', 2, 6, 2600, 1900, 4500, 0.0078, 0.0285, 0.0363, 2080, 'success', 'api-server', 'content-generation', datetime('now', '-7 days', '-4 hours'));

-- ========================================
-- 5. 插入模型切换记录
-- ========================================
INSERT OR IGNORE INTO model_switches (from_model_id, to_model_id, switch_type, reason, operator, executed_at, status, result_message) VALUES
(NULL, 3, 'full', '初始配置：选择 GPT-3.5 作为默认客服模型', 'admin', datetime('now', '-30 days'), 'success', '成功配置初始模型'),
(3, 6, 'full', '成本优化：切换到 Claude 3 Sonnet 降低费用', 'admin', datetime('now', '-15 days'), 'success', '切换成功，预计节省30%成本'),
(6, 3, 'full', '性能优化：切换回 GPT-3.5 提升响应速度', 'operator', datetime('now', '-7 days'), 'success', '切换成功，平均响应时间降低40%'),
(3, 13, 'full', '测试代理渠道：切换至硅基流动代理', 'developer', datetime('now', '-2 days'), 'success', '代理渠道测试成功');

-- ========================================
-- 6. 插入当前激活模型配置
-- ========================================
INSERT OR IGNORE INTO active_model_config (scenario, model_id) VALUES
('default', 3);  -- 默认场景使用 GPT-3.5 Turbo

-- ========================================
-- 7. 插入预算配置
-- ========================================
INSERT OR IGNORE INTO budget_configs (name, budget_type, budget_amount, alert_threshold, start_date, is_active) VALUES
('2026年2月预算', 'monthly', 50000, 80, '2026-02-01', 1),
('日常运营预算', 'daily', 2000, 85, '2026-02-01', 1);
