/**
 * 子弹脚本，实现子弹飞行和回收
 */
export default class Bullet extends Laya.Script {
    constructor() { super() }
    onEnable() {
        //设置初始速度
        // let rigidBody = this.owner.getComponent(Laya.RigidBody)
        // rigidBody.setVelocity({ x: -10, y: 0 })
    }

    onTriggerEnter(other, self, contact) {
        //如果被碰到，则移除子弹
        this.owner.removeSelf()
    }

    onUpdate() {
        //如果子弹超出屏幕，则移除子弹
        if (this.owner.x < -10) {
            this.owner.removeSelf()
        }
    }

    onDisable() {
        //子弹被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
        Laya.Pool.recover("bullet", this.owner)
    }
}