var express = require("express");
var mongojs = require("mongojs");
var logger = require("morgan");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();
var db = require("./models");
var PORT = 3000;


app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("http://services.runescape.com/m=news/archive?oldschool=1").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("article h3").each(function(i, element) {
        // Save an empty result object
        var result = {};
          
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
