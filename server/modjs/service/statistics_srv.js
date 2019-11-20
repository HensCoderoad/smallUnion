var dao = require('../dao/statistics_dao.js');

module.exports = {
    getCrawlerList(startTime, endTime) {
        return dao.getCrawlerList(startTime, endTime);
    }
}