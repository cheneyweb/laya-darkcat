/**
 * 引导器脚本
 */
export default class Guide extends Laya.Script {
    constructor() { super() }
    onEnable() {
    }

    onTriggerEnter(other, self, contact) {
        if (other.label == "soldier") {
            if (other.owner.getComponent(Laya.Script).isFreedom()) {
                Math.random() < 0.2 && Laya.SoundManager.playSound("sound/tease.mp3")
                this.owner.visible = false
                this.owner.pos(0, 0)
            }
        }
    }

    onUpdate() {
    }

    onDisable() {
    }
}