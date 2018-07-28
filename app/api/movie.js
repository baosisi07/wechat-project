var mongoose = require('mongoose')
var Promise = require('bluebird')
var _ = require('lodash')
var co = require('co')
var Movie = require('../models/movie')
var Category = require('../models/category')
var koa_request = require("koa2-request")
var request = Promise.promisify(require('request'))
// index page
exports.findAll = async() => {
    var categories = await Category
        .find({})
        .populate({
            path: 'movies',
            select: 'title poster',
            options: {
                limit: 6
            }
        })
        .exec()

    return categories
}

// search page
exports.searchByCategory = async (catId) => {
    var categories = await Category
        .find({
            _id: catId
        })
        .populate({
            path: 'movies',
            select: 'title poster',
            options: {
                limit: 6
            }
        })
        .exec()

    return categories
}
exports.searchByName = async (q) => {
    var movies = await Movie
        .find({
            title: new RegExp(q + '.*', 'i')
        })
        .exec()

    return movies
}
exports.searchById = async (id) => {
    var movie = await Movie
        .findOne({
            _id: id
        })
        .exec()

    return movie
}
function updateMovies(movie) {
    var options = {
        url: "https://api.douban.com/v2/movie/subject/" + movie.doubanId,
        json: true
    }
    request(options).then(function(res) {
        var data = res[1]
        _.extend(movie, {
            country: data.countries[0],
            language: data.language,
            summary: data.summary
        })
        var genres = movie.genres
        if (genres && genres.length > 0) {
            var cateArray = []
            genres.forEach(function(genre) {
                cateArray.push(async() => {
                    var cat = await Category.findOne({
                        name: genre
                    }).exec()
                    if (cat) {
                        cat.movies.push(movie._id)
                        await cat.save()
                    } else {
                        cat = new Category({
                            name: genre,
                            movies: [movie._id]
                        })
                        cat = await cat.save()
                        movie.category = cat._id
                        await movie.save()
                    }
                })
            })
            co(async() => {
                await cateArray
            })
        } else {
            movie.save()
        }
    })
}

exports.searchByDouban = async (q) => {
    var options = {
        url: "https://api.douban.com/v2/movie/search?q="
    }
    options.url += encodeURIComponent(q)
    var response = await koa_request(options)
    var data = JSON.parse(response.body)
    var subjects = []
    var movies = []

    if (data && data.subjects) {
        subjects = data.subjects
    }
    if (subjects.length > 0) {

        var queryArray = []
        subjects.forEach(function(item) {
            queryArray.push(async(item) => {
                console.log(item.id)
                var movie = await Movie.findOne({
                    doubanId: item.id
                }).exec()
                console.log(movie)
                if (movie) {
                    movies.push(movie)
                } else {
                    var directors = item.directors || []
                    var director = directors[0] || {}
                    movie = new Movie({
                        director: director.name || "",
                        title: item.title,
                        doubanId: item.id,
                        poster: item.images.large,
                        year: item.year,
                        genres: item.genres || []
                    })
                    movie = await movie.save()
                    movies.push(movie)

                }

            })
        })

        await queryArray
        movies.forEach(function(movie) {
            updateMovies(movie)
        })
    }
    return movies

}
