/**
 * 引导器脚本
 */
export default class Guide extends Laya.Script {
    constructor() { super() }
    onEnable() {
    }

    onTriggerEnter(other, self, contact) {
        if (other.label == "soldier") {
            this.owner.visible = false
        }
    }

    onUpdate() {
    }

    onDisable() {
    }
}