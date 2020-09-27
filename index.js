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
  res.render('pages/index',{data:"hi"})
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


http.listen(PORT,() => console.log(`Listening on ${ PORT }`));

