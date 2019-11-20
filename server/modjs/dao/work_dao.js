var db = require('../db/work_db.js');

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
    getWorkTotal(titleKey, nameKey, from, status, userIds) {
        status = typeof status == 'undefined' ? 3 : status;
        var sql = `SELECT count(*) from tb_spider_video WHERE match_status = 1 ${userIds && userIds.length ? 'AND user_id NOT IN (?)' : ''} AND status = ${status} ${titleKey ? 'AND title like "%'+titleKey+'%"' : ''} ${nameKey ? 'AND user_name like "%'+nameKey+'%"' : ''} ${from ? 'AND video_from like "%'+from+'%"' : ''}`;
        var sqlParam = [userIds]
        return this._select(sql, sqlParam);
    },
    //获取作品列表
    getWorkList(page, pageSize, titleKey, nameKey, from, status, userIds) {
        status = typeof status == 'undefined' ? 3 : status;
        var start = (page - 1) * pageSize;
        var sql = `SELECT * FROM tb_spider_video WHERE match_status = 1 ${userIds && userIds.length ? 'AND user_id NOT IN (?)' : ''} AND status = ${status} ${titleKey ? 'AND title like "%'+titleKey+'%"' : ''} ${nameKey ? 'AND user_name like "%'+nameKey+'%"' : ''} ${from ? 'AND video_from like "%'+from+'%"' : ''} ORDER BY createtime DESC limit ?,?`;
        var sqlParam = [start, pageSize];
        userIds && sqlParam.unshift(userIds);
        return this._select(sql, sqlParam);
    },
    //更爱审核状态
    changeStatus(vid, status, operUid, operUname, reason) {
        var sql = 'UPDATE tb_spider_video set status = ?, oper_user_id = ?, oper_user_name = ?, reason = ? WHERE vid = ?';
        var sqlParam = [status, operUid, operUname, reason, vid];
        return this._select(sql, sqlParam);
    },
    //编辑作品
    updateWork(vid, title, video_type, img_oss_url, user_id, user_name) {
        var sql = 'UPDATE tb_spider_video set title = ? ,video_type = ? ,img_oss_url = ? ,user_id = ? ,user_name = ? WHERE vid = ?';
        var sqlParam = [title, video_type, img_oss_url, user_id, user_name, vid];
        return this._select(sql, sqlParam);
    },
    getCrawlUserList() {
        var sql = 'SELECT * from tb_spider_user';
        return this._select(sql);
    },
    //删除作品
    deleteWork(vid) {
        var sql = `DELETE from tb_spider_video WHERE vid = ${vid}`;
        return this._select(sql);
    },
    getVideoByVid(vid){
        var sql = `SELECT * FROM tb_video where title like '%${vid}%'`;
        return this._select(sql);
    }
}