var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: String,
    img: String,
    link: String,
    type: String,
    time: String,
    summary: String,
    order: Number,
    year: String,
    month: String,
    note: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
