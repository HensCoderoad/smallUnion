/**
 * 推荐白名单相关数据库操作
 */

var db = require('../db/comment_db');

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
    //获取评论列表
    getCommentList(vid,beginTime, endTime) {
        var sql = `SELECT * FROM tb_video_comment where 1=1 `;
        if (beginTime && endTime) {
            sql += `and (create_time >= '${beginTime}' AND create_time <= '${endTime}') `;
        }
        if(vid){
          sql+= `and vid = '${vid}' `;
        }
        sql += `order by create_time desc`;
        return this._select(sql);
    },
    // 获取评论列表(按日期)
    getCommentListByDate (beginTime , endTime) {
        let sql = `SELECT * FROM tb_comment_stat where 1=1 `;
        if (beginTime && endTime) {
            sql += `and (create_time >= '${beginTime}' and create_time <= '${endTime}') `;
        }
        sql += `order by create_time desc`;
        return this._select(sql);
    },
    // 获取作品评论统计（按日期）
    getVideoListByDate (vid , beginTime , endTime,start,size) {
        let sql = `SELECT * FROM tb_video_stat where 1=1 `;
        if (beginTime && endTime) {
            sql += `and (create_time >= '${beginTime}' and create_time <= '${endTime}') `;
        }
        if (vid) {
            sql += `and vid = '${vid}'`;
        }
        sql += `order by create_time desc`;
        if(start!=undefined&&size!=undefined){
            sql += ` limit ${start},${size}`
        }
        return this._select(sql);
    },
    // 获取总数
    getVideoListByDateCount (vid , beginTime , endTime) {
        let sql = `SELECT count(*) as count FROM tb_video_stat where 1=1 `;
        if (beginTime && endTime) {
            sql += `and (create_time >= '${beginTime}' and create_time <= '${endTime}') `;
        }
        if (vid) {
            sql += `and vid = '${vid}'`;
        }
        return this._select(sql);
    },
    getCommentTotal (vid , beginTime , endTime) {
        let sql = `SELECT comment_status , COUNT(*) as count FROM tb_video_comment where 1=1 `;
        if (beginTime && endTime) {
            sql += `and (create_time >= '${beginTime}' and create_time <= '${endTime}') `;
        }
        if (vid) {
            sql += `and vid = '${vid}' `;
        }
        sql += 'GROUP BY comment_status';
        return this._select(sql);
    },
    getCommentPage (vid , beginTime , endTime , page , pageSize , commentStatus) {
        var sql = `SELECT * FROM tb_video_comment where 1=1 `;
        if (beginTime && endTime) {
            sql += `and (create_time >= '${beginTime}' AND create_time <= '${endTime}') `;
        }
        if(vid){
          sql+= `and vid = '${vid}' `;
        }
        sql += `and comment_status = ${commentStatus} `;
        sql += `order by create_time desc `;
        sql += `limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(sql);
    }
}