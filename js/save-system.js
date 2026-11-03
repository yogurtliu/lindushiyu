class SaveSystem {
    constructor(game) {
        this.game = game;
        this.battleRecords = [];
    }

    saveGame(slotIndex = null) {
        if (slotIndex === null) {
            this.showSaveSlotScreen();
            return;
        }

        try {
            const saveData = {
                player: {
                    gold: this.game.player.gold,
                    wins: this.game.player.wins,
                    losses: this.game.player.losses,
                    ownedSpirits: this.game.player.ownedSpirits,
                    fragments: this.game.player.fragments,
                    battleTeam: this.game.player.battleTeam,
                    inventory: this.game.player.inventory,
                    equipment: this.game.player.equipment,
                    shopEquipment: this.game.player.shopEquipment
                },
                timestamp: new Date().toISOString(),
                version: '1.1.3'
            };

            const jsonData = JSON.stringify(saveData);
            localStorage.setItem(`lindushiyu_save_${slotIndex}`, jsonData);
            this.game.uiManager.showToast(`游戏已保存到存档槽 ${slotIndex}！`, 'success');
        } catch (error) {
            console.error('保存游戏失败:', error);
            this.game.uiManager.showToast('保存游戏失败，请重试！', 'error');
        }
    }

    autoSave() {
        try {
            const saveData = {
                player: {
                    gold: this.game.player.gold,
                    wins: this.game.player.wins,
                    losses: this.game.player.losses,
                    ownedSpirits: this.game.player.ownedSpirits,
                    fragments: this.game.player.fragments,
                    battleTeam: this.game.player.battleTeam,
                    inventory: this.game.player.inventory,
                    equipment: this.game.player.equipment,
                    shopEquipment: this.game.player.shopEquipment
                },
                timestamp: new Date().toISOString(),
                version: '1.1.3'
            };

            const jsonData = JSON.stringify(saveData);
            localStorage.setItem('lindushiyu_save_auto', jsonData);
        } catch (error) {
            console.error('自动保存失败:', error);
        }
    }

    showSaveSlotScreen() {
        const slotsContainer = this.game.uiManager.elements.saveSlots;
        slotsContainer.innerHTML = '';

        const autoSave = localStorage.getItem('lindushiyu_save_auto');
        const autoSlot = this.createSlotElement(0, '自动存档', autoSave, true);
        slotsContainer.appendChild(autoSlot);

        for (let i = 1; i <= 2; i++) {
            const saveData = localStorage.getItem(`lindushiyu_save_${i}`);
            const slot = this.createSlotElement(i, `存档槽 ${i}`, saveData, false);
            slotsContainer.appendChild(slot);
        }

        this.game.uiManager.showScreen('saveSlot');
    }

    createSlotElement(index, label, saveData, isAuto) {
        const slot = document.createElement('div');
        slot.className = 'save-slot';
        slot.style.cursor = isAuto ? 'default' : 'pointer';

        if (saveData) {
            const data = JSON.parse(saveData);
            const date = new Date(data.timestamp);
            
            // 生成精灵头像和等级显示
            let spiritsHtml = '';
            if (data.player.ownedSpirits && data.player.ownedSpirits.length > 0) {
                spiritsHtml = '<div class="slot-spirits">';
                data.player.ownedSpirits.slice(0, 5).forEach(spirit => {
                    spiritsHtml += `<div class="slot-spirit" title="${spirit.name} Lv.${spirit.level}">
                        <span class="spirit-icon">${spirit.icon}</span>
                        <span class="spirit-level">${spirit.level}</span>
                    </div>`;
                });
                if (data.player.ownedSpirits.length > 5) {
                    spiritsHtml += `<div class="slot-spirit more" title="还有 ${data.player.ownedSpirits.length - 5} 个精灵">+${data.player.ownedSpirits.length - 5}</div>`;
                }
                spiritsHtml += '</div>';
            }
            
            slot.innerHTML = `
                <div class="slot-info">
                    <div class="slot-name">${label}</div>
                    <div class="slot-details">
                        精灵: ${data.player.ownedSpirits.length} | 金币: ${data.player.gold}
                    </div>
                    ${spiritsHtml}
                    <div class="slot-time">${date.toLocaleString()}</div>
                </div>
                ${isAuto ? '' : '<div class="save-indicator">点击保存</div>'}
            `;
        } else {
            slot.innerHTML = `
                <div class="slot-info">
                    <div class="slot-name">${label}</div>
                    <div class="slot-details">空存档槽</div>
                </div>
                ${isAuto ? '' : '<div class="save-indicator">点击保存</div>'}
            `;
        }

        // 绑定整个存档槽的点击事件
        if (!isAuto) {
            slot.addEventListener('click', () => {
                console.log('存档槽被点击，槽位:', index);
                this.saveToSlot(index);
            });
        }

        return slot;
    }

    saveToSlot(slotIndex) {
        console.log('开始保存到槽位:', slotIndex);
        this.saveGame(slotIndex);
        console.log('保存完成，返回主界面');
        this.game.uiManager.showScreen('main');
    }

    loadGame() {
        this.showLoadSlotScreen();
    }

    showLoadSlotScreen() {
        const slotsContainer = this.game.uiManager.elements.loadSlots;
        slotsContainer.innerHTML = '';

        const autoSave = localStorage.getItem('lindushiyu_save_auto');
        const autoSlot = this.createLoadSlotElement(0, '自动存档', autoSave);
        slotsContainer.appendChild(autoSlot);

        for (let i = 1; i <= 2; i++) {
            const saveData = localStorage.getItem(`lindushiyu_save_${i}`);
            const slot = this.createLoadSlotElement(i, `存档槽 ${i}`, saveData);
            slotsContainer.appendChild(slot);
        }

        this.game.uiManager.showScreen('loadSlot');
    }

    createLoadSlotElement(index, label, saveData) {
        const slot = document.createElement('div');
        slot.className = 'save-slot';
        slot.style.cursor = saveData ? 'pointer' : 'default';

        if (saveData) {
            const data = JSON.parse(saveData);
            const date = new Date(data.timestamp);
            
            // 生成精灵头像和等级显示
            let spiritsHtml = '';
            if (data.player.ownedSpirits && data.player.ownedSpirits.length > 0) {
                spiritsHtml = '<div class="slot-spirits">';
                data.player.ownedSpirits.slice(0, 5).forEach(spirit => {
                    spiritsHtml += `<div class="slot-spirit" title="${spirit.name} Lv.${spirit.level}">
                        <span class="spirit-icon">${spirit.icon}</span>
                        <span class="spirit-level">${spirit.level}</span>
                    </div>`;
                });
                if (data.player.ownedSpirits.length > 5) {
                    spiritsHtml += `<div class="slot-spirit more" title="还有 ${data.player.ownedSpirits.length - 5} 个精灵">+${data.player.ownedSpirits.length - 5}</div>`;
                }
                spiritsHtml += '</div>';
            }
            
            slot.innerHTML = `
                <div class="slot-info">
                    <div class="slot-name">${label}</div>
                    <div class="slot-details">
                        精灵: ${data.player.ownedSpirits.length} | 金币: ${data.player.gold}
                    </div>
                    ${spiritsHtml}
                    <div class="slot-time">${date.toLocaleString()}</div>
                </div>
                <div class="load-indicator">点击读取</div>
            `;
        } else {
            slot.innerHTML = `
                <div class="slot-info">
                    <div class="slot-name">${label}</div>
                    <div class="slot-details">空存档槽</div>
                </div>
                <div class="load-indicator disabled">无法读取</div>
            `;
        }

        // 绑定整个存档槽的点击事件
        if (saveData) {
            slot.addEventListener('click', () => {
                console.log('读取槽被点击，槽位:', index);
                this.loadFromSlot(index);
            });
        }

        return slot;
    }

    loadFromSlot(slotIndex) {
        const key = slotIndex === 0 ? 'lindushiyu_save_auto' : `lindushiyu_save_${slotIndex}`;
        const saveData = localStorage.getItem(key);

        if (!saveData) {
            this.game.uiManager.showToast('存档不存在！', 'error');
            return;
        }

        try {
            const data = JSON.parse(saveData);

            this.game.player = {
                gold: data.player.gold,
                wins: data.player.wins,
                losses: data.player.losses,
                ownedSpirits: data.player.ownedSpirits,
                fragments: data.player.fragments,
                battleTeam: data.player.battleTeam,
                inventory: data.player.inventory,
                battleRecords: [],
                equipment: data.player.equipment || [],
                shopEquipment: data.player.shopEquipment || []
            };

            // 从数据表中更新精灵的最新属性
            this.game.player.ownedSpirits.forEach(spirit => {
                // 从基础数据表恢复稀有度和潜力值
                const baseSpirit = ALL_SPIRITS_WITH_RARITY.find(s => s.id === spirit.id);
                if (baseSpirit) {
                    spirit.rarity = baseSpirit.rarity;
                    spirit.potential = baseSpirit.potential;
                    spirit.baseAtk = baseSpirit.baseAtk;
                    spirit.baseDef = baseSpirit.baseDef;
                    spirit.baseHp = baseSpirit.baseHp;
                    spirit.baseMp = baseSpirit.baseMp;
                    spirit.baseCritRate = baseSpirit.baseCritRate;
                    spirit.baseCritDamage = baseSpirit.baseCritDamage;
                    spirit.baseSpeed = baseSpirit.baseSpeed;
                    spirit.baseAccuracy = baseSpirit.baseAccuracy;
                    
                    // 确保新四个属性存在，如果不存在则使用基础值
                    if (spirit.critRate === undefined) {
                        spirit.critRate = baseSpirit.baseCritRate;
                    }
                    if (spirit.critDamage === undefined) {
                        spirit.critDamage = baseSpirit.baseCritDamage;
                    }
                    if (spirit.speed === undefined) {
                        spirit.speed = baseSpirit.baseSpeed;
                    }
                    if (spirit.accuracy === undefined) {
                        spirit.accuracy = baseSpirit.baseAccuracy;
                    }
                }
                
                const latestStats = this.game.dataManager.getSpiritLatestStats(spirit.id);
                if (latestStats) {
                    spirit.level = latestStats.level;
                    spirit.atk = latestStats.atk;
                    spirit.def = latestStats.def;
                    spirit.maxHp = latestStats.maxHp;
                    spirit.maxMp = latestStats.maxMp;
                    // 如果 latestStats 中没有新四个属性，则使用 calculateStats 计算
                    if (latestStats.critRate !== undefined) {
                        spirit.critRate = latestStats.critRate;
                    } else {
                        spirit.critRate = Math.min(50, spirit.baseCritRate + (spirit.level - 1) * 0.5);
                    }
                    if (latestStats.critDamage !== undefined) {
                        spirit.critDamage = latestStats.critDamage;
                    } else {
                        spirit.critDamage = Math.min(300, spirit.baseCritDamage + (spirit.level - 1) * 2.5);
                    }
                    if (latestStats.speed !== undefined) {
                        spirit.speed = latestStats.speed;
                    } else {
                        let levelBonus = 1 + (spirit.level - 1) * 0.1;
                        let evolutionBonus = spirit.evolved ? 1.5 : 1;
                        let awakeningBonus = spirit.awakened ? 2.0 : 1;
                        const potential = spirit.potential || 5;
                        let potentialBonus = 1.0;
                        if (potential >= 9) {
                            potentialBonus = 1.25;
                        } else if (potential >= 7) {
                            potentialBonus = 1.16;
                        } else if (potential >= 5) {
                            potentialBonus = 1.08;
                        }
                        let totalBonus = levelBonus * evolutionBonus * awakeningBonus * potentialBonus;
                        spirit.speed = Math.floor(spirit.baseSpeed * totalBonus);
                    }
                    if (latestStats.accuracy !== undefined) {
                        spirit.accuracy = latestStats.accuracy;
                    } else {
                        spirit.accuracy = Math.min(100, spirit.baseAccuracy + (spirit.level - 1) * 0.3);
                    }
                    spirit.skills = latestStats.skills;
                    
                    // 计算装备加成
                    const maxHpBonus = this.getEquipmentBonus(spirit, 'maxHp');
                    const maxMpBonus = this.getEquipmentBonus(spirit, 'maxMp');
                    
                    // 计算总最大值（基础值 + 装备加成）
                    const totalMaxHp = spirit.maxHp + maxHpBonus;
                    const totalMaxMp = spirit.maxMp + maxMpBonus;
                    
                    // 加载存档时，如果装备了增加生命值或魔力值的装备，自动回满到总值
                    if (maxHpBonus > 0) {
                        spirit.currentHp = totalMaxHp;
                    }
                    if (maxMpBonus > 0) {
                        spirit.currentMp = totalMaxMp;
                    }
                    
                    // 确保当前生命值和魔力值不超过总最大值
                    if (spirit.currentHp > totalMaxHp) {
                        spirit.currentHp = totalMaxHp;
                    }
                    if (spirit.currentMp > totalMaxMp) {
                        spirit.currentMp = totalMaxMp;
                    }
                } else {
                    // 如果没有找到记录，使用 calculateStats 计算属性
                    calculateStats(spirit);
                }
            });

            // 同步更新战斗队伍中的精灵属性
            this.game.player.battleTeam.forEach(spirit => {
                const ownedSpirit = this.game.player.ownedSpirits.find(s => s.id === spirit.id);
                if (ownedSpirit) {
                    spirit.level = ownedSpirit.level;
                    spirit.atk = ownedSpirit.atk;
                    spirit.def = ownedSpirit.def;
                    spirit.maxHp = ownedSpirit.maxHp;
                    spirit.maxMp = ownedSpirit.maxMp;
                    spirit.critRate = ownedSpirit.critRate;
                    spirit.critDamage = ownedSpirit.critDamage;
                    spirit.speed = ownedSpirit.speed;
                    spirit.accuracy = ownedSpirit.accuracy;
                    spirit.skills = ownedSpirit.skills;
                    
                    // 计算装备加成
                    const maxHpBonus = this.getEquipmentBonus(spirit, 'maxHp');
                    const maxMpBonus = this.getEquipmentBonus(spirit, 'maxMp');
                    
                    // 计算总最大值（基础值 + 装备加成）
                    const totalMaxHp = spirit.maxHp + maxHpBonus;
                    const totalMaxMp = spirit.maxMp + maxMpBonus;
                    
                    // 加载存档时，如果装备了增加生命值或魔力值的装备，自动回满到总值
                    if (maxHpBonus > 0) {
                        spirit.currentHp = totalMaxHp;
                    }
                    if (maxMpBonus > 0) {
                        spirit.currentMp = totalMaxMp;
                    }
                    
                    // 确保当前生命值和魔力值不超过总最大值
                    if (spirit.currentHp > totalMaxHp) {
                        spirit.currentHp = totalMaxHp;
                    }
                    if (spirit.currentMp > totalMaxMp) {
                        spirit.currentMp = totalMaxMp;
                    }
                }
            });
            
            // 清理player.equipment中的重复装备（根据id去重）
            const uniqueEquipment = [];
            const seenIds = new Set();
            this.game.player.equipment.forEach(equip => {
                if (!seenIds.has(equip.id)) {
                    seenIds.add(equip.id);
                    uniqueEquipment.push(equip);
                }
            });
            this.game.player.equipment = uniqueEquipment;
            
            // 从player.equipment中移除已装备的装备（避免重复）
            const equippedIds = new Set();
            this.game.player.ownedSpirits.forEach(spirit => {
                if (spirit.equipment) {
                    const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
                    slots.forEach(slot => {
                        const equip = spirit.equipment[slot];
                        if (equip) {
                            equip.equipped = true;
                            equip.equippedBy = spirit.id;
                            equippedIds.add(equip.id);
                        }
                    });
                }
            });
            
            // 只保留未装备的装备在player.equipment中
            this.game.player.equipment = this.game.player.equipment.filter(e => !equippedIds.has(e.id));

            // 检查并清理无用的游戏数据
            this.game.dataManager.checkAndCleanup();

            this.loadRecords();
            this.game.uiManager.updateMainScreen();
            this.game.uiManager.showScreen('main');
            this.game.uiManager.showToast('游戏读取成功！', 'success');
        } catch (e) {
            this.game.uiManager.showToast('存档损坏，无法读取！', 'error');
        }
    }

    saveBattleRecord(victory) {
        // 计算玩家队伍平均等级
        const playerLevel = this.game.player.battleTeam.length > 0 
            ? Math.floor(this.game.player.battleTeam.reduce((sum, s) => sum + s.level, 0) / this.game.player.battleTeam.length)
            : 1;
        
        const record = {
            timestamp: new Date().toISOString(),
            victory: victory,
            playerLevel: playerLevel,
            enemyCount: this.game.enemyTeam.length,
            enemyLevels: this.game.enemyTeam.map(s => s.level)
        };

        this.game.player.battleRecords.unshift(record);

        if (this.game.player.battleRecords.length > 50) {
            this.game.player.battleRecords.pop();
        }

        localStorage.setItem(`lindushiyu_records_${this.game.player.ownedSpirits[0]?.id || 'default'}`, JSON.stringify(this.game.player.battleRecords));
    }

    loadRecords() {
        const recordsKey = `lindushiyu_records_${this.game.player.ownedSpirits[0]?.id || 'default'}`;
        const savedRecords = localStorage.getItem(recordsKey);

        if (savedRecords) {
            try {
                this.game.player.battleRecords = JSON.parse(savedRecords);
            } catch (e) {
                this.game.player.battleRecords = [];
            }
        }
    }

    getEquipmentBonus(spirit, statName) {
        if (!spirit.equipment) return 0;

        let bonus = 0;
        const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];

        slots.forEach(slot => {
            const equip = spirit.equipment[slot];
            if (equip && equip.stats) {
                equip.stats.forEach(stat => {
                    if (stat.stat === statName) {
                        bonus += stat.value;
                    }
                });
            }
        });

        return bonus;
    }

    showRecords() {
        const recordsList = this.game.uiManager.elements.recordsList;
        recordsList.innerHTML = '';

        if (this.game.player.battleRecords.length === 0) {
            recordsList.innerHTML = '<p style="color: #bdc3c7; text-align: center;">暂无战斗记录</p>';
        } else {
            this.game.player.battleRecords.forEach(record => {
                const div = document.createElement('div');
                div.className = `record-item ${record.victory ? 'victory' : 'defeat'}`;

                const date = new Date(record.timestamp);
                div.innerHTML = `
                    <div class="record-result">${record.victory ? '胜利' : '失败'}</div>
                    <div class="record-details">
                        <div>玩家等级: ${record.playerLevel}</div>
                        <div>敌方等级: ${record.enemyLevels.join(', ')}</div>
                        <div class="record-time">${date.toLocaleString()}</div>
                    </div>
                `;
                recordsList.appendChild(div);
            });
        }

        this.game.uiManager.showScreen('records');
    }
}

window.SaveSystem = SaveSystem;
