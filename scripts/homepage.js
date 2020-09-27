

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
                            <button>Add Friend</button>
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