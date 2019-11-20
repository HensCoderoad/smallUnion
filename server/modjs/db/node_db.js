var mysql = require('mysql');
var DateBase = require('./db');

const host = process.env.NODE_ENV === 'production' ? 'rm-bp10b4n5116u90h5t.mysql.rds.aliyuncs.com' : 'rm-bp12bzgmvo85rflhio.mysql.rds.aliyuncs.com';
const user = process.env.NODE_ENV === 'production' ? 'webuser' : 'migration_test';
const password = process.env.NODE_ENV === 'production' ? 'fnwkufkljfk984ewJ' : 'migrationTest*';
const database = process.env.NODE_ENV === 'production' ? 'db_node_js' : 'db_nt_nodejs';

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