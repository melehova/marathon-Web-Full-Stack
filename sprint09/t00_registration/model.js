const db = require('./db')
/*
module.exports = class Model {
    constructor(properties) {
        if (properties) {
            this.id = properties.id;
            this.login = properties.login;
            this.full_name = properties.full_name;
            this.email = properties.email;
            this.password = properties.password;
        }
    }

    find(id) {
        db.query(`SELECT * FROM users where users.id = ${id};`, (err, result) => {
            if (result.length) {
                this.id = result[0].id;
                this.login = result[0].login;
                this.full_name = result[0].full_name;
                this.email = result[0].email;
                this.password = result[0].password;
                console.log(this)
            } else {
                console.error(`Dont find user with id: ${id}`)
            }
        })
        return this.password
    }
    delete(id) {
        db.query(`SET FOREIGN_KEY_CHECKS=0;DELETE FROM users WHERE users.id = ${id};SET FOREIGN_KEY_CHECKS=1;`, (err, result) => {
            if (err) console.error(err)
        })
    }
    save(properties) {
        const user = properties;
        console.log(user)
        const sql = `INSERT INTO users(login, full_name, email, password)
                        VALUES (?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        login = VALUES(login),
                        full_name = VALUES(full_name),
                        email = VALUES(email),
                        password = VALUES(password);`
        db.query(sql, user, (err, result) => {
            if (err) {
                console.error(err)
                return false
            } else {
                console.log("user added or updated")
                return true
            }
        })
    }
}*/

module.exports = class Model {
    constructor(properties) {
        this.id = 0;
        this.login = properties.login;
        this.full_name = properties.full_name;
        this.email = properties.email;
        this.password = properties.password;
    }
    async find(id) {
        const [result, _] = await db
            .promise()
            .query('SELECT * FROM users WHERE id =?', id);

        this.id = id;
        this.login = result[0].login;
        this.full_name = result[0].full_name;
        this.email = result[0].email;
        this.password = result[0].password;
    }
    async save() {
        console.log("vev", this.login)
        await db
            .promise()
            .query(
                `INSERT INTO users(login, full_name, email, password)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    login = VALUES(login),
                    full_name = VALUES(full_name),
                    email = VALUES(email),
                    password = VALUES(password);`,
                this.login, this.full_name, this.email, this.password
            );
        const [dataUser, _] = await db
            .promise()
            .query('SELECT * FROM users WHERE LOGIN = ?', this.login);
        this.id = dataUser[0].id;
    }

    delete() {
        db.query('DELETE from users WHEREC id=?)', this.id, (err) => {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log('User delete');
            }
        });
    }
}


