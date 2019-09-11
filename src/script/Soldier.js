import GameUI from "../view/GameUI"

/**
 * 士兵脚本，实现士兵自主移动
 */
export default class Soldier extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this._store = Laya.store                                    //全局状态

        this._orientation = 'left'                                  //当前方向        
        this._level = 1                                             //初始等级
        // this._hp = 30                                               //初始生命值        
        this._velocityRange = 2.5                                   //速度范围
        this._velocity = { x: 0, y: 0 }                             //初始速度
        this._isTease = false                                       //是否正在玩耍
        this._teaseTimeOut = 1500                                   //玩耍动画时间
        this._teaseTimeStart = Date.now()                           //上次玩耍时间
        this._mouseCatched = null                                   //当前捉住的老鼠

        this.ani = this.owner.getChildByName("aniCat")              //运动动画
        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
        this.setVelocity()
    }

    onUpdate() {
        //如果走到边界
        this.checkRange()
        //是否玩耍结束
        if (this._isTease && Date.now() - this._teaseTimeStart > this._teaseTimeOut) {
            this._isTease = false
            this.setVelocity()
        }
    }

    onTriggerEnter(other, self, contact) {
        this.setVelocity(other)
    }

    onDisable() {
        // Laya.Pool.recover("soldier", this.owner)
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
    setVelocity(other, e) {
        let owner = this.owner
        // 捕食
        if (other) {
            // if (other.label == "bullet") {
            //     let effect = Laya.Pool.getItemByCreateFun("hit", this._createEffect, this)
            //     effect.pos(owner.x, owner.y)
            //     owner.parent.addChild(effect)
            //     effect.play(0, true)
            //     if (--this._hp > 0) {
            //         // if (other.label == "soldier") {
            //         //     // this.aniZombi.texture = 'ani/rat4.png'
            //         //     // this.aniZombi.clear()
            //         // }
            //         // this.textLevel.changeText(`${this._level}`)
            //         // owner.getComponent(Laya.RigidBody).setVelocity({ x: -10, y: 0 })
            //         Laya.SoundManager.playSound("sound/hit.wav")
            //     }
            //     else {
            //         owner.removeSelf()
            //         Laya.SoundManager.playSound("sound/destroy.wav")
            //         GameUI.instance.endGame()
            //     }
            //     // GameUI.instance.addScore(1)
            // }
            // else
            if (other.label === "mouse") {
                if (!this._mouseCatched) {
                    this.ani.source = `ani/${this._orientation}/Eat${this._level}.ani`
                    this._velocityTemp = this._velocity
                    this._velocity = { x: 0, y: 0 }
                    this._mouseCatched = other.owner.getComponent(Laya.Script)
                    Laya.SoundManager.playSound("sound/hit.wav")
                }
            } else if (other.label === "guide") {
                this.ani.source = `ani/tease/Cat${this._level}.ani`
                this._isTease = true
                this._teaseTimeStart = Date.now()
                this._velocity = { x: 0, y: 0 }
                // Laya.SoundManager.playSound("sound/tease.wav")
            }
        }
        // 引导
        else if (e) {
            if (!this._mouseCatched) {
                this._velocity.x = (e.stageX - owner.x) / 100
                this._velocity.y = (e.stageY - owner.y) / 100
            }
        }
        // 击杀
        else {
            this._mouseCatched = null
            if (this._velocityTemp) {
                this._velocity = this._velocityTemp
            }
            else {
                this._velocity.x = Math.random() * this._velocityRange
                this._velocity.y = Math.random() * this._velocityRange
                this._velocity.x *= Math.random() > 0.5 ? 1 : -1
                this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            }
        }
        // 根据速度调整方向
        if (this._velocity.x || this._velocity.y) {
            this._orientation = this._velocity.x > 0 ? 'right' : 'left'
            this.ani.source = `ani/${this._orientation}/Cat${this._level}.ani`
        }
        this.rigidBody.setVelocity(this._velocity)
    }

    _createEffect() {
        //使用对象池创建爆炸动画
        let ani = new Laya.Animation()
        ani.loadAnimation("ani/Hit.ani")
        ani.on(Laya.Event.COMPLETE, null, () => {
            ani.removeSelf()
            Laya.Pool.recover("hit", ani)
        })
        return ani
    }
}