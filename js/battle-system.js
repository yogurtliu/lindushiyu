class BattleSystem {
    constructor(game) {
        this.game = game;
        
        // 初始化各个模块
        this.core = new BattleCore(game);
        this.actions = new BattleActions(game);
        this.ui = new BattleUI(game);
        this.team = new BattleTeam(game);
        this.ai = new BattleAI(game);
        
        // 保存引用到各个模块
        this.core.actions = this.actions;
        this.core.ui = this.ui;
        this.core.ai = this.ai;
        
        this.actions.core = this.core;
        this.actions.ui = this.ui;
        this.actions.ai = this.ai;
        
        this.ui.core = this.core;
        this.ui.actions = this.actions;
        
        this.team.core = this.core;
        
        this.ai.core = this.core;
        this.ai.actions = this.actions;
        this.ai.ui = this.ui;
        this.ai.battleSystem = this;
    }

    // 队伍管理相关方法
    prepareBattle() {
        this.team.prepareBattle();
    }

    showTeamSelect() {
        this.team.showTeamSelect();
    }

    showTeamSelectScreen() {
        this.team.showTeamSelectScreen();
    }

    toggleTeamSelection(spirit, card) {
        this.team.toggleTeamSelection(spirit, card);
    }

    refreshTeamSelectScreen() {
        this.team.refreshTeamSelectScreen();
    }

    updateTeamSelectCount() {
        this.team.updateTeamSelectCount();
    }

    confirmTeamSelection() {
        this.team.confirmTeamSelection();
    }

    // 战斗核心相关方法
    startBattle() {
        console.log('开始执行 battle-system.js 中的 startBattle 方法');
        this.core.startBattle();
        console.log('battle-core.js 中的 startBattle 方法已调用');
    }

    generateEnemyTeam() {
        return this.core.generateEnemyTeam();
    }

    getCurrentPlayerSpirit() {
        return this.core.getCurrentPlayerSpirit();
    }

    getCurrentEnemySpirit() {
        return this.core.getCurrentEnemySpirit();
    }

    findNextAliveSpirit(isPlayer) {
        this.core.findNextAliveSpirit(isPlayer);
    }

    startTurn() {
        this.core.startTurn();
    }

    endTurn() {
        this.core.endTurn();
    }

    isTeamDead(team) {
        return this.core.isTeamDead(team);
    }

    checkBattleEnd() {
        return this.core.checkBattleEnd();
    }

    endBattle(victory) {
        this.core.endBattle(victory);
    }

    generateFragments() {
        return this.core.generateFragments();
    }

    addBattleLog(message, type = 'normal') {
        this.core.addBattleLog(message, type);
    }

    renderBattleTeams() {
        this.core.renderBattleTeams();
    }

    renderTeamInBattle(container, team, isPlayer) {
        this.core.renderTeamInBattle(container, team, isPlayer);
    }

    updateBattleButtons(enabled) {
        this.core.updateBattleButtons(enabled);
    }

    // 战斗动作相关方法
    selectAction(action) {
        if (this.game.battleState.phase !== 'select') return;

        // 如果是替换行动，直接显示模态框，不设置playerAction
        if (action === 'replace') {
            this.ui.showSpiritReplaceModal(null);
            return;
        }

        this.game.battleState.playerAction = action;
        this.actions.executeTurn();
    }

    executeTurn() {
        this.actions.executeTurn();
    }

    executeActions(actions, index) {
        this.actions.executeActions(actions, index);
    }

    executePlayerAction(attacker, target, action, callback) {
        this.actions.executePlayerAction(attacker, target, action, callback);
    }

    executeEnemyAction(attacker, target, action) {
        this.actions.executeEnemyAction(attacker, target, action);
    }

    performAttack(attacker, defender) {
        this.actions.performAttack(attacker, defender);
    }

    performDefend(attacker, index, isPlayer) {
        this.actions.performDefend(attacker, index, isPlayer);
    }

    performSkill(attacker, target, skillIndex) {
        this.actions.performSkill(attacker, target, skillIndex);
    }

    handleSkillEffect(attacker, target, skill) {
        this.actions.handleSkillEffect(attacker, target, skill);
    }

    addBuff(spiritKey, buff) {
        this.actions.addBuff(spiritKey, buff);
    }

    useBattleItem() {
        this.actions.useBattleItem();
    }

    switchActiveSpirit(currentIndex, newSpirit) {
        this.actions.switchActiveSpirit(currentIndex, newSpirit);
    }

    replaceSpirit(currentSpirit, newSpirit) {
        this.actions.replaceSpirit(currentSpirit, newSpirit);
    }

    // 战斗 UI 相关方法
    showSkillSelect() {
        this.ui.showSkillSelect();
    }

    showItemSelect() {
        this.ui.showItemSelect();
    }

    showSpiritReplaceModal(callback, selectedSpirit = null) {
        this.ui.showSpiritReplaceModal(callback, selectedSpirit);
    }

    showSkillLearnModal(spirit) {
        this.ui.showSkillLearnModal(spirit);
    }

    showSkillUpgradeModal(spirit) {
        this.ui.showSkillUpgradeModal(spirit);
    }

    selectNewSkill(index) {
        this.ui.selectNewSkill(index);
    }

    upgradeSkill(index) {
        this.ui.upgradeSkill(index);
    }

    checkSkillLearn(spirit, oldLevel) {
        this.ui.checkSkillLearn(spirit, oldLevel);
    }

    // AI 相关方法
    selectEnemyAction() {
        this.ai.selectEnemyAction();
    }

    performAutoAction() {
        this.ai.performAutoAction();
    }

    // 其他方法
    showShop() {
        this.ui.showShop();
    }

    toggleAutoBattle() {
        this.game.isAutoBattle = !this.game.isAutoBattle;
        this.updateBattleButtons(true);
        
        // 如果开启自动战斗，立即执行自动动作
        if (this.game.isAutoBattle && this.game.battleState.phase === 'select') {
            this.ai.performAutoAction();
        }
    }
}
window.BattleSystem = BattleSystem;