var dao = require('../dao/white_list_dao.js');

module.exports = {
    getByAid(aid) {
        return dao.getByAid(aid);
    },
    addWork(vid, operUid) {
        var createTime = Math.floor(Date.now()/1000);
        return dao.addWork(vid, operUid, createTime);
    },
    delWork(vid, operUid, reason) {
        var createTime = Math.floor(Date.now()/1000);
        return dao.delWork(vid, operUid, reason, createTime);
    },
    getWorkByVids(vids) {
        return dao.getWorkByVids(vids);
    },
    getWhiteSize(title, author_name, beginTime, endTime) {
        return dao.getWhiteSize(title, author_name, beginTime, endTime);
    },
    getBlackSize(title, author_name, reason, beginTime, endTime) {
        return dao.getBlackSize(title, author_name, reason, beginTime, endTime);
    },
    getWhiteList(title, author_name, beginTime, endTime, page, size) {
        return dao.getWhiteList(title, author_name, beginTime, endTime, page, size);
    },
    getBlackList(title, author_name, reason, beginTime, endTime, page, size) {
        return dao.getBlackList(title, author_name, reason, beginTime, endTime, page, size);
    },
    //获取信作品信息为空的推荐列表
    getUndoneWhiteList(size) {
        return dao.getUndoneWhiteList(size);
    },
    //获取信作品信息为空的不推荐列表
    getUndoneBlackList(size) {
        return dao.getUndoneBlackList(size);
    },
    //更新白名单
    updateWhite(vid, aid, author_name, title) {
        return dao.updateWhite(vid, aid, author_name, title);
    },
    //更新黑名单
    updateBlack(vid, aid, author_name, title) {
        return dao.updateBlack(vid, aid, author_name, title);
    }
}