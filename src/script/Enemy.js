import GameUI from "../view/GameUI"
/**
 * 敌人脚本，实现敌人击杀和回收
 */
export default class Enemy extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this._store = Laya.store                                //全局状态

        this._orientation = 'right'                             //当前方向
        this._level = 1                                         //初始等级
        this._hp = Math.round(Math.random() * 2) + 2            //血量
        this._lastHurtTime = Date.now()                         //上次掉血时间
        this._hurtInterval = 1000                               //掉血时间间隔
        this._velocity = { x: 1, y: 0 }                         //方向速度 
        this._velocityRange = 1.5                               //速度范围               
        this._isCatched = false                                 //是否被抓住
        this._soldier = null


        this.rigidBody = this.owner.getComponent(Laya.RigidBody)//运动体
        this.ani = this.owner.getChildByName("aniMouse")        //运动动画
        this.setVelocity()                                      //初始速度

        this.owner.visible = true                               //初始可见
    }

    onUpdate() {
        let now = Date.now()
        let owner = this.owner
        //如果被抓住
        if (this._isCatched) {
            // 血量持续减少,为零时触发死亡效果
            if (now - this._lastHurtTime > this._hurtInterval) {
                this._lastHurtTime = now
                if (--this._hp <= 0) {
                    let effect = Laya.Pool.getItemByCreateFun("explode", this._createEffect, this)
                    effect.pos(owner.x, owner.y)
                    owner.parent.addChild(effect)
                    effect.play(0, true)
                    this._soldier.setVelocity()
                    owner.removeSelf()
                    Laya.SoundManager.playSound("sound/destroy.wav")
                }
            }
        }
        //如果走到边界
        this.checkRange()
    }

    onTriggerEnter(other, self, contact) {
        this.setVelocity(other)
    }

    // onTriggerExit(other, self, contact) {
    // }

    onDisable() {
        //敌人被移除时，回收敌人，方便下次复用，减少对象创建开销
        Laya.Pool.recover("enemy", this.owner)
        // Laya.store.actions.delEnemy(this.owner)
    }

    // 检查边界
    checkRange() {
        // 移动到上边界
        if (this.owner.y < this._store.state.upRange) {
            this._velocity.y *= -1
            this._velocity.x = Math.random() * this._velocityRange
            this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()
        }
        // 移动到下边界
        else if (this.owner.y > (Laya.stage.height - this._store.state.downRange)) {
            this._velocity.y *= -1
            this._velocity.x = Math.random() * this._velocityRange
            this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()
        }
        // 移动到左边界
        else if (this.owner.x < 0) {
            this._velocity.x *= -1
            this._velocity.y = Math.random() * this._velocityRange
            this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()
        }
        // 移动到右边界
        else if (this.owner.x > Laya.stage.width) {
            this._velocity.x *= -1
            this._velocity.y = Math.random() * this._velocityRange
            this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()
        }
    }

    // 设定速度和动画
    setVelocity(other) {
        // 触碰变速
        if (other) {
            let owner = this.owner
            if (other.label == "soldier") {// 没有被抓捕或被抓捕的是自己
                this._soldier = other.owner.getComponent(Laya.Script)
                if (!this._soldier._mouseCatched || this._soldier._mouseCatched == this) {
                    this._velocity = { x: 0, y: 0 }
                    this._isCatched = true
                    owner.visible = false
                }
            }
        }
        // 根据速度调整方向
        this._orientation = this._velocity.x > 0 ? 'right' : 'left'
        this.ani.source = `ani/${this._orientation}/Mouse.ani`
        this.rigidBody.setVelocity(this._velocity)
    }

    _createEffect() {
        //使用对象池创建爆炸动画
        let ani = new Laya.Animation()
        ani.loadAnimation("ani/Explode.ani")
        ani.on(Laya.Event.COMPLETE, null, () => {
            ani.removeSelf()
            Laya.Pool.recover("explode", ani)
        })
        return ani
    }
}