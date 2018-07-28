"use strict"

var wechat = require("../../wechat/g")
var reply = require("../../wx/reply")
var wx = require("../../wx/index")

exports.hear = async(ctx, next) => {
    ctx.middle = wechat(wx.wechatOptions.wechat, reply.reply)
    await ctx.middle(ctx, next)
}