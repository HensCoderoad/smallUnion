/**
 * 推荐白名单相关数据库操作
 */

var db = require('../db/activity_db');

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
    getActivtyTotal(title, actId, uid, beginTime, endTime) {
        var sql = `SELECT count(*) FROM tb_act WHERE act_status!=-2 `;
        if (beginTime && endTime) {
            sql += `AND (begin_time >= ${beginTime} AND begin_time <= ${endTime} || end_time >= ${beginTime} AND end_time <= ${endTime}) `;
        }
        if (title) {
            sql += `AND act_title LIKE '%${title}%' `;
        }
        if (actId) {
            sql += `AND id =${actId} `;
        }
        if (uid) {
            sql += `AND uid =${uid} `;
        }
        return this._select(sql);
    },
    //获取活动列表
    getActivtyList(title, actId, uid, beginTime, endTime, page, pageSize) {
        var sql = `SELECT * FROM tb_act WHERE act_status!=-2 `;
        if (beginTime && endTime) {
            sql += `AND (begin_time >= ${beginTime} AND begin_time <= ${endTime} || end_time >= ${beginTime} AND end_time <= ${endTime}) `;
        }
        if (title) {
            sql += `AND act_title LIKE '%${title}%' `;
        }
        if (actId) {
            sql += `AND id =${actId} `;
        }
        if (uid) {
            sql += `AND uid =${uid} `;
        }
        sql += `order by create_time desc limit ${(page-1)*pageSize}, ${pageSize}`;
        return this._select(sql);
    },
    getActivtyByIds(actIds) {
        var sql = `SELECT * FROM tb_act WHERE id in (?) `;
        var sqlParam = [actIds];
        return this._select(sql, sqlParam);
    },
    //获取活动奖品
    getActAwardListByActIds(actIds) {
        var sql = `SELECT * FROM tb_act_award_rule WHERE act_id IN (?)`;
        var sqlParam = [actIds];
        return this._select(sql, sqlParam);
    },
    //获取banner总数量
    getBannerTotal(name, beginTime, endTime) {
        var sql = `SELECT count(*) FROM tb_act_banner `;
        if (name) {
            sql += `WHERE banner_name LIKE '%${name}%' `;
        }
        if(beginTime && endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} AND create_time <= ${endTime} `
        }
        return this._select(sql);
    },
    //获取banner总数量
    getBannerList(name, page, pageSize, beginTime, endTime) {
        var sql = `SELECT * FROM tb_act_banner `;
        if (name) {
            sql += `WHERE banner_name LIKE '%${name}%' `;
        }
        if(beginTime && endTime) {
            sql += `${sql.indexOf('WHERE')>-1 ? 'AND' : 'WHERE'} create_time >= ${beginTime} AND create_time <= ${endTime} `
        }
        sql += `order by create_time desc limit ${(page-1)*pageSize}, ${pageSize}`;
        return this._select(sql);
    },
    //获取配置
    getConfig(actId) {
        var sql = `SELECT * FROM tb_act_config WHERE act_id = ${actId}`;
        return this._select(sql);
    },
    //获取中奖名单总数量
    getLuckyTotal(uid, actId, ruleId) {
        var sql = `SELECT count(*) FROM tb_act_lucky `;
        sql += 'JOIN tb_act_award_rule ON tb_act_lucky.rule_id = tb_act_award_rule.id ';
        sql += 'JOIN tb_act on tb_act_lucky.act_id = tb_act.id AND present_state!=-2 ';
        if(uid) {
            sql += `AND tb_act_lucky.lucky_uid=${uid} `;
        }
        if(actId) {
            sql += `AND tb_act_lucky.act_id=${actId} `;
        }
        if(ruleId) {
            sql += `AND tb_act_lucky.rule_id=${ruleId} `;
        }
        return this._select(sql);
    },
    //获取中奖名单列表
    getLuckyList(uid, actId, ruleId, page, pageSize) {
        var sql = `SELECT tb_act_lucky.*,goods_name_alias,act_title FROM tb_act_lucky `;
        sql += 'JOIN tb_act_award_rule ON tb_act_lucky.rule_id = tb_act_award_rule.id ';
        sql += 'JOIN tb_act on tb_act_lucky.act_id = tb_act.id AND present_state!=-2 ';
        if(uid) {
            sql += `AND tb_act_lucky.lucky_uid=${uid} `;
        }
        if(actId) {
            sql += `AND tb_act_lucky.act_id=${actId} `;
        }
        if(ruleId) {
            sql += `AND tb_act_lucky.rule_id=${ruleId} `;
        }
        sql += `order by create_time desc limit ${(page-1)*pageSize}, ${pageSize}`;
        return this._select(sql);
    }
}