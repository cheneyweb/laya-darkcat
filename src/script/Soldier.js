import GameUI from "../view/GameUI"

/**
 * 士兵脚本，实现士兵自主移动
 */
export default class Soldier extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this._store = Laya.store                                    //全局状态

        this._level = this._store.state.player.level                //初始等级
        this._velocity = { x: 0, y: 0 }                             //初始速度        
        this._velocityBase = 1                                      //基础速度
        this._velocityRange = 1.5                                   //速度范围
        this._mouseCatched = null                                   //当前捉住的老鼠
        this._isEvolution = false                                   //是否正在进化

        this.aniCat = this.owner.getChildByName("aniCat")           //运动动画
        this.aniEat = this.owner.getChildByName("aniEat")           //捕食动画
        this.aniTease = this.owner.getChildByName("aniTease")       //玩耍动画
        this.aniCat.zOrder = 1
        this.aniEat.zOrder = 1
        this.aniTease.zOrder = 1

        // 捕食结束
        this.aniEat.on(Laya.Event.COMPLETE, null, () => {
            this.aniEat.visible = false
            this.aniTease.visible = false
            this.aniCat.visible = true
            // 食物爆炸
            Laya.SoundManager.playSound("sound/destroy.wav")
            let explode = Laya.Pool.getItemByCreateFun("explode", this._createExplode, this)
            explode.pos(this.owner.x, this.owner.y)
            this.owner.parent.addChild(explode)
            explode.play(0, false)
            // 同步服务
            this.afterEat()
        })

        // 玩耍结束
        this.aniTease.on(Laya.Event.COMPLETE, null, () => {
            this.aniEat.visible = false
            this.aniTease.visible = false
            this.aniCat.visible = true
            // 猫恢复自由            
            this.free()
        })

        this.rigidBody = this.owner.getComponent(Laya.RigidBody)
        this.free()
    }

    onUpdate() {
        //如果走到边界
        this.checkRange()
    }

    onTriggerEnter(other, self, contact) {
        // 捕食
        if (other.label === "mouse") {
            if (!this._mouseCatched) {
                Laya.SoundManager.playSound("sound/mouse.mp3")
                this._velocity.x > 0 ? this.aniEat.scale(-1, 1, true) : this.aniEat.scale(1, 1, true)
                this.aniCat.visible = false
                this.aniTease.visible = false
                this.aniEat.visible = true
                this.aniEat.play(0, false)

                this._velocityTemp = this._velocity
                this._velocity = { x: 0, y: 0 }
                this._mouseCatched = other.owner.getComponent(Laya.Script)
            }
        }
        // 玩耍
        else if (other.label === "guide") {
            this.aniCat.visible = false
            this.aniEat.visible = false
            this.aniTease.visible = true
            this.aniTease.play(0, false)
            this._velocity = { x: 0, y: 0 }
        }
        this._setVelocity()
    }

    onDisable() {
        // Laya.Pool.recover("soldier", this.owner)
    }

    afterEat() {
        this._mouseCatched = null
        // 若之前缓存了速度方向
        if (this._velocityTemp) {
            this._velocity = this._velocityTemp
            this._velocityTemp = null
        }
        Laya.store.actions.eat().then((res) => {
            // 更新经验值
            GameUI.instance.updateExp(res.player.progressValue)
            GameUI.instance.updatePrice(res.price)
            // 升级
            if (res.player.level != this._level) {
                this._isEvolution = true
                Laya.SoundManager.playSound("sound/alert.mp3")
                // 更换背景
                GameUI.instance.changeGameBG("bg/bg_blue.jpg")
                // 进化动画
                let evolution = Laya.Pool.getItemByCreateFun("evolution", this._createEvolution, this)
                evolution.pos(this.owner.x, this.owner.y)
                this.owner.parent.addChild(evolution)
                evolution.play(0, false)
                // 停止移动
                this._velocity = { x: 0, y: 0 }
                this._level = res.player.level
            }
            this._setVelocity()
        })
    }

    // 恢复自由
    free() {
        this._velocity.x = Math.random() * this._velocityRange + this._velocityBase
        this._velocity.y = Math.random() * this._velocityRange + this._velocityBase
        this._velocity.x *= Math.random() > 0.5 ? 1 : -1
        this._velocity.y *= Math.random() > 0.5 ? 1 : -1
        this._setVelocity()
    }

    // 是否可指引移动
    isRemovable() {
        return !this._mouseCatched && !this._isEvolution
    }
    // 指引移动
    guide(e) {
        if (!this._mouseCatched && !this._isEvolution) {
            this._velocity.x = (e.stageX - this.owner.x) / 100
            this._velocity.y = (e.stageY - this.owner.y) / 100
            this._setVelocity()
        }
    }

    // 检查边界
    checkRange() {
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

    // 设定速度和动画
    _setVelocity() {
        // 更换动画源
        this.aniCat.source = `ani/cat/Cat${this._level}.ani`
        this.aniEat.source = `ani/eat/Eat${this._level}.ani`
        this.aniTease.source = `ani/tease/Cat${this._level}.ani`
        // 根据速度调整方向
        if (this._velocity.x || this._velocity.y) {
            this._velocity.x > 0 ? this.aniCat.scale(-1, 1, true) : this.aniCat.scale(1, 1, true)
        }
        this.rigidBody.setVelocity(this._velocity)
    }

    _createEvolution() {
        //使用对象池创建进化动画
        let ani = new Laya.Animation()
        ani.loadAnimation("ani/Bomb.ani")
        ani.on(Laya.Event.COMPLETE, null, () => {
            // 更换背景
            GameUI.instance.changeGameBG("bg/bg_dark.jpg")
            // 恢复移动
            this.free()
            this._isEvolution = false
            ani.removeSelf()
            Laya.Pool.recover("evolution", ani)
        })
        ani.zOrder = 1
        ani.scale(2, 2, true)
        return ani
    }

    _createExplode() {
        //使用对象池创建爆炸动画
        let ani = new Laya.Animation()
        ani.loadAnimation("ani/Explode.ani")
        ani.on(Laya.Event.COMPLETE, null, () => {
            ani.removeSelf()
            Laya.Pool.recover("explode", ani)
        })
        ani.zOrder = 1
        return ani
    }
}