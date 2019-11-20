var http = require('http');

module.exports = {
    getSeqid(prefix = "") {
        var a = new Date()
            .getTime()
            .toString()
            .substr(-11);
        var b = ~~(Math.random() * 100);
        b = b < 10 ? b + 10 + "" : b + "";
        return prefix + a + b;
    }
}