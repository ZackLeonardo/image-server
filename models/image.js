var db = require('../db.js')

exports.create = function(name, content_type, tmpPath, path, md5, size, done) {
  var values = [name, content_type, tmpPath, path, md5, size, new Date().toISOString()]

  db.get(null, function(err, connection) {
    if (err) return done('Database problem')

    connection.query('INSERT INTO imageserver (name, contentType, tmpPath, path, md5, size, date) VALUES(?, ?, ?, ?, ?, ?, ?)', values, function(err, ret) {
      if (err) return done(err)
      done(null, ret.insertId)
    })
  })
}
