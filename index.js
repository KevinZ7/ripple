const express = require('express')
const {spawn} = require('child_process');
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

// Route to go to user's journal
app.get('/journal', (req, res) => {
  var user = 'johnsmith';

  var query = `SELECT * FROM ripple.journal WHERE userid = '${user}' ORDER BY dt`;
  pool.query(query, (error, result) => {
    if(error){
      console.log(error);
      res.status(400);
    }

    var totalrows = result.rows.length;
    console.log(result.rows[0])
  
    res.render('pages/journal',{rows: result.rows, size: totalrows});

  })
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
// to push up the quotes to the database 
app.post('/insert_quote', (req,res)=>{
    var author = req.body.author;
    var quote = req.body.quote;
    // var username = req.session.user.username;
    var username = 'abhopla';

    console.log(author);
    console.log(quote);
    quote_params = [quote, author,username];

    var quote_query = `INSERT INTO ripple.quote(quote,author,since,userid) VALUES($1,$2,current_timestamp,$3)`;
    
    pool.query(quote_query,quote_params,(error,resp)=>{
      if (error){ console.log(error); return res.status(409).send(error);}
      res.sendStatus(200);
    })

})



app.get('/potentialfriends', (req, res) => {
  let username = req.query.username;
  let dataToSend;
  const python = spawn('python', ['scripts/nlp/comparison.py', '-u', username]);
  python.stdout.on('data', (data) => {
    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
  });
  python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.send(dataToSend)
  });
})

http.listen(PORT,() => console.log(`Listening on ${ PORT }`));
