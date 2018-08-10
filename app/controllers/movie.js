"use strict"
var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var Comment = mongoose.model('Comment')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

// detail page
exports.detail = async(ctx, next) => {
  var id = ctx.params.id

  await Movie.update({_id: id}, {$inc: {pv: 1}}).exec()
  var movie = await Movie.findOne({_id: id}).exec()
  var comments = await Comment
  .find({movie: id})
  .populate('from', 'name')
  .populate('reply.from reply.to', 'name')
  .exec()

  await ctx.render('pages/detail', {
    title: 'imooc 详情页',
    movie: movie,
    comments: comments
  })
}

// admin new page
exports.new = async(ctx, next) => {
  var categories = await Category.find({}).exec()
  await ctx.render('pages/admin', {
    title: 'imooc 后台录入页',
    categories: categories,
    movie: {}
  })
}

// admin update page
exports.update = async(ctx, next) => {
  var id = ctx.params.id

  if (id) {
    var movie = await Movie.findOne({_id: id}).exec()
    var categories = await Category.findOne({_id: id}).exec()
    await ctx.render('pages/admin', {
      title: 'imooc 后台更新页',
      movie: movie,
      categories: categories
    })
  }
}

// admin poster
// exports.savePoster = async(ctx, next) => {
//   var posterData = req.files.uploadPoster
//   var filePath = posterData.path
//   var originalFilename = posterData.originalFilename

//   if (originalFilename) {
//     fs.readFile(filePath, function(err, data) {
//       var timestamp = Date.now()
//       var type = posterData.type.split('/')[1]
//       var poster = timestamp + '.' + type
//       var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)

//       fs.writeFile(newPath, data, function(err) {
//         req.poster = poster
//         next()
//       })
//     })
//   }
//   else {
//     next()
//   }
// }

// admin post movie
exports.save = async(ctx, next) => {
  var id = ctx.request.body.movie._id
  var movieObj = ctx.request.body.movie
  var _movie

  if (ctx.poster) {
    movieObj.poster = req.poster
  }

  if (id) {
    var movie = await Movie.findOne({_id:id}).exec()

      _movie = _.extend(movie, movieObj)
      await _movie.save()
      ctx.redirect('/movie/' + movie._id)
  }
  else {
    _movie = new Movie(movieObj)

    var categoryId = movieObj.category
    var categoryName = movieObj.categoryName

    await _movie.save()
      if (categoryId) {
        var category = await Category.findOne({_id: categoryId}).exec()
        category.movies.push(movie._id)
        await category.save()
        ctx.redirect('/movie/' + movie._id)
      }
      else if (categoryName) {
        var category = new Category({
          name: categoryName,
          movies: [movie._id]
        })
        await category.save()
        movie.category = category._id
        movie.save()
        ctx.redirect('/movie/' + movie._id)
      }
  }
}

// list page
exports.list = async(ctx, next) => {
  var movies = await Movie.find({})
    .populate('category', 'name')
    .exec()

    await ctx.render('pages/list', {
      title: 'imooc 列表页',
      movies: movies
    })
}

// list page
exports.del = async(ctx, next) => {
  var id = ctx.query.id

  if (id) {
    try {
      await Movie.remove({_id: id}).exec()
      ctx.body = {success: 1}
    } catch (err) {
      ctx.body = {success: 0}
    }
  }
}