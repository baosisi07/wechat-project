"use strict"
var mongoose = require('mongoose')
var User = mongoose.model('User')

// signup
exports.showSignup = async(ctx, next) => {
  await ctx.render('pages/signup', {
    title: '注册页面'
  })
}

exports.showSignin = async(ctx, next) => {
  await  ctx.render('pages/signin', {
    title: '登录页面'
  })
}

exports.signup = async(ctx, next) => {
  var _user = ctx.request.body.user

  var user = await User.findOne({name: _user.name}).exec()

    if (user) {
      ctx.redirect('/signin')
      return next()
    }
    else {
      user = new User(_user)
      await user.save()
      ctx.session.user = user
        ctx.redirect('/')
    }
}

// signin
exports.signin = async(ctx, next) => {
  var _user = ctx.request.body.user
  var name = _user.name
  var password = _user.password

  var user = await User.findOne({name: name}).exec()

    if (!user) {
      ctx.redirect('/signup')
    }

    var isMatch = await user.comparePassword(password, user.password)

      if (isMatch) {
        ctx.session.user = user

        ctx.redirect('/')
      }
      else {
        ctx.redirect('/signin')
      }
}

// logout
exports.logout =  async(ctx, next) => {
  delete ctx.session.user
  //delete app.locals.user

  ctx.redirect('/')
}

// userlist page
exports.list = async(ctx, next) => {
  var users = await User.find({})
  .sort('meta.updateAt')
  .exec()
  await ctx.render('pages/userlist', {
    title: 'imooc 用户列表页',
    users: users
  })
}

// midware for user
exports.signinRequired = async(ctx, next) => {
  var user = ctx.session.user
  if (!user) {
    ctx.redirect('/signin')
  } else {
    await next()
  }
}

exports.adminRequired = async(ctx, next) => {
  var user = ctx.session.user
  if (user.role <= 10) {
    ctx.redirect('/signin')
  } else {
    await next()
  }
}