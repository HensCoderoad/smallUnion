/**
 * 推荐白名单相关数据库操作
 */

var db = require('../db/php_db.js');

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
    //根据aid检测用户是否在推荐白名单内
    getByAid(aid) {
        var sql = 'SELECT * FROM author_whitelist WHERE aid in (?)';
        var sqlParam = [aid];
        return this._select(sql, sqlParam);
    },
    //添加到白名单
    addWork(vid, operUid, createTime) {
        var sql = 'INSERT IGNORE INTO work_whitelist(vid,operator,create_time) values(?,?,?)';
        var sqlParam = [vid, operUid, createTime];
        return this._select(sql, sqlParam).then(() => {
            var sql = 'DELETE FROM work_uncommend WHERE vid = ?';
            var sqlParam = [vid];
            return this._select(sql, sqlParam);
        });
    },
    //删除白名单
    delWork(vid, operUid, reason, createTime) {
        vid = vid instanceof Array ? vid : [vid];
        var sql = 'DELETE FROM work_whitelist WHERE vid in (?)';
        var sqlParam = [vid];
        return this._select(sql, sqlParam).then(() => {
            var arr = [];
            for(var i=0; i<vid.length; i++) {
                arr.push([vid[i], operUid, reason, createTime]);
            }
            var sql = 'INSERT IGNORE INTO work_uncommend(vid,operator,reason,create_time) values ?';
            var sqlParam = [arr];
            return this._select(sql, sqlParam);
        });
    },
    //根据vid获取列表
    getWorkByVids(vids) {
        var sql = 'SELECT vid FROM work_whitelist WHERE vid in (?)';
        var sqlParam = [vids];
        return this._select(sql, sqlParam);
    },
    //获取白名单数量
    getWhiteSize(title, author_name, beginTime, endTime) {
        var sql = 'SELECT count(*) from work_whitelist ';
        if(title) {
            sql += `WHERE title like '%${title}%' `;
        }
        if(author_name) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} author_name like '%${author_name}%' `;
        }
        if(beginTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} `;
        }
        if(endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time <= ${endTime} `;
        }
        return this._select(sql);
    },
    //获取黑名单数量
    getBlackSize(title, author_name, reason, beginTime, endTime) {
        var sql = `SELECT count(*) from work_uncommend ${reason ? 'WHERE reason="'+reason+'"' : ''} `;
        if(title) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} title like '%${title}%' `;
        }
        if(author_name) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} author_name like '%${author_name}%' `;
        }
        if(beginTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} `;
        }
        if(endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time <= ${endTime} `;
        }
        return this._select(sql);
    },
    //获取白名单列表
    getWhiteList(title, author_name, beginTime, endTime, page, size) {
        var start = (page - 1) * size;
        var sql = 'SELECT * FROM work_whitelist ';
        if(title) {
            sql += `WHERE title like '%${title}%' `;
        }
        if(author_name) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} author_name like '%${author_name}%'`;
        }
        if(beginTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} `;
        }
        if(endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time <= ${endTime} `;
        }
        sql += `ORDER BY create_time DESC limit ?,?`
        var sqlParam = [start, size];
        return this._select(sql, sqlParam);
    },
    //获取黑名单列表
    getBlackList(title, author_name, reason, beginTime, endTime, page, size) {
        var start = (page - 1) * size;
        var sql = `SELECT * FROM work_uncommend ${reason ? 'WHERE reason="'+reason+'"' : ''} `;
        if(title) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} title like '%${title}%' `;
        }
        if(author_name) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} author_name like '%${author_name}%' `;
        }
        if(beginTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} `;
        }
        if(endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time <= ${endTime} `;
        }
        sql += `ORDER BY create_time DESC limit ?,?`;
        var sqlParam = [start, size];
        return this._select(sql, sqlParam);
    },
    //获取信作品信息为空的推荐列表
    getUndoneWhiteList(size) {
        var sql = `SELECT * FROM work_whitelist WHERE ISNULL(author_name) limit 0,${size}`;
        return this._select(sql);
    },
    //获取信作品信息为空的不推荐列表
    getUndoneBlackList(size) {
        var sql = `SELECT * FROM work_uncommend WHERE ISNULL(author_name) limit 0,${size}`;
        return this._select(sql);
    },
    //更新白名单
    updateWhite(vid, aid, author_name, title) {
        var sql = `UPDATE work_whitelist SET aid=?, author_name=?, title=? WHERE vid = ?`;
        var sqlParam = [aid, author_name, title, vid];
        return this._select(sql, sqlParam);
    },
    //更新黑名单
    updateBlack(vid, aid, author_name, title) {
        var sql = `UPDATE work_uncommend SET aid=?, author_name=?, title=? WHERE vid = ?`;
        var sqlParam = [aid, author_name, title, vid];
        return this._select(sql, sqlParam);
    }
}