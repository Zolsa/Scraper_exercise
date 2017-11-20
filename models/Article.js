var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema(
{
	title:
	{
		type: String,
		required: "Title is required",
		unique: true
	},

	info:
	{
		type: String,
		required: "Info is required"
	},

	img:
	{
		type: String,
		required: "Img is required"
	},

	link:
	{
		type: String,
		required: "Link is required"
	},

	date:
	{
		type: Date,
		default: Date.now,
		required: true
	},

	comment:
	[{
		type: Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;