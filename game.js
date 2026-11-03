class Game {
    constructor() {
        this.currentScreen = 'title';
        this.player = {
            gold: 100,
            wins: 0,
            losses: 0,
            ownedSpirits: [],
            fragments: {},
            battleTeam: [],
            inventory: {},
            battleRecords: [],
            equipment: [],
            shopEquipment: []
        };
        this.initialChoices = [];
        this.selectedSpirit = null;
        this.enemyTeam = [];
        this.battleState = null;
        this.battleRecords = [];
        this.isAutoBattle = false;
        this.pendingSkillSpirit = null;
        this.pendingUpgradeSpirit = null;
        
        this.uiManager = new UIManager(this);
        this.spiritManager = new SpiritManager(this);
        this.battleSystem = new BattleSystem(this);
        this.saveSystem = new SaveSystem(this);
        this.dataManager = new DataManager(this);
        
        // 检查并清理无用数据
        this.dataManager.checkAndCleanup();
        
        this.uiManager.initElements();
        this.uiManager.initEventListeners();
        this.saveSystem.loadRecords();
    }
    
    startNewGame() {
        // 初始化新游戏数据
        this.dataManager.initNewGame();
        
        this.player = {
            gold: 100,
            wins: 0,
            losses: 0,
            ownedSpirits: [],
            fragments: {},
            battleTeam: [],
            inventory: {},
            battleRecords: [],
            equipment: [],
            shopEquipment: generateEquipmentBatch(6)
        };
        this.initialChoices = this.spiritManager.getRandomSpirits(5);
        this.selectedSpirit = null;
        this.spiritManager.renderInitialSelection();
        this.uiManager.showScreen('selection');
    }
    
    getRandomSpirits(count) {
        return this.spiritManager.getRandomSpirits(count);
    }
    
    showScreen(screenName) {
        this.uiManager.showScreen(screenName);
    }
    
    showToast(message, type = 'info') {
        this.uiManager.showToast(message, type);
    }
    
    updateMainScreen() {
        this.uiManager.updateMainScreen();
    }
}

window.game = new Game();
