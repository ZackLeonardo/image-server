var express = require('express')
var multer = require('multer')
var fs = require('fs')
var images = express.Router()  // the sub app
var upload = multer()

var image = require('../models/image')

var rootDir = '/var/www/nginx/images/'

images.get('/', function (req, res) {
  console.log(images.mountpath) // /admin
  res.send('images Homepage')
})

images.post('/', upload.array(), function (req, res) {
   console.log("get post"+JSON.stringify(req.body));
   //res.send('Hello POST');
   var name = req.body["images.name"]
   var content_type = req.body["images.content_type"]
   var tmpPath = req.body["images.path"]
   var md5 = req.body["images.md5"]
   var size = req.body["images.size"]

   createFolder(function(folder){
     var path = rootDir + folder + '/' + name
     move(tmpPath, path, function(err){
       if (err) {
         console.log('move file error' + err)
       } else {
         image.create(name, content_type, tmpPath, path, md5, size, function(err, ret) {
           if (err) {
             console.log('mysql image create error : ' + err)
           }
           console.log(JSON.stringify(ret));
           res.send(folder + '/' + name)
         })
       }
     })
   })


})

function createFolder(callback){
  var date = new Date()
  var year = date.getUTCFullYear()
  var month = date.getUTCMonth() + 1
  var day = date.getUTCDate()

  var folder = year + '-' + month + '-' + day
  var folderPath = rootDir + folder

  fs.access(folderPath, fs.constants.F_OK, (err) => {
    console.log(err ? 'folder not exits!' : 'folder exits!');
    if (err) {
      fs.mkdir(folderPath, function(err){
        if (err) {
          console.log('mkdir error')
          callback('dirError')
        }
        console.log('mkdir ' + year + '-' + month + '-' + day)
        callback(folder)
      })
    }
    callback(folder)
  });
}

function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
      debugger
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

module.exports = images
