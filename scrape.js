var axios = require("axios");
var cheerio = require("cheerio");

axios.get("http://services.runescape.com/m=news/archive?oldschool=1").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function() {
        // Save an empty result object
        var result = {};
        var pic = $(this).find("img").attr("src");
        var title = $(this).find("h3 a").text();
        var link = $(this).find("h3 a").attr("href");
        var type = $(this).find("span").clone().children().remove().end().text();

        var time = $(this).find("time").text();

        result.pic=pic;
        result.title=title;
        result.link=link;
        console.log(span);

        console.log(time);
                
      });
    // var span = $("article span").text();
    // console.log(span);
    
    });