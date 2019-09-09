/**
 * 士兵脚本，实现士兵自主移动
 */
export default class Soldier extends Laya.Script {
    constructor() { super() }
    onEnable() {
        //方向速度
        this._vx = -1
        this._vy = 0

        //当前捉住的老鼠
        this._mouseCatched = null

        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
        this.rigidBody.setVelocity({ x: this._vx, y: this._vy })
        //运动动画
        this.ani = this.owner.getChildByName("aniCat")
    }

    onUpdate() {
        //如果超出屏幕，则移除
        // if (this.owner.x < -10) {
        //     this.owner.removeSelf()
        // }
        // if(this._mouseCatched){
        //     console.log(this._mouseCatched._hp)
        // }
        if (this._mouseCatched && !this._mouseCatched._hp) {
            this._vx = Math.random() > 0.5 ? Math.random() * 1.5 : -Math.random() * 1.5
            this._vy = Math.random() > 0.5 ? Math.random() * 1.5 : -Math.random() * 1.5
            if (this._vx > 0) {
                this.ani.source = "ani/RCat0.ani"
            } else if (this._vx < 0) {
                this.ani.source = "ani/LCat0.ani"
            }
            this.rigidBody.setVelocity({ x: this._vx, y: this._vy })
            this._mouseCatched = null
        }
    }

    onTriggerEnter(other, self, contact) {
        // this.rigidBody.setVelocity({ x: 0, y: 0 })
        //如果被碰到，则移除子弹
        // this.owner.removeSelf()
        if (other.label === "mouse") {
            if (!this._mouseCatched) {
                this._vx = 0
                this._vy = 0
                this.ani.source = 'ani/Eat.ani'
                this._mouseCatched = other.owner.getComponent(Laya.Script)
            }
        }
        else if (other.label === "wallRight") {
            // owner.removeSelf()
            // GameUI.instance.stopGame();
            this._vx = -this._vx
            this._vy = Math.random() > 0.5 ? Math.random() * 1.5 : -Math.random() * 1.5
        }
        else if (other.label === "wallLeft") {
            this._vx = -this._vx
            this._vy = Math.random() > 0.5 ? Math.random() * 1.5 : -Math.random() * 1.5
        }
        else if (other.label === "wallTop") {
            this._vx = Math.random() > 0.5 ? Math.random() + this._vx : -Math.random() + -this._vx
            this._vy = -this._vy
        }
        else if (other.label === "wallBottom") {
            this._vx = Math.random() > 0.5 ? Math.random() * 1.5 : -Math.random() * 1.5
            this._vy = -this._vy
        }
        if (this._vx > 0) {
            this.ani.source = "ani/RCat0.ani"
        } else if (this._vx < 0) {
            this.ani.source = "ani/LCat0.ani"
        }

        this.rigidBody.setVelocity({ x: this._vx, y: this._vy })
    }

    onDisable() {
        //被移除时，回收到对象池，方便下次复用，减少对象创建开销
        Laya.Pool.recover("soldier", this.owner)
    }
}