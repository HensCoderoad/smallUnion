var db = require('../db/workvideo_db.js');

module.exports = {
    constructor() {},
    _select(sql, sqlParam) {
        return db.connect().then((connection) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, sqlParam, function (err, result) {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    },
    getVideoByVid(vid){
        var sql = `SELECT * FROM tb_video where title like '%${vid}%'`;
        return this._select(sql);
    }
}