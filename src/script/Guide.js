/**
 * 子弹脚本，实现子弹飞行和回收
 */
export default class Bullet extends Laya.Script {
    constructor() { super() }
    onEnable() {
    }

    onTriggerEnter(other, self, contact) {
        this.owner.removeSelf()
    }

    onUpdate() {
    }

    onDisable() {
        Laya.Pool.recover("guide", this.owner)
    }
}