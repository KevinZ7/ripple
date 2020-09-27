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
  res.render('pages/homepage',{data:"hi"});
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
