class BattleTeam {
    constructor(game) {
        this.game = game;
    }

    prepareBattle() {
        console.log('开始执行 prepareBattle 方法');
        try {
            // 检查是否有出战精灵
            if (this.game.player.battleTeam.length === 0) {
                console.log('没有出战精灵');
                if (this.game.player.ownedSpirits.length > 0) {
                    console.log('自动选择前3个精灵');
                    // 如果没有出战精灵但有拥有的精灵，自动选择前3个
                    this.game.player.battleTeam = this.game.player.ownedSpirits.slice(0, 3);
                    console.log('自动选择完成，出战精灵数量：', this.game.player.battleTeam.length);
                } else {
                    console.log('没有可出战的精灵');
                    this.game.uiManager.showToast('没有可出战的精灵！', 'error');
                    return;
                }
            } else {
                console.log('已有出战精灵，数量：', this.game.player.battleTeam.length);
            }
            
            console.log('准备开始战斗');
            // 直接开始战斗，不再显示选择界面
            this.game.battleSystem.startBattle();
            console.log('startBattle 方法已调用');
        } catch (error) {
            console.error('战斗准备失败：', error);
            this.game.uiManager.showToast('战斗准备失败：' + error.message, 'error');
        }
    }

    showTeamSelect() {
        const grid = this.game.uiManager.elements.teamSelectGrid;
        grid.innerHTML = '';
        const selectedIds = new Set(this.game.player.battleTeam.map(s => s.id));

        this.game.player.ownedSpirits.forEach(spirit => {
            const card = document.createElement('div');
            card.className = 'spirit-card';
            card.dataset.element = spirit.element;
            card.dataset.spiritId = spirit.id;

            const element = ELEMENTS[spirit.element];
            const inTeam = selectedIds.has(spirit.id);
            const position = inTeam ? this.game.player.battleTeam.findIndex(s => s.id === spirit.id) + 1 : 0;

            if (inTeam) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="spirit-icon">${spirit.icon}</div>
                <div class="spirit-name">${spirit.name}</div>
                <div class="spirit-element">${element.name} ${element.icon}</div>
                <div class="spirit-level">Lv.${spirit.level}</div>
                <div class="spirit-stats">
                    <span>攻: ${spirit.atk}</span>
                    <span>防: ${spirit.def}</span>
                </div>
                ${position > 0 ? `<div class="team-position">${position}</div>` : ''}
            `;

            card.addEventListener('click', () => this.toggleTeamSelection(spirit, card));
            grid.appendChild(card);
        });

        this.updateTeamSelectCount();
        this.game.uiManager.showScreen('teamSelect');
    }

    showTeamSelectScreen() {
        const grid = this.game.uiManager.elements.teamSelectGrid;
        grid.innerHTML = '';
        const selectedIds = new Set(this.game.player.battleTeam.map(s => s.id));

        this.game.player.ownedSpirits.forEach(spirit => {
            const card = this.game.spiritManager.createSpiritCard(spirit, true);
            if (selectedIds.has(spirit.id)) {
                card.classList.add('selected');
            }

            card.addEventListener('click', () => this.toggleTeamSelection(spirit, card));
            grid.appendChild(card);
        });

        this.updateTeamSelectCount();
        this.game.uiManager.showScreen('teamSelect');
    }

    toggleTeamSelection(spirit, card) {
        const selectedIds = new Set(this.game.player.battleTeam.map(s => s.id));

        if (selectedIds.has(spirit.id)) {
            // 取消选择 - 允许取消任意位置的精灵，包括第一个
            if (this.game.player.battleTeam.length >= 1) {
                this.game.player.battleTeam = this.game.player.battleTeam.filter(s => s.id !== spirit.id);
                this.refreshTeamSelectScreen();
            }
        } else {
            if (this.game.player.battleTeam.length < 3) {
                this.game.player.battleTeam.push(spirit);
                this.refreshTeamSelectScreen();
            }
        }

        this.updateTeamSelectCount();
    }

    refreshTeamSelectScreen() {
        const grid = this.game.uiManager.elements.teamSelectGrid;
        const cards = grid.querySelectorAll('.spirit-card');
        
        cards.forEach(card => {
            const spiritId = parseInt(card.dataset.spiritId);
            const position = this.game.player.battleTeam.findIndex(s => s.id === spiritId);
            
            // 移除旧的选中状态和位置标记
            card.classList.remove('selected');
            const oldBadge = card.querySelector('.team-position');
            if (oldBadge) oldBadge.remove();
            
            // 如果精灵在出战队伍中，添加选中状态和新的位置标记
            if (position !== -1) {
                card.classList.add('selected');
                const positionBadge = document.createElement('div');
                positionBadge.className = 'team-position';
                positionBadge.textContent = position + 1;
                card.appendChild(positionBadge);
            }
        });
    }

    updateTeamSelectCount() {
        this.game.uiManager.elements.teamSelectCount.textContent = `${this.game.player.battleTeam.length}/3`;
        this.game.uiManager.elements.confirmTeamBtn.disabled = this.game.player.battleTeam.length === 0;
    }

    confirmTeamSelection() {
        this.game.uiManager.showScreen('main');
    }
}

window.BattleTeam = BattleTeam;