const ELEMENTS = {
    gold: { name: '金', icon: '⚔️', strong: ['wood'], weak: ['fire'], color: '#FFD700' },
    wood: { name: '木', icon: '🌿', strong: ['earth'], weak: ['gold'], color: '#4CAF50' },
    water: { name: '水', icon: '💧', strong: ['fire'], weak: ['earth'], color: '#2196F3' },
    fire: { name: '火', icon: '🔥', strong: ['gold'], weak: ['water'], color: '#F44336' },
    earth: { name: '土', icon: '🏔️', strong: ['water'], weak: ['wood'], color: '#795548' }
};

const ELEMENT_ADVANTAGE = 1.3;
const ELEMENT_DISADVANTAGE = 0.7;

function getSkillEffectType(skill) {
    if (skill.damage) return 'attack';
    if (skill.defense) return 'defense';
    if (skill.heal) return 'heal';
    if (skill.effect === 'speed' || skill.effect === 'priority') return 'speed';
    if (skill.effect === 'slow' || skill.effect === 'bind' || skill.effect === 'stun' || 
        skill.effect === 'freeze' || skill.effect === 'burn' || skill.effect === 'poison') return 'control';
    if (skill.effect === 'dodge' || skill.effect === 'hide' || skill.effect === 'reflect') return 'special';
    if (skill.effect === 'buff' || skill.effect === 'buff_def') return 'buff';
    return 'other';
}

function getTwoDifferentSkills(elementSkills) {
    const shuffled = [...elementSkills].sort(() => Math.random() - 0.5);
    const firstSkill = shuffled[0];
    const firstType = getSkillEffectType(firstSkill);
    
    const secondSkill = shuffled.find(s => getSkillEffectType(s) !== firstType);
    
    if (secondSkill) {
        return [firstSkill, secondSkill];
    }
    return [firstSkill, shuffled[1]];
}

function getElementMultiplier(attackerElement, defenderElement) {
    const attacker = ELEMENTS[attackerElement];
    if (attacker.strong.includes(defenderElement)) {
        return ELEMENT_ADVANTAGE;
    }
    if (attacker.weak.includes(defenderElement)) {
        return ELEMENT_DISADVANTAGE;
    }
    return 1.0;
}

const SPIRIT_NAMES = {
    gold: [
        '金甲战士', '钢铁巨龙', '黄金狮王', '银月狼王', '铜墙铁壁',
        '金刚石魔', '铂金圣骑', '钛金战神', '钨钢巨人', '镔铁猛虎',
        '黄金凤凰', '银翼天使', '铜锤战将', '铁壁守护', '金光麒麟',
        '银蛇剑客', '铜鼎尊者', '铁甲霸王', '金翅大鹏', '银狐仙子',
        '铜锣罗汉', '铁扇公主', '金毛狮王', '银龙太子', '铜驼神兽',
        '铁骑将军', '金鳞蛟龙', '银角大王', '铜人武士', '铁拐李仙',
        '金蝉脱壳', '银针飞燕', '铜雀台主', '铁掌水上漂'
    ],
    wood: [
        '翠竹仙子', '青藤巨蟒', '古木树人', '花仙子', '森林之王',
        '荆棘女王', '橡树巨人', '柳絮飞舞', '松柏长青', '梅花鹿王',
        '桃花仙子', '莲花圣女', '竹叶青蛇', '藤蔓怪人', '树精长老',
        '花蝴蝶仙', '绿叶精灵', '枯木逢春', '森林猎手', '青草悠悠',
        '木偶奇遇', '树洞精灵', '花果山猴', '竹林隐士', '森林狼王',
        '青木尊者', '花神使者', '树王守护', '藤甲战士', '木灵仙子',
        '绿野仙踪', '森林巨熊', '花海精灵', '木叶忍者'
    ],
    water: [
        '碧波龙王', '海神波塞', '冰霜巨人', '深海水怪', '水晶仙子',
        '雨神降临', '河神守护', '湖中仙女', '瀑布战神', '溪流精灵',
        '海豚骑士', '鲨鱼将军', '章鱼博士', '海星使者', '珊瑚女王',
        '冰川巨兽', '雪莲仙子', '霜冻战士', '水帘洞主', '龙宫太子',
        '海妖塞壬', '水母精灵', '蓝鲸巨兽', '海马战士', '水龙吟唱',
        '冰晶凤凰', '雪女冰姬', '霜狼首领', '水神共工', '海神三太子',
        '冰山巨人', '深海巨鲨', '水精灵王', '冰雪女王'
    ],
    fire: [
        '烈焰凤凰', '火龙咆哮', '炎帝神龙', '红莲业火', '火焰战士',
        '熔岩巨人', '火山爆发', '火凤涅槃', '炎魔领主', '烈火战车',
        '红火蚂蚁', '火焰精灵', '太阳神鸟', '炎黄子孙', '火眼金睛',
        '烈日灼心', '炎阳圣女', '火麒麟兽', '红焰战马', '火焰山主',
        '炎龙骑士', '火树银花', '烈焰红唇', '炎帝之女', '火神祝融',
        '红龙战士', '火焰领主', '炎魔之王', '火凤朝阳', '烈火金刚',
        '炎之精灵', '火焰女王', '红炎巨兽', '火神之子'
    ],
    earth: [
        '大地巨人', '岩石战神', '山岳之王', '沙漠风暴', '地震猛兽',
        '泥土精灵', '沙丘领主', '山峰守护', '大地之母', '岩石巨人',
        '沙暴将军', '山地猎手', '土行孙者', '地裂天崩', '沙漠之舟',
        '山神守护', '岩石巨人', '大地勇士', '沙海巨兽', '山峰领主',
        '泥土怪人', '地震之王', '沙尘暴君', '山地之王', '土灵仙子',
        '大地之熊', '岩石傀儡', '沙漠毒蝎', '山岳巨龙', '地心炎魔',
        '沙丘女王', '山地巨人', '大地守护', '岩石战将'
    ]
};

const SPIRIT_ICONS = {
    gold: ['⚔️', '🗡️', '🛡️', '👑', '💎', '🏆', '⚜️', '🔱', '💫', '⭐'],
    wood: ['🌿', '🍀', '🌱', '🌲', '🌳', '🌴', '🎋', '🍃', '🌸', '🌺'],
    water: ['💧', '🌊', '💦', '❄️', '🏊', '🐋', '🐬', '🐟', '🦈', '🐙'],
    fire: ['🔥', '💥', '☄️', '🌋', '🌅', '☀️', '🌟', '✨', '⚡', '🎆'],
    earth: ['🏔️', '🗻', '🏜️', '⛰️', '🪨', '🗿', '🏜️', '🌍', '🌎', '🌏']
};

const ALL_SKILLS = {
    gold: [
        { name: '金光斩', damage: 1.5, mpCost: 15, description: '释放金色光芒斩击敌人' },
        { name: '钢铁护盾', defense: 1.5, mpCost: 20, description: '形成钢铁护盾减少伤害' },
        { name: '黄金风暴', damage: 1.8, mpCost: 30, description: '召唤黄金风暴攻击全体' },
        { name: '金属穿刺', damage: 1.6, mpCost: 18, description: '用锋利的金属穿刺敌人' },
        { name: '金刚不坏', defense: 2.0, mpCost: 35, description: '金刚护体，大幅减少伤害' },
        { name: '金元爆发', damage: 2.2, mpCost: 40, description: '爆发金元之力造成巨大伤害' },
        { name: '银月斩', damage: 1.4, mpCost: 12, description: '如银月般锋利的斩击' },
        { name: '铜墙铁壁', defense: 1.8, mpCost: 25, description: '形成坚不可摧的防御' },
        { name: '铂金光辉', damage: 1.7, mpCost: 28, description: '释放铂金的光辉攻击' },
        { name: '钛金冲击', damage: 1.9, mpCost: 32, description: '用钛金之力冲击敌人' },
        { name: '钨钢重击', damage: 2.0, mpCost: 35, description: '沉重的钨钢打击' },
        { name: '金刚怒吼', damage: 1.6, mpCost: 22, description: '金刚的怒吼震撼敌人' },
        { name: '金光护体', defense: 1.4, mpCost: 18, description: '金光环绕保护自身' },
        { name: '银翼风暴', damage: 1.8, mpCost: 30, description: '银翼掀起的风暴' },
        { name: '铜锤猛击', damage: 1.7, mpCost: 25, description: '铜锤的猛烈一击' },
        { name: '铁壁阵', defense: 2.2, mpCost: 40, description: '铁壁般的防御阵型' },
        { name: '金鳞闪光', damage: 1.5, mpCost: 20, description: '金鳞闪烁的突袭' },
        { name: '银针万道', damage: 1.9, mpCost: 35, description: '万道银针齐射' },
        { name: '铜墙防御', defense: 1.6, mpCost: 22, description: '铜墙般的坚固防御' },
        { name: '铁骑冲锋', damage: 2.1, mpCost: 38, description: '铁骑的猛烈冲锋' },
        { name: '金蝉脱壳', effect: 'dodge', mpCost: 30, description: '金蝉脱壳，躲避攻击' },
        { name: '银狐幻影', effect: 'speed', mpCost: 25, description: '银狐般的速度提升' },
        { name: '铜人阵', defense: 2.5, mpCost: 45, description: '铜人阵法，绝对防御' },
        { name: '铁掌推山', damage: 2.3, mpCost: 42, description: '铁掌推出，山崩地裂' },
        { name: '金刚伏魔', damage: 2.5, mpCost: 50, description: '金刚伏魔，威力无穷' },
        { name: '金光普照', heal: 0.3, mpCost: 35, description: '金光普照，恢复生命' },
        { name: '银龙出海', damage: 2.2, mpCost: 40, description: '银龙出海，势不可挡' },
        { name: '铜鼎镇世', defense: 2.0, mpCost: 38, description: '铜鼎镇压，万法不侵' },
        { name: '铁锁横江', effect: 'bind', mpCost: 28, description: '铁锁横江，束缚敌人' },
        { name: '金翅展翼', effect: 'priority', mpCost: 35, description: '金翅展翼，先发制人' }
    ],
    wood: [
        { name: '藤蔓缠绕', damage: 1.3, mpCost: 12, effect: 'slow', description: '用藤蔓缠绕敌人，降低速度' },
        { name: '生命汲取', damage: 1.2, heal: 0.125, mpCost: 20, description: '吸取敌人生命恢复自己' },
        { name: '森林之怒', damage: 1.7, mpCost: 28, description: '召唤森林之力攻击敌人' },
        { name: '毒液喷射', damage: 1.4, mpCost: 18, effect: 'poison', description: '喷射毒液腐蚀敌人' },
        { name: '自然治愈', heal: 0.45, mpCost: 35, description: '借助自然之力恢复大量生命' },
        { name: '万物生长', damage: 1.9, mpCost: 32, description: '让万物疯狂生长攻击敌人' },
        { name: '荆棘反弹', defense: 1.5, mpCost: 25, effect: 'reflect', description: '荆棘反弹部分伤害' },
        { name: '光合作用', heal: 0.5, mpCost: 40, description: '光合作用恢复生命和魔力' },
        { name: '种子炸弹', damage: 1.6, mpCost: 20, description: '种子爆炸造成伤害' },
        { name: '叶刃风暴', damage: 1.8, mpCost: 30, description: '叶片如刀刃般飞舞' },
        { name: '树根缠绕', damage: 1.3, mpCost: 15, effect: 'bind', description: '树根缠绕限制行动' },
        { name: '花粉迷障', mpCost: 22, effect: 'blind', description: '花粉遮蔽视线' },
        { name: '枯木逢春', heal: 0.375, mpCost: 28, description: '枯木逢春，重获生机' },
        { name: '森林守护', defense: 2.0, mpCost: 35, description: '森林的守护之力' },
        { name: '藤蔓鞭挞', damage: 1.5, mpCost: 18, description: '藤蔓如鞭抽打' },
        { name: '花之舞', damage: 1.7, mpCost: 28, description: '花瓣飞舞攻击' },
        { name: '树精召唤', damage: 2.0, mpCost: 38, description: '召唤树精协助战斗' },
        { name: '青草芳香', heal: 0.325, mpCost: 25, description: '芳香恢复生命' },
        { name: '绿叶护盾', defense: 1.6, mpCost: 22, description: '绿叶形成的护盾' },
        { name: '寄生种子', damage: 1.2, mpCost: 20, effect: 'leech', description: '寄生种子持续吸取生命' },
        { name: '森林隐匿', effect: 'hide', mpCost: 30, description: '隐匿于森林中' },
        { name: '荆棘之墙', defense: 2.2, mpCost: 40, description: '荆棘之墙，难以逾越' },
        { name: '自然之力', damage: 2.1, mpCost: 42, description: '自然的愤怒之力' },
        { name: '万物复苏', heal: 0.625, mpCost: 50, description: '万物复苏，全面恢复' },
        { name: '毒雾弥漫', damage: 1.5, mpCost: 28, effect: 'poison_all', description: '毒雾弥漫全场' },
        { name: '藤蔓牢笼', effect: 'stun', mpCost: 35, description: '藤蔓牢笼困住敌人' },
        { name: '古树咆哮', damage: 2.3, mpCost: 45, description: '古树的愤怒咆哮' },
        { name: '生命绽放', heal: 0.5, mpCost: 42, description: '生命之花绽放' },
        { name: '丛林突袭', damage: 1.9, mpCost: 35, effect: 'priority', description: '丛林中的突袭' },
        { name: '自然祝福', effect: 'buff', mpCost: 38, description: '自然的祝福提升属性' }
    ],
    water: [
        { name: '冰冻术', damage: 1.3, mpCost: 15, effect: 'freeze', description: '冰冻敌人使其无法行动' },
        { name: '治愈之泉', heal: 0.375, mpCost: 30, description: '召唤治愈之泉恢复生命' },
        { name: '海啸冲击', damage: 1.8, mpCost: 35, description: '召唤巨大海啸攻击敌人' },
        { name: '水流切割', damage: 1.5, mpCost: 20, description: '用高压水流切割敌人' },
        { name: '净化之雨', heal: 0.5, mpCost: 45, description: '召唤净化之雨恢复全队生命' },
        { name: '深渊吞噬', damage: 2.1, mpCost: 48, description: '召唤深渊之力吞噬敌人' },
        { name: '水盾', defense: 1.6, mpCost: 25, description: '水流形成的护盾' },
        { name: '激流勇进', damage: 1.7, mpCost: 30, description: '激流冲击敌人' },
        { name: '寒冰箭', damage: 1.4, mpCost: 18, effect: 'slow', description: '寒冰箭减速敌人' },
        { name: '水疗术', heal: 0.325, mpCost: 22, description: '水元素治疗' },
        { name: '漩涡', damage: 1.6, mpCost: 28, effect: 'bind', description: '漩涡困住敌人' },
        { name: '冰霜护甲', defense: 1.8, mpCost: 32, description: '冰霜形成的护甲' },
        { name: '暴雨梨花', damage: 1.9, mpCost: 38, description: '暴雨如梨花般密集' },
        { name: '水流鞭', damage: 1.5, mpCost: 22, description: '水流如鞭抽打' },
        { name: '冰封千里', damage: 2.0, mpCost: 45, effect: 'freeze_all', description: '冰封千里，冻结一切' },
        { name: '海浪滔天', damage: 1.8, mpCost: 35, description: '滔天巨浪' },
        { name: '水镜', defense: 2.0, mpCost: 38, description: '水镜反射攻击' },
        { name: '深海重压', damage: 2.2, mpCost: 48, description: '深海的水压' },
        { name: '潮汐之力', damage: 1.7, mpCost: 32, description: '潮汐的涨落之力' },
        { name: '水雾迷蒙', effect: 'dodge', mpCost: 28, description: '水雾中难以命中' },
        { name: '寒冰刺骨', damage: 1.9, mpCost: 40, effect: 'freeze', description: '寒冰刺骨的痛楚' },
        { name: '涌泉', heal: 0.4, mpCost: 30, description: '涌泉恢复生命' },
        { name: '水龙弹', damage: 2.0, mpCost: 42, description: '水龙弹高速冲击' },
        { name: '绝对零度', damage: 2.5, mpCost: 55, effect: 'freeze', description: '绝对零度冻结一切' },
        { name: '流水无情', damage: 1.8, mpCost: 38, description: '流水无情，连绵不绝' },
        { name: '水幕天华', defense: 2.5, mpCost: 50, description: '水幕天华，万法不侵' },
        { name: '冰晶爆', damage: 2.3, mpCost: 48, description: '冰晶爆裂' },
        { name: '治愈波浪', heal: 0.55, mpCost: 48, description: '治愈的波浪' },
        { name: '水流喷射', damage: 1.6, mpCost: 25, effect: 'priority', description: '高速水流喷射' },
        { name: '海洋之心', effect: 'regen', mpCost: 45, description: '海洋之心持续恢复' }
    ],
    fire: [
        { name: '烈焰冲击', damage: 1.5, mpCost: 18, description: '释放烈焰冲击敌人' },
        { name: '燃烧之魂', damage: 1.3, mpCost: 20, effect: 'burn', description: '使敌人持续燃烧' },
        { name: '炎龙咆哮', damage: 2.0, mpCost: 45, description: '召唤炎龙进行毁灭性攻击' },
        { name: '火球术', damage: 1.4, mpCost: 15, description: '发射火球攻击敌人' },
        { name: '烈焰护盾', defense: 1.6, mpCost: 28, description: '用烈焰形成护盾' },
        { name: '凤凰涅槃', heal: 0.25, damage: 1.6, mpCost: 40, description: '如凤凰涅槃般恢复并攻击' },
        { name: '火焰喷射', damage: 1.6, mpCost: 25, description: '喷射火焰' },
        { name: '熔岩护甲', defense: 1.8, mpCost: 35, description: '熔岩形成的护甲' },
        { name: '爆炎', damage: 1.9, mpCost: 38, description: '爆裂的火焰' },
        { name: '火焰漩涡', damage: 1.7, mpCost: 32, effect: 'bind', description: '火焰漩涡困住敌人' },
        { name: '太阳之火', damage: 2.1, mpCost: 48, description: '太阳般炽热的火焰' },
        { name: '火墙', defense: 2.0, mpCost: 40, description: '火墙阻挡攻击' },
        { name: '烈焰斩', damage: 1.6, mpCost: 22, description: '烈焰附着的斩击' },
        { name: '燃烧殆尽', damage: 2.3, mpCost: 52, effect: 'burn', description: '燃烧殆尽一切' },
        { name: '火焰风暴', damage: 1.8, mpCost: 42, description: '火焰形成的风暴' },
        { name: '岩浆爆发', damage: 2.2, mpCost: 50, description: '岩浆喷发' },
        { name: '火焰箭', damage: 1.5, mpCost: 20, description: '火焰箭矢' },
        { name: '炽热光环', defense: 1.5, mpCost: 30, effect: 'reflect', description: '炽热光环反弹伤害' },
        { name: '火山爆发', damage: 2.4, mpCost: 55, description: '火山猛烈爆发' },
        { name: '火焰冲刺', damage: 1.7, mpCost: 30, effect: 'priority', description: '火焰冲刺先发制人' },
        { name: '余烬', damage: 1.4, mpCost: 18, effect: 'burn', description: '余烬持续燃烧' },
        { name: '烈焰之翼', effect: 'speed', mpCost: 35, description: '烈焰之翼提升速度' },
        { name: '灭世之火', damage: 2.6, mpCost: 60, description: '毁灭世界的火焰' },
        { name: '火焰净化', heal: 0.375, mpCost: 38, description: '火焰净化恢复' },
        { name: '炎阳', damage: 1.9, mpCost: 42, description: '炎阳高照' },
        { name: '火焰牢笼', effect: 'stun', mpCost: 40, description: '火焰牢笼困住敌人' },
        { name: '炼狱', damage: 2.5, mpCost: 58, description: '炼狱之火' },
        { name: '火焰祝福', effect: 'buff', mpCost: 42, description: '火焰祝福提升攻击' },
        { name: '流星火雨', damage: 2.0, mpCost: 48, description: '流星般的火雨' },
        { name: '不死鸟之翼', effect: 'revive', mpCost: 65, description: '不死鸟之翼赋予重生' }
    ],
    earth: [
        { name: '地震波', damage: 1.4, mpCost: 20, description: '释放地震波攻击敌人' },
        { name: '岩石护甲', defense: 1.8, mpCost: 32, description: '形成岩石护甲大幅减少伤害' },
        { name: '山崩地裂', damage: 1.9, mpCost: 42, description: '引发山崩地裂攻击敌人' },
        { name: '沙尘暴', damage: 1.3, mpCost: 18, effect: 'blind', description: '召唤沙尘暴遮蔽敌人视线' },
        { name: '大地之力', heal: 0.3, defense: 1.3, mpCost: 35, description: '汲取大地之力恢复并防御' },
        { name: '陨石坠落', damage: 2.3, mpCost: 55, description: '召唤陨石从天而降' },
        { name: '石墙', defense: 2.0, mpCost: 38, description: '石墙阻挡攻击' },
        { name: '地刺', damage: 1.5, mpCost: 22, description: '地刺突袭' },
        { name: '沙尘掩体', defense: 1.5, mpCost: 25, effect: 'dodge', description: '沙尘中躲避攻击' },
        { name: '大地震撼', damage: 1.7, mpCost: 35, effect: 'stun', description: '震撼大地眩晕敌人' },
        { name: '岩石投掷', damage: 1.6, mpCost: 25, description: '投掷岩石' },
        { name: '地动山摇', damage: 2.0, mpCost: 48, description: '地动山摇的威力' },
        { name: '岩浆护甲', defense: 2.2, mpCost: 45, description: '岩浆形成的护甲' },
        { name: '土遁', effect: 'hide', mpCost: 30, description: '土遁隐匿身形' },
        { name: '巨石砸落', damage: 2.1, mpCost: 50, description: '巨石从天而降' },
        { name: '大地守护', defense: 2.5, mpCost: 52, description: '大地的绝对守护' },
        { name: '裂地', damage: 1.8, mpCost: 38, description: '撕裂大地' },
        { name: '沙尘漩涡', damage: 1.5, mpCost: 28, effect: 'bind', description: '沙尘漩涡困敌' },
        { name: '岩石巨人召唤', damage: 2.0, mpCost: 48, description: '召唤岩石巨人' },
        { name: '大地回春', heal: 0.45, mpCost: 42, description: '大地回春恢复' },
        { name: '山岳镇压', damage: 2.2, mpCost: 52, description: '山岳镇压之力' },
        { name: '土流壁', defense: 2.0, mpCost: 40, description: '土流壁防御' },
        { name: '沙漠风暴', damage: 1.9, mpCost: 45, description: '沙漠风暴席卷' },
        { name: '地心引力', effect: 'slow_all', mpCost: 38, description: '地心引力减速全场' },
        { name: '金刚石身', defense: 3.0, mpCost: 60, description: '金刚石般坚硬' },
        { name: '岩浆爆发', damage: 2.4, mpCost: 58, description: '岩浆喷发' },
        { name: '大地脉动', heal: 0.5, mpCost: 48, description: '大地脉动恢复' },
        { name: '山崩', damage: 2.5, mpCost: 62, description: '山崩地裂' },
        { name: '岩石冲刺', damage: 1.7, mpCost: 32, effect: 'priority', description: '岩石冲刺' },
        { name: '大地祝福', effect: 'buff_def', mpCost: 45, description: '大地祝福提升防御' }
    ]
};

const EVOLVED_NAMES = {
    gold: ['金甲战神', '钢铁龙王', '黄金圣皇', '银月神王', '铜墙金刚'],
    wood: ['翠竹神女', '青藤龙神', '古木神王', '花神女王', '森林神主'],
    water: ['碧波神龙', '海神之王', '冰霜神帝', '深海霸主', '水晶女神'],
    fire: ['烈焰神凤', '火龙神帝', '炎帝神皇', '红莲神火', '火焰战神'],
    earth: ['大地神王', '岩石神帝', '山岳神主', '沙漠神皇', '地震神兽']
};

const AWAKENED_NAMES = {
    gold: ['金甲·神威战神', '钢铁·灭世龙王', '黄金·圣皇至尊', '银月·太虚神王', '铜墙·不灭金刚'],
    wood: ['翠竹·造化神女', '青藤·混沌龙神', '古木·永恒神王', '花神·万象女王', '森林·自然神主'],
    water: ['碧波·深渊神龙', '海神·无尽之王', '冰霜·绝世神帝', '深海·虚空霸主', '水晶·圣洁女神'],
    fire: ['烈焰·涅槃神凤', '火龙·焚天龙帝', '炎帝·九天神皇', '红莲·业火神火', '火焰·不灭战神'],
    earth: ['大地·创世神王', '岩石·永恒神帝', '山岳·擎天神主', '沙漠·荒芜神皇', '地震·灭世神兽']
};

const ITEMS = {
    // 经验卡道具
    doubleExpCard: { name: '好事成双经验卡', icon: '🎫', price: 30, effect: 'double_exp', description: '所有精灵获得的经验双倍，持续本次战斗' },
    tripleExpCard: { name: '三阳开泰经验卡', icon: '🎫', price: 50, effect: 'triple_exp', description: '所有精灵获得的经验三倍，持续本次战斗' },
    
    // 生命值恢复道具
    cabbage: { name: '白菜', icon: '🥬', price: 25, heal: 50, description: '生命值+50' },
    greenVeg: { name: '青菜', icon: '🥦', price: 45, heal: 100, description: '生命值+100' },
    
    // 魔力值恢复道具
    strawberry: { name: '草莓', icon: '🍓', price: 25, mp: 50, description: '魔力值+50' },
    pineapple: { name: '菠萝', icon: '🍍', price: 45, mp: 100, description: '魔力值+100' },
    
    // 特殊效果道具
    beef: { name: '牛肉', icon: '🥩', price: 50, effect: 'random_skill', description: '随机使用当前精灵已解锁的一个技能' },
    mutton: { name: '羊肉', icon: '🍖', price: 70, effect: 'reflect_damage', description: '对方攻击会反弹30%伤害，我方减少30%伤害，持续三回合，若使用道具精灵死亡，由下一个精灵使用' }
};

function generateSpirits() {
    const spirits = [];
    let id = 1;
    
    for (const element of Object.keys(ELEMENTS)) {
        const names = SPIRIT_NAMES[element];
        const icons = SPIRIT_ICONS[element];
        const elementSkills = ALL_SKILLS[element];
        
        for (let i = 0; i < names.length; i++) {
            const baseAtk = 50 + Math.floor(Math.random() * 30);
            const baseDef = 40 + Math.floor(Math.random() * 25);
            const baseHp = 200 + Math.floor(Math.random() * 100);
            const baseMp = 100 + Math.floor(Math.random() * 50);
            
            const initialSkills = getTwoDifferentSkills(elementSkills);
            
            const potential = Math.floor(Math.random() * 10) + 1;
            const baseCritRate = 5 + potential * 1.5;
            const baseCritDamage = 150 + potential * 5;
            const baseSpeed = 50 + potential * 10;
            const baseAccuracy = 85 + potential * 1.5;
            
            spirits.push({
                id: id,
                name: names[i],
                element: element,
                icon: icons[i % icons.length],
                baseAtk: baseAtk,
                baseDef: baseDef,
                baseHp: baseHp,
                baseMp: baseMp,
                level: 1,
                exp: 0,
                currentHp: baseHp,
                maxHp: baseHp,
                currentMp: baseMp,
                maxMp: baseMp,
                atk: baseAtk,
                def: baseDef,
                baseCritRate: baseCritRate,
                baseCritDamage: baseCritDamage,
                baseSpeed: baseSpeed,
                baseAccuracy: baseAccuracy,
                critRate: baseCritRate,
                critDamage: baseCritDamage,
                speed: baseSpeed,
                accuracy: baseAccuracy,
                evolved: false,
                awakened: false,
                skills: initialSkills,
                skill: initialSkills[0],
                evolvedName: EVOLVED_NAMES[element][i % 5],
                awakenedName: AWAKENED_NAMES[element][i % 5],
                availableSkills: elementSkills.filter(s => !initialSkills.includes(s))
            });
            id++;
        }
    }
    
    return spirits;
}

const ALL_SPIRITS = generateSpirits();

function calculateStats(spirit) {
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
    } else {
        potentialBonus = 1.0;
    }
    
    let totalBonus = levelBonus * evolutionBonus * awakeningBonus * potentialBonus;
    
    spirit.atk = Math.floor(spirit.baseAtk * totalBonus);
    spirit.def = Math.floor(spirit.baseDef * totalBonus);
    spirit.maxHp = Math.floor(spirit.baseHp * totalBonus);
    spirit.maxMp = Math.floor(spirit.baseMp * totalBonus);
    
    spirit.critRate = Math.min(50, spirit.baseCritRate + (spirit.level - 1) * 0.5);
    spirit.critDamage = Math.min(300, spirit.baseCritDamage + (spirit.level - 1) * 2.5);
    spirit.speed = Math.floor(spirit.baseSpeed * totalBonus);
    spirit.accuracy = Math.min(100, spirit.baseAccuracy + (spirit.level - 1) * 0.3);
    
    if (spirit.currentHp > spirit.maxHp) {
        spirit.currentHp = spirit.maxHp;
    }
    if (spirit.currentMp > spirit.maxMp) {
        spirit.currentMp = spirit.maxMp;
    }
    
    return spirit;
}

function generateSpiritsWithRarity() {
    const spirits = [];
    let id = 1;
    
    // 第一阶段：生成所有精灵（不带稀有度）
    for (const element of Object.keys(ELEMENTS)) {
        const names = SPIRIT_NAMES[element];
        const icons = SPIRIT_ICONS[element];
        const elementSkills = ALL_SKILLS[element];
        
        for (let i = 0; i < names.length; i++) {
            const baseAtk = 50 + Math.floor(Math.random() * 30);
            const baseDef = 40 + Math.floor(Math.random() * 25);
            const baseHp = 200 + Math.floor(Math.random() * 100);
            const baseMp = 100 + Math.floor(Math.random() * 50);
            
            const initialSkills = getTwoDifferentSkills(elementSkills);
            
            // 生成潜力值（1-10），后续会根据稀有度重新分配
            const potential = Math.floor(Math.random() * 10) + 1;
            
            // 根据潜力值计算初始属性（参考宠物小精灵的数值范围）
            const baseCritRate = 5 + potential * 1.5; // 6.5% - 20%
            const baseCritDamage = 150 + potential * 5; // 155% - 200%
            const baseSpeed = 50 + potential * 10; // 60 - 150
            const baseAccuracy = 85 + potential * 1.5; // 86.5% - 100%
            
            spirits.push({
                id: id,
                name: names[i],
                element: element,
                icon: icons[i % icons.length],
                baseAtk: baseAtk,
                baseDef: baseDef,
                baseHp: baseHp,
                baseMp: baseMp,
                baseCritRate: baseCritRate,
                baseCritDamage: baseCritDamage,
                baseSpeed: baseSpeed,
                baseAccuracy: baseAccuracy,
                level: 1,
                exp: 0,
                currentHp: baseHp,
                maxHp: baseHp,
                currentMp: baseMp,
                maxMp: baseMp,
                atk: baseAtk,
                def: baseDef,
                critRate: baseCritRate,
                critDamage: baseCritDamage,
                speed: baseSpeed,
                accuracy: baseAccuracy,
                evolved: false,
                awakened: false,
                skills: initialSkills,
                skill: initialSkills[0],
                evolvedName: EVOLVED_NAMES[element][i % 5],
                awakenedName: AWAKENED_NAMES[element][i % 5],
                availableSkills: elementSkills.filter(s => !initialSkills.includes(s)),
                potential: potential,
                rarity: 'common' // 临时默认值
            });
            id++;
        }
    }
    
    // 第二阶段：按潜力值排序并分配稀有度
    // 潜力值前5%为传说，前5%-15%为珍贵，前15%-30%为稀有，其余为普通
    const totalCount = spirits.length;
    const legendaryCount = Math.ceil(totalCount * 0.05);  // 前5%
    const epicCount = Math.ceil(totalCount * 0.15);       // 前15%
    const rareCount = Math.ceil(totalCount * 0.30);       // 前30%
    
    // 按潜力值降序排序
    spirits.sort((a, b) => b.potential - a.potential);
    
    // 分配稀有度并根据稀有度设置潜力值范围（增加区分度）
    spirits.forEach((spirit, index) => {
        if (index < legendaryCount) {
            spirit.rarity = 'legendary';
            spirit.potential = 9 + Math.floor(Math.random() * 2); // 9-10
        } else if (index < epicCount) {
            spirit.rarity = 'epic';
            spirit.potential = 7 + Math.floor(Math.random() * 2); // 7-8
        } else if (index < rareCount) {
            spirit.rarity = 'rare';
            spirit.potential = 5 + Math.floor(Math.random() * 2); // 5-6
        } else {
            spirit.rarity = 'common';
            spirit.potential = 1 + Math.floor(Math.random() * 4); // 1-4
        }
        
        // 根据新的潜力值重新计算基础属性
        spirit.baseCritRate = 5 + spirit.potential * 1.5; // 6.5% - 20%
        spirit.baseCritDamage = 150 + spirit.potential * 5; // 155% - 200%
        spirit.baseSpeed = 50 + spirit.potential * 10; // 60 - 150
        spirit.baseAccuracy = 85 + spirit.potential * 1.5; // 86.5% - 100%
    });
    
    // 恢复原始ID顺序
    spirits.sort((a, b) => a.id - b.id);
    
    // 为所有精灵计算初始属性
    spirits.forEach(spirit => {
        calculateStats(spirit);
    });
    
    return spirits;
}

const ALL_SPIRITS_WITH_RARITY = generateSpiritsWithRarity();

function getExpForLevel(level) {
    return level * 50;
}

function getSpiritExpForNextLevel(spirit) {
    return getExpForLevel(spirit.level);
}

function levelUp(spirit) {
    const expNeeded = getSpiritExpForNextLevel(spirit);
    let leveledUp = false;
    let evolved = false;
    let awakened = false;
    
    while (spirit.exp >= expNeeded && spirit.level < 20) {
        spirit.exp -= expNeeded;
        spirit.level++;
        leveledUp = true;
        
        if (spirit.level === 5) {
            learnNewSkill(spirit);
        }
        
        if (spirit.level === 10) {
            learnNewSkill(spirit);
        }
        
        if (spirit.level === 12) {
            learnNewSkill(spirit);
        }
        
        if (spirit.level === 15 && !spirit.evolved) {
            spirit.evolved = true;
            spirit.name = spirit.evolvedName;
            evolved = true;
        }
        
        if (spirit.level === 20 && !spirit.awakened) {
            spirit.awakened = true;
            spirit.name = spirit.awakenedName;
            awakened = true;
        }
        
        // 重新计算属性（升级后基础属性提升）
        calculateStats(spirit);
        
        // 升级时回满生命值和魔力值（基于新的最大值）
        spirit.currentHp = spirit.maxHp;
        spirit.currentMp = spirit.maxMp;
    }
    
    return { leveledUp, evolved, awakened };
}

function learnNewSkill(spirit) {
    if (spirit.skills.length >= 4) return;
    
    const learnedSkillNames = spirit.skills.map(s => s.name);
    const availableNewSkills = spirit.availableSkills.filter(s => !learnedSkillNames.includes(s.name));
    
    if (availableNewSkills.length === 0) return;
    
    const randomSkills = availableNewSkills.sort(() => Math.random() - 0.5).slice(0, 3);
    
    spirit.pendingSkillChoices = randomSkills;
    spirit.pendingSkillLearn = true;
}

function createSpiritCopy(spirit) {
    const copy = JSON.parse(JSON.stringify(spirit));
    if (!copy.skills) {
        copy.skills = [copy.skill];
    }
    if (!copy.availableSkills) {
        copy.availableSkills = ALL_SKILLS[copy.element] ? [...ALL_SKILLS[copy.element]] : [];
    }
    if (!copy.currentMp) {
        copy.currentMp = copy.maxMp || copy.baseMp;
    }
    if (!copy.equipment) {
        copy.equipment = {
            weapon: null,
            armor: null,
            accessory1: null,
            accessory2: null
        };
    }
    return copy;
}

function generateEnemyTeam(playerLevel, teamSize) {
    const team = [];
    const availableSpirits = [...ALL_SPIRITS];
    
    for (let i = 0; i < teamSize; i++) {
        const randomIndex = Math.floor(Math.random() * availableSpirits.length);
        const spirit = createSpiritCopy(availableSpirits[randomIndex]);
        
        const levelVariation = Math.floor(Math.random() * 5) - 2;
        spirit.level = Math.max(1, Math.min(20, playerLevel + levelVariation));
        spirit.exp = 0;
        
        calculateStats(spirit);
        spirit.currentHp = spirit.maxHp;
        spirit.currentMp = spirit.maxMp;
        
        team.push(spirit);
        availableSpirits.splice(randomIndex, 1);
    }
    
    return team;
}

function calculateBattleExp(playerTeam, enemyTeam, victory) {
    let totalExp = 0;
    
    enemyTeam.forEach(enemy => {
        let exp = enemy.level * 10;
        
        if (enemy.evolved) exp *= 1.5;
        if (enemy.awakened) exp *= 2;
        
        totalExp += exp;
    });
    
    totalExp *= (1 + (enemyTeam.length - 1) * 0.2);
    
    playerTeam.forEach(playerSpirit => {
        enemyTeam.forEach(enemy => {
            const multiplier = getElementMultiplier(playerSpirit.element, enemy.element);
            if (multiplier > 1) {
                totalExp *= 1.1;
            } else if (multiplier < 1) {
                totalExp *= 0.9;
            }
        });
    });
    
    totalExp = Math.floor(totalExp);
    
    if (!victory) {
        totalExp = Math.floor(totalExp * 0.5);
    }
    
    return Math.max(10, totalExp);
}
