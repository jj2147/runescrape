


var today = new Date();
var month = dateFns.getMonth(today) + 1;
var year = dateFns.getYear(today);
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var selectedYear;
var selectedMonth;

for(let y = 2013; y <= year; y++){
    $("#year-div").append(`<a class="news-archive__filter" tabindex="0" data-year=${y}>${y}</a>`);

    // Without tabindex, Bootstrap turns text black on hover, a:not([href]):not([tabindex]):hover {color: inherit;}
}

for(let m = 0; m < months.length; m++){
    $("#month-div").append(`<a class="news-archive__filter" tabindex="0" data-month=${m+1}>${months[m]}</a>`);
}

function select(element){
    element.siblings().removeClass("news-archive__filter--active");
    element.addClass("news-archive__filter--active");
    element.attr("data-year") ? selectedYear = element.attr("data-year") : selectedMonth = element.attr("data-month");
}

select($(`a[data-year=${year}]`));
select($(`a[data-month=${month}]`));

  

$(".news-archive__filter").on("click", function(){
    select($(this));
    $(".news-articles").empty();

    $.ajax({
        method: "GET",
        url: "/check/" + selectedYear + '/' + selectedMonth
    }).then(function(data){
        if(data.length === 0){
            $(".news-articles").append("<h3 class='news-article__title'>No articles found<h3>");
        }else{
            printArticles(data);
        }
    });

});

function printArticles(data){
    data.forEach(e => {
        $(".news-articles").append(
            `<article class="news-article"> 
                <figure class="news-article__figure">
                    <a href=${e.link}><img class="news-article__figure-img" src=${e.img}></a>
                </figure>
                <div class="news-article__details">
                    <h3 class="news-article__title">
                        <a href=${e.link}>${e.title}</a>
                    </h3>
                    <span class="news-article__sub">${e.type}<time class="news-article__time">${e.time}</time></span>
                    <p class="news-article__summary">${e.summary}<a href=${e.link}>Read More...</a></p>
                </div>
                <a class="news-article__summary" role="button" data-toggle="collapse" href="#collapse${e.order}">comment</a>
                <div class="collapse" id="collapse${e.order}">
                    <form id="form${e.order}">
                        <input id="comment${e.order}" type="text">
                        <button type="submit">Submit</button>
                    </form>
                </div>

            </article>`
        );
    });
}


$("form").submit(function(){
    $.ajax({
        method: "POST",
        url: "/articles/" + selectedYear + '/' + selectedMonth
    }).then(function(data){
        if(data.length === 0){
            $(".news-articles").append("<h3 class='news-article__title'>No articles found<h3>");
        }else{
            printArticles(data);
        }
    });

});

