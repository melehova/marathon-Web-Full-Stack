'use strict'

var express = require('express')
const expressThymeleaf = require('express-thymeleaf')
const { TemplateEngine } = require('thymeleaf')
const bodyParser = require('body-parser')
const sessions = require('express-session')
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt')
const db = require('./db')
const User = require('./models/user')


let app = express()
const templateEngine = new TemplateEngine()

let hostname = 'localhost'
let port = process.env.PORT ?? 8080
// let logins = [], emails = []
// listOfUsers()

app.use(express.static(__dirname + '/public'));
app.engine('html', expressThymeleaf(templateEngine))
app.set('view engine', 'html')
app.set('views', __dirname + '/public')
app.use(bodyParser.json());
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
const oneDay = 1000 * 60 * 60 * 24
app.use(
    sessions({
        secret: 'password secret',
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false
    })
)
var session;

app.post('/signup', (req, res) => {
    if (!req.body)
        return res.sendStatus(400)
    let salt = bcrypt.genSaltSync(Number(req.body.password[0]))
    let password = bcrypt.hashSync(req.body.password, salt);

    let user = new User({
        login: req.body.login,
        full_name: req.body.full_name,
        email: req.body.email,
        password: password
    })
    user.save()
    res.redirect('/login')
})

app.post('/login', (req, res) => {
    let user = new User(req.body);
    user.findSelf().then((result) => {
        console.log('user => ', user)
        if (user.id === 0 || user.id === null) {
            listOfUsers().then((lists) => {
                res.render('login', {
                    logins: lists.logins,
                    emails: lists.emails,
                    errorMsg: 'Incorrect Data'
                })
            })
        } else {
            getRole(user.role_id).then((role) => {
                session = req.session
                session.userData = Object.assign(user, { 'role': role })
                console.log('session =>', req.session)
                res.redirect('/profile')
            })

        }
    })
})

app.get('/signup', (req, res) => {
    listOfUsers().then((lists) => {
        res.render('signup', {
            logins: lists.logins,
            emails: lists.emails
        })
    })
})


app.get('/login', (req, res) => {
    listOfUsers().then((lists) => {
        res.render('login', {
            logins: lists.logins,
            emails: lists.emails
        })
    })
})

app.get('/profile', (req, res) => {
    session = req.session
    if (session.userData) {
        res.render('profile', {
            user: session.userData,
            photo: `https://avatars.dicebear.com/api/pixel-art/${session.userData.login}.svg`
        })
    } else {
        res.redirect('/login')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

app.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`)
})

async function listOfUsers() {
    let logins = [], emails = []
    await db.promise().query('select login, email from users')
        .then((res) => {
            res[0].map(item => {
                logins.push(item['login'])
                emails.push(item['email'])
            })

        })
    return { logins: logins, emails: emails }
}

getRole(1)

async function getRole(role_id) {
    let role = ''
    await db.promise().query(`select name from roles where id = ${role_id}`)
        .then((res) => {
            role = res[0][0].name
        })
    return role
}


/*
        let match = bcrypt.compareSync(req.body.password, password)
    if (match) {
        console.log('OK')
    }
    else
        console.error('NE OK')
*/
