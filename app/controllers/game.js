"use strict"

var utils = require("../../libs/utils")

var wx = require("../../wx/index")
var Movie = require("../api/movie")
exports.guess = async(ctx, next) => {
    if (ctx.url.indexOf('/movie') > -1) {
        var wechatApi = wx.getWechat()
        var data = await wechatApi.fetchAccessToken()
        var access_token = data.access_token
        var ticketData = await wechatApi.fetchTicket(access_token)
        var ticket = ticketData.ticket
        var url = ctx.href
        var params = utils.sign(ticket, url)
        await ctx.render("wechat/game", params)
    }
}
exports.find = async(ctx, next) => {
    if (ctx.url.indexOf('/movie') > -1) {
        var id = ctx.params.id
        var wechatApi = wx.getWechat()
        var data = await wechatApi.fetchAccessToken()
        var access_token = data.access_token
        var ticketData = await wechatApi.fetchTicket(access_token)
        var ticket = ticketData.ticket
        var url = ctx.href
        var params = utils.sign(ticket, url)
        var movie = await Movie.searchById(id)
        params.movie = movie
        console.log(params)
        await ctx.render("wechat/movie", params)
    }
}
