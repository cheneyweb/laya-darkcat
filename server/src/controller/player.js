// const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const Router = require('koa-router')
const router = new Router()
const ObjectId = require('mongodb').ObjectID

const ShareMap = {}
const AdMap = {}

// 等级配置
// const LevelConfig = {
//     1: { expMax: 10, price: 50 },
//     2: { expMax: 20, price: 50 },
//     3: { expMax: 40, price: 50 },
//     4: { expMax: 80, price: 50 },
//     5: { expMax: 160, price: 50 },
//     6: { expMax: 240, price: 50 },
//     7: { expMax: 500, price: 50 },
//     8: { expMax: 1000, price: 50 },
//     9: { expMax: 2000, price: 50 },
//     10: { expMax: 4000, price: 100 },
//     11: { expMax: 8000, price: 100 },
//     12: { expMax: 20000, price: 100 },
// }
const LevelConfig = {
    1: { expMax: 3, price: 3 },
    2: { expMax: 4, price: 4 },
    3: { expMax: 5, price: 5 },
    4: { expMax: 6, price: 6 },
    5: { expMax: 7, price: 7 },
    6: { expMax: 8, price: 8 },
    7: { expMax: 9, price: 9 },
    8: { expMax: 10, price: 10 },
    9: { expMax: 11, price: 11 },
    10: { expMax: 12, price: 12 },
    11: { expMax: 13, price: 13 },
    12: { expMax: 1000, price: 1000 },
}

function initPlayer(inparam) {
    inparam.exp = 0
    inparam.level = 1
    inparam.gold = 500
    inparam.lastLogin = Date.now()
    delete inparam._id
    delete inparam.progressValue
    delete inparam.price
}

function calcProgressValue(player) {
    return +(player.exp / LevelConfig[player.level].expMax).toFixed(2)
}

/**
 * 玩家登录
 * _id
 * exp
 * level
 * gold
 */
router.post('/login', async (ctx, next) => {
    const inparam = ctx.request.body
    const mongodb = global.mongodb
    ctx.body = { err: false }
    let shareTitle = '这猫长这样我也是醉了...'
    let player
    // 微信小游戏平台
    if (inparam.openid) {
        player = await mongodb.collection('player').findOne({ openid: inparam.openid })
        if (!player) {
            initPlayer(inparam)
            res = await mongodb.collection('player').insertOne(inparam)
            player = { ...inparam, _id: res.insertedId }
        } else {
            player.lastLogin = Date.now()
            mongodb.collection('player').findOneAndUpdate({ _id: ObjectId(player._id) }, { $set: { lastLogin: player.lastLogin } })
        }
    }
    // WEB平台，查询玩家是否存在，不存在则自动创建
    else if (inparam._id) {
        player = await mongodb.collection('player').findOne({ _id: ObjectId(inparam._id) })
        if (!player) {
            initPlayer(inparam)
            res = await mongodb.collection('player').insertOne(inparam)
            player = { ...inparam, _id: res.insertedId }
        } else {
            player.lastLogin = Date.now()
            mongodb.collection('player').findOneAndUpdate({ _id: ObjectId(player._id) }, { $set: { lastLogin: player.lastLogin } })
        }
    } else {
        initPlayer(inparam)
        let res = await mongodb.collection('player').insertOne(inparam)
        player = { ...inparam, _id: res.insertedId }
    }
    const token = jwt.sign(_.pick(player, ['_id', 'level']), config.auth.secret)
    player.progressValue = calcProgressValue(player)
    player.price = `${LevelConfig[player.level].price}猫币/只`
    ctx.body = { player, token, shareTitle }
})

/**
 * 玩家领取猫币
 */
router.get('/earn', async (ctx, next) => {
    const token = ctx.tokenVerify
    const mongodb = global.mongodb
    const inparam = ctx.request.query
    let goldInc = 0
    if (inparam.type == 'share') {
        // 每日前3次分享可领取
        let playerToday = `${token._id}${new Date().Format('yyMMdd')}`
        if (!ShareMap[playerToday]) {
            ShareMap[playerToday] = 0
        }
        if (ShareMap[playerToday] || ShareMap[playerToday] == 0) {
            if (ShareMap[playerToday]++ < 3) {
                goldInc = 500
            }
        }
    } else if (inparam.type == 'ad') {
        // 大于30秒可领取
        if (!AdMap[token._id] || AdMap[token._id] - Date.now() > 30000) {
            AdMap[token._id] = Date.now()
            goldInc = 500
        }
    } else if (inparam.type == 'pick') {
        goldInc = _.random(10, 100)
    }
    // 增加玩家金币，返回变更后数据
    if (goldInc > 0) {
        let res = await mongodb.collection('player').findOneAndUpdate(
            { _id: ObjectId(token._id) },
            { $inc: { gold: goldInc } },
            { returnOriginal: false }
        )
        ctx.body = res.value ? { player: res.value } : { err: true, msg: '登录失效!' }
    } else {
        ctx.body = { err: true, msg: '分享上限！' }
    }
})

/**
 * 玩家购买
 */
router.get('/buy', async (ctx, next) => {
    const token = ctx.tokenVerify
    const mongodb = global.mongodb
    const inparam = ctx.request.query
    let price = LevelConfig[token.level].price
    let isGold = 0
    // 触发随机事件
    if (inparam.isRandom) {
        price = 0
        isGold = Math.random() < 0.5 ? true : 0 // 50%概率触发金币掉落
    }
    // 扣减玩家金币，返回变更后数据
    let res = await mongodb.collection('player').findOneAndUpdate(
        { _id: ObjectId(token._id), gold: { $gte: price } },
        { $inc: { gold: -price } },
        { returnOriginal: false }
    )
    ctx.body = res.value ? { player: res.value, isGold } : { err: true, msg: '猫币不足!' }
})

/**
 * 玩家捕食
 */
router.get('/eat', async (ctx, next) => {
    const token = ctx.tokenVerify
    const mongodb = global.mongodb
    let expInc = 1
    // 增加玩家经验值
    let res = await mongodb.collection('player').findOneAndUpdate(
        { _id: ObjectId(token._id) },
        { $inc: { exp: expInc } },
        { returnOriginal: false }
    )
    res.value.progressValue = calcProgressValue(res.value)
    let resData = { player: res.value }
    // 如果经验值满足条件，增加玩家等级
    if (res.value.exp >= LevelConfig[res.value.level].expMax) {
        res = await mongodb.collection('player').findOneAndUpdate(
            { _id: ObjectId(token._id) },
            { $set: { exp: 0 }, $inc: { level: 1 } },
            { returnOriginal: false }
        )
        resData = { player: res.value }
        resData.player.progressValue = 0
        resData.token = jwt.sign(_.pick(res.value, ['_id', 'level']), config.auth.secret)
    }
    resData.price = `${LevelConfig[token.level].price}猫币/只`
    ctx.body = resData
})

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds()
        // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) :
                (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

module.exports = router