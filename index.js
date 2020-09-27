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

// Route to go to user's journal
app.get('/journal', (req, res) => {
  var user = 'john';


  var query = `SELECT journal.journal, journal.since, journal.category, quote.author FROM ripple.journal LEFT JOIN ripple.quote
  ON journal.userid = quote.userid WHERE journal.userid = '${user}' ORDER BY since DESC`;



  pool.query(query, (error, result) => {
    if(error){
      console.log(error);
      res.status(400);
    }



    const entrydate = result.rows.reduce((acc, value) => {
      if (acc.length && acc[acc.length - 1][0].since.toDateString() == value.since.toDateString()) {
        acc[acc.length - 1].push(value);
      } else {
        acc.push([value]);
      }
    
      return acc;
    }, []);

    var totalrows = entrydate.length;

    console.log(entrydate)


    res.render('pages/journal',{data: entrydate, size: totalrows, username: user});

  })
})

app.post('/entry', (req,res) =>{
  var text = req.body.content;
  var user = 'john';

  console.log(text)

  var query = `INSERT INTO ripple.journal VALUES (DEFAULT, $1, NOW()::TIMESTAMP, 'journal', $2)`

  pool.query(query, [text, user], (error, result) => {
    if(error){
      console.log(error);
      res.status(400)
    }
  
    res.send({entry: text})
  })

})

app.get('/homepage', (req,res)=>{
  res.render('pages/homepage',{data:"hi"});
})



http.listen(PORT,() => console.log(`Listening on ${ PORT }`));

