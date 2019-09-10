import GameUI from "../view/GameUI"
/**
 * 游戏导演控制类
 */
export default class GameDirector extends Laya.Script {
    /** @prop {name:enemy,tips:"敌人预置对象",type:Prefab}*/
    /** @prop {name:soldier,tips:"士兵预置对象",type:Prefab}*/
    // /** @prop {name:weapon,tips:"武器预置对象",type:Prefab}*/
    // /** @prop {name:bullet,tips:"子弹预置对象",type:Prefab}*/
    constructor() {
        super()
        GameDirector.instance = this
    }

    onEnable() {
        this._store = Laya.store                                //全局状态
        this._started = false                                   //是否已经开始游戏
        this._giftCount = 30                                    //初始狗尾巴草数量
        this._fakeCount = 5                                     //初始伪装次数
        this._fieldCount = 2                                    //初始化防护罩次数
        this._enemyCount = 10                                   //敌人数量
        this._countDown = 30                                    //被发现倒计时
        this._lastCountDownTime = Date.now()                    //上次倒计时时间
        this._lastCreateEnemyTime = Date.now()                  //上次刷新敌人时间
        this._lastCreateBulletTime = Date.now()                 //上次创建子弹时间
        this._countDownInterval = 1000                          //倒计时时间间隔
        this._createEnemyInterval = 500                         //创建敌人时间间隔
        this._createBulletInterval = 3000                       //创建子弹时间间隔
        this.bg = this.owner.getChildByName("bg")               //背景
        this.guide = this.owner.getChildByName("guide")         //鼠标指引
        this.spriteBox = this.owner.getChildByName("spriteBox") //敌人,士兵,子弹所在的容器
        this.weaponArr = []
        this.weaponArr.push(this.owner.getChildByName("weapon"))
        // this.weaponArr.push(this.owner.getChildByName("weapon2"))
    }

    onUpdate() {
        let now = Date.now()
        if (this._started) {
            //倒计时
            if (now - this._lastCountDownTime >= this._countDownInterval) {
                this._lastCountDownTime = now
                GameUI.instance.countDown(this._countDown--)
                if (--this._countDown == 0) {
                    this.bg.texture = "bg/bg_blue.jpg"
                    for (let weapon of this.weaponArr) {
                        weapon.visible = true
                    }
                    //播放背景音乐
                    Laya.SoundManager.playMusic("sound/alert.mp3")
                }
            }
            //每间隔一段时间创建子弹
            if (now - this._lastCreateBulletTime > this._createBulletInterval) {
                this._lastCreateBulletTime = now
                if (this._countDown < 0) {
                    this._createBullet()
                }
            }
            //每间隔一段时间创建敌人
            // if (now - this._lastCreateEnemyTime > this._createEnemyInterval) {
            //     this._lastCreateEnemyTime = now
            //     this._createEnemy()
            // }
        }
    }

    onStageClick(e) {
        //停止事件冒泡，提高性能
        e.stopPropagation()
        if (this._started) {
            //显示鼠标指引
            if (this._giftCount > 0 && e.stageY > this._store.state.upRange && e.stageY < (Laya.stage.height - this._store.state.downRange)) {
                this.guide.pos(e.stageX, e.stageY)
                //控制士兵朝点击位置移动
                this.cat && this.cat.getComponent(Laya.Script).setVelocity(null, e)
                //更新狗尾巴草库存
                GameUI.instance.giftCount(--this._giftCount)
            }
        }
    }

    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame() {
        this._started = true
        this.guide.visible = true
        this._createEnemy()
        this._createSoldier()
    }

    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame() {
        this._started = false
        this._countDown = 10
        this._giftCount = 30
        this._fakeCount = 5
        this._fieldCount = 2
        this._createEnemyInterval = 1000
        this.guide.visible = false
        this.bg.texture = "bg/bg_dark.jpg"
        this.spriteBox.removeChildren()
        for (let weapon of this.weaponArr) {
            weapon.visible = false
        }
    }

    /**提升难度 */
    adjustLevel() {
        if (this._createEnemyInterval > 600) {
            this._createEnemyInterval -= 10
        }
    }

    /**开启伪装 */
    openFake() {
    }

    /**开启防护罩 */
    openField() {
    }

    _createEnemy() {
        //使用对象池创建敌人
        // if (this._store.state.enemyMap.size < 20) {
        for (let i = 0; i < this._enemyCount; i++) {
            setTimeout(() => {
                let enemy = Laya.Pool.getItemByCreateFun("enemy", this.enemy.create, this.enemy)
                enemy.pos(enemy.width + 40, Math.random() * 500 + 320)
                this.spriteBox.addChild(enemy)
                this._store.actions.addEnemy(enemy)
            }, Math.random() * 5000)
        }
        // }
    }

    _createSoldier(e) {
        //使用对象池创建士兵
        // this.cat = Laya.Pool.getItemByCreateFun("soldier", this.soldier.create, this.soldier)
        this.cat = this.soldier.create()
        if (e) {
            this.cat.pos(e.stageX, e.stageY)
        } else {
            this.cat.pos(Laya.stage.width / 2, Laya.stage.height / 2)
        }
        this.spriteBox.addChild(this.cat)
    }

    _createBullet() {
        //获取所有敌人,y坐标从大到小排序，0首位最近
        // let enemyArr = [...this._store.state.enemyMap.keys()].sort((a, b) => b.y - a.y)
        //获取所有武器
        for (let i = 0; i < this.weaponArr.length; i++) {
            let weapon = this.weaponArr[i]
            // let enemyTarget = enemyArr[i]
            let enemyTarget = this.cat
            //武器准备好且敌人出现了
            if (enemyTarget) {
                //使用对象池创建子弹
                let bullet = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet)
                //设定子弹初始位置
                bullet.pos(weapon.x, weapon.y + 150)
                //设定子弹初速度
                let vx = (enemyTarget.x - bullet.x) / 40
                let vy = (enemyTarget.y - bullet.y) / 40
                //武器旋转角度
                // let rotation = Math.atan(vy / vx) / (Math.PI / 180)
                // weapon.rotation = -rotation
                bullet.getComponent(Laya.RigidBody).setVelocity({ x: vx, y: vy })
                this.spriteBox.addChild(bullet)
            }
        }
    }

    // _createWeapon() {
    //     //使用对象池创建炮塔
    //     let weapon = this._weapon = this.weapon.create()
    //     weapon.pos(Laya.stage.width - 100, Laya.stage.height / 2)
    //     weapon.getChildByName('aniTurret').play(0, true)
    //     this.spriteBox.addChild(weapon)
    // }
}