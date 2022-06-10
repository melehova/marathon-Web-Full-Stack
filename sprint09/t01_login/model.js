const db = require('./db')
const bcrypt = require('bcrypt')

module.exports = class Model {
    constructor(properties) {
        this.id = 0;
        this.login = properties.login;
        this.full_name = properties.full_name;
        this.email = properties.email;
        this.password = properties.password;
        this.role_id = 1
    }

    async findSelf() {
        await db
            .promise()
            .query(`SELECT * FROM users WHERE login ='${this.login}' AND email='${this.email}'`)
            .then((res) => {
                let match = bcrypt.compareSync(this.password, res[0][0].password)
                console.log(res, this.password, res[0][0].password, match)
                if (res[0].length !== 0 && match) {
                    this.id = res[0][0].id;
                    this.full_name = res[0][0].full_name;
                    this.role_id = res[0][0].role_id;
                    let salt = bcrypt.genSaltSync(Number(this.password[0]))
                    this.password = bcrypt.hashSync(this.password[0], salt);
                    console.log('OK')
                } else {
                    console.error('NE OK')
                    this.id = null
                    this.login = null
                    this.full_name = null
                    this.email = null
                    this.password = null
                    this.role_id = null
                    console.error('Incorrect data')
                }
                return this
            })
    }
    async find(id) {
        const [result, _] = await db
            .promise()
            .query(`SELECT * FROM users WHERE id ='${id}'`);

        this.id = id;
        this.login = result[0].login;
        this.full_name = result[0].full_name;
        this.email = result[0].email;
        this.password = result[0].password;
        this.role_id = result[0].role_id
    }
    async save() {
        // console.log("vev", this.login, this.full_name, this.email, this.password)
        await db
            .promise()
            .query(
                `INSERT INTO users(login, full_name, email, password)
                    VALUES ('${this.login}', '${this.full_name}', '${this.email}', '${this.password}')
                    ON DUPLICATE KEY UPDATE
                    login = VALUES(login),
                    full_name = VALUES(full_name),
                    email = VALUES(email),
                    password = VALUES(password);`)
        const [dataUser, _] = await db
            .promise()
            .query(`SELECT * FROM users WHERE LOGIN = '${this.login}'`)
        this.id = dataUser[0].id;
    }

    delete() {
        db.query(`DELETE from users WHEREC id='${this.id}'`, (err) => {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log('User delete');
            }
        });
    }
}


