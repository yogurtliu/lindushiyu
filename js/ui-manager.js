class UIManager {
    constructor(game) {
        this.game = game;
        this.screens = {};
        this.elements = {};
    }
    
    initElements() {
        this.screens = {
            title: document.getElementById('title-screen'),
            selection: document.getElementById('selection-screen'),
            main: document.getElementById('main-screen'),
            battle: document.getElementById('battle-screen'),
            result: document.getElementById('result-screen'),
            records: document.getElementById('records-screen'),
            teamSelect: document.getElementById('team-select-screen'),
            shop: document.getElementById('shop-screen'),
            saveSlot: document.getElementById('save-slot-screen'),
            loadSlot: document.getElementById('load-slot-screen')
        };
        
        this.elements = {
            selectedCount: document.getElementById('selected-count'),
            spiritGrid: document.getElementById('spirit-grid'),
            confirmSelection: document.getElementById('confirm-selection-btn'),
            playerGold: document.getElementById('player-gold'),
            playerWins: document.getElementById('player-wins'),
            playerLosses: document.getElementById('player-losses'),
            playerLevel: document.getElementById('player-level'),
            gameId: document.getElementById('game-id'),
            gameDuration: document.getElementById('game-duration'),
            randomSeed: document.getElementById('random-seed'),
            myTeam: document.getElementById('my-team'),
            enemyTeam: document.getElementById('enemy-team'),
            battleMyTeam: document.getElementById('battle-my-team'),
            battleRound: document.getElementById('battle-round'),
            battleLog: document.getElementById('battle-log'),
            resultTitle: document.getElementById('result-title'),
            resultDetails: document.getElementById('result-details'),
            recordsList: document.getElementById('records-list'),
            modal: document.getElementById('spirit-detail-modal'),
            modalContent: document.getElementById('spirit-detail-content'),
            fragmentInfo: document.getElementById('fragment-info'),
            ownedSpiritsList: document.getElementById('owned-spirits-list'),
            teamSelectGrid: document.getElementById('team-select-grid'),
            confirmTeamBtn: document.getElementById('confirm-team-btn'),
            teamSelectCount: document.getElementById('team-select-count'),
            inventoryList: document.getElementById('inventory-list'),
            equipmentList: document.getElementById('equipment-list'),
            shopGold: document.getElementById('shop-gold'),
            shopItems: document.getElementById('shop-items'),
            shopInventoryList: document.getElementById('shop-inventory-list'),
            itemSelectModal: document.getElementById('item-select-modal'),
            battleItemList: document.getElementById('battle-item-list'),
            skillSelectModal: document.getElementById('skill-select-modal'),
            battleSkillList: document.getElementById('battle-skill-list'),
            learnSkillModal: document.getElementById('learn-skill-modal'),
            skillChoices: document.getElementById('skill-choices'),
            upgradeSkillModal: document.getElementById('upgrade-skill-modal'),
            upgradeSkillChoices: document.getElementById('upgrade-skill-choices'),
            replaceSpiritModal: document.getElementById('replace-spirit-modal'),
            replaceSpiritContent: document.getElementById('replace-spirit-content'),
            saveSlots: document.getElementById('save-slots'),
            loadSlots: document.getElementById('load-slots'),
            confirmModal: document.getElementById('confirm-modal'),
            confirmTitle: document.getElementById('confirm-title'),
            confirmMessage: document.getElementById('confirm-message'),
            confirmYesBtn: document.getElementById('confirm-yes-btn'),
            confirmNoBtn: document.getElementById('confirm-no-btn')
        };
        
        // 确认框回调函数
        this.confirmCallback = null;
    }
    
    initEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.game.startNewGame());
        document.getElementById('load-game-btn').addEventListener('click', () => this.game.saveSystem.loadGame());
        document.getElementById('confirm-selection-btn').addEventListener('click', () => this.game.spiritManager.confirmInitialSelection());
        document.getElementById('view-rarity-btn').addEventListener('click', () => this.showRarityModal());
        document.getElementById('back-to-title-btn').addEventListener('click', () => this.showScreen('title'));
        document.getElementById('new-start-battle-btn').addEventListener('click', () => {
            try {
                this.game.battleSystem.prepareBattle();
            } catch (error) {
                alert('战斗开始失败：' + error.message);
                console.error('战斗开始失败：', error);
            }
        });
        document.getElementById('battle-team-btn').addEventListener('click', () => this.game.battleSystem.showTeamSelect());
        document.getElementById('shop-btn').addEventListener('click', () => this.game.battleSystem.showShop());
        document.getElementById('save-game-btn').addEventListener('click', () => this.game.saveSystem.saveGame());
        document.getElementById('view-records-btn').addEventListener('click', () => this.game.saveSystem.showRecords());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showScreen('title'));
        document.getElementById('attack-btn').addEventListener('click', () => this.game.battleSystem.selectAction('attack'));
        document.getElementById('defend-btn').addEventListener('click', () => this.game.battleSystem.selectAction('defend'));
        document.getElementById('skill-btn').addEventListener('click', () => this.game.battleSystem.showSkillSelect());
        document.getElementById('item-btn').addEventListener('click', () => this.game.battleSystem.showItemSelect());
        document.getElementById('replace-btn').addEventListener('click', () => this.game.battleSystem.ui.showSpiritReplaceModal(null));
        document.getElementById('auto-btn').addEventListener('click', () => this.game.battleSystem.toggleAutoBattle());
        document.getElementById('continue-btn').addEventListener('click', () => this.showScreen('main'));
        document.getElementById('records-back-btn').addEventListener('click', () => {
            if (this.game.player.ownedSpirits.length > 0) {
                this.showScreen('main');
            } else {
                this.showScreen('title');
            }
        });
        document.getElementById('shop-back-btn').addEventListener('click', () => this.showScreen('main'));
        document.getElementById('confirm-team-btn').addEventListener('click', () => this.game.battleSystem.confirmTeamSelection());
        document.getElementById('team-select-back-btn').addEventListener('click', () => this.showScreen('main'));
        document.getElementById('save-slot-back-btn').addEventListener('click', () => this.showScreen('main'));
        document.getElementById('load-slot-back-btn').addEventListener('click', () => this.showScreen('title'));
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        document.getElementById('close-rarity-modal').addEventListener('click', () => {
            document.getElementById('rarity-modal').classList.remove('active');
        });

        document.getElementById('close-spirit-detail-modal').addEventListener('click', () => {
            document.getElementById('spirit-detail-modal').classList.remove('active');
        });

        // 调试按钮事件
        document.getElementById('debug-btn').addEventListener('click', () => this.showDebugModal());
        document.getElementById('close-debug-modal').addEventListener('click', () => {
            document.getElementById('debug-modal').classList.remove('active');
        });
        document.getElementById('debug-add-spirit-btn').addEventListener('click', () => this.debugAddSpirit());
        document.getElementById('debug-level-up-btn').addEventListener('click', () => this.debugLevelUpAll());
        document.getElementById('debug-view-data-btn').addEventListener('click', () => this.debugViewGameData());
        document.getElementById('debug-add-gold-btn').addEventListener('click', () => this.debugAddGold());
        
        // 确认框按钮事件
        this.elements.confirmYesBtn.addEventListener('click', () => {
            this.elements.confirmModal.classList.remove('active');
            if (this.confirmCallback) {
                this.confirmCallback(true);
                this.confirmCallback = null;
            }
        });
        
        this.elements.confirmNoBtn.addEventListener('click', () => {
            this.elements.confirmModal.classList.remove('active');
            if (this.confirmCallback) {
                this.confirmCallback(false);
                this.confirmCallback = null;
            }
        });
    }
    
    showConfirm(title, message, callback) {
        this.elements.confirmTitle.textContent = title;
        this.elements.confirmMessage.textContent = message;
        this.confirmCallback = callback;
        this.elements.confirmModal.classList.add('active');
    }

    showRarityModal() {
        const modal = document.getElementById('rarity-modal');
        const content = document.getElementById('rarity-content');

        // 按稀有度分组精灵
        const rarityGroups = {
            legendary: { label: '传说', color: '#ff6b6b', icon: '👑', spirits: [] },
            epic: { label: '珍贵', color: '#9b59b6', icon: '💎', spirits: [] },
            rare: { label: '稀有', color: '#3498db', icon: '✨', spirits: [] },
            common: { label: '普通', color: '#95a5a6', icon: '📦', spirits: [] }
        };

        ALL_SPIRITS_WITH_RARITY.forEach(spirit => {
            if (rarityGroups[spirit.rarity]) {
                rarityGroups[spirit.rarity].spirits.push(spirit);
            }
        });

        const total = ALL_SPIRITS_WITH_RARITY.length;

        content.innerHTML = `
            <div class="rarity-stats">
                <div class="rarity-summary">
                    <p>本局游戏共有 <strong>${total}</strong> 只精灵</p>
                </div>
                <div class="rarity-detail-list">
                    ${Object.entries(rarityGroups).map(([key, data]) => {
                        const percentage = ((data.spirits.length / total) * 100).toFixed(1);
                        const spiritNames = data.spirits.map(s => s.name).join('、');
                        return `
                            <div class="rarity-detail-item" style="border-left-color: ${data.color}">
                                <div class="rarity-detail-header">
                                    <div class="rarity-icon">${data.icon}</div>
                                    <div class="rarity-info">
                                        <div class="rarity-name" style="color: ${data.color}">${data.label}</div>
                                        <div class="rarity-count">${data.spirits.length} 只 (${percentage}%)</div>
                                    </div>
                                </div>
                                ${data.spirits.length > 0 ? `
                                    <div class="rarity-spirits">
                                        <div class="rarity-spirits-label">包含精灵：</div>
                                        <div class="rarity-spirits-names">${spiritNames}</div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    showDebugModal() {
        const modal = document.getElementById('debug-modal');
        
        // 重置调试模态框的内容
        const content = modal.querySelector('.debug-content');
        content.innerHTML = `
            <button id="debug-add-spirit-btn" class="action-btn">增加一个精灵</button>
            <button id="debug-level-up-btn" class="action-btn">全体升级</button>
            <button id="debug-view-data-btn" class="action-btn">查看游戏数据</button>
            <button id="debug-add-gold-btn" class="action-btn">增加100金币</button>
        `;
        
        // 重新绑定事件监听器
        document.getElementById('debug-add-spirit-btn').addEventListener('click', () => this.debugAddSpirit());
        document.getElementById('debug-level-up-btn').addEventListener('click', () => this.debugLevelUpAll());
        document.getElementById('debug-view-data-btn').addEventListener('click', () => this.debugViewGameData());
        document.getElementById('debug-add-gold-btn').addEventListener('click', () => this.debugAddGold());
        
        modal.classList.add('active');
    }

    debugAddSpirit() {
        // 检查是否已有7个精灵
        if (this.game.player.ownedSpirits.length >= 7) {
            this.showToast('精灵数量已达上限（7个）！', 'warning');
            return;
        }

        // 获取已拥有的精灵ID
        const ownedIds = this.game.player.ownedSpirits.map(s => s.id);

        // 获取未拥有的精灵
        const availableSpirits = ALL_SPIRITS_WITH_RARITY.filter(s => !ownedIds.includes(s.id));

        if (availableSpirits.length === 0) {
            this.showToast('已获得所有精灵！', 'warning');
            return;
        }

        // 随机选择一个未拥有的精灵
        const randomSpirit = availableSpirits[Math.floor(Math.random() * availableSpirits.length)];

        // 创建精灵副本
        const newSpirit = createSpiritCopy(randomSpirit);
        calculateStats(newSpirit);
        newSpirit.currentHp = newSpirit.maxHp;
        newSpirit.currentMp = newSpirit.maxMp;

        // 添加到拥有的精灵列表
        this.game.player.ownedSpirits.push(newSpirit);

        // 如果出战队伍未满，添加到出战队伍
        if (this.game.player.battleTeam.length < 3) {
            this.game.player.battleTeam.push(newSpirit);
        }

        // 保存精灵初始数据
        this.game.dataManager.saveSpiritInitialData(newSpirit);

        this.updateMainScreen();
        this.showToast(`获得新精灵：${newSpirit.name}！`, 'success');
    }

    debugLevelUpAll() {
        if (this.game.player.ownedSpirits.length === 0) {
            this.showToast('没有精灵可以升级！', 'warning');
            return;
        }

        this.game.player.ownedSpirits.forEach(spirit => {
            const oldLevel = spirit.level;
            spirit.level += 1;
            calculateStats(spirit);
            
            // 计算装备加成
            const hpBonus = this.game.spiritManager.getEquipmentBonus(spirit, 'maxHp');
            const mpBonus = this.game.spiritManager.getEquipmentBonus(spirit, 'maxMp');
            
            // 恢复生命值和魔力值（包含装备加成）
            spirit.currentHp = spirit.maxHp + hpBonus;
            spirit.currentMp = spirit.maxMp + mpBonus;
            
            // 检查是否学习新技能
            this.game.battleSystem.checkSkillLearn(spirit, oldLevel);
            // 保存精灵升级记录
            this.game.dataManager.saveSpiritLevelUp(spirit, oldLevel);
        });

        this.updateMainScreen();
        this.showToast(`所有精灵升1级！`, 'success');
    }

    debugAddGold() {
        this.game.player.gold = (this.game.player.gold || 0) + 100;
        this.updateMainScreen();
        this.showToast(`增加100金币！当前金币: ${this.game.player.gold}`, 'success');
    }

    debugViewGameData() {
        console.log('开始查看游戏数据');
        const gameData = this.game.dataManager.getGameData();
        console.log('游戏数据:', gameData);
        
        let dataHtml = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>游戏数据查看器</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                        min-height: 100vh;
                        color: #fff;
                        padding: 20px;
                    }
                    .container {
                        max-width: 1400px;
                        margin: 0 auto;
                    }
                    h1 {
                        text-align: center;
                        color: #2ecc71;
                        margin-bottom: 30px;
                        font-size: 2.5em;
                    }
                    h2 {
                        color: #3498db;
                        margin-top: 30px;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 10px;
                    }
                    h3 {
                        color: #9b59b6;
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }
                    h4 {
                        color: #f39c12;
                        margin-top: 15px;
                        margin-bottom: 8px;
                        font-size: 1.1em;
                    }
                    .section {
                        background: rgba(52, 152, 219, 0.1);
                        border-radius: 15px;
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: bold;
                        color: #95a5a6;
                    }
                    .value {
                        color: #bdc3c7;
                    }
                    .value.highlight {
                        color: #2ecc71;
                        font-weight: bold;
                    }
                    .value.info {
                        color: #3498db;
                        font-family: monospace;
                    }
                    .value.warning {
                        color: #e74c3c;
                    }
                    .spirit-card {
                        background: rgba(155, 89, 182, 0.1);
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 15px;
                    }
                    .spirit-header {
                        font-size: 1.3em;
                        color: #f39c12;
                        margin-bottom: 10px;
                        border-bottom: 1px solid rgba(243, 156, 18, 0.3);
                        padding-bottom: 5px;
                    }
                    .record-item {
                        background: rgba(46, 204, 113, 0.05);
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 10px;
                        border-left: 3px solid #2ecc71;
                    }
                    .record-item.level-up {
                        border-left-color: #3498db;
                        background: rgba(52, 152, 219, 0.05);
                    }
                    .record-item.evolution {
                        border-left-color: #9b59b6;
                        background: rgba(155, 89, 182, 0.05);
                    }
                    .record-item.skill-learn {
                        border-left-color: #f39c12;
                        background: rgba(243, 156, 18, 0.05);
                    }
                    .record-time {
                        font-size: 0.85em;
                        color: #95a5a6;
                        margin-top: 5px;
                    }
                    .stat-changes {
                        margin: 8px 0;
                        padding: 8px;
                        background: rgba(76, 175, 80, 0.1);
                        border-radius: 6px;
                        font-size: 0.9em;
                    }
                    .stat-changes div {
                        margin: 3px 0;
                        color: #4CAF50;
                        font-weight: bold;
                    }
                    .no-data {
                        background: rgba(231, 76, 60, 0.1);
                        color: #e74c3c;
                        text-align: center;
                        padding: 30px;
                        border-radius: 15px;
                        font-size: 1.2em;
                    }
                    .close-btn {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    .close-btn:hover {
                        background: #c0392b;
                    }
                    .refresh-btn {
                        position: fixed;
                        top: 20px;
                        right: 120px;
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    .refresh-btn:hover {
                        background: #2980b9;
                    }
                    .grid-2 {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    @media (max-width: 768px) {
                        .grid-2 {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
            </head>
            <body>
                <button class="refresh-btn" onclick="window.opener.game.uiManager.debugViewGameData(); window.close()">刷新数据</button>
                <button class="close-btn" onclick="window.close()">关闭窗口</button>
                <div class="container">
                    <h1>🎮 游戏数据查看器</h1>
                    
                    <h2>📋 游戏基本信息</h2>
                    <div class="section">
                        <div class="row">
                            <span class="label">游戏ID:</span>
                            <span class="value info">${gameData ? gameData.gameId : '无'}</span>
                        </div>
                        <div class="row">
                            <span class="label">创建时间:</span>
                            <span class="value">${gameData ? new Date(gameData.createdAt).toLocaleString() : '无'}</span>
                        </div>
                        <div class="row">
                            <span class="label">游戏时长:</span>
                            <span class="value">${gameData ? this.getGameDuration(gameData.createdAt) : '无'}</span>
                        </div>
                    </div>
        `;
        
        if (!gameData) {
            dataHtml += `
                <div class="no-data">
                    <h2>⚠️ 没有游戏数据</h2>
                    <p>请先开始新游戏以创建游戏数据</p>
                </div>
            `;
        } else {
            dataHtml += `
                <h2>🎲 初始数据</h2>
                <div class="section">
                    <div class="row">
                        <span class="label">随机元素种子:</span>
                        <span class="value info">${gameData.initialData.randomElements.seed}</span>
                    </div>
                    <div class="row">
                        <span class="label">种子时间戳:</span>
                        <span class="value">${new Date(gameData.initialData.randomElements.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="row">
                        <span class="label">初始精灵数量:</span>
                        <span class="value highlight">${gameData.initialData.spirits.length} 只</span>
                    </div>
                </div>
                
                <h2>📊 当前持有精灵 (${Object.keys(gameData.spiritRecords).length} 只)</h2>
            `;

            // 当前持有精灵的记录
            const currentSpiritIds = Object.keys(gameData.spiritRecords);
            if (currentSpiritIds.length === 0) {
                dataHtml += `
                    <div class="section">
                        <div class="row">
                            <span class="value">暂无精灵记录</span>
                        </div>
                    </div>
                `;
            } else {
                currentSpiritIds.forEach(spiritId => {
                    const records = gameData.spiritRecords[spiritId];
                    if (records && records.length > 0) {
                        const latestRecord = records[records.length - 1];
                        const typeColor = this.getRecordTypeColor(latestRecord.type);
                        const typeText = this.getRecordTypeText(latestRecord.type);
                        
                        // 获取精灵的名字和稀有度
                        let spiritName = '未知';
                        let spiritRarity = '普通';
                        if (gameData.initialData && gameData.initialData.spirits) {
                            const initialSpirit = gameData.initialData.spirits.find(s => 
                                s.id === parseInt(spiritId) || s.id === spiritId
                            );
                            if (initialSpirit) {
                                spiritName = initialSpirit.name;
                                spiritRarity = initialSpirit.rarity;
                            } else {
                                const ownedSpirit = this.game.player.ownedSpirits.find(s => 
                                    s.id === parseInt(spiritId) || s.id === spiritId
                                );
                                if (ownedSpirit) {
                                    spiritName = ownedSpirit.name;
                                    spiritRarity = ownedSpirit.rarity || '普通';
                                }
                            }
                        }
                        
                        const rarityText = this.getRarityText(spiritRarity);
                        
                        dataHtml += `
                            <div class="spirit-card">
                                <h3 class="spirit-header">🟢 精灵 #${spiritId} - ${spiritName} (${rarityText}) - 共 ${records.length} 条记录</h3>
                                <div class="grid-2">
                                    <div>
                                        <h4>当前状态</h4>
                                        <div class="row">
                                            <span class="label">当前等级:</span>
                                            <span class="value highlight">Lv.${latestRecord.level}</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">属性:</span>
                                            <span class="value">攻击: ${latestRecord.atk}; 防御: ${latestRecord.def}; 生命: ${latestRecord.maxHp}; 魔力: ${latestRecord.maxMp}</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">战斗属性:</span>
                                            <span class="value">暴击: ${(latestRecord.critRate || 0).toFixed(1)}%; 暴伤: ${(latestRecord.critDamage || 150).toFixed(0)}%; 速度: ${latestRecord.speed || 0}; 命中: ${(latestRecord.accuracy || 85).toFixed(1)}%</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">技能数量:</span>
                                            <span class="value">${latestRecord.skills.length} 个</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">最新记录类型:</span>
                                            <span class="value" style="color: ${typeColor};">${typeText}</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">最后更新:</span>
                                            <span class="value" style="font-size: 0.9em; color: #95a5a6;">${new Date(latestRecord.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4>历史记录 (${records.length} 条)</h4>
                                        <div style="max-height: 300px; overflow-y: auto;">
                        `;
                        
                        records.slice().reverse().forEach((record, index) => {
                            const recordTypeClass = this.getRecordTypeClass(record.type);
                            const recordTypeText = this.getRecordTypeText(record.type);
                            let recordDetail = '';
                            let statChanges = '';
                            
                            if (record.type === 'level_up' && record.oldLevel) {
                                recordDetail = ` Lv.${record.oldLevel} → Lv.${record.level}`;
                                
                                const prevIndex = records.length - 1 - (index + 1);
                                if (prevIndex >= 0) {
                                    const prevRecord = records[prevIndex];
                                    const atkChange = record.atk - prevRecord.atk;
                                    const defChange = record.def - prevRecord.def;
                                    const hpChange = record.maxHp - prevRecord.maxHp;
                                    const mpChange = record.maxMp - prevRecord.maxMp;
                                    
                                    statChanges = `
                                        <div class="stat-changes">
                                            <div>攻击: +${atkChange}; 防御: +${defChange}; 生命: +${hpChange}; 魔力: +${mpChange}</div>
                                        </div>
                                    `;
                                }
                            } else if (record.type === 'skill_learn' && record.newSkill) {
                                recordDetail = ` 学习技能: ${record.newSkill.name}`;
                            } else if (record.type === 'evolution') {
                                recordDetail = ` 进化至 Lv.${record.level}`;
                                
                                // 计算进化后的属性变化
                                const prevIndex = records.length - 1 - (index + 1);
                                if (prevIndex >= 0) {
                                    const prevRecord = records[prevIndex];
                                    const atkChange = record.atk - prevRecord.atk;
                                    const defChange = record.def - prevRecord.def;
                                    const hpChange = record.maxHp - prevRecord.maxHp;
                                    const mpChange = record.maxMp - prevRecord.maxMp;
                                    
                                    statChanges = `
                                        <div class="stat-changes">
                                            <div>攻击: +${atkChange}; 防御: +${defChange}; 生命: +${hpChange}; 魔力: +${mpChange}</div>
                                        </div>
                                    `;
                                }
                            }
                            
                            dataHtml += `
                                <div class="record-item ${recordTypeClass}">
                                    <div style="font-weight: bold; color: ${this.getRecordTypeColor(record.type)};">
                                        ${recordTypeText}${recordDetail}
                                    </div>
                                    ${statChanges}
                                    <div class="record-time">
                                        ${new Date(record.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            `;
                        });
                        
                        dataHtml += `
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
            }

            // 显示被替换的精灵
            if (gameData.replacedSpirits && gameData.replacedSpirits.length > 0) {
                dataHtml += `
                <h2>📤 被替换的精灵 (${gameData.replacedSpirits.length} 只)</h2>
                `;
                
                gameData.replacedSpirits.forEach(spirit => {
                    const rarityText = this.getRarityText(spirit.rarity || '普通');
                    const records = spirit.records || [];
                    
                    dataHtml += `
                        <div class="spirit-card" style="opacity: 0.8; border-left: 3px solid #e74c3c;">
                            <h3 class="spirit-header" style="color: #e74c3c;">🔴 精灵 #${spirit.id} - ${spirit.name} (${rarityText}) - 已替换</h3>
                            <div class="grid-2">
                                <div>
                                    <h4>替换时状态</h4>
                                    <div class="row">
                                        <span class="label">等级:</span>
                                        <span class="value highlight">Lv.${spirit.level}</span>
                                    </div>
                                    <div class="row">
                                        <span class="label">属性:</span>
                                        <span class="value">攻击: ${spirit.atk}; 防御: ${spirit.def}; 生命: ${spirit.maxHp}; 魔力: ${spirit.maxMp}</span>
                                    </div>
                                    <div class="row">
                                        <span class="label">战斗属性:</span>
                                        <span class="value">暴击: ${(spirit.critRate || 0).toFixed(1)}%; 暴伤: ${(spirit.critDamage || 150).toFixed(0)}%; 速度: ${spirit.speed || 0}; 命中: ${(spirit.accuracy || 85).toFixed(1)}%</span>
                                    </div>
                                    <div class="row">
                                        <span class="label">技能数量:</span>
                                        <span class="value">${spirit.skills ? spirit.skills.length : 0} 个</span>
                                    </div>
                                    <div class="row">
                                        <span class="label">进化状态:</span>
                                        <span class="value">${spirit.evolved ? '已进化' : '未进化'}${spirit.awakened ? ' / 已觉醒' : ''}</span>
                                    </div>
                                    <div class="row">
                                        <span class="label">替换时间:</span>
                                        <span class="value" style="font-size: 0.9em; color: #e74c3c;">${new Date(spirit.replacedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4>历史记录 (${records.length} 条)</h4>
                                    <div style="max-height: 300px; overflow-y: auto;">
                    `;
                    
                    if (records.length === 0) {
                        dataHtml += `<div class="record-item">暂无历史记录</div>`;
                    } else {
                        records.slice().reverse().forEach(record => {
                            const recordTypeClass = this.getRecordTypeClass(record.type);
                            const recordTypeText = this.getRecordTypeText(record.type);
                            let recordDetail = '';
                            
                            if (record.type === 'level_up' && record.oldLevel) {
                                recordDetail = ` Lv.${record.oldLevel} → Lv.${record.level}`;
                            } else if (record.type === 'skill_learn' && record.newSkill) {
                                recordDetail = ` 学习技能: ${record.newSkill.name}`;
                            } else if (record.type === 'evolution') {
                                recordDetail = ` 进化至 Lv.${record.level}`;
                            }
                            
                            dataHtml += `
                                <div class="record-item ${recordTypeClass}">
                                    <div style="font-weight: bold; color: ${this.getRecordTypeColor(record.type)};">
                                        ${recordTypeText}${recordDetail}
                                    </div>
                                    <div class="record-time">
                                        ${new Date(record.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            `;
                        });
                    }
                    
                    dataHtml += `
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        }

        dataHtml += `
                </div>
            </body>
            </html>
        `;

        const newWindow = window.open('', '_blank', 'width=1200,height=900,scrollbars=yes');
        newWindow.document.write(dataHtml);
        newWindow.document.close();
        console.log('游戏数据显示完成');
    }

    getGameDuration(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const diff = now - created;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days}天${hours}小时`;
        } else if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    }

    getRecordTypeClass(type) {
        const classMap = {
            'initial': '',
            'level_up': 'level-up',
            'evolution': 'evolution',
            'skill_learn': 'skill-learn'
        };
        return classMap[type] || '';
    }

    getRecordTypeColor(type) {
        const colorMap = {
            'initial': '#2ecc71',
            'level_up': '#3498db',
            'evolution': '#9b59b6',
            'skill_learn': '#f39c12'
        };
        return colorMap[type] || '#95a5a6';
    }

    getRecordTypeText(type) {
        const typeMap = {
            'initial': '初始',
            'level_up': '升级',
            'evolution': '进化',
            'skill_learn': '技能学习',
            'exp_gain': '获得经验值'
        };
        return typeMap[type] || type;
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.game.currentScreen = screenName;
        }
        
        if (screenName === 'main') {
            this.updateMainScreen();
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    updateMainScreen() {
        this.elements.playerGold.textContent = this.game.player.gold;
        this.elements.playerWins.textContent = this.game.player.wins;
        this.elements.playerLosses.textContent = this.game.player.losses;
        
        // 计算并显示玩家等级（所有精灵等级之和）
        const playerLevel = this.game.player.ownedSpirits.reduce((total, spirit) => total + spirit.level, 0);
        this.elements.playerLevel.textContent = playerLevel;
        
        if (document.getElementById('spirit-count')) {
            document.getElementById('spirit-count').textContent = this.game.player.ownedSpirits.length;
        }
        
        // 更新游戏信息
        this.updateGameInfo();
        
        this.game.spiritManager.renderOwnedSpirits();
        this.game.spiritManager.updateFragmentInfo();
        this.updateInventoryDisplay();
        
        // 确保玩家数据有equipment字段
        if (!this.game.player.equipment) {
            this.game.player.equipment = [];
        }
        
        // 刷新装备显示（如果当前在装备页签）
        const equipmentTab = document.querySelector('.inventory-tab[data-tab="equipment"]');
        if (equipmentTab && equipmentTab.classList.contains('active')) {
            this.updateEquipmentDisplay();
        }
        
        // 绑定背包页签切换事件（只在首次加载时绑定）
        const inventoryTabs = document.querySelectorAll('.inventory-tab');
        inventoryTabs.forEach(tab => {
            if (!tab.dataset.bound) {
                tab.dataset.bound = 'true';
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const tabName = tab.dataset.tab;
                    const itemsContainer = document.getElementById('inventory-list');
                    const equipmentContainer = document.getElementById('equipment-list');
                    
                    if (tabName === 'items') {
                        itemsContainer.style.display = 'flex';
                        equipmentContainer.style.display = 'none';
                    } else {
                        itemsContainer.style.display = 'none';
                        equipmentContainer.style.display = 'flex';
                        this.updateEquipmentDisplay();
                    }
                });
            }
        });
    }
    
    updateGameInfo() {
        const gameData = this.game.dataManager.getGameData();
        if (gameData) {
            // 更新游戏ID
            this.elements.gameId.textContent = gameData.gameId || '-';
            
            // 更新游戏时长
            if (gameData.createdAt) {
                const createdAt = new Date(gameData.createdAt);
                const now = new Date();
                const durationMs = now - createdAt;
                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
                this.elements.gameDuration.textContent = `${hours}h ${minutes}m ${seconds}s`;
            } else {
                this.elements.gameDuration.textContent = '-';
            }
            
            // 更新随机种子
            if (gameData.initialData && gameData.initialData.randomElements) {
                this.elements.randomSeed.textContent = gameData.initialData.randomElements.seed || '-';
            } else {
                this.elements.randomSeed.textContent = '-';
            }
        } else {
            // 重置游戏信息
            this.elements.gameId.textContent = '-';
            this.elements.gameDuration.textContent = '-';
            this.elements.randomSeed.textContent = '-';
        }
    }
    
    updateInventoryDisplay() {
        this.elements.inventoryList.innerHTML = '';
        
        const items = Object.keys(this.game.player.inventory);
        if (items.length === 0) {
            this.elements.inventoryList.innerHTML = '<p style="color: #bdc3c7;">背包为空</p>';
            return;
        }
        
        items.forEach(key => {
            const count = this.game.player.inventory[key];
            if (count > 0) {
                const item = ITEMS[key];
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.style.position = 'relative';
                div.innerHTML = `
                    <span class="item-icon">${item.icon}</span>
                    <span>${item.name}</span>
                    <span class="item-count">${count}</span>
                    <button class="discard-btn" data-item-key="${key}" title="丢弃">×</button>
                `;
                div.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('discard-btn')) {
                        this.game.spiritManager.useItemOnTeam(key);
                    }
                });
                this.elements.inventoryList.appendChild(div);
            }
        });
        
        // 绑定丢弃按钮事件
        this.elements.inventoryList.querySelectorAll('.discard-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemKey = e.target.dataset.itemKey;
                this.discardItem(itemKey);
            });
        });
    }
    
    discardItem(itemKey) {
        const item = ITEMS[itemKey];
        const count = this.game.player.inventory[itemKey];
        
        if (count <= 0) return;
        
        this.showConfirm('丢弃道具', `确定要丢弃 ${item.name} x${count} 吗？`, (confirmed) => {
            if (confirmed) {
                delete this.game.player.inventory[itemKey];
                this.game.showToast(`已丢弃 ${item.name}`, 'info');
                this.updateInventoryDisplay();
                this.game.saveSystem.autoSave();
            }
        });
    }
    
    updateEquipmentDisplay() {
        if (!this.elements.equipmentList) {
            console.error('equipmentList element not found');
            return;
        }
        
        this.elements.equipmentList.innerHTML = '';
        
        if (!this.game.player) {
            console.error('player data not found');
            return;
        }
        
        const equipment = this.game.player.equipment || [];
        const unequippedEquipment = equipment.filter(e => !e.equipped);
        
        if (unequippedEquipment.length === 0) {
            this.elements.equipmentList.innerHTML = '<p style="color: #bdc3c7;">没有可装备的装备</p>';
            return;
        }
        
        unequippedEquipment.forEach(equip => {
            const rarityInfo = EQUIPMENT_RARITIES[equip.rarity];
            const statsText = equip.stats.map(s => `${s.name}+${s.value}`).join(', ');
            const div = document.createElement('div');
            div.className = 'equipment-card';
            div.style.position = 'relative';
            div.innerHTML = `
                <button class="discard-btn" data-equip-id="${equip.id}" title="丢弃">×</button>
                <div class="equipment-icon">${equip.icon}</div>
                <div class="equipment-name">${equip.name} <span style="color: ${rarityInfo.color};">[${rarityInfo.name}]</span></div>
                <div class="equipment-type">${EQUIPMENT_TYPES[equip.type].name}</div>
                <div class="equipment-stats">${statsText}</div>
                ${equip.equipped ? '<div class="equipment-status">已装备</div>' : ''}
            `;
            this.elements.equipmentList.appendChild(div);
        });
        
        // 绑定丢弃按钮事件
        this.elements.equipmentList.querySelectorAll('.discard-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const equipId = e.target.dataset.equipId;
                this.discardEquipment(equipId);
            });
        });
    }
    
    discardEquipment(equipId) {
        const equipIndex = this.game.player.equipment.findIndex(e => e.id === equipId);
        if (equipIndex === -1) return;
        
        const equip = this.game.player.equipment[equipIndex];
        
        this.showConfirm('丢弃装备', `确定要丢弃 ${equip.name} 吗？`, (confirmed) => {
            if (confirmed) {
                this.game.player.equipment.splice(equipIndex, 1);
                this.game.showToast(`已丢弃 ${equip.name}`, 'info');
                this.updateEquipmentDisplay();
                this.game.saveSystem.autoSave();
            }
        });
    }
    
    getElementColor(element) {
        const colors = {
            gold: '#f1c40f, #f39c12',
            wood: '#2ecc71, #27ae60',
            water: '#3498db, #2980b9',
            fire: '#e74c3c, #c0392b',
            earth: '#d35400, #a0522d'
        };
        return colors[element];
    }
    
    getRarityText(rarity) {
        const rarityMap = {
            'common': '普通',
            'rare': '稀有',
            'epic': '珍贵',
            'legendary': '传说'
        };
        return rarityMap[rarity] || '普通';
    }
    
    getRarityColor(rarity) {
        const colorMap = {
            'common': '#bdc3c7',
            'rare': '#3498db',
            'epic': '#9b59b6',
            'legendary': '#f1c40f'
        };
        return colorMap[rarity] || '#bdc3c7';
    }
}

window.UIManager = UIManager;
