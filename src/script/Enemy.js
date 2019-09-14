import GameUI from "../view/GameUI"
/**
 * 敌人脚本，实现敌人击杀和回收
 */
export default class Enemy extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this._store = Laya.store                                //全局状态

        this._velocity = { x: 0, y: 0 }                         //方向速度
        this._velocityBase = 0.5                                //基础速度
        this._velocityRange = 1                                 //速度范围               
        this._soldier = null

        this.owner.visible = true                               //初始可见

        this.rigidBody = this.owner.getComponent(Laya.RigidBody)//运动体
        this.ani = this.owner.getChildByName("ani")             //运动动画

        this._free()                                            //初始速度        
    }

    onUpdate() {
        // 玩家大于10级移除老鼠
        // if (this._store.state.player.level > 10 && this.owner.name == "mouse") {
        // this.owner.removeSelf()
        // }
        //如果走到边界
        this._checkRange()
    }

    onTriggerEnter(other, self, contact) {
        if (other.label == "soldier") {
            this._soldier = other.owner.getComponent(Laya.Script)
            // 没有被抓捕或被抓捕的是自己
            if (this._soldier.isFreedom() || this._soldier._mouseCatched == this) {
                this.owner.removeSelf()
            }
        }
    }

    // onTriggerExit(other, self, contact) {
    // }

    onDisable() {
        //敌人被移除时，回收敌人，方便下次复用，减少对象创建开销
        if (this._store.state.player.level > 10) {
            Laya.Pool.recover("blackcat", this.owner)
        } else {
            Laya.Pool.recover("enemy", this.owner)
        }
        Laya.store.actions.delEnemy(this.owner)
    }

    // 检查边界
    _checkRange() {
        // 移动到上边界
        if (this.owner.y < this._store.state.upRange) {
            this._velocity.y *= -1
            this._velocity.x = Math.random() * this._velocityRange + this._velocityBase
            this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            this._setVelocity()
        }
        // 移动到下边界
        else if (this.owner.y > (Laya.stage.height - this._store.state.downRange)) {
            this._velocity.y *= -1
            this._velocity.x = Math.random() * this._velocityRange + this._velocityBase
            this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            this._setVelocity()
        }
        // 移动到左边界
        else if (this.owner.x < 0) {
            this._velocity.x *= -1
            this._velocity.y = Math.random() * this._velocityRange + this._velocityBase
            this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            this._setVelocity()
        }
        // 移动到右边界
        else if (this.owner.x > Laya.stage.width) {
            this._velocity.x *= -1
            this._velocity.y = Math.random() * this._velocityRange + this._velocityBase
            this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            this._setVelocity()
        }
    }

    // 自由
    _free() {
        this._velocity.x = Math.random() * this._velocityRange + this._velocityBase
        this._velocity.y = Math.random() * this._velocityRange + this._velocityBase
        this._velocity.x *= Math.random() > 0.5 ? 1 : -1
        this._velocity.y *= Math.random() > 0.5 ? 1 : -1
        this._setVelocity()
    }

    // 设定速度和动画,根据速度调整方向
    _setVelocity() {
        this._velocity.x > 0 ? this.ani.scale(1, 1, true) : this.ani.scale(-1, 1, true)
        this.rigidBody.setVelocity(this._velocity)
    }
}