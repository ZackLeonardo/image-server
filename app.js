var express = require('express');

var db = require('./db')
var app = express(); // the sub app

app.use('/upload', require('./controllers/images'))

// Connect to MySQL on start
db.connect(db.MODE_TEST, function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1)
  } else {
    app.listen(8088, function() {
      console.log('Listening on port 8088...')
    })
  }
})


// var express = require('express')
// var multer = require('multer'); // multer 是处理multipart/form-data的中间件 https://github.com/expressjs/multer
//
// var upload = multer()
// var app = express()
//
// // respond with "hello world" when a GET request is made to the homepage
// app.get('/', function (req, res) {
//   res.send('hello world')
// })
//
// app.post('/upload', upload.array(), function (req, res) {
//    debugger
//    console.log("get post"+JSON.stringify(req.body));
//    res.send(req.body);
// })
//
// var server = app.listen(8088, function () {
//
//   var host = server.address().address
//   var port = server.address().port
//
//   console.log("http://%s:%s", host, port)
//
// })
