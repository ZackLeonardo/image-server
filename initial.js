var db = require('./db')

var initialSqls = [
  'use ' + db.SOLO_DB,
  'CREATE TABLE imageserver(id int auto_increment primary key not null , name varchar(255), contentType varchar(255), tmpPath varchar(255), path varchar(255), md5 varchar(32), size varchar(255), date varchar(255));',
]

db.connect(db.MODE_SOLO, function() {
  db.initial(initialSqls, function(err, ret) {
    if (err) return console.log(err)
    console.log('Database has initialed...' + JSON.stringify(ret))
  })
})
