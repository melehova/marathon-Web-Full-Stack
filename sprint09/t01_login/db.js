const mysql = require('mysql2')
const config = require('./config.json')
const fs = require('fs')

const db = mysql.createConnection(config)

db.connect(function (err) {
    if (err) {
        return console.error("ERROR: " + err.message)
    } else {
        console.log('\x1b[42m', 'Connected to db', '\x1b[0m')
    }
})

try {
    const sqlLine = fs.readFileSync(`${__dirname}/db.sql`, 'utf-8')
    db.query(sqlLine, (err, result) => {
        if (err) console.error(err)
        // console.log(result)
    })
} catch (error) {
    console.error(error)
}

module.exports = db