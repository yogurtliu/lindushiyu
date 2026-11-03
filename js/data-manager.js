class DataManager {
    constructor(game) {
        this.game = game;
        this.gameId = null;
    }

    // 初始化新游戏数据
    initNewGame() {
        // 生成唯一的游戏ID
        this.gameId = this.generateGameId();
        
        // 初始化游戏数据结构
        const gameData = {
            gameId: this.gameId,
            initialData: {
                spirits: [],
                randomElements: {
                    seed: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now()
                }
            },
            spiritRecords: {},
            replacedSpirits: [],
            createdAt: new Date().toISOString()
        };
        
        // 保存游戏数据
        localStorage.setItem(`lindushiyu_game_${this.gameId}`, JSON.stringify(gameData));
        
        // 保存当前游戏ID
        localStorage.setItem('lindushiyu_current_game', this.gameId);
        
        return this.gameId;
    }

    // 生成游戏ID
    generateGameId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 保存精灵初始数据
    saveSpiritInitialData(spirit) {
        if (!this.gameId) {
            this.gameId = localStorage.getItem('lindushiyu_current_game');
        }
        
        if (!this.gameId) return;
        
        const gameData = this.getGameData();
        if (!gameData) return;
        
        // 保存精灵初始数据
        gameData.initialData.spirits.push({
            id: spirit.id,
            name: spirit.name,
            baseAtk: spirit.baseAtk,
            baseDef: spirit.baseDef,
            baseHp: spirit.baseHp,
            baseMp: spirit.baseMp,
            baseCritRate: spirit.baseCritRate,
            baseCritDamage: spirit.baseCritDamage,
            baseSpeed: spirit.baseSpeed,
            baseAccuracy: spirit.baseAccuracy,
            level: 1,
            potential: spirit.potential,
            rarity: spirit.rarity,
            element: spirit.element,
            skills: spirit.skills
        });
        
        // 保存精灵记录
        if (!gameData.spiritRecords[spirit.id]) {
            gameData.spiritRecords[spirit.id] = [
                {
                    level: 1,
                    atk: spirit.atk,
                    def: spirit.def,
                    maxHp: spirit.maxHp,
                    maxMp: spirit.maxMp,
                    critRate: spirit.critRate,
                    critDamage: spirit.critDamage,
                    speed: spirit.speed,
                    accuracy: spirit.accuracy,
                    skills: spirit.skills,
                    timestamp: new Date().toISOString(),
                    type: 'initial'
                }
            ];
        }
        
        localStorage.setItem(`lindushiyu_game_${this.gameId}`, JSON.stringify(gameData));
    }

    // 保存精灵升级记录
    saveSpiritLevelUp(spirit, oldLevel) {
        if (!this.gameId) {
            this.gameId = localStorage.getItem('lindushiyu_current_game');
        }
        
        if (!this.gameId) return;
        
        const gameData = this.getGameData();
        if (!gameData) return;
        
        if (!gameData.spiritRecords[spirit.id]) {
            gameData.spiritRecords[spirit.id] = [];
        }
        
        // 重新计算基础属性（不包含装备加成）
        const baseStats = { ...spirit };
        calculateStats(baseStats);
        
        gameData.spiritRecords[spirit.id].push({
            level: spirit.level,
            atk: baseStats.atk,
            def: baseStats.def,
            maxHp: baseStats.maxHp,
            maxMp: baseStats.maxMp,
            critRate: baseStats.critRate,
            critDamage: baseStats.critDamage,
            speed: baseStats.speed,
            accuracy: baseStats.accuracy,
            skills: spirit.skills,
            timestamp: new Date().toISOString(),
            type: 'level_up',
            oldLevel: oldLevel
        });
        
        localStorage.setItem(`lindushiyu_game_${this.gameId}`, JSON.stringify(gameData));
    }

    // 保存精灵进化记录
    saveSpiritEvolution(spirit) {
        if (!this.gameId) {
            this.gameId = localStorage.getItem('lindushiyu_current_game');
        }
        
        if (!this.gameId) return;
        
        const gameData = this.getGameData();
        if (!gameData) return;
        
        if (!gameData.spiritRecords[spirit.id]) {
            gameData.spiritRecords[spirit.id] = [];
        }
        
        // 重新计算基础属性（不包含装备加成）
        const baseStats = { ...spirit };
        calculateStats(baseStats);
        
        gameData.spiritRecords[spirit.id].push({
            level: spirit.level,
            atk: baseStats.atk,
            def: baseStats.def,
            maxHp: baseStats.maxHp,
            maxMp: baseStats.maxMp,
            critRate: baseStats.critRate,
            critDamage: baseStats.critDamage,
            speed: baseStats.speed,
            accuracy: baseStats.accuracy,
            skills: spirit.skills,
            timestamp: new Date().toISOString(),
            type: 'evolution'
        });
        
        localStorage.setItem(`lindushiyu_game_${this.gameId}`, JSON.stringify(gameData));
    }

    // 保存精灵技能学习记录
    saveSpiritSkillLearn(spirit, newSkill) {
        if (!this.gameId) {
            this.gameId = localStorage.getItem('lindushiyu_current_game');
        }
        
        if (!this.gameId) return;
        
        const gameData = this.getGameData();
        if (!gameData) return;
        
        if (!gameData.spiritRecords[spirit.id]) {
            gameData.spiritRecords[spirit.id] = [];
        }
        
        // 重新计算基础属性（不包含装备加成）
        const baseStats = { ...spirit };
        calculateStats(baseStats);
        
        gameData.spiritRecords[spirit.id].push({
            level: spirit.level,
            atk: baseStats.atk,
            def: baseStats.def,
            maxHp: baseStats.maxHp,
            maxMp: baseStats.maxMp,
            critRate: baseStats.critRate,
            critDamage: baseStats.critDamage,
            speed: baseStats.speed,
            accuracy: baseStats.accuracy,
            skills: spirit.skills,
            timestamp: new Date().toISOString(),
            type: 'skill_learn',
            newSkill: newSkill
        });
        
        localStorage.setItem(`lindushiyu_game_${this.gameId}`, JSON.stringify(gameData));
    }

    // 保存精灵经验值变更
    saveSpiritExp(spirit, expGained) {
        if (!this.gameId) {
            this.gameId = localStorage.getItem('lindushiyu_current_game');
        }
        
        if (!this.gameId) return;
        
        const gameData = this.getGameData();
        if (!gameData) return;
        
        if (!gameData.spiritRecords[spirit.id]) {
            gameData.spiritRecords[spirit.id] = [];
        }
        
        // 重新计算基础属性（不包含装备加成）
        const baseStats = { ...spirit };
        calculateStats(baseStats);
        
        gameData.spiritRecords[spirit.id].push({
            level: spirit.level,
            atk: baseStats.atk,
            def: baseStats.def,
            maxHp: baseStats.maxHp,
            maxMp: baseStats.maxMp,
            critRate: baseStats.critRate,
            critDamage: baseStats.critDamage,
            speed: baseStats.speed,
            accuracy: baseStats.accuracy,
            skills: spirit.skills,
            exp: spirit.exp,
            timestamp: new Date().toISOString(),
            type: 'exp_gain',
            expGained: expGained
        });
        
        localStorage.setItem(`lindushiyu_game_${this.gameId}`, JSON.stringify(gameData));
    }

    // 获取游戏数据
    getGameData() {
        if (!this.gameId) {
            this.gameId = localStorage.getItem('lindushiyu_current_game');
        }
        
        if (!this.gameId) return null;
        
        const data = localStorage.getItem(`lindushiyu_game_${this.gameId}`);
        return data ? JSON.parse(data) : null;
    }

    // 保存被替换的精灵信息
    saveReplacedSpirit(spirit) {
        if (!this.gameId) {
            this.gameId = localStorage.getItem('lindushiyu_current_game');
        }
        
        if (!this.gameId) return;
        
        const gameData = this.getGameData();
        if (!gameData) return;
        
        // 确保 replacedSpirits 数组存在
        if (!gameData.replacedSpirits) {
            gameData.replacedSpirits = [];
        }
        
        // 保存被替换精灵的信息
        gameData.replacedSpirits.push({
            id: spirit.id,
            name: spirit.name,
            level: spirit.level,
            atk: spirit.atk,
            def: spirit.def,
            maxHp: spirit.maxHp,
            maxMp: spirit.maxMp,
            critRate: spirit.critRate,
            critDamage: spirit.critDamage,
            speed: spirit.speed,
            accuracy: spirit.accuracy,
            skills: spirit.skills,
            rarity: spirit.rarity,
            potential: spirit.potential,
            element: spirit.element,
            evolved: spirit.evolved,
            awakened: spirit.awakened,
            records: gameData.spiritRecords[spirit.id] || [],
            replacedAt: new Date().toISOString()
        });
        
        // 从 spiritRecords 中移除被替换精灵的记录
        delete gameData.spiritRecords[spirit.id];
        
        localStorage.setItem(`lindushiyu_game_${this.gameId}`, JSON.stringify(gameData));
    }

    // 获取精灵的最新属性
    getSpiritLatestStats(spiritId) {
        const gameData = this.getGameData();
        if (!gameData || !gameData.spiritRecords[spiritId]) return null;
        
        const records = gameData.spiritRecords[spiritId];
        return records[records.length - 1];
    }

    // 获取精灵的最新经验值
    getSpiritLatestExp(spiritId) {
        const gameData = this.getGameData();
        if (!gameData || !gameData.spiritRecords[spiritId]) return null;
        
        const records = gameData.spiritRecords[spiritId];
        // 找到包含经验值的最新记录
        for (let i = records.length - 1; i >= 0; i--) {
            if (records[i].exp !== undefined) {
                return records[i].exp;
            }
        }
        return null;
    }

    // 清理无用的游戏数据
    cleanupOldData() {
        // 获取所有游戏数据键
        const keys = Object.keys(localStorage).filter(key => key.startsWith('lindushiyu_game_'));
        
        // 获取当前游戏ID
        const currentGameId = localStorage.getItem('lindushiyu_current_game');
        
        // 清理所有非当前游戏的数据
        keys.forEach(key => {
            const gameId = key.replace('lindushiyu_game_', '');
            if (gameId !== currentGameId) {
                localStorage.removeItem(key);
            }
        });
    }

    // 检查并清理无用数据
    checkAndCleanup() {
        // 检查当前游戏是否存在
        const currentGameId = localStorage.getItem('lindushiyu_current_game');
        if (!currentGameId || !localStorage.getItem(`lindushiyu_game_${currentGameId}`)) {
            // 当前游戏不存在，清理所有游戏数据
            this.cleanupOldData();
        }
    }
}

window.DataManager = DataManager;
