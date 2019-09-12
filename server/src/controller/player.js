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
    4: { expMax: 30, price: 10 },
    5: { expMax: 50, price: 15 },
    6: { expMax: 100, price: 15 },
    7: { expMax: 200, price: 20 },
    8: { expMax: 300, price: 20 },
    9: { expMax: 500, price: 25 },
    10: { expMax: 600, price: 25 },
    11: { expMax: 800, price: 30 },
    12: { expMax: 1000, price: 30 },
}

function initPlayer(inparam) {
    inparam.exp = 0
    inparam.level = 1
    inparam.gold = 100
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
    // 查询玩家是否存在，不存在则自动创建
    if (inparam._id) {
        player = await mongodb.collection('player').findOne({ _id: ObjectId(inparam._id) })
        if (!player) {
            delete inparam._id
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
    let resData = { player: res.value }
    // 如果经验值满足条件，增加玩家等级
    if (res.value.exp >= LevelConfig[res.value.level].expMax) {
        res = await mongodb.collection('player').findOneAndUpdate(
            { _id: token._id },
            { $inc: { level: 1 }, $set: { exp: 0 } },
            { returnOriginal: false }
        )
        resData.token = jwt.sign(_.pick(player, ['_id', 'level']), config.auth.secret)
    }
    ctx.body = resData
})

module.exports = router