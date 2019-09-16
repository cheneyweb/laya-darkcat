/**
 * 网络请求类
 */
class Axios {
    constructor() {
        new Laya.HttpRequest()
        this.domain = 'https://darkcat.xserver.top'
        // this.domain = 'http://localhost:3002'
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
        if (Laya.LocalStorage.getItem(key)) {
            return JSON.parse(Laya.LocalStorage.getItem(key))
        } else {
            return null
        }
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
        player: { exp: 0, level: 0, gold: 0, progressValue: 0 },
        shareTitle: '这猫长这样我也是醉了...',
        enemyMap: new Map()
    },
    actions: {
        // 玩家登录
        login(type) {
            return new Promise((resolve, reject) => {
                // 微信小游戏平台
                if (type == 'wx') {
                    wx.cloud.callFunction({ name: 'login', data: {} }).then(wxRes => {
                        let player = store.pGetItem('player') || store.state.player
                        player.openid = wxRes.result.openid
                        store.axios.post('/xserver/player/login', player).then(loginRes => {
                            store.state.player = loginRes.player
                            store.state.token = loginRes.token
                            store.state.shareTitle = loginRes.shareTitle
                            store.pSetItem('player', loginRes.player)
                            resolve(loginRes)
                        })
                    }).catch(console.error)
                }
                // WEB平台 
                else {
                    let player = store.pGetItem('player') || store.state.player
                    store.axios.post('/xserver/player/login', player).then(loginRes => {
                        store.state.player = loginRes.player
                        store.state.token = loginRes.token
                        store.pSetItem('player', loginRes.player)
                        resolve(loginRes)
                    })
                }
            })
        },
        // 玩家领取猫币
        earn(type) {
            return new Promise((resolve, reject) => {
                store.axios.get(`/xserver/player/earn?type=${type}`).then(res => {
                    if (!res.err) {
                        store.state.player = res.player
                        resolve(res)
                        store.pSetItem('player', store.state.player)
                    }
                })
            })

        },
        // 玩家购买
        buy(isRandom) {
            return new Promise((resolve, reject) => {
                store.axios.get(`/xserver/player/buy?isRandom=${isRandom}`).then(res => {
                    if (!res.err) {
                        store.state.player = res.player
                        resolve(res)
                        store.pSetItem('player', store.state.player)
                    }
                })
            })
        },
        // 玩家捕食
        eat() {
            return new Promise((resolve, reject) => {
                store.axios.get('/xserver/player/eat').then(res => {
                    store.state.player = res.player
                    resolve(res)
                    store.pSetItem('player', store.state.player)
                    // 如果升级了需要更新token
                    if (res.token) {
                        store.state.token = res.token
                    }
                })
            })
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