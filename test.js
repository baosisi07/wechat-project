"use strict"
var Koa = require("koa")
var app = new Koa()
var ss = function(opt, handler) {
    async(ctx) => {
        ctx.body = '<h1>ddd' + opt.a + '</h1>';
        handler();
        console.log(ctx.weixin)
    }
}
app.use(async (ctx, next) => {
    ctx.body = '<h1>Hello World!</h1>';
    ctx.weixin = "woshiweixin";
    ss({
        a: 1
    }, function() {
        console.log("2")
    })
})

app.listen(1111)
console.log('listening:1111')