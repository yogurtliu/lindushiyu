class BattleActions {
    constructor(game) {
        this.game = game;
    }

    executeTurn() {
        this.game.battleState.phase = 'execute';
        this.core.updateBattleButtons(false);

        const playerSpirit = this.core.getCurrentPlayerSpirit();
        const enemySpirit = this.core.getCurrentEnemySpirit();

        if (!playerSpirit || !enemySpirit) {
            this.core.checkBattleEnd();
            return;
        }

        const playerAction = this.game.battleState.playerAction;
        const enemyAction = this.game.battleState.enemyAction;

        const actions = [];

        // 检查玩家行动是否为恢复类技能
        const isPlayerHealSkill = playerAction === 'skill' && this.isHealSkill(playerSpirit, this.game.battleState.selectedSkill);
        // 检查敌方行动是否为恢复类技能（使用敌方实际选择的技能索引）
        const isEnemyHealSkill = enemyAction === 'skill' && this.isHealSkill(enemySpirit, this.game.battleState.enemySkillIndex || 0);

        // 计算玩家速度值（基础 + 装备 + buff）
        let playerSpeed = this.calculateSpeed(playerSpirit, true);
        // 计算敌方速度值（基础 + 装备 + buff）
        let enemySpeed = this.calculateSpeed(enemySpirit, false);

        // 优先级：恢复类技能(基础3) > 防御(基础2) > 普通攻击/伤害技能(基础1) > 道具(基础-2) > 替换精灵(基础-3)
        // 玩家行动的基础优先级加100，确保玩家永远优先行动
        if (playerAction === 'defend') {
            actions.push({ type: 'player', action: playerAction, priority: 100 + 2 + playerSpeed / 100 });
        } else if (isPlayerHealSkill) {
            actions.push({ type: 'player', action: playerAction, priority: 100 + 3 + playerSpeed / 100, skillIndex: this.game.battleState.selectedSkill });
        } else if (playerAction === 'item') {
            actions.push({ type: 'player', action: 'item', priority: 100 - 2 + playerSpeed / 100 });
        } else if (playerAction === 'replace') {
            actions.push({ type: 'player', action: playerAction, priority: 100 - 3 + playerSpeed / 100 });
        } else {
            actions.push({ type: 'player', action: playerAction, priority: 100 + 1 + playerSpeed / 100 });
        }

        if (enemyAction === 'defend') {
            actions.push({ type: 'enemy', action: enemyAction, priority: 2 + enemySpeed / 100 });
        } else if (isEnemyHealSkill) {
            actions.push({ type: 'enemy', action: enemyAction, priority: 3 + enemySpeed / 100 });
        } else {
            actions.push({ type: 'enemy', action: enemyAction, priority: 1 + enemySpeed / 100 });
        }

        actions.sort((a, b) => b.priority - a.priority);

        this.executeActions(actions, 0);
    }

    calculateSpeed(spirit, isPlayer) {
        // 基础速度值
        let speed = spirit.speed || 10;
        
        // 装备增加的速度
        if (spirit.equipment) {
            const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
            slots.forEach(slot => {
                const equip = spirit.equipment[slot];
                if (equip && equip.stats) {
                    equip.stats.forEach(stat => {
                        if (stat.stat === 'speed') {
                            speed += stat.value;
                        }
                    });
                }
            });
        }
        
        // buff增加的速度
        const spiritIndex = isPlayer ? 
            this.game.player.battleTeam.indexOf(spirit) : 
            this.game.enemyTeam.indexOf(spirit);
        const spiritKey = isPlayer ? `player-${spiritIndex}` : `enemy-${spiritIndex}`;
        
        if (this.game.battleState.buffs && this.game.battleState.buffs[spiritKey]) {
            this.game.battleState.buffs[spiritKey].forEach(buff => {
                if (buff.type === 'speed') {
                    speed += 20;
                }
                if (buff.type === 'priority') {
                    speed += 100;
                }
            });
        }
        
        return speed;
    }

    isHealSkill(spirit, skillIndex) {
        if (!spirit.skills || spirit.skills.length === 0) return false;
        const skill = spirit.skills[skillIndex] || spirit.skills[0];
        return skill && (skill.heal || skill.effect === 'heal');
    }

    executeActions(actions, index) {
        if (index >= actions.length) {
            this.core.endTurn();
            return;
        }

        const actionData = actions[index];
        const playerSpirit = this.core.getCurrentPlayerSpirit();
        const enemySpirit = this.core.getCurrentEnemySpirit();

        if (!playerSpirit || !enemySpirit) {
            this.core.checkBattleEnd();
            return;
        }

        const continueExecution = () => {
            // 检查战斗是否已结束
            if (this.game.currentScreen !== 'battle') {
                return;
            }
            
            // 检查是否有冰冻效果阻止下一个行动
            const nextIndex = index + 1;
            if (nextIndex < actions.length) {
                const nextAction = actions[nextIndex];
                let targetKey;
                
                if (nextAction.type === 'player') {
                    targetKey = `player-${this.game.battleState.playerCurrentIndex}`;
                } else {
                    targetKey = `enemy-${this.game.battleState.enemyCurrentIndex}`;
                }
                
                // 检查是否被冰冻
                if (this.game.battleState.buffs && this.game.battleState.buffs[targetKey]) {
                    const hasFreeze = this.game.battleState.buffs[targetKey].some(buff => buff.type === 'freeze');
                    if (hasFreeze) {
                        this.core.addBattleLog(`${nextAction.type === 'player' ? '我方' : '敌方'}精灵被冰冻，无法行动！`, 'debuff');
                        // 跳过这个行动，继续下一个
                        this.core.renderBattleTeams();
                        setTimeout(() => this.executeActions(actions, nextIndex + 1), 600);
                        return;
                    }
                }
            }
            
            this.core.renderBattleTeams();
            setTimeout(() => this.executeActions(actions, nextIndex), 600);
        };

        if (actionData.type === 'player') {
            // 检查玩家精灵是否仍然存活（可能在上一个动作中死亡）
            const currentPlayerSpirit = this.game.player.battleTeam[this.game.battleState.playerCurrentIndex];
            if (!currentPlayerSpirit || currentPlayerSpirit.currentHp <= 0) {
                // 玩家精灵已死亡，跳过此动作，让下一个精灵出场
                continueExecution();
                return;
            }
            this.executePlayerAction(playerSpirit, enemySpirit, actionData.action, continueExecution);
        } else {
            // 检查敌方精灵是否仍然存活（可能在上一个动作中死亡）
            const currentEnemySpirit = this.game.enemyTeam[this.game.battleState.enemyCurrentIndex];
            if (!currentEnemySpirit || currentEnemySpirit.currentHp <= 0) {
                // 敌方精灵已死亡，跳过此动作，让下一个精灵出场
                continueExecution();
                return;
            }
            this.executeEnemyAction(enemySpirit, playerSpirit, actionData.action);
            continueExecution();
        }
    }

    executePlayerAction(attacker, target, action, callback) {
        switch (action) {
            case 'skip':
                // 被控制无法行动
                callback();
                break;
            case 'attack':
                this.performAttack(attacker, target);
                callback();
                break;
            case 'defend':
                this.performDefend(attacker, this.game.battleState.playerCurrentIndex, true);
                callback();
                break;
            case 'skill':
                const skillSuccess = this.performSkill(attacker, target, this.game.battleState.selectedSkill || 0);
                if (!skillSuccess) {
                    const spiritHpRatio = attacker.currentHp / attacker.maxHp;
                    const enemySpirit = this.core.getCurrentEnemySpirit();
                    const elementMultiplier = getElementMultiplier(attacker.element, enemySpirit.element);
                    const enemyElementMultiplier = getElementMultiplier(enemySpirit.element, attacker.element);
                    
                    if (spiritHpRatio < 0.2 && Object.keys(this.game.player.inventory).some(key => ITEMS[key].heal)) {
                        const healItems = Object.keys(this.game.player.inventory).filter(key => ITEMS[key].heal);
                        healItems.sort((a, b) => ITEMS[b].heal - ITEMS[a].heal);
                        this.game.battleState.selectedItem = healItems[0];
                        this.useBattleItem();
                    } else if (Object.keys(this.game.player.inventory).some(key => ITEMS[key].mp)) {
                        const mpItems = Object.keys(this.game.player.inventory).filter(key => ITEMS[key].mp);
                        mpItems.sort((a, b) => ITEMS[b].mp - ITEMS[a].mp);
                        this.game.battleState.selectedItem = mpItems[0];
                        this.useBattleItem();
                    } else if (spiritHpRatio < 0.3 && enemyElementMultiplier > 1) {
                        this.performDefend(attacker, this.game.battleState.playerCurrentIndex, true);
                    } else {
                        this.performAttack(attacker, target);
                    }
                }
                callback();
                break;
            case 'item':
                this.useBattleItem();
                callback();
                break;
            case 'replace':
                // 替换精灵已经在模态框中完成，这里直接继续
                callback();
                break;
        }
    }

    executeEnemyAction(attacker, target, action) {
        switch (action) {
            case 'skip':
                // 被控制无法行动
                break;
            case 'attack':
                this.performAttack(attacker, target);
                break;
            case 'defend':
                this.performDefend(attacker, this.game.battleState.enemyCurrentIndex, false);
                break;
            case 'skill':
                const skillIndex = this.game.battleState.enemySkillIndex || 0;
                const skillSuccess = this.performSkill(attacker, target, skillIndex);
                if (!skillSuccess) {
                    // 技能执行失败，选择其他行动
                    const enemyHpRatio = attacker.currentHp / attacker.maxHp;
                    if (enemyHpRatio < 0.3) {
                        this.performDefend(attacker, this.game.battleState.enemyCurrentIndex, false);
                    } else {
                        this.performAttack(attacker, target);
                    }
                }
                break;
        }
    }

    performAttack(attacker, defender) {
        const isPlayerAttack = this.game.player.battleTeam.includes(attacker);
        const defenderIndex = isPlayerAttack ?
            this.game.enemyTeam.indexOf(defender) :
            this.game.player.battleTeam.indexOf(defender);
        const defenderKey = isPlayerAttack ? `enemy-${defenderIndex}` : `player-${defenderIndex}`;
        const attackerIndex = isPlayerAttack ?
            this.game.player.battleTeam.indexOf(attacker) :
            this.game.enemyTeam.indexOf(attacker);
        const attackerKey = isPlayerAttack ? `player-${attackerIndex}` : `enemy-${attackerIndex}`;

        // 检查攻击者是否有攻击力提升buff
        let atkMultiplier = 1;
        if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
            this.game.battleState.buffs[attackerKey].forEach(buff => {
                if (buff.type === 'buff' && buff.atk) {
                    atkMultiplier *= buff.atk;
                }
            });
        }

        // 检查防御者是否有闪避或隐身效果
        if (this.game.battleState.buffs && this.game.battleState.buffs[defenderKey]) {
            const hasDodge = this.game.battleState.buffs[defenderKey].some(buff => buff.type === 'dodge');
            const hasHide = this.game.battleState.buffs[defenderKey].some(buff => buff.type === 'hide');
            
            if (hasDodge || hasHide) {
                this.core.addBattleLog(`${attacker.name} 的攻击被 ${defender.name} 闪避了！`, 'buff');
                // 移除闪避/隐身效果（一次性效果）
                this.game.battleState.buffs[defenderKey] = this.game.battleState.buffs[defenderKey].filter(
                    buff => buff.type !== 'dodge' && buff.type !== 'hide'
                );
                return;
            }
        }

        const elementMultiplier = getElementMultiplier(attacker.element, defender.element);
        
        // 检查防御者是否有防御力提升buff
        let defMultiplier = 1;
        if (this.game.battleState.buffs && this.game.battleState.buffs[defenderKey]) {
            this.game.battleState.buffs[defenderKey].forEach(buff => {
                if (buff.type === 'buff_def' && buff.def) {
                    defMultiplier *= buff.def;
                }
            });
        }
        
        // 使用包含装备加成的总攻击力和总防御力
        const totalAtk = this.getTotalAtk(attacker);
        const totalDef = this.getTotalDef(defender);
        
        const defenseReduction = totalDef * defMultiplier * 0.5;
        let baseDamage = Math.floor((totalAtk * atkMultiplier * elementMultiplier - defenseReduction) * (0.9 + Math.random() * 0.2));
        baseDamage = Math.max(1, baseDamage);

        // 计算暴击率：使用精灵的暴击率属性 + 装备加成 + buff加成
        let critRate = (attacker.critRate || 5) / 100;
        
        // 装备增加的暴击率
        if (attacker.equipment) {
            const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
            slots.forEach(slot => {
                const equip = attacker.equipment[slot];
                if (equip && equip.stats) {
                    equip.stats.forEach(stat => {
                        if (stat.stat === 'critRate') {
                            critRate += stat.value / 100;
                        }
                    });
                }
            });
        }
        
        // buff增加的暴击率
        if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
            this.game.battleState.buffs[attackerKey].forEach(buff => {
                if (buff.type === 'crit' && buff.value) {
                    critRate += buff.value;
                }
            });
        }
        
        // 计算暴击伤害：使用精灵的暴击伤害属性 + 装备加成 + buff加成
        let critDamage = attacker.critDamage || 150;
        
        // 装备增加的暴击伤害
        if (attacker.equipment) {
            const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
            slots.forEach(slot => {
                const equip = attacker.equipment[slot];
                if (equip && equip.stats) {
                    equip.stats.forEach(stat => {
                        if (stat.stat === 'critDamage') {
                            critDamage += stat.value;
                        }
                    });
                }
            });
        }
        
        // buff增加的暴击伤害
        if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
            this.game.battleState.buffs[attackerKey].forEach(buff => {
                if (buff.type === 'crit_damage' && buff.value) {
                    critDamage += buff.value;
                }
            });
        }
        
        const isCritical = Math.random() < critRate;
        if (isCritical) {
            baseDamage = Math.floor(baseDamage * critDamage / 100);
        }

        // 计算命中率：使用精灵的命中率属性 + 装备加成 + buff加成
        let accuracy = attacker.accuracy || 85;
        
        // 装备增加的命中率
        if (attacker.equipment) {
            const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
            slots.forEach(slot => {
                const equip = attacker.equipment[slot];
                if (equip && equip.stats) {
                    equip.stats.forEach(stat => {
                        if (stat.stat === 'accuracy') {
                            accuracy += stat.value;
                        }
                    });
                }
            });
        }
        
        // buff增加的命中率
        if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
            this.game.battleState.buffs[attackerKey].forEach(buff => {
                if (buff.type === 'accuracy' && buff.value) {
                    accuracy += buff.value;
                }
            });
        }
        
        // 检查攻击者是否失明（降低命中率）
        if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
            const hasBlind = this.game.battleState.buffs[attackerKey].some(buff => buff.type === 'blind');
            if (hasBlind) {
                accuracy -= 30; // 失明降低30%命中率
            }
        }
        
        // 限制命中率范围
        accuracy = Math.max(0, Math.min(100, accuracy));
        
        // 检查是否命中
        if (Math.random() * 100 > accuracy) {
            this.core.addBattleLog(`${attacker.name} 的攻击没有命中 ${defender.name}！`, 'debuff');
            return;
        }

        if (this.game.battleState.defendingSpirits.has(defenderKey)) {
            baseDamage = Math.floor(baseDamage * 0.5);
        }

        // 计算最终伤害（考虑伤害减免效果）
        const damage = this.core.calculateDamage(attacker, defender, baseDamage);

        defender.currentHp = Math.max(0, defender.currentHp - damage);

        let message = `${attacker.name} 攻击 ${defender.name}，造成 ${damage} 点伤害！`;
        if (isCritical) {
            message = `💥 暴击！${message}`;
        }

        this.core.addBattleLog(message, isPlayerAttack ? 'player' : 'enemy');

        // 处理伤害反弹效果
        this.core.processDamageReflection(attacker, defender, damage);

        // 检查防御者是否有旧的伤害反弹效果（保持向后兼容）
        if (this.game.battleState.buffs && this.game.battleState.buffs[defenderKey]) {
            const reflectBuff = this.game.battleState.buffs[defenderKey].find(buff => buff.type === 'reflect');
            if (reflectBuff && reflectBuff.damage) {
                const reflectDamage = Math.floor(damage * reflectBuff.damage);
                attacker.currentHp = Math.max(0, attacker.currentHp - reflectDamage);
                this.core.addBattleLog(`${defender.name} 反弹 ${reflectDamage} 点伤害给 ${attacker.name}！`, 'buff');
            }
        }

        // 检查防御者是否死亡并触发重生效果
        if (defender.currentHp <= 0) {
            this.checkRevive(defender, defenderKey);
        }
    }

    checkRevive(spirit, spiritKey) {
        if (this.game.battleState.buffs && this.game.battleState.buffs[spiritKey]) {
            const reviveBuff = this.game.battleState.buffs[spiritKey].find(buff => buff.type === 'revive');
            if (reviveBuff) {
                // 触发重生效果
                const reviveHp = Math.floor(spirit.maxHp * 0.5);
                spirit.currentHp = reviveHp;
                this.core.addBattleLog(`${spirit.name} 触发重生效果，恢复 ${reviveHp} 点生命！`, 'heal');
                // 移除重生buff
                this.game.battleState.buffs[spiritKey] = this.game.battleState.buffs[spiritKey].filter(
                    buff => buff.type !== 'revive'
                );
            }
        }
    }

    performDefend(attacker, index, isPlayer) {
        const key = isPlayer ? `player-${index}` : `enemy-${index}`;
        this.game.battleState.defendingSpirits.add(key);
        this.core.addBattleLog(`${attacker.name} 进入防御姿态！`, 'buff');
    }

    performSkill(attacker, target, skillIndex) {
        if (!attacker.skills || attacker.skills.length === 0) return false;

        const skill = attacker.skills[skillIndex] || attacker.skills[0];

        if (skill.mpCost && attacker.currentMp < skill.mpCost) {
            this.core.addBattleLog(`${attacker.name} 魔力不足，无法使用 ${skill.name}！`, 'damage');
            return false;
        }

        if (skill.mpCost) {
            attacker.currentMp -= skill.mpCost;
        }

        const isPlayerAttack = this.game.player.battleTeam.includes(attacker);
        const targetIndex = isPlayerAttack ?
            this.game.enemyTeam.indexOf(target) :
            this.game.player.battleTeam.indexOf(target);
        const targetKey = isPlayerAttack ? `enemy-${targetIndex}` : `player-${targetIndex}`;

        // 检查目标是否有闪避或隐身效果（对某些技能有效）
        if (this.game.battleState.buffs && this.game.battleState.buffs[targetKey]) {
            const hasHide = this.game.battleState.buffs[targetKey].some(buff => buff.type === 'hide');
            
            if (hasHide && !skill.damage) {
                this.core.addBattleLog(`${attacker.name} 的技能被 ${target.name} 闪避了！`, 'buff');
                return;
            }
        }

        let skillDamage = 0;
        if (skill.damage) {
            const elementMultiplier = getElementMultiplier(attacker.element, target.element);
            // 使用包含装备加成的总攻击力
            const totalAtk = this.getTotalAtk(attacker);
            skillDamage = Math.floor(totalAtk * skill.damage * elementMultiplier);
            skillDamage = Math.max(1, skillDamage);

            const isPlayerAttack = this.game.player.battleTeam.includes(attacker);
            const defenderIndex = isPlayerAttack ?
                this.game.enemyTeam.indexOf(target) :
                this.game.player.battleTeam.indexOf(target);
            const defenderKey = isPlayerAttack ? `enemy-${defenderIndex}` : `player-${defenderIndex}`;
            const attackerIndex = isPlayerAttack ?
                this.game.player.battleTeam.indexOf(attacker) :
                this.game.enemyTeam.indexOf(attacker);
            const attackerKey = isPlayerAttack ? `player-${attackerIndex}` : `enemy-${attackerIndex}`;

            // 计算暴击率：使用精灵的暴击率属性 + 装备加成 + buff加成
            let critRate = (attacker.critRate || 5) / 100;
            
            // 装备增加的暴击率
            if (attacker.equipment) {
                const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
                slots.forEach(slot => {
                    const equip = attacker.equipment[slot];
                    if (equip && equip.stats) {
                        equip.stats.forEach(stat => {
                            if (stat.stat === 'critRate') {
                                critRate += stat.value / 100;
                            }
                        });
                    }
                });
            }
            
            // buff增加的暴击率
            if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
                this.game.battleState.buffs[attackerKey].forEach(buff => {
                    if (buff.type === 'crit' && buff.value) {
                        critRate += buff.value;
                    }
                });
            }
            
            // 计算暴击伤害：使用精灵的暴击伤害属性 + 装备加成 + buff加成
            let critDamage = attacker.critDamage || 150;
            
            // 装备增加的暴击伤害
            if (attacker.equipment) {
                const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
                slots.forEach(slot => {
                    const equip = attacker.equipment[slot];
                    if (equip && equip.stats) {
                        equip.stats.forEach(stat => {
                            if (stat.stat === 'critDamage') {
                                critDamage += stat.value;
                            }
                        });
                    }
                });
            }
            
            // buff增加的暴击伤害
            if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
                this.game.battleState.buffs[attackerKey].forEach(buff => {
                    if (buff.type === 'crit_damage' && buff.value) {
                        critDamage += buff.value;
                    }
                });
            }
            
            const isCritical = Math.random() < critRate;
            if (isCritical) {
                skillDamage = Math.floor(skillDamage * critDamage / 100);
            }

            // 计算命中率：使用精灵的命中率属性 + 装备加成 + buff加成
            let accuracy = attacker.accuracy || 85;
            
            // 装备增加的命中率
            if (attacker.equipment) {
                const slots = ['weapon', 'armor', 'accessory1', 'accessory2'];
                slots.forEach(slot => {
                    const equip = attacker.equipment[slot];
                    if (equip && equip.stats) {
                        equip.stats.forEach(stat => {
                            if (stat.stat === 'accuracy') {
                                accuracy += stat.value;
                            }
                        });
                    }
                });
            }
            
            // buff增加的命中率
            if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
                this.game.battleState.buffs[attackerKey].forEach(buff => {
                    if (buff.type === 'accuracy' && buff.value) {
                        accuracy += buff.value;
                    }
                });
            }
            
            // 检查攻击者是否失明（降低命中率）
            if (this.game.battleState.buffs && this.game.battleState.buffs[attackerKey]) {
                const hasBlind = this.game.battleState.buffs[attackerKey].some(buff => buff.type === 'blind');
                if (hasBlind) {
                    accuracy -= 30; // 失明降低30%命中率
                }
            }
            
            // 限制命中率范围
            accuracy = Math.max(0, Math.min(100, accuracy));
            
            // 检查是否命中
            if (Math.random() * 100 > accuracy) {
                this.core.addBattleLog(`${attacker.name} 的技能 ${skill.name} 没有命中 ${target.name}！`, 'debuff');
                return;
            }

            if (this.game.battleState.defendingSpirits.has(defenderKey)) {
                skillDamage = Math.floor(skillDamage * 0.5);
                this.core.addBattleLog(`${target.name} 的防御姿态减少了技能伤害！`, 'buff');
            }

            target.currentHp = Math.max(0, target.currentHp - skillDamage);
            
            let message = `${attacker.name} 使用 ${skill.name}，造成 ${skillDamage} 点伤害！`;
            if (isCritical) {
                message = `💥 暴击！${message}`;
            }
            this.core.addBattleLog(message, 'critical');
            
            // 检查目标是否死亡并触发重生效果
            if (target.currentHp <= 0) {
                this.checkRevive(target, targetKey);
            }
        }

        if (skill.defense) {
            const isPlayer = this.game.player.battleTeam.includes(attacker);
            const index = isPlayer ?
                this.game.player.battleTeam.indexOf(attacker) :
                this.game.enemyTeam.indexOf(attacker);
            const key = isPlayer ? `player-${index}` : `enemy-${index}`;
            this.game.battleState.defendingSpirits.add(key);
            this.core.addBattleLog(`${attacker.name} 使用 ${skill.name}，防御大幅提升！`, 'buff');
        }

        if (skill.heal) {
            // 如果技能同时有伤害和治疗效果（如生命汲取），基于造成的伤害计算治疗量
            let healAmount;
            if (skill.damage && skillDamage > 0) {
                // 生命汲取类技能：根据造成的伤害的一定比例恢复生命
                healAmount = Math.floor(skillDamage * skill.heal);
            } else {
                // 纯治疗技能：基于最大生命值的比例恢复
                healAmount = Math.floor(attacker.maxHp * skill.heal);
            }
            const oldHp = attacker.currentHp;
            attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
            const actualHeal = attacker.currentHp - oldHp;
            if (actualHeal > 0) {
                this.core.addBattleLog(`${attacker.name} 使用 ${skill.name}，恢复 ${actualHeal} 点生命！`, 'heal');
            }
            
            // 特殊技能：光合作用同时恢复魔力值
            if (skill.name === '光合作用') {
                const mpHealAmount = Math.floor(attacker.maxMp * 0.3);
                const oldMp = attacker.currentMp;
                attacker.currentMp = Math.min(attacker.maxMp, attacker.currentMp + mpHealAmount);
                const actualMpHeal = attacker.currentMp - oldMp;
                if (actualMpHeal > 0) {
                    this.core.addBattleLog(`${attacker.name} 光合作用恢复 ${actualMpHeal} 点魔力值！`, 'buff');
                }
            }
        }

        if (skill.effect) {
            this.handleSkillEffect(attacker, target, skill);
        }
        return true;
    }

    handleSkillEffect(attacker, target, skill) {
        if (!this.game.battleState.buffs) {
            this.game.battleState.buffs = {};
        }

        const isPlayerTarget = this.game.player.battleTeam.includes(target);
        const targetKey = isPlayerTarget ?
            `player-${this.game.player.battleTeam.indexOf(target)}` :
            `enemy-${this.game.enemyTeam.indexOf(target)}`;

        const isPlayerAttacker = this.game.player.battleTeam.includes(attacker);
        const attackerKey = isPlayerAttacker ?
            `player-${this.game.player.battleTeam.indexOf(attacker)}` :
            `enemy-${this.game.enemyTeam.indexOf(attacker)}`;

        switch (skill.effect) {
            case 'poison':
            case 'poison_all':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'poison',
                    duration: 3,
                    damage: Math.floor(target.maxHp * 0.05)
                });
                this.core.addBattleLog(`${target.name} 中毒了！`, 'debuff');
                break;
            case 'burn':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'burn',
                    duration: 2,
                    damage: Math.floor(target.maxHp * 0.08)
                });
                this.core.addBattleLog(`${target.name} 被烧伤了！`, 'debuff');
                break;
            case 'stun':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'stun',
                    duration: 1
                });
                this.core.addBattleLog(`${target.name} 被眩晕了！`, 'debuff');
                break;
            case 'freeze':
            case 'freeze_all':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'freeze',
                    duration: 2
                });
                this.core.addBattleLog(`${target.name} 被冰冻了！`, 'debuff');
                break;
            case 'slow':
            case 'slow_all':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'slow',
                    duration: 2
                });
                this.core.addBattleLog(`${target.name} 被减速了！`, 'debuff');
                break;
            case 'bind':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'bind',
                    duration: 1
                });
                this.core.addBattleLog(`${target.name} 被束缚了！`, 'debuff');
                break;
            case 'blind':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'blind',
                    duration: 2
                });
                this.core.addBattleLog(`${target.name} 失明了！`, 'debuff');
                break;
            case 'leech':
                if (!this.game.battleState.buffs[targetKey]) {
                    this.game.battleState.buffs[targetKey] = [];
                }
                this.game.battleState.buffs[targetKey].push({
                    type: 'leech',
                    duration: 3,
                    damage: Math.floor(target.maxHp * 0.04)
                });
                this.core.addBattleLog(`${target.name} 被寄生了！`, 'debuff');
                break;
            case 'dodge':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'dodge',
                    duration: 1
                });
                this.core.addBattleLog(`${attacker.name} 进入闪避状态！`, 'buff');
                break;
            case 'hide':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'hide',
                    duration: 1
                });
                this.core.addBattleLog(`${attacker.name} 隐匿了身形！`, 'buff');
                break;
            case 'reflect':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'reflect',
                    duration: 2,
                    damage: 0.3
                });
                this.core.addBattleLog(`${attacker.name} 开启伤害反弹！`, 'buff');
                break;
            case 'speed':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'speed',
                    duration: 2
                });
                this.core.addBattleLog(`${attacker.name} 速度提升了！`, 'buff');
                break;
            case 'priority':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'priority',
                    duration: 1
                });
                this.core.addBattleLog(`${attacker.name} 获得先攻权！`, 'buff');
                break;
            case 'buff':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'buff',
                    duration: 3,
                    atk: 1.2
                });
                this.core.addBattleLog(`${attacker.name} 攻击力提升了！`, 'buff');
                break;
            case 'buff_def':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'buff_def',
                    duration: 3,
                    def: 1.3
                });
                this.core.addBattleLog(`${attacker.name} 防御力提升了！`, 'buff');
                break;
            case 'regen':
                if (!this.game.battleState.buffs[attackerKey]) {
                    this.game.battleState.buffs[attackerKey] = [];
                }
                this.game.battleState.buffs[attackerKey].push({
                    type: 'regen',
                    duration: 3,
                    heal: Math.floor(attacker.maxHp * 0.1)
                });
                this.core.addBattleLog(`${attacker.name} 开始持续恢复生命！`, 'buff');
                break;
            case 'revive':
                this.game.battleState.buffs[attackerKey] = this.game.battleState.buffs[attackerKey] || [];
                this.game.battleState.buffs[attackerKey].push({
                    type: 'revive',
                    duration: 999
                });
                this.core.addBattleLog(`${attacker.name} 获得重生之力！`, 'buff');
                break;
        }
    }

    useBattleItem() {
        const itemKey = this.game.battleState.selectedItem;
        if (!itemKey || !this.game.player.inventory[itemKey]) return;

        const item = ITEMS[itemKey];
        const spirit = this.core.getCurrentPlayerSpirit();
        if (!spirit) return;

        if (item.heal) {
            const healAmount = item.heal === 9999 ? spirit.maxHp : Math.min(item.heal, spirit.maxHp - spirit.currentHp);
            spirit.currentHp = Math.min(spirit.maxHp, spirit.currentHp + healAmount);
            this.core.addBattleLog(`使用 ${item.name}，${spirit.name} 恢复 ${healAmount} 点生命！`, 'heal');
        } else if (item.mp) {
            const mpAmount = item.mp === 9999 ? spirit.maxMp : Math.min(item.mp, spirit.maxMp - spirit.currentMp);
            spirit.currentMp = Math.min(spirit.maxMp, spirit.currentMp + mpAmount);
            this.core.addBattleLog(`使用 ${item.name}，${spirit.name} 恢复 ${mpAmount} 点魔力！`, 'buff');
        } else if (item.effect) {
            switch (item.effect) {
                case 'double_exp':
                    this.core.addBattleLog(`使用 ${item.name}，所有精灵获得的经验双倍！`, 'buff');
                    // 这里需要在战斗结束时应用经验双倍效果
                    break;
                case 'triple_exp':
                    this.core.addBattleLog(`使用 ${item.name}，所有精灵获得的经验三倍！`, 'buff');
                    // 这里需要在战斗结束时应用经验三倍效果
                    break;
                case 'random_skill':
                    if (spirit.skills.length > 0) {
                        const randomSkillIndex = Math.floor(Math.random() * spirit.skills.length);
                        const randomSkill = spirit.skills[randomSkillIndex];
                        this.core.addBattleLog(`使用 ${item.name}，${spirit.name} 随机使用了技能 ${randomSkill.name}！`, 'buff');
                        // 这里需要执行随机技能
                        this.performSkill(spirit, this.core.getCurrentEnemySpirit(), randomSkillIndex);
                    } else {
                        this.core.addBattleLog(`使用 ${item.name}，但 ${spirit.name} 没有可使用的技能！`, 'error');
                    }
                    break;
                case 'reflect_damage':
                    this.core.addBattleLog(`使用 ${item.name}，${spirit.name} 获得伤害反弹效果！`, 'buff');
                    // 这里需要添加伤害反弹效果
                    this.core.addBuffToSpirit(spirit, {
                        name: '伤害反弹',
                        effect: 'reflect_damage',
                        value: 0.3,
                        duration: 3,
                        icon: '🛡️'
                    });
                    // 添加伤害减免效果
                    this.core.addBuffToSpirit(spirit, {
                        name: '伤害减免',
                        effect: 'damage_reduction',
                        value: 0.3,
                        duration: 3,
                        icon: '🛡️'
                    });
                    break;
            }
        }

        this.game.player.inventory[itemKey]--;
        if (this.game.player.inventory[itemKey] === 0) {
            delete this.game.player.inventory[itemKey];
        }
    }

    switchActiveSpirit(currentIndex, newSpirit) {
        // 找到新精灵在出战队伍中的索引
        const newIndex = this.game.player.battleTeam.findIndex(s => s === newSpirit);
        if (newIndex === -1) return;
        
        // 切换当前行动的精灵索引
        this.game.battleState.playerCurrentIndex = newIndex;
        
        // 调整精灵后默认为玩家手动操作状态（关闭自动战斗）
        this.game.isAutoBattle = false;
        
        this.core.addBattleLog(`${newSpirit.name} 成为当前行动的精灵！`, 'buff');
        this.core.renderBattleTeams();
    }

    replaceSpirit(currentSpirit, newSpirit) {
        if (!currentSpirit || !newSpirit) return;

        // 找到当前精灵和新精灵在出战队伍中的索引
        const currentIndex = this.game.player.battleTeam.indexOf(currentSpirit);
        const newIndex = this.game.player.battleTeam.indexOf(newSpirit);

        if (currentIndex === -1 || newIndex === -1) return;

        // 交换精灵位置
        const temp = this.game.player.battleTeam[currentIndex];
        this.game.player.battleTeam[currentIndex] = this.game.player.battleTeam[newIndex];
        this.game.player.battleTeam[newIndex] = temp;

        // 刷新战斗界面
        this.core.renderBattleTeams();
        this.core.addBattleLog(`${newSpirit.name} 替换了当前精灵！`, 'buff');
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

    getTotalAtk(spirit) {
        const baseAtk = spirit.atk || 0;
        const atkBonus = this.getEquipmentBonus(spirit, 'atk');
        return baseAtk + atkBonus;
    }

    getTotalDef(spirit) {
        const baseDef = spirit.def || 0;
        const defBonus = this.getEquipmentBonus(spirit, 'def');
        return baseDef + defBonus;
    }
}

window.BattleActions = BattleActions;
