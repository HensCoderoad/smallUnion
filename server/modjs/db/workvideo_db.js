var mysql = require('mysql');
var DateBase = require('./db');

const host = process.env.NODE_ENV === 'production' ? 'rr-bp1o28941ogv09m6z.mysql.rds.aliyuncs.com' : 'rm-bp12bzgmvo85rflhio.mysql.rds.aliyuncs.com';
const user = process.env.NODE_ENV === 'production' ? 'ecy_web' : 'migration_test';
const password = process.env.NODE_ENV === 'production' ? 'Psweb_d13bNTc#' : 'migrationTest*';
const database = process.env.NODE_ENV === 'production' ? 'db_nt_works' : 'db_nt_works';

const db = new DateBase({
    host: host,
    user: user,
    password: password,
    database: database
});

module.exports = {
    connect() {
        return db.connect();
    }
}