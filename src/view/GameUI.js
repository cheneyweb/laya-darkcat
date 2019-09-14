import GameDirector from "../script/GameDirector"
/**
 * 游戏界面UI层
 */
export default class GameUI extends Laya.Scene {
    constructor() {
        super();
        GameUI.instance = this;
        //关闭多点触控
        Laya.MouseManager.multiTouchEnabled = false;
        //加载场景文件
        this.loadScene("GameUI.scene");
    }

    onEnable() {
        this._director = GameDirector.instance;
        //点击释放食物
        this.btnFood.on(Laya.Event.CLICK, this, this.releaseFood);
        //点击赚取金币
        this.btnGold.on(Laya.Event.CLICK, this, this.earnGold);
        //点击分享
        this.btnShare.on(Laya.Event.CLICK, this, this.share);

        // 通过全局状态恢复数据
        this.labelGold.changeText(`猫币：x${Laya.store.state.player.gold}`)
        this.updateExp(Laya.store.state.player.progressValue)
        this.updatePrice(Laya.store.state.player.price)

        this.btnStart.label = '加载中...'

        if (Laya.store.state.player.level > 10) {
            this.updateBtnFood()
        }
        // Laya.MiniAdpter.init()
        // Laya.MiniAdpter.nativefiles = [
        //     "res/atlas/ani/effect.atlas",
        // ]
        // Laya.URL.basePath = "https://localhost:5501/"
        Laya.loader.load([
            // "res/atlas/ani/cat.atlas",
            // "res/atlas/ani/eat.atlas",
            // "res/atlas/ani/tease.atlas",
            // "res/atlas/ani/food.atlas",
            "res/atlas/ani/effect.atlas",
            "res/atlas/ani/evolution.atlas"],
            Laya.Handler.create(this, (e) => {
                // 直接开始游戏
                if (Laya.store.state.player.level > 1 || Laya.store.state.player.exp > 0) {
                    this._director._clickCount++
                    this.beginGame()
                }
                //点击开始游戏
                else {
                    this.btnStart.label = '点击领养'
                    this.btnStart.on(Laya.Event.CLICK, this, this.beginGame);
                }
            }),
            Laya.Handler.create(this, (e) => { this.btnStart.label = `加载中 ${(e * 100).toFixed(2)}%` }, null, false))
    }

    /**开始游戏 */
    beginGame() {
        this.btnStart.visible = false;
        this.btnFood.visible = true;
        this.btnGold.visible = true;
        this.btnShare.visible = true;

        this.progressExp.visible = true
        this.labelGold.visible = true
        this.labelLaw.visible = false
        this.labelCopyright.visible = false

        this._director.startGame()
    }

    /**停止游戏 */
    endGame() {
        this.btnStart.visible = true;
        this.btnFood.visible = false;
        this.btnGold.visible = false;
        this.btnShare.visible = false;

        this.progressExp.visible = false
        this.labelGold.visible = false
        this.labelLaw.visible = false
        this.labelCopyright.visible = false
        this._director.stopGame()
    }

    /**更换游戏背景 */
    changeGameBG(bg) {
        this._director.bg.texture = bg
    }

    releaseFood() {
        if (Laya.store.state.enemyMap.size < 10) {
            Laya.SoundManager.playSound("sound/hit.wav")
            Laya.store.actions.buy().then(res => {
                if (!res.err) {
                    this.labelGold.changeText(`猫币：x${res.player.gold}`)
                    this._director.releaseFood()
                } else {
                    this.btnFood.label = res.msg
                }
            })
        }
    }

    earnGold() {
        Laya.store.actions.earn('ad').then(res => {
            if (!res.err) {
                this.labelGold.changeText(`猫币：x${res.player.gold}`)
            }
        })
    }

    share() {
        if (Laya.Browser.onMiniGame) {
            wx.shareAppMessage({
                title: '这猫长这样我也是醉了...',
                imageUrl: canvas.toTempFilePathSync({
                    destWidth: 500,
                    destHeight: 400
                })
            })
            Laya.store.actions.earn('share').then(res => {
                if (!res.err) {
                    this.labelGold.changeText(`猫币：x${res.player.gold}`)
                }
            })
        }
    }

    updatePrice(price) {
        this.btnFood.label = price
    }
    updateBtnFood() {
        this.btnFood.skin = 'ui/btn_cat.png'
    }
    updateExp(value) {
        this.progressExp.value = value
    }
}