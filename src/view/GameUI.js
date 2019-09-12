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
        //点击开始游戏
        this.btnStart.on(Laya.Event.CLICK, this, this.beginGame);
        //点击释放食物
        this.btnFood.on(Laya.Event.CLICK, this, this.releaseFood);
        //点击赚取金币
        this.btnGold.on(Laya.Event.CLICK, this, this.earnGold);
        //点击分享
        this.btnShare.on(Laya.Event.CLICK, this, this.share);

        // 通过全局状态恢复数据
        this.labelGold.changeText(`猫币：x${Laya.store.state.player.gold}`)
        this.updateExp(Laya.store.state.player.progressValue)
    }

    /**开始游戏 */
    beginGame() {
        this.btnStart.visible = false;
        this.btnFood.visible = true;
        this.btnGold.visible = true;
        this.btnShare.visible = true;

        // this.labelTip.changeText('剩余被发现时间:30s');
        // this.labelTip.visible = true;

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
        // this.labelTip.visible = false;

        this.progressExp.visible = false
        this.labelGold.visible = false
        this.labelLaw.visible = false
        this.labelCopyright.visible = false
        this._director.stopGame()

        // this.die.visible = true
        // this.die.play(0, false)
        // this.die.on(Laya.Event.COMPLETE, null, () => {
        //     // ani.removeSelf()
        //     // Laya.Pool.recover("hit", ani)
        //     this.die.visible = false
        //     this.btnStart.visible = true;
        //     //播放背景音乐
        //     Laya.SoundManager.playMusic("sound/bg.mp3")
        // })
    }

    async releaseFood() {
        if (Laya.store.state.enemyMap.size < 10) {
            let res = await Laya.store.actions.buy()
            if (!res.err) {
                this.labelGold.changeText(`猫币：x${res.player.gold}`)
                this._director.releaseFood()
            } else {
                this.btnFood.label = res.msg
            }
        }
    }

    async earnGold() {
        let res = await Laya.store.actions.earn()
        if (!res.err) {
            this.labelGold.changeText(`猫币：x${res.player.gold}`)
            this.btnFood.label = res.price
        }
    }

    async share() {
    }

    updateExp(value) {
        this.progressExp.value = value
    }

    // countDown(countDown) {
    //     if (countDown <= 0) {
    //         this.labelCountDown.changeText(`发现变异基因!消灭程序启动!`);
    //         this.btnField.visible = true;
    //         this.btnFake.visible = true;
    //     } else {
    //         this.labelCountDown.changeText(`剩余被发现时间:${countDown}s`);
    //     }
    // }

    /**增加分数 */
    // addScore(value) {
    //     this._score += value;
    //     this.labelScore.changeText(`分数:${this._score}`);
    //     //随着分数越高，难度增大
    //     if (this._score % 20 == 0) {
    //         this._director.adjustLevel()
    //     }
    // }
}