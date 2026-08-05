/* ============================================
   选择困难终结者 · 趣味款
   功能：数花瓣（他爱我…他不爱我…）
   ============================================ */

(function () {
    'use strict';

    // ==================== 数花瓣 ====================
    const petalsA = document.getElementById('petals-a');
    const petalsB = document.getElementById('petals-b');
    const flowerCenter = document.querySelector('.flower-center');
    const petalTrail = document.getElementById('petal-trail');
    const petalsResult = document.getElementById('petals-result');
    const btnPetals = document.getElementById('btn-petals');

    let petalsCounting = false;

    // 花瓣emoji颜色集合
    const PETALS = ['🌸', '🌺', '💮', '🏵️', '🌷', '🌼', '💐', '🌻', '✿', '❀'];

    btnPetals.addEventListener('click', () => {
        if (petalsCounting) return;

        const optA = petalsA.value.trim() || '他爱我';
        const optB = petalsB.value.trim() || '他不爱我';

        if (!optA || !optB) {
            petalsResult.innerHTML = '<span style="color:#ef4444">请填写你的小纠结！</span>';
            return;
        }

        petalsCounting = true;
        btnPetals.disabled = true;
        petalTrail.innerHTML = '';
        petalsResult.textContent = '数花瓣中...';

        // 随机花瓣数量（7~21片，奇数偶数决定结果）
        const totalPetals = Math.floor(Math.random() * 8) + 9; // 9~16 片
        const result = totalPetals % 2 === 1 ? optA : optB;

        let count = 0;
        const interval = setInterval(() => {
            count++;

            // 花朵旋转
            flowerCenter.classList.remove('spinning');
            void flowerCenter.offsetWidth;
            flowerCenter.classList.add('spinning');

            // 掉一片花瓣
            const petalEl = document.createElement('span');
            petalEl.className = 'petal';
            petalEl.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
            petalTrail.appendChild(petalEl);

            // 更新计数文字
            petalsResult.textContent = `第 ${count} 片花瓣...「${count % 2 === 1 ? optA : optB}」`;

            if (count >= totalPetals) {
                clearInterval(interval);

                setTimeout(() => {
                    petalsResult.innerHTML = `<strong>🌸 最后一片花瓣落下，结果是：${result} ！</strong>`;
                    btnPetals.disabled = false;
                    petalsCounting = false;

                    window.DecisionApp.addHistory({
                        mode: '趣味款',
                        sub: '数花瓣',
                        options: `${optA} / ${optB}`,
                        result: result
                    });
                }, 500);
            }
        }, 500);
    });

})();
