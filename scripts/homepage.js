

function sub_handle(){
    var content = document.getElementById("message").value;
    console.log("clicked");
    $.ajax('/add_mess', {
        type: 'POST',  // http method
        data: { message: content},  // data to submit
        success: function (data, status, xhr) {
            $('p').append('status: ' + status + ', data: ' + data);
            $.ajax('/potentialfriends', {
                type: 'GET',
                success: function (res, err){
                    console.log(res.friends)
                    $('#potentialfriends').append('<ol>')
                    res.friends.split(',').forEach(friend => 
                        $('#potentialfriends').append(`<li>${friend}</li>`)
                    );
                    $('#potentialfriends').append('</ol>')
                }
            })
        },
        error: function (jqXhr, textStatus, errorMessage) {
                $('p').append('Error' + errorMessage);
        }
    });        

}

function quote_handler(id){
        var author;
        var text;
        if(id == 1){
            author = document.getElementById("author1");
            text = document.getElementById("title1");
        }else if(id == 2){
            author = document.getElementById("author2");
            text = document.getElementById("title2");
        }else{
            author = document.getElementById("author3");
            text = document.getElementById("title3");
        }
        
        $.ajax('/insert_quote',{
            type: 'POST',
            data: {author: author.innerHTML, quote: text.innerHTML},
            success: function (data, status, xhr) {
                console.log("all good");
                
            },
            error: function (jqXhr, textStatus, errorMessage) {
                    $('p').append('Error' + errorMessage);
            }
        })
    }