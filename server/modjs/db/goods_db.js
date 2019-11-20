var mysql = require('mysql');
var DateBase = require('./db');

const host = process.env.NODE_ENV === 'production' ? 'rm-bp1ed4tf0ifr8ss18.mysql.rds.aliyuncs.com' : 'rm-bp12bzgmvo85rflhio.mysql.rds.aliyuncs.com';
const user = process.env.NODE_ENV === 'production' ? 'ecy_goods' : 'migration_test';
const password = process.env.NODE_ENV === 'production' ? 'PWecy_dbntgoods_45fa' : 'migrationTest*';
const database = process.env.NODE_ENV === 'production' ? 'db_nt_goods' : 'db_nt_goods';

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