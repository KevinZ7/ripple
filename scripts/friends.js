$(document).ready(function(){

    // $('#recipeModal').modal({show:true});
    $('.friend-list-box').on('click','div.realFriend',function(){
        // $('#recipeModal').modal({show:true});
        var friendname = $(this).attr("data-userid")

        $.get('/getMessage?friendname='+friendname,function(data){
            $('.chat-box').empty
            console.log(data.messageData)
            data.messageData.forEach(element => {
                if(element.owner == false){
                    $('.chat-box').append('<div class="row justify-content-start mb-4 mt-1" style="border-style: solid; border-color: rgb(175, 224, 175); border-width:2px;border-radius: 7px;"><div class="col-2 name"><div style="font-weight:bold;">'+friendname+'</div><div style="font-size:x-small;">'+element.time+'</div></div><div class="col-6 msg">'+element.content+'</div></div>')
                }
                else{
                    $('.chat-box').append('<div class="row justify-content-end mb-4" style="border-style: solid; border-color: rgb(175, 224, 175); border-width:2px;border-radius: 7px;"><div class="col-6 msg text-right">'+element.content+'</div><div class="col-2 name text-right"><div class="text-right" style="font-weight:bold;">You</div><div style="font-size:x-small;">'+element.time+'</div></div></div>')
                }

            })
            $('.send-message-button').attr('data-userid',friendname)
            $('#recipeModal').modal({show:true});
        })
        // console.log(friendid);

    })

    $('.friend-list-box').on('click','div.acceptFriend',function(){
        $.post('/acceptFriend',{
            friendname: $(this).attr('data-userid')
        },function(){
            console.log('finished')
            location.reload()
        })
    })

    $('.friend-list-box').on('click','div.declineFriend',function(){
        console.log("clicked!")
        $.post('/declineFriend',{
            friendname: $(this).attr('data-userid')
        },function(){
            console.log('finished')
            location.reload()
        })
    })

    $('.close').on('click',function(){
        location.reload()
    })

    $('.send-message-button').on('click',sendMessage)
})

function sendMessage(){
    var username = $(this).attr('data-userid')
    var content = $('.send-message-content').val()
    $.post('/sendMessage',{
        friendUsername: username,
        message: content
    }, function(){
        $.get('/getMessage?friendname='+username,function(data){
            $('.chat-box').empty()
            console.log(data.messageData)
            data.messageData.forEach(element => {
                if(element.owner == false){
                    $('.chat-box').append('<div class="row justify-content-start mb-4 mt-1" style="border-style: solid; border-color: rgb(175, 224, 175); border-width:2px;border-radius: 7px;"><div class="col-2 name"><div style="font-weight:bold;">'+username+'</div><div style="font-size:x-small;">'+element.time+'</div></div><div class="col-6 msg">'+element.content+'</div></div>')
                }
                else{
                    $('.chat-box').append('<div class="row justify-content-end mb-4" style="border-style: solid; border-color: rgb(175, 224, 175); border-width:2px;border-radius: 7px;"><div class="col-6 msg text-right">'+element.content+'</div><div class="col-2 name text-right"><div class="text-right" style="font-weight:bold;">You</div><div style="font-size:x-small;">'+element.time+'</div></div></div>')
                }

            })
            $('.send-message-button').attr('data-userid',username)
        })
    })
}