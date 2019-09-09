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
        this._countDown = 10
        this._lastCountDownTime = Date.now()
        this._lastCreateEnemyTime = Date.now()                  //上次刷新敌人时间
        this._lastCreateBulletTime = Date.now()                 //上次创建子弹时间
        this._countDownInterval = 1000
        this._createEnemyInterval = 500                         //创建敌人时间间隔
        this._createBulletInterval = 500                        //创建子弹时间间隔
        this.bg = this.owner.getChildByName("bg")               //背景
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
                if (this._countDown < 0) {
                    this.bg.texture = "bg/bg_blue.jpg"
                    for (let weapon of this.weaponArr) {
                        weapon.visible = true
                    }
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
        //控制士兵朝点击位置移动
        let speedControl = 200 * Math.random()
        let vx = (e.stageX - this.soldier.x) / speedControl
        let vy = (e.stageY - this.soldier.y) / speedControl
        this.soldier.getComponent(Laya.RigidBody).setVelocity({ x: vx, y: vy })
    }

    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame() {
        this._started = true
        this._createEnemy()
        this._createSoldier()
    }

    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame() {
        this._started = false
        this._countDown = 10
        this._createEnemyInterval = 1000
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

    _createEnemy() {
        //使用对象池创建敌人
        // if (this._store.state.enemyMap.size < 20) {
        for (let i = 0; i < 10; i++) {
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
        this.soldier = Laya.Pool.getItemByCreateFun("soldier", this.soldier.create, this.soldier)
        if (e) {
            this.soldier.pos(e.stageX, e.stageY)
        } else {
            this.soldier.pos(100, 800)
        }
        this.spriteBox.addChild(this.soldier)
    }

    _createBullet() {
        //获取所有敌人,y坐标从大到小排序，0首位最近
        // let enemyArr = [...this._store.state.enemyMap.keys()].sort((a, b) => b.y - a.y)
        //获取所有武器
        for (let i = 0; i < this.weaponArr.length; i++) {
            let weapon = this.weaponArr[i]
            // let enemyTarget = enemyArr[i]
            let enemyTarget = this.soldier
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