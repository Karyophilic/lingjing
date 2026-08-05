/* ============================================
   选择困难终结者 · 主逻辑
   负责：模式切换、子Tab切换、历史记录
   ============================================ */

(function () {
    'use strict';

    // --- 模式 Tab 切换 ---
    const modeTabs = document.querySelectorAll('.mode-tab');
    const modePanels = document.querySelectorAll('.mode-panel');

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;

            // 更新 Tab 状态
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 更新面板
            modePanels.forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${mode}`).classList.add('active');

            // 重置当前模式下的子 Tab 为第一个
            const panel = document.getElementById(`panel-${mode}`);
            const firstSubTab = panel.querySelector('.sub-tab');
            if (firstSubTab) firstSubTab.click();
        });
    });

    // --- 子 Tab 切换（通用） ---
    document.querySelectorAll('.sub-tab').forEach(subTab => {
        subTab.addEventListener('click', () => {
            const sub = subTab.dataset.sub;
            const parentPanel = subTab.closest('.mode-panel');

            // 更新子 Tab
            parentPanel.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            subTab.classList.add('active');

            // 更新子面板
            parentPanel.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`sub-${sub}`).classList.add('active');
        });
    });

    // --- 历史记录 ---
    const history = loadHistory();
    const historyList = document.getElementById('history-list');
    const historyPanel = document.getElementById('history-panel');
    const btnToggleHistory = document.getElementById('btn-toggle-history');
    const btnCloseHistory = document.getElementById('btn-close-history');
    const btnClearHistory = document.getElementById('btn-clear-history');

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    function openHistory() {
        historyPanel.classList.add('open');
        overlay.classList.add('show');
    }

    function closeHistory() {
        historyPanel.classList.remove('open');
        overlay.classList.remove('show');
    }

    btnToggleHistory.addEventListener('click', openHistory);
    btnCloseHistory.addEventListener('click', closeHistory);
    overlay.addEventListener('click', closeHistory);

    btnClearHistory.addEventListener('click', () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            localStorage.removeItem('decision_history');
            history.length = 0;
            renderHistory();
        }
    });

    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('decision_history')) || [];
        } catch {
            return [];
        }
    }

    function saveHistory() {
        localStorage.setItem('decision_history', JSON.stringify(history));
    }

    function addHistory(entry) {
        history.unshift({
            mode: entry.mode,
            sub: entry.sub,
            options: entry.options,
            result: entry.result,
            time: new Date().toLocaleString('zh-CN')
        });
        // 最多保留 50 条
        if (history.length > 50) history.length = 50;
        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">暂无记录，快去做个决定吧！</p>';
            return;
        }
        historyList.innerHTML = history.map(h => `
            <div class="history-item">
                <div class="mode">${h.mode} · ${h.sub}</div>
                <div>选项：${h.options}</div>
                <div>结果：<span class="result-highlight">${h.result}</span></div>
                <div class="time">${h.time}</div>
            </div>
        `).join('');
    }

    // 初始渲染
    renderHistory();

    // 暴露到全局
    window.DecisionApp = {
        addHistory,
        openHistory,
        closeHistory
    };

    // --- 键盘快捷键 ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeHistory();
        }
    });

})();
