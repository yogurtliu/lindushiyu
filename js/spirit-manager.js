class SpiritManager {
    constructor(game) {
        this.game = game;
    }

    getRandomSpirits(count) {
        const shuffled = [...ALL_SPIRITS_WITH_RARITY].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    renderInitialSelection() {
        const grid = this.game.uiManager.elements.spiritGrid;
        const countEl = this.game.uiManager.elements.selectedCount;
        const confirmBtn = this.game.uiManager.elements.confirmSelection;

        grid.innerHTML = '';
        countEl.textContent = '0';
        confirmBtn.disabled = true;

        document.querySelector('.selection-hint').textContent = '请从5只精灵中选择1只作为你的初始精灵';

        this.game.initialChoices.forEach(spirit => {
            const card = this.createSpiritCard(spirit, false);
            card.addEventListener('click', () => this.selectInitialSpirit(spirit, card));
            grid.appendChild(card);
        });

        // 延迟初始化雷达图，确保DOM已渲染
        setTimeout(() => {
            this.initSpiritRadarCharts();
        }, 100);
    }

    initSpiritRadarCharts() {
        const cards = document.querySelectorAll('.spirit-card');
        cards.forEach(card => {
            const canvas = card.querySelector('.spirit-radar-chart');
            if (canvas) {
                const spiritId = parseInt(canvas.dataset.spiritId);
                const spirit = this.game.initialChoices.find(s => s.id === spiritId);
                if (spirit) {
                    this.createRadarChart(canvas, spirit);
                }
            }
        });
    }

    createRadarChart(canvas, spirit) {
        // 计算属性值的标准化值（0-100）
        const atkValue = Math.min(100, (spirit.atk / 150) * 100);
        const defValue = Math.min(100, (spirit.def / 100) * 100);
        const critRateValue = spirit.critRate;
        const critDamageValue = Math.min(100, (spirit.critDamage / 300) * 100);
        const speedValue = Math.min(100, (spirit.speed / 200) * 100);
        const accuracyValue = spirit.accuracy;

        const ctx = canvas.getContext('2d');
        
        // 销毁已存在的图表
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        canvas.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['攻击', '防御', '暴击', '暴伤', '速度', '命中'],
                datasets: [{
                    label: spirit.name,
                    data: [atkValue, defValue, critRateValue, critDamageValue, speedValue, accuracyValue],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 0.8)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(52, 152, 219, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 10
                            }
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            backdropColor: 'transparent',
                            font: {
                                size: 8
                            },
                            stepSize: 20,
                            beginAtZero: true,
                            max: 100
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(52, 152, 219, 0.8)',
                        borderWidth: 1
                    }
                }
            }
        });
    }

    createSpiritCard(spirit, showLevel = false) {
        const card = document.createElement('div');
        card.className = 'spirit-card';
        card.dataset.element = spirit.element;
        card.dataset.spiritId = spirit.id;

        const element = ELEMENTS[spirit.element];

        let levelInfo = '';
        if (showLevel) {
            levelInfo = `<div class="spirit-level">Lv.${spirit.level}</div>`;
        }

        card.innerHTML = `
            <div class="spirit-avatar">${spirit.icon}</div>
            <div class="spirit-header">
                <div class="spirit-title-row">
                    <div class="spirit-name">${spirit.name}</div>
                    <div class="spirit-rarity" style="color: ${this.game.uiManager.getRarityColor(spirit.rarity)}">${this.game.uiManager.getRarityText(spirit.rarity)}</div>
                    <div class="spirit-element">${element.name} ${element.icon}</div>
                </div>
            </div>
            ${levelInfo}
            <div class="spirit-radar-container">
                <canvas class="spirit-radar-chart" data-spirit-id="${spirit.id}"></canvas>
            </div>
            <div class="spirit-stats-list">
                <div class="stat-list-item">
                    <div class="stat-icon">⚔️</div>
                    <div class="stat-info">
                        <div class="stat-label">攻击</div>
                        <div class="stat-value">${spirit.atk}</div>
                    </div>
                </div>
                <div class="stat-list-item">
                    <div class="stat-icon">🛡️</div>
                    <div class="stat-info">
                        <div class="stat-label">防御</div>
                        <div class="stat-value">${spirit.def}</div>
                    </div>
                </div>
                <div class="stat-list-item">
                    <div class="stat-icon">⚡</div>
                    <div class="stat-info">
                        <div class="stat-label">暴击</div>
                        <div class="stat-value">${spirit.critRate.toFixed(0)}%</div>
                    </div>
                </div>
                <div class="stat-list-item">
                    <div class="stat-icon">💥</div>
                    <div class="stat-info">
                        <div class="stat-label">暴伤</div>
                        <div class="stat-value">${spirit.critDamage.toFixed(0)}%</div>
                    </div>
                </div>
                <div class="stat-list-item">
                    <div class="stat-icon">💨</div>
                    <div class="stat-info">
                        <div class="stat-label">速度</div>
                        <div class="stat-value">${spirit.speed}</div>
                    </div>
                </div>
                <div class="stat-list-item">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-info">
                        <div class="stat-label">命中</div>
                        <div class="stat-value">${spirit.accuracy.toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    selectInitialSpirit(spirit, card) {
        document.querySelectorAll('.spirit-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.game.selectedSpirit = spirit;
        this.game.uiManager.elements.selectedCount.textContent = '1';
        this.game.uiManager.elements.confirmSelection.disabled = false;
    }

    confirmInitialSelection() {
        if (!this.game.selectedSpirit) return;

        const newSpirit = createSpiritCopy(this.game.selectedSpirit);
        calculateStats(newSpirit);
        newSpirit.currentHp = newSpirit.maxHp;
        newSpirit.currentMp = newSpirit.maxMp;

        this.game.player.ownedSpirits.push(newSpirit);
        this.game.player.battleTeam.push(newSpirit);

        // 保存精灵初始数据
        this.game.dataManager.saveSpiritInitialData(newSpirit);

        this.game.uiManager.updateMainScreen();
        this.game.uiManager.showScreen('main');
    }

    renderOwnedSpirits() {
        const container = this.game.uiManager.elements.myTeam;
        if (!container) return;

        container.innerHTML = '';

        this.game.player.ownedSpirits.forEach((spirit, index) => {
            // 从数据表中获取最新的精灵属性
            const latestStats = this.game.dataManager.getSpiritLatestStats(spirit.id);
            if (latestStats) {
                spirit.level = latestStats.level;
                spirit.atk = latestStats.atk;
                spirit.def = latestStats.def;
                spirit.maxHp = latestStats.maxHp;
                spirit.maxMp = latestStats.maxMp;
                spirit.skills = latestStats.skills;
                
                // 获取最新的经验值
                const latestExp = this.game.dataManager.getSpiritLatestExp(spirit.id);
                if (latestExp !== null) {
                    spirit.exp = latestExp;
                }
            } else {
                // 如果没有找到记录，重新计算精灵属性
                calculateStats(spirit);
                
                // 确保新属性存在
                if (!spirit.critRate) spirit.critRate = spirit.baseCritRate || 5;
                if (!spirit.critDamage) spirit.critDamage = spirit.baseCritDamage || 150;
                if (!spirit.speed) spirit.speed = spirit.baseSpeed || 50;
                if (!spirit.accuracy) spirit.accuracy = spirit.baseAccuracy || 85;
            }
            
            console.log('精灵信息:', spirit);
            console.log('精灵稀有度:', spirit.rarity);
            const card = document.createElement('div');
            card.className = 'team-spirit';
            card.dataset.element = spirit.element;
            card.dataset.index = index;

            if (spirit.currentHp <= 0) {
                card.classList.add('dead');
            }

            const expNeeded = getSpiritExpForNextLevel(spirit);
            const expPercent = Math.min(100, (spirit.exp / expNeeded) * 100);

            let badges = '';
            if (spirit.evolved) badges += '<span class="evolution-badge evolved">进化</span>';
            if (spirit.awakened) badges += '<span class="evolution-badge awakened">觉醒</span>';

            const inTeam = this.game.player.battleTeam.some(s => s.id === spirit.id);
            if (inTeam) card.classList.add('in-team');

            // 获取稀有度信息
            const rarityColor = this.game.uiManager.getRarityColor(spirit.rarity);
            const rarityText = this.game.uiManager.getRarityText(spirit.rarity);

            // 计算装备加成
            const atkBonus = this.getEquipmentBonus(spirit, 'atk');
            const defBonus = this.getEquipmentBonus(spirit, 'def');
            const maxHpBonus = this.getEquipmentBonus(spirit, 'maxHp');
            const maxMpBonus = this.getEquipmentBonus(spirit, 'maxMp');
            const critRateBonus = this.getEquipmentBonus(spirit, 'critRate');
            const critDamageBonus = this.getEquipmentBonus(spirit, 'critDamage');
            const speedBonus = this.getEquipmentBonus(spirit, 'speed');
            const accuracyBonus = this.getEquipmentBonus(spirit, 'accuracy');

            // 使用记录中的属性作为基础值（已经包含等级、进化、潜力加成）
            const baseAtk = spirit.atk;
            const baseDef = spirit.def;
            const baseMaxHp = spirit.maxHp;
            const baseMaxMp = spirit.maxMp;
            const baseCritRate = spirit.critRate;
            const baseCritDamage = spirit.critDamage;
            const baseSpeed = spirit.speed;
            const baseAccuracy = spirit.accuracy;

            // 计算总属性（基础值 + 装备加成）
            const totalAtk = baseAtk + atkBonus;
            const totalDef = baseDef + defBonus;
            const totalMaxHp = baseMaxHp + maxHpBonus;
            const totalMaxMp = baseMaxMp + maxMpBonus;
            const totalCritRate = baseCritRate + critRateBonus;
            const totalCritDamage = baseCritDamage + critDamageBonus;
            const totalSpeed = baseSpeed + speedBonus;
            const totalAccuracy = baseAccuracy + accuracyBonus;

            // 计算生命值和魔力值百分比（基于总值）
            const hpPercent = totalMaxHp > 0 ? (spirit.currentHp / totalMaxHp) * 100 : 0;
            let hpClass = '';
            if (hpPercent < 30) hpClass = 'low';
            else if (hpPercent < 60) hpClass = 'medium';

            const mpPercent = totalMaxMp > 0 ? (spirit.currentMp / totalMaxMp) * 100 : 0;
            
            // 确保当前生命值和魔力值不超过总最大值
            if (spirit.currentHp > totalMaxHp) {
                spirit.currentHp = totalMaxHp;
            }
            if (spirit.currentMp > totalMaxMp) {
                spirit.currentMp = totalMaxMp;
            }

            // 创建精灵卡片的HTML内容
            const cardHtml = `
                <div class="spirit-avatar">${spirit.icon}</div>
                <div class="spirit-name">${spirit.name}${badges} <span style="color: ${rarityColor}; font-size: 0.8em;">[${rarityText}]</span></div>
                <div class="spirit-element">Lv.${spirit.level} ${ELEMENTS[spirit.element].name}</div>
                <div class="stat-bar-container">
                    <div class="stat-label">生命值 ❤️</div>
                    <div class="hp-text">${spirit.currentHp}/${totalMaxHp}${maxHpBonus > 0 ? `<span class="stat-bonus">+${maxHpBonus}</span>` : ''}</div>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-label">魔力值 💙</div>
                    <div class="mp-text">${spirit.currentMp}/${totalMaxMp}${maxMpBonus > 0 ? `<span class="stat-bonus">+${maxMpBonus}</span>` : ''}</div>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-label">经验值 ⭐</div>
                    <div class="exp-bar">
                        <div class="exp-bar-fill" style="width: ${expPercent}%"></div>
                    </div>
                    <div class="exp-text">${spirit.exp}/${expNeeded}</div>
                </div>
                <div class="spirit-stats-list">
                    <div class="stat-list-item">
                        <div class="stat-icon">⚔️</div>
                        <div class="stat-info">
                            <div class="stat-label">攻击</div>
                            <div class="stat-value">${totalAtk}${atkBonus > 0 ? `<span class="stat-bonus">+${atkBonus}</span>` : ''}</div>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <div class="stat-icon">🛡️</div>
                        <div class="stat-info">
                            <div class="stat-label">防御</div>
                            <div class="stat-value">${totalDef}${defBonus > 0 ? `<span class="stat-bonus">+${defBonus}</span>` : ''}</div>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-info">
                            <div class="stat-label">暴击</div>
                            <div class="stat-value">${totalCritRate.toFixed(0)}%${critRateBonus > 0 ? `<span class="stat-bonus">+${critRateBonus}%</span>` : ''}</div>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <div class="stat-icon">💥</div>
                        <div class="stat-info">
                            <div class="stat-label">暴伤</div>
                            <div class="stat-value">${totalCritDamage.toFixed(0)}%${critDamageBonus > 0 ? `<span class="stat-bonus">+${critDamageBonus}%</span>` : ''}</div>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <div class="stat-icon">💨</div>
                        <div class="stat-info">
                            <div class="stat-label">速度</div>
                            <div class="stat-value">${totalSpeed}${speedBonus > 0 ? `<span class="stat-bonus">+${speedBonus}</span>` : ''}</div>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-label">命中</div>
                            <div class="stat-value">${totalAccuracy.toFixed(0)}%${accuracyBonus > 0 ? `<span class="stat-bonus">+${accuracyBonus}%</span>` : ''}</div>
                        </div>
                    </div>
                </div>
                ${inTeam ? '<div class="in-team-badge">出战中</div>' : ''}
            `;
            
            card.innerHTML = cardHtml;

            card.addEventListener('click', () => this.showSpiritDetail(spirit));

            container.appendChild(card);
        });
    }
    


    showSpiritDetail(spirit) {
        const element = ELEMENTS[spirit.element];
        const expNeeded = getSpiritExpForNextLevel(spirit);
        const expPercent = Math.min(100, (spirit.exp / expNeeded) * 100);

        let skillsHtml = '<div class="detail-section"><h4>已学技能</h4>';
        spirit.skills.forEach((skill, index) => {
            const mpCostText = skill.mpCost ? ` (💙${skill.mpCost})` : '';
            skillsHtml += `
                <div class="stat-row">
                    <span>${skill.name}${mpCostText}</span>
                    <span style="font-size: 0.8em; color: #bdc3c7;">${skill.description}</span>
                </div>
            `;
        });
        skillsHtml += '</div>';

        // 使用记录中的属性作为基础值（已经包含等级、进化、潜力加成）
        const baseAtk = spirit.atk;
        const baseDef = spirit.def;
        const baseMaxHp = spirit.maxHp;
        const baseMaxMp = spirit.maxMp;

        this.game.uiManager.elements.modalContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar" style="background: linear-gradient(135deg, ${this.game.uiManager.getElementColor(spirit.element)});">
                    ${spirit.icon}
                </div>
                <div class="detail-name">${spirit.name} <span style="color: ${this.game.uiManager.getRarityColor(spirit.rarity)}; font-size: 0.8em;">[${this.game.uiManager.getRarityText(spirit.rarity)}]</span></div>
                <div class="detail-element">${element.name}属性 ${element.icon}</div>
                <button id="manage-equipment-btn" class="action-btn" style="position: absolute; top: 60px; right: 20px;">管理装备</button>
            </div>
            <div class="detail-section">
                <h4>属性</h4>
                <div class="stat-row"><span>等级</span><span>${spirit.level}</span></div>
                <div class="stat-row"><span>攻击力</span><span>${baseAtk}</span></div>
                <div class="stat-row"><span>防御力</span><span>${baseDef}</span></div>
                <div class="stat-row"><span>生命值</span><span>${baseMaxHp}</span></div>
                <div class="stat-row"><span>魔力值</span><span>${baseMaxMp}</span></div>
                <div class="stat-row"><span>暴击率</span><span style="color: #f39c12;">${spirit.critRate.toFixed(1)}%</span></div>
                <div class="stat-row"><span>暴击伤害</span><span style="color: #e74c3c;">${spirit.critDamage.toFixed(0)}%</span></div>
                <div class="stat-row"><span>速度</span><span style="color: #3498db;">${spirit.speed}</span></div>
                <div class="stat-row"><span>命中率</span><span style="color: #2ecc71;">${spirit.accuracy.toFixed(1)}%</span></div>
                <div class="stat-row"><span>经验值</span><span>${spirit.exp}/${expNeeded}</span></div>
                <div class="stat-row"><span>稀有度</span><span style="color: ${this.game.uiManager.getRarityColor(spirit.rarity)};">${this.game.uiManager.getRarityText(spirit.rarity)}</span></div>
                <div class="stat-row"><span>潜力值</span><span>${spirit.potential || 5}/10</span></div>
                <div class="exp-bar">
                    <div class="exp-bar-fill" style="width: ${expPercent}%"></div>
                </div>
            </div>
            ${skillsHtml}
            <div class="detail-section">
                <h4>属性相克</h4>
                <p style="color: #2ecc71;">克制: ${element.strong.map(e => ELEMENTS[e].name).join(', ') || '无'}</p>
                <p style="color: #e74c3c;">被克: ${element.weak.map(e => ELEMENTS[e].name).join(', ') || '无'}</p>
            </div>
            <div class="detail-section">
                <h4>进化形态</h4>
                <p>15级进化: ${spirit.evolvedName}</p>
                <p>20级觉醒: ${spirit.awakenedName}</p>
            </div>
        `;
        this.game.uiManager.elements.modal.classList.add('active');
        
        // 添加装备管理按钮事件
        const manageBtn = document.getElementById('manage-equipment-btn');
        if (manageBtn) {
            manageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.game.uiManager.elements.modal.classList.remove('active');
                this.showEquipmentManagement(spirit);
            });
        }
    }

    showEquipmentManagement(spirit) {
        // 初始化精灵装备槽位
        if (!spirit.equipment) {
            spirit.equipment = {
                weapon: null,
                armor: null,
                accessory1: null,
                accessory2: null
            };
        }

        const equipmentContent = document.getElementById('equipment-content');
        if (!equipmentContent) {
            console.error('equipment-content element not found');
            return;
        }
        
        // 生成已装备区域
        let equippedHtml = '<div class="detail-section"><h4>已装备</h4>';
        
        // 武器槽
        const weapon = spirit.equipment.weapon;
        equippedHtml += this.createEquipmentSlotHtml('weapon', '武器', weapon, spirit);
        
        // 防具槽
        const armor = spirit.equipment.armor;
        equippedHtml += this.createEquipmentSlotHtml('armor', '防具', armor, spirit);
        
        // 饰品槽1
        const accessory1 = spirit.equipment.accessory1;
        equippedHtml += this.createEquipmentSlotHtml('accessory1', '饰品1', accessory1, spirit);
        
        // 饰品槽2
        const accessory2 = spirit.equipment.accessory2;
        equippedHtml += this.createEquipmentSlotHtml('accessory2', '饰品2', accessory2, spirit);
        
        equippedHtml += '</div>';
        
        // 生成背包区域
        let inventoryHtml = '<div class="detail-section"><h4>背包</h4>';
        const unequippedEquipment = this.game.player.equipment.filter(e => !e.equipped);
        
        if (unequippedEquipment.length === 0) {
            inventoryHtml += '<p style="color: #7f8c8d; text-align: center;">背包中没有装备</p>';
        } else {
            inventoryHtml += '<div class="equipment-list">';
            unequippedEquipment.forEach(equip => {
                const rarityInfo = EQUIPMENT_RARITIES[equip.rarity];
                const statsText = equip.stats.map(s => `${s.name}+${s.value}`).join(', ');
                inventoryHtml += `
                    <div class="equipment-item">
                        <div class="equip-icon">${equip.icon}</div>
                        <div class="equip-info">
                            <div class="equip-name" style="color: ${rarityInfo.color}">${equip.name} [${rarityInfo.name}]</div>
                            <div class="equip-type">${EQUIPMENT_TYPES[equip.type].name}</div>
                            <div class="equip-stats">${statsText}</div>
                        </div>
                        <button class="equip-btn btn-small" data-equip-id="${equip.id}">装备</button>
                    </div>
                `;
            });
            inventoryHtml += '</div>';
        }
        inventoryHtml += '</div>';
        
        equipmentContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar">${spirit.icon}</div>
                <div class="detail-name">${spirit.name}</div>
                <div class="detail-element">装备管理</div>
            </div>
            ${equippedHtml}
            ${inventoryHtml}
        `;
        
        document.getElementById('equipment-modal').classList.add('active');
        
        // 添加装备按钮事件
        equipmentContent.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const equipId = e.target.dataset.equipId;
                this.equipItem(spirit, equipId);
            });
        });
        
        // 添加卸下按钮事件
        equipmentContent.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.dataset.slot;
                this.unequipItem(spirit, slot);
            });
        });
    }
    
    createEquipmentSlotHtml(slotKey, slotName, equip, spirit) {
        if (equip) {
            const rarityInfo = EQUIPMENT_RARITIES[equip.rarity];
            const statsText = equip.stats.map(s => `${s.name}+${s.value}`).join(', ');
            return `
                <div class="equipment-slot equipped">
                    <div class="equip-icon">${equip.icon}</div>
                    <div class="equip-info">
                        <div class="equip-name" style="color: ${rarityInfo.color}">${equip.name} [${rarityInfo.name}]</div>
                        <div class="equip-type">${slotName}</div>
                        <div class="equip-stats">${statsText}</div>
                    </div>
                    <button class="unequip-btn btn-danger btn-small" data-slot="${slotKey}">卸下</button>
                </div>
            `;
        } else {
            return `
                <div class="equipment-slot empty">
                    <div class="equip-icon">${EQUIPMENT_TYPES[slotKey.replace(/\d/, '')]?.icon || '💍'}</div>
                    <div class="equip-info">
                        <div class="equip-name" style="color: #7f8c8d;">未装备</div>
                        <div class="equip-type">${slotName}</div>
                    </div>
                </div>
            `;
        }
    }
    
    equipItem(spirit, equipId) {
        const equipIndex = this.game.player.equipment.findIndex(e => e.id === equipId);
        if (equipIndex === -1) return;
        
        // 从背包中移除装备
        const equip = this.game.player.equipment.splice(equipIndex, 1)[0];
        
        // 确定装备槽位
        let slotKey;
        if (equip.type === 'weapon') {
            slotKey = 'weapon';
            if (spirit.equipment.weapon) {
                this.unequipItem(spirit, 'weapon');
            }
        } else if (equip.type === 'armor') {
            slotKey = 'armor';
            if (spirit.equipment.armor) {
                this.unequipItem(spirit, 'armor');
            }
        } else if (equip.type === 'accessory') {
            if (!spirit.equipment.accessory1) {
                slotKey = 'accessory1';
            } else if (!spirit.equipment.accessory2) {
                slotKey = 'accessory2';
            } else {
                this.unequipItem(spirit, 'accessory1');
                slotKey = 'accessory1';
            }
        }
        
        // 装备物品
        spirit.equipment[slotKey] = equip;
        equip.equipped = true;
        equip.equippedBy = spirit.id;
        
        // 装备后立即回满生命值和魔力值到总值（基础值 + 装备加成）
        const hpBonus = this.getEquipmentBonus(spirit, 'maxHp');
        const mpBonus = this.getEquipmentBonus(spirit, 'maxMp');
        
        // 回满生命值到总值
        spirit.currentHp = spirit.maxHp + hpBonus;
        
        // 回满魔力值到总值
        spirit.currentMp = spirit.maxMp + mpBonus;
        
        this.game.showToast(`${equip.name} 已装备！`, 'success');
        this.showEquipmentManagement(spirit);
        this.game.uiManager.updateMainScreen();
    }
    
    unequipItem(spirit, slotKey) {
        const equip = spirit.equipment[slotKey];
        if (!equip) return;
        
        equip.equipped = false;
        equip.equippedBy = null;
        spirit.equipment[slotKey] = null;
        
        // 注意：卸下装备时不修改当前生命值和魔力值
        // 这些值会在装备新装备时统一处理（回满到新的总值）
        
        // 确保装备在背包中（装备对象已经在player.equipment数组中，不需要再次添加）
        if (!this.game.player.equipment) {
            this.game.player.equipment = [];
        }
        // 检查装备是否已经在背包中，避免重复
        const existingIndex = this.game.player.equipment.findIndex(e => e.id === equip.id);
        if (existingIndex === -1) {
            this.game.player.equipment.push(equip);
        }
        
        this.game.showToast(`${equip.name} 已卸下！`, 'info');
        this.showEquipmentManagement(spirit);
        this.game.uiManager.updateMainScreen();
    }
    
    getEquipmentBonus(spirit, statName) {
        if (!spirit.equipment) return 0;

        let bonus = 0;
        const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];

        slots.forEach(slot => {
            const equip = spirit.equipment[slot];
            if (equip && equip.stats) {
                // 累加所有匹配的加成（支持同一装备多个相同类型加成）
                equip.stats.forEach(stat => {
                    if (stat.stat === statName) {
                        bonus += stat.value;
                    }
                });
            }
        });

        return bonus;
    }

    updateFragmentInfo() {
        const fragmentList = document.getElementById('fragment-list');
        if (!fragmentList) return;

        fragmentList.innerHTML = '';

        const uniqueFragments = Object.keys(this.game.player.fragments);
        if (uniqueFragments.length === 0) {
            fragmentList.innerHTML = '<p style="color: #bdc3c7;">暂无碎片</p>';
            return;
        }

        // 按获得时间排序（先获得的在前）
        const sortedFragments = uniqueFragments.sort((a, b) => {
            const timeA = this.game.player.fragments[a].firstObtained || 0;
            const timeB = this.game.player.fragments[b].firstObtained || 0;
            return timeA - timeB;
        });

        sortedFragments.forEach(spiritId => {
            const fragmentData = this.game.player.fragments[spiritId];
            const count = typeof fragmentData === 'object' ? fragmentData.count : fragmentData;
            const spiritIdNum = parseInt(spiritId);
            // 首先检查玩家是否已经拥有该精灵
            const ownedSpirit = this.game.player.ownedSpirits.find(s => s.id === spiritIdNum);
            // 如果拥有，使用拥有的精灵的信息，包括稀有度
            // 如果没有拥有，使用 ALL_SPIRITS_WITH_RARITY 中的信息
            const spirit = ownedSpirit || ALL_SPIRITS_WITH_RARITY.find(s => s.id === spiritIdNum);
            if (spirit && count > 0) {
                const rarityColor = this.game.uiManager.getRarityColor(spirit.rarity);
                const isOwned = !!ownedSpirit;
                const item = document.createElement('div');
                item.className = 'fragment-item';
                item.innerHTML = `
                    <span>${spirit.icon} ${spirit.name} <span style="color: ${rarityColor}; font-size: 0.8em;">[${this.game.uiManager.getRarityText(spirit.rarity)}]</span>${isOwned ? '<span style="color: #2ecc71; font-size: 0.8em;">[已拥有]</span>' : ''}</span>
                    <span>${count}/3 碎片</span>
                    ${count >= 3 ? `<button class="unlock-btn" data-id="${spiritId}">${isOwned ? '升级' : '解锁'}</button>` : ''}
                `;
                fragmentList.appendChild(item);

                if (count >= 3) {
                    item.querySelector('.unlock-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isOwned) {
                            this.upgradeSpirit(parseInt(spiritId));
                        } else {
                            this.unlockSpirit(parseInt(spiritId));
                        }
                    });
                }
            }
        });
    }

    useItemOnTeam(itemKey) {
        const item = ITEMS[itemKey];
        if (!item || !this.game.player.inventory[itemKey]) return;

        if (item.effect === 'revive') {
            const deadSpirit = this.game.player.ownedSpirits.find(s => s.currentHp <= 0);
            if (!deadSpirit) {
                this.game.uiManager.showToast('没有濒死的精灵需要复活！', 'warning');
                return;
            }

            const healAmount = Math.floor(deadSpirit.maxHp * 0.5);
            deadSpirit.currentHp = healAmount;
            deadSpirit.currentMp = deadSpirit.maxMp;

            this.game.player.inventory[itemKey]--;
            if (this.game.player.inventory[itemKey] <= 0) {
                delete this.game.player.inventory[itemKey];
            }

            this.game.uiManager.showToast(`使用${item.name}，${deadSpirit.name}复活并恢复了${healAmount}点生命值！`, 'success');
            this.game.uiManager.updateMainScreen();
            return;
        }

        if (item.mp) {
            const targetSpirit = this.game.player.ownedSpirits.find(s => s.currentMp < s.maxMp);
            if (!targetSpirit) {
                this.game.uiManager.showToast('没有需要恢复魔力值的精灵！', 'warning');
                return;
            }

            const mpAmount = item.mp === 9999 ? targetSpirit.maxMp : Math.min(item.mp, targetSpirit.maxMp - targetSpirit.currentMp);
            targetSpirit.currentMp = Math.min(targetSpirit.maxMp, targetSpirit.currentMp + mpAmount);

            this.game.player.inventory[itemKey]--;
            if (this.game.player.inventory[itemKey] <= 0) {
                delete this.game.player.inventory[itemKey];
            }

            this.game.uiManager.showToast(`使用${item.name}，${targetSpirit.name}恢复了${mpAmount}点魔力值！`, 'success');
            this.game.uiManager.updateMainScreen();
            return;
        }

        if (item.heal) {
            const targetSpirit = this.game.player.ownedSpirits.find(s => s.currentHp > 0 && s.currentHp < s.maxHp);
            if (!targetSpirit) {
                this.game.uiManager.showToast('没有需要治疗的精灵！', 'warning');
                return;
            }

            const healAmount = item.heal === 9999 ? targetSpirit.maxHp : Math.min(item.heal, targetSpirit.maxHp - targetSpirit.currentHp);
            targetSpirit.currentHp = Math.min(targetSpirit.maxHp, targetSpirit.currentHp + healAmount);

            this.game.player.inventory[itemKey]--;
            if (this.game.player.inventory[itemKey] <= 0) {
                delete this.game.player.inventory[itemKey];
            }

            this.game.uiManager.showToast(`使用${item.name}，${targetSpirit.name}恢复了${healAmount}点生命值！`, 'success');
            this.game.uiManager.updateMainScreen();
        }
    }

    unlockSpirit(spiritId) {
        const spirit = ALL_SPIRITS_WITH_RARITY.find(s => s.id === spiritId);
        const fragmentData = this.game.player.fragments[spiritId];
        const count = typeof fragmentData === 'object' ? fragmentData.count : fragmentData;
        
        if (!spirit || count < 3) return;

        if (this.game.player.ownedSpirits.some(s => s.id === spiritId)) return;

        if (this.game.player.ownedSpirits.length >= 7) {
            this.showReplaceSpiritScreen(spirit);
            return;
        }

        // 消耗3个碎片
        if (typeof fragmentData === 'object') {
            fragmentData.count -= 3;
            if (fragmentData.count <= 0) {
                delete this.game.player.fragments[spiritId];
            }
        } else {
            this.game.player.fragments[spiritId] -= 3;
            if (this.game.player.fragments[spiritId] <= 0) {
                delete this.game.player.fragments[spiritId];
            }
        }

        const newSpirit = createSpiritCopy(spirit);
        calculateStats(newSpirit);
        newSpirit.currentHp = newSpirit.maxHp;

        this.game.player.ownedSpirits.push(newSpirit);

        if (this.game.player.battleTeam.length < 3) {
            this.game.player.battleTeam.push(newSpirit);
        }

        this.game.uiManager.updateMainScreen();
        this.game.uiManager.showToast(`恭喜解锁新精灵：${spirit.name}！`, 'success');
    }

    upgradeSpirit(spiritId) {
        const spirit = ALL_SPIRITS_WITH_RARITY.find(s => s.id === spiritId);
        const fragmentData = this.game.player.fragments[spiritId];
        const count = typeof fragmentData === 'object' ? fragmentData.count : fragmentData;
        
        if (!spirit || count < 3) return;

        const ownedSpirit = this.game.player.ownedSpirits.find(s => s.id === spiritId);
        if (!ownedSpirit) return;

        // 消耗3个碎片
        if (typeof fragmentData === 'object') {
            fragmentData.count -= 3;
            if (fragmentData.count <= 0) {
                delete this.game.player.fragments[spiritId];
            }
        } else {
            this.game.player.fragments[spiritId] -= 3;
            if (this.game.player.fragments[spiritId] <= 0) {
                delete this.game.player.fragments[spiritId];
            }
        }

        // 升2级
        const oldLevel = ownedSpirit.level;
        ownedSpirit.level += 2;

        // 重新计算属性
        calculateStats(ownedSpirit);

        // 计算装备加成
        const hpBonus = this.getEquipmentBonus(ownedSpirit, 'maxHp');
        const mpBonus = this.getEquipmentBonus(ownedSpirit, 'maxMp');

        // 恢复生命值和魔力值（包含装备加成）
        ownedSpirit.currentHp = ownedSpirit.maxHp + hpBonus;
        ownedSpirit.currentMp = ownedSpirit.maxMp + mpBonus;

        // 保存精灵升级记录
        this.game.dataManager.saveSpiritLevelUp(ownedSpirit, oldLevel);

        this.game.uiManager.updateMainScreen();
        this.game.uiManager.showToast(`${ownedSpirit.name} 升级成功！Lv.${oldLevel} → Lv.${ownedSpirit.level}`, 'success');
    }

    showReplaceSpiritScreen(newSpirit) {
        const modal = document.getElementById('replace-spirit-modal');
        const content = document.getElementById('replace-spirit-content');

        content.innerHTML = `
            <h3>精灵数量已达上限（7个）</h3>
            <p>请选择要替换的精灵以解锁 ${newSpirit.icon} ${newSpirit.name} <span style="color: ${this.game.uiManager.getRarityColor(newSpirit.rarity)};">[${this.game.uiManager.getRarityText(newSpirit.rarity)}]</span></p>
            <div id="replace-spirit-list" class="replace-spirit-list"></div>
            <div class="replace-actions">
                <button id="cancel-replace-btn" class="action-btn secondary">取消</button>
            </div>
        `;

        const spiritList = document.getElementById('replace-spirit-list');
        this.game.player.ownedSpirits.forEach(spirit => {
            const card = document.createElement('div');
            card.className = 'replace-spirit-card';
            card.innerHTML = `
                <div class="spirit-avatar">${spirit.icon}</div>
                <div class="spirit-name">${spirit.name}</div>
                <div class="spirit-level">Lv.${spirit.level}</div>
                <div class="spirit-element">${ELEMENTS[spirit.element].name}</div>
            `;
            card.addEventListener('click', () => this.confirmReplaceSpirit(spirit, newSpirit));
            spiritList.appendChild(card);
        });

        document.getElementById('cancel-replace-btn').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.classList.add('active');
    }

    confirmReplaceSpirit(oldSpirit, newSpirit) {
        const spiritId = newSpirit.id.toString();

        this.game.player.fragments[spiritId] -= 3;
        if (this.game.player.fragments[spiritId] <= 0) {
            delete this.game.player.fragments[spiritId];
        }

        // 保存被替换精灵的信息到游戏数据
        this.game.dataManager.saveReplacedSpirit(oldSpirit);

        const spiritCopy = createSpiritCopy(newSpirit);
        calculateStats(spiritCopy);
        spiritCopy.currentHp = spiritCopy.maxHp;

        const index = this.game.player.ownedSpirits.findIndex(s => s.id === oldSpirit.id);
        this.game.player.ownedSpirits[index] = spiritCopy;

        const battleIndex = this.game.player.battleTeam.findIndex(s => s.id === oldSpirit.id);
        if (battleIndex !== -1) {
            this.game.player.battleTeam[battleIndex] = spiritCopy;
        }

        // 保存新精灵的初始数据
        this.game.dataManager.saveSpiritInitialData(spiritCopy);

        document.getElementById('replace-spirit-modal').classList.remove('active');
        this.game.uiManager.updateMainScreen();
        this.game.uiManager.showToast(`已将 ${oldSpirit.name} 替换为 ${newSpirit.name}！`, 'success');
    }
}

window.SpiritManager = SpiritManager;
