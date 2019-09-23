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

        storyIndex: 0,
        storyArr: ['9.22 星期天\n\n今天我在路边捡到了一只可爱的小猫！\n她实在是太可爱了，我给他起名叫大黑。\n从今天开始，我每天都要为她写日记。\n\n一回到家，她就开始在我的屋里抓耗子！真乖…\n\n但是妈妈很讨厌猫，我要把她藏起来，\n不能让妈妈看到。',
            '9.23 星期一\n\n今天她突然开始用两只脚走路了！！\n她也太擅长模仿了吧！！\n用手抓耗子的样子也忒可爱了！\n\n你看她一扭一扭魔性的样子，\n真是一只聪明的大黑。',
            '10.6 星期五\n\n她长的太快了，几天不见已经变化好大！\n但是妈妈到底还是发现了她…\n妈妈她很不开心，非常的生气…\n\n也不知道为啥子，大黑这么可爱，\n妈妈怎么就是不喜欢呢？',
            '11.8 星期二\n\n昨天，大黑不见了…\n可能是妈妈把她给扔掉了…\n\n但是她真的好聪明，今天居然自己找了回来！\n\n然而不知道为什么，她肚脐下面全是腿…!\n\n但是还是那么可爱~~',
            '12.12 星期四\n\n今天双十二，妈妈已经一周没有出过她房间了。\n也不给我做饭，饿死我了。\n\n大黑今天也很奇怪，突然开口跟我说话了！！\n\n她什么时候学会说话的？？？',
            '12.14 星期六\n\n今天到了很多快递，大黑也越来越与众不同了。\n在与大黑的相处过程中，她教会了我许多东西。\n我觉得我再也不用去学校了！\n\n妈妈不知道哪去了，从上次我就再没见过她。\n她的房间里也不时的传出一些怪味。\n\n不过没关系，还有大黑陪着我。\n而且我好像也变得奇怪了起来。\n我们会永远在一起。',
            '??.?? 星期？\n\n我在时空中漂泊。看尽了世间百态。\n人类的崛起、进化、战争、和平、文明…还有爱。\n\n而这一切，大黑都与之相关，大黑启示录。',
            '??.?? 星期？\n\n时空扭转。\n伊人已逝。\n\n大黑接受不了残酷的现实，\n大黑只得向着更高的层次进化。\n\n宇宙规则已经改变…',
            '??.?? 星期？\n\n大黑修改了宇宙法则，成为这个宇宙新的神祇。\n能力越大责任越大，\n现在她将承担起对抗邪恶的任务。\n\n最后的战役即将打响。\n\n或许，大黑是孤独的，但她知道，\n主人永远相伴她的左右。',
            '??.?? 星期？\n\n喵即宇宙，宇宙即喵。\n太极生两仪，两仪生四象，\n四象生八卦，八卦生万物。\n\n新的世界混沌初开，只是不知是否还能遇到主人。\n\n而大黑的旅程却从未停止…',
            '??.?? 星期？\n\n创世神大黑一直在搜寻主人的踪迹，但毫无所得。\n一怒之下打开时空裂缝进入多元宇宙。\n\n融合了多元宇宙力量的大黑拥有更加强大的力量。\n但多元宇宙中的邪恶化身也感染了她。\n\n大黑陷入了与心魔的斗争中…',
            '大黑元年，1月1日，猫旦\n\n最终，大黑在与心魔的斗争中，自我意识胜出。\n\n而在此过程中，神格打成，新一代猫神就此诞生！',
        ],

        token: null,
        player: { exp: 0, level: 0, gold: 0, progressValue: 0 },
        shareTitle: '这猫长这样我也是醉了...',
        enemyMap: new Map(),
        goldMap: new Map()        
    },
    actions: {
        // 玩家登录
        login(plat) {
            return new Promise((resolve, reject) => {
                // 微信小游戏平台
                if (plat == 'wx') {
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
                        store.pSetItem('player', store.state.player)
                    }
                    resolve(res)
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
        // 日志翻动
        moveStoryIndex(i) {
            let index = store.state.storyIndex + i
            if (index >= store.state.player.level) {
                index = store.state.player.level - 1
            }
            else if (index < 0) {
                index = 0
            }
            store.state.storyIndex = index
            return store.state.storyIndex
        },
        restoreStoryIndex() {
            store.state.storyIndex = store.state.player.level - 1
        },
        // 添加敌人
        addEnemy(enemy) {
            store.state.enemyMap.set(enemy, enemy)
        },
        // 删除敌人
        delEnemy(enemy) {
            store.state.enemyMap.delete(enemy)
        },
        // 添加金币
        addGold(gold) {
            store.state.goldMap.set(gold, gold)
        },
        // 删除金币
        delGold(gold) {
            store.state.goldMap.delete(gold)
        }
    }
})

export default store