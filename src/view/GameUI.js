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
                    this._restoreUI(res)
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

    onStageClick(e) {
        //停止事件冒泡，提高性能
        e.stopPropagation()
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
            "bg/bg_dark.jpg",
            "bg/bg_blue.jpg",
            // 以下几项需要动态加载
            "res/atlas/ani/gold.atlas",
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
        this.btnGold.on(Laya.Event.CLICK, this, this.earnGold, ['ad'])
        this.dialogTip.getChildByName('btnTip').on(Laya.Event.CLICK, this, this.earnGold, ['ad'])
        //点击分享
        this.btnShare.on(Laya.Event.CLICK, this, this.share)
        //点击日记
        this.btnDiary.on(Laya.Event.CLICK, this, this.diaryOpen)
        this.dialogDiary.closeHandler = new Laya.Handler(this, this.diaryClose)
        //点击日记左右移动
        this.dialogDiary.getChildByName('btnLeft').on(Laya.Event.CLICK, this, this.diaryLeft)
        this.dialogDiary.getChildByName('btnRight').on(Laya.Event.CLICK, this, this.diaryRight)
        //点击今日奖励
        this.btnGift.on(Laya.Event.CLICK, this, this.giftOpen)
        this.dialogGift.getChildByName('btnGift').on(Laya.Event.CLICK, this, this.earnGold, ['gift'])
        this.dialogGift.closeHandler = new Laya.Handler(this, this.giftClose)
    }

    /**通过全局状态恢复UI */
    _restoreUI(res) {
        this.labelGold.changeText(`x${this._store.state.player.gold}`)
        this.updateExp(this._store.state.player.progressValue)
        this.updatePrice(this._store.state.player.price)
        if (this._store.state.player.level > 10) {
            this.updateBtnFood()
        }
        if (res.goldInc) {
            this.dialogGift.getChildByName('labelTip').changeText(`猫币奖励 x${res.goldInc}`)
            this.btnGift.visible = true
        }
    }

    /**捡起金币后文字消失 */
    _pickGold() {
        this.textGold.visible = false
    }

    /**开始游戏 */
    beginGame() {
        this.btnStart.visible = false
        this.labelLaw.visible = false
        this.labelCopyright.visible = false
        this.titleLogo.visible = false
        let plat = Laya.Browser.onMiniGame ? 'wx' : null
        Laya.store.actions.login(plat).then(res => {
            this._restoreUI(res)
            this.btnFood.visible = true
            this.btnGold.visible = true
            if (plat) this.btnShare.visible = true
            this.btnDiary.visible = true

            this.progressExp.visible = true
            this.labelGold.visible = true
            this.imgGold.visible = true
        })
        this._director.run()
        //播放背景音乐
        Laya.SoundManager.playMusic("sound/bgm.mp3")
    }

    /**停止游戏 */
    endGame() {
        this.btnStart.visible = true
        this.btnFood.visible = false
        this.btnGold.visible = false
        this.btnShare.visible = false
        this.btnDiary.visible = false

        this.progressExp.visible = false
        this.labelGold.visible = false
        this.imgGold.visible = false
        this.labelLaw.visible = false
        this.labelCopyright.visible = false
        this.titleLogo.visible = true

        this._director.stop()
    }

    /**更换游戏背景 */
    changeGameBG(bg) {
        this._director.bg.texture = bg
    }

    /**释放食物 */
    releaseFood(isRandom) {
        if (this._store.state.enemyMap.size < 10) {
            Laya.SoundManager.playSound("sound/hit.wav")
            this._store.actions.buy(isRandom).then(res => {
                if (!res.err) {
                    this.labelGold.changeText(`x${res.player.gold}`)
                    this._director.releaseFood()
                    // 如果触发掉落金币
                    if (res.isGold == 1 && this._store.state.goldMap.size < 3) {
                        this._director.releaseGold()
                    }
                } else {
                    this.btnFood.label = res.msg
                    this.dialogTip.visible = true
                    this.dialogTip.show()
                }
            })
        }
    }

    /**看广告领金币 */
    earnGold(type, option) {
        this._store.actions.earn(type).then(res => {
            if (!res.err) {
                if (type == 'pick') {
                    this.textGold.text = `猫币+${res.goldInc}`
                    this.textGold.pos(option.x, option.y)
                    this.textGold.visible = true
                    Laya.Tween.to(this.textGold, { y: this.textGold.y - 120, scaleX: 1.5, scaleY: 1.5 }, 800, Laya.Ease.linearOut, Laya.Handler.create(this, this._pickGold))
                }
                this.labelGold.changeText(`x${res.player.gold}`)
            }
        })
        if (type == 'ad') {
            this.dialogTip.close()
        } else if (type == 'gift') {
            this.dialogGift.close()
            this.btnGift.visible = false
            Laya.SoundManager.playSound("sound/gold.mp3")
        }
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
                    this.labelGold.changeText(`x${res.player.gold}`)
                }
            })
        }
    }

    /**日记 */
    // diaryEffect() {
    //     Laya.Tween.to(this.btnDiary, { y: this.btnDiary.y - 100 }, 1000, Laya.Ease.bounceIn, Laya.Handler.create(this, ()=>{this.btnDiary.y-=100}), 1000);
    // }
    diaryOpen() {
        Laya.SoundManager.playMusic("sound/bgm2.mp3")
        this._director.pauseGame()
        this._store.actions.restoreStoryIndex()
        this.dialogDiary.getChildByName('aniCat').source = `ani/cat/Cat${this._store.state.player.level}.ani`
        this.dialogDiary.getChildByName('labelDiary').text = this._store.state.storyArr[this._store.state.player.level - 1]
        this.dialogDiary.visible = true
        this.dialogDiary.show()
    }
    diaryClose() {
        Laya.SoundManager.playMusic("sound/bgm.mp3")
        this._director.continueGame()
    }
    diaryLeft() {
        let storyIndex = this._store.actions.moveStoryIndex(-1)
        this.dialogDiary.getChildByName('aniCat').source = `ani/cat/Cat${storyIndex + 1}.ani`
        this.dialogDiary.getChildByName('labelDiary').text = this._store.state.storyArr[storyIndex]
    }
    diaryRight() {
        let storyIndex = this._store.actions.moveStoryIndex(1)
        this.dialogDiary.getChildByName('aniCat').source = `ani/cat/Cat${storyIndex + 1}.ani`
        this.dialogDiary.getChildByName('labelDiary').text = this._store.state.storyArr[storyIndex]
    }

    giftOpen() {
        this._director.pauseGame()
        this.dialogGift.visible = true
        this.dialogGift.show()
    }
    giftClose() {
        this._director.continueGame()
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