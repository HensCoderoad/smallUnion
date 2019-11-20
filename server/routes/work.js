var router = require('express').Router();
var workService = require('../modjs/service/work_srv.js');
var whiteService = require('../modjs/service/white_list_srv.js');
var commentService = require('../modjs/service/comment_srv');
var status = require('../modjs/const/status.js');
var util = require('../modjs/util');
var axios = require('axios');

var javaHost = 'http://120.79.254.161:8088';
if (process.env.NODE_ENV === 'production') {
    javaHost = 'http://127.0.0.1:8080'
}

var updatingWhite = false; //正在更新白名单作品
var updatingBlack = false; //正在更新黑名单作品

//获取作品列表
router.post('/list/:page/:size', function (req, res, next) {
    var page = Number(req.params.page) || 1;
    var pageSize = Number(req.params.size) || 10;
    var titleKey = req.body.titleKey || '';
    var nameKey = req.body.nameKey || '';
    var from = req.body.from || '';
    var workStatus = req.body.status || 3;
    var userIds = req.body.userIds;
    workService.getWorkList(page, pageSize, titleKey, nameKey, from, workStatus, userIds).then((result) => {
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
//获取作品列表数量
router.post('/size', function (req, res, next) {
    var titleKey = req.body.titleKey || '';
    var nameKey = req.body.nameKey || '';
    var from = req.body.from || '';
    var workStatus = req.body.status || 3;
    var userIds = req.body.userIds;
    workService.getWorkTotal(titleKey, nameKey, from, workStatus, userIds).then((size) => {
        res.json({
            status: status.SUCCESS,
            total: size
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//编辑作品
router.post('/update', function (req, res, next) {
    var vid = req.body.vid;
    var title = req.body.title;
    var video_type = req.body.video_type;
    var img_oss_url = req.body.img_oss_url;
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    workService.updateWork(vid, title, video_type, img_oss_url, user_id, user_name).then((result) => {
        res.json({
            status: status.SUCCESS,
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//更改审核状态
router.post('/status', function (req, res, next) {
    var vid = req.body.vid;
    var _status = req.body.status;
    var operUid = req.body.operUid;
    var operUname = req.body.operUname;
    var reason = req.body.reason;
    workService.changeStatus(vid, _status, operUid, operUname, reason).then((result) => {
        res.json({
            status: status.SUCCESS,
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//删除作品
router.post('/del', function (req, res, next) {
    var vid = req.body.vid;
    workService.deleteWork(vid).then((result) => {
        res.json({
            status: status.SUCCESS,
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//获取爬虫认证号列表
router.get('/users', function (req, res, next) {
    workService.getCrawlUserList().then((result) => {
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
//添加作品推荐白名单
router.post('/white/add', function (req, res, next) {
    var av = req.body.av;
    var operUid = req.body.operUid;
    var parallel = [];
    var vids = [];
    for (var i = 0; i < av.length; i++) {
        parallel.push(_add(av[i].vid, operUid));
    }
    Promise.all(parallel).then(() => {
        res.json({
            status: status.SUCCESS,
            vids: vids
        });
        updateWhite(false, vids);
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
    function _add(vid, operUid) {
        return whiteService.addWork(vid, operUid).then(() => {
            vids.push(vid);
        });
    }
});
//根据vids获取白名单
router.post('/white/get', function (req, res, next) {
    var vids = req.body.vids;
    whiteService.getWorkByVids(vids).then((result) => {
        res.json({
            list: result,
            status: status.SUCCESS
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//根据vid删除白名单
router.post('/white/del', function (req, res, next) {
    var vid = req.body.vid;
    var operUid = req.body.operUid;
    var reason = req.body.reason;
    whiteService.delWork(vid, operUid, reason).then((result) => {
        res.json({
            status: status.SUCCESS
        });
        updateWhite(true, vid);
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//白名单数量
router.post('/white/size', function (req, res, next) {
    var title = req.body.title;
    var author_name = req.body.author_name;
    var beginTime = req.body.beginTime;
    var endTime = req.body.endTime;
    whiteService.getWhiteSize(title, author_name, beginTime, endTime).then((result) => {
        res.json({
            total: result[0]['count(*)'],
            status: status.SUCCESS
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//黑名单数量
router.post('/black/size', function (req, res, next) {
    var reason = req.body.reason;
    var title = req.body.title;
    var author_name = req.body.author_name;
    var beginTime = req.body.beginTime;
    var endTime = req.body.endTime;
    whiteService.getBlackSize(title, author_name, reason, beginTime, endTime).then((result) => {
        res.json({
            total: result[0]['count(*)'],
            status: status.SUCCESS
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//白名单列表
router.post('/white/list', function (req, res, next) {
    var page = req.body.page;
    var size = req.body.size;
    var title = req.body.title;
    var author_name = req.body.author_name;
    var beginTime = req.body.beginTime;
    var endTime = req.body.endTime;
    whiteService.getWhiteList(title, author_name, beginTime, endTime, page, size).then((result) => {
        res.json({
            list: result,
            status: status.SUCCESS
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//黑名单列表
router.post('/black/list', function (req, res, next) {
    var page = req.body.page;
    var size = req.body.size;
    var reason = req.body.reason;
    var title = req.body.title;
    var author_name = req.body.author_name;
    var beginTime = req.body.beginTime;
    var endTime = req.body.endTime;
    whiteService.getBlackList(title, author_name, reason, beginTime, endTime, page, size).then((result) => {
        res.json({
            list: result,
            status: status.SUCCESS
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//检查白名单
router.post('/white/check', function (req, res, next) {
    var aids = req.body.aids;
    var checkResult = {};
    for (var i = 0; i < aids.length; i++) {
        checkResult[aids[i]] = false;
    }
    whiteService.getByAid(aids).then((result) => {
        for (var i = 0; i < result.length; i++) {
            checkResult[result[i].aid] = true;
        }
        res.json({
            list: checkResult,
            status: status.SUCCESS
        });
    }).catch((err) => {
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    });
});
//更新全部白名单作品信息(慎用)
router.get('/white/update/all', function (req, res, next) {
    if (req.session.userId != 1) {
        res.json({
            status: status.FORBIDDEN
        });
        return;
    }
    res.send('更新中');
    updateWhite(false);
});
//更新全部黑名单作品信息(慎用)
router.get('/black/update/all', function (req, res, next) {
    if (req.session.userId != 1) {
        res.json({
            status: status.FORBIDDEN
        });
        return;
    }
    res.send('更新中');
    updateWhite(true);
});
router.post('/comment/getVideoByName',function(req,res,next){
    let name = req.body.name;
     workService.getVideoByVid(name).then((result)=>{
        res.json({
            list: result,
            status: status.SUCCESS
        });
    }).catch(err=>{
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    })
})
// 查询作品评论
router.post('/comment/getlist',function(req,res,next){
    let vid = req.body.vid
    let beginTime,endTime;
    if(req.body.createtime&&req.body.createtime.length==2)
    {
        beginTime = req.body.createtime[0];
        endTime = req.body.createtime[1];
    }
    commentService.getCommentList(vid,beginTime,endTime).then((result)=>{
        res.json({
            list: result,
            status: status.SUCCESS
        });
    }).catch(err=>{
        res.json({
            status: status.SERVER_ERROR,
            err: JSON.stringify(err)
        });
    })
});
// 按日期查询作品评论
router.post('/comment/getListByDate' , (req , res , next) => {
    let beginTime , endTime;
    if (req.body.createtime && req.body.createtime.length == 2) {
        beginTime = req.body.createtime[0];
        endTime = req.body.createtime[1];
    };
    commentService.getCommentListByDate(beginTime , endTime).then(result => {
        res.json({
            list : result,
            status : status.SUCCESS
        })
    }).catch(err => {
        res.json({
            err : JSON.stringify(err),
            status : status.SERVER_ERROR
        })
    });
});
// 第一次进入查询总数
router.post('/comment/getVideoListByDateCount' , (req , res , next) => {
    let vid = req.body.vid;
    let beginTime , endTime;
    if (req.body.create_time && req.body.create_time.length == 2) {
        beginTime = req.body.create_time[0];
        endTime = req.body.create_time[1];
    };
    commentService.getVideoListByDateCount(vid , beginTime,endTime ).then(result => {
        res.json({
            list : result,
            status : status.SUCCESS
        })
    }).catch(err => {
        res.json({
            err : JSON.stringify(err),
            status : status.SERVER_ERROR
        })
    });
});

// 按日期查询作品评论统计
router.post('/comment/getVideoListByDate' , (req , res , next) => {
    let vid = req.body.vid;
    let beginTime , endTime;
    let start,size;
    if (req.body.create_time && req.body.create_time.length == 2) {
        beginTime = req.body.create_time[0];
        endTime = req.body.create_time[1];
    };
    if(req.body.start!=undefined && req.body.size!=undefined){
        start = req.body.start
        size = req.body.size
    }
    commentService.getVideoListByDate(vid , beginTime , endTime,start,size).then(result => {
        res.json({
            list : result,
            status : status.SUCCESS
        })
    }).catch(err => {
        res.json({
            err : JSON.stringify(err),
            status : status.SERVER_ERROR
        })
    });
});
// 获取评论列表总条数
router.post('/comment/getCommentTotal' , (req , res , next) => {
    let vid = req.body.vid;
    let beginTime , endTime;
    if (req.body.createtime && req.body.createtime.length == 2) {
        beginTime = req.body.createtime[0];
        endTime = req.body.createtime[1];
    };
    commentService.getCommentTotal(vid , beginTime , endTime).then(result => {
        res.json({
            list : result,
            status : status.SUCCESS
        })
    }).catch(err => {
        res.json({
            err : JSON.stringify(err),
            status : status.SERVER_ERROR
        })
    })
});
// 获取当前页评论列表
router.post('/comment/getCommentPage' , (req , res , next) => {
    let page = req.body.page;
    let pageSize = req.body.pageSize;
    let commentStatus = req.body.commentStatus;
    let vid = req.body.vid;
    let beginTime , endTime;
    if (req.body.createtime && req.body.createtime.length == 2) {
        beginTime = req.body.createtime[0];
        endTime = req.body.createtime[1];
    };
    commentService.getCommentPage(vid, beginTime, endTime , page , pageSize , commentStatus).then(result => {
        res.json({
            list : result,
            status : status.SUCCESS
        })
    }).catch(err => {
        res.json({
            err : JSON.stringify(err),
            status : status.SERVER_ERROR
        })
    });
});

//更新黑白名单作品信息
function updateWhite(ifBlack, originVids) {
    if (!originVids) {
        if (ifBlack && updatingBlack) {
            return;
        } else if (updatingWhite) {
            return;
        }
        //防止频繁调用
        if(ifBlack) {
            updatingBlack = true;
        } else {
            updatingWhite = true;
        }
    }
    var allList = [];
    var getUndoneList = whiteService.getUndoneWhiteList;
    var update = whiteService.updateWhite;
    if (ifBlack) {
        getUndoneList = whiteService.getUndoneBlackList;
        update = whiteService.updateBlack;
    }
    return new Promise((resolve) => {
        //更新固定vid对应的作品
        if (originVids) {
            resolve(originVids);
            //更新数据库中所有的作品
        } else {
            getUndoneList(1000000).then((result) => {
                var vids = [];
                result.map((item) => {
                    vids.push(item.vid);
                });
                resolve(vids);
            })
        }
    }).then((vids) => {
        allList = vids;
        _updateList();
    });

    function _updateList() {
        if (!allList.length) {
            if(!originVids) {
                if(ifBlack) {
                    updatingBlack = false;
                } else {
                    updatingWhite = false;
                }
            }
            return;
        }
        let vids = allList.splice(0, 50);
        console.log('更新黑白名单作品请求数量', vids.length);
        //从java接口获取基础作品信息
        axios.post(javaHost + '/works/SWorks/BatchGetVideos', {
            "head": { "@type": "type.googleapis.com/ja.common.proto.AutReqHead", "ver": 1, "platform": 5, "seqid": util.getSeqid() },
            vid: vids
        }).then((result) => {
            var size = 0, count = 0;
            if (result.data && result.data.info) {
                for (var vid in result.data.info) {
                    size++;
                }
                console.log('更新黑白名单作品返回数量', size);
                for (var vid in result.data.info) {
                    var author = result.data.info[vid].author || {};
                    var video = result.data.info[vid].video || {};
                    update(vid, author.aid || 0, author.name || '', video.title || '').catch((err) => {
                        console.log('更新黑白名单作品信息失败', err);
                    }).then(() => {
                        count++;
                        //继续更新
                        if (count >= size) {
                            _updateList();
                        }
                    });
                }
            } else {
                console.log('更新黑白名单作品信息失败', result.data);
                console.log('名单列表:\n', vids);
                //继续更新
                _updateList();
            }
        }).catch((err) => {
            _updateList();
            console.log('更新黑白名单作品信息失败', err.response.data);
        });
    }
}
module.exports = router;