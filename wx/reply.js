"use strict"
var Wechat = require("../wechat/wechat")
var path = require("path")
var wx = require("./index")
var Movie = require("../app/api/movie")
var wechatApi = wx.getWechat()
var host = "http://75705163.ngrok.io/"
exports.reply = async(ctx, next) => {
    var message = ctx.weixin
    if (message.MsgType === "event") {
        if (message.Event === "subscribe") {
            if (message.EventKey) {
                console.log("扫二维码进来：" + message.EventKey)
            }
            ctx.body = "亲爱的，终于等到你\n" +
                "回复1~3，回复文字消息\n" +
                "回复4~14，各种消息推送\n" +
                "回复首页，进入电影首页\n" +
                "回复登录，进入微信登录绑定\n" +
                "回复游戏，进入游戏页面\n" +
                "回复电影名字或语音， 查询电影信息\n" +
                "点击<a href='" + host + "wechat/movie'>语音查电影</a>"
        } else if (message.Event === "unsubscribe") {
            console.log("无情取关")
            ctx.body = ""
        } else if (message.Event === "CLICK") {
            ctx.body = "谢谢您的关注！"
        } else if (message.Event === "SCAN") {
            ctx.body = "您扫了一下哦！"
        } else if (message.Event === "VIEW") {
            ctx.body = "您点击了菜单中的链接：" + message.EventKey
        } else if (message.Event === "scancode_push") {
            ctx.body = "您点击了菜单中的：" + message.EventKey
            console.log("扫码推事件的事件推送:" + message.ScanCodeInfo.ScanType + " " + message.ScanCodeInfo.ScanResult)
        } else if (message.Event === "scancode_waitmsg") {
            ctx.body = "扫描结果：" + message.ScanCodeInfo.ScanResult
            console.log("扫码推事件“消息接收中”:" + message.ScanCodeInfo.ScanType + " " + message.ScanCodeInfo.ScanResult)
        } else if (message.Event === "pic_sysphoto") {
            ctx.body = "您点击了菜单中的：" + message.EventKey
            console.log("系统拍照发图的事件推送" + message.SendPicsInfo.Count + " " + message.SendPicsInfo.PicList)
        } else if (message.Event === "pic_photo_or_album") {
            ctx.body = "您点击了菜单中的：" + message.EventKey
            console.log("拍照或者相册发图的事件推送:" + message.SendPicsInfo.Count + " " + message.SendPicsInfo.PicList)
        } else if (message.Event === "pic_weixin") {
            ctx.body = "您点击了菜单中的：" + message.EventKey
            console.log("微信相册发图器的事件推送:" + message.SendPicsInfo.Count + " " + message.SendPicsInfo.PicList)
        } else if (message.Event === "location_select") {
            ctx.body = "您点击了菜单中的：" + message.EventKey
            console.log("地理位置选择器的事件推送" + message.SendLocationInfo.Label + " " + message.SendLocationInfo.Poiname)
        }
    } else if (message.MsgType === "voice") {
        var voiceText = message.Recognition.slice(0,-1)
        var movies = await Movie.searchByName(voiceText)
        if (!movies || movies.length === 0) {
            movies = await Movie.searchByDouban(voiceText)
        }
        if (movies && movies.length > 0) {
            reply = []
            movies = movies.slice(0, 8)
            movies.forEach(function(movie) {
                reply.push({
                    title: movie.title,
                    description: movie.title,
                    picUrl: movie.poster,
                    url: host + "wechat/movie/" + movie.id
                })
            })
        } else {
            reply = "没有查询到与" + voiceText + "匹配的电影，要不换个名字试试"
        }

        ctx.body = reply
    } else if (message.MsgType === "text") {
        var content = message.Content
        var reply = "额，你说的" + content + "太无聊了"
        if (content === "1") {
            reply = "天下第一吃大米"
        } else if (content === "2") {
            reply = "天下第二吃鸭子"
        } else if (content === "3") {
            reply = "天下第三吃仙丹"
        } else if (content === "4") {
            reply = [{
                title: '技术改变世界',
                description: "描述",
                picUrl: "http://img-cdn2.luoo.net/pics/vol/538deefcc55fc.jpg!/fwfh/640x452",
                url: "https://koa.bootcss.com/"
            }, {
                title: 'Nodejs开发微信',
                description: "爽歪歪",
                picUrl: "http://img-cdn2.luoo.net/pics/vol/53861086936a2.jpg!/fwfh/640x452",
                url: "https://mp.weixin.qq.com/"
            }]
        } else if (content === "5") {
            var data = await wechatApi.uploadFile("image", path.join(__dirname, "../file/img/11.png"))
            reply = {
                type: "image",
                mediaId: data.media_id
            }
        } else if (content === "6") {
            var data = await wechatApi.uploadFile("video", path.join(__dirname, "../file/video/me.mp4"))
            reply = {
                type: "video",
                title: "回复视频",
                description: "逗你玩，哈哈",
                mediaId: data.media_id
            }
        } else if (content === "7") {
            var data = await wechatApi.uploadFile("image", path.join(__dirname, "../file/img/22.png"))
            reply = {
                type: "music",
                title: "回复音乐",
                description: "放松一下吧",
                musicUrl: "http://mp3-cdn2.luoo.net/low/luoo/radio985/01.mp3",
                thumbMediaId: data.media_id

            }
        } else if (content === "8") {
            var data = await wechatApi.uploadFile("image", path.join(__dirname, "../file/img/11.png"), {
                type: "image"
            })
            reply = {
                type: "image",
                mediaId: data.media_id
            }
        } else if (content === "9") {
            var data = await wechatApi.uploadFile("video", path.join(__dirname, "../file/video/me.mp4"), {
                type: "video",
                description: '{"title":"nice video","introduction":"introduction"'
            })
            reply = {
                type: "video",
                title: "回复视频",
                description: "逗你玩，哈哈",
                mediaId: data.media_id
            }
        } else if (content === "10") {
            var picData = await wechatApi.uploadFile("image", path.join(__dirname, "../file/img/22.png"), {})
            var media = {
                articles: [{
                    title: "标题是啥",
                    thumb_media_id: picData.media_id,
                    author: "思思",
                    digest: "meiyou",
                    show_cover_pic: 1,
                    content: "想看啥内容，没有",
                    content_source_url: "https://github.com"
                }]
            }
            data = await wechatApi.uploadFile("news", media, {})
            data = await wechatApi.fetchFile(data.media_id, "news", {})
            console.log(data)
            var items = data.news_item
            var news = []
            items.forEach(function(item) {
                news.push({
                    title: item.title,
                    description: item.digest,
                    picUrl: picData.url,
                    url: item.url
                })
            })
            reply = news
        } else if (content === "11") {
            var counts = await wechatApi.countFile()
            var list = await wechatApi.listFile({
                type: "news",
                offset: 0,
                count: 10
            })
            console.log(JSON.stringify(list))
            reply = "1"
        } else if (content === "12") {
            var user = await wechatApi.fetchUsers(message.FromUserName, "en")
            var openIds = [
                {
                    openid: message.FromUserName,
                    lang: "en"
                }
            ]
            var users = await wechatApi.fetchUsers(openIds)
            reply = "操作成功，yeah!"
        } else if (content === "13") {
            var userList = await wechatApi.getUsersList()
            reply = "才" + userList.total + "人"
        } else if (content === "14") {
            var picData = await wechatApi.uploadFile("image", path.join(__dirname, "../file/img/22.png"), {})
            var media = {
                articles: [{
                    title: "标题是啥",
                    thumb_media_id: picData.media_id,
                    author: "思思",
                    digest: "meiyou",
                    show_cover_pic: 1,
                    content: "想看啥内容，没有",
                    content_source_url: "https://github.com"
                }]
            }
            data = await wechatApi.uploadFile("news", media, {})
            var mpnews = {
                media_id: data.media_id
            }
            var text = {
                content: "我还是我"
            }
            var msgData = await wechatApi.previewSend("mpnews", mpnews, message.FromUserName)
            //var msgData = await wechatApi.sendByGroup("mpnews", mpnews)
            //var msgData = await wechatApi.sendByGroup("text", text)
            console.log(msgData)
            reply = "yeah"
        } else {
            var movies = await Movie.searchByName(content)
            if (!movies || movies.length === 0) {
                movies = await Movie.searchByDouban(content)  
            }
            if (movies && movies.length > 0) {
                reply = []
                movies = movies.slice(0, 8)
                movies.forEach(function(movie) {
                    reply.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: host + "wechat/movie/" + movie.id
                    })
                })
            } else {
                reply = "没有查询到与" + content + "匹配的电影，要不换个名字试试"
            }

        }

        ctx.body = reply
    }
    await next
}