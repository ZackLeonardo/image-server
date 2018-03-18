// CREATE TABLE people(id int primary key not null auto_increment, name varchar(255), age int, address text)

// CREATE TABLE cars(id int not null auto_increment, brand varchar(255), model varchar(255), owner_id int)

var mysql = require('mysql')
  , async = require('async')

var SOLO_DB = 'test'
  , CLUSTER_DB = 'image_server_db_cluster'
  , TEST_DB = 'test'

exports.SOLO_DB = SOLO_DB
exports.CLUSTER_DB = CLUSTER_DB
exports.TEST_DB = TEST_DB

exports.MODE_TEST = 'mode_test'
exports.MODE_SOLO = 'mode_solo'
exports.MODE_CLUSTER = 'mode_solo'


var state = {
  pool: null,
  mode: null,
}

exports.connect = function(mode, done) {
  if (mode === exports.CLUSTER_DB) {
    state.pool = mysql.createPoolCluster()

    state.pool.add('WRITE', {
      host: '192.168.0.5',
      user: 'your_user',
      password: 'some_secret',
      database: CLUSTER_DB
    })

    state.pool.add('READ1', {
      host: '192.168.0.6',
      user: 'your_user',
      password: 'some_secret',
      database: CLUSTER_DB
    })

    state.pool.add('READ2', {
      host: '192.168.0.7',
      user: 'your_user',
      password: 'some_secret',
      database: CLUSTER_DB
    })
  } else if (mode === exports.SOLO_DB){
    state.pool = mysql.createPool({
      connectionLimit : 10,
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: SOLO_DB
    })
  } else {
    state.pool = mysql.createPool({
      connectionLimit : 10,
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: TEST_DB
    })
  }

  state.mode = mode
  done()
}


// 用来选择从那个connection进行读写操作，目前不用
//1--
exports.READ = 'read'
exports.WRITE = 'write'

exports.get = function(type, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  if (type === exports.WRITE) {
    state.pool.getConnection('WRITE', function (err, connection) {
      if (err) return done(err)
      done(null, connection)
    })
  } else if (type === exports.READ) {
    state.pool.getConnection('READ*', function (err, connection) {
      if (err) return done(err)
      done(null, connection)
    })
  } else {
    done(null, pool)
  }
}
//1--end

// 完成建表操作
exports.initial = function(initialSqls, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  for (let sql of initialSqls){
    console.log(sql);
    pool.query(sql, done);
  }

}

// 完成数据初始化
exports.fixtures = function(data, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  var names = Object.keys(data.tables)
  async.each(names, function(name, cb) {
    async.each(data.tables[name], function(row, cb) {
      var keys = Object.keys(row)
        , values = keys.map(function(key) { return "'" + row[key] + "'" })
      debugger
      pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', cb)
    }, cb)
  }, done)
}

exports.drop = function(tables, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  async.each(tables, function(name, cb) {
    pool.query('DELETE * FROM ' + name, cb)
  }, done)
}

// pool.query('drop table if exists ' + name, function (err, ret){
//   if (err) return done(new Error('drop exit table.'))
//   console.log(ret);
//
// })
