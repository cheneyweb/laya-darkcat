/**
 * 武器脚本
 */
export default class Weapon extends Laya.Script {
    constructor() { super() }
    onEnable() {
        // 开启炮塔动画
        // this.owner.getChildByName("aniTurret").play(0, true)
    }

    onUpdate() {
        // this.owner.rotation++;
    }
}