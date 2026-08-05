/* ============================================
   选择困难终结者 · 基础款
   功能：抛硬币、是/否、二选一
   ============================================ */

(function () {
    'use strict';

    // ==================== 抛硬币 ====================
    const coin = document.getElementById('coin');
    const coinResult = document.getElementById('coin-result');
    const btnFlipCoin = document.getElementById('btn-flip-coin');

    let coinFlipping = false;

    btnFlipCoin.addEventListener('click', () => {
        if (coinFlipping) return;
        coinFlipping = true;
        btnFlipCoin.disabled = true;
        coinResult.textContent = '抛掷中...';

        // 随机决定结果
        const isHeads = Math.random() < 0.5;
        const resultText = isHeads ? '正面 🪙' : '反面 ✨';

        // 重置动画
        coin.classList.remove('flipping', 'heads', 'tails');

        // 设置最终状态
        void coin.offsetWidth; // 强制回流

        if (isHeads) {
            coin.classList.add('flipping', 'heads');
        } else {
            coin.classList.add('flipping', 'tails');
        }

        // 动画结束后显示结果
        setTimeout(() => {
            coin.classList.remove('flipping');
            coinResult.innerHTML = `<strong>${resultText}</strong>`;
            btnFlipCoin.disabled = false;
            coinFlipping = false;

            window.DecisionApp.addHistory({
                mode: '基础款',
                sub: '抛硬币',
                options: '正面 / 反面',
                result: resultText
            });
        }, 1600);
    });

    // ==================== 是/否 ====================
    const yesnoQuestion = document.getElementById('yesno-question');
    const yesnoDisplay = document.getElementById('yesno-display');
    const yesnoIcon = yesnoDisplay.querySelector('.yesno-icon');
    const yesnoResult = document.getElementById('yesno-result');
    const btnYesno = document.getElementById('btn-yesno');

    let yesnoRolling = false;

    const YESNO_ANSWERS = [
        { text: '是！', icon: '✅', type: 'yes' },
        { text: '否！', icon: '❌', type: 'no' },
        { text: '当然是的！', icon: '👍', type: 'yes' },
        { text: '不太行...', icon: '👎', type: 'no' },
        { text: '必须的！', icon: '💯', type: 'yes' },
        { text: '算了吧', icon: '🙅', type: 'no' },
        { text: 'YES！', icon: '🌟', type: 'yes' },
        { text: 'NO...', icon: '💔', type: 'no' },
    ];

    btnYesno.addEventListener('click', () => {
        if (yesnoRolling) return;
        yesnoRolling = true;
        btnYesno.disabled = true;

        const question = yesnoQuestion.value.trim() || '你心中的问题';
        yesnoResult.textContent = '命运正在转动...';
        yesnoDisplay.classList.remove('result-yes', 'result-no');

        // 动画
        yesnoDisplay.classList.add('rolling');
        yesnoIcon.textContent = '🤔';

        const rollInterval = setInterval(() => {
            const icons = ['✅', '❌', '👍', '👎', '💯', '🙅', '🌟', '💔'];
            yesnoIcon.textContent = icons[Math.floor(Math.random() * icons.length)];
        }, 80);

        setTimeout(() => {
            clearInterval(rollInterval);

            const answer = YESNO_ANSWERS[Math.floor(Math.random() * YESNO_ANSWERS.length)];
            yesnoIcon.textContent = answer.icon;
            yesnoDisplay.classList.add(answer.type === 'yes' ? 'result-yes' : 'result-no');
            yesnoDisplay.classList.remove('rolling');
            yesnoResult.innerHTML = `<strong>「${question}」→ ${answer.text}</strong>`;
            btnYesno.disabled = false;
            yesnoRolling = false;

            window.DecisionApp.addHistory({
                mode: '基础款',
                sub: '是/否',
                options: question,
                result: answer.text
            });
        }, 2000);
    });

    // ==================== 二选一 ====================
    const picktwoA = document.getElementById('picktwo-a');
    const picktwoB = document.getElementById('picktwo-b');
    const picktwoDisplay = document.getElementById('picktwo-display');
    const picktwoIcon = picktwoDisplay.querySelector('.picktwo-icon');
    const picktwoResult = document.getElementById('picktwo-result');
    const btnPicktwo = document.getElementById('btn-picktwo');

    let picktwoPicking = false;

    btnPicktwo.addEventListener('click', () => {
        if (picktwoPicking) return;

        const optA = picktwoA.value.trim();
        const optB = picktwoB.value.trim();

        if (!optA || !optB) {
            picktwoResult.innerHTML = '<span style="color:#ef4444">请先填写两个选项！</span>';
            return;
        }

        picktwoPicking = true;
        btnPicktwo.disabled = true;
        picktwoResult.textContent = '筛选中...';
        picktwoDisplay.classList.add('picking');

        // 快速闪烁
        const flashInterval = setInterval(() => {
            picktwoIcon.textContent = Math.random() < 0.5 ? optA : optB;
        }, 80);

        setTimeout(() => {
            clearInterval(flashInterval);
            picktwoDisplay.classList.remove('picking');

            const picked = Math.random() < 0.5 ? optA : optB;
            picktwoIcon.textContent = picked;
            picktwoResult.innerHTML = `<strong>就选它了：${picked} 🎉</strong>`;
            btnPicktwo.disabled = false;
            picktwoPicking = false;

            window.DecisionApp.addHistory({
                mode: '基础款',
                sub: '二选一',
                options: `${optA} vs ${optB}`,
                result: picked
            });
        }, 1500);
    });

})();
