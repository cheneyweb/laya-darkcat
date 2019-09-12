// 系统配置参数
const config = require('config')
const appPort = config.server.appPort
// const staticRoot = config.server.staticRoot

// 应用服务相关
const Koa = require('koa')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const mount = require('koa-mount')
const staticServer = require('koa-static')

// 应用中间件
const xcontroller = require('koa-xcontroller')
const xnosql = require('koa-xnosql')
const xerror = require('koa-xerror')
const xauth = require('koa-xauth')
const xlog = require('koa-xlog')

// 德州应用服务
const app = new Koa()
// app.use(mount(staticRoot, staticServer(__dirname + '/static')))
app.use(mount('/', cors()))
app.use(xerror(config.error))
app.use(koaBody())
app.use(xlog(config.log))
app.use(xauth(config.auth))
xnosql.init(app, config.server)
xcontroller.init(app, config.server)
app.listen(appPort)
console.info(`Restaurant应用服务启动【执行环境:${process.env.NODE_ENV},端口:${appPort}】`)

