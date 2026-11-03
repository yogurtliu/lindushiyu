class BattleAI {
    constructor(game) {
        this.game = game;
    }

    selectEnemyAction() {
        const enemy = this.core.getCurrentEnemySpirit();
        if (!enemy) return;

        const playerSpirit = this.core.getCurrentPlayerSpirit();
        if (!playerSpirit) return;

        const enemyKey = `enemy-${this.game.battleState.enemyCurrentIndex}`;
        
        if (this.game.battleState.buffs && this.game.battleState.buffs[enemyKey]) {
            const controlEffects = ['stun', 'freeze', 'bind'];
            const hasControlEffect = this.game.battleState.buffs[enemyKey].some(buff => controlEffects.includes(buff.type));
            
            if (hasControlEffect) {
                return;
            }
        }

        const enemyHpRatio = enemy.currentHp / enemy.maxHp;
        const enemyMpRatio = enemy.currentMp / enemy.maxMp;
        const playerHpRatio = playerSpirit.currentHp / playerSpirit.maxHp;

        const elementMultiplier = getElementMultiplier(enemy.element, playerSpirit.element);
        const playerElementMultiplier = getElementMultiplier(playerSpirit.element, enemy.element);

        const availableSkills = enemy.skills.filter(skill => {
            return !skill.mpCost || enemy.currentMp >= skill.mpCost;
        });

        let action = 'attack';
        let selectedSkillIndex = 0;

        // 1. 优先考虑使用控制技能
        const controlSkills = availableSkills.filter(skill => 
            ['stun', 'freeze', 'bind', 'slow', 'blind'].includes(skill.effect)
        );
        if (controlSkills.length > 0 && playerHpRatio > 0.3) {
            action = 'skill';
            selectedSkillIndex = enemy.skills.indexOf(controlSkills[0]);
            this.game.battleState.enemySkillIndex = selectedSkillIndex;
            this.game.battleState.enemyAction = action;
            return;
        }

        // 2. 考虑使用持续伤害技能
        const damageOverTimeSkills = availableSkills.filter(skill => 
            ['poison', 'burn', 'leech'].includes(skill.effect)
        );
        if (damageOverTimeSkills.length > 0 && playerHpRatio > 0.5) {
            action = 'skill';
            selectedSkillIndex = enemy.skills.indexOf(damageOverTimeSkills[0]);
            this.game.battleState.enemySkillIndex = selectedSkillIndex;
            this.game.battleState.enemyAction = action;
            return;
        }

        // 3. 考虑使用增益技能
        const buffSkills = availableSkills.filter(skill => 
            ['buff', 'buff_def', 'speed', 'regen'].includes(skill.effect)
        );
        if (buffSkills.length > 0 && enemyHpRatio < 0.6) {
            action = 'skill';
            selectedSkillIndex = enemy.skills.indexOf(buffSkills[0]);
            this.game.battleState.enemySkillIndex = selectedSkillIndex;
            this.game.battleState.enemyAction = action;
            return;
        }

        // 4. 考虑治疗
        if (enemyHpRatio < 0.4) {
            const healSkill = availableSkills.find(skill => skill.heal);
            if (healSkill) {
                action = 'skill';
                selectedSkillIndex = enemy.skills.indexOf(healSkill);
                this.game.battleState.enemySkillIndex = selectedSkillIndex;
                this.game.battleState.enemyAction = action;
                return;
            } else if (enemyHpRatio < 0.2) {
                action = 'defend';
            }
        }

        // 5. 考虑防御
        if (playerElementMultiplier > 1.5 && enemyHpRatio < 0.5) {
            action = 'defend';
        } else if (playerHpRatio > 0.8 && enemyHpRatio < 0.3) {
            action = 'defend';
        }

        // 6. 考虑使用高伤害技能
        if (availableSkills.length > 0) {
            // 按伤害排序
            const damageSkills = availableSkills.filter(skill => skill.damage);
            if (damageSkills.length > 0) {
                // 优先使用元素优势技能
                const elementSkills = damageSkills.filter(skill => elementMultiplier > 1);
                if (elementSkills.length > 0) {
                    action = 'skill';
                    elementSkills.sort((a, b) => (b.damage || 0) - (a.damage || 0));
                    selectedSkillIndex = enemy.skills.indexOf(elementSkills[0]);
                } else if (enemyMpRatio > 0.5 && Math.random() < 0.6) {
                    // 有足够魔力时使用技能
                    action = 'skill';
                    damageSkills.sort((a, b) => (b.damage || 0) - (a.damage || 0));
                    selectedSkillIndex = enemy.skills.indexOf(damageSkills[0]);
                }
            }
        }

        this.game.battleState.enemySkillIndex = selectedSkillIndex;
        this.game.battleState.enemyAction = action;
    }

    performAutoAction() {
        const spirit = this.core.getCurrentPlayerSpirit();
        if (!spirit) return;

        const enemySpirit = this.core.getCurrentEnemySpirit();
        if (!enemySpirit) return;

        const spiritHpRatio = spirit.currentHp / spirit.maxHp;
        const enemyHpRatio = enemySpirit.currentHp / enemySpirit.maxHp;

        const elementMultiplier = getElementMultiplier(spirit.element, enemySpirit.element);
        const enemyElementMultiplier = getElementMultiplier(enemySpirit.element, spirit.element);

        const availableSkills = spirit.skills.filter(skill => {
            return skill.mpCost === 0 || skill.mpCost === undefined || spirit.currentMp >= skill.mpCost;
        });

        let action = 'attack';
        let selectedSkillIndex = 0;

        if (spiritHpRatio < 0.2 && Object.keys(this.game.player.inventory).some(key => ITEMS[key].heal)) {
            action = 'item';
            const healItems = Object.keys(this.game.player.inventory).filter(key => ITEMS[key].heal);
            healItems.sort((a, b) => ITEMS[b].heal - ITEMS[a].heal);
            this.game.battleState.selectedItem = healItems[0];
        } else if (availableSkills.length === 0 && Object.keys(this.game.player.inventory).some(key => ITEMS[key].mp)) {
            action = 'item';
            const mpItems = Object.keys(this.game.player.inventory).filter(key => ITEMS[key].mp);
            mpItems.sort((a, b) => ITEMS[b].mp - ITEMS[a].mp);
            this.game.battleState.selectedItem = mpItems[0];
        } else if (spiritHpRatio < 0.3 && enemyElementMultiplier > 1) {
            action = 'defend';
        } else if (spiritHpRatio < 0.4) {
            const healSkill = availableSkills.find(skill => skill.heal);
            if (healSkill) {
                action = 'skill';
                selectedSkillIndex = spirit.skills.indexOf(healSkill);
            }
        } else if (elementMultiplier > 1 && availableSkills.length > 0) {
            action = 'skill';
            availableSkills.sort((a, b) => (b.damage || 0) - (a.damage || 0));
            selectedSkillIndex = spirit.skills.indexOf(availableSkills[0]);
        } else if (availableSkills.length > 0) {
            action = 'skill';
            selectedSkillIndex = spirit.skills.indexOf(availableSkills[0]);
        }

        if (action === 'skill') {
            this.game.battleState.selectedSkill = selectedSkillIndex;
        }

        this.ui.selectAction(action);
    }
}

window.BattleAI = BattleAI;