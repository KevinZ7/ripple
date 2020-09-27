

function sub_handle(){
    var content = document.getElementById("message").value;
    console.log("clicked");
    $.ajax('/add_mess', {
        type: 'POST',  // http method
        data: { message: content},  // data to submit
        success: function (data, status, xhr) {
            $('p').append('status: ' + status + ', data: ' + data);
            
        },
        error: function (jqXhr, textStatus, errorMessage) {
                $('p').append('Error' + errorMessage);
        }
    });        

}