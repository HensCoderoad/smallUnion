var router = require('express').Router();
var statisticsService = require('../modjs/service/statistics_srv.js');
var status = require('../modjs/const/status.js');

//获取爬虫统计列表
router.post('/list', function (req, res, next) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    statisticsService.getCrawlerList(startTime, endTime).then((result) => {
        res.json({
            status: status.SUCCESS,
            list: result
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});

module.exports = router;