var router = require('express').Router();
var axios = require('axios');
var { javaHost, newjavaHost, exposureHost, pythonHost } = require('../modjs/util/config');
//post转发
router.post('/java/*', (req, res, next) => {
    let _javaHost = javaHost
    var javaPath = req.url.slice(5);
    let isnew = false
    if (javaPath.indexOf("/new") > -1) {
        isnew = true;
        javaPath = javaPath.slice(4);
        _javaHost = newjavaHost
    }
    axios.post(_javaHost + javaPath, req.body).then((result) => {
        if (result.data && result.data.status == 0 && isnew) {
            result.data.status = 1
        }
        res.json(result.data);
    }).catch((err) => {
        res.json(err.response.data);
    });
});
//get转发
router.get('/java/*', (req, res, next) => {
    let _javaHost = javaHost
    var javaPath = req.url.slice(5);
    let isnew = false
    if (javaPath.indexOf("/new") > -1) {
        isnew = true;
        javaPath = javaPath.slice(4);
        _javaHost = newjavaHost
    }
    axios.get(_javaHost + javaPath).then((result) => {
        if (result.data && result.data.status == 0 && isnew) {
            result.data.status = 1
        }
        res.json(result.data);
    }).catch((err) => {
        res.json(err.response.data);
    });
});
//post转发
router.post('/python/*', (req, res, next) => {
    var pythonePath = req.url;
    var method = req.method;
    axios.post(pythonHost + pythonePath, req.body).then((result) => {
        res.json(result.data);
    }).catch((err) => {
        res.json(err.response.data);
    });
});
//get转发
router.get('/python/*', (req, res, next) => {
    var pythonePath = req.url;
    var method = req.method;
    axios.get(pythonHost + pythonePath).then((result) => {
        res.json(result.data);
    }).catch((err) => {
        res.json(err.response.data);
    });
});
module.exports = router;