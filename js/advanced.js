/* ============================================
   选择困难终结者 · 进阶款
   功能：幸运转盘、抽签筒、抓阄
   ============================================ */

(function () {
    'use strict';

    // ==================== 幸运转盘 ====================
    const wheelCanvas = document.getElementById('wheel-canvas');
    const wheelCtx = wheelCanvas.getContext('2d');
    const wheelOptions = document.getElementById('wheel-options');
    const wheelResult = document.getElementById('wheel-result');
    const btnWheel = document.getElementById('btn-wheel');

    const CENTER_X = wheelCanvas.width / 2;
    const CENTER_Y = wheelCanvas.height / 2;
    const RADIUS = 140;

    // 预设颜色
    const SEGMENT_COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
        '#F1948A', '#AED6F1', '#D7BDE2', '#A3E4D7'
    ];

    let wheelAngle = 0;
    let wheelSpinning = false;

    // 默认画出占位转盘
    drawWheel(['?', '?', '?', '?', '?', '?'], wheelAngle);

    function parseOptions(textarea) {
        const raw = textarea.value.trim();
        if (!raw) return [];
        // 先按换行分，再按逗号分
        return raw.split(/[\n,，]/).map(s => s.trim()).filter(Boolean);
    }

    function drawWheel(segments, currentAngle) {
        wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        const len = segments.length;
        if (len === 0) {
            // 画空转盘
            wheelCtx.beginPath();
            wheelCtx.arc(CENTER_X, CENTER_Y, RADIUS, 0, Math.PI * 2);
            wheelCtx.fillStyle = '#e2e8f0';
            wheelCtx.fill();
            wheelCtx.strokeStyle = '#cbd5e1';
            wheelCtx.lineWidth = 3;
            wheelCtx.stroke();
            wheelCtx.fillStyle = '#94a3b8';
            wheelCtx.font = 'bold 16px "PingFang SC", "Microsoft YaHei", sans-serif';
            wheelCtx.textAlign = 'center';
            wheelCtx.fillText('请输入选项', CENTER_X, CENTER_Y);
            return;
        }

        const anglePerSegment = (2 * Math.PI) / len;

        for (let i = 0; i < len; i++) {
            const startAngle = currentAngle + i * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;
            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

            // 画扇形
            wheelCtx.beginPath();
            wheelCtx.moveTo(CENTER_X, CENTER_Y);
            wheelCtx.arc(CENTER_X, CENTER_Y, RADIUS, startAngle, endAngle);
            wheelCtx.closePath();
            wheelCtx.fillStyle = color;
            wheelCtx.fill();
            wheelCtx.strokeStyle = '#fff';
            wheelCtx.lineWidth = 2;
            wheelCtx.stroke();

            // 画文字
            wheelCtx.save();
            wheelCtx.translate(CENTER_X, CENTER_Y);
            wheelCtx.rotate(startAngle + anglePerSegment / 2);
            wheelCtx.textAlign = 'center';
            wheelCtx.fillStyle = '#1e293b';
            wheelCtx.font = 'bold 14px "PingFang SC", "Microsoft YaHei", sans-serif';

            // 截断过长文字
            let text = segments[i];
            if (text.length > 6) text = text.slice(0, 5) + '..';
            wheelCtx.fillText(text, RADIUS * 0.6, 6);
            wheelCtx.restore();
        }

        // 圆心
        wheelCtx.beginPath();
        wheelCtx.arc(CENTER_X, CENTER_Y, 20, 0, Math.PI * 2);
        wheelCtx.fillStyle = '#fff';
        wheelCtx.fill();
        wheelCtx.strokeStyle = '#e2e8f0';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
    }

    btnWheel.addEventListener('click', () => {
        if (wheelSpinning) return;

        const segments = parseOptions(wheelOptions);
        if (segments.length < 2) {
            wheelResult.innerHTML = '<span style="color:#ef4444">请至少输入 2 个选项！</span>';
            return;
        }

        wheelSpinning = true;
        btnWheel.disabled = true;

        // 随机决定停在哪个扇区
        const pickedIndex = Math.floor(Math.random() * segments.length);
        const anglePerSegment = (2 * Math.PI) / segments.length;

        // 计算需要旋转的角度：多转几圈 + 停在选中扇区
        // 指针在顶部（-π/2位置），需要计算让 pickedIndex 扇区中间对准顶部
        const targetAngle = -(Math.PI / 2); // 顶部
        const segmentCenter = pickedIndex * anglePerSegment + anglePerSegment / 2;
        const spinAngle = (2 * Math.PI * 5) + (2 * Math.PI - segmentCenter); // 顺时针多转5圈

        // 动画
        const startAngle = wheelAngle;
        const duration = 4000;
        const startTime = performance.now();

        function animateWheel(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // ease-out
            const eased = 1 - Math.pow(1 - progress, 4);
            wheelAngle = startAngle + spinAngle * eased;
            drawWheel(segments, wheelAngle);

            if (progress < 1) {
                requestAnimationFrame(animateWheel);
            } else {
                // 结束
                const result = segments[pickedIndex];
                wheelResult.innerHTML = `<strong>🎉 恭喜：${result} ！</strong>`;
                btnWheel.disabled = false;
                wheelSpinning = false;

                window.DecisionApp.addHistory({
                    mode: '进阶款',
                    sub: '幸运转盘',
                    options: segments.join('、'),
                    result: result
                });
            }
        }

        requestAnimationFrame(animateWheel);
    });

    // 输入变化时更新转盘预览
    wheelOptions.addEventListener('input', () => {
        if (wheelSpinning) return;
        const segments = parseOptions(wheelOptions);
        drawWheel(segments.length > 0 ? segments : ['?', '?', '?', '?', '?', '?'], wheelAngle);
    });

    // ==================== 抽签筒 ====================
    const sticksOptions = document.getElementById('sticks-options');
    const sticksContainer = document.getElementById('sticks-container');
    const sticksResult = document.getElementById('sticks-result');
    const btnSticks = document.getElementById('btn-sticks');

    let sticksPicking = false;

    function renderSticks(segments) {
        sticksContainer.innerHTML = '';
        sticksContainer.classList.remove('shaking');

        segments.forEach((text, i) => {
            const stick = document.createElement('div');
            stick.className = 'stick';
            stick.title = text;
            stick.dataset.index = i;
            stick.dataset.text = text;
            sticksContainer.appendChild(stick);
        });
    }

    sticksOptions.addEventListener('input', () => {
        if (sticksPicking) return;
        const segments = parseOptions(sticksOptions);
        if (segments.length > 0) {
            renderSticks(segments);
        }
    });

    btnSticks.addEventListener('click', () => {
        if (sticksPicking) return;

        const segments = parseOptions(sticksOptions);
        if (segments.length < 2) {
            sticksResult.innerHTML = '<span style="color:#ef4444">请至少输入 2 个签文！</span>';
            return;
        }

        sticksPicking = true;
        btnSticks.disabled = true;

        renderSticks(segments);

        // 摇晃动画
        setTimeout(() => {
            sticksContainer.classList.add('shaking');
        }, 100);

        setTimeout(() => {
            sticksContainer.classList.remove('shaking');

            // 随机选一根
            const pickedIndex = Math.floor(Math.random() * segments.length);
            const sticks = sticksContainer.querySelectorAll('.stick');

            sticks.forEach((s, i) => {
                if (i === pickedIndex) {
                    s.classList.add('picked');
                }
            });

            const result = segments[pickedIndex];
            sticksResult.innerHTML = `<strong>🎋 抽中了：${result}</strong>`;
            btnSticks.disabled = false;
            sticksPicking = false;

            window.DecisionApp.addHistory({
                mode: '进阶款',
                sub: '抽签筒',
                options: segments.join('、'),
                result: result
            });
        }, 2000);
    });

    // ==================== 抓阄 ====================
    const lotsOptions = document.getElementById('lots-options');
    const lotsBox = document.getElementById('lots-box');
    const lotsResult = document.getElementById('lots-result');
    const btnLots = document.getElementById('btn-lots');

    let lotsPicking = false;

    function renderLots(segments) {
        lotsBox.innerHTML = '';
        segments.forEach((text, i) => {
            const lot = document.createElement('div');
            lot.className = 'lot-paper';
            lot.textContent = text;
            lot.dataset.index = i;
            lot.dataset.text = text;
            lotsBox.appendChild(lot);
        });
    }

    lotsOptions.addEventListener('input', () => {
        if (lotsPicking) return;
        const segments = parseOptions(lotsOptions);
        if (segments.length > 0) {
            renderLots(segments);
        }
    });

    btnLots.addEventListener('click', () => {
        if (lotsPicking) return;

        const segments = parseOptions(lotsOptions);
        if (segments.length < 2) {
            lotsResult.innerHTML = '<span style="color:#ef4444">请至少输入 2 个选项！</span>';
            return;
        }

        lotsPicking = true;
        btnLots.disabled = true;

        renderLots(segments);

        // 打乱动画
        const papers = lotsBox.querySelectorAll('.lot-paper');
        papers.forEach(p => p.classList.add('shuffling'));

        setTimeout(() => {
            papers.forEach(p => p.classList.remove('shuffling'));

            // 随机抽一个
            const pickedIndex = Math.floor(Math.random() * segments.length);
            papers.forEach((p, i) => {
                if (i === pickedIndex) {
                    p.classList.add('picked');
                }
            });

            const result = segments[pickedIndex];
            lotsResult.innerHTML = `<strong>📦 抓到了：${result} ！</strong>`;
            btnLots.disabled = false;
            lotsPicking = false;

            window.DecisionApp.addHistory({
                mode: '进阶款',
                sub: '抓阄',
                options: segments.join('、'),
                result: result
            });
        }, 2000);
    });

})();
