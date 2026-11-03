class BattleUI {
    constructor(game) {
        this.game = game;
    }

    showSkillSelect() {
        const spirit = this.core.getCurrentPlayerSpirit();
        if (!spirit || spirit.skills.length === 0) return;

        this.game.uiManager.elements.battleSkillList.innerHTML = '';
        spirit.skills.forEach((skill, index) => {
            const div = document.createElement('div');
            div.className = 'battle-skill';
            const hasEnoughMp = spirit.currentMp >= (skill.mpCost || 0);

            div.innerHTML = `
                <div class="skill-info">
                    <div class="skill-name">${skill.name} ${skill.mpCost ? `(💙${skill.mpCost})` : ''}</div>
                    <div class="skill-description">${skill.description}</div>
                </div>
            `;

            if (!hasEnoughMp) {
                div.style.opacity = '0.5';
                div.style.cursor = 'not-allowed';
                div.innerHTML += '<span style="color: #e74c3c;">魔力不足</span>';
            } else {
                div.addEventListener('click', () => {
                    this.game.battleState.selectedSkill = index;
                    this.game.uiManager.elements.skillSelectModal.classList.remove('active');
                    this.game.battleSystem.selectAction('skill');
                });
            }

            this.game.uiManager.elements.battleSkillList.appendChild(div);
        });

        this.game.uiManager.elements.skillSelectModal.classList.add('active');
    }

    showItemSelect() {
        const items = Object.keys(this.game.player.inventory).filter(key => this.game.player.inventory[key] > 0);
        if (items.length === 0) {
            this.game.uiManager.showToast('背包中没有道具！', 'warning');
            return;
        }

        this.game.uiManager.elements.battleItemList.innerHTML = '';
        items.forEach(key => {
            const item = ITEMS[key];
            const count = this.game.player.inventory[key];

            const div = document.createElement('div');
            div.className = 'battle-item';
            div.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.icon} ${item.name}</div>
                    <div class="item-description">${item.description}</div>
                </div>
                <div class="item-count">x${count}</div>
            `;

            div.addEventListener('click', () => {
                this.game.battleState.selectedItem = key;
                this.game.uiManager.elements.itemSelectModal.classList.remove('active');
                this.game.battleSystem.selectAction('item');
            });

            this.game.uiManager.elements.battleItemList.appendChild(div);
        });

        this.game.uiManager.elements.itemSelectModal.classList.add('active');
    }

    showSpiritReplaceModal(callback, selectedSpirit = null) {
        const container = this.game.uiManager.elements.replaceSpiritContent;
        container.innerHTML = '';

        const currentIndex = this.game.battleState.playerCurrentIndex;
        const currentSpirit = this.game.player.battleTeam[currentIndex];
        if (!currentSpirit || currentSpirit.currentHp <= 0) return;

        const title = document.createElement('h3');
        title.textContent = '选择要替换的精灵';
        container.appendChild(title);

        // 存储选中的精灵
        let selectedReplaceSpirit = null;

        // 创建三个精灵卡片的容器
        const spiritsGrid = document.createElement('div');
        spiritsGrid.className = 'replace-spirits-row';
        spiritsGrid.style.display = 'grid';
        spiritsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        spiritsGrid.style.gap = '15px';
        spiritsGrid.style.marginBottom = '20px';

        // 显示所有3个精灵（包括当前精灵和已死亡的）
        this.game.player.battleTeam.forEach((spirit, index) => {
            const spiritCard = document.createElement('div');
            const isCurrent = index === currentIndex;
            const isDead = spirit.currentHp <= 0;
            const isSelectable = !isCurrent && !isDead;

            spiritCard.className = 'spirit-card replace-spirit-card';
            if (isCurrent) {
                spiritCard.classList.add('current-spirit-card');
                spiritCard.style.opacity = '0.6';
                spiritCard.style.cursor = 'not-allowed';
            } else if (isDead) {
                spiritCard.classList.add('dead-spirit-card');
                spiritCard.style.opacity = '0.4';
                spiritCard.style.cursor = 'not-allowed';
            } else {
                spiritCard.style.cursor = 'pointer';
            }
            spiritCard.dataset.spiritId = spirit.id;

            const element = ELEMENTS[spirit.element];
            const hpPercent = (spirit.currentHp / spirit.maxHp) * 100;
            let hpClass = '';
            if (hpPercent < 30) hpClass = 'low';
            else if (hpPercent < 60) hpClass = 'medium';

            let statusText = '';
            if (isCurrent) {
                statusText = '<span style="color: #f39c12; font-weight: bold;">当前出战</span>';
            } else if (isDead) {
                statusText = '<span style="color: #e74c3c; font-weight: bold;">已死亡</span>';
            }

            spiritCard.innerHTML = `
                <div class="spirit-icon">${spirit.icon}</div>
                <div class="spirit-name">${spirit.name}</div>
                <div class="spirit-level">Lv.${spirit.level}</div>
                <div class="spirit-element" style="color: ${element.color};">${element.name} ${element.icon}</div>
                ${statusText ? `<div class="spirit-status">${statusText}</div>` : ''}
                <div class="hp-bar">
                    <div class="hp-bar-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                </div>
                <div class="hp-text">${spirit.currentHp}/${spirit.maxHp}</div>
                <div class="spirit-stats">
                    <span>MP:${spirit.currentMp}/${spirit.maxMp}</span>
                    <span>ATK:${spirit.atk}</span>
                    <span>DEF:${spirit.def}</span>
                </div>
            `;

            // 只有可选的精灵才能点击
            if (isSelectable) {
                spiritCard.addEventListener('click', () => {
                    // 移除其他卡片的选中状态
                    spiritsGrid.querySelectorAll('.spirit-card').forEach(card => {
                        card.style.border = '';
                        card.style.boxShadow = '';
                    });
                    // 添加选中状态
                    spiritCard.style.border = '3px solid #3498db';
                    spiritCard.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.5)';
                    // 存储选中的精灵
                    selectedReplaceSpirit = spirit;
                });
            }

            spiritsGrid.appendChild(spiritCard);
        });

        container.appendChild(spiritsGrid);

        // 添加按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '15px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginTop = '20px';

        // 添加返回按钮
        const backButton = document.createElement('button');
        backButton.className = 'action-btn secondary';
        backButton.textContent = '返回';
        backButton.addEventListener('click', () => {
            this.game.uiManager.elements.replaceSpiritModal.classList.remove('active');
            // 只是关闭模态框，不进行任何其他操作
        });
        buttonContainer.appendChild(backButton);

        // 添加确认按钮
        const confirmButton = document.createElement('button');
        confirmButton.className = 'action-btn';
        confirmButton.textContent = '确认';
        confirmButton.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
        confirmButton.addEventListener('click', () => {
            if (selectedReplaceSpirit) {
                // 执行替换
                this.switchActiveSpirit(this.game.battleState.playerCurrentIndex, selectedReplaceSpirit);
                this.game.uiManager.elements.replaceSpiritModal.classList.remove('active');
                // 设置玩家行动为replace，并执行回合
                this.game.battleState.playerAction = 'replace';
                this.game.battleSystem.actions.executeTurn();
            } else {
                this.game.uiManager.showToast('请先选择一个精灵！', 'warning');
            }
        });
        buttonContainer.appendChild(confirmButton);

        container.appendChild(buttonContainer);

        // 为关闭按钮添加事件处理
        const closeBtn = document.getElementById('close-replace-spirit-modal');
        if (closeBtn) {
            // 移除之前的事件监听器（如果有）
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // 添加新的事件监听器
            newCloseBtn.addEventListener('click', () => {
                this.game.uiManager.elements.replaceSpiritModal.classList.remove('active');
                // 只是关闭模态框，不进行任何其他操作
            });
        }

        this.game.uiManager.elements.replaceSpiritModal.classList.add('active');
    }

    showSkillLearnModal(spirit) {
        // 初始化技能学习队列
        if (!this.game.skillLearnQueue) {
            this.game.skillLearnQueue = [];
        }

        const learnedSkillNames = spirit.skills.map(s => s.name);
        const availableNewSkills = spirit.availableSkills.filter(s => !learnedSkillNames.includes(s.name));

        if (availableNewSkills.length === 0) return;

        // 将精灵添加到技能学习队列
        this.game.skillLearnQueue.push(spirit);

        // 如果队列中只有一个精灵，立即处理
        if (this.game.skillLearnQueue.length === 1) {
            this.processSkillLearnQueue();
        }
    }

    processSkillLearnQueue() {
        if (!this.game.skillLearnQueue || this.game.skillLearnQueue.length === 0) return;

        const spirit = this.game.skillLearnQueue[0];
        this.game.pendingSkillSpirit = spirit;
        this.game.uiManager.elements.skillChoices.innerHTML = '';

        const learnedSkillNames = spirit.skills.map(s => s.name);
        const availableNewSkills = spirit.availableSkills.filter(s => !learnedSkillNames.includes(s.name));

        if (availableNewSkills.length === 0) {
            // 如果没有可用技能，从队列中移除并处理下一个
            this.game.skillLearnQueue.shift();
            this.processSkillLearnQueue();
            return;
        }

        const randomSkills = availableNewSkills.sort(() => Math.random() - 0.5).slice(0, 3);
        spirit.pendingSkillChoices = randomSkills;

        randomSkills.forEach((skill, index) => {
            const div = document.createElement('div');
            div.className = 'skill-choice';
            div.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-description">${skill.description}</div>
            `;
            div.addEventListener('click', () => this.selectNewSkill(index));
            this.game.uiManager.elements.skillChoices.appendChild(div);
        });

        this.game.uiManager.elements.learnSkillModal.classList.add('active');
    }

    showSkillUpgradeModal(spirit) {
        // 初始化进化队列
        if (!this.game.evolutionQueue) {
            this.game.evolutionQueue = [];
        }

        // 将精灵添加到进化队列
        this.game.evolutionQueue.push(spirit);

        // 如果队列中只有一个精灵，立即处理
        if (this.game.evolutionQueue.length === 1) {
            this.processEvolutionQueue();
        }
    }

    processEvolutionQueue() {
        if (!this.game.evolutionQueue || this.game.evolutionQueue.length === 0) return;

        const spirit = this.game.evolutionQueue[0];
        this.game.pendingSkillSpirit = spirit;
        this.game.uiManager.elements.upgradeSkillChoices.innerHTML = '';

        spirit.skills.forEach((skill, index) => {
            const div = document.createElement('div');
            div.className = 'skill-choice';
            div.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-description">${skill.description}</div>
                <div class="skill-upgrade-hint">升级为超级技能</div>
            `;
            div.addEventListener('click', () => this.upgradeSkill(index));
            this.game.uiManager.elements.upgradeSkillChoices.appendChild(div);
        });

        this.game.uiManager.elements.upgradeSkillModal.classList.add('active');
    }

    selectNewSkill(index) {
        const spirit = this.game.pendingSkillSpirit;
        if (!spirit || !spirit.pendingSkillChoices) return;

        const selectedSkill = spirit.pendingSkillChoices[index];
        if (selectedSkill) {
            spirit.skills.push(selectedSkill);
            this.addBattleLog(`${spirit.name} 学会了新技能 ${selectedSkill.name}！`, 'buff');
            // 保存精灵技能学习记录
            this.game.dataManager.saveSpiritSkillLearn(spirit, selectedSkill);
        }

        this.game.pendingSkillSpirit = null;
        this.game.uiManager.elements.learnSkillModal.classList.remove('active');

        // 从队列中移除当前精灵并处理下一个
        if (this.game.skillLearnQueue) {
            this.game.skillLearnQueue.shift();
            this.processSkillLearnQueue();
        }
    }

    upgradeSkill(index) {
        const spirit = this.game.pendingSkillSpirit;
        if (!spirit || !spirit.skills[index]) return;

        const skill = spirit.skills[index];
        skill.name = `超级${skill.name}`;
        skill.damage = (skill.damage || 1) * 1.5;
        skill.heal = (skill.heal || 0) * 1.5;
        skill.description = `超级强化版 ${skill.description}`;

        this.addBattleLog(`${spirit.name} 的 ${skill.name} 升级为超级技能！`, 'buff');
        // 保存精灵技能学习记录（用于技能升级）
        this.game.dataManager.saveSpiritSkillLearn(spirit, skill);

        this.game.pendingSkillSpirit = null;
        this.game.uiManager.elements.upgradeSkillModal.classList.remove('active');

        // 从队列中移除当前精灵并处理下一个
        if (this.game.evolutionQueue) {
            this.game.evolutionQueue.shift();
            this.processEvolutionQueue();
        }
    }

    checkSkillLearn(spirit, oldLevel) {
        if (spirit.level >= 5 && oldLevel < 5) {
            this.showSkillLearnModal(spirit);
        }
        if (spirit.level >= 10 && oldLevel < 10) {
            this.showSkillLearnModal(spirit);
        }
        if (spirit.level >= 12 && oldLevel < 12) {
            this.showSkillLearnModal(spirit);
        }
        if ((spirit.level >= 15 && oldLevel < 15) || (spirit.level >= 20 && oldLevel < 20)) {
            this.showSkillUpgradeModal(spirit);
        }
    }

    showShop() {
        const shopItems = this.game.uiManager.elements.shopItems;
        const shopGold = this.game.uiManager.elements.shopGold;
        const shopInventoryList = this.game.uiManager.elements.shopInventoryList;

        // 更新金币显示
        shopGold.textContent = parseInt(this.game.player.gold) || 0;

        // 创建标签页切换
        const tabsHtml = `
            <div class="shop-tabs" style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button class="shop-tab active" data-tab="items">道具</button>
                <button class="shop-tab" data-tab="equipment">装备</button>
            </div>
            <div id="shop-items-container"></div>
            <div id="shop-equipment-container" style="display: none;"></div>
        `;
        shopItems.innerHTML = tabsHtml;

        // 渲染道具
        const itemsContainer = document.getElementById('shop-items-container');
        this.renderShopItems(itemsContainer, shopGold, shopInventoryList);

        // 渲染装备
        const equipmentContainer = document.getElementById('shop-equipment-container');
        this.renderShopEquipment(equipmentContainer, shopGold, shopInventoryList);

        // 标签页切换事件
        shopItems.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                shopItems.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabName = tab.dataset.tab;
                const itemsContainer = document.getElementById('shop-items-container');
                const equipmentContainer = document.getElementById('shop-equipment-container');
                
                if (tabName === 'items') {
                    itemsContainer.style.display = 'grid';
                    equipmentContainer.style.display = 'none';
                } else {
                    itemsContainer.style.display = 'none';
                    equipmentContainer.style.display = 'grid';
                }
            });
        });

        // 显示背包
        shopInventoryList.innerHTML = '';
        
        // 显示道具
        const inventoryItems = Object.keys(this.game.player.inventory).filter(key => this.game.player.inventory[key] > 0);
        if (inventoryItems.length > 0) {
            inventoryItems.forEach(key => {
                const item = ITEMS[key];
                const count = this.game.player.inventory[key];
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.innerHTML = `
                    <div class="item-info">
                        <div class="item-name">${item.icon} ${item.name}</div>
                        <div class="item-description">${item.description}</div>
                    </div>
                    <div class="item-count">x${count}</div>
                `;
                shopInventoryList.appendChild(div);
            });
        }
        
        // 显示未装备的装备
        const playerEquipment = this.game.player.equipment || [];
        const unequippedEquipment = playerEquipment.filter(e => !e.equipped);
        if (unequippedEquipment.length > 0) {
            unequippedEquipment.forEach(equip => {
                const rarityInfo = EQUIPMENT_RARITIES[equip.rarity];
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.innerHTML = `
                    <div class="item-info">
                        <div class="item-name">${equip.icon} ${equip.name} <span style="color: ${rarityInfo.color}; font-size: 0.8em;">[${rarityInfo.name}]</span></div>
                        <div class="item-description">${EQUIPMENT_TYPES[equip.type].name}</div>
                    </div>
                `;
                shopInventoryList.appendChild(div);
            });
        }
        
        if (inventoryItems.length === 0 && unequippedEquipment.length === 0) {
            const noItemsDiv = document.createElement('div');
            noItemsDiv.className = 'no-items';
            noItemsDiv.textContent = '背包中没有道具！';
            shopInventoryList.appendChild(noItemsDiv);
        }

        this.game.uiManager.showScreen('shop');
    }

    selectAction(action) {
        if (this.game.battleState.phase !== 'select') return;

        this.game.battleState.playerAction = action;
        this.game.battleSystem.actions.executeTurn();
    }

    switchActiveSpirit(currentIndex, newSpirit) {
        this.game.battleSystem.actions.switchActiveSpirit(currentIndex, newSpirit);
    }

    renderShopItems(container, shopGold, shopInventoryList) {
        container.innerHTML = '';
        Object.keys(ITEMS).forEach(key => {
            const item = ITEMS[key];
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.icon} ${item.name}</div>
                    <div class="item-description">${item.description}</div>
                </div>
                <div class="item-price">${item.price}💰</div>
                <button class="buy-btn" data-item="${key}">购买</button>
            `;
            container.appendChild(div);

            // 添加购买按钮事件
            div.querySelector('.buy-btn').addEventListener('click', () => {
                const currentGold = parseInt(this.game.player.gold) || 0;
                const itemPrice = parseInt(item.price) || 0;
                if (currentGold >= itemPrice) {
                    this.game.player.gold = currentGold - itemPrice;
                    this.game.player.inventory[key] = (this.game.player.inventory[key] || 0) + 1;
                    this.game.uiManager.showToast(`购买了 ${item.name}！`, 'success');
                    // 更新金币显示
                    shopGold.textContent = this.game.player.gold;
                    // 刷新背包显示
                    this.renderShopInventory(shopInventoryList);
                } else {
                    this.game.uiManager.showToast('金币不足！', 'error');
                }
            });
        });
    }

    renderShopEquipment(container, shopGold, shopInventoryList) {
        container.innerHTML = '';
        
        // 如果没有商店装备，生成一批
        if (!this.game.player.shopEquipment || this.game.player.shopEquipment.length === 0) {
            this.game.player.shopEquipment = generateEquipmentBatch(6);
        }
        
        this.game.player.shopEquipment.forEach((equip, index) => {
            const rarityInfo = EQUIPMENT_RARITIES[equip.rarity];
            const statsText = equip.stats.map(s => `${s.name}+${s.value}`).join(', ');
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${equip.icon} ${equip.name} <span style="color: ${rarityInfo.color}; font-size: 0.8em;">[${rarityInfo.name}]</span></div>
                    <div class="item-description">${EQUIPMENT_TYPES[equip.type].name} | ${statsText}</div>
                </div>
                <div class="item-price">${equip.price}💰</div>
                <button class="buy-equip-btn" data-index="${index}">购买</button>
            `;
            container.appendChild(div);

            // 添加购买按钮事件
            div.querySelector('.buy-equip-btn').addEventListener('click', () => {
                const currentGold = parseInt(this.game.player.gold) || 0;
                const equipPrice = parseInt(equip.price) || 0;
                if (currentGold >= equipPrice) {
                    this.game.player.gold = currentGold - equipPrice;
                    const boughtEquip = this.game.player.shopEquipment.splice(index, 1)[0];
                    this.game.player.equipment.push(boughtEquip);
                    this.game.uiManager.showToast(`购买了 ${boughtEquip.name}！`, 'success');
                    
                    // 补充新装备
                    this.game.player.shopEquipment.push(generateRandomEquipment());
                    // 更新金币显示
                    shopGold.textContent = this.game.player.gold;
                    // 刷新装备显示
                    this.renderShopEquipment(container, shopGold, shopInventoryList);
                    // 刷新背包显示
                    this.renderShopInventory(shopInventoryList);
                } else {
                    this.game.uiManager.showToast('金币不足！', 'error');
                }
            });
        });
    }

    renderShopInventory(container) {
        container.innerHTML = '';
        
        // 显示道具
        const inventoryItems = Object.keys(this.game.player.inventory).filter(key => this.game.player.inventory[key] > 0);
        if (inventoryItems.length > 0) {
            inventoryItems.forEach(key => {
                const item = ITEMS[key];
                const count = this.game.player.inventory[key];
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.innerHTML = `
                    <div class="item-info">
                        <div class="item-name">${item.icon} ${item.name}</div>
                        <div class="item-description">${item.description}</div>
                    </div>
                    <div class="item-count">x${count}</div>
                `;
                container.appendChild(div);
            });
        }
        
        // 显示未装备的装备
        const playerEquipment = this.game.player.equipment || [];
        const unequippedEquipment = playerEquipment.filter(e => !e.equipped);
        if (unequippedEquipment.length > 0) {
            unequippedEquipment.forEach(equip => {
                const rarityInfo = EQUIPMENT_RARITIES[equip.rarity];
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.innerHTML = `
                    <div class="item-info">
                        <div class="item-name">${equip.icon} ${equip.name} <span style="color: ${rarityInfo.color}; font-size: 0.8em;">[${rarityInfo.name}]</span></div>
                        <div class="item-description">${EQUIPMENT_TYPES[equip.type].name}</div>
                    </div>
                `;
                container.appendChild(div);
            });
        }
        
        if (inventoryItems.length === 0 && unequippedEquipment.length === 0) {
            const noItemsDiv = document.createElement('div');
            noItemsDiv.className = 'no-items';
            noItemsDiv.textContent = '背包中没有道具！';
            container.appendChild(noItemsDiv);
        }
    }
}
window.BattleUI = BattleUI;
