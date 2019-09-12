import GameUI from "../view/GameUI"
/**
 * 游戏导演控制类
 */
export default class GameDirector extends Laya.Script {
    /** @prop {name:enemy,tips:"敌人预置对象",type:Prefab}*/
    /** @prop {name:soldier,tips:"士兵预置对象",type:Prefab}*/
    constructor() {
        super()
        GameDirector.instance = this
    }

    onEnable() {
        this._store = Laya.store                                //全局状态
        this._started = false                                   //是否已经开始游戏
        this._clickCount = 0                                    //屏幕点击次数

        this.bg = this.owner.getChildByName("bg")               //背景
        this.spriteBox = this.owner.getChildByName("spriteBox") //敌人,士兵,子弹所在的容器
        this.guide = this.owner.getChildByName("guide")         //狗尾巴草指引
    }

    onUpdate() {
    }

    onStageClick(e) {
        //停止事件冒泡，提高性能
        e.stopPropagation()
        if (this._started) {
            //显示鼠标指引
            if (this._clickCount++ > 0 && e.stageY > this._store.state.upRange && e.stageY < (Laya.stage.height - this._store.state.downRange)) {
                this.guide.pos(e.stageX, e.stageY)
                this.guide.visible = true
                //控制朝指引方向移动
                this.cat && this.cat.getComponent(Laya.Script).guide(e)
            }
        }
    }

    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame() {
        this._started = true
        this.bg.visible = true
        this._createSoldier()
        //播放背景音乐
        Laya.SoundManager.playMusic("sound/bg.mp3")
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
        let enemy = Laya.Pool.getItemByCreateFun("enemy", this.enemy.create, this.enemy)
        let areaHeight = Laya.stage.height - this._store.state.upRange - this._store.state.downRange
        enemy.pos(enemy.width, Math.random() * areaHeight + this._store.state.upRange)
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
        this.spriteBox.addChild(this.cat)
    }
}