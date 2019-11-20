var router = require('express').Router();
var service = require('../modjs/service/goods_srv');
var status = require('../modjs/const/status.js');

//获取活动总数量
router.get('/size', (req, res, next) => {
    var name = req.query.name;
    var beginTime = req.query.beginTime;
    var endTime = req.query.endTime;
    service.getGoodsTotal(name, beginTime, endTime).then((result) => {
        res.json({
            status: status.SUCCESS,
            total: result[0]['count(*)']
        });
    }).catch((err) => {
        res.json({
            status: status.ERROR,
            err: err
        });
    });
});

//获取活动列表
router.get('/list', (req, res, next) => {
    var name = req.query.name;
    var beginTime = req.query.beginTime;
    var endTime = req.query.endTime;
    var page = req.query.page;
    var pageSize = req.query.pageSize;
    service.getGoodsList(name, beginTime, endTime, page, pageSize).then((result) => {
        res.json({
            status: status.SUCCESS,
            list: result
        });
    }).catch((err) => {
        res.json({
            status: status.ERROR,
            err: err
        });
    });
});

module.exports = router;