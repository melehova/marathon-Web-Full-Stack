'use strict'

var express = require('express')
const expressThymeleaf = require('express-thymeleaf')
const { TemplateEngine } = require('thymeleaf')
const bodyParser = require('body-parser')
const session = require('express-session')
const bcrypt = require('bcrypt')
const db = require('./db')
const User = require('./models/user')

let app = express()
const templateEngine = new TemplateEngine()

let hostname = 'localhost'
let port = process.env.PORT ?? 8080
let logins = [], emails = []
listOfUsers()

app.use(express.static(__dirname + '/public'));
app.engine('html', expressThymeleaf(templateEngine))
app.set('view engine', 'html')
app.set('views', __dirname + '/public')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'password secret',
        saveUninitialized: true
    })
)


app.get('/signup', (req, res) => {
    res.render('signup', {
        logins: logins,
        emails: emails
    })
})


app.get('/login', (req, res) => {
    res.render('login', {
        logins: logins,
        emails: emails
    })
})

app.post('/signup', (req, res) => {
    console.log(req.body)
    if (!req.body)
        return res.sendStatus(400)
    let salt = bcrypt.genSaltSync(Number(req.body.password[0]))
    let password = bcrypt.hashSync(req.body.password, salt);
    let user = new User(req.body)
    user.save()
    res.redirect('/login')
})

app.post('/login', (req, res) => {
    res.render('login', {
        logins: logins,
        emails: emails
    })
})

app.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`)
})

function listOfUsers() {
    db.promise().query('select login, email from users')
        .then((res) => {
            res[0].map(item => {
                logins.push(item['login'])
                emails.push(item['email'])
            })
            return
        })
        .catch(err => {
            console.error(err)
            return
        })
}


/*
        let match = bcrypt.compareSync(req.body.password, password)
    if (match) {
        console.log('OK')
    }
    else
        console.error('NE OK')
*/
