import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// 启用 CORS
app.use('/api/*', cors())

// 服务静态文件
app.use('/static/*', serveStatic({ root: './public' }))

// ========================================
// API Routes - 模型厂商管理
// ========================================

// 获取所有厂商列表
app.get('/api/providers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        p.*,
        COUNT(DISTINCT m.id) as model_count,
        SUM(CASE WHEN m.status = 'active' THEN 1 ELSE 0 END) as active_model_count
      FROM model_providers p
      LEFT JOIN models m ON p.id = m.provider_id
      GROUP BY p.id
      ORDER BY p.priority DESC, p.created_at DESC
    `).all()
    
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 获取单个厂商详情
app.get('/api/providers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM model_providers WHERE id = ?
    `).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Provider not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 创建厂商
app.post('/api/providers', async (c) => {
  try {
    const body = await c.req.json()
    const { name, slug, logo_url, access_type, proxy_name, api_base_url, api_key, auth_type, custom_headers, priority } = body
    
    const result = await c.env.DB.prepare(`
      INSERT INTO model_providers (name, slug, logo_url, access_type, proxy_name, api_base_url, api_key, auth_type, custom_headers, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(name, slug, logo_url || null, access_type, proxy_name || null, api_base_url, api_key, auth_type || 'bearer', custom_headers || null, priority || 0).run()
    
    return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 更新厂商
app.put('/api/providers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { name, slug, logo_url, access_type, proxy_name, api_base_url, api_key, auth_type, custom_headers, status, priority } = body
    
    await c.env.DB.prepare(`
      UPDATE model_providers 
      SET name = ?, slug = ?, logo_url = ?, access_type = ?, proxy_name = ?, 
          api_base_url = ?, api_key = ?, auth_type = ?, custom_headers = ?, 
          status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name, slug, logo_url || null, access_type, proxy_name || null, api_base_url, api_key, auth_type, custom_headers || null, status, priority || 0, id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 删除厂商
app.delete('/api/providers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM model_providers WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ========================================
// API Routes - 模型管理
// ========================================

// 获取所有模型列表
app.get('/api/models', async (c) => {
  try {
    const provider_id = c.req.query('provider_id')
    
    let query = `
      SELECT 
        m.*,
        p.name as provider_name,
        p.access_type,
        p.proxy_name,
        pr.input_price,
        pr.output_price,
        pr.fixed_price,
        pr.billing_type
      FROM models m
      LEFT JOIN model_providers p ON m.provider_id = p.id
      LEFT JOIN pricing_rules pr ON m.id = pr.model_id AND pr.is_current = 1
    `
    
    if (provider_id) {
      query += ` WHERE m.provider_id = ?`
      const { results } = await c.env.DB.prepare(query + ' ORDER BY m.created_at DESC').bind(provider_id).all()
      return c.json({ success: true, data: results })
    } else {
      const { results } = await c.env.DB.prepare(query + ' ORDER BY m.created_at DESC').all()
      return c.json({ success: true, data: results })
    }
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 获取单个模型详情
app.get('/api/models/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(`
      SELECT 
        m.*,
        p.name as provider_name,
        p.access_type,
        pr.input_price,
        pr.output_price,
        pr.fixed_price,
        pr.billing_type
      FROM models m
      LEFT JOIN model_providers p ON m.provider_id = p.id
      LEFT JOIN pricing_rules pr ON m.id = pr.model_id AND pr.is_current = 1
      WHERE m.id = ?
    `).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Model not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 创建模型
app.post('/api/models', async (c) => {
  try {
    const body = await c.req.json()
    const { provider_id, model_id, display_name, model_type, version, context_length, 
            supports_streaming, supports_function_call, supports_vision, description,
            billing_type, input_price, output_price, fixed_price } = body
    
    // 插入模型
    const modelResult = await c.env.DB.prepare(`
      INSERT INTO models (provider_id, model_id, display_name, model_type, version, context_length,
                         supports_streaming, supports_function_call, supports_vision, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(provider_id, model_id, display_name, model_type, version || null, context_length || null,
            supports_streaming ? 1 : 0, supports_function_call ? 1 : 0, supports_vision ? 1 : 0, description || null).run()
    
    const newModelId = modelResult.meta.last_row_id
    
    // 插入计费规则
    if (billing_type) {
      await c.env.DB.prepare(`
        INSERT INTO pricing_rules (model_id, billing_type, input_price, output_price, fixed_price, effective_date)
        VALUES (?, ?, ?, ?, ?, DATE('now'))
      `).bind(newModelId, billing_type, input_price || 0, output_price || 0, fixed_price || 0).run()
    }
    
    return c.json({ success: true, data: { id: newModelId } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 更新模型
app.put('/api/models/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { display_name, model_type, version, context_length, status, description,
            supports_streaming, supports_function_call, supports_vision } = body
    
    await c.env.DB.prepare(`
      UPDATE models 
      SET display_name = ?, model_type = ?, version = ?, context_length = ?, status = ?, description = ?,
          supports_streaming = ?, supports_function_call = ?, supports_vision = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(display_name, model_type, version, context_length, status, description,
            supports_streaming ? 1 : 0, supports_function_call ? 1 : 0, supports_vision ? 1 : 0, id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 删除模型
app.delete('/api/models/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM models WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ========================================
// API Routes - 统计分析
// ========================================

// 获取仪表盘概览数据
app.get('/api/dashboard/overview', async (c) => {
  try {
    // 今日统计
    const todayStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_calls,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(total_tokens) as total_tokens,
        SUM(total_cost) as total_cost,
        AVG(latency) as avg_latency,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
      FROM usage_logs
      WHERE DATE(created_at) = DATE('now')
    `).first()
    
    // 厂商分布
    const providerDistribution = await c.env.DB.prepare(`
      SELECT 
        p.name as provider_name,
        p.logo_url,
        COUNT(*) as call_count,
        SUM(l.total_cost) as total_cost
      FROM usage_logs l
      JOIN model_providers p ON l.provider_id = p.id
      WHERE DATE(l.created_at) = DATE('now')
      GROUP BY p.id
      ORDER BY call_count DESC
      LIMIT 5
    `).all()
    
    // 热门模型 Top 5
    const topModels = await c.env.DB.prepare(`
      SELECT 
        m.display_name,
        p.name as provider_name,
        COUNT(*) as call_count,
        SUM(l.total_tokens) as total_tokens,
        SUM(l.total_cost) as total_cost
      FROM usage_logs l
      JOIN models m ON l.model_id = m.id
      JOIN model_providers p ON m.provider_id = p.id
      WHERE DATE(l.created_at) = DATE('now')
      GROUP BY m.id
      ORDER BY call_count DESC
      LIMIT 5
    `).all()
    
    return c.json({
      success: true,
      data: {
        today: todayStats,
        providers: providerDistribution.results,
        topModels: topModels.results
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 获取历史统计数据
app.get('/api/stats/history', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '7')
    
    const stats = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as call_count,
        SUM(input_tokens) as input_tokens,
        SUM(output_tokens) as output_tokens,
        SUM(total_cost) as total_cost,
        AVG(latency) as avg_latency,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
      FROM usage_logs
      WHERE created_at >= DATE('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).bind(days).all()
    
    return c.json({ success: true, data: stats.results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 获取费用统计
app.get('/api/stats/costs', async (c) => {
  try {
    const group_by = c.req.query('group_by') || 'provider' // provider | model
    const days = parseInt(c.req.query('days') || '30')
    
    let query = ''
    if (group_by === 'provider') {
      query = `
        SELECT 
          p.name as name,
          p.logo_url,
          p.access_type,
          COUNT(*) as call_count,
          SUM(l.total_cost) as total_cost,
          SUM(l.input_tokens) as input_tokens,
          SUM(l.output_tokens) as output_tokens
        FROM usage_logs l
        JOIN model_providers p ON l.provider_id = p.id
        WHERE l.created_at >= DATE('now', '-' || ? || ' days')
        GROUP BY p.id
        ORDER BY total_cost DESC
      `
    } else {
      query = `
        SELECT 
          m.display_name as name,
          p.name as provider_name,
          COUNT(*) as call_count,
          SUM(l.total_cost) as total_cost,
          SUM(l.input_tokens) as input_tokens,
          SUM(l.output_tokens) as output_tokens
        FROM usage_logs l
        JOIN models m ON l.model_id = m.id
        JOIN model_providers p ON m.provider_id = p.id
        WHERE l.created_at >= DATE('now', '-' || ? || ' days')
        GROUP BY m.id
        ORDER BY total_cost DESC
      `
    }
    
    const { results } = await c.env.DB.prepare(query).bind(days).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 获取调用日志
app.get('/api/logs', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        l.*,
        m.display_name as model_name,
        p.name as provider_name
      FROM usage_logs l
      JOIN models m ON l.model_id = m.id
      JOIN model_providers p ON l.provider_id = p.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()
    
    const countResult = await c.env.DB.prepare('SELECT COUNT(*) as total FROM usage_logs').first()
    
    return c.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: countResult?.total || 0
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ========================================
// API Routes - 模型切换
// ========================================

// 获取当前激活的模型配置
app.get('/api/active-model', async (c) => {
  try {
    const scenario = c.req.query('scenario') || 'default'
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        a.*,
        m.display_name,
        m.model_id,
        p.name as provider_name,
        p.logo_url
      FROM active_model_config a
      JOIN models m ON a.model_id = m.id
      JOIN model_providers p ON m.provider_id = p.id
      WHERE a.scenario = ?
    `).bind(scenario).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'No active model configured' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 执行模型切换
app.post('/api/switch-model', async (c) => {
  try {
    const body = await c.req.json()
    const { to_model_id, reason, operator, scenario = 'default' } = body
    
    // 获取当前模型
    const currentConfig = await c.env.DB.prepare(`
      SELECT model_id FROM active_model_config WHERE scenario = ?
    `).bind(scenario).first()
    
    const from_model_id = currentConfig?.model_id || null
    
    // 记录切换操作
    await c.env.DB.prepare(`
      INSERT INTO model_switches (from_model_id, to_model_id, switch_type, reason, operator, scenario, executed_at, status)
      VALUES (?, ?, 'full', ?, ?, ?, CURRENT_TIMESTAMP, 'success')
    `).bind(from_model_id, to_model_id, reason, operator, scenario).run()
    
    // 更新激活模型配置
    if (currentConfig) {
      await c.env.DB.prepare(`
        UPDATE active_model_config 
        SET model_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE scenario = ?
      `).bind(to_model_id, scenario).run()
    } else {
      await c.env.DB.prepare(`
        INSERT INTO active_model_config (scenario, model_id)
        VALUES (?, ?)
      `).bind(scenario, to_model_id).run()
    }
    
    return c.json({ success: true, message: '模型切换成功' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 获取切换历史
app.get('/api/switch-history', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        s.*,
        m1.display_name as from_model_name,
        m2.display_name as to_model_name,
        p2.name as to_provider_name
      FROM model_switches s
      LEFT JOIN models m1 ON s.from_model_id = m1.id
      JOIN models m2 ON s.to_model_id = m2.id
      JOIN model_providers p2 ON m2.provider_id = p2.id
      ORDER BY s.created_at DESC
      LIMIT 50
    `).all()
    
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ========================================
// 前端页面路由
// ========================================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Model Hub - AI 模型管理平台</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <style>
          body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .glass {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          .nav-link {
            transition: all 0.3s ease;
          }
          .nav-link:hover {
            background: rgba(102, 126, 234, 0.1);
            transform: translateX(5px);
          }
          .nav-link.active {
            background: rgba(102, 126, 234, 0.2);
            border-left: 4px solid #667eea;
          }
          .stat-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
          .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
          }
          .badge-success { background: #10b981; color: white; }
          .badge-warning { background: #f59e0b; color: white; }
          .badge-danger { background: #ef4444; color: white; }
          .badge-info { background: #3b82f6; color: white; }
        </style>
    </head>
    <body class="min-h-screen p-6">
        <div class="container mx-auto max-w-7xl">
            <!-- 顶部导航 -->
            <div class="glass rounded-2xl shadow-2xl mb-6 p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-brain text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800">Model Hub</h1>
                            <p class="text-sm text-gray-500">AI 模型接入管理平台</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-sm text-gray-500">当前时间</p>
                            <p class="text-lg font-semibold text-gray-800" id="currentTime"></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 主内容区 -->
            <div class="grid grid-cols-12 gap-6">
                <!-- 左侧导航 -->
                <div class="col-span-3">
                    <div class="glass rounded-2xl shadow-xl p-4">
                        <nav class="space-y-2">
                            <a href="#" class="nav-link active flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700" data-page="dashboard">
                                <i class="fas fa-chart-line w-5"></i>
                                <span class="font-medium">仪表盘</span>
                            </a>
                            <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700" data-page="providers">
                                <i class="fas fa-building w-5"></i>
                                <span class="font-medium">接入管理</span>
                            </a>
                            <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700" data-page="models">
                                <i class="fas fa-robot w-5"></i>
                                <span class="font-medium">模型列表</span>
                            </a>
                            <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700" data-page="stats">
                                <i class="fas fa-chart-bar w-5"></i>
                                <span class="font-medium">统计分析</span>
                            </a>
                            <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700" data-page="logs">
                                <i class="fas fa-list w-5"></i>
                                <span class="font-medium">调用日志</span>
                            </a>
                            <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700" data-page="switch">
                                <i class="fas fa-exchange-alt w-5"></i>
                                <span class="font-medium">模型切换</span>
                            </a>
                        </nav>
                    </div>
                </div>

                <!-- 右侧内容区 -->
                <div class="col-span-9">
                    <div id="content" class="glass rounded-2xl shadow-xl p-6 min-h-[600px]">
                        <!-- 内容将通过 JavaScript 动态加载 -->
                    </div>
                </div>
            </div>
        </div>

        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
