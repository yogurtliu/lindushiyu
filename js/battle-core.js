class BattleCore {
    constructor(game) {
        this.game = game;
    }

    startBattle() {
        console.log('开始执行 battle-core.js 中的 startBattle 方法');
        try {
            console.log('开始生成敌方队伍');
            this.game.enemyTeam = this.generateEnemyTeam();
            console.log('敌方队伍已生成，数量：', this.game.enemyTeam.length);
            
            // 从主页面同步精灵属性到战斗队伍
            console.log('开始同步主页面精灵属性到战斗队伍');
            this.game.player.battleTeam.forEach(battleSpirit => {
                // 从 ownedSpirits 中找到对应的精灵，直接复制所有属性
                const ownedSpirit = this.game.player.ownedSpirits.find(s => s.id === battleSpirit.id);
                if (ownedSpirit) {
                    // 保存当前生命值和魔力值比例
                    const hpBonus = this.getEquipmentBonus(ownedSpirit, 'maxHp');
                    const mpBonus = this.getEquipmentBonus(ownedSpirit, 'maxMp');
                    const totalMaxHp = ownedSpirit.maxHp + hpBonus;
                    const totalMaxMp = ownedSpirit.maxMp + mpBonus;
                    const hpPercent = totalMaxHp > 0 ? ownedSpirit.currentHp / totalMaxHp : 1;
                    
                    // 复制所有属性
                    battleSpirit.level = ownedSpirit.level;
                    battleSpirit.atk = ownedSpirit.atk;
                    battleSpirit.def = ownedSpirit.def;
                    battleSpirit.maxHp = ownedSpirit.maxHp;
                    battleSpirit.maxMp = ownedSpirit.maxMp;
                    battleSpirit.currentHp = ownedSpirit.currentHp;
                    battleSpirit.currentMp = ownedSpirit.currentMp;
                    battleSpirit.exp = ownedSpirit.exp;
                    battleSpirit.skills = ownedSpirit.skills;
                    battleSpirit.equipment = ownedSpirit.equipment;
                    battleSpirit.evolved = ownedSpirit.evolved;
                    battleSpirit.awakened = ownedSpirit.awakened;
                    battleSpirit.rarity = ownedSpirit.rarity;
                    battleSpirit.potential = ownedSpirit.potential;
                    battleSpirit.critRate = ownedSpirit.critRate;
                    battleSpirit.critDamage = ownedSpirit.critDamage;
                    battleSpirit.speed = ownedSpirit.speed;
                    battleSpirit.accuracy = ownedSpirit.accuracy;
                    
                    // 重新计算装备加成后的总最大值
                    const newHpBonus = this.getEquipmentBonus(battleSpirit, 'maxHp');
                    const newMpBonus = this.getEquipmentBonus(battleSpirit, 'maxMp');
                    const newTotalMaxHp = battleSpirit.maxHp + newHpBonus;
                    const newTotalMaxMp = battleSpirit.maxMp + newMpBonus;
                    
                    // 根据新的总最大生命值调整当前生命值（保持比例）
                    battleSpirit.currentHp = Math.floor(newTotalMaxHp * hpPercent);
                    
                    // 战斗中初始魔力值为总魔力值的20%
                    battleSpirit.currentMp = Math.floor(newTotalMaxMp * 0.2);
                }
            });
            console.log('战斗队伍精灵属性已同步');
            
            console.log('开始初始化战斗状态');
            this.game.battleState = {
                round: 1,
                playerCurrentIndex: 0,
                enemyCurrentIndex: 0,
                phase: 'select',
                playerAction: null,
                enemyAction: null,
                selectedSkill: null,
                selectedItem: null,
                defendingSpirits: new Set(),
                buffs: {}
            };
            console.log('战斗状态已初始化');

            this.game.isAutoBattle = false;
            console.log('自动战斗已关闭');

            console.log('开始更新回合数');
            this.game.uiManager.elements.battleRound.textContent = '1';
            console.log('回合数已设置');
            console.log('开始清空战斗日志');
            this.game.uiManager.elements.battleLog.innerHTML = '';
            console.log('战斗日志已清空');

            console.log('开始添加战斗日志');
            this.addBattleLog('战斗开始！', 'buff');
            console.log('战斗日志已添加');

            console.log('开始渲染战斗队伍');
            this.renderBattleTeams();
            console.log('战斗队伍已渲染');
            console.log('开始显示战斗屏幕');
            this.game.uiManager.showScreen('battle');
            console.log('战斗屏幕已显示');
            console.log('开始开始回合');
            this.startTurn();
            console.log('回合已开始');
        } catch (error) {
            console.error('startBattle 方法出错：', error);
        }
    }

    generateEnemyTeam() {
        const team = [];
        const count = this.game.player.battleTeam.length;

        for (let i = 0; i < count; i++) {
            // 使用 ALL_SPIRITS 而不是 ALL_SPIRITS_WITH_RARITY，避免稀有度相关字段
            const randomSpirit = ALL_SPIRITS[Math.floor(Math.random() * ALL_SPIRITS.length)];
            const enemySpirit = createSpiritCopy(randomSpirit);

            // 确保敌方精灵没有稀有度字段
            delete enemySpirit.rarity;
            // 设置默认潜力值，避免计算潜力加成时出错
            if (!enemySpirit.potential) {
                enemySpirit.potential = 5;
            }

            const avgLevel = Math.floor(this.game.player.battleTeam.reduce((sum, s) => sum + s.level, 0) / this.game.player.battleTeam.length);
            enemySpirit.level = Math.max(1, avgLevel + Math.floor(Math.random() * 3) - 1);

            calculateStats(enemySpirit);
            enemySpirit.currentHp = enemySpirit.maxHp;
            // 战斗中初始魔力值为总魔力值的20%
            enemySpirit.currentMp = Math.floor(enemySpirit.maxMp * 0.2);

            team.push(enemySpirit);
        }

        return team;
    }

    getCurrentPlayerSpirit() {
        while (this.game.battleState.playerCurrentIndex < this.game.player.battleTeam.length) {
            const spirit = this.game.player.battleTeam[this.game.battleState.playerCurrentIndex];
            if (spirit.currentHp > 0) {
                return spirit;
            }
            this.game.battleState.playerCurrentIndex++;
        }
        return null;
    }

    getCurrentEnemySpirit() {
        while (this.game.battleState.enemyCurrentIndex < this.game.enemyTeam.length) {
            const spirit = this.game.enemyTeam[this.game.battleState.enemyCurrentIndex];
            if (spirit.currentHp > 0) {
                return spirit;
            }
            this.game.battleState.enemyCurrentIndex++;
        }
        return null;
    }

    findNextAliveSpirit(isPlayer) {
        const team = isPlayer ? this.game.player.battleTeam : this.game.enemyTeam;
        
        // 检查队伍是否为空
        if (!team || team.length === 0) {
            return;
        }
        
        let currentIndex = isPlayer ? this.game.battleState.playerCurrentIndex : this.game.battleState.enemyCurrentIndex;
        
        // 重置索引到有效范围
        if (currentIndex >= team.length || currentIndex === undefined) {
            currentIndex = 0;
        }
        
        // 从当前索引开始查找存活的精灵
        for (let i = 0; i < team.length; i++) {
            const checkIndex = (currentIndex + i) % team.length;
            if (team[checkIndex].currentHp > 0) {
                if (isPlayer) {
                    this.game.battleState.playerCurrentIndex = checkIndex;
                } else {
                    this.game.battleState.enemyCurrentIndex = checkIndex;
                }
                return;
            }
        }
    }

    startTurn() {
        this.game.battleState.phase = 'select';
        this.game.battleState.playerAction = null;
        this.game.battleState.enemyAction = null;
        this.game.battleState.selectedSkill = null;
        this.game.battleState.selectedItem = null;

        // 跳过已死亡的精灵，找到下一个存活的精灵（如果到末尾则从头开始找）
        this.findNextAliveSpirit(true);
        this.findNextAliveSpirit(false);

        let playerSpirit = this.getCurrentPlayerSpirit();
        let enemySpirit = this.getCurrentEnemySpirit();

        if (!playerSpirit || !enemySpirit) {
            this.checkBattleEnd();
            return;
        }

        // 检查控制效果
        const playerControlled = this.checkControlEffects(true);
        const enemyControlled = this.checkControlEffects(false);

        // 如果玩家精灵被控制，自动跳过回合
        if (playerControlled) {
            this.addBattleLog(`我方 ${playerSpirit.name} 被控制，无法行动！`, 'debuff');
            this.game.battleState.playerAction = 'skip';
        }

        // 如果敌方精灵被控制，自动跳过回合
        if (enemyControlled) {
            this.addBattleLog(`敌方 ${enemySpirit.name} 被控制，无法行动！`, 'debuff');
            this.game.battleState.enemyAction = 'skip';
        }

        // 重新获取精灵（可能在检查控制效果时被更新）
        playerSpirit = this.getCurrentPlayerSpirit();
        enemySpirit = this.getCurrentEnemySpirit();

        if (!playerSpirit || !enemySpirit) {
            this.checkBattleEnd();
            return;
        }

        if (!playerControlled && !enemyControlled) {
            this.addBattleLog(`我方 ${playerSpirit.name} 和敌方 ${enemySpirit.name} 准备行动`, 'buff');
        }

        this.renderBattleTeams();
        this.updateBattleButtons(true);

        this.ai.selectEnemyAction();

        if (this.game.isAutoBattle) {
            this.ai.performAutoAction();
        }
    }

    checkControlEffects(isPlayer) {
        const team = isPlayer ? this.game.player.battleTeam : this.game.enemyTeam;
        const currentIndex = isPlayer ? this.game.battleState.playerCurrentIndex : this.game.battleState.enemyCurrentIndex;
        const spirit = team[currentIndex];
        
        if (!spirit || spirit.currentHp <= 0) return false;

        const key = isPlayer ? `player-${currentIndex}` : `enemy-${currentIndex}`;
        
        if (this.game.battleState.buffs && this.game.battleState.buffs[key]) {
            // 检查是否有冰冻效果
            const hasFreeze = this.game.battleState.buffs[key].some(buff => buff.type === 'freeze');
            
            // 检查是否有其他控制效果（眩晕和束缚）
            const controlEffects = ['stun', 'bind'];
            const hasOtherControlEffect = this.game.battleState.buffs[key].some(buff => controlEffects.includes(buff.type));
            
            if (hasFreeze || hasOtherControlEffect) {
                // 移除一次性控制效果（眩晕和束缚），减少它们的持续时间
                this.game.battleState.buffs[key] = this.game.battleState.buffs[key].filter(buff => {
                    if (controlEffects.includes(buff.type)) {
                        buff.duration--;
                        return buff.duration > 0;
                    }
                    return true;
                });
                return true;
            }
        }
        
        return false;
    }

    endTurn() {
        if (this.checkBattleEnd()) return;

        // 检查当前索引位置的精灵是否死亡，如果是则移动到下一个（支持循环查找）
        this.findNextAliveSpirit(true);
        this.findNextAliveSpirit(false);

        if (!this.getCurrentPlayerSpirit() || !this.getCurrentEnemySpirit()) {
            this.checkBattleEnd();
            return;
        }

        // 处理buff效果（持续伤害、恢复等）
        this.processBuffEffects();

        if (this.game.battleState.buffs) {
            Object.keys(this.game.battleState.buffs).forEach(key => {
                this.game.battleState.buffs[key] = this.game.battleState.buffs[key].filter(buff => {
                    buff.duration--;
                    return buff.duration > 0;
                });

                if (this.game.battleState.buffs[key].length === 0) {
                    delete this.game.battleState.buffs[key];
                }
            });
        }

        this.game.battleState.round++;
        this.game.battleState.defendingSpirits.clear();

        // 每回合为所有存活的精灵恢复10点魔力值
        this.regenerateMpForAllSpirits();

        this.game.uiManager.elements.battleRound.textContent = this.game.battleState.round;
        this.addBattleLog(`--- 第 ${this.game.battleState.round} 回合 ---`, 'buff');

        this.startTurn();
    }

    regenerateMpForAllSpirits() {
        // 为玩家队伍的存活精灵恢复魔力值
        this.game.player.battleTeam.forEach(spirit => {
            if (spirit.currentHp > 0) {
                const mpRegen = 10;
                const oldMp = spirit.currentMp;
                spirit.currentMp = Math.min(spirit.maxMp, spirit.currentMp + mpRegen);
                const actualRegen = spirit.currentMp - oldMp;
                if (actualRegen > 0) {
                    this.addBattleLog(`${spirit.name} 恢复 ${actualRegen} 点魔力值`, 'buff');
                }
            }
        });

        // 为敌方队伍的存活精灵恢复魔力值
        this.game.enemyTeam.forEach(spirit => {
            if (spirit.currentHp > 0) {
                const mpRegen = 10;
                spirit.currentMp = Math.min(spirit.maxMp, spirit.currentMp + mpRegen);
            }
        });
    }

    processBuffEffects() {
        if (!this.game.battleState.buffs) return;

        Object.keys(this.game.battleState.buffs).forEach(key => {
            const [team, index] = key.split('-');
            const spirit = team === 'player' ? 
                this.game.player.battleTeam[parseInt(index)] : 
                this.game.enemyTeam[parseInt(index)];
            
            if (!spirit || spirit.currentHp <= 0) return;

            this.game.battleState.buffs[key].forEach(buff => {
                switch (buff.type) {
                    case 'poison':
                        const poisonDamage = buff.damage || Math.floor(spirit.maxHp * 0.05);
                        spirit.currentHp = Math.max(0, spirit.currentHp - poisonDamage);
                        this.addBattleLog(`${spirit.name} 受到 ${poisonDamage} 点中毒伤害！`, 'debuff');
                        break;
                    case 'burn':
                        const burnDamage = buff.damage || Math.floor(spirit.maxHp * 0.08);
                        spirit.currentHp = Math.max(0, spirit.currentHp - burnDamage);
                        this.addBattleLog(`${spirit.name} 受到 ${burnDamage} 点烧伤伤害！`, 'debuff');
                        break;
                    case 'leech':
                        const leechDamage = buff.damage || Math.floor(spirit.maxHp * 0.04);
                        spirit.currentHp = Math.max(0, spirit.currentHp - leechDamage);
                        this.addBattleLog(`${spirit.name} 被寄生吸取 ${leechDamage} 点生命！`, 'debuff');
                        break;
                    case 'regen':
                        const regenAmount = buff.heal || Math.floor(spirit.maxHp * 0.1);
                        const oldHp = spirit.currentHp;
                        spirit.currentHp = Math.min(spirit.maxHp, spirit.currentHp + regenAmount);
                        const actualRegen = spirit.currentHp - oldHp;
                        if (actualRegen > 0) {
                            this.addBattleLog(`${spirit.name} 持续恢复 ${actualRegen} 点生命！`, 'heal');
                        }
                        break;
                }
            });
        });
    }

    // 根据精灵对象查找其在战斗状态中的 buff key（player-N / enemy-N）
    getSpiritKey(spirit) {
        const playerIndex = this.game.player.battleTeam.indexOf(spirit);
        if (playerIndex >= 0) return `player-${playerIndex}`;
        const enemyIndex = this.game.enemyTeam.indexOf(spirit);
        if (enemyIndex >= 0) return `enemy-${enemyIndex}`;
        return null;
    }

    // 为指定精灵添加 buff（兼容 effect/type 两种字段写法）
    addBuffToSpirit(spirit, buff) {
        const key = this.getSpiritKey(spirit);
        if (!key || !buff) return;

        const normalizedBuff = Object.assign({}, buff);
        if (normalizedBuff.effect && !normalizedBuff.type) {
            normalizedBuff.type = normalizedBuff.effect;
        }

        if (!this.game.battleState.buffs) {
            this.game.battleState.buffs = {};
        }
        if (!this.game.battleState.buffs[key]) {
            this.game.battleState.buffs[key] = [];
        }
        this.game.battleState.buffs[key].push(normalizedBuff);
        this.addBattleLog(`${spirit.name} 获得了 ${normalizedBuff.name || normalizedBuff.type} 效果！`, 'buff');
    }

    // 计算伤害时考虑伤害减免效果
    calculateDamage(attacker, defender, baseDamage) {
        let finalDamage = baseDamage;
        
        // 检查防御方是否有伤害减免效果（支持玩家与敌方目标）
        const defenderKey = this.getSpiritKey(defender);
        if (defenderKey && this.game.battleState.buffs && this.game.battleState.buffs[defenderKey]) {
            this.game.battleState.buffs[defenderKey].forEach(buff => {
                if (buff.type === 'damage_reduction') {
                    finalDamage = Math.floor(finalDamage * (1 - buff.value));
                }
            });
        }
        
        return finalDamage;
    }

    // 处理伤害反弹效果（支持玩家与敌方目标）
    processDamageReflection(attacker, defender, damage) {
        const defenderKey = this.getSpiritKey(defender);
        if (defenderKey && this.game.battleState.buffs && this.game.battleState.buffs[defenderKey]) {
            this.game.battleState.buffs[defenderKey].forEach(buff => {
                if (buff.type === 'reflect_damage') {
                    const reflectDamage = Math.floor(damage * buff.value);
                    attacker.currentHp = Math.max(0, attacker.currentHp - reflectDamage);
                    this.addBattleLog(`${defender.name} 反弹 ${reflectDamage} 点伤害给 ${attacker.name}！`, 'buff');
                }
            });
        }
    }

    isTeamDead(team) {
        return team.every(s => s.currentHp <= 0);
    }

    checkBattleEnd() {
        if (this.isTeamDead(this.game.enemyTeam)) {
            this.endBattle(true);
            return true;
        }
        if (this.isTeamDead(this.game.player.battleTeam)) {
            this.endBattle(false);
            return true;
        }
        return false;
    }

    endBattle(victory) {
        this.game.isAutoBattle = false;

        const expGain = calculateBattleExp(this.game.player.battleTeam, this.game.enemyTeam, victory);

        if (victory) {
            this.game.player.wins++;
            const goldGain = 20 + Math.floor(Math.random() * 30);

            this.game.player.gold += goldGain;

            const expPerSpirit = Math.floor(expGain / this.game.player.battleTeam.length);
            this.game.player.battleTeam.forEach(spirit => {
                const oldLevel = spirit.level;
                spirit.exp += expPerSpirit;

                const levelUpResult = levelUp(spirit);
                if (levelUpResult.leveledUp) {
                    this.addBattleLog(`${spirit.name} 升级了！当前等级：${spirit.level}`, 'buff');
                    this.ui.checkSkillLearn(spirit, oldLevel);
                    // 保存精灵升级记录
                    this.game.dataManager.saveSpiritLevelUp(spirit, oldLevel);
                    
                    // 保存精灵进化记录
                    if (levelUpResult.evolved) {
                        this.addBattleLog(`${spirit.name} 进化了！`, 'buff');
                        this.game.dataManager.saveSpiritEvolution(spirit);
                    }
                    
                    // 保存精灵觉醒记录
                    if (levelUpResult.awakened) {
                        this.addBattleLog(`${spirit.name} 觉醒了！`, 'buff');
                        this.game.dataManager.saveSpiritEvolution(spirit);
                    }
                }
                
                // 重新计算精灵属性（基础属性，不包含装备加成）
                this.recalculateStatsWithEquipment(spirit);
                
                // 计算装备加成
                const hpBonus = this.getEquipmentBonus(spirit, 'maxHp');
                const mpBonus = this.getEquipmentBonus(spirit, 'maxMp');
                
                // 回满生命值和魔力值（总值 = 基础值 + 装备加成）
                spirit.currentHp = spirit.maxHp + hpBonus;
                spirit.currentMp = spirit.maxMp + mpBonus;
                
                // 保存精灵经验值变更
                this.game.dataManager.saveSpiritExp(spirit, expPerSpirit);
            });

            this.game.saveSystem.saveBattleRecord(true);

            const fragments = this.generateFragments();
            
            // 将碎片添加到玩家的碎片库存
            fragments.forEach(fragment => {
                if (!this.game.player.fragments[fragment.id]) {
                    this.game.player.fragments[fragment.id] = {
                        id: fragment.id,
                        name: fragment.name,
                        icon: fragment.icon,
                        type: fragment.type,
                        rarity: fragment.rarity,
                        potential: fragment.potential,
                        count: 0,
                        firstObtained: Date.now()
                    };
                }
                this.game.player.fragments[fragment.id].count++;
            });
            
            let fragmentText = '';
            if (fragments.length > 0) {
                fragmentText = `<br><br>获得碎片：<br>${fragments.map(f => `${f.icon} ${f.name}`).join('<br>')}`;
            }

            // 装备掉落（5%概率）
            let equipmentDropText = '';
            if (Math.random() < 0.05) {
                const droppedEquipment = generateRandomEquipment();
                this.game.player.equipment.push(droppedEquipment);
                const rarityInfo = EQUIPMENT_RARITIES[droppedEquipment.rarity];
                equipmentDropText = `<br><br><div class="equipment-drop">
                    <p>🎉 装备掉落！</p>
                    <p>${droppedEquipment.icon} ${droppedEquipment.name} <span style="color: ${rarityInfo.color}">[${rarityInfo.name}]</span></p>
                    <p style="font-size: 0.9em; color: #bdc3c7;">${droppedEquipment.stats.map(s => `${s.name}+${s.value}`).join(', ')}</p>
                </div>`;
            }

            this.game.uiManager.elements.resultTitle.textContent = '胜利！';
            this.game.uiManager.elements.resultTitle.style.color = '#2ecc71';
            this.game.uiManager.elements.resultDetails.innerHTML = `
                <p>获得经验值：${expGain}</p>
                <p>获得金币：${goldGain}</p>
                ${fragmentText}
                ${equipmentDropText}
            `;
        } else {
            this.game.player.losses++;

            const expPerSpirit = Math.floor(expGain / this.game.player.battleTeam.length);
            this.game.player.battleTeam.forEach(spirit => {
                const oldLevel = spirit.level;
                spirit.exp += expPerSpirit;

                const levelUpResult = levelUp(spirit);
                if (levelUpResult.leveledUp) {
                    this.addBattleLog(`${spirit.name} 升级了！当前等级：${spirit.level}`, 'buff');
                    this.ui.checkSkillLearn(spirit, oldLevel);
                    // 保存精灵升级记录
                    this.game.dataManager.saveSpiritLevelUp(spirit, oldLevel);
                    
                    // 保存精灵进化记录
                    if (levelUpResult.evolved) {
                        this.addBattleLog(`${spirit.name} 进化了！`, 'buff');
                        this.game.dataManager.saveSpiritEvolution(spirit);
                    }
                    
                    // 保存精灵觉醒记录
                    if (levelUpResult.awakened) {
                        this.addBattleLog(`${spirit.name} 觉醒了！`, 'buff');
                        this.game.dataManager.saveSpiritEvolution(spirit);
                    }
                }
                
                // 重新计算精灵属性（基础属性，不包含装备加成）
                this.recalculateStatsWithEquipment(spirit);
                
                // 计算装备加成
                const hpBonus = this.getEquipmentBonus(spirit, 'maxHp');
                const mpBonus = this.getEquipmentBonus(spirit, 'maxMp');
                
                // 回满生命值和魔力值（总值 = 基础值 + 装备加成）
                spirit.currentHp = spirit.maxHp + hpBonus;
                spirit.currentMp = spirit.maxMp + mpBonus;
                
                // 保存精灵经验值变更
                this.game.dataManager.saveSpiritExp(spirit, expPerSpirit);
            });

            this.game.saveSystem.saveBattleRecord(false);

            this.game.uiManager.elements.resultTitle.textContent = '失败...';
            this.game.uiManager.elements.resultTitle.style.color = '#e74c3c';
            this.game.uiManager.elements.resultDetails.innerHTML = `
                <p>获得经验值：${expGain}</p>
                <p>不要气馁，继续挑战！</p>
            `;
        }

        this.game.saveSystem.autoSave();

        this.game.uiManager.showScreen('result');
        
        // 更新主页面，显示获得的碎片
        this.game.uiManager.updateMainScreen();
    }

    generateFragments() {
        const fragments = [];
        
        // 第一个碎片：已有碎片的精灵概率提升20%
        const firstSpirit = this.selectSpiritForFragment();
        const fragment = {
            id: firstSpirit.id,
            name: firstSpirit.name,
            icon: firstSpirit.icon,
            type: firstSpirit.element,
            rarity: firstSpirit.rarity,
            potential: firstSpirit.potential
        };
        fragments.push(fragment);
        
        // 30%概率获得第二个碎片
        if (Math.random() < 0.3) {
            const secondSpirit = this.selectSpiritForFragment();
            const anotherFragment = {
                id: secondSpirit.id,
                name: secondSpirit.name,
                icon: secondSpirit.icon,
                type: secondSpirit.element,
                rarity: secondSpirit.rarity,
                potential: secondSpirit.potential
            };
            fragments.push(anotherFragment);
        }
        
        return fragments;
    }
    
    selectSpiritForFragment() {
        // 获取玩家已有碎片的精灵ID列表
        const ownedFragmentIds = Object.keys(this.game.player.fragments).map(id => parseInt(id));
        
        if (ownedFragmentIds.length === 0) {
            // 如果没有碎片，完全随机
            return ALL_SPIRITS_WITH_RARITY[Math.floor(Math.random() * ALL_SPIRITS_WITH_RARITY.length)];
        }
        
        // 70%概率从已有碎片的精灵中选择（提升20%概率）
        // 30%概率完全随机
        if (Math.random() < 0.7) {
            // 从已有碎片的精灵中随机选择一个
            const randomId = ownedFragmentIds[Math.floor(Math.random() * ownedFragmentIds.length)];
            return ALL_SPIRITS_WITH_RARITY.find(s => s.id === randomId);
        } else {
            // 完全随机
            return ALL_SPIRITS_WITH_RARITY[Math.floor(Math.random() * ALL_SPIRITS_WITH_RARITY.length)];
        }
    }

    addBattleLog(message, type = 'normal') {
        const log = document.createElement('div');
        log.className = `battle-log-entry ${type}`;
        log.textContent = message;
        this.game.uiManager.elements.battleLog.appendChild(log);
        this.game.uiManager.elements.battleLog.scrollTop = this.game.uiManager.elements.battleLog.scrollHeight;
    }

    renderBattleTeams() {
        // 只渲染，不重新计算属性（属性在startBattle中已经计算好了）
        this.renderTeamInBattle(this.game.uiManager.elements.battleMyTeam, this.game.player.battleTeam, true);
        this.renderTeamInBattle(this.game.uiManager.elements.enemyTeam, this.game.enemyTeam, false);
    }

    // 重新计算精灵属性并添加装备加成
    recalculateStatsWithEquipment(spirit) {
        // 先计算基础属性（不包含装备加成）
        calculateStats(spirit);
        
        // 注意：spirit.maxHp/maxMp 保持为基础值
        // 装备加成通过 getEquipmentBonus 动态计算
        // 这里不修改 spirit.maxHp/maxMp，只计算当前生命值/魔力值的最大值
    }

    renderTeamInBattle(container, team, isPlayer) {
        container.innerHTML = '';

        const currentIndex = isPlayer ?
            this.game.battleState.playerCurrentIndex :
            this.game.battleState.enemyCurrentIndex;

        team.forEach((spirit, index) => {
            const card = document.createElement('div');
            card.className = 'team-spirit';
            card.dataset.element = spirit.element;

            if (index === currentIndex) {
                card.classList.add('active');
            }

            const element = ELEMENTS[spirit.element];

            const teamPrefix = isPlayer ? 'player' : 'enemy';
            const spiritKey = `${teamPrefix}-${index}`;
            let effectsHtml = '';
            
            if (this.game.battleState.buffs && this.game.battleState.buffs[spiritKey]) {
                const effectIcons = {
                    freeze: '❄️',
                    stun: '💫',
                    slow: '🐌',
                    poison: '☠️',
                    burn: '🔥',
                    bind: '⛓️',
                    blind: '👁️',
                    dodge: '💨',
                    speed: '⚡',
                    priority: '🎯',
                    hide: '👻',
                    reflect: '🛡️',
                    regen: '💚',
                    buff: '📈',
                    poison_all: '☠️',
                    freeze_all: '❄️',
                    leech: '🦟'
                };
                
                const effectNames = {
                    freeze: '冰冻',
                    stun: '眩晕',
                    slow: '减速',
                    poison: '中毒',
                    burn: '烧伤',
                    bind: '束缚',
                    blind: '致盲',
                    dodge: '闪避',
                    speed: '加速',
                    priority: '先手',
                    hide: '隐匿',
                    reflect: '反弹',
                    regen: '恢复',
                    buff: '增益',
                    poison_all: '中毒',
                    freeze_all: '冰冻',
                    leech: '吸血'
                };
                
                const uniqueEffects = {};
                this.game.battleState.buffs[spiritKey].forEach(buff => {
                    if (!uniqueEffects[buff.type]) {
                        uniqueEffects[buff.type] = buff.duration;
                    } else {
                        uniqueEffects[buff.type] = Math.max(uniqueEffects[buff.type], buff.duration);
                    }
                });
                
                Object.keys(uniqueEffects).forEach(effectType => {
                    const icon = effectIcons[effectType] || '⭐';
                    const name = effectNames[effectType] || effectType;
                    const duration = uniqueEffects[effectType];
                    effectsHtml += `<span class="effect-badge" title="${name}">${icon}${duration}</span>`;
                });
            }

            // 计算装备加成
            const atkBonus = this.getEquipmentBonus(spirit, 'atk');
            const defBonus = this.getEquipmentBonus(spirit, 'def');
            const maxHpBonus = this.getEquipmentBonus(spirit, 'maxHp');
            const maxMpBonus = this.getEquipmentBonus(spirit, 'maxMp');
            const critRateBonus = this.getEquipmentBonus(spirit, 'critRate');
            const critDamageBonus = this.getEquipmentBonus(spirit, 'critDamage');
            const speedBonus = this.getEquipmentBonus(spirit, 'speed');
            const accuracyBonus = this.getEquipmentBonus(spirit, 'accuracy');

            // spirit.atk/def/maxHp/maxMp 是基础值（不包含装备加成）
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

            card.innerHTML = `
                <div class="spirit-icon">${spirit.icon}</div>
                <div class="spirit-name">${spirit.name}</div>
                <div class="spirit-level">Lv.${spirit.level}</div>
                <div class="spirit-element" style="color: ${element.color};">${element.name} ${element.icon}</div>
                <div class="hp-bar">
                    <div class="hp-bar-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                </div>
                <div class="hp-text">${spirit.currentHp}/${totalMaxHp}${maxHpBonus > 0 ? `<span class="stat-bonus">+${maxHpBonus}</span>` : ''}</div>
                <div class="mp-bar">
                    <div class="mp-bar-fill" style="width: ${mpPercent}%"></div>
                </div>
                <div class="mp-text">${spirit.currentMp}/${totalMaxMp}${maxMpBonus > 0 ? `<span class="stat-bonus">+${maxMpBonus}</span>` : ''}</div>
                <div class="spirit-stats-list">
                    <div class="stat-list-item">
                        <span class="stat-icon">⚔️</span>
                        <div class="stat-info">
                            <span class="stat-label">攻击</span>
                            <span class="stat-value">${totalAtk}${atkBonus > 0 ? `<span class="stat-bonus">+${atkBonus}</span>` : ''}</span>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <span class="stat-icon">🛡️</span>
                        <div class="stat-info">
                            <span class="stat-label">防御</span>
                            <span class="stat-value">${totalDef}${defBonus > 0 ? `<span class="stat-bonus">+${defBonus}</span>` : ''}</span>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <span class="stat-icon">⚡</span>
                        <div class="stat-info">
                            <span class="stat-label">暴击</span>
                            <span class="stat-value">${totalCritRate.toFixed(0)}%${critRateBonus > 0 ? `<span class="stat-bonus">+${critRateBonus}%</span>` : ''}</span>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <span class="stat-icon">💥</span>
                        <div class="stat-info">
                            <span class="stat-label">暴伤</span>
                            <span class="stat-value">${totalCritDamage.toFixed(0)}%${critDamageBonus > 0 ? `<span class="stat-bonus">+${critDamageBonus}%</span>` : ''}</span>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <span class="stat-icon">🚀</span>
                        <div class="stat-info">
                            <span class="stat-label">速度</span>
                            <span class="stat-value">${totalSpeed}${speedBonus > 0 ? `<span class="stat-bonus">+${speedBonus}</span>` : ''}</span>
                        </div>
                    </div>
                    <div class="stat-list-item">
                        <span class="stat-icon">🎯</span>
                        <div class="stat-info">
                            <span class="stat-label">命中</span>
                            <span class="stat-value">${totalAccuracy.toFixed(0)}%${accuracyBonus > 0 ? `<span class="stat-bonus">+${accuracyBonus}%</span>` : ''}</span>
                        </div>
                    </div>
                </div>
                ${effectsHtml ? `<div class="spirit-effects">${effectsHtml}</div>` : ''}
            `;

            if (isPlayer && spirit.currentHp > 0 && index !== currentIndex) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => this.showSpiritReplaceModal(null, spirit));
            }

            container.appendChild(card);
        });
    }

    // 计算装备加成（支持同一装备多个相同类型加成）
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

    updateBattleButtons(enabled) {
        const buttons = ['attack-btn', 'defend-btn', 'skill-btn', 'item-btn', 'replace-btn'];
        
        // 检查是否有可替换的精灵
        const currentSpirit = this.getCurrentPlayerSpirit();
        let hasReplaceableSpirit = false;
        if (currentSpirit) {
            const availableSpirits = this.game.player.battleTeam.filter(s => s !== currentSpirit && s.currentHp > 0);
            hasReplaceableSpirit = availableSpirits.length > 0;
        }
        
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                // 替换按钮需要额外检查是否有可替换的精灵
                if (id === 'replace-btn') {
                    btn.disabled = !enabled || !hasReplaceableSpirit;
                } else {
                    btn.disabled = !enabled;
                }
            }
        });

        const autoBtn = document.getElementById('auto-btn');
        if (autoBtn) {
            autoBtn.textContent = this.game.isAutoBattle ? '停止自动' : '自动战斗';
            // 自动战斗按钮始终可用，以便玩家可以随时停止自动战斗
            autoBtn.disabled = false;
        }
    }
}

window.BattleCore = BattleCore;
