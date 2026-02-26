// Model Hub - 前端应用
// 科技简洁风格

// ========================================
// 全局变量和工具函数
// ========================================

let currentPage = 'dashboard';
let dashboardData = null;
let chartInstances = {};

// 格式化时间
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

// 格式化数字
function formatNumber(num) {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('zh-CN');
}

// 格式化费用
function formatCost(cost) {
  if (!cost && cost !== 0) return '¥0.00';
  return '¥' + cost.toFixed(4);
}

// 格式化 Token 数量
function formatTokens(tokens) {
  if (!tokens && tokens !== 0) return '0';
  if (tokens >= 1000000) {
    return (tokens / 1000000).toFixed(2) + 'M';
  } else if (tokens >= 1000) {
    return (tokens / 1000).toFixed(2) + 'K';
  }
  return tokens.toString();
}

// 显示加载状态
function showLoading() {
  return `
    <div class="flex items-center justify-center h-96">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `;
}

// 显示错误信息
function showError(message) {
  return `
    <div class="flex items-center justify-center h-96">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <p class="text-gray-700 font-semibold mb-2">出错了</p>
        <p class="text-gray-500">${message}</p>
      </div>
    </div>
  `;
}

// ========================================
// 页面渲染函数
// ========================================

// 仪表盘页面
async function renderDashboard() {
  const content = document.getElementById('content');
  content.innerHTML = showLoading();
  
  try {
    const response = await fetch('/api/dashboard/overview');
    const result = await response.json();
    
    if (!result.success) {
      content.innerHTML = showError(result.error);
      return;
    }
    
    dashboardData = result.data;
    const today = dashboardData.today || {};
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-chart-line mr-2 text-indigo-600"></i>
            实时监控看板
          </h2>
          <button onclick="renderDashboard()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <i class="fas fa-sync-alt mr-2"></i>刷新数据
          </button>
        </div>

        <!-- 今日概览统计卡片 -->
        <div class="grid grid-cols-4 gap-4">
          <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm mb-1">总调用次数</p>
                <p class="text-3xl font-bold">${formatNumber(today.total_calls || 0)}</p>
              </div>
              <i class="fas fa-phone-alt text-4xl text-blue-200"></i>
            </div>
          </div>

          <div class="stat-card bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm mb-1">Token 消耗</p>
                <p class="text-3xl font-bold">${formatTokens(today.total_tokens || 0)}</p>
              </div>
              <i class="fas fa-coins text-4xl text-green-200"></i>
            </div>
          </div>

          <div class="stat-card bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm mb-1">总费用</p>
                <p class="text-3xl font-bold">${formatCost(today.total_cost || 0)}</p>
              </div>
              <i class="fas fa-wallet text-4xl text-purple-200"></i>
            </div>
          </div>

          <div class="stat-card bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm mb-1">成功率</p>
                <p class="text-3xl font-bold">${(today.success_rate || 0).toFixed(1)}%</p>
              </div>
              <i class="fas fa-check-circle text-4xl text-orange-200"></i>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="grid grid-cols-2 gap-6">
          <!-- 厂商分布 -->
          <div class="bg-white rounded-xl p-6 shadow">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              <i class="fas fa-building mr-2 text-indigo-600"></i>
              厂商调用分布
            </h3>
            <div style="height: 280px;">
              <canvas id="providerChart"></canvas>
            </div>
          </div>

          <!-- 热门模型 -->
          <div class="bg-white rounded-xl p-6 shadow">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              <i class="fas fa-fire mr-2 text-orange-600"></i>
              热门模型 Top 5
            </h3>
            <div class="space-y-3">
              ${(dashboardData.topModels || []).map((model, index) => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div class="flex items-center space-x-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                      ${index + 1}
                    </span>
                    <div>
                      <p class="font-medium text-gray-800">${model.display_name}</p>
                      <p class="text-xs text-gray-500">${model.provider_name}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-800">${formatNumber(model.call_count)} 次</p>
                    <p class="text-xs text-gray-500">${formatCost(model.total_cost)}</p>
                  </div>
                </div>
              `).join('')}
              ${(dashboardData.topModels || []).length === 0 ? '<p class="text-center text-gray-500 py-8">暂无数据</p>' : ''}
            </div>
          </div>
        </div>

        <!-- 性能指标 -->
        <div class="bg-white rounded-xl p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-tachometer-alt mr-2 text-indigo-600"></i>
            今日性能指标
          </h3>
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm mb-2">平均响应时间</p>
              <p class="text-2xl font-bold text-gray-800">${(today.avg_latency || 0).toFixed(0)} ms</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm mb-2">Input Tokens</p>
              <p class="text-2xl font-bold text-gray-800">${formatTokens(today.total_input_tokens || 0)}</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm mb-2">Output Tokens</p>
              <p class="text-2xl font-bold text-gray-800">${formatTokens(today.total_output_tokens || 0)}</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm mb-2">Token 比例</p>
              <p class="text-2xl font-bold text-gray-800">
                ${today.total_tokens > 0 ? ((today.total_output_tokens / today.total_tokens) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 渲染厂商分布图表
    renderProviderChart();
    
  } catch (error) {
    content.innerHTML = showError(error.message);
  }
}

// 渲染厂商分布图表
function renderProviderChart() {
  const canvas = document.getElementById('providerChart');
  if (!canvas) return;
  
  // 销毁旧图表
  if (chartInstances.provider) {
    chartInstances.provider.destroy();
  }
  
  const providers = dashboardData.providers || [];
  
  const ctx = canvas.getContext('2d');
  chartInstances.provider = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: providers.map(p => p.provider_name),
      datasets: [{
        data: providers.map(p => p.call_count),
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#4facfe',
          '#43e97b'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} 次 (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// 接入管理页面
async function renderProviders() {
  const content = document.getElementById('content');
  content.innerHTML = showLoading();
  
  try {
    const response = await fetch('/api/providers');
    const result = await response.json();
    
    if (!result.success) {
      content.innerHTML = showError(result.error);
      return;
    }
    
    const providers = result.data || [];
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-building mr-2 text-indigo-600"></i>
            接入管理
          </h2>
          <button onclick="showAddProviderModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <i class="fas fa-plus mr-2"></i>添加厂商
          </button>
        </div>

        <!-- 厂商列表 -->
        <div class="grid grid-cols-3 gap-4">
          ${providers.map(provider => `
            <div class="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <img src="${provider.logo_url || 'https://via.placeholder.com/48'}" alt="${provider.name}" class="w-12 h-12 rounded-lg object-contain bg-white" onerror="this.src='https://via.placeholder.com/48?text=${encodeURIComponent(provider.name.charAt(0))}'">
                  <div>
                    <h3 class="font-semibold text-gray-800">${provider.name}</h3>
                    <p class="text-xs text-gray-500">${provider.slug}</p>
                  </div>
                </div>
                <span class="badge ${provider.status === 'active' ? 'badge-success' : provider.status === 'maintenance' ? 'badge-warning' : 'badge-danger'}">
                  ${provider.status === 'active' ? '正常' : provider.status === 'maintenance' ? '维护中' : '已禁用'}
                </span>
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">接入类型</span>
                  <span class="font-medium ${provider.access_type === 'direct' ? 'text-green-600' : 'text-blue-600'}">
                    <i class="fas ${provider.access_type === 'direct' ? 'fa-link' : 'fa-network-wired'} mr-1"></i>
                    ${provider.access_type === 'direct' ? '直连原厂' : '代理商'}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">${provider.access_type === 'proxy' ? '代理商名称' : '厂商标识'}</span>
                  <span class="font-medium text-gray-800">${provider.access_type === 'proxy' ? (provider.proxy_name || '-') : provider.slug}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">模型数量</span>
                  <span class="font-medium text-gray-800">${provider.model_count || 0} 个</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">优先级</span>
                  <span class="font-medium text-gray-800">${provider.priority || 0}</span>
                </div>
              </div>

              <div class="flex space-x-2">
                <button onclick="viewProviderModels(${provider.id})" class="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium">
                  <i class="fas fa-robot mr-1"></i>查看模型
                </button>
                <button onclick="editProvider(${provider.id})" class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${providers.length === 0 ? `
          <div class="text-center py-16">
            <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">暂无厂商数据</p>
            <button onclick="showAddProviderModal()" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <i class="fas fa-plus mr-2"></i>添加第一个厂商
            </button>
          </div>
        ` : ''}
      </div>
    `;
    
  } catch (error) {
    content.innerHTML = showError(error.message);
  }
}

// 模型列表页面
async function renderModels() {
  const content = document.getElementById('content');
  content.innerHTML = showLoading();
  
  try {
    // 如果有指定厂商ID，只查询该厂商的模型
    const url = window.currentProviderId 
      ? `/api/models?provider_id=${window.currentProviderId}`
      : '/api/models';
    const response = await fetch(url);
    const result = await response.json();
    
    if (!result.success) {
      content.innerHTML = showError(result.error);
      return;
    }
    
    const models = result.data || [];
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-robot mr-2 text-indigo-600"></i>
            模型列表 ${window.currentProviderId ? '- ' + (window.currentProviderName || '') : ''}
          </h2>
          <div class="flex space-x-2">
            ${window.currentProviderId ? `
              <button onclick="renderProviders()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                <i class="fas fa-arrow-left mr-2"></i>返回厂商列表
              </button>
            ` : ''}
            <button onclick="showAddModelModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <i class="fas fa-plus mr-2"></i>添加模型
            </button>
          </div>
        </div>

        <!-- 模型表格 -->
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">厂商</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">接入类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上下文长度</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计费</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${models.map(model => `
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="font-medium text-gray-800">${model.display_name}</p>
                      <p class="text-xs text-gray-500">${model.model_id}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-800">${model.provider_name}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${model.access_type === 'direct' ? 'badge-success' : 'badge-info'}">
                      <i class="fas ${model.access_type === 'direct' ? 'fa-link' : 'fa-network-wired'} mr-1"></i>
                      ${model.access_type === 'direct' ? '直连原厂' : '代理商'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${model.model_type === 'multimodal' ? 'badge-info' : 'badge-success'}">
                      ${model.model_type}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    ${formatTokens(model.context_length || 0)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-xs">
                    ${model.billing_type === 'token' ? `
                      <div>
                        <p>In: ${formatCost(model.input_price || 0)}/1K</p>
                        <p>Out: ${formatCost(model.output_price || 0)}/1K</p>
                      </div>
                    ` : model.billing_type === 'per_call' ? `
                      <p>${formatCost(model.fixed_price || 0)}/次</p>
                    ` : '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${model.status === 'active' ? 'badge-success' : 'badge-danger'}">
                      ${model.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="viewModelDetails(${model.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editModel(${model.id})" class="text-gray-600 hover:text-gray-900">
                      <i class="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${models.length === 0 ? `
            <div class="text-center py-16">
              <i class="fas fa-robot text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">暂无模型数据</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
  } catch (error) {
    content.innerHTML = showError(error.message);
  }
}

// 统计分析页面
async function renderStats() {
  const content = document.getElementById('content');
  content.innerHTML = showLoading();
  
  try {
    // 获取历史数据
    const historyResponse = await fetch('/api/stats/history?days=7');
    const historyResult = await historyResponse.json();
    
    // 获取费用统计
    const costsResponse = await fetch('/api/stats/costs?group_by=provider&days=30');
    const costsResult = await costsResponse.json();
    
    if (!historyResult.success || !costsResult.success) {
      content.innerHTML = showError('加载统计数据失败');
      return;
    }
    
    const history = historyResult.data || [];
    const costs = costsResult.data || [];
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-chart-bar mr-2 text-indigo-600"></i>
            统计分析
          </h2>
          <div class="flex space-x-2">
            <button onclick="renderStats()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <i class="fas fa-sync-alt mr-2"></i>刷新
            </button>
          </div>
        </div>

        <!-- 历史趋势图 -->
        <div class="bg-white rounded-xl p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-chart-line mr-2 text-indigo-600"></i>
            最近7天调用趋势
          </h3>
          <div style="height: 300px;">
            <canvas id="historyChart"></canvas>
          </div>
        </div>

        <!-- 费用统计 -->
        <div class="bg-white rounded-xl p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-coins mr-2 text-indigo-600"></i>
            最近30天费用统计（按厂商）
          </h3>
          <div class="space-y-3">
            ${costs.map((item, index) => {
              const maxCost = Math.max(...costs.map(c => c.total_cost));
              const percentage = maxCost > 0 ? (item.total_cost / maxCost * 100) : 0;
              return `
                <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                      <span class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                        ${index + 1}
                      </span>
                      <div>
                        <p class="font-semibold text-gray-800">${item.name}</p>
                        <p class="text-xs text-gray-500">
                          ${item.access_type === 'direct' ? '直连原厂' : '代理商'} · 
                          ${formatNumber(item.call_count)} 次调用
                        </p>
                      </div>
                    </div>
                    <p class="text-lg font-bold text-indigo-600">${formatCost(item.total_cost)}</p>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-indigo-600 h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Input: ${formatTokens(item.input_tokens)}</span>
                    <span>Output: ${formatTokens(item.output_tokens)}</span>
                  </div>
                </div>
              `;
            }).join('')}
            ${costs.length === 0 ? '<p class="text-center text-gray-500 py-8">暂无数据</p>' : ''}
          </div>
        </div>
      </div>
    `;
    
    // 渲染历史趋势图
    renderHistoryChart(history);
    
  } catch (error) {
    content.innerHTML = showError(error.message);
  }
}

// 渲染历史趋势图
function renderHistoryChart(history) {
  const canvas = document.getElementById('historyChart');
  if (!canvas) return;
  
  if (chartInstances.history) {
    chartInstances.history.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  chartInstances.history = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => formatDate(h.date)),
      datasets: [
        {
          label: '调用次数',
          data: history.map(h => h.call_count),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: '费用 (元)',
          data: history.map(h => h.total_cost),
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '调用次数'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: '费用 (元)'
          },
          grid: {
            drawOnChartArea: false,
          }
        }
      }
    }
  });
}

// 调用日志页面
async function renderLogs() {
  const content = document.getElementById('content');
  content.innerHTML = showLoading();
  
  try {
    const response = await fetch('/api/logs?page=1&limit=50');
    const result = await response.json();
    
    if (!result.success) {
      content.innerHTML = showError(result.error);
      return;
    }
    
    const logs = result.data || [];
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-list mr-2 text-indigo-600"></i>
            调用日志
          </h2>
        </div>

        <!-- 日志表格 -->
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">费用</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">响应时间</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">来源</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${logs.map(log => `
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    ${formatDateTime(log.created_at)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div>
                      <p class="font-medium text-gray-800 text-xs">${log.model_name}</p>
                      <p class="text-xs text-gray-500">${log.provider_name}</p>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-xs">
                    <p class="text-gray-800">${formatTokens(log.total_tokens)}</p>
                    <p class="text-gray-500">↑${formatTokens(log.input_tokens)} ↓${formatTokens(log.output_tokens)}</p>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-800">
                    ${formatCost(log.total_cost)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    ${log.latency || 0} ms
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}">
                      ${log.status}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    ${log.source || '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${logs.length === 0 ? `
            <div class="text-center py-16">
              <i class="fas fa-list text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">暂无日志数据</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
  } catch (error) {
    content.innerHTML = showError(error.message);
  }
}

// 模型切换页面
async function renderSwitch() {
  const content = document.getElementById('content');
  content.innerHTML = showLoading();
  
  try {
    const [activeResponse, modelsResponse, historyResponse] = await Promise.all([
      fetch('/api/active-model'),
      fetch('/api/models'),
      fetch('/api/switch-history')
    ]);
    
    const activeResult = await activeResponse.json();
    const modelsResult = await modelsResponse.json();
    const historyResult = await historyResponse.json();
    
    const activeModel = activeResult.data || null;
    const models = modelsResult.data || [];
    const history = historyResult.data || [];
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-exchange-alt mr-2 text-indigo-600"></i>
            模型切换
          </h2>
        </div>

        <!-- 当前激活模型 -->
        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <h3 class="text-lg font-semibold mb-4">
            <i class="fas fa-check-circle mr-2"></i>
            当前激活模型
          </h3>
          ${activeModel ? `
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <img src="${activeModel.logo_url || 'https://via.placeholder.com/48'}" alt="${activeModel.provider_name}" class="w-16 h-16 rounded-lg bg-white p-2">
                <div>
                  <p class="text-2xl font-bold">${activeModel.display_name}</p>
                  <p class="text-indigo-100">${activeModel.provider_name}</p>
                  <p class="text-xs text-indigo-200 mt-1">最后更新: ${formatDateTime(activeModel.updated_at)}</p>
                </div>
              </div>
              <button onclick="showSwitchModal()" class="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold">
                <i class="fas fa-random mr-2"></i>切换模型
              </button>
            </div>
          ` : `
            <div class="text-center py-8">
              <p class="mb-4">尚未配置默认模型</p>
              <button onclick="showSwitchModal()" class="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold">
                <i class="fas fa-cog mr-2"></i>立即配置
              </button>
            </div>
          `}
        </div>

        <!-- 切换历史 -->
        <div class="bg-white rounded-xl p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-history mr-2 text-indigo-600"></i>
            切换历史记录
          </h3>
          <div class="space-y-3">
            ${history.map(record => {
              const scenarioLabels = {
                'default': '🌍 全局默认',
                'customer-service': '💬 客户服务',
                'content-generation': '✍️ 内容生成',
                'translation': '🌏 翻译服务',
                'analysis': '📊 数据分析',
                'summarization': '📑 文本摘要'
              };
              const scenarioLabel = scenarioLabels[record.scenario] || record.scenario;
              
              return `
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    ${record.from_model_name ? `
                      <span class="text-sm font-medium text-gray-600">${record.from_model_name}</span>
                      <i class="fas fa-arrow-right text-gray-400"></i>
                    ` : ''}
                    <span class="text-sm font-semibold text-indigo-600">${record.to_model_name}</span>
                    <span class="badge ${record.status === 'success' ? 'badge-success' : 'badge-danger'}">
                      ${record.status}
                    </span>
                    ${record.scenario ? `
                      <span class="badge badge-info">${scenarioLabel}</span>
                    ` : ''}
                  </div>
                  <p class="text-xs text-gray-500 mb-1">
                    <i class="fas fa-user mr-1"></i>${record.operator} · 
                    <i class="fas fa-clock mr-1"></i>${formatDateTime(record.executed_at)}
                  </p>
                  <p class="text-xs text-gray-600">${record.reason}</p>
                </div>
              </div>
              `;
            }).join('')}
            ${history.length === 0 ? '<p class="text-center text-gray-500 py-8">暂无切换记录</p>' : ''}
          </div>
        </div>
      </div>
    `;
    
    // 保存模型列表供切换模态框使用
    window.availableModels = models;
    
  } catch (error) {
    content.innerHTML = showError(error.message);
  }
}

// 显示切换模型模态框
function showSwitchModal() {
  const models = window.availableModels || [];
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-800">
          <i class="fas fa-exchange-alt mr-2 text-indigo-600"></i>
          模型切换
        </h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="p-6">
        <!-- 应用场景选择 -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-layer-group mr-2 text-indigo-600"></i>
            选择应用场景
          </label>
          <select id="scenarioSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="default">🌍 全局默认（所有应用）</option>
            <option value="customer-service">💬 客户服务</option>
            <option value="content-generation">✍️ 内容生成</option>
            <option value="translation">🌏 翻译服务</option>
            <option value="analysis">📊 数据分析</option>
            <option value="summarization">📑 文本摘要</option>
          </select>
          <p class="text-xs text-gray-500 mt-2">
            <i class="fas fa-info-circle mr-1"></i>
            选择“全局默认”将应用于所有场景，选择特定场景则仅影响该场景
          </p>
        </div>

        <!-- 切换原因选择 -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-clipboard-list mr-2 text-indigo-600"></i>
            切换原因
          </label>
          <select id="reasonSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="性能优化">⚡ 性能优化 - 提升响应速度</option>
            <option value="成本优化">💰 成本优化 - 降低运营费用</option>
            <option value="功能扩展">🚀 功能扩展 - 使用新特性</option>
            <option value="故障转移">⚠️ 故障转移 - 原模型不可用</option>
            <option value="测试验证">🧪 测试验证 - 新模型测试</option>
            <option value="其他">📝 其他原因</option>
          </select>
        </div>

        <!-- 自定义原因输入 -->
        <div id="customReasonDiv" class="mb-6 hidden">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            请输入具体原因
          </label>
          <input type="text" id="customReasonInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="请详细描述切换原因...">
        </div>

        <!-- 操作人员 -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-user mr-2 text-indigo-600"></i>
            操作人员
          </label>
          <input type="text" id="operatorInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="请输入操作人员姓名" value="admin">
        </div>

        <!-- 目标模型选择 -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            <i class="fas fa-robot mr-2 text-indigo-600"></i>
            选择目标模型
          </label>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            ${models.filter(m => m.status === 'active').map(model => `
              <div class="model-option p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition" data-model-id="${model.id}" data-model-name="${model.display_name}">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <p class="font-semibold text-gray-800">${model.display_name}</p>
                      <span class="badge badge-info">${model.model_type}</span>
                    </div>
                    <p class="text-sm text-gray-500">${model.provider_name} · ${model.model_id}</p>
                  </div>
                  <div class="text-right">
                    ${model.billing_type === 'token' ? `
                      <p class="text-xs text-gray-500">计费</p>
                      <p class="text-xs text-gray-700">
                        In: ${formatCost(model.input_price)}/1K<br>
                        Out: ${formatCost(model.output_price)}/1K
                      </p>
                    ` : '-'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button onclick="this.closest('.fixed').remove()" class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
            <i class="fas fa-times mr-2"></i>取消
          </button>
          <button id="confirmSwitchBtn" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold" disabled>
            <i class="fas fa-check mr-2"></i>确认切换
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 绑定事件
  let selectedModelId = null;
  let selectedModelName = '';
  
  // 模型选择
  modal.querySelectorAll('.model-option').forEach(option => {
    option.addEventListener('click', function() {
      modal.querySelectorAll('.model-option').forEach(opt => {
        opt.classList.remove('border-indigo-500', 'bg-indigo-50');
      });
      this.classList.add('border-indigo-500', 'bg-indigo-50');
      
      selectedModelId = this.dataset.modelId;
      selectedModelName = this.dataset.modelName;
      
      // 启用确认按钮
      document.getElementById('confirmSwitchBtn').disabled = false;
    });
  });
  
  // 切换原因变化
  document.getElementById('reasonSelect').addEventListener('change', function() {
    const customDiv = document.getElementById('customReasonDiv');
    if (this.value === '其他') {
      customDiv.classList.remove('hidden');
    } else {
      customDiv.classList.add('hidden');
    }
  });
  
  // 确认切换
  document.getElementById('confirmSwitchBtn').addEventListener('click', async function() {
    if (!selectedModelId) {
      alert('请选择目标模型');
      return;
    }
    
    const scenario = document.getElementById('scenarioSelect').value;
    const reasonSelect = document.getElementById('reasonSelect').value;
    const customReason = document.getElementById('customReasonInput').value;
    const operator = document.getElementById('operatorInput').value;
    
    const reason = reasonSelect === '其他' ? customReason : reasonSelect;
    
    if (!reason) {
      alert('请输入切换原因');
      return;
    }
    
    if (!operator) {
      alert('请输入操作人员');
      return;
    }
    
    // 禁用按钮，显示加载状态
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>切换中...';
    
    try {
      const response = await fetch('/api/switch-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_model_id: selectedModelId,
          reason: reason,
          operator: operator,
          scenario: scenario
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 显示成功提示
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
          <div class="flex items-center space-x-3">
            <i class="fas fa-check-circle text-2xl"></i>
            <div>
              <p class="font-semibold">模型切换成功！</p>
              <p class="text-sm">已切换到: ${selectedModelName}</p>
            </div>
          </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          successDiv.remove();
        }, 3000);
        
        modal.remove();
        renderSwitch();
      } else {
        alert('❓ 切换失败: ' + result.error);
        this.disabled = false;
        this.innerHTML = '<i class="fas fa-check mr-2"></i>确认切换';
      }
    } catch (error) {
      alert('❓ 切换失败: ' + error.message);
      this.disabled = false;
      this.innerHTML = '<i class="fas fa-check mr-2"></i>确认切换';
    }
  });
}

// 选择模型进行切换（保留用于向后兼容）
async function selectModelForSwitch(modelId, modelName) {
  showSwitchModal();
}

// 显示添加厂商模态框
function showAddProviderModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-8">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
        <h3 class="text-xl font-bold text-gray-800">
          <i class="fas fa-plus-circle mr-2 text-indigo-600"></i>
          添加模型厂商
        </h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="addProviderForm" class="p-6 space-y-4">
        <!-- 基本信息 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-building mr-1 text-indigo-600"></i>
              厂商名称 <span class="text-red-500">*</span>
            </label>
            <input type="text" id="providerName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="如：OpenAI">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-tag mr-1 text-indigo-600"></i>
              厂商标识 (slug) <span class="text-red-500">*</span>
            </label>
            <input type="text" id="providerSlug" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="如：openai">
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-image mr-1 text-indigo-600"></i>
            Logo URL
          </label>
          <input type="url" id="providerLogo" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://cdn.simpleicons.org/openai">
        </div>

        <!-- 接入类型 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-network-wired mr-1 text-indigo-600"></i>
            接入类型 <span class="text-red-500">*</span>
          </label>
          <select id="accessType" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="direct">直连原厂</option>
            <option value="proxy">代理商</option>
          </select>
        </div>

        <!-- 代理商名称（条件显示） -->
        <div id="proxyNameDiv" class="hidden">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-user-tie mr-1 text-indigo-600"></i>
            代理商名称
          </label>
          <input type="text" id="proxyName" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="如：硅基流动">
        </div>

        <!-- API 配置 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-link mr-1 text-indigo-600"></i>
            API Base URL <span class="text-red-500">*</span>
          </label>
          <input type="url" id="apiBaseUrl" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://api.openai.com/v1">
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <i class="fas fa-key mr-1 text-indigo-600"></i>
            API Key <span class="text-red-500">*</span>
          </label>
          <input type="password" id="apiKey" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="sk-...">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-shield-alt mr-1 text-indigo-600"></i>
              认证方式
            </label>
            <select id="authType" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="bearer">Bearer Token</option>
              <option value="api_key">API Key</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-sort-numeric-up mr-1 text-indigo-600"></i>
              优先级
            </label>
            <input type="number" id="priority" value="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
            <i class="fas fa-times mr-2"></i>取消
          </button>
          <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">
            <i class="fas fa-check mr-2"></i>确认添加
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 监听接入类型变化
  document.getElementById('accessType').addEventListener('change', function() {
    const proxyDiv = document.getElementById('proxyNameDiv');
    if (this.value === 'proxy') {
      proxyDiv.classList.remove('hidden');
    } else {
      proxyDiv.classList.add('hidden');
    }
  });
  
  // 表单提交
  document.getElementById('addProviderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = {
      name: document.getElementById('providerName').value,
      slug: document.getElementById('providerSlug').value,
      logo_url: document.getElementById('providerLogo').value || null,
      access_type: document.getElementById('accessType').value,
      proxy_name: document.getElementById('accessType').value === 'proxy' ? document.getElementById('proxyName').value : null,
      api_base_url: document.getElementById('apiBaseUrl').value,
      api_key: document.getElementById('apiKey').value,
      auth_type: document.getElementById('authType').value,
      priority: parseInt(document.getElementById('priority').value)
    };
    
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 显示成功提示
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
          <div class="flex items-center space-x-3">
            <i class="fas fa-check-circle text-2xl"></i>
            <div>
              <p class="font-semibold">厂商添加成功！</p>
              <p class="text-sm">${data.name}</p>
            </div>
          </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          successDiv.remove();
        }, 3000);
        
        modal.remove();
        renderProviders();
      } else {
        alert('❌ 添加失败: ' + result.error);
      }
    } catch (error) {
      alert('❌ 添加失败: ' + error.message);
    }
  });
}

async function viewProviderModels(providerId) {
  currentPage = 'models';
  window.currentProviderId = providerId;
  
  // 获取厂商信息
  try {
    const response = await fetch(`/api/providers/${providerId}`);
    const result = await response.json();
    if (result.success) {
      window.currentProviderName = result.data.name;
    }
  } catch (error) {
    console.error(error);
  }
  
  renderModels();
}

function editProvider(providerId) {
  alert('编辑厂商功能开发中...');
}

function showAddModelModal() {
  alert('添加模型功能开发中...');
}

function viewModelDetails(modelId) {
  alert('查看模型详情功能开发中...');
}

function editModel(modelId) {
  alert('编辑模型功能开发中...');
}

// ========================================
// 页面路由和初始化
// ========================================

function switchPage(page) {
  currentPage = page;
  
  // 更新导航激活状态
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  
  // 渲染对应页面
  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'providers':
      renderProviders();
      break;
    case 'models':
      renderModels();
      break;
    case 'stats':
      renderStats();
      break;
    case 'logs':
      renderLogs();
      break;
    case 'switch':
      renderSwitch();
      break;
    default:
      renderDashboard();
  }
}

// 更新当前时间
function updateTime() {
  const now = new Date();
  document.getElementById('currentTime').textContent = now.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  // 绑定导航点击事件
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      switchPage(page);
    });
  });
  
  // 更新时间
  updateTime();
  setInterval(updateTime, 1000);
  
  // 加载默认页面
  renderDashboard();
});
