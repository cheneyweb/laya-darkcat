import GameDirector from "../script/GameDirector"
/**
 * 游戏界面UI层
 */
export default class GameUI extends Laya.Scene {
    constructor() {
        super()
        GameUI.instance = this
        //关闭多点触控
        Laya.MouseManager.multiTouchEnabled = false
        //微信小游戏平台
        if (Laya.Browser.onMiniGame) {
            Laya.MiniAdpter.window.wx.onShow(() => {
                Laya.store.actions.login('wx').then(res => {
                    this._restoreUI()
                })
                //播放背景音乐
                Laya.SoundManager.playMusic("sound/bgm.mp3")
            })
            Laya.MiniAdpter.window.wx.onHide(() => {
                console.log("小游戏隐藏到后台")
            })
        }
        //加载场景文件
        this.loadScene("GameUI.scene")
    }

    onEnable() {
        this._store = Laya.store
        this._director = GameDirector.instance
        //加载资源，启动游戏
        this._loadResource()
    }

    _loadResource() {
        //加载资源 
        this.btnStart.label = '加载中...'
        Laya.loader.load([
            // 以下几项因为已经内置于场景中，所以引擎会自动加载
            // "res/atlas/sprite.atlas",
            // "res/atlas/ui.atlas",

            // "res/atlas/ani/eat.atlas",
            // "res/atlas/ani/tease.atlas",
            // "res/atlas/ani/food.atlas",

            // 以下几项需要动态加载
            "res/atlas/ani/effect.atlas",
            "res/atlas/ani/evolution.atlas"],
            Laya.Handler.create(this, (e) => {
                // 直接开始游戏
                if (this._store.state.player.level > 1 || this._store.state.player.exp > 0) {
                    this._director._clickCount++
                    this.beginGame()
                }
                //点击开始游戏
                else {
                    this.btnStart.label = '点击领养'
                    this.btnStart.on(Laya.Event.CLICK, this, this.beginGame)
                }
            }),
            Laya.Handler.create(this, (e) => { this.btnStart.label = `加载中 ${(e * 100).toFixed(2)}%` }, null, false)
        )
        //点击释放食物
        this.btnFood.on(Laya.Event.CLICK, this, this.releaseFood)
        //点击赚取金币
        this.btnGold.on(Laya.Event.CLICK, this, this.earnGold)
        //点击分享
        this.btnShare.on(Laya.Event.CLICK, this, this.share)
    }

    /**通过全局状态恢复UI */
    _restoreUI() {
        this.labelGold.changeText(`猫币：x${this._store.state.player.gold}`)
        this.updateExp(this._store.state.player.progressValue)
        this.updatePrice(this._store.state.player.price)
        if (this._store.state.player.level > 10) {
            this.updateBtnFood()
        }
    }

    /**开始游戏 */
    beginGame() {
        this.btnStart.visible = false
        this.btnFood.visible = true
        this.btnGold.visible = true
        this.btnShare.visible = true

        this.progressExp.visible = true
        this.labelGold.visible = true
        this.labelLaw.visible = false
        this.labelCopyright.visible = false
        this.tiileLogo.visible = false

        this._restoreUI()//通过全局状态恢复数据
        this._director.startGame()
    }

    /**停止游戏 */
    endGame() {
        this.btnStart.visible = true
        this.btnFood.visible = false
        this.btnGold.visible = false
        this.btnShare.visible = false

        this.progressExp.visible = false
        this.labelGold.visible = false
        this.labelLaw.visible = false
        this.labelCopyright.visible = false
        this.tiileLogo.visible = true

        this._director.stopGame()
    }

    /**更换游戏背景 */
    changeGameBG(bg) {
        this._director.bg.texture = bg
    }

    /**释放食物 */
    releaseFood() {
        if (this._store.state.enemyMap.size < 10) {
            Laya.SoundManager.playSound("sound/hit.wav")
            this._store.actions.buy().then(res => {
                if (!res.err) {
                    this.labelGold.changeText(`猫币：x${res.player.gold}`)
                    this._director.releaseFood()
                } else {
                    this.btnFood.label = res.msg
                }
            })
        }
    }

    /**看广告领金币 */
    earnGold() {
        this._store.actions.earn('ad').then(res => {
            if (!res.err) {
                this.labelGold.changeText(`猫币：x${res.player.gold}`)
            }
        })
    }

    /**分享 */
    share() {
        if (Laya.Browser.onMiniGame) {
            wx.shareAppMessage({
                title: this._store.state.shareTitle,
                imageUrl: canvas.toTempFilePathSync({
                    destWidth: 500,
                    destHeight: 400
                })
            })
            this._store.actions.earn('share').then(res => {
                if (!res.err) {
                    this.labelGold.changeText(`猫币：x${res.player.gold}`)
                }
            })
        }
    }

    updateExp(value) {
        this.progressExp.value = value
    }
    updatePrice(price) {
        this.btnFood.label = price
    }
    updateBtnFood() {
        this.btnFood.skin = 'ui/btn_cat.png'
    }
}