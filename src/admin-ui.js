export function getAdminHTML() {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>NGINX-CF 管理面板</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #141414;
        --card: #1e1e1e;
        --border: #2a2a2a;
        --text: #f5f5f5;
        --muted: #9ca3af;
        --accent: #4f8cff;
        --accent-soft: rgba(79, 140, 255, 0.12);
        --success: #22c55e;
        --danger: #ef4444;
        --warning: #f59e0b;
        --shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        background: var(--bg);
        color: var(--text);
        font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      body {
        min-height: 100vh;
      }

      button,
      input {
        font: inherit;
      }

      button {
        border: 1px solid var(--border);
        background: #252525;
        color: var(--text);
        border-radius: 10px;
        padding: 10px 14px;
        cursor: pointer;
        transition: 0.2s ease;
      }

      button:hover {
        border-color: #3a3a3a;
        transform: translateY(-1px);
      }

      button.primary {
        background: var(--accent);
        border-color: var(--accent);
        color: white;
      }

      button.danger {
        background: rgba(239, 68, 68, 0.12);
        color: #fca5a5;
        border-color: rgba(239, 68, 68, 0.2);
      }

      input {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 11px 12px;
        background: #181818;
        color: var(--text);
        outline: none;
      }

      input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-soft);
      }

      .hidden {
        display: none !important;
      }

      .app-shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 18px 24px;
        border-bottom: 1px solid var(--border);
        background: rgba(20, 20, 20, 0.92);
        backdrop-filter: blur(12px);
        position: sticky;
        top: 0;
        z-index: 20;
      }

      .brand {
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.04em;
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .panel-tag {
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        color: var(--muted);
        font-size: 12px;
      }

      .layout {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr);
        gap: 24px;
        padding: 24px;
        flex: 1;
      }

      .sidebar,
      .main-panel,
      .login-card,
      .modal-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 18px;
        box-shadow: var(--shadow);
      }

      .sidebar {
        padding: 18px;
        min-height: 0;
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .sidebar-title,
      .main-title {
        font-size: 18px;
        font-weight: 700;
      }

      .sidebar-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: calc(100vh - 220px);
        overflow: auto;
      }

      .sidebar-item {
        width: 100%;
        padding: 12px;
        border-radius: 14px;
        background: #181818;
        border: 1px solid transparent;
        text-align: left;
      }

      .sidebar-item:hover,
      .sidebar-item.active {
        border-color: var(--accent);
        background: rgba(79, 140, 255, 0.08);
      }

      .sidebar-item-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex: 0 0 auto;
        background: var(--danger);
      }

      .dot.healthy {
        background: var(--success);
      }

      .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sidebar-meta {
        margin-top: 6px;
        color: var(--muted);
        font-size: 12px;
      }

      .main-panel {
        padding: 22px;
        min-width: 0;
      }

      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }

      .toolbar-right {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        width: min(100%, 520px);
      }

      .search-wrap {
        flex: 1;
        min-width: 220px;
      }

      .table-wrap {
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        background: #181818;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        text-align: left;
        vertical-align: middle;
      }

      th {
        color: var(--muted);
        font-weight: 600;
        background: rgba(255, 255, 255, 0.02);
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr.highlight {
        background: rgba(79, 140, 255, 0.12);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 12px;
        border: 1px solid transparent;
      }

      .badge.healthy {
        color: #86efac;
        background: rgba(34, 197, 94, 0.12);
        border-color: rgba(34, 197, 94, 0.18);
      }

      .badge.unhealthy {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.18);
      }

      .empty-state {
        padding: 48px 20px;
        text-align: center;
        color: var(--muted);
      }

      .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .pagination-controls {
        display: flex;
        gap: 8px;
      }

      .footer {
        padding: 18px 24px 24px;
        text-align: center;
        color: var(--muted);
        font-size: 12px;
      }

      .login-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      .login-card {
        width: min(100%, 420px);
        padding: 28px;
      }

      .login-title {
        font-size: 24px;
        font-weight: 800;
        margin-bottom: 8px;
      }

      .login-subtitle,
      .error-text,
      .helper-text {
        color: var(--muted);
      }

      .login-form,
      .modal-form {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .error-text {
        min-height: 21px;
        color: #fca5a5;
      }

      .modal {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.52);
        display: grid;
        place-items: center;
        padding: 24px;
        z-index: 30;
      }

      .modal-card {
        width: min(100%, 460px);
        padding: 24px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .muted {
        color: var(--muted);
      }

      .text-right {
        text-align: right;
      }

      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
          padding: 16px;
        }

        .sidebar {
          order: -1;
        }

        .sidebar-list {
          max-height: none;
          flex-direction: row;
          overflow: auto;
          padding-bottom: 2px;
        }

        .sidebar-item {
          min-width: 220px;
        }
      }

      @media (max-width: 640px) {
        .topbar,
        .main-panel,
        .sidebar,
        .login-card,
        .modal-card {
          border-radius: 16px;
        }

        .topbar {
          margin: 12px 12px 0;
          padding: 16px;
        }

        .layout {
          padding: 12px;
          gap: 12px;
        }

        .toolbar-right {
          width: 100%;
        }

        .search-wrap {
          width: 100%;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          min-width: 720px;
        }
      }
    </style>
  </head>
  <body>
    <section id="loginView" class="login-shell hidden">
      <div class="login-card">
        <div class="login-title">NGINX-CF</div>
        <div class="login-subtitle">输入管理员 Token 进入管理面板</div>
        <form id="loginForm" class="login-form">
          <label>
            <div class="helper-text">Admin Token</div>
            <input id="tokenInput" type="password" placeholder="请输入 X-Admin-Token" autocomplete="off" />
          </label>
          <div id="loginError" class="error-text"></div>
          <button class="primary" type="submit">登录</button>
        </form>
      </div>
    </section>

    <section id="appView" class="app-shell hidden">
      <header class="topbar">
        <div class="brand">NGINX-CF</div>
        <div class="topbar-actions">
          <span class="panel-tag">管理面板</span>
          <button id="logoutBtn" type="button">退出</button>
        </div>
      </header>

      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-title">上游列表</div>
            <span id="sidebarCount" class="muted">0</span>
          </div>
          <div id="sidebarList" class="sidebar-list"></div>
        </aside>

        <main class="main-panel">
          <div class="toolbar">
            <div>
              <div class="main-title">上游管理</div>
              <div class="muted">查看状态、搜索、增删上游并刷新健康检查结果</div>
            </div>
            <div class="toolbar-right">
              <div class="search-wrap">
                <input id="searchInput" type="search" placeholder="搜索 URL..." />
              </div>
              <button id="refreshBtn" type="button">↻ 刷新</button>
              <button id="addBtn" class="primary" type="button">＋ 添加上游</button>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>状态</th>
                  <th>延迟</th>
                  <th>最后检查时间</th>
                  <th class="text-right">操作</th>
                </tr>
              </thead>
              <tbody id="tableBody"></tbody>
            </table>
            <div id="emptyState" class="empty-state hidden">暂无上游，或者没有匹配当前搜索结果。</div>
          </div>

          <div class="pagination">
            <div id="pageInfo" class="muted">第 1 / 1 页</div>
            <div class="pagination-controls">
              <button id="prevPageBtn" type="button">← 上一页</button>
              <button id="nextPageBtn" type="button">下一页 →</button>
            </div>
          </div>
        </main>
      </div>

      <footer class="footer">Nginx-CF v1.0.0</footer>
    </section>

    <div id="modal" class="modal hidden">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <div class="main-title">添加上游</div>
            <div class="muted">输入完整 URL，例如 https://example.com</div>
          </div>
          <button id="closeModalBtn" type="button">✕</button>
        </div>
        <form id="modalForm" class="modal-form">
          <input id="upstreamInput" type="url" placeholder="https://example.com" autocomplete="off" required />
          <div id="modalError" class="error-text"></div>
          <button class="primary" type="submit">保存</button>
        </form>
      </div>
    </div>

    <script>
      (function () {
        var STORAGE_KEY = 'nginx-cf-admin-token';
        var PAGE_SIZE = 10;
        var state = {
          token: sessionStorage.getItem(STORAGE_KEY) || '',
          upstreams: [],
          filtered: [],
          page: 1,
          activeUrl: ''
        };

        var els = {
          loginView: document.getElementById('loginView'),
          appView: document.getElementById('appView'),
          loginForm: document.getElementById('loginForm'),
          tokenInput: document.getElementById('tokenInput'),
          loginError: document.getElementById('loginError'),
          logoutBtn: document.getElementById('logoutBtn'),
          sidebarList: document.getElementById('sidebarList'),
          sidebarCount: document.getElementById('sidebarCount'),
          tableBody: document.getElementById('tableBody'),
          emptyState: document.getElementById('emptyState'),
          searchInput: document.getElementById('searchInput'),
          refreshBtn: document.getElementById('refreshBtn'),
          addBtn: document.getElementById('addBtn'),
          pageInfo: document.getElementById('pageInfo'),
          prevPageBtn: document.getElementById('prevPageBtn'),
          nextPageBtn: document.getElementById('nextPageBtn'),
          modal: document.getElementById('modal'),
          modalForm: document.getElementById('modalForm'),
          upstreamInput: document.getElementById('upstreamInput'),
          modalError: document.getElementById('modalError'),
          closeModalBtn: document.getElementById('closeModalBtn')
        };

        function escapeHtml(value) {
          return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }

        function setView(isLoggedIn) {
          els.loginView.classList.toggle('hidden', isLoggedIn);
          els.appView.classList.toggle('hidden', !isLoggedIn);
          if (!isLoggedIn) {
            els.tokenInput.value = state.token;
            els.tokenInput.focus();
          }
        }

        function formatLatency(latency) {
          return Number.isFinite(latency) ? latency + ' ms' : '—';
        }

        function formatTime(value) {
          if (!value) {
            return '—';
          }
          var date = new Date(value);
          return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN', { hour12: false });
        }

        function buildRows(upstreams, health) {
          var map = new Map();
          (Array.isArray(health) ? health : []).forEach(function (item) {
            if (item && item.url) {
              map.set(item.url, item);
            }
          });

          return (Array.isArray(upstreams) ? upstreams : []).map(function (url) {
            var item = map.get(url) || {};
            return {
              url: url,
              healthy: Boolean(item.healthy),
              latency: Number.isFinite(item.latency) ? item.latency : Number.POSITIVE_INFINITY,
              lastCheck: item.lastCheck || '',
              status: item.status || 0,
              error: item.error || ''
            };
          });
        }

        function applyFilter(resetPage) {
          var keyword = els.searchInput.value.trim().toLowerCase();
          state.filtered = state.upstreams.filter(function (item) {
            return !keyword || item.url.toLowerCase().indexOf(keyword) !== -1;
          });
          if (resetPage) {
            state.page = 1;
          }
          render();
        }

        function renderSidebar() {
          els.sidebarCount.textContent = String(state.filtered.length);
          if (state.filtered.length === 0) {
            els.sidebarList.innerHTML = '<div class="muted">暂无上游</div>';
            return;
          }

          els.sidebarList.innerHTML = state.filtered.map(function (item) {
            return '<button class="sidebar-item' + (item.url === state.activeUrl ? ' active' : '') + '" data-url="' + escapeHtml(item.url) + '" type="button">'
              + '<div class="sidebar-item-row">'
              + '<span class="dot ' + (item.healthy ? 'healthy' : '') + '"></span>'
              + '<span class="truncate">' + escapeHtml(item.url) + '</span>'
              + '</div>'
              + '<div class="sidebar-meta">' + escapeHtml(formatLatency(item.latency)) + '</div>'
              + '</button>';
          }).join('');
        }

        function renderTable() {
          var totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
          if (state.page > totalPages) {
            state.page = totalPages;
          }
          var start = (state.page - 1) * PAGE_SIZE;
          var pageRows = state.filtered.slice(start, start + PAGE_SIZE);

          els.pageInfo.textContent = '第 ' + state.page + ' / ' + totalPages + ' 页';
          els.prevPageBtn.disabled = state.page <= 1;
          els.nextPageBtn.disabled = state.page >= totalPages;
          els.emptyState.classList.toggle('hidden', pageRows.length > 0);

          if (pageRows.length === 0) {
            els.tableBody.innerHTML = '';
            return;
          }

          els.tableBody.innerHTML = pageRows.map(function (item) {
            var badgeClass = item.healthy ? 'healthy' : 'unhealthy';
            var badgeText = item.healthy ? '● 健康' : '● 不健康';
            var hint = item.error ? ' title="' + escapeHtml(item.error) + '"' : '';
            return '<tr id="row-' + encodeURIComponent(item.url) + '"' + (item.url === state.activeUrl ? ' class="highlight"' : '') + hint + '>'
              + '<td><div class="truncate" style="max-width: 420px;">' + escapeHtml(item.url) + '</div></td>'
              + '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>'
              + '<td>' + escapeHtml(formatLatency(item.latency)) + '</td>'
              + '<td>' + escapeHtml(formatTime(item.lastCheck)) + '</td>'
              + '<td class="text-right"><button class="danger" data-delete-url="' + escapeHtml(item.url) + '" type="button">删除</button></td>'
              + '</tr>';
          }).join('');
        }

        function render() {
          renderSidebar();
          renderTable();
        }

        async function apiFetch(path, options) {
          var response = await fetch(path, Object.assign({}, options || {}, {
            headers: Object.assign({}, (options && options.headers) || {}, {
              'X-Admin-Token': state.token,
              'content-type': 'application/json'
            })
          }));

          if (response.status === 401) {
            logout('Token 无效，请重新登录。');
            throw new Error('Unauthorized');
          }

          var data = await response.json().catch(function () {
            return {};
          });

          if (!response.ok) {
            throw new Error(data.error || 'Request failed');
          }

          return data;
        }

        async function loadStatus() {
          var data = await apiFetch('/_admin/status', { method: 'GET', headers: {} });
          state.upstreams = buildRows(data.upstreams, data.health);
          applyFilter(true);
        }

        async function saveUpstreams(nextUpstreams) {
          var payload = { upstreams: nextUpstreams };
          await apiFetch('/_admin/upstreams', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          await loadStatus();
        }

        async function login(token) {
          state.token = token.trim();
          sessionStorage.setItem(STORAGE_KEY, state.token);
          await loadStatus();
          els.loginError.textContent = '';
          setView(true);
        }

        function logout(message) {
          state.token = '';
          state.upstreams = [];
          state.filtered = [];
          state.page = 1;
          state.activeUrl = '';
          sessionStorage.removeItem(STORAGE_KEY);
          els.loginError.textContent = message || '';
          render();
          setView(false);
        }

        function openModal() {
          els.modal.classList.remove('hidden');
          els.upstreamInput.value = '';
          els.modalError.textContent = '';
          setTimeout(function () {
            els.upstreamInput.focus();
          }, 0);
        }

        function closeModal() {
          els.modal.classList.add('hidden');
        }

        function scrollToRow(url) {
          state.activeUrl = url;
          render();
          var row = document.getElementById('row-' + encodeURIComponent(url));
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }

        els.loginForm.addEventListener('submit', async function (event) {
          event.preventDefault();
          var token = els.tokenInput.value.trim();
          if (!token) {
            els.loginError.textContent = '请输入 Token。';
            return;
          }
          els.loginError.textContent = '登录中...';
          try {
            await login(token);
          } catch (error) {
            els.loginError.textContent = '登录失败：' + error.message;
            sessionStorage.removeItem(STORAGE_KEY);
          }
        });

        els.logoutBtn.addEventListener('click', function () {
          logout('已退出登录。');
        });

        els.searchInput.addEventListener('input', function () {
          applyFilter(true);
        });

        els.refreshBtn.addEventListener('click', async function () {
          try {
            await loadStatus();
          } catch (error) {
            window.alert('刷新失败：' + error.message);
          }
        });

        els.addBtn.addEventListener('click', openModal);
        els.closeModalBtn.addEventListener('click', closeModal);
        els.modal.addEventListener('click', function (event) {
          if (event.target === els.modal) {
            closeModal();
          }
        });

        els.modalForm.addEventListener('submit', async function (event) {
          event.preventDefault();
          var nextUrl = els.upstreamInput.value.trim();
          if (!nextUrl) {
            els.modalError.textContent = '请输入 URL。';
            return;
          }
          try {
            new URL(nextUrl);
          } catch {
            els.modalError.textContent = 'URL 格式不正确。';
            return;
          }
          if (state.upstreams.some(function (item) { return item.url === nextUrl; })) {
            els.modalError.textContent = '该上游已存在。';
            return;
          }
          els.modalError.textContent = '保存中...';
          try {
            var urls = state.upstreams.map(function (item) { return item.url; });
            urls.push(nextUrl);
            await saveUpstreams(urls);
            closeModal();
          } catch (error) {
            els.modalError.textContent = '保存失败：' + error.message;
          }
        });

        els.sidebarList.addEventListener('click', function (event) {
          var button = event.target.closest('[data-url]');
          if (!button) {
            return;
          }
          scrollToRow(button.getAttribute('data-url'));
        });

        els.tableBody.addEventListener('click', async function (event) {
          var button = event.target.closest('[data-delete-url]');
          if (!button) {
            return;
          }
          var url = button.getAttribute('data-delete-url');
          if (!window.confirm('确定删除上游 ' + url + ' 吗？')) {
            return;
          }
          try {
            var urls = state.upstreams
              .map(function (item) { return item.url; })
              .filter(function (item) { return item !== url; });
            if (urls.length === 0) {
              window.alert('至少保留一个上游；当前 API 不接受空列表。');
              return;
            }
            await saveUpstreams(urls);
            if (state.activeUrl === url) {
              state.activeUrl = '';
            }
          } catch (error) {
            window.alert('删除失败：' + error.message);
          }
        });

        els.prevPageBtn.addEventListener('click', function () {
          if (state.page > 1) {
            state.page -= 1;
            render();
          }
        });

        els.nextPageBtn.addEventListener('click', function () {
          var totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
          if (state.page < totalPages) {
            state.page += 1;
            render();
          }
        });

        if (state.token) {
          login(state.token).catch(function () {
            logout('登录已过期，请重新输入 Token。');
          });
        } else {
          setView(false);
        }
      })();
    </script>
  </body>
</html>`;
}
