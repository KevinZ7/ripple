$(document).ready(function(){
    $('#friendslist').on('click','button.sendFriendRequest',function(){
        var friendname = $(this).attr('data-userid')
        console.log(friendname)
        $.post('/sendFriendRequest',{
            friendname:friendname
        },function(){
            
        })
    })
})

function sub_handle(){
    var content = document.getElementById("message").value;
    $('#load_spinner').css('display', 'inline-block');
    $.ajax('/add_mess', {
        type: 'POST',  // http method
        data: { message: content},  // data to submit
        success: function (data, status, xhr) {
            $('p').append('status: ' + status + ', data: ' + data);
            $.ajax('/potentialfriends', {
                type: 'GET',
                success: function (res, err){
                    console.log(res.friends)
                    res.friends.forEach((friend, i) => 
                        $('#friendslist').append(`
                        <li>
                            <h2>${i + 1}</h2>
                            <h3>${friend.userid}</h3>
                            <p>
                            ${friend.content}
                            </p>
                            <button class="sendFriendRequest" data-userid = ${friend.userid}>Add Friend</button>
                        </li>`)
                    );
                    $('#potentialfriends').css('display', 'block');
                    $('#load_spinner').css('display', 'none');
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