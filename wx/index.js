"use strict"
var path = require("path")
var utils = require("../libs/utils")
var Wechat = require("../wechat/wechat")
var wechat_file = path.join(__dirname, "../config/wechat.txt")
var wechat_ticket_file = path.join(__dirname, "../config/wechat_ticket.txt")
var config = {
    wechat: {
        appID: "wx4161ec2f6e8776f3",
        appSecret: "c25e6d71a05f3bd6c1238aed52a218f5",
        token: "qazwsxedc123456~!@#$%",
        getAccessToken: function() {
            return utils.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data)
            return utils.writeFileAsync(wechat_file, data)
        },
        getTicket: function() {
            return utils.readFileAsync(wechat_ticket_file)
        },
        saveTicket: function(data) {
            data = JSON.stringify(data)
            return utils.writeFileAsync(wechat_ticket_file, data)
        }

    }
}
exports.wechatOptions = config
exports.getWechat = function() {
var wechatApi = new Wechat(config.wechat)
return wechatApi
}