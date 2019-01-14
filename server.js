const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");

var app = express();

const PORT = 3000;

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


//check if the page has already been scraped and saved
app.get("/check/:year/:month", function(req, res){
    db.Article.findOne({year: req.params.year, month: req.params.month}).then(function(found){        
        found ? res.redirect("/articles/" + req.params.year + '/' + req.params.month) :
            res.redirect("/scrape/" + req.params.year + '/' + req.params.month);        
    });
});


// to do: scrape the 2nd page if "next" button exists
app.get("/scrape/:year/:month", function(req, res) {
    axios.get(`http://services.runescape.com/m=news/archive?oldschool=1&year=${req.params.year}&month=${req.params.month}`)
    .then(function(response) {

        var $ = cheerio.load(response.data);

        var results = [];

        $("article").each(function(i, e) {
            var result = {}
            result.title = $(this).find("h3 a").text();
            result.img = $(this).find("img").attr("src");
            result.link = $(this).find("h3 a").attr("href");
            result.type = $(this).find("span").clone().children().remove().end().text();
            result.time = $(this).find("time").text();
            result.summary = $(this).find("p").clone().children().remove().end().text();
            result.order = i;
            result.year = req.params.year;
            result.month = req.params.month;
            results.push(result);
        });

        db.Article.create(results).then(function(articles){
            console.log("created articles!!!!!!!");
            res.json(articles);
        });

    });

});


//get a page that has already been scraped
app.get("/articles/:year/:month", function(req, res) {
    db.Article.find({year: req.params.year, month: req.params.month}).sort({"order":1})
    .populate("note")
    .then(function(articles){
        res.json(articles);
    });
});


//add note to article
app.post("/articles/:id", function(req, res){    
    db.Note.create(req.body)
    .then(function(dbNote) {
        res.json(dbNote);
        return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push:{ note: dbNote._id }}, { new: true });
    })
});


//delete note
app.delete("/notes/:id", function(req, res){
    db.Note.deleteOne({_id: req.params.id})
    .then(function(){
        console.log("deleted");
    });

});


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
