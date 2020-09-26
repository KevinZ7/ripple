const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { resourceUsage } = require('process');
const {Pool} = require('pg');

var pool = new Pool({
  connectionString :  process.env.DATABASE_URL
})



express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    var query = `SELECT * from ripple.user`
    pool.query(query,(error,resp)=>{
      if(error){
        console.log(error);
        res.send("error")
      }

      res.render('pages/index',{data:resp.rows})
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
