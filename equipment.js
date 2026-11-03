// 装备系统配置文件
// 版本: 1.0.0

// 装备类型
const EQUIPMENT_TYPES = {
    weapon: { name: '武器', icon: '⚔️', maxCount: 1 },
    armor: { name: '防具', icon: '🛡️', maxCount: 1 },
    accessory: { name: '饰品', icon: '💍', maxCount: 2 }
};

// 装备品质
const EQUIPMENT_RARITIES = {
    common: { name: '普通', color: '#95a5a6', multiplier: 1 },
    rare: { name: '稀有', color: '#3498db', multiplier: 1.5 },
    epic: { name: '史诗', color: '#9b59b6', multiplier: 2 },
    legendary: { name: '传说', color: '#f39c12', multiplier: 3 }
};

// 装备前缀（用于生成装备名称）
const EQUIPMENT_PREFIXES = {
    weapon: ['锋利的', '强力的', '精致的', '古老的', '神秘的', '龙鳞', '星辰', '暗影'],
    armor: ['坚固的', '厚重的', '轻盈的', '古老的', '神秘的', '龙鳞', '圣光', '暗影'],
    accessory: ['闪耀的', '精致的', '古老的', '神秘的', '龙血', '星辰', '月光', '暗影']
};

// 装备基础名称
const EQUIPMENT_NAMES = {
    weapon: ['剑', '刀', '枪', '斧', '锤', '杖', '弓', '匕首'],
    armor: ['铠甲', '护甲', '战袍', '盾牌', '头盔', '护腿', '护手', '战靴'],
    accessory: ['戒指', '项链', '护符', '手镯', '耳环', '腰带', '徽章', '水晶']
};

// 装备属性类型
const EQUIPMENT_STATS = {
    weapon: [
        { stat: 'atk', name: '攻击力', min: 3, max: 10 },
        { stat: 'critRate', name: '暴击率', min: 2, max: 8 },
        { stat: 'critDamage', name: '暴击伤害', min: 5, max: 15 }
    ],
    armor: [
        { stat: 'def', name: '防御力', min: 2, max: 8 },
        { stat: 'maxHp', name: '生命值', min: 20, max: 60 },
        { stat: 'damageReduction', name: '伤害减免', min: 2, max: 6 }
    ],
    accessory: [
        { stat: 'maxMp', name: '魔力值', min: 10, max: 30 },
        { stat: 'speed', name: '速度', min: 2, max: 8 },
        { stat: 'accuracy', name: '命中率', min: 2, max: 8 },
        { stat: 'hpRegen', name: '生命恢复', min: 2, max: 6 },
        { stat: 'mpRegen', name: '魔力恢复', min: 2, max: 6 }
    ]
};

// 生成随机装备
function generateRandomEquipment() {
    const types = Object.keys(EQUIPMENT_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const rarities = Object.keys(EQUIPMENT_RARITIES);
    const rarityWeights = [60, 25, 12, 3]; // 普通、稀有、史诗、传说的权重
    const random = Math.random() * 100;
    let rarityIndex = 0;
    let cumulative = 0;
    for (let i = 0; i < rarityWeights.length; i++) {
        cumulative += rarityWeights[i];
        if (random < cumulative) {
            rarityIndex = i;
            break;
        }
    }
    const rarity = rarities[rarityIndex];
    
    const prefixes = EQUIPMENT_PREFIXES[type];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const names = EQUIPMENT_NAMES[type];
    const baseName = names[Math.floor(Math.random() * names.length)];
    
    const stats = [];
    const statCount = 1 + Math.floor(Math.random() * 2); // 1-2条属性
    const availableStats = [...EQUIPMENT_STATS[type]];
    
    for (let i = 0; i < statCount && availableStats.length > 0; i++) {
        const statIndex = Math.floor(Math.random() * availableStats.length);
        const statDef = availableStats.splice(statIndex, 1)[0];
        const multiplier = EQUIPMENT_RARITIES[rarity].multiplier;
        const value = Math.floor((statDef.min + Math.random() * (statDef.max - statDef.min)) * multiplier);
        stats.push({
            stat: statDef.stat,
            name: statDef.name,
            value: value
        });
    }
    
    const price = Math.floor((30 + Math.random() * 70) * EQUIPMENT_RARITIES[rarity].multiplier);
    
    return {
        id: 'eq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: prefix + baseName,
        type: type,
        rarity: rarity,
        icon: EQUIPMENT_TYPES[type].icon,
        stats: stats,
        price: price,
        equipped: false,
        equippedBy: null
    };
}

// 生成一批装备（用于商店初始化）
function generateEquipmentBatch(count) {
    const equipment = [];
    for (let i = 0; i < count; i++) {
        equipment.push(generateRandomEquipment());
    }
    return equipment;
}

// 获取装备品质名称
function getEquipmentRarityName(rarity) {
    return EQUIPMENT_RARITIES[rarity]?.name || '未知';
}

// 获取装备品质颜色
function getEquipmentRarityColor(rarity) {
    return EQUIPMENT_RARITIES[rarity]?.color || '#95a5a6';
}

// 获取装备类型名称
function getEquipmentTypeName(type) {
    return EQUIPMENT_TYPES[type]?.name || '未知';
}

// 获取装备类型图标
function getEquipmentTypeIcon(type) {
    return EQUIPMENT_TYPES[type]?.icon || '❓';
}
