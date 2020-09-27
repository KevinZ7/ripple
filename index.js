const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const {Pool} = require('pg');
const session = require('express-session');

var pool = new Pool({
  connectionString :  'postgres://postgres:root@localhost/postgres'
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
  res.render('pages/index')
})

app.get('/homepage', (req,res)=>{
  res.render('pages/homepage');
})

app.post('/add_mess', (req,res)=>{
  var content = req.body.message;
  console.log(content);
  // var username = req.session.user.username;
  var username = 'abhopla';
  var category = 'description';


  description_params = [content, username,content];
  journal_params = [content, category, username];

  var description_query = `INSERT INTO ripple.description(content, since, userid)
                           VALUES($1,current_timestamp,$2) 
                           ON CONFLICT (userid) DO UPDATE SET content = $3`;

  // var test_query = `INSERT INTO ripple.description(content,since,userid) VALUES('nvnerin',current_timestamp,'abhopla') ON CONFLICT(userid) DO UPDATE SET content = 'it changed'`;

  var journal_query = `INSERT INTO ripple.journal(journal, since, category, userid) VALUES($1,current_timestamp,$2,$3)`;

  pool.query(description_query,description_params,(error,resp)=>{
    if (error){ console.log(error); return res.status(409).send(error);}

    pool.query(journal_query,journal_params,(error,resp)=>{
      if (error){ console.log(error);return res.status(409).send(error);}

      console.log("success!");
      res.sendStatus(200);
    })

  })
})

http.listen(PORT,() => console.log(`Listening on ${ PORT }`));

