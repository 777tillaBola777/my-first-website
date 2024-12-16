
const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    database: 'own_work',
    user: 'root',
    password: '123456',
    connectionLimit: 10
})

module.exports = pool.promise()