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
        storyArr: ['\n\n9.22 星期天\n\n今天我在路边捡到了一只可爱的小猫！\n她实在是太可爱了，我给他起名叫大黑。\n\n从今天开始，我每天都要为她写日记。\n\n一回到家，她就开始在我的屋里抓耗子！真乖…\n\n但是妈妈很讨厌猫，我要把她藏起来，\n不能让妈妈看到。',
            '\n\n9.23 星期一\n\n今天她突然开始用两只脚走路了！！\n\n她也太擅长模仿了吧！！\n她用手抓耗子的样子也忒可爱了，\n\n你看她一扭一扭魔性的样子，\n真是一只聪明的大黑。',
            '\n\n10.6 星期五\n\n她长的太快了，几天不见已经变化好大！\n\n但是妈妈到底还是发现了她…\n妈妈她很不开心，非常的生气…\n\n也不知道为啥子，大黑这么可爱，\n妈妈怎么就是不喜欢呢？',
            '\n\n11.8 星期二\n\n昨天，大黑不见了…\n可能是妈妈把她给扔掉了…\n\n但是她真的好聪明，今天居然自己找了回来！\n\n然而不知道为什么，她肚脐下面全是腿…!\n\n但是还是那么可爱~~',
            '\n\n12.12 星期四\n\n今天双十二，妈妈已经一周没有出过她房间了。\n也不给我做饭，饿死我了。\n\n大黑今天也很奇怪，突然开口跟我说话了！！\n\n她什么时候学会说话的？？？',
            '\n\n12.14 星期六\n\n今天到了很多快递，大黑也越来越与众不同了。\n在与大黑的相处过程中，她教会了我许多东西。\n我觉得我再也不用去学校了！\n\n妈妈不知道哪去了，从上次我就再没见过她。\n她的房间里也不时的传出一些奇怪的味道。\n\n不过没关系，还有大黑陪着我。\n我们会永远在一起。',
            '\n\n1.25 星期六\n\n今天是农历新年，这一个多月妈妈再没露过面。\n就跟人间蒸发了一样。\n\n妈妈不在的这段日子里，大黑操办了我的生活。\n为我洗衣，为我做饭。把我照顾得无微不至。\n\n今晚的年夜饭我也将与她一起度过。\n你看她拿起刀叉的样子，可不可爱？',
            '9.2  星期日\n\n时空扭转。\n今天是中元节，马上就是我与大黑相识一周年了。\n中元节的传统是焚纸锭、祀亡魂。\n\n大黑一早兴致勃勃的要跟我一起去河边祭祖。\n可问题是，我都不知道该烧给谁呀。\n以前这些事都是妈妈做的。\n\n到了河边，大黑念了一通悼文，\n居然跟妈妈当时念得一模一样。\n\n火烧的很大，点燃了大黑的裙摆样的大脸。\n她的样子反而更可爱了。',
            '10.1 星期四\n\n大今天是国庆，也是中秋，连续放八天假。\n不知道为什么，大黑今天很开心。\n我已经一年没去学校了，放不放假什么的，\n完全没影响。\n\n今晚月圆，\n兴奋过度的大黑在阳台上对着月亮哼哼有声。\n“啷类各啷类各啷类各啷”\n\n然后，她就分裂成了好几个。\n最后围着大头转成了一个圈。\n好可爱！',
            '\n2.3 星期三\n\n又一年春天到了，大黑发芽了。\n今天早上大黑没给我做早饭，我以为她生病了。\n急忙去药店给她买来感冒药。\n\n谁知回到家，推开她房门的时候，\n发现她在地上盘成一团，就这么发芽了。\n\n发芽的同时，我的玩具也被她的枝桠给粘上了。\n还能怎么办？\n重新再买玩具呗。',
            '\n3.5 星期五\n\n春天过去了一半，\n这几天窗外总是跑过去一些小黑猫。\n算算日子，大黑快三岁了，也该放眼未来了。\n\n只是小黑猫总是络绎不绝，只进不出。\n大黑也太厉害了吧？\n\n结果，今天大黑出来变成了“真黑”。\n这也太浮夸了吧，你是螳螂吗！？',
            '\n6.1 星期二\n\n今天我不想写日记，别问我为什么。\n\n因为我真的写不下去了。\n大黑居然变成了这个样子。\n\n怀孕仨月，她并没有生下小猫。\n反而生了个自己出来。\n然后下半身变成了我的样子，套了件斗篷。\n\n还变出根木棍把自己吊在上面。\n我不明白她什么意思，也不想知道。',
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