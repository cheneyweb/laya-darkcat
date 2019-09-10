import GameUI from "../view/GameUI"

/**
 * 士兵脚本，实现士兵自主移动
 */
export default class Soldier extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this._upRange = 320                                     //上安全区
        this._downRange = 220                                   //下安全区

        this._hp = 100                                               //初始生命值
        this._velocityRange = 2.5                                   //速度范围        
        this._velocity = { x: 0, y: 0 }                             //初始速度
        this._mouseCatched = null                                   //当前捉住的老鼠

        this.ani = this.owner.getChildByName("aniCat")              //运动动画        
        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
        this.setVelocity()
    }

    onUpdate() {
        // if (this._mouseCatched && this._mouseCatched._hp <= 0) {
        //     this.setVelocity()
        // }
        //如果走到边界
        this.checkRange()
    }

    onTriggerEnter(other, self, contact) {
        this.setVelocity(other)
    }

    onDisable() {
        Laya.Pool.recover("soldier", this.owner)
    }

    // 检查边界
    checkRange() {
        // 移动到上边界
        if (this.owner.y < this._upRange) {
            this._velocity.y *= -1
            this._velocity.x = Math.random() * this._velocityRange
            this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()
        }
        // 移动到下边界
        if (this.owner.y > (Laya.stage.height - this._downRange)) {
            this._velocity.y *= -1
            this._velocity.x = Math.random() * this._velocityRange
            this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()            
        }
        // 移动到左边界
        if (this.owner.x < 0) {
            this._velocity.x *= -1
            this._velocity.y = Math.random() * this._velocityRange
            this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()            
        }
        // 移动到右边界
        if (this.owner.x > Laya.stage.width) {
            this._velocity.x *= -1
            this._velocity.y = Math.random() * this._velocityRange
            this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            this.setVelocity()            
        }
    }

    // 设定速度和动画
    setVelocity(other, e) {
        let owner = this.owner
        // 触碰变速
        if (other) {
            if (other.label == "bullet") {
                let effect = Laya.Pool.getItemByCreateFun("hit", this._createEffect, this)
                effect.pos(owner.x, owner.y)
                owner.parent.addChild(effect)
                effect.play(0, true)
                if (--this._hp > 0) {
                    // if (other.label == "soldier") {
                    //     // this.aniZombi.texture = 'ani/rat4.png'
                    //     // this.aniZombi.clear()
                    // }
                    // this.textLevel.changeText(`${this._level}`)
                    // owner.getComponent(Laya.RigidBody).setVelocity({ x: -10, y: 0 })
                    Laya.SoundManager.playSound("sound/hit.wav")
                }
                else {
                    owner.removeSelf()
                    Laya.SoundManager.playSound("sound/destroy.wav")
                    GameUI.instance.endGame()
                }
                // GameUI.instance.addScore(1)
            }
            else if (other.label === "mouse") {
                if (!this._mouseCatched) {
                    this.ani.source = 'ani/Eat.ani'
                    this._velocity = { x: 0, y: 0 }
                    this._mouseCatched = other.owner.getComponent(Laya.Script)
                    // 自身血量减少
                    if (--this._hp == 0) {
                        owner.removeSelf()
                    }
                }
            }
        }
        else if (e) {
            if (!this._mouseCatched) {
                this._velocity.x = (e.stageX - owner.x) / 100
                this._velocity.y = (e.stageY - owner.y) / 100
            }
        }
        // 抓捕击杀后变速
        else {
            this._mouseCatched = null
            this._velocity.x = Math.random() * this._velocityRange
            this._velocity.y = Math.random() * this._velocityRange
            this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            this._velocity.y *= Math.random() > 0.5 ? 1 : -1
        }
        // 根据速度调整方向
        if (this._velocity.x > 0) {
            this.ani.source = "ani/RCat0.ani"
        } else if (this._velocity.x < 0) {
            this.ani.source = "ani/LCat0.ani"
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