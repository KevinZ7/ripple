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

//get route for the friends page
app.get('/friends',(req,res) => {
  res.render('pages/friends');
})

http.listen(PORT,() => console.log(`Listening on ${ PORT }`));

