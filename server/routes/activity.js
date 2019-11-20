var router = require('express').Router();
var service = require('../modjs/service/activity_srv');
var status = require('../modjs/const/status.js');

//获取活动总数量
router.get('/size', (req, res, next) => {
    var title = req.query.title;
    var actId = req.query.actId;
    var uid = req.query.uid;
    var beginTime = req.query.beginTime;
    var endTime = req.query.endTime;
    service.getActivtyTotal(title, actId, uid, beginTime, endTime).then((result) => {
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
    var title = req.query.title;
    var actId = req.query.actId;
    var uid = req.query.uid;
    var beginTime = req.query.beginTime;
    var endTime = req.query.endTime;
    var page = req.query.page;
    var pageSize = req.query.pageSize;
    service.getActivtyList(title, actId, uid, beginTime, endTime, page, pageSize).then((result) => {
        for(var i=0; i<result.length; i++) {
            var obj = result[i];
            var now = new Date().getTime();
            obj.now_time = (now/1000)>>0;
            //检测是否已结束
            if((obj.act_status == 2 || obj.act_status == 3) && obj.end_time*1000 < now) {
                obj.act_status = 1;
                //检查是否已开始
            } else if(obj.act_status == 2 && obj.begin_time*1000 < now &&  obj.end_time*1000 > now) {
                obj.act_status = 3;
            }
        }
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

//获取活动列表
router.get('/id', (req, res, next) => {
    var actIds = req.query.actIds;
    service.getActivtyByIds(actIds).then((result) => {
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

//获取活动列表
router.get('/act_award/list', (req, res, next) => {
    var actIds = req.query.actIds.split(',');
    service.getActAwardListByActIds(actIds).then((result) => {
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

//获取banner数量
router.get('/banner/size', (req, res, next) => {
    var name = req.query.name;
    var beginTime = req.query.beginTime;
    var endTime = req.query.endTime;
    service.getBannerTotal(name, beginTime, endTime).then((result) => {
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

//获取中奖列表
router.get('/banner/list', (req, res, next) => {
    var name = req.query.name;
    var page = req.query.page;
    var pageSize = req.query.pageSize;
    var beginTime = req.query.beginTime;
    var endTime = req.query.endTime;
    service.getBannerList(name, page, pageSize, beginTime, endTime).then((result) => {
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

//获取活动配置
router.get('/config', (req, res, next) => {
    var actId = req.query.actId
    service.getConfig(actId).then((result) => {
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

//获取中奖总数量
router.get('/lucky/size', (req, res, next) => {
    var uid = req.query.uid
    var actId = req.query.actId;
    var ruleId = req.query.ruleId;
    service.getLuckyTotal(uid, actId, ruleId).then((result) => {
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

//获取中奖列表
router.get('/lucky/list', (req, res, next) => {
    var uid = req.query.uid;
    var actId = req.query.actId;
    var ruleId = req.query.ruleId;
    var page = req.query.page;
    var pageSize = req.query.pageSize;
    service.getLuckyList(uid, actId, ruleId, page, pageSize).then((result) => {
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