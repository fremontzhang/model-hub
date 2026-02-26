// ========================================
// Model Hub v1.2 - 功能补充和重写
// ========================================

// 重写：统计分析页面（Tab 结构）
const originalRenderStats = renderStats;
renderStats = async function() {
  const content = document.getElementById('content');
  window.currentStatsTab = window.currentStatsTab || 'cost';
  
  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-chart-bar mr-2 text-indigo-600"></i>
          统计分析
        </h2>
        <button onclick="renderStats()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <i class="fas fa-sync-alt mr-2"></i>刷新
        </button>
      </div>

      <!-- Tab 导航 -->
      <div class="bg-white rounded-xl shadow">
        <div class="flex border-b">
          <button onclick="switchStatsTab('cost')" class="flex-1 px-6 py-4 font-semibold hover:text-indigo-600 transition border-b-2 ${window.currentStatsTab === 'cost' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700'}">
            <i class="fas fa-coins mr-2"></i>成本统计
          </button>
          <button onclick="switchStatsTab('logs')" class="flex-1 px-6 py-4 font-semibold hover:text-indigo-600 transition border-b-2 ${window.currentStatsTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700'}">
            <i class="fas fa-list mr-2"></i>调用日志
          </button>
        </div>
        
        <!-- Tab 内容区 -->
        <div id="statsTabContent" class="p-6">
          ${showLoading()}
        </div>
      </div>
    </div>
  `;
  
  // 渲染当前Tab内容
  if (window.currentStatsTab === 'cost') {
    renderCostTab();
  } else {
    renderLogsTab();
  }
};

// Tab 切换
window.switchStatsTab = function(tab) {
  window.currentStatsTab = tab;
  renderStats();
};

// 成本统计 Tab
window.renderCostTab = async function() {
  const tabContent = document.getElementById('statsTabContent');
  tabContent.innerHTML = showLoading();
  
  try {
    const [historyResponse, costsResponse, scenarioResponse] = await Promise.all([
      fetch('/api/stats/history?days=7'),
      fetch('/api/stats/costs?group_by=provider&days=30'),
      fetch('/api/stats/by-scenario?days=30')
    ]);
    
    const historyResult = await historyResponse.json();
    const costsResult = await costsResponse.json();
    const scenarioResult = await scenarioResponse.json();
    
    const history = historyResult.data || [];
    const costs = costsResult.data || [];
    const scenarios = scenarioResult.data || [];
    
    const scenarioLabels = {
      'default': '🌍 全局默认',
      'customer-service': '💬 客户服务',
      'content-generation': '✍️ 内容生成',
      'translation': '🌏 翻译服务',
      'analysis': '📊 数据分析',
      'summarization': '📑 文本摘要'
    };
    
    tabContent.innerHTML = `
      <div class="space-y-6">
        <!-- 历史趋势图 -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-chart-line mr-2 text-indigo-600"></i>
            最近7天调用趋势
          </h3>
          <div style="height: 300px;">
            <canvas id="historyChart"></canvas>
          </div>
        </div>

        <!-- 按业务场景拆解 -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-layer-group mr-2 text-indigo-600"></i>
            按业务场景拆解（最近30天）
          </h3>
          <div class="grid grid-cols-3 gap-4">
            ${scenarios.map(item => {
              const label = scenarioLabels[item.scenario] || item.scenario;
              return `
                <div class="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-800">${label}</h4>
                    <span class="text-2xl font-bold text-indigo-600">${formatNumber(item.call_count)}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p class="text-gray-500">总费用</p>
                      <p class="font-semibold text-gray-800">${formatCost(item.total_cost)}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">平均响应</p>
                      <p class="font-semibold text-gray-800">${(item.avg_latency || 0).toFixed(0)}ms</p>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
            ${scenarios.length === 0 ? '<p class="col-span-3 text-center text-gray-500 py-8">暂无数据</p>' : ''}
          </div>
        </div>

        <!-- 按厂商费用统计 -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-coins mr-2 text-indigo-600"></i>
            按厂商费用统计（最近30天）
          </h3>
          <div class="space-y-3">
            ${costs.slice(0, 5).map((item, index) => {
              const maxCost = Math.max(...costs.map(c => c.total_cost));
              const percentage = maxCost > 0 ? (item.total_cost / maxCost * 100) : 0;
              return `
                <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                      <span class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">${index + 1}</span>
                      <div>
                        <p class="font-semibold text-gray-800">${item.name}</p>
                        <p class="text-xs text-gray-500">${item.access_type === 'direct' ? '直连原厂' : '代理商'} · ${formatNumber(item.call_count)} 次调用</p>
                      </div>
                    </div>
                    <p class="text-lg font-bold text-indigo-600">${formatCost(item.total_cost)}</p>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
            ${costs.length === 0 ? '<p class="text-center text-gray-500 py-8">暂无数据</p>' : ''}
          </div>
        </div>
      </div>
    `;
    
    renderHistoryChart(history);
  } catch (error) {
    tabContent.innerHTML = showError(error.message);
  }
};

// 调用日志 Tab
window.renderLogsTab = async function() {
  const tabContent = document.getElementById('statsTabContent');
  tabContent.innerHTML = showLoading();
  
  try {
    const response = await fetch('/api/logs?page=1&limit=30');
    const result = await response.json();
    const logs = result.data || [];
    
    const scenarioLabels = {
      'default': '🌍', 'customer-service': '💬', 'content-generation': '✍️',
      'translation': '🌏', 'analysis': '📊', 'summarization': '📑'
    };
    
    tabContent.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">场景</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">费用</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">响应</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${logs.map(log => `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-xs">${formatDateTime(log.created_at)}</td>
                <td class="px-4 py-3">
                  <p class="font-medium text-xs">${log.model_name}</p>
                  <p class="text-xs text-gray-500">${log.provider_name}</p>
                </td>
                <td class="px-4 py-3 text-center">${scenarioLabels[log.scenario] || '-'}</td>
                <td class="px-4 py-3 text-xs">${formatTokens(log.total_tokens)}</td>
                <td class="px-4 py-3 text-xs font-medium">${formatCost(log.total_cost)}</td>
                <td class="px-4 py-3 text-xs">${log.latency || 0}ms</td>
                <td class="px-4 py-3">
                  <span class="badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}">${log.status}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${logs.length === 0 ? '<p class="text-center text-gray-500 py-8">暂无数据</p>' : ''}
      </div>
    `;
  } catch (error) {
    tabContent.innerHTML = showError(error.message);
  }
};

// 重写：场景路由页面
const originalRenderSwitch = renderSwitch;
renderSwitch = async function() {
  const content = document.getElementById('content');
  content.innerHTML = showLoading();
  
  try {
    const [scenariosResponse, modelsResponse] = await Promise.all([
      fetch('/api/active-models/all'),
      fetch('/api/models')
    ]);
    
    const scenariosResult = await scenariosResponse.json();
    const modelsResult = await modelsResponse.json();
    
    const scenarios = scenariosResult.data || [];
    const models = modelsResult.data || [];
    
    const scenarioLabels = {
      'default': { icon: '🌍', name: '全局默认', desc: '所有应用的默认配置' },
      'customer-service': { icon: '💬', name: '客户服务', desc: '面向客户的主力对话模式' },
      'content-generation': { icon: '✍️', name: '内容生成', desc: '长文本生成及辅助生成成' },
      'translation': { icon: '🌏', name: '翻译服务', desc: '英日中翻译或api译口' },
      'analysis': { icon: '📊', name: '数据分析', desc: '内部研究分析场景' },
      'summarization': { icon: '📑', name: '文本摘要', desc: '长文本处理压缩场景' }
    };
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-route mr-2 text-indigo-600"></i>
            场景路由
          </h2>
          <p class="text-sm text-gray-500">管理不同业务场景所使用的 AI 模型及供应商</p>
        </div>

        <!-- 场景卡片 -->
        <div class="grid grid-cols-2 gap-4">
          ${Object.keys(scenarioLabels).map(key => {
            const info = scenarioLabels[key];
            const config = scenarios.find(s => s.scenario === key);
            
            return `
              <div class="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-1">
                      ${info.icon} ${info.name}
                    </h3>
                    <p class="text-sm text-gray-500">${info.desc}</p>
                  </div>
                  <span class="badge ${config ? 'badge-success' : 'badge-warning'}">
                    ${config ? '已配置' : '未配置'}
                  </span>
                </div>
                
                ${config ? `
                  <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <img src="${config.logo_url}" class="w-10 h-10 rounded-lg bg-white p-1" onerror="this.src='https://via.placeholder.com/40'">
                        <div>
                          <p class="font-semibold text-gray-800">${config.display_name}</p>
                          <p class="text-xs text-gray-500">${config.provider_name}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="badge ${config.access_type === 'direct' ? 'badge-success' : 'badge-info'}">
                          ${config.access_type === 'direct' ? '直连' : '代理'}
                        </span>
                      </div>
                    </div>
                    <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span class="text-gray-500">Input:</span>
                        <span class="font-medium">${formatCost(config.input_price)}/1K</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Output:</span>
                        <span class="font-medium">${formatCost(config.output_price)}/1K</span>
                      </div>
                    </div>
                  </div>
                ` : `
                  <div class="bg-yellow-50 rounded-lg p-4 mb-4 text-center">
                    <p class="text-sm text-yellow-800">⚠️ 尚未配置模型</p>
                  </div>
                `}
                
                <button onclick="showScenarioSwitchModal('${key}', '${info.name}')" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                  <i class="fas fa-exchange-alt mr-2"></i>
                  ${config ? '切换模型' : '配置模型'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    window.availableModels = models;
  } catch (error) {
    content.innerHTML = showError(error.message);
  }
};

// 显示场景切换模态框
window.showScenarioSwitchModal = function(scenario, scenarioName) {
  const models = window.availableModels || [];
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-8">
      <div class="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
        <h3 class="text-xl font-bold text-gray-800">
          <i class="fas fa-exchange-alt mr-2 text-indigo-600"></i>
          切换模型 - ${scenarioName}
        </h3>
        <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="p-6">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">切换原因</label>
          <select id="switchReason" class="w-full px-4 py-2 border rounded-lg">
            <option>⚡ 性能优化</option>
            <option>💰 成本优化</option>
            <option>🚀 功能扩展</option>
            <option>⚠️ 故障转移</option>
            <option>🧪 测试验证</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">选择模型</label>
          <div class="space-y-2 max-h-96 overflow-y-auto">
            ${models.filter(m => m.status === 'active').map(model => `
              <div class="model-option p-3 border-2 rounded-lg cursor-pointer hover:border-indigo-500" data-model-id="${model.id}">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold">${model.display_name}</p>
                    <p class="text-sm text-gray-500">${model.provider_name}</p>
                  </div>
                  <span class="badge ${model.access_type === 'direct' ? 'badge-success' : 'badge-info'}">
                    ${model.access_type === 'direct' ? '直连' : '代理'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-100 rounded-lg">取消</button>
          <button id="confirmSwitch" class="px-6 py-2 bg-indigo-600 text-white rounded-lg" disabled>确认切换</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  let selectedModelId = null;
  modal.querySelectorAll('.model-option').forEach(opt => {
    opt.addEventListener('click', function() {
      modal.querySelectorAll('.model-option').forEach(o => o.classList.remove('border-indigo-500', 'bg-indigo-50'));
      this.classList.add('border-indigo-500', 'bg-indigo-50');
      selectedModelId = this.dataset.modelId;
      document.getElementById('confirmSwitch').disabled = false;
    });
  });
  
  document.getElementById('confirmSwitch').addEventListener('click', async function() {
    if (!selectedModelId) return;
    
    const reason = document.getElementById('switchReason').value;
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>切换中...';
    
    try {
      const response = await fetch('/api/switch-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_model_id: selectedModelId,
          reason: reason,
          operator: 'admin',
          scenario: scenario
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        modal.remove();
        const notice = document.createElement('div');
        notice.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
        notice.innerHTML = '<i class="fas fa-check-circle mr-2"></i>切换成功！';
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 2000);
        renderSwitch();
      } else {
        alert('切换失败: ' + result.error);
        this.disabled = false;
        this.innerHTML = '确认切换';
      }
    } catch (error) {
      alert('切换失败: ' + error.message);
      this.disabled = false;
      this.innerHTML = '确认切换';
    }
  });
};

// 更新路由
const originalSwitchPage = switchPage;
switchPage = function(page) {
  currentPage = page;
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'providers': renderProviders(); break;
    case 'models': renderModels(); break;
    case 'stats': renderStats(); break;
    case 'switch': renderSwitch(); break;
    default: renderDashboard();
  }
};

console.log('Model Hub v1.2 - 功能增强已加载');
