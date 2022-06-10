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
const nodemailer = require("nodemailer")
const { Obj } = require('prelude-ls')


let app = express()
const templateEngine = new TemplateEngine()

let hostname = 'localhost'
let port = process.env.PORT ?? 8080
// let logins = [], emails = []
// listOfUsers()

app.use(express.static(__dirname + '/views'));
app.engine('html', expressThymeleaf(templateEngine))
app.set('view engine', 'html')
app.set('views', __dirname + '/views')
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
        // console.log('user => ', user)
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
                // console.log('session =>', req.session)
                res.redirect('/profile')
            })

        }
    })
})

app.post('/reset-password', (req, res) => {
    let user = new User(req.body);
    user.findByLogin().then((result) => {
        // console.log('user =>', user)
        // console.log(hideEmail(user.email))
        res.render('confirm_reset', {
            email: hideEmail(user.email),
            name: user.full_name,
            login: user.login
        })
    })
})

app.post('/confirm-reset', (req, res) => {
    // console.log(req.body)
    let user = new User(req.body);
    user.findByLogin().then((result) => {
        user.setNewPassword().then(pass => {
            // console.log('pass =>', pass)
            sendPassword(user, pass).catch(console.error)
            res.redirect('/login')
        })
    })
})

app.get('/reset-password', (req, res) => {
    listOfUsers().then((lists) => {
        res.render('reset_password', {
            logins: lists.logins
        })
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
    session = req.session
    if (session.userData) {
        req.session.destroy()
        res.redirect('/login')
    } else {
        res.redirect('/login')
    }
})

app.get('*', function (req, res) {
    res.send('<img src="https://images2.imgbox.com/d7/55/lV5c30eE_o.png" alt="Error 404" style="width: 50%; height: auto; display: block; margin:auto;"><p style="text-align: center;">URL is not recognized</p>', 404);
});

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

async function getRole(role_id) {
    let role = ''
    await db.promise().query(`select name from roles where id = ${role_id}`)
        .then((res) => {
            role = res[0][0].name
        })
    return role
}

function hideEmail(email) {
    let hidden = '';
    let email1 = email.slice(0, email.indexOf('@'))
    let email2 = email.slice(email.indexOf('@'));
    [...email1].forEach(char => {
        if (Math.floor(Math.random() * 2)) {
            hidden += char
        } else {
            hidden += '*'
        }
    });
    return hidden + email2
}

async function sendPassword(user, password) {
    let account = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
        // for gmail

        service: 'gmail',
        auth: {
            user: 'veronika0melehova@gmail.com',
            pass: 'fkcvlgdxccrtsiyg',
        },
        tls: {
            rejectUnauthorized: false
        },

        // for demo
        /*
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass,
        },
        tls: {
            rejectUnauthorized: false
        },
        */

    })
    // console.log(user.email)
    let info = await transporter.sendMail({
        // for demo
        // from: '"Master VM 👻" <vm@example.com>',          
        // for gmail
        from: 'veronika0melehova@gmail.com',
        to: user.email,
        subject: "Password reset",
        text: `Hey, ${user.full_name}, the new password for your *** account is: ${password}. If you did not confirm reset of password, do it now. Only you can see this password`,
        html: `<p>Hey, <h1>${user.full_name}</h1></p><div><p>, the new password for your *** account is: <code>${password}</code></p><p>If you did not confirm reset of password, do it now. Only you can see this password</p></div>`
    })
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

/*
        let match = bcrypt.compareSync(req.body.password, password)
    if (match) {
        console.log('OK')
    }
    else
        console.error('NE OK')
*/
