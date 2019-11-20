module.exports = {
    SUCCESS: 1, //成功
    ERROR: -1, //普通错误
    SESSION_INVALID: 1001, //session失效或未登录
    USER_EXISTS: 1002, //用户已经存在
    USER_NOT_EXISTS: 1003, //用户不存在
    PASSWORD_INVALID: 1004, //密码错误
    SERVER_ERROR: 500, //服务器错误
}