import GameUI from "../view/GameUI"

/**
 * 金币脚本
 */
export default class Gold extends Laya.Script {
    constructor() { super() }
    onEnable() {
    }

    onTriggerEnter(other, self, contact) {
        if (other.label == "soldier") {
            this._soldier = other.owner.getComponent(Laya.Script)
            if (this._soldier.isFreedom()) {
                Laya.SoundManager.playSound("sound/gold.mp3")
                this.owner.removeSelf()
                GameUI.instance.earnGold('pick')
            }
        }
    }

    onUpdate() {
    }

    onDisable() {
        Laya.Pool.recover("goldpack", this.owner)
        Laya.store.actions.delGold(this.owner)
    }
}