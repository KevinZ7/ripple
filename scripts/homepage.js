

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