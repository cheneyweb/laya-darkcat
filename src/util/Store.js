/**
 * 网络请求类
 */
class Axios {
    constructor() {
        new Laya.HttpRequest()
        this.domain = 'http://wall.xserver.top'
        // this.domain = 'http://localhost:3001'
    }
    get(url) {
        return new Promise((resolve, reject) => {
            let xhr = new Laya.HttpRequest()
            xhr.http.timeout = 10000
            xhr.once(Laya.Event.COMPLETE, this, (e) => {
                resolve(e)
            })
            xhr.once(Laya.Event.ERROR, this, (error) => {
                console.error(error)
                reject(error)
            })
            xhr.send(`${this.domain}${url}`, '', 'get', 'json', ["content-type", "application/json;charset=UTF-8"])
        })
    }
    post(url, data) {
        return new Promise((resolve, reject) => {
            let xhr = new Laya.HttpRequest()
            xhr.http.timeout = 10000
            xhr.once(Laya.Event.COMPLETE, this, (e) => {
                resolve(e)
            })
            xhr.once(Laya.Event.ERROR, this, (error) => {
                console.error(error)
                reject(error)
            })
            xhr.send(`${this.domain}${url}`, JSON.stringify(data), 'post', 'json', ["content-type", "application/json;charset=UTF-8"])
        })
    }
}
/**
 * 状态管理类
 */
class Store {
    constructor(inparam) {
        this.state = inparam.state
        this.actions = inparam.actions
        this.axios = new Axios()
    }
    clear() {
        return Laya.LocalStorage.clear()
    }
    pGetItem(key) {
        return JSON.parse(Laya.LocalStorage.getItem(key))
    }
    pSetItem(key, obj) {
        return Laya.LocalStorage.setItem(key, JSON.stringify(obj))
    }
}

/**
 * 状态管理实例
 */
const store = new Store({
    state: {
        player: { nickname: 'cheney' },
        enemyMap: new Map(),
        bulletMap: new Map()
    },
    actions: {
        // 玩家登录
        async login() {
            let player = store.pGetItem('player') || store.state.player
            store.state.player = await store.axios.post('/xserver/player/login', player)
            store.pSetItem('player', store.state.player)
        },
        // 上传存档
        async upload() {
            let player = store.pGetItem('player')
            if (player) {
                player.nickname = 'cheney2'
                let res = await store.axios.post(`/xnosql/player/update`, player)
            }
        },
        // 添加敌人
        addEnemy(enemy) {
            store.state.enemyMap.set(enemy, enemy)
        },
        // 删除敌人
        delEnemy(enemy) {
            store.state.enemyMap.delete(enemy)
        }
    }
})

// 每隔10秒上传存档
// setInterval(() => {
//     Laya.store.actions.upload()
// }, 10000)

export default store