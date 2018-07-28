"use strict"

var Promise = require("bluebird")
var request = Promise.promisify(require("request"))
var utils = require("../libs/utils")
var fs = require("fs")
var _ = require("lodash")
var prefix = "https://api.weixin.qq.com/cgi-bin/"

var api = {
    getTicket: "https://api.weixin.qq.com/cgi-bin/ticket/getticket?",
    access_token: prefix + "token?grant_type=client_credential&",
    temporay: {
        upload: prefix + "media/upload?",
        fetch: prefix + "media/get?"
    },
    permanent: {
        uploadNews: prefix + "material/add_news?",
        upload: prefix + "material/add_material?",
        uploadImg: prefix + "media/uploadimg?",
        fetch: prefix + "material/get_material?",
        del: prefix + "material/del_material?",
        update: prefix + "material/update_news?",
        count: prefix + "material/get_materialcount?",
        list: prefix + "material/batchget_material?"
    },
    user: {
        fetch: prefix + "user/info?",
        batchFetch: prefix + "user/info/batchget?",
        getUserList: prefix + "user/get?"
    },
    mass: {
        sendByGroup: prefix + "message/mass/sendall?",
        sendByOpenid: prefix + "message/mass/send?",
        delete: prefix + "message/mass/delete?",
        preview: prefix + "message/mass/preview?"
    },
    menu: {
        create: prefix + "menu/create?",
        getMenu: prefix + "menu/get?",
        delete: prefix + "menu/delete?",
        custom: prefix + "menu/addconditional?"
    }
}

function Wechat(options) {
    var that = this
    this.appID = options.appID
    this.appSecret = options.appSecret
    this.getAccessToken = options.getAccessToken
    this.saveAccessToken = options.saveAccessToken
    this.getTicket = options.getTicket
    this.saveTicket = options.saveTicket
    this.fetchAccessToken()

}

Wechat.prototype.isValidAccessToken = function(data) {
if (!data || !data.access_token || !data.expires_in) {
    return false
}

var access_token = data.access_token
var expires_in = data.expires_in
var now = (new Date().getTime())

if (now < expires_in) {
    return true
} else {
    return false
}
}
Wechat.prototype.fetchAccessToken = function(data) {
var that = this
return this.getAccessToken().then(function(data) {
    try {
        data = JSON.parse(data)
    } catch ( e ) {
        return that.updateAccessToken(data)
    }
    if (that.isValidAccessToken(data)) {
        return Promise.resolve(data)
    } else {
        return that.updateAccessToken(data)
    }
}).then(function(data) {
    that.saveAccessToken(data)
    return Promise.resolve(data)
})
}
Wechat.prototype.isValidTicket = function(data) {
if (!data || !data.ticket || !data.expires_in) {
    return false
}

var ticket = data.ticket
var expires_in = data.expires_in
var now = (new Date().getTime())

if (ticket && now < expires_in) {
    return true
} else {
    return false
}
}
Wechat.prototype.fetchTicket = function(access_token) {
var that = this
return this.getTicket().then(function(data) {
    try {
        data = JSON.parse(data)
    } catch ( e ) {
        return that.updateTicket(access_token)
    }
    if (that.isValidTicket(data)) {
        return Promise.resolve(data)
    } else {
        return that.updateTicket(access_token)
    }
}).then(function(data) {

    that.saveTicket(data)
    return Promise.resolve(data)
})
}
Wechat.prototype.updateAccessToken = function() {
var url = api.access_token + "appid=" + this.appID + "&secret=" + this.appSecret
return new Promise(function(resolve, reject) {
    request({
        url: url,
        json: true
    }).then(function(response) {
        var data = response.body
        var now = (new Date().getTime())
        var expires_in = now + (data.expires_in - 20) * 1000
        data.expires_in = expires_in
        return resolve(data)
    })
})
}
Wechat.prototype.updateTicket = function(access_token) {
var url = api.getTicket + "access_token=" + access_token + "&type=jsapi"
return new Promise(function(resolve, reject) {
    request({
        url: url,
        json: true
    }).then(function(response) {
        var data = response.body
        var now = (new Date().getTime())
        var expires_in = now + (data.expires_in - 20) * 1000
        data.expires_in = expires_in
        return resolve(data)
    })
})
}
Wechat.prototype.uploadFile = function(type, material, permanent) {
var that = this
var form = {}
var uploadUrl = api.temporay.upload
if (permanent) {
    uploadUrl = api.permanent.upload
    _.extend(form, permanent)
}

if (type === "pic") {
    uploadUrl = api.permanent.uploadimg
}
if (type === "news") {
    uploadUrl = api.permanent.uploadNews
    form = material
} else {
    form.media = fs.createReadStream(material)
}

return new Promise(function(resolve, reject) {

    that.fetchAccessToken()
        .then(function(data) {
            var url = uploadUrl + "access_token=" + data.access_token
            if (!permanent) {
                url += "&type=" + type
            } else {
                form.access_token = data.access_token
            }
            var options = {
                method: "POST",
                url: url,
                json: true
            }
            if (type === "news") {
                options.body = form
            } else {
                options.formData = form
            }
            request(options).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("upload file failed")
                }

            })
                .catch(function(err) {
                    reject(err)
                })
        })

})
}
Wechat.prototype.fetchFile = function(mediaId, type, permanent) {
var that = this
var fetchUrl = api.temporay.fetch
if (permanent) {
    fetchUrl = api.permanent.fetch
}
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = fetchUrl + "access_token=" + data.access_token
            var form = {}
            var options = {
                method: "POST",
                url: url,
                json: true
            }
            if (permanent) {
                form.access_token = data.access_token
                form.media_id = mediaId
                options.body = form
            } else {
                if (type === "video") {
                    url = url.replace("https://", "http://")
                }
                url += "&media_id=" + mediaId
            }
            if (type == "news" || type === "video") {
                request(options).then(function(response) {
                    var _data = response.body
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error("upload file failed")
                    }
                }).catch(function(err) {
                    reject(err)
                })
            } else {
                resolve(url)
            }
        })

})
}
Wechat.prototype.delFile = function(mediaId) {
var that = this
var form = {
    media_id: mediaId
}
var delUrl = api.permanent.del
return new Promise(function(resolve, reject) {

    that.fetchAccessToken()
        .then(function(data) {
            var url = delUrl + "access_token=" + data.access_token + "&media_id=" + mediaId
            request({
                method: "POST",
                url: url,
                body: form,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("del file failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })

})
}
Wechat.prototype.updateFile = function(mediaId, news) {
var that = this
var form = {
    media_id: mediaId
}
_.extend(form, news)
var updateUrl = api.permanent.update
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = updateUrl + "access_token=" + data.access_token + "&media_id=" + mediaId
            request({
                method: "POST",
                url: url,
                body: form,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("update file failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })

})
}
Wechat.prototype.countFile = function() {
var that = this
var countUrl = api.permanent.count
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = countUrl + "access_token=" + data.access_token
            request({
                method: "GET",
                url: url,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("count file failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })

})
}
Wechat.prototype.listFile = function(options) {
var that = this
options.type = options.type || "image"
options.offset = options.offset || 0
options.count = options.count || 1
var listUrl = api.permanent.list
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = listUrl + "access_token=" + data.access_token
            request({
                method: "POST",
                url: url,
                body: options,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("count file failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })

})
}
Wechat.prototype.fetchUsers = function(openIds, lang) {
var that = this
var lang = lang || "zh_CN"
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var options = {
                json: true
            }
            if (_.isArray(openIds)) {
                options.method = "POST"
                options.url = api.user.batchFetch + "access_token=" + data.access_token
                options.body = {
                    user_list: openIds
                }
            } else {
                options.url = api.user.fetch + "access_token=" + data.access_token + "&openid=" + openIds + "&lang=" + lang
            }

            request(options).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("fetchUsers failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })

})
}
Wechat.prototype.getUsersList = function(openId) {
var that = this
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.user.getUserList + "access_token=" + data.access_token
            if (openId) {
                url += "&next_openid=" + openId
            }
            request({
                url: url,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("fetchUsersList failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })

})
}
Wechat.prototype.sendByGroup = function(type, message, groupId) {
var that = this
var msg = {
    filter: {},
    msgtype: type
}
msg[type] = message
if (!groupId) {
    msg.filter.is_to_all = true
} else {
    msg.filter.is_to_all = false
    msg.filter.tag_id = groupId
}
if (type = "mpnews") {
    msg.send_ignore_reprint = 0
}
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.mass.sendByGroup + "access_token=" + data.access_token

            request({
                method: "POST",
                url: url,
                body: msg,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("send msg failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })

})
}
Wechat.prototype.sendByOpenid = function(type, message, openId) {
var that = this
var msg = {
    touser: openId,
    msgtype: type
}
msg[type] = message
if (type = "mpnews") {
    msg.send_ignore_reprint = 0
}
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.mass.sendByOpenid + "access_token=" + data.access_token
            request({
                method: "POST",
                url: url,
                body: msg,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("send msg failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })
})
}
Wechat.prototype.deleteSend = function(msgId) {
var that = this
var msg = {
    msg_id: msgId
}
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.mass.delete + "access_token=" + data.access_token
            request({
                method: "POST",
                url: url,
                body: msg,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("delete msg failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })
})
}
Wechat.prototype.previewSend = function(type, message, openId) {
var that = this
var msg = {
    touser: openId,
    msgtype: type
}
msg[type] = message

return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.mass.preview + "access_token=" + data.access_token
            request({
                method: "POST",
                url: url,
                body: msg,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("preview msg failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })
})
}
Wechat.prototype.createMenu = function(menu) {
var that = this
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.menu.create + "access_token=" + data.access_token
            request({
                method: "POST",
                url: url,
                body: menu,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("create menu failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })
})
}
Wechat.prototype.getMenu = function() {
var that = this
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.menu.getMenu + "access_token=" + data.access_token
            request({
                url: url,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("get menu failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })
})
}
Wechat.prototype.deleteMenu = function() {
var that = this
return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
        .then(function(data) {
            var url = api.menu.delete + "access_token=" + data.access_token
            request({
                url: url,
                json: true
            }).then(function(response) {
                var _data = response.body
                if (_data) {
                    resolve(_data)
                } else {
                    throw new Error("delete menu failed")
                }
            }).catch(function(err) {
                reject(err)
            })
        })
})
}

Wechat.prototype.reply = async(ctx) => {
    var content = ctx.body
    var message = ctx.weixin
    var xml = utils.tpl(content, message)
    ctx.status = 200
    ctx.type = "application/xml"
    ctx.body = xml


}
module.exports = Wechat