const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const {Pool} = require('pg');
const session = require('express-session');

var pool = new Pool({
  connectionString :  'postgres://kev2kev123:root@localhost/postgres'
})

var app = express();
var http = require('http').createServer(app);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'secret',
  saveUninitialized: false,
  resave: false
}))

//section for all get post routes
app.get('/',(req,res) =>  {
  res.render('pages/home',{data:"hi"})
})

//post to either login as the user or get the users user name and store it as session
app.post('/login',(req,res) => {
  const {username} = req.body;

  var selectUser = 'SELECT * FROM ripple.user WHERE userid = $1';
  pool.query(selectUser,[username],(error,results) => {
    if(error){
      console.log("error");
      res.status(401);
    }
    if(results.rows.length == 0){
      var insertUser = 'INSERT INTO ripple.user VALUES ($1,$2)';
      pool.query(insertUser,[username,13],(error,results) => {
        if(error){
          console.log("error inserting user");
          res.status(401);
        }

        req.session.user= {
          username: username
        }

        res.status(200).redirect('/friends');
      })
    }
    else{
      req.session.user = {
        username:username
      }

      res.redirect('/friends');
    }
  })
})

//post route for sending messages to the database
app.post('/sendMessage',(req,res) => {
  var username = req.session.user.username;
  var friendName = req.body.friendUsername;
  var content = req.body.message;

  var sendMessageQUery = 'INSERT INTO ripple.message (userid1,userid2,since,msg,checked) VALUES ($1,$2,NOW()::TIMESTAMP,$3,$4)';
  var sendRecentMessageQuery = 'INSERT INTO ripple.recentmsg (context,since,userid1,userid2) VALUES ($1,NOW()::TIMESTAMP,$2,$3) ON CONFLICT (userid1,userid2) DO UPDATE SET context = $4';

  pool.query(sendMessageQUery,[username,friendName,content,false],(error,results) => {
    if(error){
      console.log(error)
      console.log("send msg error!");
      res.status(401);
    }

    pool.query(sendRecentMessageQuery,[content,username,friendName,content],(error,results2) => {
      if(error){
        console.log(error)
        console.log("send recentmsg1 error!");
        res.status(401);
      }

      pool.query(sendRecentMessageQuery,[content,friendName,username,content],(error,results3) => {
        if(error){
          console.log(error)
          console.log("send recentmsg2 error!");
          res.status(401);
        }
        
        res.send({message:"sucess"});
        
      })
    })
  })
})

app.get('/getMessage',(req,res) => {
  var username = req.session.user.username;
  var friendname = req.query.friendname;

  // console.log(friendname);

  var getMessageQuery = 'SELECT * from ripple.message where (userid1 = $1 and userid2 = $2) or (userid2 = $1 and userid1 = $2) order BY Since DESC'

  pool.query(getMessageQuery,[username,friendname],(error,results) => {
    if(error){
      console.log("get friend msg error!");
      res.status(401);
    }

    var messagedata =[];

    results.rows.forEach(element => {
      if(element.userid1 == username){
        messagedata.push({
          content:element.msg,
          time: element.since,
          owner: true
        })
      }
      else{
        messagedata.push({
          content:element.msg,
          time: element.since,
          owner: false
        })
      }
    })

    res.send({messageData:messagedata})
  })
})

//get route for the friends page
app.get('/friends',(req,res) => {
  // console.log("in route")
  var username = req.session.user.username;
  var getFriends = 'SELECT * from ripple.friend where userid1 = $1 or userid2 = $1 ';
  pool.query(getFriends,[username],(error,results) => {
    if(error){
      console.log("get friends error!");
      res.status(401);
    }

    var realFriends = [];
    var friendRequests = [];
    var sentRequests = [];

    results.rows.forEach(element => {
      if(element.accepted == true){
        if(element.userid1 == username){
          var message = 
          realFriends.push({name:element.userid2});
          
        }
        else{
          realFriends.push({name:element.userid1});
        }
      }
      else{
        if(element.userid1 == username){
          sentRequests.push(element.userid2);
        }
        else{
          friendRequests.push(element.userid1);
        }
      }
    })

    // console.log(realFriends);
    // console.log(friendRequests);
    // console.log(sentRequests);

    var getRecentMsg = "Select * from ripple.recentmsg where userid1 = $1"
    pool.query(getRecentMsg,[username],(error,results2) => {
      if(error){
        console.log("get latest msg error");
        res.status(401);
      }

      // console.log(results2.rows)
     
      realFriends.forEach(element=>{
        element.message = '';
        element.date = '';
      })

      // console.log(realFriends)

    
      var date = {}
      var messages ={}

      results2.rows.forEach(ele => {
        messages[ele.userid2] = ele.context;
        date[ele.userid2] = ele.since;
      })

      // console.log(date)
      // console.log(messages)
      realFriends.forEach(elem => {
        if(messages[elem.name]){
          elem.message = messages[elem.name];
          elem.date = date[elem.name];
        }
      })
      
      // console.log(realFriends)
      res.render('pages/friends',{
        real: realFriends,
        requests: friendRequests,
        sent: sentRequests
      });
  

    })
  })

  

})

//route for accepting friend requests
app.post('/acceptFriend',(req,res) => {
  // console.log("in route")
  var username = req.session.user.username
  var friendname = req.body.friendname

  var friendRequestUpdateQuery = 'update ripple.friend set accepted = $1 where userid1 = $2 and userid2 = $3'
  pool.query(friendRequestUpdateQuery,[true,friendname,username],(error,results) => {
    if(error){
      console.log("accept friend error");
      res.status(401);
    }
    res.send("success");
  })
})

//route for declining friend requests
app.post('/declineFriend',(req,res) => {
  console.log("in route")
  var username = req.session.user.username
  var friendname = req.body.friendname

  var friendRequestUpdateQuery = 'DELETE FROM ripple.friend where (userid1 = $1 and userid2 = $2) or (userid1 = $2 and userid2 = $1)'
  pool.query(friendRequestUpdateQuery,[friendname,username],(error,results) => {
    if(error){
      console.log("decline friend error");
      res.status(401);
    }
    res.send("success");
  })
})

http.listen(PORT,() => console.log(`Listening on ${ PORT }`));

