/**
 * 推荐白名单相关数据库操作
 */

var db = require('../db/goods_db');

module.exports = {
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
    //获取活动总数量
    getGoodsTotal(name, beginTime, endTime) {
        var sql = `SELECT count(*) FROM tb_goods `;
        if(name) {
            sql += `WHERE name like '%${name}%' `;
        }
        if (beginTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} `;
        }
        if (endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time <= ${endTime} `;
        }
        return this._select(sql);
    },
    //获取活动列表
    getGoodsList(name, beginTime, endTime, page, pageSize) {
        var sql = `SELECT * FROM tb_goods `;
        if(name) {
            sql += `WHERE name like '%${name}%' `;
        }
        if (beginTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} `;
        }
        if (endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time <= ${endTime} `;
        }
        sql += `limit ${(page-1)*pageSize}, ${pageSize}`;
        return this._select(sql);
    }
}