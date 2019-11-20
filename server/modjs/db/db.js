var mysql = require('mysql');

module.exports = class DataBase{
    constructor(option) {
        this.host = option.host;
        this.user = option.user;
        this.password = option.password;
        this.database = option.database;
    }
    connect() {
        if (!this.pool) {
            this.pool = mysql.createPool({
                connectionLimit: 3,
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database,
                port: '3306'
            });
        }
        return new Promise((resolve, reject) => {
            this.pool.getConnection(function (err, connection) {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        });
    }
}