

var today = new Date();
var month = dateFns.getMonth(today) + 1;
var year = dateFns.getYear(today);
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var selectedYear;
var selectedMonth;

for(let y = 2013; y <= year; y++){
    $("#year-div").append(`<a class="news-archive__filter" data-year=${y}>${y}</a>`);
}

for(let m = 0; m < months.length; m++){
    $("#month-div").append(`<a class="news-archive__filter" data-month=${m+1}>${months[m]}</a>`);
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
            `<article class="news-article" article-id=${e._id}> 
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

                <a class="expand" news-article__summary">comment</a>
                <div class="collapse" article-id=${e._id}>
                    <input id="comment-input" type="text">
                    <button class="comment-submit">Submit</button>
                </div>

            </article>`
        );

        if(e.note.length != 0){
            e.note.forEach(n => {
                $(`.collapse[article-id=${e._id}]`)
                .prepend(`<p class="comment"><a class="delete-comment">X</a>${n.body}</p>`);
            });
        }
    });
}


// function getNotes(articleID){
//     $.ajax({
//         method: "GET",
//         url: "/articles/" + articleID,
//     }).then(function(data){
//         console.log("noteeeeeeeeeeeee");
        
//         console.log(data.note);
        
//     });

// }

$(function(){

    $(document).on("click", ".delete-comment", function(){
        
        $(this).parent().remove();
    });

    $(document).on("click", "a.expand", function(){
        $(this).next().slideToggle("fast");
    });


    $(document).on("click", ".comment-submit", function(){
        let comment = $("#comment-input").val();
        let articleID = $(this).parent().attr("article-id");
        $.ajax({
            method: "POST",
            url: "/articles/" + articleID,
            data: {
                body:comment
            }
        }).then(function(data){
            
        });
        
    });

});

