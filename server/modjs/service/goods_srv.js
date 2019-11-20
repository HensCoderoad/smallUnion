var dao = require('../dao/goods_dao.js');

module.exports = {
    //获取活动总数量
    getGoodsTotal(name, beginTime, endTime) {
        return dao.getGoodsTotal(name, beginTime, endTime);
    },
    //获取活动列表
    getGoodsList(name, beginTime, endTime, page, pageSize) {
        return dao.getGoodsList(name, beginTime, endTime, page, pageSize);
    }
}