/**
 * 士兵脚本，实现士兵自主移动
 */
export default class Soldier extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this._velocity = { x: -2, y: 0 }                            //方向速度                    
        this._velocityRange = 2.5                                   //速度范围
        this._hp = 100                                              //初始生命值

        this._mouseCatched = null                                   //当前捉住的老鼠

        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
        this.rigidBody.setVelocity(this._velocity)
        this.ani = this.owner.getChildByName("aniCat")              //运动动画
    }

    onUpdate() {
        // if (this._mouseCatched && this._mouseCatched._hp <= 0) {
        //     this.setVelocity()
        // }
    }

    onTriggerEnter(other, self, contact) {
        this.setVelocity(other)
    }

    onDisable() {
        Laya.Pool.recover("soldier", this.owner)
    }

    // 设定速度和动画
    setVelocity(other) {
        let owner = this.owner
        // 触碰变速
        if (other) {
            if (other.label == "bullet") {
                let effect = Laya.Pool.getItemByCreateFun("effect", this._createEffect, this)
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
            else if (other.label === "wallRight") {
                this._velocity.x *= -1
                this._velocity.y = Math.random() * this._velocityRange
                this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            }
            else if (other.label === "wallLeft") {
                this._velocity.x *= -1
                this._velocity.y = Math.random() * this._velocityRange
                this._velocity.y *= Math.random() > 0.5 ? 1 : -1
            }
            else if (other.label === "wallTop") {
                this._velocity.y *= -1
                this._velocity.x = Math.random() * this._velocityRange
                this._velocity.x *= Math.random() > 0.5 ? 1 : -1
            }
            else if (other.label === "wallBottom") {
                this._velocity.y *= -1
                this._velocity.x = Math.random() * this._velocityRange
                this._velocity.x *= Math.random() > 0.5 ? 1 : -1
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
        ani.loadAnimation("ani/Bomb.ani")
        ani.on(Laya.Event.COMPLETE, null, () => {
            ani.removeSelf()
            Laya.Pool.recover("effect", ani)
        })
        return ani
    }
}