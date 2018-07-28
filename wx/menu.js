"use strict"
module.exports = {
    "button": [
        {
            "type": "click",
            "name": "我的主页",
            "key": "V1001_TODAY_MUSIC",
            "sub_button": [{
                "name": "发送位置",
                "type": "location_select",
                "key": "rselfmenu_2_0"
            },
                {
                    "type": "view",
                    "name": "我的页面",
                    "url": "http://39.105.58.20/"
                },
                {
                    "type": "click",
                    "name": "赞一下我",
                    "key": "support"
                }]
        },
        {
            "name": "扫码",
            "sub_button": [
                {
                    "type": "scancode_waitmsg",
                    "name": "扫码带提示",
                    "key": "qr_scan_tip"
                },
                {
                    "type": "scancode_push",
                    "name": "扫码推事件",
                    "key": "qr_scan_handle"
                }
            ]
        },
        {
            "name": "发图",
            "sub_button": [
                {
                    "type": "pic_sysphoto",
                    "name": "系统拍照发图",
                    "key": "pic_sysphoto"
                },
                {
                    "type": "pic_photo_or_album",
                    "name": "拍照或者相册发图",
                    "key": "pic_photo_or_album"
                },
                {
                    "type": "pic_weixin",
                    "name": "微信相册发图",
                    "key": "pic_weixin"
                },
                {
                    "type": "media_id",
                    "name": "下发图片",
                    "media_id": "iXcIzPk3h7nGQfeffQYsIE8BFpeyGu8Ud0K75T7WCiA"
                },
                {
                    "type": "view_limited",
                    "name": "下发图文消息",
                    "media_id": "iXcIzPk3h7nGQfeffQYsIPjekiG9oezdCbcscwjSG00"
                }
            ]
        }

    ]
}