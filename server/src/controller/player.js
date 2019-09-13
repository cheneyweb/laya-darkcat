// const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const Router = require('koa-router')
const router = new Router()
const ObjectId = require('mongodb').ObjectID

// 等级配置
const LevelConfig = {
    1: { expMax: 3, price: 5 },
    2: { expMax: 10, price: 5 },
    3: { expMax: 20, price: 10 },
    4: { expMax: 100, price: 15 },
    5: { expMax: 200, price: 20 },
    6: { expMax: 300, price: 25 },
    7: { expMax: 400, price: 30 },
    8: { expMax: 500, price: 35 },
    9: { expMax: 600, price: 40 },
    10: { expMax: 700, price: 45 },
    11: { expMax: 800, price: 50 },
    12: { expMax: 1000, price: 100 },
}

function initPlayer(inparam) {
    inparam.exp = 0
    inparam.level = 1
    inparam.gold = 100
    delete inparam._id
    delete inparam.progressValue
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
    let player
    // 微信小游戏平台
    if (inparam.openid) {
        player = await mongodb.collection('player').findOne({ openid: inparam.openid })
        if (!player) {
            initPlayer(inparam)
            res = await mongodb.collection('player').insertOne(inparam)
            player = { ...inparam, _id: res.insertedId }
        }
    }
    // WEB平台，查询玩家是否存在，不存在则自动创建
    else if (inparam._id) {
        player = await mongodb.collection('player').findOne({ _id: ObjectId(inparam._id) })
        if (!player) {
            initPlayer(inparam)
            res = await mongodb.collection('player').insertOne(inparam)
            player = { ...inparam, _id: res.insertedId }
        }
    } else {
        initPlayer(inparam)
        let res = await mongodb.collection('player').insertOne(inparam)
        player = { ...inparam, _id: res.insertedId }
    }
    const token = jwt.sign(_.pick(player, ['_id', 'level']), config.auth.secret)
    player.progressValue = calcProgressValue(player)
    ctx.body = { player, token }
})

/**
 * 玩家领取猫币
 */
router.get('/earn', async (ctx, next) => {
    const token = ctx.tokenVerify
    const mongodb = global.mongodb
    let goldInc = 50
    // 增加玩家金币，返回变更后数据
    let res = await mongodb.collection('player').findOneAndUpdate(
        { _id: ObjectId(token._id) },
        { $inc: { gold: goldInc } },
        { returnOriginal: false }
    )
    let price = `${LevelConfig[token.level].price}猫币/只`
    ctx.body = res.value ? { player: res.value, price } : { err: true, msg: '登录失效!' }
})

/**
 * 玩家购买
 */
router.get('/buy', async (ctx, next) => {
    const token = ctx.tokenVerify
    const mongodb = global.mongodb
    let price = LevelConfig[token.level].price
    // 扣减玩家金币，返回变更后数据
    let res = await mongodb.collection('player').findOneAndUpdate(
        { _id: ObjectId(token._id), gold: { $gte: price } },
        { $inc: { gold: -price } },
        { returnOriginal: false }
    )
    ctx.body = res.value ? { player: res.value } : { err: true, msg: '猫币不足!' }
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
    ctx.body = resData
})

module.exports = router