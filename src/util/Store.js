/**
 * 网络请求类
 */
class Axios {
    constructor() {
        new Laya.HttpRequest()
        // this.domain = 'http://wall.xserver.top'
        this.domain = 'http://localhost:3002'
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
            xhr.send(`${this.domain}${url}`, '', 'get', 'json', ["content-type", "application/json;charset=UTF-8", "token", store.state.token])
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
            xhr.send(`${this.domain}${url}`, JSON.stringify(data), 'post', 'json', ["content-type", "application/json;charset=UTF-8", "token", store.state.token])
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
        upRange: 320,
        downRange: 220,

        token: null,
        player: { exp: 0, level: 0, gold: 0 },
        progressValue: 0,
        enemyMap: new Map()
    },
    actions: {
        // 玩家登录
        async login() {
            let player = store.pGetItem('player') || store.state.player
            let res = await store.axios.post('/xserver/player/login', player)
            store.state.player = res.player
            store.state.token = res.token
            store.progressValue = res.progressValue
            store.pSetItem('player', res.player)
        },
        // 玩家领取猫币
        async earn() {
            let res = await store.axios.get('/xserver/player/earn')
            if (!res.err) {
                store.state.player = res.player
                store.pSetItem('player', store.state.player)
            }
            return res
        },
        // 玩家购买
        async buy() {
            let res = await store.axios.get('/xserver/player/buy')
            if (!res.err) {
                store.state.player = res.player
                store.pSetItem('player', store.state.player)
            }
            return res
        },
        // 玩家捕食
        async eat() {
            let res = await store.axios.get('/xserver/player/eat')
            store.state.player = res.player
            store.pSetItem('player', store.state.player)
            store.progressValue = res.progressValue
            // 如果升级了需要更新token
            if (res.token) {
                store.state.token = res.token
            }
            return res
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

export default store