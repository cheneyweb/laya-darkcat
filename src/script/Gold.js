import GameUI from "../view/GameUI"

/**
 * 金币脚本
 */
export default class Gold extends Laya.Script {
    constructor() { super() }
    onEnable() {
        this.textGold = this.owner.getChildByName('textGold')
    }

    onTriggerEnter(other, self, contact) {
        if (other.label == "soldier") {
            this._soldier = other.owner.getComponent(Laya.Script)
            if (this._soldier.isFreedom()) {
                Laya.SoundManager.playSound("sound/gold.mp3")
                GameUI.instance.earnGold('pick').then((res => {
                    if (!res.err) {
                        console.log(res)
                        this.textGold.text = `猫币+${res.goldInc}`
                        this.textGold.visible = true
                        Laya.Tween.to(this.textGold, { y: this.textGold.y - 60 }, 500, Laya.Ease.linearOut, Laya.Handler.create(this, this._pickGold))
                    }
                }))
            }
        }
    }

    onUpdate() {
    }

    onDisable() {
        Laya.Pool.recover("goldpack", this.owner)
        Laya.store.actions.delGold(this.owner)
    }

    _pickGold() {
        this.textGold.visible = false
        this.owner.removeSelf()
    }
}