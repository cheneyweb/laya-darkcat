import GameUI from "../view/GameUI"
/**
 * 游戏导演控制类
 */
export default class GameDirector extends Laya.Script {
    /** @prop {name:enemy,tips:"敌人预置对象",type:Prefab}*/
    /** @prop {name:soldier,tips:"士兵预置对象",type:Prefab}*/
    /** @prop {name:blackcat,tips:"黑猫预置对象",type:Prefab}*/
    constructor() {
        super()
        GameDirector.instance = this
    }

    onEnable() {
        this._store = Laya.store                                //全局状态
        this._started = false                                   //是否已经开始游戏
        this._clickCount = 0                                    //屏幕点击次数
        this._lastHeartTime = Date.now()                        //上次心跳时间

        this.bg = this.owner.getChildByName("bg")               //背景
        this.spriteBox = this.owner.getChildByName("spriteBox") //敌人,士兵,子弹所在的容器
        this.guide = this.owner.getChildByName("guide")         //狗尾巴草指引
    }

    onUpdate() {
        //心跳
        if (Date.now() - this._lastHeartTime > Math.random() * 10000 + 5000) {
            this._lastHeartTime = Date.now()
            GameUI.instance.releaseFood(true)
        }
    }

    onStageClick(e) {
        //停止事件冒泡，提高性能
        e.stopPropagation()
        if (this._started) {
            //显示鼠标指引
            if (this._clickCount++ > 0 && e.stageY > this._store.state.upRange && e.stageY < (Laya.stage.height - this._store.state.downRange)) {
                if (this.cat) {
                    let catScript = this.cat.getComponent(Laya.Script)
                    if (catScript.isFreedom()) {
                        this.guide.pos(e.stageX, e.stageY)
                        this.guide.visible = true
                        //控制朝指引方向移动
                        catScript.guide(e)
                    }
                }
            }
        }
    }

    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame() {
        this._started = true
        this.bg.visible = true
        this._createSoldier()
        //播放背景音乐
        Laya.SoundManager.playMusic("sound/bgm.mp3")
    }

    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame() {
        this._started = false
        this.bg.visible = false
        this.guide.visible = false
        this.spriteBox.removeChildren()
    }

    /**释放食物 */
    releaseFood() {
        this._createEnemy()
    }

    _createEnemy() {
        //使用对象池创建敌人
        let enemy
        if (this._store.state.player.level > 10) {
            enemy = Laya.Pool.getItemByCreateFun("blackcat", this.blackcat.create, this.blackcat)
        } else {
            enemy = Laya.Pool.getItemByCreateFun("enemy", this.enemy.create, this.enemy)
        }
        let areaHeight = Laya.stage.height - this._store.state.upRange - this._store.state.downRange
        if (Math.random() > 0.5) {
            enemy.pos(enemy.width, Math.random() * areaHeight + this._store.state.upRange)
        } else {
            enemy.pos(Laya.stage.width, Math.random() * areaHeight + this._store.state.upRange)
        }
        this.spriteBox.addChild(enemy)
        this._store.actions.addEnemy(enemy)
    }

    _createSoldier(e) {
        this.cat = this.soldier.create()
        if (e) {
            this.cat.pos(e.stageX, e.stageY)
        } else {
            this.cat.pos(Laya.stage.width / 2, Laya.stage.height / 2)
        }
        this.owner.addChild(this.cat)
    }
}