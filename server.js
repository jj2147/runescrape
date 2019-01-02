const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const exphbs = require("express-handlebars");
var app = express();
const db = require("./models");
const PORT = 3000;

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/check/:year/:month", function(req, res){
    db.Article.findOne({year: req.params.year, month: req.params.month}).then(function(found){        
        found ? res.redirect("/articles/" + req.params.year + '/' + req.params.month) :
            res.redirect("/scrape/" + req.params.year + '/' + req.params.month);        
    });
});

app.get("/scrape/:year/:month", function(req, res) {

    axios.get(`http://services.runescape.com/m=news/archive?oldschool=1&year=${req.params.year}&month=${req.params.month}`).then(function(response) {

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

        db.Article.create(results).then(function(){
            console.log("created article!!!!!!!");
            console.log(results);
            
            res.json(results);
        });
        
    });
});

app.get("/articles/:year/:month", function(req, res) {
    db.Article.find({year: req.params.year, month: req.params.month}).sort({"order":1})
        .then(function(data){
            res.json(data);
    });
});

app.post("/articles/:id", function(req, res){
    console.log("reqqqqq");
    
    console.log(req.body);
    
    db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
