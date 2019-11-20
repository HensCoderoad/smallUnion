var dao = require('../dao/comment_dao.js');

module.exports = {
    getCommentList(vid, beginTime, endTime) {
        return dao.getCommentList(vid,beginTime, endTime);
    },
    getCommentListByDate (beginTime , endTime) {
        return dao.getCommentListByDate(beginTime , endTime);
    },
    getVideoListByDate (vid , beginTime , endTime,start,end) {
        return dao.getVideoListByDate(vid , beginTime , endTime,start,end);
    },
    getVideoListByDateCount(vid , beginTime , endTime) {
        return dao.getVideoListByDateCount(vid , beginTime , endTime);
    },
    getCommentTotal (vid , beginTime , endTime) {
        return dao.getCommentTotal(vid , beginTime , endTime);
    },
    getCommentPage (vid, beginTime, endTime , page , pageSize , commentStatus) {
        return dao.getCommentPage(vid, beginTime, endTime , page , pageSize , commentStatus);
    }
}