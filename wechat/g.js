"use strict"

var sha1 = require("sha1")
var Wechat = require("./wechat")
var getRawBody = require("raw-body")
var utils = require("../libs/utils")
module.exports = function(opt, handler) {
var wechat = new Wechat(opt)
return async (ctx, next) => {
    try {
        var token = opt.token
        var signature = ctx.query.signature
        var nonce = ctx.query.nonce
        var timestamp = ctx.query.timestamp
        var echostr = ctx.query.echostr
        var str = [token, timestamp, nonce].sort().join("")
        var sha = sha1(str)
        if (ctx.method === "GET") {
            if (sha === signature) {
                ctx.body = echostr + ''
            } else {
                ctx.body = 'wrong'
            }
        } else if (ctx.method === "POST") {
            if (sha !== signature) {
                ctx.body = "wrong"
            }
            var data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: "1mb",
                encoding: ctx.charset
            })

            var content = await utils.parseXMLAsync(data)
            var message = utils.formatMessage(content.xml)

            ctx.weixin = message
            await handler(ctx, next)

            await wechat.reply(ctx)
        }
    } catch ( err ) {
        console.log(err.message)
    }


}
}

