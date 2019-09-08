/**
 * 士兵脚本，实现士兵自主移动
 */
export default class Soldier extends Laya.Script {
    constructor() { super() }
    onEnable() {
        //设置初始速度
        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
    }

    onTriggerEnter(other, self, contact) {
        this.rigidBody.setVelocity({ x: 0, y: 0 })
        //如果被碰到，则移除子弹
        // this.owner.removeSelf()
    }

    onUpdate() {
        //如果超出屏幕，则移除
        if (this.owner.x < -10) {
            this.owner.removeSelf()
        }
    }

    onDisable() {
        //被移除时，回收到对象池，方便下次复用，减少对象创建开销
        Laya.Pool.recover("soldier", this.owner)
    }
}