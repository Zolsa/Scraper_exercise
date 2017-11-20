var express = require('express');
var cheerio = require("cheerio");
var request = require("request");
var mongoose = require("mongoose");
var sentiment = require('sentiment');
var db = require("../models");

var router = express.Router();

//var MONGODB_URI = process.env."mongodb://heroku_0jnvsk8d:6mfl9e1qmk2dgakdqlh3jljhr2@ds111336.mlab.com:11336/heroku_0jnvsk8d" || "mongodb://localhost/mongoHeadlines";

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI,
{
	useMongoClient: true
});

router.get("/", function(req, res)
{

	db.Article.find({}).sort("-_id").populate("comment").then(function(articles)
	{
		if(articles.length !== 0)
		{
			for (var i=0; i<articles.length; i++)
			{
				for (var j=0; j<articles[i].comment.length; j++)
				{
					articles[i].comment[j].sentiment = sentiment(articles[i].comment[j].message).comparative.toFixed(2)
				}
			}

			var data = 
			{
				article: articles,
			}

			res.render("index", data);
		}

		else
		{
			res.render("index");
		}
		
	}).catch(function(err)
	{
		res.json(err)
	})
})

router.get("/scrape", function(req, res)
{
	var newArticles = 0;

	request("https://www.npr.org/", function(err, request, html)
	{
		if(err){throw err}

		var $ = cheerio.load(html)
		var articleArray = []

		var newPotentialArticles = ""+$("article.has-image").length

		$("article.has-image").each(function(i, element)
		{
			var title = $(element).find("div").find("h1").text()
			var info = $(element).find("p.teaser").text()
			var img = $(element).find("img").attr("src")
			var link = $(element).find("div.imagewrap").find("a").attr("href")
			
			var article = 
			{
				title: title,
				info: info,
				img: img,
				link: link
			}

			articleArray.push(article)
		});

		console.log(articleArray.length)

		//There are some subtleties with mongoose's "required" field in the schema which is letting documents with "undefined" fields that are required to be accepted.  
		//This tries and accounts for that.
		for (var i=0; i<articleArray.length; i++)
		{
			if (articleArray[i].title === undefined || articleArray[i].info === undefined || articleArray[i].img === undefined || articleArray[i].link === undefined)
			{
				console.log("Deleting article: "+articleArray[i].title)
				articleArray.splice(i,1);
				newPotentialArticles = newPotentialArticles - 1;
			}
		}

		console.log(articleArray.length)

		db.Article.collection.insert(articleArray).then(function(result)
		{
			console.log("added articles: ")
			console.log(result.ops.length)
			var data = 
			{
				error: 0,
				newPotentialArticles: newPotentialArticles
			}

			res.send(data)

		}).catch(function(err)
		{
			var data = 
			{
				error: err,
				newPotentialArticles: newPotentialArticles
			}

			res.send(data)
		})
	})
})

router.post("/addcomment", function(req, res)
{
	var comment = 
	{
		message: req.body.message,
		article: req.body.id
	}

	db.Comment.create(comment).then(function(dbComment)
	{
		db.Article.findOneAndUpdate({"_id": req.body.id}, {$push:{"comment": dbComment._id}}, function(err, done)
		{
			if(err){throw err}
			res.send(done)
		})
	})
})

router.delete("/deletecomment/:id", function(req, res)
{
	var id = req.params.id

	db.Comment.find({"_id": id}, function(err, found)
	{
		if(err){throw err}
		var articleid = found[0].article

		db.Article.findOne({"_id": articleid}, function(err, found2)
		{	
			if(err){throw err}
			var comments = found2.comment
			for (var i=0; i<comments.length; i++)
			{
				if (id == comments[i])
				{
					comments.splice(i, 1);
					break;
				}
			}

			db.Article.findOneAndUpdate({"_id": articleid}, {$set:{"comment": comments}}, function(err, done)
			{
				if(err){throw err}
				res.send(done)
			})
		})
	})
})

module.exports = router;