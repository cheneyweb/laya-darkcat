import GameUI from "../view/GameUI"
/**
 * 敌人脚本，实现敌人击杀和回收
 */
export default class Enemy extends Laya.Script {
    constructor() { super() }
    onEnable() {
        //敌人等级
        // this._level = Math.round(Math.random() * 5) + 1
        this._level = 1
        this._hp = Math.round(Math.random() * 5) + 1            //血量
        this._lastHurtTime = Date.now()                         //上次掉血时间
        this._hurtInterval = 1000                               //掉血时间间隔
        //方向速度
        this._vx = 1
        this._vy = 0
        //是否被抓住
        this._isCatched = false

        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
        this.rigidBody.setVelocity({ x: this._vx, y: this._vy })
        //运动动画
        this.ani = this.owner.getChildByName("aniMouse")
        //等级文本
        // this.textLevel = this.owner.getChildByName("textLevel")
        // this.textLevel.text = `${this._level}`

        // this.aniZombi = this.owner.getChildByName("aniZombi")
        //僵尸动画
        // this.aniZombi = this.owner.getChildByName("aniZombi")
        // this.aniZombi.play(0, true)
    }

    onUpdate() {
        let now = Date.now()
        let owner = this.owner
        //如果被抓住
        if (this._isCatched) {
            // 血量持续减少,为零时触发死亡效果
            if (now - this._lastHurtTime > this._hurtInterval) {
                this._lastHurtTime = now
                if (--this._hp == 0) {
                    let effect = Laya.Pool.getItemByCreateFun("effect", this._createEffect, this)
                    effect.pos(owner.x, owner.y)
                    owner.parent.addChild(effect)
                    effect.play(0, true)
                    owner.removeSelf()
                    Laya.SoundManager.playSound("sound/destroy.wav")
                }
            }
        }
        //让持续盒子旋转
        // this.owner.rotation++;
    }

    onTriggerEnter(other, self, contact) {
        //碰撞到子弹后，增加积分，播放声音特效
        let owner = this.owner
        if (other.label == "bullet") {
            if (--this._hp > 1) {
                // if (other.label == "soldier") {
                //     // this.aniZombi.texture = 'ani/rat4.png'
                //     // this.aniZombi.clear()
                // }
                // this.textLevel.changeText(`${this._level}`)
                // owner.getComponent(Laya.RigidBody).setVelocity({ x: -10, y: 0 })
                Laya.SoundManager.playSound("sound/hit.wav")
            }
            else if (owner.parent) {
                let effect = Laya.Pool.getItemByCreateFun("effect", this._createEffect, this)
                effect.pos(owner.x, owner.y)
                owner.parent.addChild(effect)
                effect.play(0, true)
                owner.removeSelf()
                Laya.SoundManager.playSound("sound/destroy.wav")
            }
            // GameUI.instance.addScore(1)
        } else if (other.label == "soldier") {
            let mouseCatched = other.owner.getComponent(Laya.Script)._mouseCatched
            if (!mouseCatched || mouseCatched == this) {
                this._vx = 0
                this._vy = 0
                this._isCatched = true
                owner.visible = false
            }
        }
        //碰到墙壁后改变方向
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
            this._vx = Math.random() > 0.5 ? Math.random() * 1.5 : -Math.random() * 1.5
            this._vy = -this._vy
        }
        else if (other.label === "wallBottom") {
            this._vx = Math.random() > 0.5 ? Math.random() * 1.5 : -Math.random() * .15
            this._vy = -this._vy
        }
        if (this._vx > 0) {
            this.ani.source = "ani/RMouse0.ani"
        } else {
            this.ani.source = "ani/LMouse0.ani"
        }
        this.rigidBody.setVelocity({ x: this._vx, y: this._vy })
    }

    onTriggerExit(other, self, contact) {
    }

    onDisable() {
        //敌人被移除时，回收敌人，方便下次复用，减少对象创建开销。
        Laya.Pool.recover("enemy", this.owner)
        Laya.store.actions.delEnemy(this.owner)
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