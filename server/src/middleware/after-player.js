// 系统配置参数
const config = require('config')
// 身份令牌相关
const jwt = require('jsonwebtoken')
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
//     if (inparam.username) {
//         let token = jwt.sign({
//             role: 'player',
//             username: inparam.username,
//             // exp: Math.floor(Date.now() / 1000) + 86400 * 30
//         }, config.auth.secret)
//         ctx.body = { username: inparam.username, token }
//     } else {
//         ctx.body = { err: false }
//     }
// })

module.exports = router