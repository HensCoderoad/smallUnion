var router = require('express').Router();
var userService = require('../modjs/service/user_srv.js');
var status = require('../modjs/const/status.js');
// var elasticsearch = require('elasticsearch');
// var esearch = require('@elastic/elasticsearch');
var esClient = require('../modjs/util/elasticsearch');


//登录
router.post('/login', function (req, res, next) {
  var name = req.body.name;
  var password = req.body.password;
  userService.checkUser(name, password).then((result) => {
    if (result.user) {
      req.session.userName = name;
      req.session.userId = result.user.id;
      var user = {
        name: result.user.name,
        nickName: result.user.nickname,
        id: result.user.id,
        roleList: result.roleList
      }
      res.json({
        status: status.SUCCESS,
        user: user
      });
    } else {
      res.json({
        status: status.PASSWORD_INVALID,
        user: user
      });
    }
  }).catch((err) => {
    res.json({
      status: status.SERVER_ERROR,
      err: JSON.stringify(err)
    });
  });
});

//获取用户信息
router.get('/get', function (req, res, next) {
  userService.getUser(req.session.userName).then((result) => {
    var user = {
      name: result.user.name,
      nickName: result.user.nickname,
      id: result.user.id,
      roleList: result.roleList
    }
    res.json({
      status: status.SUCCESS,
      user: user
    });
  }).catch((err) => {
    res.json({
      status: status.SERVER_ERROR,
      err: JSON.stringify(err)
    });
  });
});

//获取用户列表
router.get('/list', function (req, res, next) {
  userService.getUserList().then((result) => {
    var users = [];
    result.map((item) => {
      users.push({
        name: item.name,
        nickName: item.nickname,
        id: item.id
      });
    });
    res.json({
      status: status.SUCCESS,
      list: users
    });
  }).catch((err) => {
    res.json({
      status: status.SERVER_ERROR,
      err: JSON.stringify(err)
    });
  });
});

//根据ids获取用户列表
router.get('/list/ids/:ids', function (req, res, next) {
  var ids = req.params.ids;
  ids = ids && ids.split(',') || [];
  userService.getUserListByIds(ids).then((result) => {
    var users = [];
    result.map((item) => {
      users.push({
        name: item.name,
        nickName: item.nickname,
        id: item.id
      });
    });
    res.json({
      status: status.SUCCESS,
      list: users
    });
  }).catch((err) => {
    res.json({
      status: status.SERVER_ERROR,
      err: JSON.stringify(err)
    });
  });
});

//删除用户
router.post('/delete', (req, res, next) => {
  var id = req.body.id
  userService.delteUser(id).then(() => {
    res.json({
      status: status.SUCCESS
    });
  });
});

//添加用户
router.post('/add', (req, res, next) => {
  var name = req.body.name;
  var password = req.body.password;
  var nickName = req.body.nickName;
  var roles = req.body.roles;
  roles = roles && roles.split(',');
  userService.getUser(name).then((result) => {
    if (!result.user) {
      return userService.addUser(name, nickName, password, roles);
    } else { //用户名已经存在
      res.json({
        status: status.USER_EXISTS
      });
      return false;
    }
  }).then((result) => {
    if (result) {
      res.json({
        status: status.SUCCESS
      });
    }
  }).catch((err) => {
    res.json({
      status: status.SERVER_ERROR,
      err: JSON.stringify(err)
    });
  });
});

//用户自己修改资料
router.post('/update/self', (req, res, next) => {
  var id = req.body.id;
  var name = req.body.name;
  var nickName = req.body.nickName;
  var password = req.body.password;
  userService.getUser(name).then((result) => {
    if (!result.user || result.user.id == id) {
      return userService.updateUserSelf(id, name, nickName, password);
    } else { //用户名已经存在
      res.json({
        status: status.USER_EXISTS
      });
      return false;
    }
  }).then((result) => {
    if (result) {
      req.session.name = name;
      res.json({
        status: status.SUCCESS
      });
    }
  }).catch((err) => {
    res.json({
      status: status.SERVER_ERROR,
      err: JSON.stringify(err)
    });
  });
});

//更新用户
router.post('/update', (req, res, next) => {
  var id = req.body.id;
  var name = req.body.name;
  var nickName = req.body.nickName;
  var password = req.body.password;
  var roles = req.body.roles;
  roles = roles && roles.split(',');
  userService.getUser(name).then((result) => {
    if (!result.user || result.user.id == id) {
      return userService.updateUser(id, name, nickName, password, roles);
    } else { //用户名已经存在
      res.json({
        status: status.USER_EXISTS
      });
      return false;
    }
  }).then((result) => {
    res.json({
      status: status.SUCCESS
    });
  }).catch((err) => {
    res.json({
      status: status.SERVER_ERROR,
      err: JSON.stringify(err)
    });
  });
});

//用户退出
router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    err && console.log(err);
  })
  res.json({
    status: status.SUCCESS
  });
});

//获取角色用户关联列表
router.get('/role', (req, res, next) => {
  userService.getUserRoleMap().then((result) => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  });
});

//添加角色
router.post('/role/add', (req, res, next) => {
  var name = req.body.name;
  var weight = req.body.weight || 0;
  var menus = req.body.menus;
  menus = menus && menus.split(',');
  userService.addRole(name, weight, menus).then((result) => {
    res.json({
      status: status.SUCCESS
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});

//删除角色
router.post('/role/delete', (req, res, next) => {
  var id = req.body.id;
  userService.deleteRole(id).then((result) => {
    res.json({
      status: status.SUCCESS
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});

//更新角色
router.post('/role/update', (req, res, next) => {
  var id = req.body.id;
  var name = req.body.name;
  var weight = req.body.weight || 0;
  var menus = req.body.menus;
  menus = menus && menus.split(',');
  userService.updateRole(id, name, weight, menus).then((result) => {
    res.json({
      status: status.SUCCESS
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});

//获取角色列表
router.get('/role/list', (req, res, next) => {
  userService.getRoleList().then((result) => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  });
});

//获取用户的菜单
router.get('/menu/id/:id', (req, res, next) => {
  var id = req.params.id;
  userService.getUserMenuList(id).then((result) => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});

//添加菜单
router.post('/menu/add', (req, res, next) => {
  var name = req.body.name;
  var parentId = req.body.parentId;
  var path = req.body.path;
  var order = req.body.order;
  var roles = req.body.roles;
  var show = req.body.show || 0;
  roles = roles && roles.split(',');
  userService.addMenu(name, path, order, parentId, roles, show).then((result) => {
    if (result.insertId) {
      res.json({
        status: status.SUCCESS
      });
    } else {
      res.json({
        status: status.MENU_REPEATE
      });
    }
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});

//删除菜单
router.post('/menu/delete', (req, res, next) => {
  var id = req.body.id;
  userService.deleteMenu(id).then((result) => {
    res.json({
      status: status.SUCCESS
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR,
      err: err
    });
  });
});

//获取菜单列表
router.get('/menu/list', (req, res, next) => {
  userService.getMenuList().then((result) => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});

//更新菜单
router.post('/menu/update', (req, res, next) => {
  var id = req.body.id;
  var name = req.body.name;
  var path = req.body.path;
  var order = req.body.order;
  var roles = req.body.roles;
  var show = req.body.show || 0;
  roles = roles && roles.split(',');
  userService.updateMenu(id, name, path, order, roles, show).then((result) => {
    res.json({
      status: status.SUCCESS
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});

//获取菜单列表
router.get('/menu/get', (req, res, next) => {
  userService.getRoleList().then((result) => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  });
});

//获取菜单角色关联列表
router.get('/menu/role', (req, res, next) => {
  userService.getMenuRoleMap().then((result) => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR
    });
  });
});
// 获取用户操作日志
router.post('/log/getall', (req, res, next) => {
  let menu_id = req.body.menu_id
  let beginTime, endTime;
  if (req.body.createtime && req.body.createtime.length == 2) {
    beginTime = req.body.createtime[0];
    endTime = req.body.createtime[1];
  }
  userService.getAllLog(menu_id, beginTime, endTime).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/log/add', (req, res, next) => {
  var user_id = req.body.user_id;
  var menu_id = req.body.menu_id;
  var action_id = req.body.action_name;
  var param = req.body.param;
  userService.addLog(user_id, menu_id, action_id, param).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/log/update', (req, res, next) => {
  var logid = req.body.id;
  var status = req.body.status;
  userService.updateLog(logid, status).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
// 获取字段
router.post('/field/getall', (req, res, next) => {
  userService.getAllField().then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/field/addfield', (req, res, next) => {
  var menu = req.body.menu;
  var field = req.body.field;
  var name = req.body.fieldname;
  var showtable = req.body.showtable;
  var showlabel = req.body.showlabel;
  var ctrltype = req.body.ctrltype;
  var redios = req.body.redios;
  userService.addField(menu, name, field, showtable, showlabel, ctrltype, redios).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/field/editfield', (req, res, next) => {
  var id = req.body.id;
  var menu = req.body.menu;
  var field = req.body.field;
  var name = req.body.fieldname;
  var showtable = req.body.showtable;
  var showlabel = req.body.showlabel;
  var ctrltype = req.body.ctrltype;
  var redios = req.body.redios;
  userService.editField(id, menu, name, field, showtable, showlabel, ctrltype, redios).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
});

// 日活数据统计
router.post('/comment/allStatistics' , async (req , res) => {
  let startTime = Number(req.body.startTime);
  let finishTime = Number(req.body.finishTime);
  let dateData = {};
  let total = {};
  total['date'] = Math.round((finishTime - startTime) / (24 * 60 * 60 * 1000)) + 1 + '天';
  //活跃用户数
  let options1 = {
    index : 'clientlog_v2',
    type : 'watch',
    body : {
      "query" : {
        "bool" : {
          "must" : [
            {
              "range" : esClient.getDateRange('create_time' , startTime , finishTime)
            },
            {
              "term" : {
                "type" : {
                  "value" : "personas"
                }
              }
            }
          ]
        }
      },
      "size" : 0,
      "aggs" : {
        "activeUser" : {
          "cardinality" : {
            "field" : "uid"
          }
        },
        "daily" : {
          "date_histogram" : esClient.getDateHistogram('create_time' , startTime , finishTime),
          "aggs" : {
            "activeUser" : {
              "cardinality" : {
                "field" : "uid"
              }
            }
          }
        }
      }
    }
  };
  //新增用户和新增授权用户
  let options2 = {
    index : 'userstat_register_v1',
    type : 'register',
    body : {
      "query" : {
        "bool" : {
          "must" : [
            {
              "range" : esClient.getDateRange('time' , startTime , finishTime)
            }
          ]
        }
      },
      "size" : 0,
      "aggs" : {
        "statistics" : {
          "terms" : {
            "field" : "authtype"
          }
        },
        "daily" : {
          "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime),
          "aggs" : {
            "statistics" : {
              "terms" : {
                "field" : "authtype"
              }
            }
          }
        }
      }
    }
  };
  //订阅数相关
  let options3 = {
    index : 'user_log_subscription',
    type : 'watch',
    body : {
      "query" : {
        "bool" : {
          "must" : [
            {
              "range" : esClient.getDateRange('time' , startTime , finishTime)
            }
          ]
        }
      },
      "size" : 0,
      "aggs" : {
        "absoluteSubscription" : {
          "terms" : {
            "field" : "type"
          }
        },
        "daily" : {
          "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime),
          "aggs" : {
            "absoluteSubscriptionc" : {
              "terms" : {
                "field" : "type"
              }
            }
          }
        }
      }
    }
  };
  // 播放数
  let options4 = {
    index : 'user_log_videoplay',
    type : 'watch',
    body : {
      "query" : {
        "bool" : {
          "must" : [
            {
              "range" : esClient.getDateRange('time' , startTime , finishTime)
            }
          ]
        }
      },
      "size" : 0,
      "aggs" : {
        "playUser" : {
          "cardinality" : {
            "field" : "uid"
          }
        },
        "duration" : {
          "sum" : {
            "field" : "duration"
          }
        },
        "playWork" : {
          "cardinality" : {
            "field" : "vid"
          }
        },
        "daily" : {
          "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime),
          "aggs" : {
            "playUser" : {
              "cardinality" : {
                "field" : "uid"
              }
            },
            "duration" : {
              "sum" : {
                "field" : "duration"
              }
            },
            "playWork" : {
              "cardinality" : {
                "field" : "vid"
              }
            }
          }
        }
      }
    }
  };
  // 点赞数
  let options5 = {
    index : 'user_log_addlike',
    type : 'watch',
    body : {
      "query" : {
        "bool" : {
          "must" : [
            {
              "range" : esClient.getDateRange('time' , startTime , finishTime)
            },
            {
              "term" : {
                "type" : {
                  "value" : 1
                }
              }
            }
          ]
        }
      },
      "size" : 0,
      "aggs" : {
        "daily" : {
          "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime)
        }
      }
    }
  };
  // 分享数
  let options6 = {
    index : 'user_log_share',
    type : 'watch',
    body : {
      "query" : {
        "bool" : {
          "must" : [
            {
              "range" : esClient.getDateRange('time' , startTime , finishTime)
            }
          ]
        }
      },
      "size" : 0,
      "aggs" : {
        "share" : {
          "terms" : {
            "field" : "type"
          }
        },
        "daily" : {
          "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime),
          "aggs" : {
            "share" : {
              "terms" : {
                "field" : "type"
              }
            }
          }
        }
      }
    }
  };
  try {
    let data = await esClient.search(options1);
    total.activeUser = data['body']['aggregations']['activeUser']['value'];
    let dailyBuckets = data['body']['aggregations']['daily']['buckets'];
    dailyBuckets.forEach(bucket => {
      dateData[bucket['key_as_string']] = {};
      dateData[bucket['key_as_string']]['activeUser'] = bucket['activeUser']['value'];
    });
  } catch (err) {
    res.json({
      status : status.ERROR,
      error : JSON.stringify(err)
    })
  };

  try {
    let data = await esClient.search(options2);
    let buckets = data['body']['aggregations']['statistics']['buckets'];
    total.newUser = 0;
    total.newAuthorUser = 0;
    buckets.forEach(bucket => {
      if (bucket.key === 1) {
        total.newAuthorUser = bucket['doc_count'];
      } else if (bucket.key === 0) {
        total.newUser = bucket['doc_count'];
      }
    });
    let dailyBuckets = data['body']['aggregations']['daily']['buckets'];
    dailyBuckets.forEach(bucket => {
      dateData[bucket['key_as_string']]['newUser'] = 0;
      dateData[bucket['key_as_string']]['newAuthorUser'] = 0;
      bucket['statistics']['buckets'].forEach(item => {
        if (item.key === 1) {
          dateData[bucket['key_as_string']]['newAuthorUser'] = item['doc_count'];
        } else if (item.key === 0) {
          dateData[bucket['key_as_string']]['newUser'] = item['doc_count'];
        }
      })
    })
  } catch (err) {
    res.json({
      status : status.ERROR,
      error : JSON.stringify(err)
    })
  };

  try {
    let data = await esClient.search(options3);
    let buckets = data['body']['aggregations']['absoluteSubscription']['buckets'];
    let add = 0;
    let dec = 0;
    buckets.forEach(bucket => {
      if (bucket.key === 1) {
        add = bucket['doc_count'];
      } else if (bucket.key === 0) {
        dec = bucket['doc_count'];
      }
    });
    total['absoluteSubscription'] = add - dec;//绝对新增订阅数
    let dailyBuckets = data['body']['aggregations']['daily']['buckets'];
    dailyBuckets.forEach(bucket => {
      let add = 0;
      let dec = 0;
      bucket['absoluteSubscriptionc']['buckets'].forEach(item => {
        if (item.key === 1) {
          add = item['doc_count'];
        } else if (item.key === 0) {
          dec = item['doc_count'];
        }
      });
      dateData[bucket['key_as_string']]['absoluteSubscription'] = add - dec;
    })
  } catch (err) {
    res.json({
      status : status.ERROR,
      error : JSON.stringify(err)
    })
  }

  try {
    let data = await esClient.search(options4);
    total['playCount'] = data['body']['hits']['total'];//播放数
    total['playUser'] = data['body']['aggregations']['playUser']['value'];//播放人数
    total['duration'] = esClient.getFormatTime(data['body']['aggregations']['duration']['value']);// 播放总时长
    total['playWork'] = data['body']['aggregations']['playWork']['value'];// 播放作品数
    if (data['body']['aggregations']['playUser']['value']) {
      total['durationAvg'] = esClient.getFormatTime(data['body']['aggregations']['duration']['value'] / data['body']['aggregations']['playUser']['value']);// 人均播放时长
    } else {
      total['durationAvg'] = '0小时0分钟0秒';
    }
    let dailyBuckets = data['body']['aggregations']['daily']['buckets'];
    dailyBuckets.forEach(bucket => {
      dateData[bucket['key_as_string']]['playCount'] = bucket['doc_count'];
      dateData[bucket['key_as_string']]['playUser'] = bucket['playUser']['value'];
      dateData[bucket['key_as_string']]['duration'] = esClient.getFormatTime(bucket['duration']['value']);
      dateData[bucket['key_as_string']]['playWork'] = bucket['playWork']['value'];
      if (bucket['playWork']['value']) {
        dateData[bucket['key_as_string']]['durationAvg'] = esClient.getFormatTime(bucket['duration']['value'] / bucket['playWork']['value']);// 人均播放时长
      } else {
        dateData[bucket['key_as_string']]['durationAvg'] = '0小时0分钟0秒';
      }
    });
  } catch (err) {
    res.json({
      status : status.ERROR,
      error : JSON.stringify(err)
    })
  }

  try {
    let data = await esClient.search(options5);
    total['addLikeTotal'] = data['body']['hits']['total'];// 点赞总数
    let dailyBuckets = data['body']['aggregations']['daily']['buckets'];
    dailyBuckets.forEach(bucket => {
      dateData[bucket['key_as_string']]['addLikeTotal'] = bucket['doc_count'];
    });
  } catch (err) {
    res.json({
      status : status.ERROR,
      error : JSON.stringify(err)
    })
  }

  try {
    let data = await esClient.search(options6);
    let buckets = data['body']['aggregations']['share']['buckets'];
    total['shareFriend'] = 0;
    total['sharePoster'] = 0;
    buckets.forEach(bucket => {
      if (bucket.key === 1) {
        total['shareFriend'] = bucket['doc_count']; // 好友分享数
      } else if (bucket.key === 0) {
        total['sharePoster'] = bucket['doc_count']; // 海报保存点击总数
      }
    });
    let dailyBuckets = data['body']['aggregations']['daily']['buckets'];
    dailyBuckets.forEach(bucket => {
      dateData[bucket['key_as_string']]['shareFriend'] = 0;
      dateData[bucket['key_as_string']]['sharePoster'] = 0;
      bucket['share']['buckets'].forEach(item => {
        if (item.key === 1) {
          dateData[bucket['key_as_string']]['shareFriend'] = bucket['doc_count'];
        } else if (item.key === 0) {
          dateData[bucket['key_as_string']]['sharePoster'] = bucket['doc_count'];
        }
      })
    });
  } catch (err) {
    res.json({
      status : status.ERROR,
      error : JSON.stringify(err)
    })
  }
  for (let key in dateData) {
    dateData[key]['date'] = key;
  };
  res.json({
    status : status.SUCCESS,
    data : {
      total : [total],
      date : Object.values(dateData)
    }
  });
});


router.post('/comment/statistics' , async (req , res) => {
  let type = req.body.type || '';
  let group = req.body.group || 'day';
  let startTime = Number(req.body.startTime);
  let finishTime = Number(req.body.finishTime);
  let result = [];
  let buckets = [];
  let date = [];  // 保存日期数据
  let options = {};  // 查询es需要的参数
  let data = {}; // 保存查询es返回的结果
  try {
    switch (type) {
      case 'activeUser' : 
        options = {
          index : 'clientlog_v2',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('create_time' , startTime , finishTime)
                  },
                  {
                    "term" : {
                      "type" : {
                        "value" : "personas"
                      }
                    }
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('create_time' , startTime , finishTime , group),
                "aggs" : {
                  "data" : {
                    "cardinality" : {
                      "field" : "uid"
                    }
                  }
                }
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket.data.value);
        });
      break;
      case 'newUser' :
        options = {
          index : 'userstat_register_v1',
          type : 'register',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime),
                  },
                  {
                    "term" : {
                      "authtype" : {
                        "value" : 0
                      }
                    }
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group)
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket['doc_count']);
        })
      break;
      case 'newAuthorUser' : 
        options = {
          index : 'userstat_register_v1',
          type : 'register',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  },
                  {
                    "term" : {
                      "authtype" : {
                        "value" : 1
                      }
                    }
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group)
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket['doc_count']);
        });
      break;
      case 'absoluteSubscription' :
        options = {
          index : 'user_log_subscription',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group),
                "aggs" : {
                  "data" : {
                    "terms" : {
                      "field" : "type"
                    }
                  }
                }
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          let add = 0;
          let dec = 0;
          bucket['data']['buckets'].forEach(item => {
            if (item.key === 1) {
              add = item['doc_count'];
            } else if (item.key === 0) {
              dec = item['doc_count'];
            }
          });
          result.push(add - dec);
        });
      break;
      case 'playCount' :
        options = {
          index : 'user_log_videoplay',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group)
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket['doc_count']);
        });
      break;
      case 'playUser' :
        options = {
          index : 'user_log_videoplay',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group),
                "aggs" : {
                  "data" : {
                    "cardinality" : {
                      "field" : "uid"
                    }
                  }
                }
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket.data.value);
        });
      break;
      case 'playWork' :
        options = {
          index : 'user_log_videoplay',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group),
                "aggs" : {
                  "data" : {
                    "cardinality" : {
                      "field" : "vid"
                    }
                  }
                }
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket.data.value);
        })
      break;
      case 'duration' :
        options = {
          index : 'user_log_videoplay',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group),
                "aggs" : {
                  "data" : {
                    "sum" : {
                      "field" : "duration"
                    }
                  }
                }
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket.data.value);
        })
      break;
      case 'addLikeTotal' :
        options = {
          index : 'user_log_addlike',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  },
                  {
                    "term" : {
                      "type" : {
                        "value" : 1
                      }
                    }
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group)
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket['doc_count']);
        });
      break;
      case 'shareFriend' :
        options = {
          index : 'user_log_share',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  },
                  {
                    "term" : {
                      "type" : {
                        "value" : 1
                      }
                    }
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group)
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket['doc_count']);
        });
      break;
      case 'sharePoster' : 
        options = {
          index : 'user_log_share',
          type : 'watch',
          body : {
            "query" : {
              "bool" : {
                "must" : [
                  {
                    "range" : esClient.getDateRange('time' , startTime , finishTime)
                  },
                  {
                    "term" : {
                      "type" : {
                        "value" : 2
                      }
                    }
                  }
                ]
              }
            },
            "size" : 0,
            "aggs" : {
              "daily" : {
                "date_histogram" : esClient.getDateHistogram('time' , startTime , finishTime , group)
              }
            }
          }
        };
        data = await esClient.search(options);
        buckets = data['body']['aggregations']['daily']['buckets'];
        buckets.forEach(bucket => {
          result.push(bucket['doc_count']);
        });
      break;
      default : 
        return res.json({
          status : status.ERROR,
          error : '请输入统计类型'
        });
    };
    buckets.forEach(bucket => {
      date.push(bucket['key_as_string']);
    });
    res.json({
      data : result,
      date : date
    });
  } catch (err) {
    res.json({
      status : status.ERROR,
      error : JSON.stringify(err)
    })
  }
});
// 指定某个分类
// 随机获取数据
router.post('/comment/getall' , (req , res) => {
  var categoryid = req.body.categoryid;
  var rand = req.body.rand;
  userService.getAllComment(categoryid, rand).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})

router.post('/comment/add', (req, res, next) => {
  let commentText = req.body.commentText;
  let category_name = req.body.category_name;
  userService.addCommentList(commentText, category_name).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/comment/delete', (req, res, next) => {
  let id = req.body.id;
  userService.deleteCommentList(id).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})

// 获取评论任务列表
router.post('/commenttask/getall', (req, res, next) => {
  userService.getAllCommentTask().then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/commenttask/add', (req, res, next) => {
  var data = req.body.data;
  var vid = req.body.vid;
  var vname = req.body.vname;
  userService.addCommentTask(data, vid, vname)
})
router.post('/vuser/getall', (req, res, next) => {
  var count = req.body.count
  userService.getAllVuser(count).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/vuser/deleteall', (req, res, next) => {
  userService.deleteVuser().then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
router.post('/vuser/add', (req, res, next) => {
  var uid = req.body.uid;
  var img = req.body.img;
  userService.addVuser(uid,img).then(result => {
    res.json({
      status: status.SUCCESS,
      list: result
    });
  }).catch(err => {
    res.json({
      status: status.ERROR
    })
  })
})
//从旧版运营后台迁移用户
router.post('/transfer', (req, res, next) => {
  //只有admin用户有该操作权限
  if (req.session.userId != 1) {
    res.json({
      status: status.FORBIDDEN
    });
    return;
  }
  var remoteUsers = [];
  userService.copyUserAndUserRole().then(() => {
    userService.getPhpUserList().then((result) => {
      remoteUsers = result;
      inserUsers();
      res.json({
        status: status.SUCCESS
      })
    });
  }).catch((err) => {
    console.log(err);
    res.json({
      status: status.ERROR,
      err: err
    });
  });

  function inserUsers() {
    remoteUsers.map((item) => {
      userService.addUser(item.username, item.nickname, '96e79218965eb72c92a549dd5a330112', null, item.id);
    });
  }
});

module.exports = router;