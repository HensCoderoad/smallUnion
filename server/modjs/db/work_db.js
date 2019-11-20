var mysql = require('mysql');
var DateBase = require('./db');

const host = process.env.NODE_ENV === 'production' ? '10.0.0.92' : 'rm-bp12bzgmvo85rflhio.mysql.rds.aliyuncs.com';
const user = process.env.NODE_ENV === 'production' ? 'splider' : 'migration_test';
const password = process.env.NODE_ENV === 'production' ? 'gz_#@splider@2019' : 'migrationTest*';
const database = process.env.NODE_ENV === 'production' ? 'db_nt_video' : 'db_nt_video';

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