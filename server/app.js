var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var workRouter = require('./routes/work');
var statisticsRouter = require('./routes/statistics');
var activityRouter = require('./routes/activity');
var goodsRouter = require('./routes/goods');
var userService = require('./modjs/service/user_srv.js');
// var schedule = require('node-schedule');

var status = require('./modjs/const/status.js');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: 'cid',
    secret: 'operate',
    cookie: {
        maxAge: 60 * 60 * 1000,
        secure: false
    },
    rolling: true,
    resave: true,
    saveUninitialized: true
}));

//设置跨域投
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With,userId,token,Access-Control-Allow-Headers,x-xsrf-token");
    res.header("Access-Control-Allow-Credentials", "true");
    //未登录
    if (!req.session.userName && req.path.indexOf('/user/login') == -1 && req.method.toLowerCase() != 'options') {
        res.json({
            status: status.SESSION_INVALID,
            msg: '请先登录'
        });
        return;
    }
    next();
});

if (process.env.NODE_ENV === 'production') {
    app.use('/api/', indexRouter);
    app.use('/api/user', usersRouter);
    app.use('/api/work', workRouter);
    app.use('/api/statistics', statisticsRouter);
    app.use('/api/activity', activityRouter);
    app.use('/api/goods', goodsRouter);
} else {
    app.use('/', indexRouter);
    app.use('/user', usersRouter);
    app.use('/work', workRouter);
    app.use('/statistics', statisticsRouter);
    app.use('/activity', activityRouter);
    app.use('/goods', goodsRouter);
}
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
// 定时执行任务
setInterval(() => {
    userService.executeComment()
}, 1000 * 60 * 5)
// var rule = new schedule.RecurrenceRule();
// // 每十分钟执行一次 
// rule.minute =[1,11,21,31,41,51];
// schedule.scheduleJob(rule,()=>{
//     userService.executeComment()
// })
module.exports = app;