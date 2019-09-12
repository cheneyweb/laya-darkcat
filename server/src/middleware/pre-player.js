// 系统配置参数
const config = require('config')
// 路由相关
const Router = require('koa-router')
const router = new Router()
// 日志相关
const log = require('tracer').colorConsole({ level: config.log.level })

/**
 * 更新玩家
 */
// router.post('/player/update', async (ctx, next) => {
//     let inparam = ctx.request.body
//     let mongodb = global.mongodb
//     if (!inparam.password) {
//         delete inparam.password
//     }
//     if (!inparam.username) {
//         delete inparam.username
//         return next()
//     } else if (await mongodb.collection('player').findOne({ username: inparam.username }, { projection: { _id: 1 } })) {
//         ctx.body = { err: true, res: '帐号已存在' }
//     } else {
//         return next()
//     }
// })

module.exports = router