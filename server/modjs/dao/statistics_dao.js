var db = require('../db/statistics_db.js');

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
    //获取爬虫统计列表
    getCrawlerList(startTime, endTime) {
        var sql = '';
        if(startTime !== undefined && endTime!==undefined && endTime > startTime) {
            sql = `SELECT * from tb_report_1 WHERE daynum >= ${startTime} AND daynum <= ${endTime}`;
        } else {
            sql = `SELECT * from tb_report_1`;
        }
        return this._select(sql);
    }
}