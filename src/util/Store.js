/**
 * 网络请求类
 */
class Axios {
    constructor() {
        new Laya.HttpRequest()
        this.domain = 'http://darkcat.xserver.top'
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
        enemyMap: new Map()
    },
    actions: {
        // 玩家登录
        async login() {
            // 微信小游戏平台
            if (Laya.Browser.onMiniGame) {
                wx.cloud.init()
                wx.cloud.callFunction({ name: 'login', data: {} }).then( async res => {
                    let player = store.pGetItem('player') || store.state.player
                    player.openid = res.result.openid
                    let res = await store.axios.post('/xserver/player/login', player)
                    store.state.player = res.player
                    store.state.token = res.token
                    store.pSetItem('player', res.player)
                }).catch(console.error)
                // let button = wx.createUserInfoButton({
                // 	type: 'text',
                // 	text: '获取用户信息',
                // 	style: {
                // 		left: 10,
                // 		top: 76,
                // 		width: 200,
                // 		height: 40,
                // 		lineHeight: 40,
                // 		backgroundColor: '#ff0000',
                // 		color: '#ffffff',
                // 		textAlign: 'center',
                // 		fontSize: 16,
                // 		borderRadius: 4
                // 	}
                // })
                // button.onTap((res) => {
                // 	console.log(res)
                // })
            }
            // WEB平台 
            else {
                let player = store.pGetItem('player') || store.state.player
                let res = await store.axios.post('/xserver/player/login', player)
                store.state.player = res.player
                store.state.token = res.token
                store.pSetItem('player', res.player)
            }
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