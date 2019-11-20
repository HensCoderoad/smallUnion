var dao = require('../dao/activity_dao.js');

module.exports = {
    getActivtyTotal(title, actId, uid, beginTime, endTime) {
        return dao.getActivtyTotal(title, actId, uid, beginTime, endTime);
    },
    getActivtyList(title, actId, uid, beginTime, endTime, page, pageSize) {
        return dao.getActivtyList(title, actId, uid, beginTime, endTime, page, pageSize);
    },
    getActivtyByIds(actIds) {
        return dao.getActivtyByIds(actIds);
    },
    getActAwardListByActIds(actIds) {
        return dao.getActAwardListByActIds(actIds);
    },
    //获取banner总数量
    getBannerTotal(name, beginTime, endTime) {
        return dao.getBannerTotal(name, beginTime, endTime);
    },
    //获取banner总数量
    getBannerList(name, page, pageSize, beginTime, endTime) {
        return dao.getBannerList(name, page, pageSize, beginTime, endTime);
    },
    getConfig(actId) {
        return dao.getConfig(actId);
    },
    getLuckyTotal(uid, actId, ruleId) {
        return dao.getLuckyTotal(uid, actId, ruleId);
    },
    getLuckyList(uid, actId, ruleId, page, pageSize) {
        return dao.getLuckyList(uid, actId, ruleId, page, pageSize);
    }
}