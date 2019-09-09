/**
 * 士兵脚本，实现士兵自主移动
 */
export default class Soldier extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this._velocity = { x: -1, y: 0 }                            //方向速度                    
        this._velocityRange = 1.5                                   //速度范围
        this._hp = 100                                              //初始生命值

        this._mouseCatched = null                                   //当前捉住的老鼠

        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
        this.rigidBody.setVelocity(this._velocity)
        this.ani = this.owner.getChildByName("aniCat")              //运动动画
    }

    onUpdate() {
        if (this._mouseCatched && this._mouseCatched._hp <= 0) {
            this.setVelocity()
        }
    }

    onTriggerEnter(other, self, contact) {
        this.setVelocity(other)
    }

    onDisable() {
        Laya.Pool.recover("soldier", this.owner)
    }

    // 设定速度和动画
    setVelocity(other) {
        // 触碰变速
        if (other) {
            if (other.label === "mouse") {
                if (!this._mouseCatched) {
                    this.ani.source = 'ani/Eat.ani'
                    this._velocity = { x: 0, y: 0 }
                    this._mouseCatched = other.owner.getComponent(Laya.Script)
                    // 自身血量减少
                    if (--this._hp == 0) {
                        this.owner.removeSelf()
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
}